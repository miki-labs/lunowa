import {GoogleGmailClient} from '../src/server/gmail/provider-client';
import {normalizeGmailMessage} from '../src/server/gmail/normalize';
import type {GmailHistory} from '../src/server/gmail/types';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required; real-provider evidence has no mock fallback.`);
  return value;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const candidateSha = required('G20_CANDIDATE_SHA');
const evidenceReference = required('G20_EXTERNAL_EVIDENCE_REFERENCE');
assert(/^[0-9a-f]{40}$/.test(candidateSha), 'G20_CANDIDATE_SHA must be an exact commit SHA.');
assert(/^[A-Za-z0-9._:/#-]{1,200}$/.test(evidenceReference), 'external evidence reference has unsafe characters.');

const messageId = required('G20_REAL_MESSAGE_ID');
const attachmentId = required('G20_REAL_ATTACHMENT_ID');
const startHistoryId = required('G20_REAL_START_HISTORY_ID');
const topicName = required('G20_REAL_PUBSUB_TOPIC');
const client = new GoogleGmailClient({
  clientId: required('G20_REAL_GOOGLE_CLIENT_ID'),
  clientSecret: required('G20_REAL_GOOGLE_CLIENT_SECRET'),
  redirectUri: 'https://evidence.invalid/oauth/callback'
});

const refreshed = await client.refresh(required('G20_REAL_GOOGLE_REFRESH_TOKEN'));
assert(refreshed.accessToken && refreshed.expiresAt > Date.now(), 'real OAuth refresh did not return a live access token');
const profile = await client.getProfile(refreshed.accessToken);
assert(profile.emailAddress.includes('@') && /^\d+$/.test(profile.historyId), 'real Gmail profile is invalid');

const histories: GmailHistory[] = [];
let pageToken: string | undefined;
let finalHistoryId = startHistoryId;
let pages = 0;
do {
  assert(++pages <= 20, 'real history evidence exceeded the bounded page limit');
  const page = await client.listHistory(refreshed.accessToken, startHistoryId, pageToken);
  histories.push(...(page.history ?? []));
  finalHistoryId = page.historyId ?? finalHistoryId;
  pageToken = page.nextPageToken;
} while (pageToken);
const changedIds = new Set(histories.flatMap((item) => [
  ...(item.messages ?? []).map(({id}) => id),
  ...(item.messagesAdded ?? []).map(({message}) => message.id),
  ...(item.messagesDeleted ?? []).map(({message}) => message.id),
  ...(item.labelsAdded ?? []).map(({message}) => message.id),
  ...(item.labelsRemoved ?? []).map(({message}) => message.id)
]));
assert(changedIds.has(messageId), 'real history interval did not contain the prepared evidence message');

const realMessage = await client.getMessage(refreshed.accessToken, messageId);
const normalized = normalizeGmailMessage({
  userId: '00000000-0000-4000-8000-000000000001',
  connectedAccountId: '00000000-0000-4000-8000-000000000002',
  accountEmail: profile.emailAddress,
  message: realMessage
});
assert(
  normalized.attachments.some((attachment) => attachment.providerAttachmentId === attachmentId),
  'prepared real attachment was not represented by normalization'
);
const attachment = await client.getAttachment(refreshed.accessToken, messageId, attachmentId);
const attachmentBytes = Buffer.from(attachment.data, 'base64url');
assert(attachmentBytes.length > 0 && attachmentBytes.length <= 25 * 1024 * 1024, 'real attachment fetch returned invalid evidence');

const watch = await client.watch(refreshed.accessToken, topicName);
const watchExpiration = Number(watch.expiration);
assert(/^\d+$/.test(watch.historyId) && watchExpiration > Date.now(), 'real users.watch response is invalid');

process.stdout.write(`${JSON.stringify({
  kind: 'g20-real-gmail-provider-evidence-v1',
  candidateSha,
  externalEvidenceReference: evidenceReference,
  capturedAt: new Date().toISOString(),
  oauthRefresh: 'PASS',
  profile: 'PASS',
  history: {status: 'PASS', pages, records: histories.length, advanced: finalHistoryId !== startHistoryId},
  normalization: 'PASS',
  attachment: {status: 'PASS', bytes: attachmentBytes.length},
  watch: {status: 'PASS', expiration: new Date(watchExpiration).toISOString()},
  secretsOrMailboxContentEmitted: false
}, null, 2)}\n`);
