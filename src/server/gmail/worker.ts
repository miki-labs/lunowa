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
