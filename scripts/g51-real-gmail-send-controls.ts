import {createHash} from 'node:crypto';
import {mkdir, open, readFile} from 'node:fs/promises';
import {join} from 'node:path';

import emailAddresses from 'email-addresses';

export type RealSendLane = 'REPLY' | 'REPLY_ALL';

type ProviderEffectClaim = {
  schema: 'g51-real-send-effect-claim/v2';
  candidateSha: string;
  runId: string;
  lane: RealSendLane;
  admittedAt: string;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function flattenAddresses(
  parsed: readonly (emailAddresses.ParsedMailbox | emailAddresses.ParsedGroup)[]
): emailAddresses.ParsedMailbox[] {
  return parsed.flatMap((item) => item.type === 'group' ? item.addresses : [item]);
}

export function parseMailboxAddresses(raw: string, label: string): string[] {
  const parsed = emailAddresses.parseAddressList({input: raw, rejectTLD: false, rfc6532: true});
  invariant(parsed, `${label} is not a parseable RFC mailbox list`);
  const values = flattenAddresses(parsed).map((mailbox) => mailbox.address.trim().toLowerCase());
  invariant(values.length > 0, `${label} contains no mailbox address`);
  invariant(values.every(Boolean), `${label} contains an empty mailbox address`);
  invariant(new Set(values).size === values.length, `${label} contains duplicate mailbox addresses`);
  return values;
}

export function parseOptionalMailboxAddresses(raw: string | undefined, label: string): string[] {
  return raw?.trim() ? parseMailboxAddresses(raw, label) : [];
}

export function assertExactAddressSet(actual: readonly string[], expected: readonly string[], label: string): void {
  invariant(new Set(actual).size === actual.length, `${label} actual mailbox set contains duplicates`);
  invariant(new Set(expected).size === expected.length, `${label} expected mailbox set contains duplicates`);
  const left = [...actual].map((value) => value.toLowerCase()).sort();
  const right = [...expected].map((value) => value.toLowerCase()).sort();
  invariant(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mailbox set does not exactly match the authorized set`);
}

export function assertExactCandidateCheckout(declaredSha: string, actualHead: string, porcelainStatus: string): void {
  invariant(/^[0-9a-f]{40}$/.test(declaredSha), 'declared candidate SHA is not an exact commit SHA');
  invariant(actualHead.trim().toLowerCase() === declaredSha, 'declared candidate SHA does not match the executing checkout HEAD');
  invariant(porcelainStatus.trim() === '', 'executing candidate checkout is dirty; refusing real-provider evidence');
}

export function realSendOperationKey(candidateSha: string, runId: string, lane: RealSendLane): string {
  return `${candidateSha}:${runId}:${lane}`;
}

function providerEffectLaneKey(candidateSha: string, lane: RealSendLane): string {
  return `${candidateSha}:${lane}`;
}

function providerEffectClaimPath(stateBase: string, candidateSha: string, lane: RealSendLane): string {
  return join(stateBase, 'lunowa', 'g51-real-send', `${digest(providerEffectLaneKey(candidateSha, lane))}.json`);
}

function parseProviderEffectClaim(raw: string): ProviderEffectClaim {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('PROVIDER_EFFECT_CLAIM_UNREADABLE');
  }
  invariant(value && typeof value === 'object', 'PROVIDER_EFFECT_CLAIM_INVALID');
  const claim = value as Partial<ProviderEffectClaim>;
  invariant(claim.schema === 'g51-real-send-effect-claim/v2', 'PROVIDER_EFFECT_CLAIM_INVALID');
  invariant(typeof claim.candidateSha === 'string' && /^[0-9a-f]{40}$/.test(claim.candidateSha), 'PROVIDER_EFFECT_CLAIM_INVALID');
  invariant(typeof claim.runId === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(claim.runId), 'PROVIDER_EFFECT_CLAIM_INVALID');
  invariant(claim.lane === 'REPLY' || claim.lane === 'REPLY_ALL', 'PROVIDER_EFFECT_CLAIM_INVALID');
  invariant(typeof claim.admittedAt === 'string' && claim.admittedAt.length > 0, 'PROVIDER_EFFECT_CLAIM_INVALID');
  return claim as ProviderEffectClaim;
}

async function readProviderEffectClaim(
  stateBase: string,
  metadata: {candidateSha: string; lane: RealSendLane}
): Promise<ProviderEffectClaim | null> {
  const path = providerEffectClaimPath(stateBase, metadata.candidateSha, metadata.lane);
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw new Error('PROVIDER_EFFECT_CLAIM_UNREADABLE');
  }
  const claim = parseProviderEffectClaim(raw);
  invariant(claim.candidateSha === metadata.candidateSha && claim.lane === metadata.lane, 'PROVIDER_EFFECT_CLAIM_BINDING_MISMATCH');
  return claim;
}

export async function assertReconcileRunMatchesAdmittedEffect(
  stateBase: string,
  metadata: {candidateSha: string; runId: string; lane: RealSendLane}
): Promise<void> {
  const claim = await readProviderEffectClaim(stateBase, metadata);
  if (!claim) return;
  invariant(claim.runId === metadata.runId, 'RECONCILE_RUN_ID_MISMATCH_WITH_ADMITTED_EFFECT');
}

export async function claimProviderEffect(
  stateBase: string,
  metadata: {candidateSha: string; runId: string; lane: RealSendLane}
): Promise<void> {
  const directory = join(stateBase, 'lunowa', 'g51-real-send');
  await mkdir(directory, {recursive: true, mode: 0o700});
  const path = providerEffectClaimPath(stateBase, metadata.candidateSha, metadata.lane);
  const claim: ProviderEffectClaim = {
    schema: 'g51-real-send-effect-claim/v2',
    ...metadata,
    admittedAt: new Date().toISOString()
  };
  try {
    const handle = await open(path, 'wx', 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(claim)}\n`);
    } finally {
      await handle.close();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      const prior = await readFile(path, 'utf8').catch(() => '');
      const priorHash = prior ? digest(prior) : 'unreadable';
      throw new Error(`SEND_ONCE_ALREADY_ADMITTED:${priorHash}; use G51_REAL_MODE=RECONCILE_ONLY for this exact candidate/lane`);
    }
    throw error;
  }
}
