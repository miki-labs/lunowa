import vinext from 'vinext/server/fetch-handler';

import {runGmailReconciliation} from './server/gmail/worker';

type WorkerExecutionContext = {waitUntil(promise: Promise<unknown>): void};
type VinextHandler = {
  fetch(request: Request, environment: unknown, context: unknown): Response | Promise<Response>;
};

const application = vinext as unknown as VinextHandler;

const worker = {
  fetch(request: Request, environment: unknown, context: unknown) {
    return application.fetch(request, environment, context);
  },
  scheduled(_controller: unknown, _environment: unknown, context: WorkerExecutionContext) {
    // The database queue owns retry/backoff and idempotency. The recurring
    // trigger independently repairs missed push and prior cron delivery.
    context.waitUntil(runGmailReconciliation());
  }
};

export default worker;
