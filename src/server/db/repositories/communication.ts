import {and, asc, desc, eq, gte, inArray, sql} from 'drizzle-orm';

import {getDatabase} from '../index';
import {connectedAccounts, conversations, messageParticipants, messages, participantIdentities} from '../schema/evidence';
import {drafts, sendOperations} from '../schema/communication';
import {responsibilities} from '../schema/responsibility';
import {buildReplyRecipients, normalizeDraftBody, type ReplyMode, type ReplyParticipant} from '../../communication/reply';
import type {ReplyContextReadModel as SharedReplyContextReadModel} from '@/lib/communication-types';

type Database = ReturnType<typeof getDatabase>;
type StoredParticipant = {email: string; displayName: string | null};
const ACTIVE_SEND_STATUSES = ['PENDING', 'DISPATCHING', 'AMBIGUOUS', 'PROVIDER_ACCEPTED'] as const;
const NON_RETRYABLE_SNAPSHOT_STATUSES = [...ACTIVE_SEND_STATUSES, 'RECONCILED'] as const;
export const SEND_RECONCILIATION_STATUSES = ['DISPATCHING', 'AMBIGUOUS', 'PROVIDER_ACCEPTED'] as const;
export const SEND_OPERATION_STATUSES = ['PENDING', 'DISPATCHING', 'AMBIGUOUS', 'PROVIDER_ACCEPTED', 'RECONCILED', 'FAILED'] as const;
export const SEND_ADMISSION_BURST_WINDOW_MS = 10 * 60 * 1000;
export const SEND_ADMISSION_BURST_LIMIT = 20;
export const SEND_ADMISSION_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SEND_ADMISSION_DAILY_LIMIT = 100;
export type SendOperationStatus = (typeof SEND_OPERATION_STATUSES)[number];

export class DraftConflictError extends Error {
  public constructor(public readonly currentVersion: number) {
    super('DRAFT_VERSION_CONFLICT');
  }
}

export class CommunicationInputError extends Error {
  public constructor(public readonly code: string) {
    super(code);
  }
}

export type DraftReadModel = {
  id: string;
  userId: string;
  connectedAccountId: string;
  conversationId: string;
  inReplyToMessageId: string;
  mode: ReplyMode;
  sender: StoredParticipant;
  recipients: StoredParticipant[];
  cc: StoredParticipant[];
  bcc: StoredParticipant[];
  subject: string;
  bodyFormat: 'TEXT';
  body: string;
  replyContext: Record<string, unknown>;
  status: 'ACTIVE' | 'DISCARDED';
  version: number;
  updatedAt: string;
};

export type SendOperationReadModel = {
  id: string;
  userId: string;
  draftId: string;
  connectedAccountId: string;
  idempotencyKey: string;
  kind: 'IMMEDIATE';
  status: SendOperationStatus;
  draftSnapshot: Record<string, unknown>;
  attemptCount: number;
  providerResultId: string | null;
  providerMessageId: string | null;
  lastErrorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReplyContextReadModel = SharedReplyContextReadModel;

function participant(row: {email: string; displayName?: string | null}): StoredParticipant {
  return {email: row.email, displayName: row.displayName ?? null};
}

function mode(value: string): ReplyMode {
  if (value === 'REPLY' || value === 'REPLY_ALL') return value;
  throw new CommunicationInputError('UNSUPPORTED_REPLY_MODE');
}

function iso(value: Date): string {
  return value.toISOString();
}

export class CommunicationRepository {
  public constructor(private readonly db: Database = getDatabase()) {}

  private async participantFor(userId: string, participantId: string | null): Promise<ReplyParticipant | null> {
    if (!participantId) return null;
    const [row] = await this.db
      .select({email: participantIdentities.canonicalEmail, displayName: participantIdentities.displayName})
      .from(participantIdentities)
      .where(and(eq(participantIdentities.id, participantId), eq(participantIdentities.userId, userId)))
      .limit(1);
    return row ? participant(row) : null;
  }

  private async participantsFor(userId: string, connectedAccountId: string, messageId: string, role?: 'TO' | 'CC' | 'BCC'): Promise<ReplyParticipant[]> {
    const filters = [
      eq(messageParticipants.userId, userId),
      eq(messageParticipants.connectedAccountId, connectedAccountId),
      eq(messageParticipants.messageId, messageId)
    ];
    if (role) filters.push(eq(messageParticipants.role, role));
    const rows = await this.db
      .select({email: participantIdentities.canonicalEmail, displayName: participantIdentities.displayName})
      .from(messageParticipants)
      .innerJoin(participantIdentities, and(
        eq(participantIdentities.id, messageParticipants.participantId),
        eq(participantIdentities.userId, userId)
      ))
      .where(and(...filters))
      .orderBy(asc(messageParticipants.id));
    return rows.map(participant);
  }

  private async contextFor(input: {
    userId: string;
    connectedAccountId: string;
    conversationId: string;
    inReplyToMessageId?: string;
    mode: ReplyMode;
  }) {
    const [account] = await this.db
      .select({id: connectedAccounts.id, emailAddress: connectedAccounts.emailAddress, displayName: connectedAccounts.displayName, connectionState: connectedAccounts.connectionState, grantedCapabilities: connectedAccounts.grantedCapabilities})
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.id, input.connectedAccountId), eq(connectedAccounts.userId, input.userId)))
      .limit(1);
    if (!account) throw new CommunicationInputError('ACCOUNT_NOT_OWNED');
    if (account.connectionState !== 'CONNECTED') throw new CommunicationInputError('ACCOUNT_NOT_CONNECTED');

    const [conversation] = await this.db
      .select({id: conversations.id, providerThreadId: conversations.providerThreadId, subject: conversations.normalizedSubject, evidenceRevision: conversations.semanticEvidenceRevision})
      .from(conversations)
      .where(and(
        eq(conversations.id, input.conversationId),
        eq(conversations.connectedAccountId, input.connectedAccountId),
        eq(conversations.userId, input.userId)
      ))
      .limit(1);
    if (!conversation) throw new CommunicationInputError('CONVERSATION_NOT_FOUND');

    const messageFilters = [
      eq(messages.userId, input.userId),
      eq(messages.connectedAccountId, input.connectedAccountId),
      eq(messages.conversationId, input.conversationId)
    ];
    if (input.inReplyToMessageId) messageFilters.push(eq(messages.id, input.inReplyToMessageId));
    const [message] = await this.db
      .select({id: messages.id, providerMessageId: messages.providerMessageId, providerThreadId: messages.providerThreadId, subject: messages.subject, senderParticipantId: messages.senderParticipantId})
      .from(messages)
      .where(and(...messageFilters))
      .orderBy(desc(messages.occurredAt), desc(messages.id))
      .limit(1);
    if (!message) throw new CommunicationInputError('REPLY_MESSAGE_NOT_FOUND');
    const originalSender = await this.participantFor(input.userId, message.senderParticipantId);
    if (!originalSender) throw new CommunicationInputError('REPLY_SENDER_UNAVAILABLE');

    const sender = {email: account.emailAddress, displayName: account.displayName};
    const originalRecipients = await this.participantsFor(input.userId, input.connectedAccountId, message.id, 'TO');
    const originalCc = await this.participantsFor(input.userId, input.connectedAccountId, message.id, 'CC');
    const builtRecipients = buildReplyRecipients(input.mode, {
      sender,
      originalSender,
      originalRecipients,
      originalCc,
      originalBcc: await this.participantsFor(input.userId, input.connectedAccountId, message.id, 'BCC')
    });
    const recipients = {
      to: builtRecipients.to.map(participant),
      cc: builtRecipients.cc.map(participant),
      bcc: builtRecipients.bcc.map(participant)
    };
    if (recipients.to.length === 0) throw new CommunicationInputError('NO_REPLY_RECIPIENT');
    const subject = /^re:/i.test(message.subject) ? message.subject : `Re: ${message.subject}`;
    const replyContext = {
      conversationId: conversation.id,
      providerThreadId: conversation.providerThreadId ?? message.providerThreadId ?? null,
      inReplyToMessageId: message.id,
      inReplyToProviderMessageId: message.providerMessageId,
      evidenceRevision: conversation.evidenceRevision,
      mode: input.mode,
      sender,
      originalSender,
      originalRecipients,
      originalCc
    } satisfies Record<string, unknown>;
    return {
      account,
      conversation,
      message,
      sender,
      recipients,
      subject,
      replyContext
    };
  }

  public async getReplyContext(input: {
    userId: string;
    connectedAccountId: string;
    conversationId: string;
    inReplyToMessageId?: string;
    mode: ReplyMode;
  }): Promise<ReplyContextReadModel> {
    const context = await this.contextFor(input);
    const [draft] = await this.db.select({id: drafts.id, version: drafts.version, body: drafts.body, recipients: drafts.recipients, cc: drafts.cc})
      .from(drafts)
      .where(and(
        eq(drafts.userId, input.userId),
        eq(drafts.connectedAccountId, input.connectedAccountId),
        eq(drafts.conversationId, context.conversation.id),
        eq(drafts.mode, input.mode),
        eq(drafts.status, 'ACTIVE')
      ))
      .orderBy(desc(drafts.updatedAt), desc(drafts.id))
      .limit(1);
    return {
      connectedAccount: {
        id: context.account.id,
        emailAddress: context.account.emailAddress,
        displayName: context.account.displayName,
        connectionState: context.account.connectionState,
        sendAuthorized: context.account.grantedCapabilities.includes('mail_send')
      },
      conversationId: context.conversation.id,
      providerThreadId: context.replyContext.providerThreadId as string | null,
      inReplyToMessageId: context.message.id,
      inReplyToProviderMessageId: context.message.providerMessageId,
      evidenceRevision: context.replyContext.evidenceRevision as number,
      mode: input.mode,
      sender: context.sender,
      recipients: context.recipients.to,
      cc: context.recipients.cc,
      bcc: context.recipients.bcc,
      subject: context.subject,
      ...(draft ? {draft: {id: draft.id, version: draft.version, body: draft.body, recipients: [...draft.recipients], cc: [...draft.cc]}} : {})
    };
  }

  private readDraft(row: typeof drafts.$inferSelect, sender: StoredParticipant): DraftReadModel {
    if (!row.conversationId || !row.inReplyToMessageId) throw new Error('G50 draft is missing trusted reply identity');
    return {
      id: row.id,
      userId: row.userId,
      connectedAccountId: row.connectedAccountId,
      conversationId: row.conversationId,
      inReplyToMessageId: row.inReplyToMessageId,
      mode: mode(row.mode),
      sender,
      recipients: [...row.recipients],
      cc: [...row.cc],
      bcc: [...row.bcc],
      subject: row.subject,
      bodyFormat: 'TEXT',
      body: row.body,
      replyContext: {...row.replyContext},
      status: row.status as DraftReadModel['status'],
      version: row.version,
      updatedAt: iso(row.updatedAt)
    };
  }

  public async getDraft(userId: string, draftId: string): Promise<DraftReadModel | null> {
    const [row] = await this.db.select().from(drafts).where(and(eq(drafts.id, draftId), eq(drafts.userId, userId))).limit(1);
    if (!row) return null;
    const [account] = await this.db.select({email: connectedAccounts.emailAddress, displayName: connectedAccounts.displayName})
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.id, row.connectedAccountId), eq(connectedAccounts.userId, userId))).limit(1);
    if (!account) throw new CommunicationInputError('ACCOUNT_NOT_OWNED');
    return this.readDraft(row, participant(account));
  }

  public async saveDraft(input: {
    userId: string;
    draftId?: string;
    expectedVersion?: number;
    connectedAccountId: string;
    conversationId: string;
    inReplyToMessageId?: string;
    mode: ReplyMode;
    body: string;
    recipients?: readonly {email: string}[];
    cc?: readonly {email: string}[];
  }): Promise<DraftReadModel> {
    let body: string;
    try {
      body = normalizeDraftBody(input.body);
    } catch (error) {
      throw new CommunicationInputError(error instanceof Error ? error.message : 'DRAFT_BODY_INVALID');
    }
    const context = await this.contextFor({...input, mode: input.mode});
    const allowedTo = new Map(context.recipients.to.map((value) => [value.email.toLowerCase(), value]));
    const allowedCc = new Map(context.recipients.cc.map((value) => [value.email.toLowerCase(), value]));
    const selectedTo = input.recipients === undefined ? context.recipients.to : input.recipients.map(({email}) => {
      const trusted = allowedTo.get(email.trim().toLowerCase());
      if (!trusted) throw new CommunicationInputError('RECIPIENT_NOT_AUTHORIZED');
      return participant(trusted);
    });
    const selectedCc = input.cc === undefined ? context.recipients.cc : input.cc.map(({email}) => {
      const trusted = allowedCc.get(email.trim().toLowerCase());
      if (!trusted) throw new CommunicationInputError('RECIPIENT_NOT_AUTHORIZED');
      return participant(trusted);
    });
    if (selectedTo.length === 0) throw new CommunicationInputError('NO_REPLY_RECIPIENT');
    if (new Set([...selectedTo, ...selectedCc].map(({email}) => email)).size !== selectedTo.length + selectedCc.length) throw new CommunicationInputError('DUPLICATE_RECIPIENT');
    const now = new Date();
    if (!input.draftId) {
      const [row] = await this.db.insert(drafts).values({
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        conversationId: context.conversation.id,
        inReplyToMessageId: context.message.id,
        mode: input.mode,
        recipients: selectedTo,
        cc: selectedCc,
        bcc: context.recipients.bcc,
        subject: context.subject,
        bodyFormat: 'TEXT',
        body,
        replyContext: context.replyContext,
        status: 'ACTIVE',
        version: 1,
        createdAt: now,
        updatedAt: now
      }).returning();
      if (!row) throw new Error('DRAFT_CREATE_FAILED');
      return this.readDraft(row, context.sender);
    }

    const expectedVersion = input.expectedVersion;
    if (expectedVersion === undefined || !Number.isInteger(expectedVersion) || expectedVersion < 1) throw new CommunicationInputError('EXPECTED_VERSION_REQUIRED');
    return this.db.transaction(async (tx) => {
      const [current] = await tx.select().from(drafts).where(and(eq(drafts.id, input.draftId!), eq(drafts.userId, input.userId))).for('update');
      if (!current) throw new CommunicationInputError('DRAFT_NOT_FOUND');
      if (current.connectedAccountId !== context.account.id || current.conversationId !== context.conversation.id || current.inReplyToMessageId !== context.message.id || current.mode !== input.mode) {
        throw new CommunicationInputError('DRAFT_CONTEXT_MISMATCH');
      }
      const [activeSend] = await tx.select({id: sendOperations.id}).from(sendOperations).where(and(
        eq(sendOperations.userId, input.userId),
        eq(sendOperations.draftId, current.id),
        inArray(sendOperations.status, [...ACTIVE_SEND_STATUSES])
      )).limit(1);
      if (activeSend) throw new CommunicationInputError('DRAFT_SEND_IN_PROGRESS');
      if (current.version !== expectedVersion) throw new DraftConflictError(current.version);
      const [row] = await tx.update(drafts).set({
        connectedAccountId: context.account.id,
        conversationId: context.conversation.id,
        inReplyToMessageId: context.message.id,
        mode: input.mode,
        recipients: selectedTo,
        cc: selectedCc,
        bcc: context.recipients.bcc,
        subject: context.subject,
        body,
        replyContext: context.replyContext,
        version: current.version + 1,
        updatedAt: now
      }).where(and(eq(drafts.id, current.id), eq(drafts.userId, input.userId), eq(drafts.version, expectedVersion))).returning();
      if (!row) throw new DraftConflictError(current.version);
      return this.readDraft(row, context.sender);
    });
  }

  private readSendOperation(row: typeof sendOperations.$inferSelect): SendOperationReadModel {
    return {
      id: row.id,
      userId: row.userId,
      draftId: row.draftId,
      connectedAccountId: row.connectedAccountId,
      idempotencyKey: row.idempotencyKey,
      kind: 'IMMEDIATE',
      status: row.status as SendOperationReadModel['status'],
      draftSnapshot: {...row.draftSnapshot},
      attemptCount: row.attemptCount,
      providerResultId: row.providerResultId,
      providerMessageId: row.providerMessageId,
      lastErrorCode: row.lastErrorCode,
      createdAt: iso(row.createdAt),
      updatedAt: iso(row.updatedAt)
    };
  }

  public async getSendOperation(input: {userId: string; sendOperationId: string}): Promise<SendOperationReadModel | null> {
    const [row] = await this.db.select().from(sendOperations).where(and(
      eq(sendOperations.id, input.sendOperationId),
      eq(sendOperations.userId, input.userId)
    )).limit(1);
    return row ? this.readSendOperation(row) : null;
  }

  public async getSendOperationByProviderMessageId(input: {userId: string; connectedAccountId: string; providerMessageId: string}): Promise<SendOperationReadModel | null> {
    const rows = await this.db.select().from(sendOperations).where(and(
      eq(sendOperations.userId, input.userId),
      eq(sendOperations.connectedAccountId, input.connectedAccountId),
      eq(sendOperations.providerMessageId, input.providerMessageId),
      inArray(sendOperations.status, ['PROVIDER_ACCEPTED', 'RECONCILED'])
    )).orderBy(desc(sendOperations.createdAt), desc(sendOperations.id)).limit(2);
    return rows.length === 1 ? this.readSendOperation(rows[0]!) : null;
  }

  public async listReconcilableSendOperations(limit = 20): Promise<SendOperationReadModel[]> {
    const boundedLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20;
    const rows = await this.db.select().from(sendOperations).where(
      inArray(sendOperations.status, [...SEND_RECONCILIATION_STATUSES])
    ).orderBy(asc(sendOperations.updatedAt), asc(sendOperations.id)).limit(boundedLimit);
    return rows.map((row) => this.readSendOperation(row));
  }

  /** Claim is the only path that can authorize a provider effect. */
  public async claimSendOperation(input: {userId: string; sendOperationId: string}): Promise<SendOperationReadModel & {claimed: boolean}> {
    return this.db.transaction(async (tx) => {
      const [current] = await tx.select().from(sendOperations).where(and(
        eq(sendOperations.id, input.sendOperationId),
        eq(sendOperations.userId, input.userId)
      )).for('update');
      if (!current) throw new CommunicationInputError('SEND_OPERATION_NOT_FOUND');
      if (current.status !== 'PENDING') return {...this.readSendOperation(current), claimed: false};
      const [claimed] = await tx.update(sendOperations).set({
        status: 'DISPATCHING',
        attemptCount: current.attemptCount + 1,
        updatedAt: new Date()
      }).where(and(
        eq(sendOperations.id, current.id),
        eq(sendOperations.userId, input.userId),
        eq(sendOperations.status, 'PENDING')
      )).returning();
      if (!claimed) throw new Error('SEND_OPERATION_CLAIM_FAILED');
      return {...this.readSendOperation(claimed), claimed: true};
    });
  }

  public async transitionSendOperation(input: {
    userId: string;
    sendOperationId: string;
    expectedStatuses: readonly SendOperationStatus[];
    status: SendOperationStatus;
    providerResultId?: string | null;
    providerMessageId?: string | null;
    lastErrorCode?: string | null;
  }): Promise<SendOperationReadModel> {
    return this.db.transaction(async (tx) => {
      const [current] = await tx.select().from(sendOperations).where(and(
        eq(sendOperations.id, input.sendOperationId),
        eq(sendOperations.userId, input.userId)
      )).for('update');
      if (!current) throw new CommunicationInputError('SEND_OPERATION_NOT_FOUND');
      if (!input.expectedStatuses.includes(current.status as SendOperationStatus)) return this.readSendOperation(current);
      const values = {
        status: input.status,
        updatedAt: new Date(),
        ...(input.providerResultId !== undefined ? {providerResultId: input.providerResultId} : {}),
        ...(input.providerMessageId !== undefined ? {providerMessageId: input.providerMessageId} : {}),
        ...(input.lastErrorCode !== undefined ? {lastErrorCode: input.lastErrorCode} : {})
      };
      const [updated] = await tx.update(sendOperations).set(values).where(and(
        eq(sendOperations.id, current.id),
        eq(sendOperations.userId, input.userId),
        inArray(sendOperations.status, [...input.expectedStatuses])
      )).returning();
      return this.readSendOperation(updated ?? current);
    });
  }

  public async requestImmediateSend(input: {
    userId: string;
    draftId: string;
    responsibilityBinding?: {responsibilityId: string; aggregateVersion: number; evidenceRevision: number};
  }): Promise<SendOperationReadModel> {
    return this.db.transaction(async (tx) => {
      const [draft] = await tx.select().from(drafts).where(and(eq(drafts.id, input.draftId), eq(drafts.userId, input.userId))).for('update');
      if (!draft) throw new CommunicationInputError('DRAFT_NOT_FOUND');
      if (draft.status !== 'ACTIVE') throw new CommunicationInputError('DRAFT_NOT_ACTIVE');
      if (!draft.body.trim()) throw new CommunicationInputError('DRAFT_BODY_REQUIRED');
      if (!draft.conversationId || !draft.inReplyToMessageId) throw new CommunicationInputError('DRAFT_CONTEXT_REQUIRED');
      // A lost HTTP response or page reload must converge on the already-attempted
      // immutable draft snapshot. Only a definite provider failure permits a new
      // explicit attempt for the same draft version.
      const [sameSnapshot] = await tx.select().from(sendOperations).where(and(
        eq(sendOperations.userId, input.userId),
        eq(sendOperations.draftId, draft.id),
        inArray(sendOperations.status, [...NON_RETRYABLE_SNAPSHOT_STATUSES]),
        sql`${sendOperations.draftSnapshot}->>'draftVersion' = ${String(draft.version)}`
      )).orderBy(desc(sendOperations.createdAt), desc(sendOperations.id)).limit(1);
      if (sameSnapshot) return this.readSendOperation(sameSnapshot);
      const [activeSend] = await tx.select().from(sendOperations).where(and(
        eq(sendOperations.userId, input.userId),
        eq(sendOperations.draftId, draft.id),
        inArray(sendOperations.status, [...ACTIVE_SEND_STATUSES])
      )).orderBy(desc(sendOperations.createdAt), desc(sendOperations.id)).limit(1);
      if (activeSend) return this.readSendOperation(activeSend);
      // Serialize consequential Send admission per mailbox so concurrent requests
      // cannot race past the public-beta abuse bounds.
      const [account] = await tx.select({
        id: connectedAccounts.id,
        emailAddress: connectedAccounts.emailAddress,
        displayName: connectedAccounts.displayName,
        connectionState: connectedAccounts.connectionState,
        grantedCapabilities: connectedAccounts.grantedCapabilities
      })
        .from(connectedAccounts)
        .where(and(eq(connectedAccounts.id, draft.connectedAccountId), eq(connectedAccounts.userId, input.userId)))
        .for('update');
      if (!account) throw new CommunicationInputError('ACCOUNT_NOT_OWNED');
      if (account.connectionState !== 'CONNECTED') throw new CommunicationInputError('ACCOUNT_NOT_CONNECTED');
      if (!account.grantedCapabilities.includes('mail_send')) throw new CommunicationInputError('ACCOUNT_SEND_NOT_AUTHORIZED');

      const now = new Date();
      const usageCount = async (windowMs: number): Promise<number> => {
        const [usage] = await tx.select({count: sql<number>`count(*)::int`})
          .from(sendOperations)
          .where(and(
            eq(sendOperations.userId, input.userId),
            eq(sendOperations.connectedAccountId, draft.connectedAccountId),
            gte(sendOperations.createdAt, new Date(now.getTime() - windowMs))
          ));
        return Number(usage?.count ?? 0);
      };
      const burstCount = await usageCount(SEND_ADMISSION_BURST_WINDOW_MS);
      if (burstCount >= SEND_ADMISSION_BURST_LIMIT) throw new CommunicationInputError('SEND_RATE_LIMITED');
      const dailyCount = await usageCount(SEND_ADMISSION_DAILY_WINDOW_MS);
      if (dailyCount >= SEND_ADMISSION_DAILY_LIMIT) throw new CommunicationInputError('SEND_RATE_LIMITED');
      if (input.responsibilityBinding) {
        const [binding] = await tx.select({
          id: responsibilities.id,
          aggregateVersion: responsibilities.aggregateVersion,
          acceptedEvidenceRevision: responsibilities.acceptedEvidenceRevision
        }).from(responsibilities).where(and(
          eq(responsibilities.id, input.responsibilityBinding.responsibilityId),
          eq(responsibilities.userId, input.userId),
          eq(responsibilities.connectedAccountId, draft.connectedAccountId),
          eq(responsibilities.conversationId, draft.conversationId),
          eq(responsibilities.aggregateVersion, input.responsibilityBinding.aggregateVersion),
          eq(responsibilities.acceptedEvidenceRevision, input.responsibilityBinding.evidenceRevision)
        )).limit(1);
        if (!binding) throw new CommunicationInputError('RESPONSIBILITY_BINDING_STALE');
      }
      const idempotencyKey = crypto.randomUUID();
      const snapshot: Record<string, unknown> = {
        draftId: draft.id,
        draftVersion: draft.version,
        userId: draft.userId,
        connectedAccountId: draft.connectedAccountId,
        sender: {email: account.emailAddress, displayName: account.displayName},
        conversationId: draft.conversationId,
        inReplyToMessageId: draft.inReplyToMessageId,
        mode: draft.mode,
        recipients: draft.recipients,
        cc: draft.cc,
        bcc: draft.bcc,
        subject: draft.subject,
        bodyFormat: draft.bodyFormat,
        body: draft.body,
        replyContext: draft.replyContext
      } satisfies Record<string, unknown>;
      if (input.responsibilityBinding) {
        snapshot.responsibilityBinding = {...input.responsibilityBinding};
      }
      const [row] = await tx.insert(sendOperations).values({
        userId: input.userId,
        draftId: draft.id,
        connectedAccountId: draft.connectedAccountId,
        idempotencyKey,
        kind: 'IMMEDIATE',
        status: 'PENDING',
        draftSnapshot: snapshot,
        attemptCount: 0,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing({target: [sendOperations.userId, sendOperations.idempotencyKey]}).returning();
      if (row) return this.readSendOperation(row);
      const [raced] = await tx.select().from(sendOperations).where(and(eq(sendOperations.userId, input.userId), eq(sendOperations.idempotencyKey, idempotencyKey))).limit(1);
      if (!raced) throw new Error('SEND_OPERATION_IDEMPOTENCY_RACE');
      return this.readSendOperation(raced);
    });
  }
}

export {buildReplyRecipients};
