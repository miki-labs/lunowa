import {and, asc, count, desc, eq, gte, ilike, inArray, lt, or, sql} from 'drizzle-orm';

import type {
  SourceAccountReadModel,
  SourceAttachmentReadModel,
  SourceConversationReadModel,
  SourceConversationSummary,
  SourceMessageReadModel,
  SourcePageReadModel,
  SourceParticipantReadModel,
  SourceReadiness
} from '@/lib/source-types';

import {getDatabase} from '../index';
import {
  attachments,
  connectedAccounts,
  conversations,
  messageParticipants,
  messages,
  participantIdentities,
  providerSyncStates
} from '../schema';
import {sanitizeSourceHtml, sourcePreview} from '../../source/sanitize';

type Database = ReturnType<typeof getDatabase>;

export type SourceSearchRequest = {
  text?: string;
  query?: string;
  connectedAccountId?: string;
  accountId?: string;
  sender?: string;
  from?: Date;
  to?: Date;
  limit?: number;
};

export class SourceAccessError extends Error {
  constructor(public readonly code: 'ACCOUNT_NOT_FOUND' | 'CONVERSATION_NOT_FOUND') {
    super(code);
  }
}

type AccountRow = {
  id: string;
  provider: string;
  providerAccountId: string;
  emailAddress: string;
  displayName: string | null;
  connectionState: string;
  syncStatus: string | null;
  lastSuccessAt: Date | null;
  lastFullReconcileAt: Date | null;
  errorCode: string | null;
};

const MAX_PAGE_SIZE = 100;
const MAX_QUERY_LENGTH = 512;

function boundedLimit(limit: number | undefined): number {
  if (limit === undefined) return 50;
  if (!Number.isInteger(limit) || limit < 1) throw new Error('SOURCE_INVALID_LIMIT');
  return Math.min(limit, MAX_PAGE_SIZE);
}

function cleanQuery(value: string | undefined): string {
  const result = value?.normalize('NFC').trim() ?? '';
  if (result.length > MAX_QUERY_LENGTH) throw new Error('SOURCE_QUERY_TOO_LONG');
  return result;
}

function escapedLike(value: string): string {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}

function iso(value: Date | null | undefined): string | null {
  return value?.toISOString() ?? null;
}

function participant(email: string | null | undefined, displayName: string | null | undefined): SourceParticipantReadModel {
  return {email: email ?? 'unknown', displayName: displayName ?? null};
}

function accountModel(row: AccountRow): SourceAccountReadModel {
  return {
    id: row.id,
    provider: row.provider,
    providerAccountId: row.providerAccountId,
    emailAddress: row.emailAddress,
    displayName: row.displayName,
    connectionState: row.connectionState,
    sync: {
      status: row.syncStatus ?? 'UNKNOWN',
      lastSuccessAt: iso(row.lastSuccessAt),
      lastFullReconcileAt: iso(row.lastFullReconcileAt),
      dataThroughAt: iso(row.lastSuccessAt ?? row.lastFullReconcileAt),
      errorCode: row.errorCode
    }
  };
}

function readiness(accounts: readonly AccountRow[]): SourceReadiness {
  if (accounts.length === 0) return 'unavailable';
  if (accounts.some((account) =>
    account.connectionState === 'ERROR' ||
    account.connectionState === 'RECONNECT_REQUIRED' ||
    account.syncStatus === 'ERROR' ||
    account.syncStatus === 'RECONCILIATION_REQUIRED'
  )) return 'degraded';
  if (accounts.some((account) =>
    account.connectionState !== 'CONNECTED' ||
    !account.syncStatus ||
    account.syncStatus === 'PENDING' ||
    account.syncStatus === 'SYNCING' ||
    !account.lastSuccessAt
  )) return 'partial';
  return 'ready';
}

function scopeDataThrough(accounts: readonly AccountRow[]): string | null {
  const dates = accounts
    .map((account) => account.lastSuccessAt ?? account.lastFullReconcileAt)
    .filter((value): value is Date => value instanceof Date);
  if (dates.length !== accounts.length || dates.length === 0) return null;
  return new Date(Math.min(...dates.map((value) => value.getTime()))).toISOString();
}

function sourcePageContext(input: SourceSearchRequest): SourcePageReadModel['query'] {
  return {
    text: cleanQuery(input.text ?? input.query),
    accountId: input.connectedAccountId ?? input.accountId ?? null,
    sender: input.sender?.trim() || null,
    from: iso(input.from),
    to: iso(input.to)
  };
}

export class SourceRepository {
  public constructor(private readonly db: Database = getDatabase()) {}

  private async accountRows(userId: string, connectedAccountId?: string): Promise<AccountRow[]> {
    const filters = [eq(connectedAccounts.userId, userId)];
    if (connectedAccountId) filters.push(eq(connectedAccounts.id, connectedAccountId));
    return this.db
      .select({
        id: connectedAccounts.id,
        provider: connectedAccounts.provider,
        providerAccountId: connectedAccounts.providerAccountId,
        emailAddress: connectedAccounts.emailAddress,
        displayName: connectedAccounts.displayName,
        connectionState: connectedAccounts.connectionState,
        syncStatus: providerSyncStates.status,
        lastSuccessAt: providerSyncStates.lastSuccessAt,
        lastFullReconcileAt: providerSyncStates.lastFullReconcileAt,
        errorCode: providerSyncStates.lastErrorCode
      })
      .from(connectedAccounts)
      .leftJoin(providerSyncStates, eq(providerSyncStates.connectedAccountId, connectedAccounts.id))
      .where(and(...filters))
      .orderBy(asc(connectedAccounts.provider), asc(connectedAccounts.emailAddress));
  }

  private async ownedAccounts(userId: string, connectedAccountId?: string): Promise<AccountRow[]> {
    const rows = await this.accountRows(userId, connectedAccountId);
    if (connectedAccountId && rows.length === 0) throw new SourceAccessError('ACCOUNT_NOT_FOUND');
    return rows;
  }

  private async participantById(userId: string, participantId: string | null): Promise<SourceParticipantReadModel> {
    if (!participantId) return participant(null, null);
    const [row] = await this.db
      .select({email: participantIdentities.canonicalEmail, displayName: participantIdentities.displayName})
      .from(participantIdentities)
      .where(and(eq(participantIdentities.id, participantId), eq(participantIdentities.userId, userId)))
      .limit(1);
    return participant(row?.email, row?.displayName);
  }

  private async messageParticipants(
    userId: string,
    connectedAccountId: string,
    messageId: string,
    role?: 'TO' | 'CC' | 'BCC'
  ): Promise<SourceParticipantReadModel[]> {
    const filters = [
      eq(messageParticipants.userId, userId),
      eq(messageParticipants.connectedAccountId, connectedAccountId),
      eq(messageParticipants.messageId, messageId)
    ];
    if (role) filters.push(eq(messageParticipants.role, role));
    const rows = await this.db
      .select({email: participantIdentities.canonicalEmail, displayName: participantIdentities.displayName})
      .from(messageParticipants)
      .innerJoin(
        participantIdentities,
        and(
          eq(participantIdentities.id, messageParticipants.participantId),
          eq(participantIdentities.userId, userId)
        )
      )
      .where(and(...filters))
      .orderBy(asc(messageParticipants.id));
    return rows.map((row) => participant(row.email, row.displayName));
  }

  private async messageAttachments(
    userId: string,
    connectedAccountId: string,
    messageId: string
  ): Promise<SourceAttachmentReadModel[]> {
    const rows = await this.db
      .select({
        id: attachments.id,
        providerAttachmentId: attachments.providerAttachmentId,
        filename: attachments.filename,
        mimeType: attachments.mimeType,
        sizeBytes: attachments.sizeBytes,
        contentDisposition: attachments.contentDisposition,
        contentReference: attachments.contentReference,
        contentHash: attachments.contentHash,
        previewState: attachments.previewState
      })
      .from(attachments)
      .where(and(
        eq(attachments.userId, userId),
        eq(attachments.connectedAccountId, connectedAccountId),
        eq(attachments.messageId, messageId)
      ))
      .orderBy(asc(attachments.id));
    return rows;
  }

  private async messageModel(userId: string, connectedAccountId: string, row: typeof messages.$inferSelect): Promise<SourceMessageReadModel> {
    return {
      id: row.id,
      providerMessageId: row.providerMessageId,
      providerThreadId: row.providerThreadId,
      direction: row.direction as SourceMessageReadModel['direction'],
      sender: await this.participantById(userId, row.senderParticipantId),
      recipients: await this.messageParticipants(userId, connectedAccountId, row.id, 'TO'),
      cc: await this.messageParticipants(userId, connectedAccountId, row.id, 'CC'),
      bcc: await this.messageParticipants(userId, connectedAccountId, row.id, 'BCC'),
      subject: row.subject,
      textBody: row.textBody,
      sanitizedHtmlBody: sanitizeSourceHtml(row.sanitizedHtmlBody),
      occurredAt: row.occurredAt.toISOString(),
      providerReceivedAt: iso(row.providerReceivedAt),
      readState: row.readState,
      providerDeletedAt: iso(row.providerDeletedAt),
      attachments: await this.messageAttachments(userId, connectedAccountId, row.id)
    };
  }

  private async summaries(
    userId: string,
    accounts: readonly AccountRow[],
    limit: number,
    conversationIds?: readonly string[]
  ): Promise<SourceConversationSummary[]> {
    if (accounts.length === 0 || conversationIds?.length === 0) return [];
    const accountIds = accounts.map((account) => account.id);
    const filters = [
      eq(conversations.userId, userId),
      inArray(conversations.connectedAccountId, accountIds)
    ];
    if (conversationIds) filters.push(inArray(conversations.id, [...conversationIds]));
    const rows = await this.db
      .select()
      .from(conversations)
      .where(and(...filters))
      .orderBy(sql`${conversations.lastMessageAt} DESC NULLS LAST`, asc(conversations.id))
      .limit(limit);
    const accountMap = new Map(accounts.map((account) => [account.id, account]));
    const result: SourceConversationSummary[] = [];
    for (const row of rows) {
      const account = accountMap.get(row.connectedAccountId);
      if (!account) continue;
      const messageRows = await this.db
        .select()
        .from(messages)
        .where(and(
          eq(messages.userId, userId),
          eq(messages.connectedAccountId, row.connectedAccountId),
          eq(messages.conversationId, row.id)
        ))
        .orderBy(desc(messages.occurredAt), desc(messages.id));
      const latest = messageRows[0];
      let hasAttachments = false;
      if (messageRows.length > 0) {
        const attachmentRows = await this.db
          .select({id: attachments.id})
          .from(attachments)
          .where(and(
            eq(attachments.userId, userId),
            eq(attachments.connectedAccountId, row.connectedAccountId),
            inArray(attachments.messageId, messageRows.map((message) => message.id))
          ))
          .limit(1);
        hasAttachments = attachmentRows.length > 0;
      }
      result.push({
        id: row.id,
        providerThreadId: row.providerThreadId,
        subject: row.normalizedSubject ?? latest?.subject ?? '(no subject)',
        preview: sourcePreview(latest?.textBody, latest?.sanitizedHtmlBody),
        lastMessageAt: iso(row.lastMessageAt ?? latest?.occurredAt),
        messageCount: messageRows.length,
        hasAttachments,
        account: accountModel(account),
        latestSender: latest ? await this.participantById(userId, latest.senderParticipantId) : null
      });
    }
    return result;
  }

  private async conversationCount(userId: string, accounts: readonly AccountRow[]): Promise<number> {
    if (accounts.length === 0) return 0;
    const [row] = await this.db
      .select({total: count(conversations.id)})
      .from(conversations)
      .where(and(
        eq(conversations.userId, userId),
        inArray(conversations.connectedAccountId, accounts.map((account) => account.id))
      ));
    return Number(row?.total ?? 0);
  }

  public async listConversations(input: {
    userId: string;
    connectedAccountId?: string;
    limit?: number;
  }): Promise<SourcePageReadModel> {
    const accounts = await this.ownedAccounts(input.userId, input.connectedAccountId);
    const limit = boundedLimit(input.limit);
    return {
      accounts: accounts.map(accountModel),
      conversations: await this.summaries(input.userId, accounts, limit),
      readiness: readiness(accounts),
      dataThroughAt: scopeDataThrough(accounts),
      query: {text: '', accountId: input.connectedAccountId ?? null, sender: null, from: null, to: null},
      total: await this.conversationCount(input.userId, accounts),
      nextCursor: null
    };
  }

  public async getConversation(input: {
    userId: string;
    conversationId: string;
    connectedAccountId?: string;
  }): Promise<SourceConversationReadModel | null> {
    const accounts = await this.ownedAccounts(input.userId, input.connectedAccountId);
    const accountIds = accounts.map((account) => account.id);
    if (accountIds.length === 0) return null;
    const [row] = await this.db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, input.conversationId),
        eq(conversations.userId, input.userId),
        inArray(conversations.connectedAccountId, accountIds)
      ))
      .limit(1);
    if (!row) return null;
    const account = accounts.find((candidate) => candidate.id === row.connectedAccountId);
    if (!account) return null;
    const messageRows = await this.db
      .select()
      .from(messages)
      .where(and(
        eq(messages.userId, input.userId),
        eq(messages.connectedAccountId, row.connectedAccountId),
        eq(messages.conversationId, row.id)
      ))
      .orderBy(asc(messages.occurredAt), asc(messages.id));
    return {
      id: row.id,
      providerThreadId: row.providerThreadId,
      subject: row.normalizedSubject ?? messageRows[0]?.subject ?? '(no subject)',
      account: accountModel(account),
      evidenceRevision: row.semanticEvidenceRevision,
      messages: await Promise.all(messageRows.map((message) =>
        this.messageModel(input.userId, row.connectedAccountId, message)
      ))
    };
  }

  public async searchSource(userId: string, input: SourceSearchRequest): Promise<SourcePageReadModel> {
    const text = cleanQuery(input.text ?? input.query);
    const sender = input.sender?.normalize('NFC').trim() ?? '';
    const connectedAccountId = input.connectedAccountId ?? input.accountId;
    const accounts = await this.ownedAccounts(userId, connectedAccountId);
    const context = sourcePageContext(input);
    const limit = boundedLimit(input.limit);
    if (accounts.length === 0) {
      return {accounts: [], conversations: [], readiness: 'unavailable', dataThroughAt: null, query: context, total: 0, nextCursor: null};
    }

    const participantFilters = [];
    if (text || sender) {
      const participantQuery = escapedLike(text || sender);
      participantFilters.push(
        or(
          ilike(participantIdentities.canonicalEmail, participantQuery),
          ilike(participantIdentities.displayName, participantQuery)
        )
      );
    }
    const matchingParticipants = participantFilters.length === 0
      ? []
      : await this.db
        .select({id: participantIdentities.id})
        .from(participantIdentities)
        .where(and(eq(participantIdentities.userId, userId), ...participantFilters));
    const participantIds = matchingParticipants.map(({id}) => id);

    const accountIds = accounts.map((account) => account.id);
    const filters = [
      eq(messages.userId, userId),
      eq(conversations.userId, userId),
      inArray(messages.connectedAccountId, accountIds),
      eq(messages.conversationId, conversations.id)
    ];
    if (input.from) filters.push(gte(messages.occurredAt, input.from));
    if (input.to) filters.push(lt(messages.occurredAt, input.to));
    if (sender) {
      if (participantIds.length === 0) {
        return {accounts: accounts.map(accountModel), conversations: [], readiness: readiness(accounts), dataThroughAt: scopeDataThrough(accounts), query: context, total: 0, nextCursor: null};
      }
      filters.push(inArray(messages.senderParticipantId, participantIds));
    }
    if (text) {
      const pattern = escapedLike(text);
      const textMatches = [
        ilike(conversations.normalizedSubject, pattern),
        ilike(messages.subject, pattern),
        ilike(messages.textBody, pattern),
        ilike(messages.sanitizedHtmlBody, pattern),
        ilike(messages.providerMessageId, pattern),
        ilike(attachments.filename, pattern)
      ];
      if (participantIds.length > 0) {
        textMatches.push(inArray(messages.senderParticipantId, participantIds));
        textMatches.push(inArray(messageParticipants.participantId, participantIds));
      }
      const textMatch = or(...textMatches);
      if (textMatch) filters.push(textMatch);
    }

    const matchingRows = await this.db
      .selectDistinct({conversationId: conversations.id})
      .from(messages)
      .innerJoin(conversations, and(
        eq(conversations.id, messages.conversationId),
        eq(conversations.connectedAccountId, messages.connectedAccountId)
      ))
      .leftJoin(messageParticipants, and(
        eq(messageParticipants.messageId, messages.id),
        eq(messageParticipants.connectedAccountId, messages.connectedAccountId),
        eq(messageParticipants.userId, userId)
      ))
      .leftJoin(attachments, and(
        eq(attachments.messageId, messages.id),
        eq(attachments.connectedAccountId, messages.connectedAccountId),
        eq(attachments.userId, userId)
      ))
      .where(and(...filters));
    const conversationIds = matchingRows.map(({conversationId}) => conversationId);
    const conversationsResult = await this.summaries(userId, accounts, limit, conversationIds);
    return {
      accounts: accounts.map(accountModel),
      conversations: conversationsResult,
      readiness: readiness(accounts),
      dataThroughAt: scopeDataThrough(accounts),
      query: context,
      total: conversationIds.length,
      nextCursor: null
    };
  }
}

export async function searchSource(
  userId: string,
  request: SourceSearchRequest,
  repository: SourceRepository = new SourceRepository()
): Promise<SourcePageReadModel> {
  return repository.searchSource(userId, request);
}
