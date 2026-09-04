import {createHash} from 'node:crypto';

import type {NormalizedAttachment, NormalizedParticipant} from '@/server/evidence/normalized';

import type {GmailMessage, GmailMessagePart} from './types';

const MAX_TEXT_BODY_BYTES = 2 * 1024 * 1024;

function deterministicUuid(value: string): string {
  const bytes = createHash('sha256').update(value, 'utf8').digest().subarray(0, 16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function header(part: GmailMessagePart | undefined, name: string): string | undefined {
  return part?.headers?.find((candidate) => candidate.name?.toLowerCase() === name.toLowerCase())?.value;
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
    return {
      email: angle[2]!.trim(),
      displayName: angle[1]!.trim().replace(/^"|"$/g, '') || undefined
    };
  }
  const email = value.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+/i)?.[0];
  if (!email) throw new Error('Gmail message contains an invalid participant address.');
  return {email};
}

function addresses(part: GmailMessagePart | undefined, name: string): NormalizedParticipant[] {
  const value = header(part, name);
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
  return [part, ...(part.parts ?? []).flatMap(walkParts)];
}

function normalizedAttachments(message: GmailMessage): NormalizedAttachment[] {
  return walkParts(message.payload)
    .filter((part) => Boolean(part.body?.attachmentId))
    .map((part) => {
      const providerAttachmentId = part.body!.attachmentId!;
      return {
        providerAttachmentId,
        filename: part.filename?.trim() || `attachment-${part.partId || providerAttachmentId.slice(0, 12)}`,
        mimeType: part.mimeType?.trim() || 'application/octet-stream',
        sizeBytes: part.body?.size,
        contentDisposition: header(part, 'Content-Disposition'),
        contentReference: `gmail://${message.id}/${providerAttachmentId}`,
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
  if (!message.id || !message.threadId || !message.internalDate) {
    throw new Error('Gmail message is missing provider identity or chronology.');
  }
  const occurredAt = new Date(Number(message.internalDate));
  if (Number.isNaN(occurredAt.getTime())) throw new Error('Gmail message has invalid chronology.');
  const providerThreadId = message.threadId;
  const subject = header(message.payload, 'Subject')?.trim() || '(no subject)';
  const labels = [...(message.labelIds ?? [])].sort();

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
      snippet: message.snippet ?? null
    },
    attachments: normalizedAttachments(message)
  };
}
