import {readFile, readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import * as schema from '../src/server/db/schema';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import {ResponsibilityRepository} from '../src/server/db/repositories/responsibility';
import {normalizedEvidenceFixture} from '../src/server/evidence/fixtures';
import type {
  CompletionCriterion,
  ObligationLeg,
  ResponsibilityInterpretationCandidate,
  TemporalFact,
  TrustedResponsibilityCommand
} from '../src/server/responsibility';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G31_DATABASE_URL;
assert(databaseUrl, 'G31_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({connectionString: databaseUrl, max: 4, application_name: 'lunowa-g31-reducer'});
const database = drizzle(pool, {schema});
const evidenceRepository = new EvidenceRepository(database);
const repository = new ResponsibilityRepository(database);

const userId = randomUUID();
const accountId = randomUUID();
const conversationId = randomUUID();
const secondUserId = randomUUID();
const secondAccountId = randomUUID();
const secondConversationId = randomUUID();
const secondParticipantId = randomUUID();
let messageId: string;
let secondMessageId: string;
const legId = randomUUID();

const userLeg = (id: string, actionCode: string): ObligationLeg => ({
  id,
  bearer: 'USER',
  actionCode,
  status: 'OPEN',
  actionability: 'ACTIONABLE',
  basisKind: 'COMMUNICATED_REQUEST',
  provenance: []
});

function candidate(overrides: Partial<TrustedResponsibilityCommand> = {}): TrustedResponsibilityCommand {
  return {
    commandSource: 'TRUSTED_SYSTEM',
    userId,
    connectedAccountId: accountId,
    conversationId,
    sourceEventKey: 'g31-message-1',
    candidateKey: 'g31-candidate-1',
    applicationKey: 'g31-application-1',
    evidenceRevision: 1,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_DIRECT_REQUEST']},
    operationalOutcome: 'send the revised document',
    obligationLegs: [{...userLeg(legId, 'SEND_REVISED_DOCUMENT'), provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId}]}],
    sourceMessageId: messageId,
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId, sourceExcerptShort: 'send the revised document'}],
    ...overrides
  };
}

function stateFrom(result: Awaited<ReturnType<ResponsibilityRepository['applyTrustedCommand']>>, effectIndex = 0) {
  assert(result.status === 'APPLIED', result.status === 'APPLIED' ? 'unexpected applied result' : result.reason);
  const state = result.effects[effectIndex]?.state;
  assert(state, `expected effect ${effectIndex} to return a Responsibility state`);
  return state;
}

async function migrate(): Promise<void> {
  const files = (await readdir(resolve(import.meta.dirname, '../drizzle/migrations')))
    .filter((name) => /^\d{4}_.*\.sql$/.test(name))
    .sort();
  assert(files.length >= 4, `expected the current production migration chain, got ${files.join(', ')}`);
  for (const file of files) await pool.query(await readFile(resolve(import.meta.dirname, `../drizzle/migrations/${file}`), 'utf8'));
}

try {
  const version = await pool.query<{server_version_num: string; version: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num, version()"
  );
  assert(version.rows[0]?.server_version_num === '180006', 'G31 integration requires PostgreSQL 18.6.');
  const tables = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  assert(tables.rowCount === 0, 'G31 integration requires a clean database.');
  await migrate();

  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'G31 reducer user', $2)`,
    [userId, `g31-${userId}@example.invalid`]
  );
  await pool.query(
    `INSERT INTO connected_accounts (id, user_id, provider, provider_account_id, email_address, credential_reference)
     VALUES ($1, $2, 'fixture-provider', 'g31-account', 'g31@example.invalid', 'credential-ref:g31')`,
    [accountId, userId]
  );
  const normalized = await evidenceRepository.upsertNormalizedMessage(
    normalizedEvidenceFixture(userId, accountId, {
      conversation: {
        id: conversationId,
        providerThreadId: 'g31-thread',
        normalizedSubject: 'g31 reducer fixture',
        semanticTopic: 'g31 reducer fixture'
      },
      providerMessageId: 'g31-message',
      subject: 'G31 reducer fixture'
    })
  );
  messageId = normalized.messageId;
  assert(normalized.evidenceRevision === 1 && normalized.changed, 'normalized evidence fixture was not admitted as the current basis.');
  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'G31 second tenant', $2)`,
    [secondUserId, `g31-${secondUserId}@example.invalid`]
  );
  await pool.query(
    `INSERT INTO connected_accounts (id, user_id, provider, provider_account_id, email_address, credential_reference)
     VALUES ($1, $2, 'fixture-provider', 'g31-account', 'g31-second@example.invalid', 'credential-ref:g31-second')`,
    [secondAccountId, secondUserId]
  );
  await pool.query(
    `INSERT INTO participant_identities (id, user_id, canonical_email) VALUES ($1, $2, 'foreign-participant@example.invalid')`,
    [secondParticipantId, secondUserId]
  );
  const secondNormalized = await evidenceRepository.upsertNormalizedMessage(
    normalizedEvidenceFixture(secondUserId, secondAccountId, {
      conversation: {
        id: secondConversationId,
        providerThreadId: 'g31-thread',
        normalizedSubject: 'g31 reducer fixture',
        semanticTopic: 'g31 reducer fixture'
      },
      providerMessageId: 'g31-message',
      subject: 'G31 reducer fixture'
    })
  );
  secondMessageId = secondNormalized.messageId;

  const sourceDue: TemporalFact = {
    id: randomUUID(),
    temporalKind: 'SOURCE_DUE',
    obligationLegId: legId,
    originalExpression: '明日までに',
    valueKind: 'DATE',
    resolvedDate: '2026-09-05',
    precisionCode: 'DATE',
    currentnessStatus: 'ACCEPTED_CURRENT',
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId}]
  };
  const first = await repository.applyTrustedCommand(candidate({temporalFacts: [sourceDue]}));
  const firstState = stateFrom(first);
  assert(firstState.obligationLegs[0]?.bearer === 'USER', 'CREATE did not preserve USER obligation ownership.');
  assert(firstState.temporalFacts[0]?.temporalKind === 'SOURCE_DUE', 'CREATE lost SOURCE_DUE semantics.');
  assert(firstState.acceptedEvidenceRevision === 1, 'CREATE stored the wrong evidence revision.');

  const secondLegId = randomUUID();
  const secondTenant = await repository.applyTrustedCommand(candidate({
    userId: secondUserId,
    connectedAccountId: secondAccountId,
    conversationId: secondConversationId,
    sourceMessageId: secondMessageId,
    obligationLegs: [{...userLeg(secondLegId, 'SEND_REVISED_DOCUMENT'), provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId: secondMessageId}]}],
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId: secondMessageId, sourceExcerptShort: 'send the revised document'}]
  }));
  const secondState = stateFrom(secondTenant);
  assert(secondState.id !== firstState.id, 'identical external keys collided across tenants.');
  assert(await repository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: secondState.id}) === null, 'first tenant loaded second-tenant state.');
  assert(await repository.getResponsibility({userId: secondUserId, connectedAccountId: secondAccountId, responsibilityId: firstState.id}) === null, 'second tenant loaded first-tenant state.');

  const ungrounded = await repository.applyTrustedCommand(candidate({
    sourceEventKey: 'g31-ungrounded',
    candidateKey: 'g31-ungrounded',
    applicationKey: 'g31-ungrounded-application',
    provenance: undefined
  }));
  assert(ungrounded.status === 'REJECTED', 'candidate without normalized provenance was admitted.');

  const noResponsibilityInterpretation: ResponsibilityInterpretationCandidate = {
    userId,
    connectedAccountId: accountId,
    conversationId,
    sourceEventKey: 'g31-no-responsibility-interpretation',
    candidateKey: 'g31-no-responsibility-interpretation',
    evidenceRevision: 1,
    sourceMessageId: messageId,
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId, sourceExcerptShort: 'current status'}],
    semantics: [{
      candidateUnitKey: 'courtesy-only',
      materiality: 'NOT_MATERIAL',
      provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId, sourceExcerptShort: 'current status'}]
    }]
  };
  const noResponsibility = await repository.reduceCandidate(noResponsibilityInterpretation);
  assert(noResponsibility.status === 'APPLIED' && noResponsibility.admission === 'DO_NOT_TRACK', 'trusted boundary did not derive valid No Responsibility.');
  const materialSource = {
    evidenceKind: 'COMMUNICATED_CLAIM' as const,
    messageId,
    sourceExcerptShort: 'current status',
    sourceLocator: {zone: 'AUTHORED_CURRENT'}
  };
  const missingParticipant = await repository.reduceCandidate({
    ...noResponsibilityInterpretation,
    sourceEventKey: 'g31-missing-participant',
    candidateKey: 'g31-missing-participant',
    provenance: [materialSource],
    semantics: [{
      candidateUnitKey: 'missing-participant', materiality: 'MATERIAL',
      operationalOutcome: 'receive a participant result',
      obligationLegs: [{
        id: randomUUID(), bearerCandidate: 'OTHER_PARTY', actionCode: 'SEND_RESULT',
        basisKind: 'COMMUNICATED_REQUEST', provenance: [materialSource]
      }],
      provenance: [materialSource]
    }]
  });
  assert(missingParticipant.status === 'REJECTED', 'missing non-USER participant reached accepted reduction/persistence.');
  for (const zone of ['QUOTED_HISTORY', 'FORWARDED_CONTENT'] as const) {
    const contextOnly = {...materialSource, sourceLocator: {zone}};
    const result = await repository.reduceCandidate({
      ...noResponsibilityInterpretation,
      sourceEventKey: `g31-context-only-${zone}`,
      candidateKey: `g31-context-only-${zone}`,
      provenance: [contextOnly],
      semantics: [{
        candidateUnitKey: `context-only-${zone}`, materiality: 'MATERIAL',
        operationalOutcome: 'perform the historical contextual request',
        obligationLegs: [{
          id: randomUUID(), bearerCandidate: 'USER', actionCode: 'PERFORM_HISTORICAL_REQUEST',
          basisKind: 'COMMUNICATED_REQUEST', provenance: [contextOnly]
        }],
        provenance: [contextOnly]
      }]
    });
    assert(result.status === 'REJECTED', `${zone} gained current-turn authority in production admission.`);
  }
  const missingZone = {...materialSource, sourceLocator: undefined};
  const missingZoneResult = await repository.reduceCandidate({
    ...noResponsibilityInterpretation,
    sourceEventKey: 'g31-missing-zone',
    candidateKey: 'g31-missing-zone',
    provenance: [missingZone],
    semantics: [{
      candidateUnitKey: 'missing-zone', materiality: 'MATERIAL',
      operationalOutcome: 'perform unzoned work',
      obligationLegs: [{
        id: randomUUID(), bearerCandidate: 'USER', actionCode: 'PERFORM_UNZONED_WORK',
        basisKind: 'COMMUNICATED_REQUEST', provenance: [missingZone]
      }],
      provenance: [missingZone]
    }]
  });
  assert(missingZoneResult.status === 'REJECTED', 'missing source zone gained current-turn authority in production admission.');
  const foreignParticipant = await repository.reduceCandidate({
    ...noResponsibilityInterpretation,
    sourceEventKey: 'g31-foreign-participant',
    candidateKey: 'g31-foreign-participant',
    provenance: [materialSource],
    semantics: [{
      candidateUnitKey: 'foreign-participant', materiality: 'MATERIAL',
      operationalOutcome: 'receive a participant result',
      expectedEvents: [{
        id: randomUUID(), actor: 'PARTICIPANT', participantId: secondParticipantId,
        eventCode: 'RESULT_RECEIVED', provenance: [materialSource]
      }],
      provenance: [materialSource]
    }]
  });
  assert(foreignParticipant.status === 'REJECTED', 'another tenant participant was accepted in the current scope.');
  const interpretedLegId = randomUUID();
  const trackedInterpretation = await repository.reduceCandidate({
    ...noResponsibilityInterpretation,
    sourceEventKey: 'g31-tracked-interpretation',
    candidateKey: 'g31-tracked-interpretation',
    semantics: [{
      candidateUnitKey: 'review-current-status',
      materiality: 'MATERIAL',
      operationalOutcome: 'review the current status',
      obligationLegs: [{
        id: interpretedLegId,
        bearerCandidate: 'USER',
        actionCode: 'REVIEW_CURRENT_STATUS',
        basisKind: 'COMMUNICATED_REQUEST',
        provenance: [materialSource]
      }],
      provenance: [materialSource]
    }]
  });
  const trackedInterpretationState = stateFrom(trackedInterpretation);
  assert(trackedInterpretationState.obligationLegs[0]?.actionCode === 'REVIEW_CURRENT_STATUS', 'trusted derivation did not persist structured candidate semantics.');
  const injectedInterpretation = {...noResponsibilityInterpretation, sourceEventKey: 'g31-injected', candidateKey: 'g31-injected'} as ResponsibilityInterpretationCandidate & Record<string, unknown>;
  injectedInterpretation.effects = [{operation: 'INVALIDATE', responsibilityRef: firstState.id}];
  const injectionRejected = await repository.reduceCandidate(injectedInterpretation);
  assert(injectionRejected.status === 'REJECTED', 'interpretation DTO injected a final domain effect.');

  const falseProviderTruth = await repository.applyTrustedCommand(candidate({
    commandSource: 'TRUSTED_SYSTEM',
    sourceEventKey: 'g31-false-provider-truth',
    candidateKey: 'g31-false-provider-truth',
    applicationKey: 'g31-false-provider-truth',
    responsibilityRef: firstState.id,
    provenance: [{evidenceKind: 'PROVIDER_RECONCILED_SEND', messageId}],
    effects: [{
      operation: 'RESOLVE', responsibilityRef: firstState.id, effectKey: 'false-send', reason: 'SATISFIED',
      resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}
    }]
  }));
  assert(falseProviderTruth.status === 'REJECTED', 'inbound Message was accepted as provider-reconciled outbound send truth.');

  const restartedRepository = new ResponsibilityRepository(database);
  const retry = await restartedRepository.applyTrustedCommand(candidate({temporalFacts: [sourceDue]}));
  assert(retry.status === 'APPLIED' && retry.effects[0]?.changed === false, 'idempotent replay reported a historical mutation as a new change.');
  assert(retry.responsibilities.every((state) => state.userId === userId && state.connectedAccountId === accountId), 'replay disclosed state outside the current scope.');
  const countsAfterRetry = await pool.query<{responsibilities: string; events: string}>(
    `SELECT (SELECT count(*)::text FROM responsibilities) AS responsibilities,
            (SELECT count(*)::text FROM responsibility_domain_events) AS events`
  );
  assert(countsAfterRetry.rows[0]?.responsibilities === '3' && countsAfterRetry.rows[0]?.events === '3', 'tenant-safe retry duplicated or collided Responsibility state/event.');

  await pool.query('UPDATE conversations SET semantic_evidence_revision = 2 WHERE id = $1', [conversationId]);
  const correctionFact: TemporalFact = {
    ...sourceDue,
    id: randomUUID(),
    resolvedDate: '2026-09-07',
    provenance: [{evidenceKind: 'USER_ASSERTION', messageId}]
  };
  const correction = await repository.applyTrustedCommand(candidate({
    commandSource: 'TRUSTED_USER',
    sourceEventKey: 'g31-correction',
    candidateKey: 'g31-correction',
    applicationKey: 'g31-correction-application',
    evidenceRevision: 2,
    responsibilityRef: firstState.id,
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: firstState.id,
      effectKey: 'due-correction',
      patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [correctionFact], authorityKind: 'USER_CORRECTION', provenance: [{evidenceKind: 'USER_ASSERTION', messageId}]}]}
    }]
  }));
  const correctedState = stateFrom(correction);
  assert(correctedState.temporalFacts.some((fact) => fact.currentnessStatus === 'SUPERSEDED'), 'field correction erased prior temporal evidence.');
  assert(correctedState.temporalFacts.some((fact) => fact.resolvedDate === '2026-09-07' && fact.currentnessStatus === 'ACCEPTED_CURRENT'), 'field correction did not become current.');
  const reloadedCorrection = await repository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: firstState.id});
  assert(reloadedCorrection?.state.fieldDecisions.some((decision) => decision.fieldKey === 'temporalFacts.SOURCE_DUE' && decision.provenance.some((item) => item.evidenceKind === 'USER_ASSERTION')), 'persisted field correction provenance was not reloaded.');
  assert(reloadedCorrection?.state.temporalFacts.some((fact) => fact.resolvedDate === '2026-09-07' && fact.provenance.some((item) => item.evidenceKind === 'USER_ASSERTION')), 'field/child-scoped temporal provenance was not reconstructed.');
  assert(reloadedCorrection?.state.obligationLegs[0]?.provenance.some((item) => item.evidenceKind === 'COMMUNICATED_CLAIM'), 'obligation-leg provenance was not reconstructed.');

  await pool.query('UPDATE conversations SET semantic_evidence_revision = 3 WHERE id = $1', [conversationId]);
  const review = await repository.applyTrustedCommand(candidate({
    sourceEventKey: 'g31-review',
    candidateKey: 'g31-review',
    applicationKey: 'g31-review-application',
    evidenceRevision: 3,
    admission: {decision: 'NEEDS_REVIEW', reasonCodes: ['PRAGMATIC_AMBIGUITY'], candidateSummary: {field: 'SOURCE_DUE'}}
  }));
  assert(review.status === 'APPLIED' && review.admissionReview?.status === 'OPEN', 'NEEDS_REVIEW did not create an admission review.');
  assert(review.responsibilities.length === 0, 'NEEDS_REVIEW created a fake Responsibility.');

  await pool.query('UPDATE conversations SET semantic_evidence_revision = 4 WHERE id = $1', [conversationId]);
  const actualCompletion: CompletionCriterion = {
    id: 'actual-termination-notice-created',
    code: 'NOTICE_CREATED',
    status: 'PENDING',
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId}]
  };
  const replacement = await repository.applyTrustedCommand(candidate({
    sourceEventKey: 'g31-replacement',
    candidateKey: 'g31-replacement',
    applicationKey: 'g31-replacement-application',
    evidenceRevision: 4,
    operationalOutcome: 'create a termination notice',
    obligationLegs: undefined,
    effects: [
      {operation: 'SUPERSEDE', responsibilityRef: firstState.id, effectKey: 'supersede', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}},
      {operation: 'CREATE', effectKey: 'replacement', patch: {operationalOutcome: 'create a termination notice', obligationLegs: [{...userLeg(randomUUID(), 'CREATE_TERMINATION_NOTICE'), provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId}]}], completionCriteria: [actualCompletion]}}
    ]
  }));
  const replacementState = stateFrom(replacement, 1);
  assert(stateFrom(replacement, 0).resolutionReason === 'SUPERSEDED', 'SUPERSEDE did not terminate the old Responsibility with its reason.');
  assert(replacementState.operationalOutcome === 'create a termination notice', 'replacement CREATE mutated the old operational identity.');

  const blanketSatisfaction = await repository.applyTrustedCommand(candidate({
    sourceEventKey: 'g31-blanket-satisfaction',
    candidateKey: 'g31-blanket-satisfaction',
    applicationKey: 'g31-blanket-satisfaction',
    evidenceRevision: 4,
    responsibilityRef: replacementState.id,
    effects: [{
      operation: 'RESOLVE', responsibilityRef: replacementState.id, effectKey: 'generic-close', reason: 'SATISFIED',
      resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}
    }]
  }));
  assert(blanketSatisfaction.status === 'REJECTED', 'generic outcome closure blanket-satisfied a pending completion criterion.');
  const afterBlanketAttempt = await repository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: replacementState.id});
  assert(afterBlanketAttempt?.state.resolutionStatus === 'OPEN', 'rejected blanket satisfaction mutated durable resolution state.');
  assert(afterBlanketAttempt?.state.details.completionCriteria[0]?.status === 'PENDING' && !afterBlanketAttempt.state.details.completionCriteria[0]?.satisfiedAt, 'rejected blanket satisfaction mutated durable criterion truth.');

  const cancelled = await repository.applyTrustedCommand(candidate({
    commandSource: 'TRUSTED_USER',
    sourceEventKey: 'g31-cancelled-not-satisfied',
    candidateKey: 'g31-cancelled-not-satisfied',
    applicationKey: 'g31-cancelled-not-satisfied',
    evidenceRevision: 4,
    responsibilityRef: replacementState.id,
    effects: [{
      operation: 'RESOLVE', responsibilityRef: replacementState.id, effectKey: 'cancel', reason: 'CANCELLED',
      resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['USER_ASSERTION']},
      provenance: [{evidenceKind: 'USER_ASSERTION', messageId}]
    }]
  }));
  const cancelledState = stateFrom(cancelled);
  assert(cancelledState.details.completionCriteria[0]?.status === 'PENDING' && !cancelledState.details.completionCriteria[0]?.satisfiedAt, 'non-satisfaction resolution falsified pending criterion as satisfied.');
  const reloadedCancelled = await repository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: replacementState.id});
  assert(reloadedCancelled?.state.details.completionCriteria[0]?.status === 'PENDING', 'non-satisfaction criterion truth was not preserved on reload.');

  const noOp = await repository.applyTrustedCommand(candidate({
    sourceEventKey: 'g31-no-op',
    candidateKey: 'g31-no-op',
    applicationKey: 'g31-no-op-application',
    evidenceRevision: 4,
    responsibilityRef: firstState.id,
    effects: [{operation: 'NO_OP', responsibilityRef: firstState.id, effectKey: 'no-op'}]
  }));
  assert(noOp.status === 'APPLIED' && noOp.effects[0]?.changed === false, 'NO_OP did not remain a non-mutating accepted effect.');

  const stale = await repository.applyTrustedCommand(candidate({
    sourceEventKey: 'g31-stale', candidateKey: 'g31-stale', applicationKey: 'g31-stale-application', evidenceRevision: 3, responsibilityRef: replacementState.id,
    effects: [{operation: 'UPDATE', responsibilityRef: replacementState.id, effectKey: 'stale'}]
  }));
  assert(stale.status === 'STALE', 'stale evidence revision was allowed to reach the reducer.');

  const finalCounts = await pool.query<{responsibilities: string; events: string; reviews: string; field_decisions: string; noop_mutations: string}>(
    `SELECT (SELECT count(*)::text FROM responsibilities) AS responsibilities,
            (SELECT count(*)::text FROM responsibility_domain_events) AS events,
            (SELECT count(*)::text FROM responsibility_admission_reviews) AS reviews,
            (SELECT count(*)::text FROM responsibility_field_decisions) AS field_decisions,
            (SELECT count(*)::text FROM responsibility_domain_events WHERE operation = 'NO_OP' AND NOT mutates_state) AS noop_mutations`
  );
  assert(JSON.stringify(finalCounts.rows[0]) === JSON.stringify({responsibilities: '4', events: '8', reviews: '1', field_decisions: '6', noop_mutations: '1'}), `unexpected production reducer counts: ${JSON.stringify(finalCounts.rows[0])}`);
  console.log(JSON.stringify({
    kind: 'g31-responsibility-reducer-production-result-v1',
    postgres: version.rows[0]?.version,
    checks: ['production migration targets', 'untrusted interpretation boundary', 'canonical current-authored zoning', 'quoted/forwarded/missing-zone rejection', 'bounded participant validation', 'two-tenant identical-key isolation', 'restart replay changed:false', 'trusted provider-fact validation', 'field/child provenance reconstruction', 'criterion-scoped satisfaction truth', 'non-satisfaction criterion truth', 'revision-serialized admission', 'admission Review separation', 'composite SUPERSEDE plus CREATE', 'audited NO_OP', 'stale revision rejection'],
    status: 'PASS'
  }, null, 2));
} finally {
  await pool.end();
}
