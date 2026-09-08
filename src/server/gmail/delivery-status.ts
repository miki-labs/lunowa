import {createHash} from 'node:crypto';

import type {GmailMessage, GmailMessagePart} from './types';
import {GmailProviderError} from './types';

const MAX_DSN_BYTES = 256 * 1024;
const MAX_PARTS = 256;
const MAX_DEPTH = 20;
const BASE64URL = /^[A-Za-z0-9_-]*={0,2}$/;

export type GmailFailedDeliveryStatus = {
  action: 'FAILED';
  originalMessageId: string;
  observationKey: string;
};

type PartLoader = (providerAttachmentId: string) => Promise<{data: string; size?: number}>;

function rawHeader(part: GmailMessagePart | undefined, name: string): string | undefined {
  return part?.headers?.find((candidate) => candidate.name?.toLowerCase() === name.toLowerCase())?.value;
}

export function normalizedRfcMessageId(value: string | undefined): string | undefined {
  const candidate = value?.trim();
  if (!candidate || candidate.length > 998 || /[\r\n\u0000-\u001f\u007f]/.test(candidate)) return undefined;
  return /^<[^<>\s]+>$/.test(candidate) ? candidate : undefined;
}
function partsOf(root: GmailMessagePart | undefined): GmailMessagePart[] {
  if (!root) return [];
  const result: GmailMessagePart[] = [];
  const pending: Array<{part: GmailMessagePart; depth: number}> = [{part: root, depth: 0}];
  while (pending.length > 0 && result.length < MAX_PARTS) {
    const current = pending.shift()!;
    if (current.depth > MAX_DEPTH) continue;
    result.push(current.part);
    pending.unshift(...(current.part.parts ?? []).map((part) => ({part, depth: current.depth + 1})));
  }
  return result;
}

async function bodyText(part: GmailMessagePart, loadPart?: PartLoader): Promise<string | undefined> {
  let data = part.body?.data;
  if (!data && part.body?.attachmentId && loadPart) {
    if ((part.body.size ?? 0) > MAX_DSN_BYTES) return undefined;
    try {
      const loaded = await loadPart(part.body.attachmentId);
      if ((loaded.size ?? 0) > MAX_DSN_BYTES) return undefined;
      data = loaded.data;
    } catch (error) {
      if (error instanceof GmailProviderError && [403, 404, 451].includes(error.status)) return undefined;
      throw error;
    }
  }
  if (!data || !BASE64URL.test(data)) return undefined;
  const bytes = Buffer.from(data, 'base64url');
  if (bytes.length > MAX_DSN_BYTES) return undefined;
  return bytes.toString('utf8').replace(/\0/g, '');
}

function unfoldedHeader(text: string, name: string): string | undefined {
  const unfolded = text.replace(/\r?\n[ \t]+/g, ' ');
  const match = unfolded.match(new RegExp(`(?:^|\\r?\\n)${name}\\s*:\\s*([^\\r\\n]+)`, 'i'));
  return match?.[1]?.trim();
}
function observationKey(providerMessageId: string, originalMessageId: string): string {
  const digest = createHash('sha256')
    .update('gmail:dsn-failed\0')
    .update(providerMessageId)
    .update('\0')
    .update(originalMessageId)
    .digest('hex');
  return `gmail:dsn-failed:${digest}`;
}

export async function extractGmailFailedDeliveryStatus(
  message: GmailMessage,
  loadPart?: PartLoader
): Promise<GmailFailedDeliveryStatus | undefined> {
  const rootType = message.payload?.mimeType?.trim().toLowerCase();
  const contentType = rawHeader(message.payload, 'Content-Type')?.toLowerCase() ?? '';
  if (rootType !== 'multipart/report' || !/report-type\s*=\s*"?delivery-status\b/.test(contentType)) return undefined;

  const parts = partsOf(message.payload);
  const statusPart = parts.find((part) => part.mimeType?.toLowerCase() === 'message/delivery-status');
  if (!statusPart) return undefined;
  const statusText = await bodyText(statusPart, loadPart);
  if (!statusText || !/(?:^|\r?\n)Action\s*:\s*failed\s*(?:\r?\n|$)/i.test(statusText)) return undefined;

  const returned = parts.filter((part) => ['message/rfc822', 'text/rfc822-headers'].includes(part.mimeType?.toLowerCase() ?? ''));
  for (const part of returned) {
    const text = await bodyText(part, loadPart);
    const originalMessageId = normalizedRfcMessageId(text ? unfoldedHeader(text, 'Message-ID') : undefined);
    if (!originalMessageId) continue;
    return {action: 'FAILED', originalMessageId, observationKey: observationKey(message.id, originalMessageId)};
  }
  return undefined;
}
