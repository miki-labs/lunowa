import {CommunicationRepository} from '@/server/db/repositories/communication';
import {ResponsibilityRepository} from '@/server/db/repositories/responsibility';
import {TemporalRepository} from '@/server/db/repositories/temporal';
import {createGmailRuntime} from './runtime';

type ReconciliationRuntime = Pick<ReturnType<typeof createGmailRuntime>, 'sync'>;

/** Shared owner for both authenticated manual invocations and deployed cron. */
export async function runGmailReconciliation(
  runtime: ReconciliationRuntime = createGmailRuntime()
): Promise<{enqueued: number; processed: number; failed: number}> {
  const enqueued = await runtime.sync.enqueueDueWork();
  const result = await runtime.sync.runPending(20);
  return {enqueued, ...result};
}


type SendReconciliationRuntime = Pick<ReturnType<typeof createGmailRuntime>, 'send'>;
type SendReconciliationStore = Pick<CommunicationRepository, 'listReconcilableSendOperations'>;

/**
 * Repairs only send attempts whose provider outcome is already potentially
 * consequential. PENDING is deliberately excluded so cron can never create a
 * hidden later Send after the user has left the explicit Send interaction.
 */
export async function runGmailSendReconciliation(
  runtime: SendReconciliationRuntime = createGmailRuntime(),
  operations: SendReconciliationStore = new CommunicationRepository(),
  limit = 20
): Promise<{processed: number; failed: number}> {
  const pending = await operations.listReconcilableSendOperations(limit);
  let processed = 0;
  let failed = 0;
  for (const operation of pending) {
    try {
      await runtime.send.dispatch({userId: operation.userId, sendOperationId: operation.id});
      processed += 1;
    } catch {
      failed += 1;
    }
  }
  return {processed, failed};
}

type TemporalReconciliationStore = Pick<TemporalRepository, 'listDueUserIds' | 'reconcileOverdue'>;
type TemporalEvidenceStore = Pick<ResponsibilityRepository, 'loadTemporalEvidence'>;

/**
 * Repairs scheduler downtime without making the scheduler authoritative. Each
 * trigger is still claimed, currentness-checked, and committed by the durable
 * Temporal repository against the latest accepted Responsibility state.
 */
export async function runTemporalReconciliation(
  temporal: TemporalReconciliationStore = new TemporalRepository(),
  evidence: TemporalEvidenceStore = new ResponsibilityRepository(),
  limit = 20,
  now = new Date()
): Promise<{users: number; processed: number; failed: number}> {
  const userIds = await temporal.listDueUserIds(now, limit);
  let processed = 0;
  let failed = 0;
  for (const userId of userIds) {
    try {
      const results = await temporal.reconcileOverdue({
        userId,
        now,
        loadEvidence: ({contract, trigger, responsibilityId}) => evidence.loadTemporalEvidence({
          contract,
          trigger,
          responsibilityId,
          now
        })
      });
      processed += results.length;
      failed += results.filter((result) => result.status === 'FAILED').length;
    } catch {
      failed += 1;
    }
  }
  return {users: userIds.length, processed, failed};
}
