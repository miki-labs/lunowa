import {and, asc, count, desc, eq, gt, gte, ilike, inArray, isNull, lt, or, sql} from 'drizzle-orm';

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
import {projectAccountMonitoringIntegrity} from '../../integrity/projection';

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
  cursor?: string;
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
  grantedCapabilities: readonly string[];
  syncStatus: string | null;
  lastSuccessAt: Date | null;
  lastFullReconcileAt: Date | null;
  errorCode: string | null;
};

const MAX_PAGE_SIZE = 100;
const MAX_QUERY_LENGTH = 512;
const MAX_CURSOR_LENGTH = 4096;

type SourcePageContext = SourcePageReadModel['query'];
type SourceCursorPosition = {lastMessageAt: string | null; conversationId: string};
type SourceCursorPayload = {
  version: 1;
  context: SourcePageContext;
  position: SourceCursorPosition;
};

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

function encodeCursor(position: SourceCursorPosition, context: SourcePageContext): string {
  const payload: SourceCursorPayload = {version: 1, context, position};
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeCursor(value: string | undefined, context: SourcePageContext): SourceCursorPosition | undefined {
  if (!value) return undefined;
  if (value.length > MAX_CURSOR_LENGTH) throw new Error('SOURCE_INVALID_CURSOR');
  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<SourceCursorPayload>;
    const position = payload.position;
    if (
      payload.version !== 1 ||
      JSON.stringify(payload.context) !== JSON.stringify(context) ||
      !position ||
      typeof position.conversationId !== 'string' ||
      !position.conversationId ||
      (position.lastMessageAt !== null && typeof position.lastMessageAt !== 'string') ||
      (position.lastMessageAt !== null && Number.isNaN(new Date(position.lastMessageAt).getTime()))
    ) throw new Error('invalid cursor');
    return position;
  } catch {
    throw new Error('SOURCE_INVALID_CURSOR');
  }
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
    grantedCapabilities: row.grantedCapabilities,
    monitoring: projectAccountMonitoringIntegrity({
      connectionState: row.connectionState,
      syncStatus: row.syncStatus,
      syncErrorCode: row.errorCode,
      lastSuccessAt: row.lastSuccessAt,
      lastFullReconcileAt: row.lastFullReconcileAt
    }),
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
  const connected = accounts.filter((account) => account.connectionState === 'CONNECTED');
  if (connected.length === 0) return 'unavailable';
  if (connected.some((account) => projectAccountMonitoringIntegrity({
    connectionState: account.connectionState,
    syncStatus: account.syncStatus,
    syncErrorCode: account.errorCode,
    lastSuccessAt: account.lastSuccessAt,
    lastFullReconcileAt: account.lastFullReconcileAt
  }).status === 'degraded')) return 'degraded';
  if (accounts.some((account) => account.connectionState !== 'CONNECTED') || connected.some((account) =>
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
    .filter((account) => account.connectionState === 'CONNECTED')
    .map((account) => account.lastSuccessAt ?? account.lastFullReconcileAt)
    .filter((value): value is Date => value instanceof Date);
  const connectedCount = accounts.filter((account) => account.connectionState === 'CONNECTED').length;
  if (dates.length !== connectedCount || dates.length === 0) return null;
  return new Date(Math.min(...dates.map((value) => value.getTime()))).toISOString();
}

function sourcePageContext(input: SourceSearchRequest): SourcePageContext {
  return {
    text: cleanQuery(input.text ?? input.query),
    accountId: input.connectedAccountId ?? input.accountId ?? null,
    sender: input.sender?.normalize('NFC').trim() || null,
    from: iso(input.from),
    to: iso(input.to)
  };
}

function afterPosition(position: SourceCursorPosition) {
  if (position.lastMessageAt === null) {
    return and(isNull(conversations.lastMessageAt), gt(conversations.id, position.conversationId))!;
  }
  const lastMessageAt = new Date(position.lastMessageAt);
  return or(
    isNull(conversations.lastMessageAt),
    lt(conversations.lastMessageAt, lastMessageAt),
    and(
      eq(conversations.lastMessageAt, lastMessageAt),
      gt(conversations.id, position.conversationId)
    )
  )!;
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
        grantedCapabilities: connectedAccounts.grantedCapabilities,
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

  private async matchingParticipantIds(userId: string, value: string): Promise<string[]> {
    if (!value) return [];
    const pattern = escapedLike(value);
    const rows = await this.db
      .select({id: participantIdentities.id})
      .from(participantIdentities)
      .where(and(
        eq(participantIdentities.userId, userId),
        or(
          ilike(participantIdentities.canonicalEmail, pattern),
          ilike(participantIdentities.displayName, pattern)
        )
      ));
    return rows.map(({id}) => id);
  }

  private async summaries(
    userId: string,
    accounts: readonly AccountRow[],
    limit: number,
    conversationIds?: readonly string[],
    after?: SourceCursorPosition
  ): Promise<{items: SourceConversationSummary[]; hasMore: boolean; lastPosition: SourceCursorPosition | null}> {
    if (accounts.length === 0 || conversationIds?.length === 0) {
      return {items: [], hasMore: false, lastPosition: null};
    }
    const accountIds = accounts.map((account) => account.id);
    const filters = [
      eq(conversations.userId, userId),
      inArray(conversations.connectedAccountId, accountIds)
    ];
    if (conversationIds) filters.push(inArray(conversations.id, [...conversationIds]));
    if (after) filters.push(afterPosition(after));
    const rows = await this.db
      .select()
      .from(conversations)
      .where(and(...filters))
      .orderBy(sql`${conversations.lastMessageAt} DESC NULLS LAST`, asc(conversations.id))
      .limit(limit + 1);
    const pageRows = rows.slice(0, limit);
    const hasMore = rows.length > limit;
    const accountMap = new Map(accounts.map((account) => [account.id, account]));
    const result: SourceConversationSummary[] = [];
    for (const row of pageRows) {
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
    const lastRow = pageRows.at(-1);
    return {
      items: result,
      hasMore,
      lastPosition: lastRow ? {lastMessageAt: iso(lastRow.lastMessageAt), conversationId: lastRow.id} : null
    };
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
    cursor?: string;
  }): Promise<SourcePageReadModel> {
    const accounts = await this.ownedAccounts(input.userId, input.connectedAccountId);
    const limit = boundedLimit(input.limit);
    const context = {text: '', accountId: input.connectedAccountId ?? null, sender: null, from: null, to: null};
    const after = decodeCursor(input.cursor, context);
    const page = await this.summaries(input.userId, accounts, limit, undefined, after);
    return {
      accounts: accounts.map(accountModel),
      conversations: page.items,
      readiness: readiness(accounts),
      dataThroughAt: scopeDataThrough(accounts),
      query: context,
      total: await this.conversationCount(input.userId, accounts),
      nextCursor: page.hasMore && page.lastPosition ? encodeCursor(page.lastPosition, context) : null
    };
  }

  public async getConversation(input: {
    userId: string;
    conversationId: string;
    connectedAccountId?: string;
  }): Promise<SourceConversationReadModel | null> {
    const accountFilters = [eq(connectedAccounts.userId, input.userId)];
    const conversationFilters = [
      eq(conversations.id, input.conversationId),
      eq(conversations.userId, input.userId)
    ];
    const messageFilters = [
      eq(messages.userId, input.userId),
      eq(messages.conversationId, input.conversationId)
    ];
    const participantFilters = [
      eq(messageParticipants.userId, input.userId),
      eq(messages.userId, input.userId),
      eq(messages.conversationId, input.conversationId)
    ];
    const attachmentFilters = [
      eq(attachments.userId, input.userId),
      eq(messages.userId, input.userId),
      eq(messages.conversationId, input.conversationId)
    ];
    if (input.connectedAccountId) {
      accountFilters.push(eq(connectedAccounts.id, input.connectedAccountId));
      conversationFilters.push(eq(conversations.connectedAccountId, input.connectedAccountId));
      messageFilters.push(eq(messages.connectedAccountId, input.connectedAccountId));
      participantFilters.push(eq(messageParticipants.connectedAccountId, input.connectedAccountId));
      attachmentFilters.push(eq(attachments.connectedAccountId, input.connectedAccountId));
    }

    // Cloudflare retires each pg checkout after one use. Keep that safety boundary,
    // but avoid serial per-message round trips: all detail projections are scoped
    // independently and can be fetched in one bounded parallel database stage.
    const [accounts, conversationRows, messageRows, participantRows, attachmentRows] = await Promise.all([
      this.db
        .select({
          id: connectedAccounts.id,
          provider: connectedAccounts.provider,
          providerAccountId: connectedAccounts.providerAccountId,
          emailAddress: connectedAccounts.emailAddress,
          displayName: connectedAccounts.displayName,
          connectionState: connectedAccounts.connectionState,
          grantedCapabilities: connectedAccounts.grantedCapabilities,
          syncStatus: providerSyncStates.status,
          lastSuccessAt: providerSyncStates.lastSuccessAt,
          lastFullReconcileAt: providerSyncStates.lastFullReconcileAt,
          errorCode: providerSyncStates.lastErrorCode
        })
        .from(connectedAccounts)
        .leftJoin(providerSyncStates, eq(providerSyncStates.connectedAccountId, connectedAccounts.id))
        .where(and(...accountFilters))
        .orderBy(asc(connectedAccounts.provider), asc(connectedAccounts.emailAddress)),
      this.db
        .select()
        .from(conversations)
        .where(and(...conversationFilters))
        .limit(1),
      this.db
        .select({
          id: messages.id,
          userId: messages.userId,
          connectedAccountId: messages.connectedAccountId,
          conversationId: messages.conversationId,
          providerMessageId: messages.providerMessageId,
          providerThreadId: messages.providerThreadId,
          direction: messages.direction,
          senderParticipantId: messages.senderParticipantId,
          senderEmail: participantIdentities.canonicalEmail,
          senderDisplayName: participantIdentities.displayName,
          subject: messages.subject,
          textBody: messages.textBody,
          sanitizedHtmlBody: messages.sanitizedHtmlBody,
          occurredAt: messages.occurredAt,
          providerReceivedAt: messages.providerReceivedAt,
          readState: messages.readState,
          providerDeletedAt: messages.providerDeletedAt
        })
        .from(messages)
        .leftJoin(
          participantIdentities,
          and(
            eq(participantIdentities.id, messages.senderParticipantId),
            eq(participantIdentities.userId, input.userId)
          )
        )
        .where(and(...messageFilters))
        .orderBy(asc(messages.occurredAt), asc(messages.id)),
      this.db
        .select({
          id: messageParticipants.id,
          messageId: messageParticipants.messageId,
          role: messageParticipants.role,
          email: participantIdentities.canonicalEmail,
          displayName: participantIdentities.displayName
        })
        .from(messageParticipants)
        .innerJoin(
          messages,
          and(
            eq(messages.id, messageParticipants.messageId),
            eq(messages.connectedAccountId, messageParticipants.connectedAccountId)
          )
        )
        .innerJoin(
          participantIdentities,
          and(
            eq(participantIdentities.id, messageParticipants.participantId),
            eq(participantIdentities.userId, input.userId)
          )
        )
        .where(and(...participantFilters))
        .orderBy(asc(messageParticipants.id)),
      this.db
        .select({
          id: attachments.id,
          messageId: attachments.messageId,
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
        .innerJoin(
          messages,
          and(
            eq(messages.id, attachments.messageId),
            eq(messages.connectedAccountId, attachments.connectedAccountId)
          )
        )
        .where(and(...attachmentFilters))
        .orderBy(asc(attachments.id))
    ]);

    if (input.connectedAccountId && accounts.length === 0) throw new SourceAccessError('ACCOUNT_NOT_FOUND');
    const row = conversationRows[0];
    if (!row) return null;
    const account = accounts.find((candidate) => candidate.id === row.connectedAccountId);
    if (!account) return null;

    type RecipientGroups = Record<'TO' | 'CC' | 'BCC', SourceParticipantReadModel[]>;
    const recipientsByMessage = new Map<string, RecipientGroups>();
    for (const recipientRow of participantRows) {
      if (recipientRow.role !== 'TO' && recipientRow.role !== 'CC' && recipientRow.role !== 'BCC') continue;
      const groups = recipientsByMessage.get(recipientRow.messageId) ?? {TO: [], CC: [], BCC: []};
      groups[recipientRow.role].push(participant(recipientRow.email, recipientRow.displayName));
      recipientsByMessage.set(recipientRow.messageId, groups);
    }

    const attachmentsByMessage = new Map<string, SourceAttachmentReadModel[]>();
    for (const attachment of attachmentRows) {
      const group = attachmentsByMessage.get(attachment.messageId) ?? [];
      group.push({
        id: attachment.id,
        providerAttachmentId: attachment.providerAttachmentId,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        contentDisposition: attachment.contentDisposition,
        contentReference: attachment.contentReference,
        contentHash: attachment.contentHash,
        previewState: attachment.previewState
      });
      attachmentsByMessage.set(attachment.messageId, group);
    }

    const messageModels: SourceMessageReadModel[] = messageRows
      .filter((message) => message.connectedAccountId === row.connectedAccountId)
      .map((message) => {
        const recipients = recipientsByMessage.get(message.id) ?? {TO: [], CC: [], BCC: []};
        return {
          id: message.id,
          providerMessageId: message.providerMessageId,
          providerThreadId: message.providerThreadId,
          direction: message.direction as SourceMessageReadModel['direction'],
          sender: participant(message.senderEmail, message.senderDisplayName),
          recipients: recipients.TO,
          cc: recipients.CC,
          bcc: recipients.BCC,
          subject: message.subject,
          textBody: message.textBody,
          sanitizedHtmlBody: sanitizeSourceHtml(message.sanitizedHtmlBody),
          occurredAt: message.occurredAt.toISOString(),
          providerReceivedAt: iso(message.providerReceivedAt),
          readState: message.readState,
          providerDeletedAt: iso(message.providerDeletedAt),
          attachments: attachmentsByMessage.get(message.id) ?? []
        };
      });

    return {
      id: row.id,
      providerThreadId: row.providerThreadId,
      subject: row.normalizedSubject ?? messageModels[0]?.subject ?? '(no subject)',
      account: accountModel(account),
      evidenceRevision: row.semanticEvidenceRevision,
      messages: messageModels
    };
  }

  public async searchSource(userId: string, input: SourceSearchRequest): Promise<SourcePageReadModel> {
    const context = sourcePageContext(input);
    const text = context.text;
    const sender = context.sender ?? '';
    const connectedAccountId = input.connectedAccountId ?? input.accountId;
    const accounts = await this.ownedAccounts(userId, connectedAccountId);
    const limit = boundedLimit(input.limit);
    const after = decodeCursor(input.cursor, context);
    if (accounts.length === 0) {
      return {accounts: [], conversations: [], readiness: 'unavailable', dataThroughAt: null, query: context, total: 0, nextCursor: null};
    }

    const [senderParticipantIds, textParticipantIds] = await Promise.all([
      this.matchingParticipantIds(userId, sender),
      this.matchingParticipantIds(userId, text)
    ]);

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
      if (senderParticipantIds.length === 0) {
        return {accounts: accounts.map(accountModel), conversations: [], readiness: readiness(accounts), dataThroughAt: scopeDataThrough(accounts), query: context, total: 0, nextCursor: null};
      }
      filters.push(inArray(messages.senderParticipantId, senderParticipantIds));
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
      if (textParticipantIds.length > 0) {
        textMatches.push(inArray(messages.senderParticipantId, textParticipantIds));
        textMatches.push(inArray(messageParticipants.participantId, textParticipantIds));
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
    const page = await this.summaries(userId, accounts, limit, conversationIds, after);
    return {
      accounts: accounts.map(accountModel),
      conversations: page.items,
      readiness: readiness(accounts),
      dataThroughAt: scopeDataThrough(accounts),
      query: context,
      total: conversationIds.length,
      nextCursor: page.hasMore && page.lastPosition ? encodeCursor(page.lastPosition, context) : null
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
