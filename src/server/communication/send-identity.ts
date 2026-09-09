import {createHash} from 'node:crypto';

/** Stable application-owned RFC Message-ID used to correlate one SendOperation
 * across provider ambiguity, Source reconciliation, and later delivery status. */
export function buildSendRfcMessageId(sendOperationId: string): string {
  const digest = createHash('sha256')
    .update(`lunowa:gmail:send:${sendOperationId}`)
    .digest('hex');
  return `<lunowa-${digest}@lunowa.invalid>`;
}
