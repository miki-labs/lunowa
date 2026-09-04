import {createHash} from 'node:crypto';

import type {NormalizedAttachment, NormalizedParticipant} from '@/server/evidence/normalized';

import type {GmailMessage, GmailMessagePart} from './types';

const MAX_TEXT_BODY_BYTES = 2 * 1024 * 1024;
const MAX_HEADER_CHARS = 16_384;
const MAX_MIME_PARTS = 1_000;
const PROVIDER_ID = /^[A-Za-z0-9_-]{1,1024}$/;
const MIME_TYPE = /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/;
const UNSAFE_METADATA_CHARACTERS = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g;
const HAS_UNSAFE_METADATA_CHARACTERS = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/;

function deterministicUuid(value: string): string {
  const bytes = createHash('sha256').update(value, 'utf8').digest().subarray(0, 16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function cleanMetadata(value: string, maxLength: number): string {
  return value
    .normalize('NFC')
    .replace(UNSAFE_METADATA_CHARACTERS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function header(part: GmailMessagePart | undefined, name: string, rejectControls = false): string | undefined {
  const value = part?.headers?.find((candidate) => candidate.name?.toLowerCase() === name.toLowerCase())?.value;
  if (value === undefined) return undefined;
  if (value.length > MAX_HEADER_CHARS || (rejectControls && HAS_UNSAFE_METADATA_CHARACTERS.test(value))) {
    throw new Error(`Gmail ${name} header contains unsafe metadata.`);
  }
  return value;
}

function splitAddresses(value: string): string[] {
  const result: string[] = [];
  let current = '';
  let quoted = false;
  for (const character of value) {
    if (character === '"') quoted = !quoted;
    if (character === ',' && !quoted) {
      if (current.trim()) result.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function parseAddress(value: string): NormalizedParticipant {
  const angle = value.match(/^(.*?)<([^<>]+@[^<>]+)>\s*$/);
  if (angle) {
    const email = angle[2]!.trim().toLowerCase();
    if (!isSafeMailboxAddress(email)) throw new Error('Gmail message contains an invalid participant address.');
    return {
      email,
      displayName: cleanMetadata(angle[1]!.trim().replace(/^"|"$/g, ''), 512) || undefined
    };
  }
  const email = value.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+/i)?.[0];
  if (!email || !isSafeMailboxAddress(email)) throw new Error('Gmail message contains an invalid participant address.');
  return {email: email.toLowerCase()};
}

export function isSafeMailboxAddress(value: string): boolean {
  if (value.length > 320 || /\s|[\u0000-\u001f\u007f]/.test(value)) return false;
  const at = value.lastIndexOf('@');
  if (at < 1 || at !== value.indexOf('@') || at > 64) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  return domain.length <= 253 && domain.split('.').every((label) =>
    label.length >= 1 && label.length <= 63 && /^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(label)
  );
}

function addresses(part: GmailMessagePart | undefined, name: string): NormalizedParticipant[] {
  const value = header(part, name, true);
  return value ? splitAddresses(value).map(parseAddress) : [];
}

function decodeBody(data: string | undefined): string | undefined {
  if (!data) return undefined;
  const bytes = Buffer.from(data, 'base64url');
  if (bytes.length > MAX_TEXT_BODY_BYTES) return undefined;
  return bytes.toString('utf8').replace(/\0/g, '');
}

function walkParts(part: GmailMessagePart | undefined): GmailMessagePart[] {
  if (!part) return [];
  const result: GmailMessagePart[] = [];
  const pending: {part: GmailMessagePart; depth: number}[] = [{part, depth: 0}];
  while (pending.length > 0) {
    const current = pending.shift()!;
    if (current.depth > 30 || result.length >= MAX_MIME_PARTS) {
      throw new Error('Gmail message MIME structure exceeds safe bounds.');
    }
    result.push(current.part);
    pending.unshift(...(current.part.parts ?? []).map((child) => ({part: child, depth: current.depth + 1})));
  }
  return result;
}

function safeFilename(value: string | undefined, fallback: string): string {
  const segments = cleanMetadata(value ?? '', 1024).split(/[\\/]+/);
  const normalized = (segments.at(-1) ?? '').replace(/^\.+/, '').trim();
  return normalized || fallback;
}

function safeMimeType(value: string | undefined): string {
  const normalized = value?.trim().toLowerCase() ?? '';
  return MIME_TYPE.test(normalized) ? normalized : 'application/octet-stream';
}

function normalizedAttachments(message: GmailMessage): NormalizedAttachment[] {
  return walkParts(message.payload)
    .filter((part) => Boolean(part.body?.attachmentId))
    .map((part) => {
      const providerAttachmentId = part.body!.attachmentId!;
      if (!PROVIDER_ID.test(providerAttachmentId)) throw new Error('Gmail attachment has an invalid provider ID.');
      const fallbackPart = part.partId && PROVIDER_ID.test(part.partId) ? part.partId : providerAttachmentId.slice(0, 12);
      return {
        providerAttachmentId,
        filename: safeFilename(part.filename, `attachment-${fallbackPart}`),
        mimeType: safeMimeType(part.mimeType),
        sizeBytes: Number.isSafeInteger(part.body?.size) && part.body!.size! >= 0 ? part.body?.size : undefined,
        contentDisposition: 'attachment',
        contentReference: `gmail://${encodeURIComponent(message.id)}/${encodeURIComponent(providerAttachmentId)}`,
        previewState: 'PROVIDER_FETCH_REQUIRED'
      };
    });
}

function textBody(message: GmailMessage): string | undefined {
  const parts = walkParts(message.payload);
  const plain = parts.find((part) => part.mimeType?.toLowerCase() === 'text/plain' && part.body?.data);
  if (plain) return decodeBody(plain.body?.data);
  if (message.payload?.mimeType?.toLowerCase() === 'text/plain') {
    return decodeBody(message.payload.body?.data);
  }
  return undefined;
}

export function normalizeGmailMessage(input: {
  userId: string;
  connectedAccountId: string;
  accountEmail: string;
  message: GmailMessage;
}) {
  const {message} = input;
  const sender = addresses(message.payload, 'From')[0];
  if (!sender) throw new Error('Gmail message has no sender evidence.');
  if (!PROVIDER_ID.test(message.id) || !PROVIDER_ID.test(message.threadId) || !message.internalDate) {
    throw new Error('Gmail message is missing provider identity or chronology.');
  }
  const occurredAt = new Date(Number(message.internalDate));
  if (Number.isNaN(occurredAt.getTime())) throw new Error('Gmail message has invalid chronology.');
  const providerThreadId = message.threadId;
  const subject = cleanMetadata(header(message.payload, 'Subject') ?? '', 2048) || '(no subject)';
  const labels = [...(message.labelIds ?? [])]
    .filter((label) => PROVIDER_ID.test(label))
    .sort();

  return {
    userId: input.userId,
    connectedAccountId: input.connectedAccountId,
    conversation: {
      id: deterministicUuid(`gmail:${input.connectedAccountId}:thread:${providerThreadId}`),
      providerThreadId,
      normalizedSubject: subject
    },
    providerMessageId: message.id,
    providerThreadId,
    direction:
      sender.email.trim().toLowerCase() === input.accountEmail.trim().toLowerCase()
        ? 'OUTBOUND' as const
        : 'INBOUND' as const,
    sender,
    recipients: addresses(message.payload, 'To'),
    cc: addresses(message.payload, 'Cc'),
    bcc: addresses(message.payload, 'Bcc'),
    subject,
    textBody: textBody(message),
    occurredAt,
    providerReceivedAt: occurredAt,
    readState: labels.includes('UNREAD') ? 'UNREAD' : 'READ',
    mailboxStateSnapshot: {labelIds: labels},
    rawProviderMetadata: {
      gmailHistoryId: message.historyId ?? null,
      snippet: message.snippet ? cleanMetadata(message.snippet, 4096) : null
    },
    attachments: normalizedAttachments(message)
  };
}
