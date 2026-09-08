import {createHash} from 'node:crypto';
import {mkdir, open, readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';

import {GoogleGmailClient} from '../src/server/gmail/provider-client';
import {buildGmailTextMime, type SendSnapshot} from '../src/server/gmail/send';
import type {GmailMessage} from '../src/server/gmail/types';

type Lane = 'REPLY' | 'REPLY_ALL';
type ExecutionMode = 'SEND_ONCE' | 'RECONCILE_ONLY';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; the real-send acceptance has no mock fallback.`);
  return value;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function oneOf<T extends string>(name: string, allowed: readonly T[]): T {
  const value = required(name);
  assert((allowed as readonly string[]).includes(value), `${name} must be one of ${allowed.join(', ')}`);
  return value as T;
}

function header(message: GmailMessage, name: string): string {
  const value = message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value?.trim();
  assert(value, `prepared Gmail source is missing ${name}`);
  return value;
}

function addresses(name: string, allowEmpty = false): string[] {
  const raw = required(name);
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error(`${name} must be a JSON array of email addresses`); }
  assert(Array.isArray(parsed), `${name} must be a JSON array`);
  const values = parsed.map((item) => String(item).trim().toLowerCase());
  if (!allowEmpty) assert(values.length > 0, `${name} must not be empty`);
  assert(new Set(values).size === values.length, `${name} contains duplicate addresses`);
  assert(values.every((value) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)), `${name} contains an invalid address`);
  return values;
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

async function claimProviderEffect(operationKey: string, metadata: {candidateSha: string; runId: string; lane: Lane}): Promise<void> {
  const base = process.env.XDG_STATE_HOME?.trim() || join(homedir(), '.local', 'state');
  const directory = join(base, 'lunowa', 'g51-real-send');
  await mkdir(directory, {recursive: true, mode: 0o700});
  const path = join(directory, `${digest(operationKey)}.json`);
  try {
    const handle = await open(path, 'wx', 0o600);
    try {
      await handle.writeFile(`${JSON.stringify({...metadata, admittedAt: new Date().toISOString()})}\n`);
    } finally {
      await handle.close();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      const prior = await readFile(path, 'utf8').catch(() => '');
      const priorHash = prior ? digest(prior) : 'unreadable';
      throw new Error(`SEND_ONCE_ALREADY_ADMITTED:${priorHash}; use G51_REAL_MODE=RECONCILE_ONLY for this candidate/run/lane`);
    }
    throw error;
  }
}

const lane = oneOf<Lane>('G51_REAL_LANE', ['REPLY', 'REPLY_ALL']);
const executionMode = oneOf<ExecutionMode>('G51_REAL_MODE', ['SEND_ONCE', 'RECONCILE_ONLY']);
if (executionMode === 'SEND_ONCE') {
  assert(required('G51_ALLOW_REAL_SEND') === 'YES', 'G51_ALLOW_REAL_SEND must equal YES; refusing any provider send.');
}
const candidateSha = required('G51_CANDIDATE_SHA');
assert(/^[0-9a-f]{40}$/.test(candidateSha), 'G51_CANDIDATE_SHA must be an exact commit SHA.');
const evidenceReference = required('G51_EXTERNAL_EVIDENCE_REFERENCE');
assert(/^[A-Za-z0-9._:/#-]{1,200}$/.test(evidenceReference), 'G51_EXTERNAL_EVIDENCE_REFERENCE has unsafe characters.');
const runId = required('G51_REAL_RUN_ID');
assert(/^[A-Za-z0-9._-]{1,80}$/.test(runId), 'G51_REAL_RUN_ID has unsafe characters.');
const sourceMessageId = required('G51_REAL_SOURCE_MESSAGE_ID');
const targetThreadId = required('G51_REAL_THREAD_ID');
const allowedRecipients = new Set(addresses('G51_REAL_ALLOWED_RECIPIENTS_JSON'));
const to = lane === 'REPLY' ? addresses('G51_REAL_REPLY_TO_JSON') : addresses('G51_REAL_REPLY_ALL_TO_JSON');
const cc = lane === 'REPLY_ALL' ? addresses('G51_REAL_REPLY_ALL_CC_JSON', true) : [];

const client = new GoogleGmailClient({
  clientId: required('G51_REAL_GOOGLE_CLIENT_ID'),
  clientSecret: required('G51_REAL_GOOGLE_CLIENT_SECRET'),
  redirectUri: 'https://evidence.invalid/oauth/callback'
});
const refreshed = await client.refresh(required('G51_REAL_GOOGLE_REFRESH_TOKEN'));
assert(refreshed.accessToken && refreshed.expiresAt > Date.now(), 'real OAuth refresh did not return a live access token');
const profile = await client.getProfile(refreshed.accessToken);
const accountEmail = profile.emailAddress.trim().toLowerCase();
const source = await client.getMessage(refreshed.accessToken, sourceMessageId);
assert(source.threadId === targetThreadId, 'prepared source message is not in G51_REAL_THREAD_ID');
const sourceFrom = header(source, 'From').toLowerCase();
assert(!sourceFrom.includes(accountEmail), 'real-send acceptance requires an inbound prepared source message');
const sourceSubject = header(source, 'Subject');
const observedRecipientContext = [sourceFrom, header(source, 'To'), source.payload?.headers?.find((item) => item.name?.toLowerCase() === 'cc')?.value ?? ''].join('\n').toLowerCase();
const targets = [...to, ...cc];
assert(targets.every((email) => allowedRecipients.has(email)), 'configured recipient is outside G51_REAL_ALLOWED_RECIPIENTS_JSON');
assert(targets.every((email) => email !== accountEmail), 'real-send acceptance refuses to target the connected account itself');
assert(targets.every((email) => observedRecipientContext.includes(email)), 'configured recipient is not present in the prepared source From/To/Cc context');
if (lane === 'REPLY') {
  assert(to.length === 1 && sourceFrom.includes(to[0]!), 'Reply target must be the prepared inbound source sender');
  assert(cc.length === 0, 'Reply acceptance must not add Cc recipients');
} else {
  const replySender = [...allowedRecipients].find((email) => sourceFrom.includes(email));
  assert(replySender && to.includes(replySender), 'Reply All must retain the prepared inbound source sender');
  assert(new Set(targets).size > 1, 'Reply All acceptance must exercise at least one additional observed recipient');
}

const operationKey = `${candidateSha}:${runId}:${lane}`;
const snapshot: SendSnapshot = {
  draftId: `real-${runId}-${lane.toLowerCase()}`,
  draftVersion: 1,
  userId: 'real-provider-evidence',
  connectedAccountId: 'real-provider-evidence',
  sender: {email: accountEmail, displayName: null},
  conversationId: `real-thread-${digest(targetThreadId)}`,
  inReplyToMessageId: `real-source-${digest(sourceMessageId)}`,
  mode: lane,
  recipients: to.map((email) => ({email, displayName: null})),
  cc: cc.map((email) => ({email, displayName: null})),
  bcc: [],
  subject: /^re\s*:/i.test(sourceSubject) ? sourceSubject : `Re: ${sourceSubject}`,
  bodyFormat: 'TEXT',
  body: `Lunowa G51 real-provider acceptance ${runId} ${lane}.`,
  replyContext: {providerThreadId: targetThreadId, inReplyToProviderMessageId: sourceMessageId}
};
const built = buildGmailTextMime({sendOperationId: operationKey, snapshot, originalMessage: source});
assert(built.threadId === targetThreadId, `${lane} MIME did not preserve the prepared Gmail thread`);

const existing = await client.listMessagesByRfc822MessageId(refreshed.accessToken, built.messageId);
const ids = [...new Set((existing.messages ?? []).map((item) => item.id).filter(Boolean))];
assert(ids.length <= 1, `${lane} stable Message-ID matched multiple Gmail messages`);
let providerMessageId: string;
let sentThisRun = false;
if (ids.length === 1) {
  providerMessageId = ids[0]!;
} else {
  assert(executionMode === 'SEND_ONCE', `${lane} stable Message-ID is not visible yet; RECONCILE_ONLY performed no send`);
  await claimProviderEffect(operationKey, {candidateSha, runId, lane});
  try {
    const accepted = await client.sendMessage(refreshed.accessToken, {raw: built.raw, threadId: built.threadId});
    assert(accepted.id && accepted.threadId === targetThreadId, `${lane} messages.send did not return the intended thread`);
    providerMessageId = accepted.id;
    sentThisRun = true;
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 96) : 'unknown';
    throw new Error(`AMBIGUOUS_PROVIDER_EFFECT:${code}; do not rerun SEND_ONCE for this candidate/run/lane; use RECONCILE_ONLY`);
  }
}
const reconciled = await client.getMessage(refreshed.accessToken, providerMessageId);
assert(reconciled.threadId === targetThreadId, `${lane} Gmail message did not land in the intended thread`);
assert(header(reconciled, 'Message-ID') === built.messageId, `${lane} reconciled Message-ID does not match the stable request identity`);
const originalRfcMessageId = header(source, 'Message-ID');
assert(header(reconciled, 'In-Reply-To') === originalRfcMessageId, `${lane} Gmail message lost the intended In-Reply-To identity`);
assert(header(reconciled, 'References').includes(originalRfcMessageId), `${lane} Gmail message lost the intended References chain`);
assert(header(reconciled, 'Subject').trim().toLowerCase() === snapshot.subject.trim().toLowerCase(), `${lane} Gmail message subject changed across provider acceptance`);
const reconciledTargets = [header(reconciled, 'To'), reconciled.payload?.headers?.find((item) => item.name?.toLowerCase() === 'cc')?.value ?? ''].join('\n').toLowerCase();
assert(targets.every((email) => reconciledTargets.includes(email)), `${lane} Gmail message did not preserve the authorized target set`);

process.stdout.write(`${JSON.stringify({
  kind: 'g51-real-gmail-send-evidence-v1',
  candidateSha,
  externalEvidenceReference: evidenceReference,
  capturedAt: new Date().toISOString(),
  lane,
  executionMode,
  oauthRefresh: 'PASS',
  targetThreadIdentityHash: digest(targetThreadId),
  result: {status: 'PASS', sentThisRun, messageIdentityHash: digest(providerMessageId)},
  replaySafety: 'one-lane durable local effect claim + reconcile-only recovery',
  secretsRecipientsOrMailboxContentEmitted: false
}, null, 2)}\n`);
