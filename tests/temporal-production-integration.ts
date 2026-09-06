import {readFile, readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import * as schema from '../src/server/db/schema';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import {ResponsibilityRepository} from '../src/server/db/repositories/responsibility';
import {TemporalRepository} from '../src/server/db/repositories/temporal';
import {normalizedEvidenceFixture} from '../src/server/evidence/fixtures';
import type {ObligationLeg, ResponsibilityState, TrustedResponsibilityCommand, UpsertTemporalContractInput} from '../src/server/responsibility';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G32_DATABASE_URL;
assert(databaseUrl, 'G32_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({connectionString: databaseUrl, max: 6, application_name: 'lunowa-g32-temporal'});
const database = drizzle(pool, {schema});
const evidenceRepository = new EvidenceRepository(database);
const responsibilityRepository = new ResponsibilityRepository(database);
const temporalRepository = new TemporalRepository(database);

const userId = randomUUID();
const accountId = randomUUID();
const conversationId = randomUUID();
let messageId: string;

const otherPartyLeg = (id: string): ObligationLeg => ({
  id,
  bearer: 'OTHER_PARTY',
  actionCode: 'SEND_RESULT',
  status: 'OPEN',
  actionability: 'BLOCKED',
  basisKind: 'COMMUNICATED_REQUEST',
  provenance: []
});

function stateFrom(result: Awaited<ReturnType<ResponsibilityRepository['applyTrustedCommand']>>): ResponsibilityState {
  assert(result.status === 'APPLIED', result.status === 'APPLIED' ? 'unexpected applied result' : result.reason);
  const state = result.effects[0]?.state;
  assert(state, 'expected a Responsibility state');
  return state;
}

function candidate(overrides: Partial<TrustedResponsibilityCommand> = {}): TrustedResponsibilityCommand {
  return {
    commandSource: 'TRUSTED_SYSTEM',
    userId,
    connectedAccountId: accountId,
    conversationId,
    sourceEventKey: 'g32-initial',
    candidateKey: 'g32-initial',
    applicationKey: 'g32-initial',
    evidenceRevision: 1,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP']},
    operationalOutcome: 'obtain the requested result',
    obligationLegs: [{...otherPartyLeg(randomUUID()), provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId}]}],
    provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId}],
    ...overrides
  };
}

function contractInput(responsibilityId: string, now: Date, triggerIds: string[]): UpsertTemporalContractInput {
  return {
    userId,
    connectedAccountId: accountId,
    responsibilityId,
    contractKind: 'PASSIVE_WAITING',
    createdBy: 'USER',
    returnCondition: {kind: 'TIME', label: 'reconsider current evidence'},
    triggers: triggerIds.map((id) => ({id, triggerType: 'TIME', triggerAt: now.toISOString()})),
    now
  };
}

async function migrate(): Promise<void> {
  const files = (await readdir(resolve(import.meta.dirname, '../drizzle/migrations')))
    .filter((name) => /^\d{4}_.*\.sql$/.test(name))
    .sort();
  assert(files.length >= 4, `expected the current production migration chain, got ${files.join(', ')}`);
  for (const file of files) await pool.query(await readFile(resolve(import.meta.dirname, `../drizzle/migrations/${file}`), 'utf8'));
}

async function evidence(): Promise<{evidenceRevision: number; references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED'; messageId: string}]; userAttentionNeeded: boolean}> {
  return {evidenceRevision: 1, references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId}], userAttentionNeeded: true};
}

try {
  const version = await pool.query<{server_version_num: string}>("SELECT current_setting('server_version_num') AS server_version_num");
  assert(version.rows[0]?.server_version_num === '180006', 'G32 integration requires PostgreSQL 18.6.');
  const tables = await pool.query<{table_name: string}>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  assert(tables.rowCount === 0, 'G32 integration requires a clean database.');
  await migrate();

  await pool.query(`INSERT INTO "user" (id, name, email) VALUES ($1, 'G32 temporal user', $2)`, [userId, `g32-${userId}@example.invalid`]);
  await pool.query(
    `INSERT INTO connected_accounts (id, user_id, provider, provider_account_id, email_address, credential_reference)
     VALUES ($1, $2, 'fixture-provider', 'g32-account', 'g32@example.invalid', 'credential-ref:g32')`,
    [accountId, userId]
  );
  const normalized = await evidenceRepository.upsertNormalizedMessage(normalizedEvidenceFixture(userId, accountId, {
    conversation: {id: conversationId, providerThreadId: 'g32-thread', normalizedSubject: 'G32 temporal fixture', semanticTopic: 'G32 temporal fixture'},
    providerMessageId: 'g32-message',
    subject: 'G32 temporal fixture'
  }));
  messageId = normalized.messageId;
  assert(normalized.evidenceRevision === 1 && normalized.changed, 'G32 evidence fixture was not admitted as the current basis.');

  const initial = stateFrom(await responsibilityRepository.applyTrustedCommand(candidate()));
  const now = new Date('2026-09-06T00:00:00.000Z');
  const deferredTriggerInputId = randomUUID();
  const deferredContractInput = contractInput(initial.id, now, [deferredTriggerInputId]);
  const deferred = await temporalRepository.deferAttention({
    state: initial,
    requestKey: 'g32-defer',
    contract: deferredContractInput
  });
  assert(deferred.state.attentionMode === 'DEFERRED', 'durable defer did not update Responsibility state.');
  const deferredRow = await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id});
  assert(deferredRow?.state.attentionMode === 'DEFERRED', 'defer was not durable after repository reload.');
  const repeatedDefer = await temporalRepository.deferAttention({state: initial, requestKey: 'g32-defer', contract: deferredContractInput});
  assert(repeatedDefer.contract.id === deferred.contract.id, 'duplicate defer did not replay the same durable contract.');
  const repeatedCounts = await pool.query<{contracts: string; triggers: string}>(
    `SELECT
       (SELECT count(*) FROM temporal_contracts WHERE responsibility_id = $1)::text AS contracts,
       (SELECT count(*) FROM temporal_triggers WHERE temporal_contract_id = $2)::text AS triggers`,
    [initial.id, deferred.contract.id]
  );
  assert(repeatedCounts.rows[0]?.contracts === '1' && repeatedCounts.rows[0]?.triggers === '1', 'duplicate defer created duplicate durable work.');

  // A coupled-operation failure must roll back the contract as well as the
  // Responsibility mutation. This injects the failure after contract intent
  // has been staged, through the same transaction-scoped seam production uses.
  const internal = temporalRepository as unknown as {
    responsibilityRepository: ResponsibilityRepository;
    retireActiveContractsInTransaction: (...args: unknown[]) => Promise<void>;
  };
  const originalApply = internal.responsibilityRepository.applyTrustedCommandInTransaction;
  internal.responsibilityRepository.applyTrustedCommandInTransaction = async () => { throw new Error('injected coupled-operation failure'); };
  await temporalRepository.deferAttention({state: deferred.state, requestKey: 'g32-defer-fails', contract: contractInput(initial.id, now, [randomUUID()])}).then(
    () => { throw new Error('injected coupled-operation failure was swallowed'); },
    (error: unknown) => assert(error instanceof Error && error.message === 'injected coupled-operation failure', 'unexpected coupled-operation failure')
  );
  internal.responsibilityRepository.applyTrustedCommandInTransaction = originalApply;
  const activeAfterRollback = await pool.query<{count: string}>(`SELECT count(*)::text AS count FROM temporal_contracts WHERE responsibility_id = $1 AND contract_status = 'ACTIVE'`, [initial.id]);
  assert(activeAfterRollback.rows[0]?.count === '1', 'failed coupled defer left an extra active contract behind.');
  assert((await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id}))?.state.attentionMode === 'DEFERRED', 'failed coupled defer changed Responsibility state.');

  // Inject after the Responsibility update has executed. The caller-owned
  // transaction must still roll it back when Temporal retirement fails.
  const originalRetire = internal.retireActiveContractsInTransaction;
  internal.retireActiveContractsInTransaction = async () => { throw new Error('injected return retirement failure'); };
  await temporalRepository.returnAttention({userId, connectedAccountId: accountId, responsibilityId: initial.id, requestKey: 'g32-return-fails', now}).then(
    () => { throw new Error('injected return failure was swallowed'); },
    (error: unknown) => assert(error instanceof Error && error.message === 'injected return retirement failure', 'unexpected return failure')
  );
  internal.retireActiveContractsInTransaction = originalRetire;
  assert((await temporalRepository.getContract({id: deferred.contract.id, userId}))?.status === 'ACTIVE', 'failed coupled return retired its contract.');
  assert((await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id}))?.state.attentionMode === 'DEFERRED', 'failed coupled return changed Responsibility state.');

  const deferredTriggerId = (await pool.query<{id: string}>(`SELECT id FROM temporal_triggers WHERE temporal_contract_id = $1`, [deferred.contract.id])).rows[0]?.id;
  assert(deferredTriggerId, 'deferred contract trigger was not persisted.');
  const quiet = await temporalRepository.processTemporalTrigger({
    triggerId: deferredTriggerId,
    userId,
    now,
    loadEvidence: async () => ({evidenceRevision: 1, references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED' as const, messageId}], userAttentionNeeded: false})
  });
  assert(quiet.status === 'NO_OP', 'quiet current evidence was not a semantic NO_OP.');
  const quietTrigger = await pool.query<{trigger_status: string}>(`SELECT trigger_status FROM temporal_triggers WHERE id = $1`, [quiet.trigger?.id]);
  assert(quietTrigger.rows[0]?.trigger_status === 'FIRED', 'NO_OP trigger was not consumed.');
  const quietAudit = await pool.query<{outcome: string}>(`SELECT outcome FROM temporal_resurfacing_events WHERE trigger_id = $1 AND reason_code = $2`, [quiet.trigger?.id, 'CURRENT_EVIDENCE_STILL_QUIET']);
  assert(quietAudit.rows[0]?.outcome === 'NO_OP', 'durable NO_OP audit was recorded as FIRED.');

  const directReturn = await temporalRepository.returnAttention({userId, connectedAccountId: accountId, responsibilityId: initial.id, requestKey: 'g32-direct-return', now});
  assert(directReturn.attentionMode === 'PRESENT', 'repository Return Attention did not update attention mode.');
  assert((await temporalRepository.getContract({id: deferred.contract.id, userId}))?.status === 'RESOLVED', 'repository Return Attention left its contract active.');
  const completedReplay = await temporalRepository.deferAttention({state: initial, requestKey: 'g32-defer', contract: deferredContractInput});
  assert(completedReplay.contract.status === 'RESOLVED', 'completed defer replay resurrected its contract.');
  assert(completedReplay.state.attentionMode === 'PRESENT', 'completed defer replay returned Responsibility to LATER.');

  // T04: a due follow-up re-evaluates current evidence and adds a USER
  // follow-up leg to the same Responsibility. It must not invent a new one.
  const t04Initial = stateFrom(await responsibilityRepository.applyTrustedCommand(candidate({
    sourceEventKey: 'g32-t04',
    candidateKey: 'g32-t04',
    applicationKey: 'g32-t04',
    operationalOutcome: 'obtain approval from the counterpart',
    obligationLegs: [{...otherPartyLeg(randomUUID()), provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId}]}]
  })));
  const t04TriggerId = randomUUID();
  const t04SiblingId = randomUUID();
  const t04Contract = await temporalRepository.upsertTemporalContract(contractInput(t04Initial.id, now, [t04TriggerId, t04SiblingId]));
  const beforeT04Count = await pool.query<{count: string}>(`SELECT count(*)::text AS count FROM responsibilities WHERE user_id = $1`, [userId]);
  const followUpLeg: ObligationLeg = {
    id: randomUUID(),
    bearer: 'USER',
    actionCode: 'FOLLOW_UP',
    status: 'OPEN',
    actionability: 'ACTIONABLE',
    basisKind: 'COMMUNICATED_REQUEST',
    provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId}]
  };
  const t04 = await temporalRepository.processTemporalTrigger({
    triggerId: t04TriggerId,
    userId,
    now,
    loadEvidence: evidence,
    evaluate: () => ({kind: 'APPLY', reasonCode: 'FOLLOW_UP_DUE', patch: {obligationLegs: [followUpLeg]}})
  });
  assert(t04.status === 'FIRED' && t04.state?.id === t04Initial.id, 'T04 follow-up did not update the same Responsibility.');
  assert(t04.projection?.bucket === 'MY_TURN', 'T04 follow-up did not project MY_TURN after current evidence was re-evaluated.');
  assert(t04.state?.obligationLegs.some((leg) => leg.id === followUpLeg.id && leg.bearer === 'USER' && leg.status === 'OPEN'), 'T04 follow-up USER leg was not persisted.');
  assert(t04.state?.obligationLegs.some((leg) => leg.bearer === 'OTHER_PARTY' && leg.status === 'OPEN'), 'T04 follow-up incorrectly removed the original approval expectation.');
  const afterT04Count = await pool.query<{count: string}>(`SELECT count(*)::text AS count FROM responsibilities WHERE user_id = $1`, [userId]);
  assert(afterT04Count.rows[0]?.count === beforeT04Count.rows[0]?.count, 'T04 follow-up created a new Responsibility instead of updating the existing one.');
  assert((await temporalRepository.getContract({id: t04Contract.id, userId}))?.status === 'RESOLVED', 'T04 APPLY left its consumed Temporal contract active.');
  const t04Sibling = await pool.query<{trigger_status: string}>(`SELECT trigger_status FROM temporal_triggers WHERE id = $1`, [t04SiblingId]);
  assert(t04Sibling.rows[0]?.trigger_status === 'CANCELLED', 'T04 APPLY left a sibling trigger live after the return condition was consumed.');

  // The evaluator is trusted to interpret current evidence, but Temporal scope
  // still binds its explicit command to the claimed Responsibility.
  const crossScopeTriggerId = randomUUID();
  await temporalRepository.upsertTemporalContract(contractInput(t04Initial.id, now, [crossScopeTriggerId]));
  const unrelatedBefore = await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id});
  assert(unrelatedBefore, 'cross-scope test target disappeared.');
  const crossScopeCommand = candidate({
    sourceEventKey: 'g32-cross-scope',
    candidateKey: 'g32-cross-scope',
    applicationKey: 'g32-cross-scope',
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: initial.id,
      expectedAggregateVersion: unrelatedBefore.state.aggregateVersion,
      effectKey: 'g32-cross-scope-update',
      patch: {operationalOutcome: 'incorrect cross-scope mutation'},
      provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId}]
    }]
  });
  const crossScope = await temporalRepository.processTemporalTrigger({
    triggerId: crossScopeTriggerId,
    userId,
    now,
    loadEvidence: evidence,
    evaluate: () => ({kind: 'APPLY', reasonCode: 'CROSS_SCOPE_ATTEMPT', command: crossScopeCommand})
  });
  assert(crossScope.status === 'FAILED' && crossScope.error?.includes('claimed Responsibility'), 'Temporal APPLY accepted a command for another Responsibility.');
  const unrelatedAfter = await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id});
  assert(unrelatedAfter?.state.operationalOutcome === unrelatedBefore.state.operationalOutcome && unrelatedAfter.state.aggregateVersion === unrelatedBefore.state.aggregateVersion, 'cross-scope Temporal APPLY mutated the unrelated Responsibility.');

  const staleTriggerId = randomUUID();
  const staleReplacementId = randomUUID();
  await temporalRepository.upsertTemporalContract(contractInput(initial.id, now, [staleTriggerId]));
  await temporalRepository.upsertTemporalContract(contractInput(initial.id, now, [staleReplacementId]));
  const stale = await temporalRepository.processTemporalTrigger({triggerId: staleTriggerId, userId, now, loadEvidence: evidence});
  assert(stale.status === 'STALE', 'superseded trigger resurrected old Temporal state.');
  const staleAudit = await pool.query<{outcome: string}>(`SELECT outcome FROM temporal_resurfacing_events WHERE trigger_id = $1 AND reason_code = $2`, [staleTriggerId, 'STALE_TEMPORAL_TRIGGER']);
  assert(staleAudit.rows[0]?.outcome === 'STALE', 'stale trigger did not persist stale audit truth.');

  const racingTriggerId = randomUUID();
  const racingDeferred = await temporalRepository.deferAttention({
    state: directReturn,
    requestKey: 'g32-racing-defer',
    contract: contractInput(initial.id, now, [racingTriggerId])
  });
  const replacementTriggerId = randomUUID();
  const racing = await temporalRepository.processTemporalTrigger({
    triggerId: racingTriggerId,
    userId,
    now,
    loadEvidence: evidence,
    evaluate: async () => {
      await temporalRepository.upsertTemporalContract(contractInput(initial.id, now, [replacementTriggerId]));
      return {kind: 'RETURN_ATTENTION', reasonCode: 'CURRENT_USER_ATTENTION_REQUIRED'};
    }
  });
  assert(racing.status === 'STALE', 'contract update racing evaluation was not rejected as stale.');
  const racingTrigger = await pool.query<{trigger_status: string}>(`SELECT trigger_status FROM temporal_triggers WHERE id = $1`, [racingTriggerId]);
  assert(racingTrigger.rows[0]?.trigger_status === 'SUPERSEDED', 'stale finalization resurrected a superseded trigger.');
  assert((await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id}))?.state.attentionMode === 'DEFERRED', 'stale racing return changed Responsibility attention.');
  assert((await temporalRepository.getContract({id: racingDeferred.contract.id, userId}))?.status === 'SUPERSEDED', 'racing contract replacement was not durable.');

  // A Conversation evidence revision can advance after the last external
  // reload but before the transactional commit. Even a NO_OP must fail closed.
  const revisionRaceTriggerId = randomUUID();
  await temporalRepository.upsertTemporalContract(contractInput(initial.id, now, [revisionRaceTriggerId]));
  let revisionRaceLoads = 0;
  const revisionRace = await temporalRepository.processTemporalTrigger({
    triggerId: revisionRaceTriggerId,
    userId,
    now,
    loadEvidence: async () => {
      revisionRaceLoads += 1;
      if (revisionRaceLoads === 2) {
        await pool.query(`UPDATE conversations SET semantic_evidence_revision = 2 WHERE id = $1`, [conversationId]);
      }
      return {evidenceRevision: 1, references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED' as const, messageId}], userAttentionNeeded: false};
    }
  });
  assert(revisionRace.status === 'STALE', 'commit-time evidence revision race was accepted as NO_OP.');
  const revisionRaceAudit = await pool.query<{outcome: string}>(`SELECT outcome FROM temporal_resurfacing_events WHERE trigger_id = $1 AND reason_code = 'STALE_TEMPORAL_TRIGGER'`, [revisionRaceTriggerId]);
  assert(revisionRaceAudit.rows[0]?.outcome === 'STALE', 'commit-time evidence revision race was not audited as stale.');
  await pool.query(`UPDATE conversations SET semantic_evidence_revision = 1 WHERE id = $1`, [conversationId]);

  const returnTriggerId = randomUUID();
  const siblingTriggerId = randomUUID();
  const liveContract = await temporalRepository.upsertTemporalContract(contractInput(initial.id, now, [returnTriggerId, siblingTriggerId]));
  let evaluations = 0;
  const evaluate = async () => {
    evaluations += 1;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 20));
    return {kind: 'RETURN_ATTENTION' as const, reasonCode: 'CURRENT_USER_ATTENTION_REQUIRED'};
  };
  const duplicate = await Promise.all([
    temporalRepository.processTemporalTrigger({triggerId: returnTriggerId, userId, now, loadEvidence: evidence, evaluate}),
    temporalRepository.processTemporalTrigger({triggerId: returnTriggerId, userId, now, loadEvidence: evidence, evaluate})
  ]);
  assert(evaluations === 1, 'duplicate durable delivery evaluated more than once.');
  assert(duplicate.filter((result) => result.status === 'FIRED').length === 1, 'duplicate delivery did not produce one domain effect.');
  assert((await temporalRepository.getContract({id: liveContract.id, userId}))?.status === 'RESOLVED', 'successful Return Attention left its contract active.');
  const sibling = await pool.query<{trigger_status: string}>(`SELECT trigger_status FROM temporal_triggers WHERE id = $1`, [siblingTriggerId]);
  assert(sibling.rows[0]?.trigger_status === 'CANCELLED', 'successful Return Attention left sibling trigger live.');
  const returned = await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initial.id});
  assert(returned?.state.attentionMode === 'PRESENT', 'successful Return Attention did not update attention mode.');

  const restartTriggerId = randomUUID();
  const restartContract = await temporalRepository.upsertTemporalContract(contractInput(initial.id, now, [restartTriggerId]));
  await pool.query(`UPDATE temporal_triggers SET trigger_status = 'CLAIMED', claimed_at = $2, available_at = $2 WHERE id = $1`, [restartTriggerId, new Date(now.getTime() - 10 * 60 * 1000)]);
  const restarted = new TemporalRepository(database);
  const recovered = await restarted.reconcileOverdue({userId, now, loadEvidence: evidence});
  assert(recovered.some((result) => result.triggerId === restartTriggerId && result.status === 'FIRED'), 'overdue claimed trigger did not recover after repository restart.');
  assert((await restarted.getContract({id: restartContract.id, userId}))?.status === 'RESOLVED', 'recovered Return Attention did not retire its contract.');

  const auditCounts = await pool.query<{no_ops: string; stale: string; fired: string}>(
    `SELECT
       count(*) FILTER (WHERE outcome = 'NO_OP')::text AS no_ops,
       count(*) FILTER (WHERE outcome = 'STALE')::text AS stale,
       count(*) FILTER (WHERE outcome = 'FIRED')::text AS fired
     FROM temporal_resurfacing_events`
  );
  assert(Number(auditCounts.rows[0]?.no_ops) >= 1 && Number(auditCounts.rows[0]?.stale) >= 1 && Number(auditCounts.rows[0]?.fired) >= 2, 'G32 durable audit outcomes were incomplete.');
  console.log('G32 durable Temporal production integration: PASS');
} finally {
  await pool.end();
}
