import {createHash} from 'node:crypto';

import emailAddresses from 'email-addresses';
import iconv from 'iconv-lite';
import sanitizeHtml from 'sanitize-html';

import type {NormalizedAttachment, NormalizedParticipant} from '@/server/evidence/normalized';

import type {GmailMessage, GmailMessagePart} from './types';
import {GmailProviderError} from './types';

const MAX_TEXT_BODY_BYTES = 2 * 1024 * 1024;
const MAX_HEADER_CHARS = 16_384;
const MAX_MIME_PARTS = 1_000;
const MAX_MIME_DEPTH = 30;
const MAX_NORMALIZATION_ISSUES = 32;
const PROVIDER_ID = /^[A-Za-z0-9_-]{1,1024}$/;
const MIME_TYPE = /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/;
const BASE64URL = /^[A-Za-z0-9_-]*={0,2}$/;
const UNSAFE_METADATA_CHARACTERS = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g;
const HAS_UNSAFE_METADATA_CHARACTERS = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/;
const UNSUPPORTED_PARTICIPANT_DOMAIN = 'unsupported.invalid';

type BodyLoader = (providerAttachmentId: string) => Promise<{data: string; size?: number}>;
type BodyEvidence = {
  textBody?: string;
  sanitizedHtmlBody?: string;
  state: 'INLINE' | 'PROVIDER_FETCHED' | 'NOT_PRESENT' | 'UNSUPPORTED';
};

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

function rawHeader(part: GmailMessagePart | undefined, name: string): string | undefined {
  return part?.headers?.find((candidate) => candidate.name?.toLowerCase() === name.toLowerCase())?.value;
}

function safeHeader(part: GmailMessagePart | undefined, name: string, issues: string[]): string | undefined {
  const value = rawHeader(part, name);
  if (value === undefined) return undefined;
  if (value.length > MAX_HEADER_CHARS) issues.push(`${name.toUpperCase()}_HEADER_TRUNCATED`);
  if (HAS_UNSAFE_METADATA_CHARACTERS.test(value)) issues.push(`${name.toUpperCase()}_HEADER_UNSAFE`);
  return value.slice(0, MAX_HEADER_CHARS);
}

function flattenAddresses(
  parsed: readonly (emailAddresses.ParsedMailbox | emailAddresses.ParsedGroup)[]
): emailAddresses.ParsedMailbox[] {
  return parsed.flatMap((item) => item.type === 'group' ? item.addresses : [item]);
}

function unsupportedParticipant(headerName: string, value: string): NormalizedParticipant {
  const digest = createHash('sha256').update(`${headerName}:${value}`, 'utf8').digest('hex').slice(0, 24);
  return {
    email: `unsupported-${digest}@${UNSUPPORTED_PARTICIPANT_DOMAIN}`,
    displayName: 'Unsupported provider address',
    derivedMetadata: {providerRepresentation: 'UNSUPPORTED_RFC5322_ADDRESS'}
  };
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

function addresses(
  part: GmailMessagePart | undefined,
  name: string,
  issues: string[],
  required = false
): NormalizedParticipant[] {
  const value = safeHeader(part, name, issues);
  if (!value) {
    if (required) issues.push(`${name.toUpperCase()}_ADDRESS_MISSING`);
    return required ? [unsupportedParticipant(name, '')] : [];
  }
  if (HAS_UNSAFE_METADATA_CHARACTERS.test(value)) {
    return required ? [unsupportedParticipant(name, value)] : [];
  }
  let parsed: ReturnType<typeof emailAddresses.parseAddressList>;
  try {
    parsed = emailAddresses.parseAddressList({input: value, rfc6532: true, strict: false});
  } catch {
    parsed = null;
  }
  if (!parsed) {
    issues.push(`${name.toUpperCase()}_ADDRESS_UNSUPPORTED`);
    return required ? [unsupportedParticipant(name, value)] : [];
  }
  const result: NormalizedParticipant[] = [];
  for (const mailbox of flattenAddresses(parsed)) {
    const email = mailbox.address.trim().toLowerCase();
    if (!isSafeMailboxAddress(email)) {
      issues.push(`${name.toUpperCase()}_ADDRESS_UNSUPPORTED`);
      continue;
    }
    result.push({
      email,
      displayName: cleanMetadata(mailbox.name ?? '', 512) || undefined
    });
  }
  if (required && result.length === 0) result.push(unsupportedParticipant(name, value));
  return result;
}

function walkParts(part: GmailMessagePart | undefined): {parts: GmailMessagePart[]; truncated: boolean} {
  if (!part) return {parts: [], truncated: false};
  const result: GmailMessagePart[] = [];
  const pending: {part: GmailMessagePart; depth: number}[] = [{part, depth: 0}];
  let truncated = false;
  while (pending.length > 0 && result.length < MAX_MIME_PARTS) {
    const current = pending.shift()!;
    if (current.depth > MAX_MIME_DEPTH) {
      truncated = true;
      continue;
    }
    result.push(current.part);
    pending.unshift(...(current.part.parts ?? []).map((child) => ({part: child, depth: current.depth + 1})));
  }
  return {parts: result, truncated: truncated || pending.length > 0};
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

function contentDisposition(part: GmailMessagePart): string {
  return rawHeader(part, 'Content-Disposition')?.split(';', 1)[0]?.trim().toLowerCase() ?? '';
}

function isTextBodyPart(part: GmailMessagePart): boolean {
  const mimeType = part.mimeType?.toLowerCase();
  return (mimeType === 'text/plain' || mimeType === 'text/html') &&
    !part.filename?.trim() && contentDisposition(part) !== 'attachment';
}

function normalizedAttachments(message: GmailMessage, parts: readonly GmailMessagePart[]): NormalizedAttachment[] {
  return parts
    .filter((part) => Boolean(part.body?.attachmentId) && !isTextBodyPart(part))
    .map((part) => {
      const providerAttachmentId = part.body!.attachmentId!;
      if (!PROVIDER_ID.test(providerAttachmentId)) throw new Error('Gmail attachment has an invalid provider ID.');
      const fallbackPart = part.partId && PROVIDER_ID.test(part.partId) ? part.partId : providerAttachmentId.slice(0, 12);
      return {
        providerAttachmentId,
        filename: safeFilename(part.filename, `attachment-${fallbackPart}`),
        mimeType: safeMimeType(part.mimeType),
        sizeBytes: Number.isSafeInteger(part.body?.size) && part.body!.size! >= 0 ? part.body?.size : undefined,
        contentDisposition: contentDisposition(part) === 'inline' ? 'inline' : 'attachment',
        contentReference: `gmail://${encodeURIComponent(message.id)}/${encodeURIComponent(providerAttachmentId)}`,
        previewState: 'PROVIDER_FETCH_REQUIRED'
      };
    });
}

function charset(part: GmailMessagePart): string {
  const contentType = rawHeader(part, 'Content-Type') ?? '';
  const match = contentType.match(/(?:^|;)\s*charset\s*=\s*(?:"([^"]+)"|'([^']+)'|([^;\s]+))/i);
  const candidate = (match?.[1] ?? match?.[2] ?? match?.[3] ?? 'utf-8').trim();
  return iconv.encodingExists(candidate) ? candidate : 'utf-8';
}

function decodeBody(data: string, part: GmailMessagePart, issues: string[]): string | undefined {
  if (!BASE64URL.test(data)) {
    issues.push('BODY_ENCODING_UNSUPPORTED');
    return undefined;
  }
  const bytes = Buffer.from(data, 'base64url');
  if (bytes.length > MAX_TEXT_BODY_BYTES) {
    issues.push('BODY_TOO_LARGE');
    return undefined;
  }
  return iconv.decode(bytes, charset(part)).replace(/\0/g, '');
}

async function bodyEvidence(
  parts: readonly GmailMessagePart[],
  loadBodyPart: BodyLoader | undefined,
  issues: string[]
): Promise<BodyEvidence> {
  const candidates = parts
    .filter(isTextBodyPart)
    .sort((left, right) => Number(left.mimeType?.toLowerCase() === 'text/html') - Number(right.mimeType?.toLowerCase() === 'text/html'));
  for (const part of candidates) {
    let data = part.body?.data;
    let fetched = false;
    if (!data && part.body?.attachmentId) {
      const attachmentId = part.body.attachmentId;
      if (!PROVIDER_ID.test(attachmentId)) {
        issues.push('BODY_ATTACHMENT_ID_UNSUPPORTED');
        continue;
      }
      if ((part.body.size ?? 0) > MAX_TEXT_BODY_BYTES) {
        issues.push('BODY_TOO_LARGE');
        continue;
      }
      if (!loadBodyPart) {
        issues.push('BODY_PROVIDER_FETCH_REQUIRED');
        continue;
      }
      try {
        const loaded = await loadBodyPart(attachmentId);
        if ((loaded.size ?? 0) > MAX_TEXT_BODY_BYTES) {
          issues.push('BODY_TOO_LARGE');
          continue;
        }
        data = loaded.data;
        fetched = true;
      } catch (error) {
        if (error instanceof GmailProviderError && [403, 404, 451].includes(error.status)) {
          issues.push('BODY_PROVIDER_BLOCKED');
          continue;
        }
        throw error;
      }
    }
    if (!data) continue;
    const decoded = decodeBody(data, part, issues);
    if (decoded === undefined) continue;
    if (part.mimeType?.toLowerCase() === 'text/html') {
      const sanitized = sanitizeHtml(decoded, {
        allowedTags: ['p', 'br', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 's', 'blockquote', 'pre', 'code', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard'
      }).slice(0, MAX_TEXT_BODY_BYTES);
      return {sanitizedHtmlBody: sanitized, state: fetched ? 'PROVIDER_FETCHED' : 'INLINE'};
    }
    return {textBody: decoded, state: fetched ? 'PROVIDER_FETCHED' : 'INLINE'};
  }
  if (candidates.length === 0) issues.push('BODY_NOT_PRESENT');
  return {state: candidates.length === 0 ? 'NOT_PRESENT' : 'UNSUPPORTED'};
}

export async function normalizeGmailMessage(input: {
  userId: string;
  connectedAccountId: string;
  accountEmail: string;
  message: GmailMessage;
  loadBodyPart?: BodyLoader;
}) {
  const {message} = input;
  if (!PROVIDER_ID.test(message.id) || !PROVIDER_ID.test(message.threadId) || !message.internalDate) {
    throw new Error('Gmail message is missing provider identity or chronology.');
  }
  const occurredAt = new Date(Number(message.internalDate));
  if (Number.isNaN(occurredAt.getTime())) throw new Error('Gmail message has invalid chronology.');

  const issues: string[] = [];
  const walked = walkParts(message.payload);
  if (walked.truncated) issues.push('MIME_STRUCTURE_TRUNCATED');
  const sender = addresses(message.payload, 'From', issues, true)[0]!;
  const body = await bodyEvidence(walked.parts, input.loadBodyPart, issues);
  const providerThreadId = message.threadId;
  const subject = cleanMetadata(safeHeader(message.payload, 'Subject', issues) ?? '', 2048) || '(no subject)';
  const labels = [...(message.labelIds ?? [])]
    .filter((label) => PROVIDER_ID.test(label))
    .sort();
  const recipients = addresses(message.payload, 'To', issues);
  const cc = addresses(message.payload, 'Cc', issues);
  const bcc = addresses(message.payload, 'Bcc', issues);
  const boundedIssues = [...new Set(issues)].slice(0, MAX_NORMALIZATION_ISSUES);

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
      labels.includes('SENT') || sender.email === input.accountEmail.trim().toLowerCase()
        ? 'OUTBOUND' as const
        : 'INBOUND' as const,
    sender,
    recipients,
    cc,
    bcc,
    subject,
    textBody: body.textBody,
    sanitizedHtmlBody: body.sanitizedHtmlBody,
    occurredAt,
    providerReceivedAt: occurredAt,
    readState: labels.includes('UNREAD') ? 'UNREAD' : 'READ',
    mailboxStateSnapshot: {labelIds: labels},
    rawProviderMetadata: {
      gmailHistoryId: message.historyId ?? null,
      snippet: message.snippet ? cleanMetadata(message.snippet, 4096) : null,
      normalization: {
        status: boundedIssues.length > 0 ? 'PARTIAL' : 'COMPLETE',
        bodyState: body.state,
        unsupported: boundedIssues
      }
    },
    attachments: normalizedAttachments(message, walked.parts)
  };
}
