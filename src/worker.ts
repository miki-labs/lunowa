import vinext from 'vinext/server/fetch-handler';

import {runGmailReconciliation, runGmailSendReconciliation, runTemporalReconciliation} from './server/gmail/worker';

type WorkerExecutionContext = {waitUntil(promise: Promise<unknown>): void};
type VinextHandler = {
  fetch(request: Request, environment: unknown, context: unknown): Response | Promise<Response>;
};

const application = vinext as unknown as VinextHandler;

export async function runScheduledReconciliation(): Promise<void> {
  try {
    const [gmail, send, temporal] = await Promise.all([
      runGmailReconciliation(),
      runGmailSendReconciliation(),
      runTemporalReconciliation()
    ]);
    const failed = gmail.failed + send.failed + temporal.failed;
    const event = {
      event: 'scheduled_reconciliation',
      status: failed > 0 ? 'degraded' : 'ok',
      gmail: {enqueued: gmail.enqueued, processed: gmail.processed, failed: gmail.failed},
      send: {processed: send.processed, failed: send.failed},
      temporal: {users: temporal.users, processed: temporal.processed, failed: temporal.failed}
    };
    if (failed > 0) console.error(event);
    else console.log(event);
  } catch (error) {
    console.error({
      event: 'scheduled_reconciliation',
      status: 'failed',
      errorType: error instanceof Error ? error.name : 'UnknownError'
    });
    throw error;
  }
}

const worker = {
  fetch(request: Request, environment: unknown, context: unknown) {
    return application.fetch(request, environment, context);
  },
  scheduled(_controller: unknown, _environment: unknown, context: WorkerExecutionContext) {
    // The database queue owns retry/backoff and idempotency. The recurring
    // trigger independently repairs missed push and prior cron delivery.
    context.waitUntil(runScheduledReconciliation());
  }
};

export default worker;
