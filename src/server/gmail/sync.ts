import {EvidenceRepository} from '@/server/db/repositories/evidence';
import {GmailRepository, type ClaimedGmailSignal} from '@/server/db/repositories/gmail';

import {GmailCredentialService} from './authorization';
import {normalizeGmailMessage} from './normalize';
import type {GmailEvidenceWriter, GmailHistory, GmailProviderClient} from './types';
import {GmailProviderError} from './types';

const INITIAL_SYNC_LIMIT = 250;
const FULL_SYNC_LIMIT = 10_000;
const MAX_HISTORY_PAGES = 100;
const WATCH_RENEWAL_WINDOW_MS = 24 * 60 * 60_000;
const SAFETY_RECONCILIATION_INTERVAL_MS = 15 * 60_000;

type SyncRepository = Pick<
  GmailRepository,
  | 'getSyncContext'
  | 'setSyncStatus'
  | 'advanceCursor'
  | 'saveWatch'
  | 'invalidateCredential'
  | 'enqueueSignal'
  | 'listDueAccountIds'
  | 'claimSignals'
  | 'completeSignal'
  | 'failSignal'
>;

function changedMessageIds(history: readonly GmailHistory[]): {changed: Set<string>; deleted: Set<string>} {
  const changed = new Set<string>();
  const deleted = new Set<string>();
  for (const item of history) {
    for (const message of item.messages ?? []) changed.add(message.id);
    for (const {message} of item.messagesAdded ?? []) changed.add(message.id);
    for (const {message} of item.labelsAdded ?? []) changed.add(message.id);
    for (const {message} of item.labelsRemoved ?? []) changed.add(message.id);
    for (const {message} of item.messagesDeleted ?? []) {
      deleted.add(message.id);
      changed.delete(message.id);
    }
  }
  return {changed, deleted};
}

export class GmailSyncService {
  constructor(
    private readonly topicName: string,
    private readonly provider: GmailProviderClient,
    private readonly credentials: GmailCredentialService,
    private readonly repository: SyncRepository = new GmailRepository(),
    private readonly evidence: GmailEvidenceWriter = new EvidenceRepository()
  ) {}

  private async ingestMessage(context: {
    userId: string;
    connectedAccountId: string;
    emailAddress: string;
  }, accessToken: string, messageId: string): Promise<void> {
    try {
      const message = await this.provider.getMessage(accessToken, messageId);
      await this.evidence.upsertNormalizedMessage(normalizeGmailMessage({
        ...context,
        accountEmail: context.emailAddress,
        message
      }));
    } catch (error) {
      if (error instanceof GmailProviderError && error.status === 404) {
        await this.evidence.deleteNormalizedMessage({
          userId: context.userId,
          connectedAccountId: context.connectedAccountId,
          providerMessageId: messageId
        });
        return;
      }
      throw error;
    }
  }

  private async renewWatch(connectedAccountId: string, accessToken: string): Promise<string> {
    const watch = await this.provider.watch(accessToken, this.topicName);
    const expirationAt = new Date(Number(watch.expiration));
    if (!watch.historyId || Number.isNaN(expirationAt.getTime())) {
      throw new GmailProviderError(502, 'INVALID_WATCH_RESPONSE');
    }
    await this.repository.saveWatch({
      connectedAccountId,
      topicName: this.topicName,
      expirationAt,
      historyId: watch.historyId
    });
    return watch.historyId;
  }

  private async initialSync(
    context: {userId: string; connectedAccountId: string; emailAddress: string},
    accessToken: string,
    baselineHistoryId: string
  ): Promise<void> {
    let pageToken: string | undefined;
    let count = 0;
    do {
      const page = await this.provider.listMessages(accessToken, pageToken);
      for (const {id} of page.messages ?? []) {
        if (count >= INITIAL_SYNC_LIMIT) break;
        await this.ingestMessage(context, accessToken, id);
        count += 1;
      }
      pageToken = count >= INITIAL_SYNC_LIMIT ? undefined : page.nextPageToken;
    } while (pageToken);
    const advanced = await this.repository.advanceCursor({
      userId: context.userId,
      connectedAccountId: context.connectedAccountId,
      expectedCursor: null,
      nextCursor: baselineHistoryId,
      full: false
    });
    if (!advanced) throw new GmailProviderError(409, 'CURSOR_CONFLICT');
  }

  private async fullRecovery(
    context: {userId: string; connectedAccountId: string; emailAddress: string},
    accessToken: string,
    expectedCursor: string
  ): Promise<void> {
    // Snapshot the baseline before listing. Changes after it are intentionally
    // replayed by the next history reconciliation, even if already observed.
    const profile = await this.provider.getProfile(accessToken);
    const providerIds = new Set<string>();
    let pageToken: string | undefined;
    do {
      const page = await this.provider.listMessages(accessToken, pageToken);
      for (const {id} of page.messages ?? []) {
        if (providerIds.size >= FULL_SYNC_LIMIT) break;
        providerIds.add(id);
      }
      if (providerIds.size >= FULL_SYNC_LIMIT && page.nextPageToken) {
        await this.repository.setSyncStatus({
          userId: context.userId,
          connectedAccountId: context.connectedAccountId,
          status: 'RECONCILIATION_REQUIRED',
          lastErrorCode: 'FULL_SYNC_LIMIT'
        });
        throw new GmailProviderError(503, 'FULL_SYNC_LIMIT');
      }
      pageToken = page.nextPageToken;
    } while (pageToken);

    for (const id of [...providerIds].sort()) await this.ingestMessage(context, accessToken, id);
    const localIds = await this.evidence.listProviderMessageIds({
      userId: context.userId,
      connectedAccountId: context.connectedAccountId
    });
    for (const id of localIds) {
      if (!providerIds.has(id)) {
        await this.evidence.deleteNormalizedMessage({
          userId: context.userId,
          connectedAccountId: context.connectedAccountId,
          providerMessageId: id
        });
      }
    }
    const advanced = await this.repository.advanceCursor({
      userId: context.userId,
      connectedAccountId: context.connectedAccountId,
      expectedCursor,
      nextCursor: profile.historyId,
      full: true
    });
    if (!advanced) throw new GmailProviderError(409, 'CURSOR_CONFLICT');
  }

  private async historySync(
    context: {userId: string; connectedAccountId: string; emailAddress: string},
    accessToken: string,
    cursor: string
  ): Promise<void> {
    const history: GmailHistory[] = [];
    let nextCursor = cursor;
    let pageToken: string | undefined;
    let pages = 0;
    try {
      do {
        if (++pages > MAX_HISTORY_PAGES) throw new GmailProviderError(503, 'HISTORY_PAGE_LIMIT');
        const page = await this.provider.listHistory(accessToken, cursor, pageToken);
        history.push(...(page.history ?? []));
        if (page.historyId) nextCursor = page.historyId;
        pageToken = page.nextPageToken;
      } while (pageToken);
    } catch (error) {
      if (error instanceof GmailProviderError && error.status === 404) {
        await this.repository.setSyncStatus({
          userId: context.userId,
          connectedAccountId: context.connectedAccountId,
          status: 'RECONCILIATION_REQUIRED',
          lastErrorCode: 'STALE_HISTORY'
        });
        await this.fullRecovery(context, accessToken, cursor);
        return;
      }
      throw error;
    }

    const ids = changedMessageIds(history);
    for (const id of [...ids.changed].sort()) await this.ingestMessage(context, accessToken, id);
    for (const id of [...ids.deleted].sort()) {
      await this.evidence.deleteNormalizedMessage({
        userId: context.userId,
        connectedAccountId: context.connectedAccountId,
        providerMessageId: id
      });
    }
    const advanced = await this.repository.advanceCursor({
      userId: context.userId,
      connectedAccountId: context.connectedAccountId,
      expectedCursor: cursor,
      nextCursor,
      full: false
    });
    if (!advanced) throw new GmailProviderError(409, 'CURSOR_CONFLICT');
  }

  async reconcile(signal: ClaimedGmailSignal): Promise<void> {
    const context = await this.repository.getSyncContext(signal.connectedAccountId);
    if (!context || context.connectionState !== 'CONNECTED') return;
    await this.repository.setSyncStatus({
      userId: context.userId,
      connectedAccountId: context.connectedAccountId,
      status: 'SYNCING'
    });
    try {
      const accessToken = await this.credentials.getAccessToken(context.userId, context.connectedAccountId);
      const renew =
        signal.reason === 'INITIAL' ||
        signal.reason === 'WATCH_RENEWAL' ||
        !context.watchExpirationAt ||
        context.watchExpirationAt.getTime() <= Date.now() + WATCH_RENEWAL_WINDOW_MS;
      const watchHistoryId = renew
        ? await this.renewWatch(context.connectedAccountId, accessToken)
        : null;
      if (!context.cursor) {
        await this.initialSync(context, accessToken, watchHistoryId ?? (await this.provider.getProfile(accessToken)).historyId);
      } else {
        await this.historySync(context, accessToken, context.cursor);
      }
    } catch (error) {
      if (error instanceof GmailProviderError && error.status === 401) {
        await this.repository.invalidateCredential(context.userId, context.connectedAccountId);
      } else if (!(error instanceof GmailProviderError && ['FULL_SYNC_LIMIT', 'CURSOR_CONFLICT'].includes(error.code))) {
        await this.repository.setSyncStatus({
          userId: context.userId,
          connectedAccountId: context.connectedAccountId,
          status: 'ERROR',
          lastErrorCode: error instanceof GmailProviderError ? error.code : 'SYNC_FAILED'
        });
      }
      throw error;
    }
  }

  async enqueueDueWork(now = new Date()): Promise<number> {
    const rows = await this.repository.listDueAccountIds(
      now,
      new Date(now.getTime() - SAFETY_RECONCILIATION_INTERVAL_MS),
      new Date(now.getTime() + WATCH_RENEWAL_WINDOW_MS)
    );
    const bucket = Math.floor(now.getTime() / SAFETY_RECONCILIATION_INTERVAL_MS);
    let created = 0;
    for (const row of rows) {
      if (await this.repository.enqueueSignal({
        connectedAccountId: row.id,
        deliveryKey: `${row.reason.toLowerCase()}:${row.id}:${bucket}`,
        reason: row.reason
      })) created += 1;
    }
    return created;
  }

  async runPending(limit = 20): Promise<{processed: number; failed: number}> {
    const signals = await this.repository.claimSignals(limit, new Date(Date.now() + 5 * 60_000));
    let processed = 0;
    let failed = 0;
    // Sequential processing also prevents two signals for one account from
    // competing inside a single worker. Cursor CAS protects multiple workers.
    for (const signal of signals) {
      try {
        await this.reconcile(signal);
        await this.repository.completeSignal(signal.id);
        processed += 1;
      } catch (error) {
        await this.repository.failSignal(
          signal.id,
          signal.attempts,
          error instanceof GmailProviderError ? error.code : 'SYNC_FAILED'
        );
        failed += 1;
      }
    }
    return {processed, failed};
  }
}
