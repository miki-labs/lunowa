import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {afterEach, describe, expect, it} from 'vitest';

import {
  assertExactAddressSet,
  assertExactCandidateCheckout,
  assertReconcileRunMatchesAdmittedEffect,
  claimProviderEffect,
  parseMailboxAddresses,
  realSendOperationKey
} from '../scripts/g51-real-gmail-send-controls';

const candidateSha = 'a'.repeat(40);
const temporaryRoots: string[] = [];

async function stateRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'lunowa-g51-controls-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, {recursive: true, force: true})));
});

describe('G51 real Gmail acceptance controls', () => {
  it('binds evidence to the exact clean executing checkout', () => {
    expect(() => assertExactCandidateCheckout(candidateSha, candidateSha, '')).not.toThrow();
    expect(() => assertExactCandidateCheckout(candidateSha, 'b'.repeat(40), '')).toThrow(/does not match/);
    expect(() => assertExactCandidateCheckout(candidateSha, candidateSha, ' M scripts/g51-real-gmail-send-acceptance.ts')).toThrow(/dirty/);
  });

  it('parses mailbox identity structurally instead of authorizing header substrings', () => {
    expect(parseMailboxAddresses('"victim@example.com" <attacker@example.com>', 'From')).toEqual(['attacker@example.com']);
    expect(parseMailboxAddresses('Victim <victim@example.com.evil.test>', 'From')).toEqual(['victim@example.com.evil.test']);
    expect(parseMailboxAddresses('Team: One <one@example.com>, Two <two@example.com>;', 'To')).toEqual(['one@example.com', 'two@example.com']);
  });

  it('requires the reconciled mailbox set to equal the authorized set', () => {
    expect(() => assertExactAddressSet(['two@example.com', 'one@example.com'], ['one@example.com', 'two@example.com'], 'To')).not.toThrow();
    expect(() => assertExactAddressSet(['one@example.com', 'extra@example.com'], ['one@example.com'], 'To')).toThrow(/does not exactly match/);
    expect(() => assertExactAddressSet(['one@example.com'], ['one@example.com', 'two@example.com'], 'To')).toThrow(/does not exactly match/);
  });

  it('quarantines SEND_ONCE per exact candidate and lane even when run ID changes', async () => {
    const root = await stateRoot();
    await claimProviderEffect(root, {candidateSha, runId: 'run-a', lane: 'REPLY'});
    await expect(claimProviderEffect(root, {candidateSha, runId: 'run-b', lane: 'REPLY'})).rejects.toThrow(/SEND_ONCE_ALREADY_ADMITTED/);
    await expect(assertReconcileRunMatchesAdmittedEffect(root, {candidateSha, runId: 'run-a', lane: 'REPLY'})).resolves.toBeUndefined();
    await expect(assertReconcileRunMatchesAdmittedEffect(root, {candidateSha, runId: 'run-b', lane: 'REPLY'})).rejects.toThrow(/RECONCILE_RUN_ID_MISMATCH/);
    await expect(claimProviderEffect(root, {candidateSha, runId: 'run-b', lane: 'REPLY_ALL'})).resolves.toBeUndefined();
  });

  it('keeps stable provider Message-ID operation identity run-specific inside the lane quarantine', () => {
    expect(realSendOperationKey(candidateSha, 'run-a', 'REPLY')).not.toBe(realSendOperationKey(candidateSha, 'run-b', 'REPLY'));
  });
});
