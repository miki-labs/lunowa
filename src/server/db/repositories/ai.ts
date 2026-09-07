import {and, asc, eq, inArray, sql} from 'drizzle-orm';

import {getDatabase} from '../index';
import {
  connectedAccounts,
  conversations,
  messageParticipants,
  messages,
  participantIdentities
} from '../schema/evidence';
import {user} from '../schema/auth';
import {aiInterpretationRuns} from '../schema/responsibility';
import {
  buildDraftContext,
  buildInterpretationContext,
  type AuthorizedAIMessage,
  type AuthorizedAISourceZone,
  type AuthorizedInterpretationContext,
  type AuthorizedReplyContext,
} from '../../ai/context';
import type {
  AIRunCapture,
  AIRunCaptureConfig,
  AIRunStatus,
  AIRunStore,
  AIContextSnapshotStore,
  CapturedDraftContext,
  CapturedInterpretationContext,
  DraftContextRequest,
  InterpretationContextRequest
} from '../../ai/runtime';
import {loadResponsibilityStatesInTransaction} from './responsibility';

type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

type SnapshotMessage = Omit<AuthorizedAIMessage, 'sourceZones'>;

/**
 * Application-owned deterministic zoning is deliberately injected at the
 * composition boundary. The database stores message text, not trusted source
 * spans; interpretation therefore fails closed when no zoning authority is
 * configured instead of treating a whole body as current authored text.
 */
export type TrustedAISourceZoneResolver = (input: {
  userId: string;
  connectedAccountId: string;
  conversationId: string;
  messages: readonly SnapshotMessage[];
}) => ReadonlyMap<string, readonly AuthorizedAISourceZone[]> | Promise<ReadonlyMap<string, readonly AuthorizedAISourceZone[]>>;

/**
 * Durable AI-run substrate adapter. It stores IDs, configuration, revision,
 * lane, and a bounded manifest only; email bodies and raw model payloads do
 * not enter this repository method.
 */
export class AIInterpretationRunRepository implements AIRunStore, AIContextSnapshotStore {
  public constructor(
    private readonly db: Database = getDatabase(),
    private readonly trustedSourceZoneResolver?: TrustedAISourceZoneResolver
  ) {}

  private async captureInTransaction(tx: Transaction, input: AIRunCapture): Promise<{id: string}> {
    const [row] = await tx.insert(aiInterpretationRuns).values({
      userId: input.userId,
      conversationId: input.conversationId,
      messageId: input.sourceMessageId ?? input.messageIds[0] ?? null,
      schemaVersion: input.schemaVersion,
      modelConfigVersion: input.modelConfigVersion,
      providerModelIdentifier: input.providerModelIdentifier,
      basisEvidenceRevision: input.basisEvidenceRevision,
      status: 'CAPTURED',
      contextManifest: input.contextManifest,
      createdAt: new Date()
    }).returning({id: aiInterpretationRuns.id});
    if (!row) throw new Error('AI interpretation run was not captured');
    return row;
  }

  public async capture(input: AIRunCapture): Promise<{id: string}> {
    return this.db.transaction((tx) => this.captureInTransaction(tx, input));
  }

  public async mark(input: {id: string; userId: string; status: AIRunStatus}): Promise<void> {
    await this.db.update(aiInterpretationRuns).set({status: input.status}).where(and(
      eq(aiInterpretationRuns.id, input.id),
      eq(aiInterpretationRuns.userId, input.userId)
    ));
  }

  private async beginSnapshot<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      // All evidence reads and the run insert use one repeatable snapshot.
      // The transaction ends before the runtime invokes the remote model.
      await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`);
      return work(tx);
    });
  }

  private async readScope(tx: Transaction, input: {
    userId: string;
    connectedAccountId: string;
    conversationId: string;
    messageIds: readonly string[];
  }): Promise<{
    account: {id: string; provider: string; emailAddress: string};
    owner: {id: string; email: string};
    conversation: {id: string; semanticEvidenceRevision: number};
    messageRows: Array<typeof messages.$inferSelect>;
    participantRows: Array<{messageId: string; role: string; participantId: string; email: string; displayName: string | null}>;
  }> {
    const [accountRow] = await tx.select({
      id: connectedAccounts.id,
      provider: connectedAccounts.provider,
      emailAddress: connectedAccounts.emailAddress,
      ownerId: user.id,
      ownerEmail: user.email
    }).from(connectedAccounts).innerJoin(user, eq(user.id, connectedAccounts.userId)).where(and(
      eq(connectedAccounts.id, input.connectedAccountId),
      eq(connectedAccounts.userId, input.userId)
    )).limit(1);
    if (!accountRow) throw new Error('AI context account is not owned by the current user');

    const [conversation] = await tx.select({
      id: conversations.id,
      semanticEvidenceRevision: conversations.semanticEvidenceRevision
    }).from(conversations).where(and(
      eq(conversations.id, input.conversationId),
      eq(conversations.userId, input.userId),
      eq(conversations.connectedAccountId, input.connectedAccountId)
    )).limit(1);
    if (!conversation) throw new Error('AI context conversation is not owned by the current account');

    if (input.messageIds.length === 0 || input.messageIds.length > 24 || new Set(input.messageIds).size !== input.messageIds.length) throw new Error('AI context message scope is invalid');
    const messageFilters = [
      eq(messages.userId, input.userId),
      eq(messages.connectedAccountId, input.connectedAccountId),
      eq(messages.conversationId, input.conversationId),
      inArray(messages.id, [...input.messageIds])
    ];
    const messageRows = await tx.select().from(messages).where(and(...messageFilters)).orderBy(asc(messages.occurredAt), asc(messages.id)).limit(input.messageIds.length);
    if (messageRows.length !== input.messageIds.length) throw new Error('AI context message is not authorized');

    const messageIds = messageRows.map((message) => message.id);
    const participantRows = await tx.select({
      messageId: messageParticipants.messageId,
      role: messageParticipants.role,
      participantId: participantIdentities.id,
      email: participantIdentities.canonicalEmail,
      displayName: participantIdentities.displayName
    }).from(messageParticipants).innerJoin(participantIdentities, and(
      eq(participantIdentities.id, messageParticipants.participantId),
      eq(participantIdentities.userId, input.userId)
    )).where(and(
      eq(messageParticipants.userId, input.userId),
      eq(messageParticipants.connectedAccountId, input.connectedAccountId),
      inArray(messageParticipants.messageId, messageIds)
    )).orderBy(asc(messageParticipants.id));
    const senderIds = [...new Set(messageRows.map((message) => message.senderParticipantId).filter((value): value is string => Boolean(value)))];
    if (senderIds.length > 0) {
      const senderRows = await tx.select({
        email: participantIdentities.canonicalEmail,
        displayName: participantIdentities.displayName,
        participantId: participantIdentities.id
      }).from(participantIdentities).where(and(
        eq(participantIdentities.userId, input.userId),
        inArray(participantIdentities.id, senderIds)
      ));
      const sendersById = new Map(senderRows.map((row) => [row.participantId, row]));
      for (const message of messageRows) {
        if (!message.senderParticipantId) continue;
        const sender = sendersById.get(message.senderParticipantId);
        if (sender) participantRows.push({messageId: message.id, role: 'SENDER', participantId: sender.participantId, email: sender.email, displayName: sender.displayName});
      }
    }

    return {
      account: {id: accountRow.id, provider: accountRow.provider, emailAddress: accountRow.emailAddress},
      owner: {id: accountRow.ownerId, email: accountRow.ownerEmail},
      conversation,
      messageRows,
      participantRows
    };
  }

  private toMessages(scope: Awaited<ReturnType<AIInterpretationRunRepository['readScope']>>): {
    messages: SnapshotMessage[];
    participantIdentities: Array<{id: string; email: string; displayName?: string}>;
  } {
    const participantsByMessage = new Map<string, Array<{role: string; participantId: string; email: string; displayName: string | null}>>();
    for (const participant of scope.participantRows) {
      const list = participantsByMessage.get(participant.messageId) ?? [];
      list.push(participant);
      participantsByMessage.set(participant.messageId, list);
    }
    const participantIds = new Set<string>();
    const result = scope.messageRows.map((row) => {
      const sender = scope.participantRows.find((participant) => participant.messageId === row.id && participant.role === 'SENDER');
      if (!sender || !row.textBody?.trim()) throw new Error('AI interpretation requires an authorized sender and text body');
      participantIds.add(sender.participantId);
      const related = participantsByMessage.get(row.id) ?? [];
      const recipients = related.filter((participant) => participant.role === 'TO').map((participant) => {
        participantIds.add(participant.participantId);
        return {participantId: participant.participantId, email: participant.email, displayName: participant.displayName ?? undefined};
      });
      const cc = related.filter((participant) => participant.role === 'CC').map((participant) => {
        participantIds.add(participant.participantId);
        return {participantId: participant.participantId, email: participant.email, displayName: participant.displayName ?? undefined};
      });
      if (recipients.length === 0) throw new Error('AI interpretation requires authorized recipients');
      return {
        id: row.id,
        direction: row.direction as 'INBOUND' | 'OUTBOUND',
        sender: {participantId: sender.participantId, email: sender.email, displayName: sender.displayName ?? undefined},
        recipients,
        cc,
        subject: row.subject,
        body: row.textBody,
        sentAt: row.occurredAt.toISOString()
      } satisfies SnapshotMessage;
    });
    const identityRows = new Map(scope.participantRows.map((participant) => [participant.participantId, participant]));
    return {
      messages: result,
      participantIdentities: [...participantIds].map((id) => {
        const participant = identityRows.get(id);
        if (!participant) throw new Error('AI interpretation participant identity is not authorized');
        return {id, email: participant.email, displayName: participant.displayName ?? undefined};
      })
    };
  }

  public async captureInterpretation(input: InterpretationContextRequest, config: AIRunCaptureConfig): Promise<CapturedInterpretationContext> {
    if (
      !Array.isArray(input.messageIds) ||
      input.messageIds.length < 1 ||
      input.messageIds.length > 24 ||
      new Set(input.messageIds).size !== input.messageIds.length ||
      input.messageIds.some((messageId) => typeof messageId !== 'string' || !messageId.trim()) ||
      !input.messageIds.includes(input.focalMessageId)
    ) throw new Error('AI interpretation requires a unique message scope containing the focal message');
    return this.beginSnapshot(async (tx) => {
      if (!this.trustedSourceZoneResolver) throw new Error('AI interpretation requires an application-owned trusted source zoning boundary');
      const scope = await this.readScope(tx, input);
      const normalized = this.toMessages(scope);
      if (!normalized.messages.some((message) => message.id === input.focalMessageId)) throw new Error('AI focal message is outside the authorized snapshot');
      const sourceZones = await this.trustedSourceZoneResolver({
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        conversationId: input.conversationId,
        messages: normalized.messages
      });
      const messagesWithZones = normalized.messages.map((message) => ({...message, sourceZones: [...(sourceZones.get(message.id) ?? [])]}));
      const existingResponsibilities = await loadResponsibilityStatesInTransaction(tx, {
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        conversationId: input.conversationId
      });
      const context: AuthorizedInterpretationContext = {
        user: {id: scope.owner.id, email: scope.owner.email, locale: input.locale, timezone: input.timezone},
        connectedAccount: scope.account,
        conversationId: scope.conversation.id,
        sourceEventKey: input.sourceEventKey,
        evidenceRevision: scope.conversation.semanticEvidenceRevision,
        focalMessageId: input.focalMessageId,
        messages: messagesWithZones,
        participantIdentities: normalized.participantIdentities,
        existingResponsibilities
      };
      const built = buildInterpretationContext(context);
      const run = await this.captureInTransaction(tx, {
        lane: 'interpretation',
        schemaVersion: built.manifest.schemaVersion,
        userId: context.user.id,
        connectedAccountId: context.connectedAccount.id,
        conversationId: context.conversationId,
        messageIds: built.manifest.messageIds,
        sourceMessageId: context.focalMessageId,
        basisEvidenceRevision: built.manifest.basisEvidenceRevision,
        modelConfigVersion: config.modelConfigVersion,
        providerModelIdentifier: config.model,
        contextManifest: {...built.manifest, dataControlMode: config.dataControlMode, storageRequest: 'store:false', snapshotConsistency: 'REPEATABLE_READ'}
      });
      return {context, built, runId: run.id, existingResponsibilities};
    });
  }

  public async captureDraft(input: DraftContextRequest, config: AIRunCaptureConfig): Promise<CapturedDraftContext> {
    return this.beginSnapshot(async (tx) => {
      const scope = await this.readScope(tx, {...input, messageIds: [input.messageId]});
      const normalized = this.toMessages(scope);
      const message = normalized.messages[0];
      if (!message) throw new Error('AI draft message is not authorized');
      const context: AuthorizedReplyContext = {
        user: {id: scope.owner.id, email: scope.owner.email, locale: input.locale, timezone: input.timezone},
        connectedAccount: scope.account,
        conversationId: scope.conversation.id,
        evidenceRevision: scope.conversation.semanticEvidenceRevision,
        message,
        replyMode: input.replyMode,
        trustedRecipientLabels: input.trustedRecipientLabels
      };
      const built = buildDraftContext(context);
      const run = await this.captureInTransaction(tx, {
        lane: 'draft',
        schemaVersion: built.manifest.schemaVersion,
        userId: context.user.id,
        connectedAccountId: context.connectedAccount.id,
        conversationId: context.conversationId,
        messageIds: built.manifest.messageIds,
        sourceMessageId: message.id,
        basisEvidenceRevision: built.manifest.basisEvidenceRevision,
        modelConfigVersion: config.modelConfigVersion,
        providerModelIdentifier: config.model,
        contextManifest: {...built.manifest, dataControlMode: config.dataControlMode, storageRequest: 'store:false', snapshotConsistency: 'REPEATABLE_READ'}
      });
      return {context, built, runId: run.id};
    });
  }
}
