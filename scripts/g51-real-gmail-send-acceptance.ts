import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {homedir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  assertExactAddressSet,
  assertExactCandidateCheckout,
  assertReconcileRunMatchesAdmittedEffect,
  claimProviderEffect,
  parseMailboxAddresses,
  parseOptionalMailboxAddresses,
  realSendOperationKey,
  type RealSendLane
} from './g51-real-gmail-send-controls';
import {GoogleGmailClient} from '../src/server/gmail/provider-client';
import {buildGmailTextMime, type SendSnapshot} from '../src/server/gmail/send';
import {GmailProviderError, type GmailMessage} from '../src/server/gmail/types';

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

function optionalHeader(message: GmailMessage, name: string): string | undefined {
  return message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value?.trim();
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

function assertExecutingExactCandidate(candidateSha: string): void {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const actualHead = execFileSync('git', ['-C', repositoryRoot, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
  const status = execFileSync('git', ['-C', repositoryRoot, 'status', '--porcelain=v1', '--untracked-files=all'], {encoding: 'utf8'});
  assertExactCandidateCheckout(candidateSha, actualHead, status);
}

const lane = oneOf<RealSendLane>('G51_REAL_LANE', ['REPLY', 'REPLY_ALL']);
const executionMode = oneOf<ExecutionMode>('G51_REAL_MODE', ['SEND_ONCE', 'RECONCILE_ONLY']);
if (executionMode === 'SEND_ONCE') {
  assert(required('G51_ALLOW_REAL_SEND') === 'YES', 'G51_ALLOW_REAL_SEND must equal YES; refusing any provider send.');
}
const candidateSha = required('G51_CANDIDATE_SHA');
assert(/^[0-9a-f]{40}$/.test(candidateSha), 'G51_CANDIDATE_SHA must be an exact commit SHA.');
assertExecutingExactCandidate(candidateSha);
const evidenceReference = required('G51_EXTERNAL_EVIDENCE_REFERENCE');
assert(/^[A-Za-z0-9._:/#-]{1,200}$/.test(evidenceReference), 'G51_EXTERNAL_EVIDENCE_REFERENCE has unsafe characters.');
const runId = required('G51_REAL_RUN_ID');
assert(/^[A-Za-z0-9._-]{1,80}$/.test(runId), 'G51_REAL_RUN_ID has unsafe characters.');
const sourceMessageId = required('G51_REAL_SOURCE_MESSAGE_ID');
const targetThreadId = required('G51_REAL_THREAD_ID');
const allowedRecipients = new Set(addresses('G51_REAL_ALLOWED_RECIPIENTS_JSON'));
const to = lane === 'REPLY' ? addresses('G51_REAL_REPLY_TO_JSON') : addresses('G51_REAL_REPLY_ALL_TO_JSON');
const cc = lane === 'REPLY_ALL' ? addresses('G51_REAL_REPLY_ALL_CC_JSON', true) : [];
const targets = [...to, ...cc];
assert(new Set(targets).size === targets.length, 'configured To/Cc recipient sets overlap');
const stateBase = process.env.XDG_STATE_HOME?.trim() || join(homedir(), '.local', 'state');
if (executionMode === 'RECONCILE_ONLY') {
  await assertReconcileRunMatchesAdmittedEffect(stateBase, {candidateSha, runId, lane});
}

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
const sourceFrom = parseMailboxAddresses(header(source, 'From'), 'prepared source From');
assert(sourceFrom.length === 1, 'real-send acceptance requires exactly one prepared inbound source sender');
const sourceSender = sourceFrom[0]!;
assert(sourceSender !== accountEmail, 'real-send acceptance requires an inbound prepared source message');
const sourceTo = parseMailboxAddresses(header(source, 'To'), 'prepared source To');
const sourceCc = parseOptionalMailboxAddresses(optionalHeader(source, 'Cc'), 'prepared source Cc');
const sourceSubject = header(source, 'Subject');
const observedRecipientSet = new Set([...sourceFrom, ...sourceTo, ...sourceCc]);
assert(targets.every((email) => allowedRecipients.has(email)), 'configured recipient is outside G51_REAL_ALLOWED_RECIPIENTS_JSON');
assert(targets.every((email) => email !== accountEmail), 'real-send acceptance refuses to target the connected account itself');
assert(targets.every((email) => observedRecipientSet.has(email)), 'configured recipient is not an exact provider-observed From/To/Cc mailbox');
if (lane === 'REPLY') {
  assert(to.length === 1 && to[0] === sourceSender, 'Reply target must be the exact prepared inbound source sender');
  assert(cc.length === 0, 'Reply acceptance must not add Cc recipients');
} else {
  assert(to.includes(sourceSender), 'Reply All must retain the exact prepared inbound source sender');
  assert(new Set(targets).size > 1, 'Reply All acceptance must exercise at least one additional observed recipient');
}

const operationKey = realSendOperationKey(candidateSha, runId, lane);
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

let providerMessageId: string;
let sentThisRun = false;
if (executionMode === 'RECONCILE_ONLY') {
  providerMessageId = required('G51_REAL_PROVIDER_MESSAGE_ID');
} else {
  await claimProviderEffect(stateBase, {candidateSha, runId, lane});
  try {
    const accepted = await client.sendMessage(refreshed.accessToken, {raw: built.raw, threadId: built.threadId});
    assert(accepted.id && accepted.threadId === targetThreadId, `${lane} messages.send did not return the intended thread`);
    providerMessageId = accepted.id;
    sentThisRun = true;
  } catch (error) {
    const code = error instanceof GmailProviderError ? error.code : 'provider_transport_or_acceptance_unknown';
    throw new Error(`AMBIGUOUS_PROVIDER_EFFECT:${code}; do not rerun SEND_ONCE for this exact candidate/lane; reconcile only after independently confirming the provider Message.id`);
  }
}
const reconciled = await client.getMessage(refreshed.accessToken, providerMessageId);
assert(reconciled.threadId === targetThreadId, `${lane} Gmail message did not land in the intended thread`);
assert(/^<[^<>\s]+>$/.test(header(reconciled, 'Message-ID')), `${lane} Gmail message is missing a valid final RFC Message-ID`);
const originalRfcMessageId = header(source, 'Message-ID');
assert(header(reconciled, 'In-Reply-To') === originalRfcMessageId, `${lane} Gmail message lost the intended In-Reply-To identity`);
assert(header(reconciled, 'References').includes(originalRfcMessageId), `${lane} Gmail message lost the intended References chain`);
assert(header(reconciled, 'Subject').trim().toLowerCase() === snapshot.subject.trim().toLowerCase(), `${lane} Gmail message subject changed across provider acceptance`);
const reconciledTo = parseMailboxAddresses(header(reconciled, 'To'), `${lane} reconciled To`);
const reconciledCc = parseOptionalMailboxAddresses(optionalHeader(reconciled, 'Cc'), `${lane} reconciled Cc`);
const reconciledBcc = parseOptionalMailboxAddresses(optionalHeader(reconciled, 'Bcc'), `${lane} reconciled Bcc`);
assertExactAddressSet(reconciledTo, to, `${lane} To`);
assertExactAddressSet(reconciledCc, cc, `${lane} Cc`);
assert(reconciledBcc.length === 0, `${lane} reconciled message unexpectedly contains Bcc recipients`);

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
  replaySafety: 'exact-candidate/lane durable local effect claim + admitted-run reconcile-only recovery',
  secretsRecipientsOrMailboxContentEmitted: false
}, null, 2)}\n`);
