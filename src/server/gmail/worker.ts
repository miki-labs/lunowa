import {CommunicationRepository} from '@/server/db/repositories/communication';
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
