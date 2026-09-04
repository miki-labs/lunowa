import {randomUUID} from 'node:crypto';

import {and, asc, eq, gt, inArray, isNull, lte, ne, or, sql} from 'drizzle-orm';

import {getDatabase} from '../index';
import {
  attachments,
  connectedAccounts,
  gmailBootstrapStates,
  gmailOauthStates,
  gmailProviderCredentials,
  gmailSyncSignals,
  gmailWatchStates,
  messages,
  providerSyncStates
} from '../schema';

type Database = ReturnType<typeof getDatabase>;
export type SignalReason = 'INITIAL' | 'PUSH' | 'SAFETY' | 'WATCH_RENEWAL' | 'RETRY';

export type ClaimedGmailSignal = {
  id: string;
  connectedAccountId: string;
  reason: SignalReason;
  hintedHistoryId: string | null;
  attempts: number;
};

export class GmailRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async createOauthState(input: {
    stateDigest: string;
    userId: string;
    encryptedCodeVerifier: string;
    returnPath: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.db.insert(gmailOauthStates).values(input);
  }

  async consumeOauthState(input: {stateDigest: string; now: Date}) {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(gmailOauthStates)
        .where(
          and(
            eq(gmailOauthStates.stateDigest, input.stateDigest),
            isNull(gmailOauthStates.consumedAt),
            gt(gmailOauthStates.expiresAt, input.now)
          )
        )
        .for('update');
      if (!row) return null;
      await tx
        .update(gmailOauthStates)
        .set({consumedAt: input.now})
        .where(eq(gmailOauthStates.stateDigest, input.stateDigest));
      return row;
    });
  }

  async putCredential(input: {
    id?: string;
    userId: string;
    connectedAccountId: string;
    encryptedPayload: string;
    keyVersion: string;
    grantedScopes: readonly string[];
  }): Promise<string> {
    const id = input.id ?? randomUUID();
    const now = new Date();
    return this.db.transaction(async (tx) => {
      const [owned] = await tx
        .select({id: connectedAccounts.id})
        .from(connectedAccounts)
        .where(
          and(
            eq(connectedAccounts.id, input.connectedAccountId),
            eq(connectedAccounts.userId, input.userId),
            eq(connectedAccounts.provider, 'gmail'),
            ne(connectedAccounts.connectionState, 'DISCONNECTED')
          )
        )
        .for('update');
      if (!owned) throw new Error('connected account is not owned by the current user');
      const [row] = await tx
        .insert(gmailProviderCredentials)
        .values({...input, id, grantedScopes: [...input.grantedScopes], createdAt: now, updatedAt: now})
        .onConflictDoUpdate({
          target: gmailProviderCredentials.connectedAccountId,
          set: {
            encryptedPayload: input.encryptedPayload,
            keyVersion: input.keyVersion,
            grantedScopes: [...input.grantedScopes],
            invalidatedAt: null,
            updatedAt: now
          }
        })
        .returning({id: gmailProviderCredentials.id});
      if (!row) throw new Error('Gmail credential persistence did not return an ID.');
      return row.id;
    });
  }

  async getOwnedCredential(userId: string, connectedAccountId: string): Promise<{
    id: string;
    encryptedPayload: string;
    keyVersion: string;
    grantedScopes: readonly string[];
    invalidatedAt: Date | null;
    connectionState: string;
    emailAddress: string;
  } | null> {
    const [row] = await this.db
      .select({
        id: gmailProviderCredentials.id,
        encryptedPayload: gmailProviderCredentials.encryptedPayload,
        keyVersion: gmailProviderCredentials.keyVersion,
        grantedScopes: gmailProviderCredentials.grantedScopes,
        invalidatedAt: gmailProviderCredentials.invalidatedAt,
        connectionState: connectedAccounts.connectionState,
        emailAddress: connectedAccounts.emailAddress
      })
      .from(gmailProviderCredentials)
      .innerJoin(
        connectedAccounts,
        and(
          eq(connectedAccounts.id, gmailProviderCredentials.connectedAccountId),
          eq(connectedAccounts.userId, gmailProviderCredentials.userId)
        )
      )
      .where(
        and(
          eq(gmailProviderCredentials.userId, userId),
          eq(gmailProviderCredentials.connectedAccountId, connectedAccountId),
          eq(connectedAccounts.provider, 'gmail')
        )
      )
      .limit(1);
    return row ?? null;
  }

  async invalidateCredential(userId: string, connectedAccountId: string): Promise<void> {
    const now = new Date();
    await this.db.transaction(async (tx) => {
      const [owned] = await tx
        .select({id: connectedAccounts.id})
        .from(connectedAccounts)
        .where(and(eq(connectedAccounts.id, connectedAccountId), eq(connectedAccounts.userId, userId)))
        .for('update');
      if (!owned) throw new Error('connected account is not owned by the current user');
      await tx
        .update(gmailProviderCredentials)
        .set({invalidatedAt: now, updatedAt: now})
        .where(
          and(
            eq(gmailProviderCredentials.connectedAccountId, connectedAccountId),
            eq(gmailProviderCredentials.userId, userId)
          )
        );
      await tx
        .update(connectedAccounts)
        .set({connectionState: 'RECONNECT_REQUIRED', updatedAt: now})
        .where(and(eq(connectedAccounts.id, connectedAccountId), eq(connectedAccounts.userId, userId)));
      await tx
        .update(providerSyncStates)
        .set({status: 'ERROR', lastErrorCode: 'AUTH_REVOKED', updatedAt: now})
        .where(eq(providerSyncStates.connectedAccountId, connectedAccountId));
    });
  }

  async deleteCredential(userId: string, connectedAccountId: string): Promise<void> {
    const now = new Date();
    await this.db.transaction(async (tx) => {
      const [owned] = await tx
        .select({id: connectedAccounts.id})
        .from(connectedAccounts)
        .where(and(eq(connectedAccounts.id, connectedAccountId), eq(connectedAccounts.userId, userId)))
        .for('update');
      if (!owned) throw new Error('connected account is not owned by the current user');
      await tx
        .delete(gmailProviderCredentials)
        .where(and(eq(gmailProviderCredentials.userId, userId), eq(gmailProviderCredentials.connectedAccountId, connectedAccountId)));
      await tx
        .update(connectedAccounts)
        .set({connectionState: 'DISCONNECTED', grantedCapabilities: [], updatedAt: now})
        .where(eq(connectedAccounts.id, connectedAccountId));
      await tx
        .update(providerSyncStates)
        .set({status: 'ERROR', lastErrorCode: 'INTENTIONAL_DISCONNECT', updatedAt: now})
        .where(eq(providerSyncStates.connectedAccountId, connectedAccountId));
    });
  }

  async findConnectedAccountsByEmail(emailAddress: string): Promise<readonly {id: string; userId: string}[]> {
    return this.db
      .select({id: connectedAccounts.id, userId: connectedAccounts.userId})
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.provider, 'gmail'),
          eq(connectedAccounts.connectionState, 'CONNECTED'),
          sql`lower(${connectedAccounts.emailAddress}) = lower(${emailAddress.trim()})`
        )
      )
      .limit(100);
  }

  async enqueueSignal(input: {
    connectedAccountId: string;
    deliveryKey: string;
    reason: SignalReason;
    hintedHistoryId?: string;
    availableAt?: Date;
  }): Promise<boolean> {
    const rows = await this.db
      .insert(gmailSyncSignals)
      .values({
        connectedAccountId: input.connectedAccountId,
        deliveryKey: input.deliveryKey,
        reason: input.reason,
        hintedHistoryId: input.hintedHistoryId,
        availableAt: input.availableAt ?? new Date()
      })
      .onConflictDoNothing({target: gmailSyncSignals.deliveryKey})
      .returning({id: gmailSyncSignals.id});
    return rows.length === 1;
  }

  async claimSignals(limit: number, leaseUntil: Date, now = new Date()): Promise<readonly ClaimedGmailSignal[]> {
    return this.db.transaction(async (tx) => {
      const rows = await tx
        .select({
          id: gmailSyncSignals.id,
          connectedAccountId: gmailSyncSignals.connectedAccountId,
          reason: gmailSyncSignals.reason,
          hintedHistoryId: gmailSyncSignals.hintedHistoryId,
          attempts: gmailSyncSignals.attempts
        })
        .from(gmailSyncSignals)
        .where(
          and(
            lte(gmailSyncSignals.availableAt, now),
            or(
              eq(gmailSyncSignals.status, 'PENDING'),
              and(eq(gmailSyncSignals.status, 'PROCESSING'), lte(gmailSyncSignals.lockedUntil, now))
            )
          )
        )
        .orderBy(asc(gmailSyncSignals.receivedAt))
        .limit(Math.max(1, Math.min(limit, 100)))
        .for('update', {skipLocked: true});
      if (rows.length === 0) return [];
      await tx
        .update(gmailSyncSignals)
        .set({status: 'PROCESSING', lockedUntil: leaseUntil, attempts: sql`${gmailSyncSignals.attempts} + 1`})
        .where(inArray(gmailSyncSignals.id, rows.map(({id}) => id)));
      return rows.map((row) => ({...row, reason: row.reason as SignalReason, attempts: row.attempts + 1}));
    });
  }

  async completeSignal(id: string): Promise<void> {
    await this.db
      .update(gmailSyncSignals)
      .set({status: 'COMPLETED', lockedUntil: null, completedAt: new Date(), lastErrorCode: null})
      .where(eq(gmailSyncSignals.id, id));
  }

  async failSignal(id: string, attempts: number, errorCode: string): Promise<void> {
    const final = attempts >= 8;
    const delay = Math.min(60 * 60_000, 2 ** Math.min(attempts, 10) * 1_000);
    await this.db
      .update(gmailSyncSignals)
      .set({
        status: final ? 'FAILED' : 'PENDING',
        lockedUntil: null,
        availableAt: new Date(Date.now() + delay),
        lastErrorCode: errorCode.slice(0, 128)
      })
      .where(eq(gmailSyncSignals.id, id));
  }

  async getSyncContext(connectedAccountId: string): Promise<{
    userId: string;
    connectedAccountId: string;
    emailAddress: string;
    connectionState: string;
    cursor: string | null;
    syncGeneration: number | null;
    watchExpirationAt: Date | null;
  } | null> {
    const [row] = await this.db
      .select({
        userId: connectedAccounts.userId,
        connectedAccountId: connectedAccounts.id,
        emailAddress: connectedAccounts.emailAddress,
        connectionState: connectedAccounts.connectionState,
        cursor: providerSyncStates.cursorOrDeltaToken,
        syncGeneration: providerSyncStates.syncGeneration,
        watchExpirationAt: gmailWatchStates.expirationAt
      })
      .from(connectedAccounts)
      .leftJoin(providerSyncStates, eq(providerSyncStates.connectedAccountId, connectedAccounts.id))
      .leftJoin(gmailWatchStates, eq(gmailWatchStates.connectedAccountId, connectedAccounts.id))
      .where(and(eq(connectedAccounts.id, connectedAccountId), eq(connectedAccounts.provider, 'gmail')))
      .limit(1);
    return row ?? null;
  }

  async setSyncStatus(input: {
    userId: string;
    connectedAccountId: string;
    status: 'PENDING' | 'SYNCING' | 'HEALTHY' | 'RECONCILIATION_REQUIRED' | 'ERROR';
    lastErrorCode?: string | null;
    successful?: boolean;
    full?: boolean;
  }): Promise<void> {
    const [owned] = await this.db
      .select({id: connectedAccounts.id})
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.id, input.connectedAccountId), eq(connectedAccounts.userId, input.userId)))
      .limit(1);
    if (!owned) throw new Error('connected account is not owned by the current user');
    const now = new Date();
    await this.db
      .insert(providerSyncStates)
      .values({
        connectedAccountId: input.connectedAccountId,
        status: input.status,
        lastAttemptAt: now,
        lastSuccessAt: input.successful ? now : undefined,
        lastFullReconcileAt: input.full ? now : undefined,
        lastErrorCode: input.lastErrorCode ?? null,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: providerSyncStates.connectedAccountId,
        set: {
          status: input.status,
          lastAttemptAt: now,
          ...(input.successful ? {lastSuccessAt: now} : {}),
          ...(input.full ? {lastFullReconcileAt: now} : {}),
          lastErrorCode: input.lastErrorCode ?? null,
          updatedAt: now
        }
      });
  }

  async advanceCursor(input: {
    userId: string;
    connectedAccountId: string;
    expectedCursor: string | null;
    nextCursor: string;
    full: boolean;
  }): Promise<boolean> {
    const now = new Date();
    const ownedConnectedAccount = this.db
      .select({id: connectedAccounts.id})
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.id, input.connectedAccountId),
          eq(connectedAccounts.userId, input.userId),
          eq(connectedAccounts.provider, 'gmail'),
          eq(connectedAccounts.connectionState, 'CONNECTED')
        )
      );
    const rows = await this.db
      .update(providerSyncStates)
      .set({
        cursorOrDeltaToken: input.nextCursor,
        syncGeneration: sql`${providerSyncStates.syncGeneration} + 1`,
        status: 'HEALTHY',
        lastAttemptAt: now,
        lastSuccessAt: now,
        ...(input.full ? {lastFullReconcileAt: now} : {}),
        lastErrorCode: null,
        updatedAt: now
      })
      .where(
        and(
          eq(providerSyncStates.connectedAccountId, input.connectedAccountId),
          input.expectedCursor === null
            ? isNull(providerSyncStates.cursorOrDeltaToken)
            : eq(providerSyncStates.cursorOrDeltaToken, input.expectedCursor),
          inArray(providerSyncStates.connectedAccountId, ownedConnectedAccount)
        )
      )
      .returning({id: providerSyncStates.connectedAccountId});
    return rows.length === 1;
  }

  async saveWatch(input: {connectedAccountId: string; topicName: string; expirationAt: Date; historyId: string}): Promise<void> {
    await this.db
      .insert(gmailWatchStates)
      .values({...input, lastHistoryId: input.historyId, updatedAt: new Date()})
      .onConflictDoUpdate({
        target: gmailWatchStates.connectedAccountId,
        set: {topicName: input.topicName, expirationAt: input.expirationAt, lastHistoryId: input.historyId, updatedAt: new Date()}
      });
  }

  async getBootstrapState(connectedAccountId: string): Promise<{
    baselineHistoryId: string;
    pageToken: string | null;
    pageOffset: number;
    processedMessageCount: number;
  } | null> {
    const [row] = await this.db
      .select({
        baselineHistoryId: gmailBootstrapStates.baselineHistoryId,
        pageToken: gmailBootstrapStates.pageToken,
        pageOffset: gmailBootstrapStates.pageOffset,
        processedMessageCount: gmailBootstrapStates.processedMessageCount
      })
      .from(gmailBootstrapStates)
      .where(eq(gmailBootstrapStates.connectedAccountId, connectedAccountId))
      .limit(1);
    return row ?? null;
  }

  async saveBootstrapState(input: {
    connectedAccountId: string;
    baselineHistoryId: string;
    pageToken: string | null;
    pageOffset: number;
    processedMessageCount: number;
  }): Promise<void> {
    const now = new Date();
    await this.db
      .insert(gmailBootstrapStates)
      .values({...input, createdAt: now, updatedAt: now})
      .onConflictDoUpdate({
        target: gmailBootstrapStates.connectedAccountId,
        set: {
          baselineHistoryId: input.baselineHistoryId,
          pageToken: input.pageToken,
          pageOffset: input.pageOffset,
          processedMessageCount: input.processedMessageCount,
          updatedAt: now
        }
      });
  }

  async deleteBootstrapState(connectedAccountId: string): Promise<void> {
    await this.db
      .delete(gmailBootstrapStates)
      .where(eq(gmailBootstrapStates.connectedAccountId, connectedAccountId));
  }

  async listDueAccountIds(now: Date, safetyBefore: Date, watchBefore: Date): Promise<readonly {id: string; reason: SignalReason}[]> {
    const rows = await this.db
      .select({
        id: connectedAccounts.id,
        lastSuccessAt: providerSyncStates.lastSuccessAt,
        watchExpirationAt: gmailWatchStates.expirationAt
      })
      .from(connectedAccounts)
      .leftJoin(providerSyncStates, eq(providerSyncStates.connectedAccountId, connectedAccounts.id))
      .leftJoin(gmailWatchStates, eq(gmailWatchStates.connectedAccountId, connectedAccounts.id))
      .where(and(eq(connectedAccounts.provider, 'gmail'), eq(connectedAccounts.connectionState, 'CONNECTED')));
    return rows.flatMap((row) => {
      const result: {id: string; reason: SignalReason}[] = [];
      if (!row.lastSuccessAt || row.lastSuccessAt <= safetyBefore) result.push({id: row.id, reason: 'SAFETY'});
      if (!row.watchExpirationAt || row.watchExpirationAt <= watchBefore) result.push({id: row.id, reason: 'WATCH_RENEWAL'});
      return result;
    });
  }

  async getOwnedAttachment(input: {userId: string; connectedAccountId: string; attachmentId: string}): Promise<{
    providerMessageId: string;
    providerAttachmentId: string | null;
    filename: string;
    mimeType: string;
    sizeBytes: number | null;
  } | null> {
    const [row] = await this.db
      .select({
        providerMessageId: messages.providerMessageId,
        providerAttachmentId: attachments.providerAttachmentId,
        filename: attachments.filename,
        mimeType: attachments.mimeType,
        sizeBytes: attachments.sizeBytes
      })
      .from(attachments)
      .innerJoin(messages, and(eq(messages.id, attachments.messageId), eq(messages.connectedAccountId, attachments.connectedAccountId)))
      .where(
        and(
          eq(attachments.id, input.attachmentId),
          eq(attachments.userId, input.userId),
          eq(attachments.connectedAccountId, input.connectedAccountId)
        )
      )
      .limit(1);
    return row ?? null;
  }
}
