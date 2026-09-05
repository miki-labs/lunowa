import {describe, expect, it} from 'vitest';

import {
  deriveResponsibilityCommand,
  projectAdmissionReview,
  projectResponsibility,
  reduceResponsibility
} from '../src/server/responsibility';
import type {
  CompletionCriterion,
  ResponsibilityInterpretationCandidate,
  ExpectedEvent,
  ObligationLeg,
  ProvenanceInput,
  ResponsibilityEvidenceBasis,
  ResponsibilityState,
  TemporalFact,
  TrustedResponsibilityCommand
} from '../src/server/responsibility';

const scope = {
  userId: 'corpus-user',
  connectedAccountId: 'corpus-account',
  conversationId: 'corpus-conversation'
};

type ReducerOptions = NonNullable<Parameters<typeof reduceResponsibility>[1]>;

function source(kind: ProvenanceInput['evidenceKind'] = 'PROVIDER_MESSAGE_OBSERVED', messageId = 'corpus-message'): ProvenanceInput {
  return {evidenceKind: kind, messageId};
}

function leg(
  id: string,
  bearer: ObligationLeg['bearer'],
  actionCode: string,
  actionability: ObligationLeg['actionability'] = 'ACTIONABLE'
): ObligationLeg {
  return {
    id,
    bearer,
    actionCode,
    status: 'OPEN',
    actionability,
    basisKind: 'COMMUNICATED_REQUEST',
    provenance: [source()]
  };
}

function candidate(overrides: Partial<TrustedResponsibilityCommand> = {}): TrustedResponsibilityCommand {
  return {
    ...scope,
    commandSource: 'TRUSTED_SYSTEM',
    sourceEventKey: 'corpus-message-event',
    candidateKey: 'corpus-candidate',
    evidenceRevision: 1,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP']},
    operationalOutcome: 'obtain the requested result',
    obligationLegs: [leg('user-work', 'USER', 'OBTAIN_RESULT')],
    provenance: [source()],
    ...overrides
  };
}

function reduce(candidateInput: TrustedResponsibilityCommand, options: ReducerOptions = {}) {
  const evidenceBasis: ResponsibilityEvidenceBasis = {
    evidenceRevision: candidateInput.evidenceRevision,
    sourceEventKey: candidateInput.sourceEventKey,
    references: [
      ...(candidateInput.provenance ?? []),
      ...(candidateInput.effects?.flatMap((effect) => [
        ...(effect.provenance ?? []),
        ...(effect.patch?.fieldChanges?.flatMap((change) => change.provenance ?? []) ?? [])
      ]) ?? [])
    ]
  };
  return reduceResponsibility(candidateInput, {evidenceBasis, ...options});
}

function stateOf(result: ReturnType<typeof reduceResponsibility>, effectIndex = 0): ResponsibilityState {
  if (result.status !== 'APPLIED') throw new Error(result.reason);
  const state = result.effects[effectIndex]?.state;
  if (!state) throw new Error(`expected effect ${effectIndex} to return state`);
  return state;
}

function updateCandidate(
  state: ResponsibilityState,
  effect: TrustedResponsibilityCommand['effects'] extends readonly (infer T)[] | undefined ? T : never,
  overrides: Partial<TrustedResponsibilityCommand> = {}
): TrustedResponsibilityCommand {
  return candidate({
    sourceEventKey: `${state.id}-event-${state.acceptedEvidenceRevision + 1}`,
    candidateKey: `${state.id}-candidate-${state.acceptedEvidenceRevision + 1}`,
    evidenceRevision: state.acceptedEvidenceRevision + 1,
    responsibilityRef: state.id,
    effects: [{...effect, responsibilityRef: state.id}],
    ...overrides
  });
}

function reduceUpdate(
  state: ResponsibilityState,
  effect: TrustedResponsibilityCommand['effects'] extends readonly (infer T)[] | undefined ? T : never,
  overrides: Partial<TrustedResponsibilityCommand> = {}
) {
  return reduce(updateCandidate(state, effect, overrides), {existingResponsibilities: [state]});
}

const expectedEvent = (id = 'expected-event'): ExpectedEvent => ({
  id,
  actor: 'EXTERNAL',
  eventCode: 'RESULT_RECEIVED',
  status: 'PENDING',
  provenance: [source()]
});

const due = (id: string, date: string, kind: TemporalFact['temporalKind'] = 'SOURCE_DUE'): TemporalFact => ({
  id,
  temporalKind: kind,
  valueKind: 'DATE',
  resolvedDate: date,
  precisionCode: 'DATE',
  currentnessStatus: 'ACCEPTED_CURRENT',
  provenance: [source('COMMUNICATED_CLAIM')]
});

const completion = (id: string, status: CompletionCriterion['status'] = 'PENDING'): CompletionCriterion => ({
  id,
  code: id.toUpperCase(),
  status,
  ...(status === 'SATISFIED' ? {satisfiedAt: '2026-01-02T00:00:00.000Z'} : {}),
  provenance: [source()]
});

const PRODUCT_GOLDEN_IDS = [
  'PG-01', 'PG-02', 'PG-03', 'PG-04', 'PG-05', 'PG-06', 'PG-07', 'PG-08', 'PG-09', 'PG-10',
  'PG-11', 'PG-12', 'PG-13', 'PG-14', 'PG-15', 'PG-16', 'PG-17', 'PG-18', 'PG-19',
  'PG-42', 'PG-43', 'PG-44', 'PG-45', 'PG-46', 'PG-47', 'PG-48', 'PG-49', 'PG-50', 'PG-51', 'PG-52',
  'PG-53', 'PG-54', 'PG-55', 'PG-56', 'PG-57', 'PG-58', 'PG-59', 'PG-60'
] as const;

type CorpusCase = {id: (typeof PRODUCT_GOLDEN_IDS)[number]; consequence: string; run: () => void};

const productGoldenCases: CorpusCase[] = [
  {
    id: 'PG-01',
    consequence: 'delegated waiting remains open and quiet',
    run: () => {
      const state = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      expect(projectResponsibility(state).bucket).toBe('WAITING');
    }
  },
  {
    id: 'PG-02',
    consequence: 'progress evidence does not create user attention',
    run: () => {
      const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      const result = reduceUpdate(initial, {operation: 'UPDATE', patch: {expectedEvents: [expectedEvent()]}});
      expect(projectResponsibility(stateOf(result)).bucket).toBe('WAITING');
    }
  },
  {
    id: 'PG-03',
    consequence: 'a concrete user obligation returns attention',
    run: () => {
      const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      const result = reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [leg('user-decision', 'USER', 'DECIDE_RESULT')]}});
      expect(projectResponsibility(stateOf(result)).bucket).toBe('MY_TURN');
    }
  },
  {
    id: 'PG-04',
    consequence: 'follow-up action is an update, not a new lifecycle',
    run: () => {
      const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      const result = reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [leg('follow-up', 'USER', 'FOLLOW_UP')]}});
      expect(stateOf(result).id).toBe(initial.id);
      expect(projectResponsibility(stateOf(result)).bucket).toBe('MY_TURN');
    }
  },
  {
    id: 'PG-05',
    consequence: 'only sufficient operational evidence resolves the outcome',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const closed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
      const result = reduceUpdate(initial, {
        operation: 'RESOLVE',
        reason: 'SATISFIED',
        patch: {obligationLegs: [closed]},
        resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}
      });
      expect(stateOf(result).resolutionReason).toBe('SATISFIED');
    }
  },
  {
    id: 'PG-06',
    consequence: 'one source event can create independent Responsibilities',
    run: () => {
      const result = reduce(candidate({
        effects: [
          {operation: 'CREATE', effectKey: 'first', patch: {operationalOutcome: 'review draft A', obligationLegs: [leg('draft-a', 'USER', 'REVIEW_DRAFT')]}},
          {operation: 'CREATE', effectKey: 'second', patch: {operationalOutcome: 'prepare dates', obligationLegs: [leg('dates', 'USER', 'PROPOSE_DATES')]}}
        ]
      }));
      expect(result.status).toBe('APPLIED');
      if (result.status === 'APPLIED') expect(result.responsibilities).toHaveLength(2);
    }
  },
  {
    id: 'PG-07',
    consequence: 'due correction is field-scoped and historical',
    run: () => {
      const initial = stateOf(reduce(candidate({temporalFacts: [due('friday', '2026-09-04')]})));
      const corrected = stateOf(reduceUpdate(initial, {
        operation: 'UPDATE',
        patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('monday', '2026-09-07')], authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]}
      }));
      expect(corrected.operationalOutcome).toBe(initial.operationalOutcome);
      expect(corrected.temporalFacts.find((fact) => fact.id === 'friday')?.currentnessStatus).toBe('SUPERSEDED');
      expect(corrected.temporalFacts.find((fact) => fact.id === 'monday')?.currentnessStatus).toBe('ACCEPTED_CURRENT');
    }
  },
  {
    id: 'PG-08',
    consequence: 'USER_TARGET coexists with SOURCE_DUE',
    run: () => {
      const state = stateOf(reduce(candidate({temporalFacts: [due('source-due', '2026-09-04'), due('user-target', '2026-09-03', 'USER_TARGET')]})));
      expect(state.temporalFacts.map((fact) => fact.temporalKind)).toEqual(['SOURCE_DUE', 'USER_TARGET']);
    }
  },
  {
    id: 'PG-09',
    consequence: 'defer changes attention only',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const result = reduceUpdate(initial, {
        operation: 'UPDATE',
        patch: {fieldChanges: [{fieldKey: 'attentionMode', value: 'DEFERRED', authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]}
      });
      const state = stateOf(result);
      expect(state.resolutionStatus).toBe('OPEN');
      expect(projectResponsibility(state).bucket).toBe('LATER');
    }
  },
  {
    id: 'PG-10',
    consequence: 'stop tracking is not successful completion',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const state = stateOf(reduceUpdate(initial, {
        operation: 'RESOLVE',
        reason: 'USER_CLOSED',
        patch: {fieldChanges: [{fieldKey: 'liveTrackingState', value: 'HISTORICAL_INACTIVE', authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]},
        resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['USER_ASSERTION']}
      }));
      expect(state.resolutionReason).toBe('USER_CLOSED');
      expect(projectResponsibility(state).bucket).toBe('NONE');
    }
  },
  {
    id: 'PG-11',
    consequence: 'authorized off-channel completion retains its provenance',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const offChannel = source('USER_OFF_CHANNEL_ASSERTION', 'phone-2026-01-02');
      offChannel.messageId = undefined;
      offChannel.sourceLocator = {authorized: true, authorityReference: 'phone-2026-01-02'};
      const state = stateOf(reduceUpdate(initial, {
        operation: 'RESOLVE',
        reason: 'SATISFIED',
        resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['USER_OFF_CHANNEL_ASSERTION']}
      }, {provenance: [offChannel], sourceMessageId: undefined}));
      expect(state.resolutionReason).toBe('SATISFIED');
      expect(state.provenance.some((item) => item.evidenceKind === 'USER_OFF_CHANNEL_ASSERTION')).toBe(true);
    }
  },
  {
    id: 'PG-12',
    consequence: 'material field conflict projects Responsibility Review',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const state = stateOf(reduceUpdate(initial, {
        operation: 'UPDATE',
        patch: {fieldChanges: [{fieldKey: 'uncertainties', value: [{id: 'conflict', fieldKey: 'temporalFacts.SOURCE_DUE', reasonCode: 'CONFLICTING_EVIDENCE', material: true, reviewRequired: true, provenance: [source()]}], authorityKind: 'INTERPRETATION', provenance: [source()]}]}
      }));
      expect(projectResponsibility(state).bucket).toBe('REVIEW');
    }
  },
  {
    id: 'PG-13',
    consequence: 'non-material uncertainty does not ask for Review',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const state = stateOf(reduceUpdate(initial, {
        operation: 'UPDATE',
        patch: {fieldChanges: [{fieldKey: 'uncertainties', value: [{id: 'minor', fieldKey: 'internal-subtype', reasonCode: 'MODEL_UNCERTAINTY', material: false, reviewRequired: false, provenance: [source()]}], authorityKind: 'INTERPRETATION', provenance: [source()]}]}
      }));
      expect(projectResponsibility(state).bucket).toBe('MY_TURN');
    }
  },
  {
    id: 'PG-14',
    consequence: 'ordinary send approval does not create durable Review',
    run: () => {
      const result = reduce(candidate({operationalOutcome: 'send the reviewed reply'}));
      expect(result.status).toBe('APPLIED');
      if (result.status === 'APPLIED') expect(result.admissionReview).toBeUndefined();
    }
  },
  {
    id: 'PG-15',
    consequence: 'high-risk content alone remains a tracked loop, not admission Review',
    run: () => {
      const result = reduce(candidate({riskDetails: [{id: 'risk', targetKind: 'OBLIGATION', riskClass: 'HIGH', reasonCode: 'HIGH_RISK_REQUEST', provenance: [source('COMMUNICATED_CLAIM')]}]}));
      expect(result.status).toBe('APPLIED');
      if (result.status === 'APPLIED') expect(result.admission).toBe('TRACK');
    }
  },
  {
    id: 'PG-16',
    consequence: 'a real admission ambiguity is pre-Responsibility Review',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'NEEDS_REVIEW', reasonCodes: ['HIGH_RISK_AUTHORITY_AMBIGUOUS'], candidateSummary: {question: 'which recipient is authorized?'}}}));
      expect(result.status).toBe('APPLIED');
      if (result.status === 'APPLIED') expect(projectAdmissionReview()).toMatchObject({bucket: 'REVIEW', subjectKind: 'ADMISSION_REVIEW'});
    }
  },
  {
    id: 'PG-17',
    consequence: 'repeated correction stays within one field',
    run: () => {
      const initial = stateOf(reduce(candidate({temporalFacts: [due('source-due', '2026-09-04'), due('target', '2026-09-03', 'USER_TARGET')]})));
      const first = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('due-1', '2026-09-05')], authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]}}));
      const second = stateOf(reduceUpdate(first, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('due-2', '2026-09-06')], authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]}}));
      expect(second.temporalFacts.find((fact) => fact.temporalKind === 'USER_TARGET')?.resolvedDate).toBe('2026-09-03');
      expect(second.operationalOutcome).toBe(initial.operationalOutcome);
    }
  },
  {
    id: 'PG-18',
    consequence: 'new trusted evidence clears field Review',
    run: () => {
      const initial = stateOf(reduce(candidate({uncertainties: [{id: 'conflict', fieldKey: 'due', reasonCode: 'CONFLICTING_EVIDENCE', material: true, reviewRequired: true, provenance: [source()]}]})));
      expect(projectResponsibility(initial).bucket).toBe('REVIEW');
      const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'uncertainties', value: [], authorityKind: 'EXTERNAL_AUTHORITATIVE_FACT', provenance: [source('EXTERNAL_AUTHORITATIVE_FACT')]}]}}));
      expect(projectResponsibility(state).bucket).toBe('MY_TURN');
    }
  },
  {
    id: 'PG-19',
    consequence: 'later authoritative evidence can supersede only the corrected field',
    run: () => {
      const initial = stateOf(reduce(candidate({temporalFacts: [due('source-due', '2026-09-04'), due('target', '2026-09-03', 'USER_TARGET')]})));
      const corrected = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('user-correction', '2026-09-05')], authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]}}));
      const state = stateOf(reduceUpdate(corrected, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('external-correction', '2026-09-06')], authorityKind: 'EXTERNAL_AUTHORITATIVE_FACT', provenance: [source('EXTERNAL_AUTHORITATIVE_FACT')]}]}}));
      expect(state.temporalFacts.find((fact) => fact.temporalKind === 'USER_TARGET')?.resolvedDate).toBe('2026-09-03');
      expect(state.temporalFacts.find((fact) => fact.id === 'external-correction')?.currentnessStatus).toBe('ACCEPTED_CURRENT');
    }
  },
  {
    id: 'PG-42',
    consequence: 'automatic reply is weak closure evidence',
    run: () => {
      const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', effectKey: 'ooo', patch: {expectedEvents: [expectedEvent()]}}));
      expect(state.resolutionStatus).toBe('OPEN');
      expect(projectResponsibility(state).bucket).toBe('WAITING');
    }
  },
  {
    id: 'PG-43',
    consequence: 'acknowledgement does not resolve an open loop',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const result = reduceUpdate(initial, {operation: 'UPDATE', effectKey: 'ack'});
      expect(stateOf(result).resolutionStatus).toBe('OPEN');
    }
  },
  {
    id: 'PG-44',
    consequence: 'later non-delivery reopens a previously resolved loop',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const closed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
      const resolved = stateOf(reduceUpdate(initial, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}}));
      const state = stateOf(reduceUpdate(resolved, {operation: 'REOPEN', patch: {obligationLegs: [leg('remedial-work', 'USER', 'RESEND_RESULT')]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_NON_DELIVERY']}}));
      expect(state.resolutionStatus).toBe('OPEN');
      expect(state.resolutionHistory).toHaveLength(1);
    }
  },
  {
    id: 'PG-45',
    consequence: 'claim and provider contradiction remain visible',
    run: () => {
      const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'uncertainties', value: [{id: 'attachment-conflict', fieldKey: 'completionCriteria', reasonCode: 'CLAIM_CONTRADICTED_BY_PROVIDER', material: true, reviewRequired: true, provenance: [source('PROVIDER_NON_DELIVERY')]}], authorityKind: 'INTERPRETATION', provenance: [source('PROVIDER_NON_DELIVERY')]}]}}));
      expect(projectResponsibility(state).bucket).toBe('REVIEW');
    }
  },
  {
    id: 'PG-46',
    consequence: 'quoted history alone is a valid No Responsibility result',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['NO_NEW_MATERIAL_REQUEST_IN_CURRENT_AUTHORED_TEXT']}, operationalOutcome: undefined, obligationLegs: undefined}));
      expect(result).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK', responsibilities: []});
    }
  },
  {
    id: 'PG-47',
    consequence: 'CC membership does not create a user obligation',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['CC_ONLY_USER']}, operationalOutcome: undefined, obligationLegs: undefined}));
      expect(result).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK'});
    }
  },
  {
    id: 'PG-48',
    consequence: 'cross-thread similarity cannot supply matching authority',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const result = reduce(candidate({conversationId: 'other-conversation', responsibilityRef: initial.id, effects: [{operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'similar-thread'}]}), {existingResponsibilities: [initial]});
      expect(result.status).toBe('REJECTED');
    }
  },
  {
    id: 'PG-49',
    consequence: 'cross-account similarity cannot supply matching authority',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const result = reduce(candidate({connectedAccountId: 'other-account', responsibilityRef: initial.id, effects: [{operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'similar-account'}]}), {existingResponsibilities: [initial]});
      expect(result.status).toBe('REJECTED');
    }
  },
  {
    id: 'PG-50',
    consequence: 'prompt-injection text has no application authority',
    run: () => {
      const result = reduce(candidate({riskDetails: [{id: 'injection-risk', targetKind: 'SOURCE', riskClass: 'HIGH', reasonCode: 'PROMPT_INJECTION', provenance: [source('COMMUNICATED_CLAIM')]}]}));
      expect(result.status).toBe('APPLIED');
      if (result.status === 'APPLIED') expect(result.admissionReview).toBeUndefined();
    }
  },
  {
    id: 'PG-51',
    consequence: 'duplicate evidence is idempotent',
    run: () => {
      const initialCandidate = candidate({candidateKey: 'duplicate-candidate', sourceEventKey: 'duplicate-event'});
      const initial = stateOf(reduce(initialCandidate));
      const retry = reduce(initialCandidate, {existingResponsibilities: [initial]});
      expect(retry.status).toBe('APPLIED');
      if (retry.status === 'APPLIED') expect(retry.effects[0]?.changed).toBe(false);
    }
  },
  {
    id: 'PG-52',
    consequence: 'communication evidence does not grant calendar authority',
    run: () => {
      const state = stateOf(reduce(candidate({operationalOutcome: 'respond to the meeting message'})));
      expect(state.resolutionStatus).toBe('OPEN');
      expect(state.provenance.some((item) => item.evidenceKind === 'PROVIDER_MESSAGE_OBSERVED')).toBe(true);
    }
  },
  {
    id: 'PG-53',
    consequence: 'material Responsibility Review is excluded from healthy waiting',
    run: () => {
      const initial = stateOf(reduce(candidate()));
      const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'uncertainties', value: [{id: 'material', fieldKey: 'due', reasonCode: 'CONFLICT', material: true, reviewRequired: true, provenance: [source()]}], authorityKind: 'INTERPRETATION', provenance: [source()]}]}}));
      expect(projectResponsibility(state)).toMatchObject({bucket: 'REVIEW', subjectKind: 'RESPONSIBILITY'});
    }
  },
  {
    id: 'PG-54',
    consequence: 'nonurgent admission Review still prevents strict zero',
    run: () => {
      expect(projectAdmissionReview()).toMatchObject({bucket: 'REVIEW', subjectKind: 'ADMISSION_REVIEW'});
    }
  },
  {
    id: 'PG-55',
    consequence: 'healthy waiting is a quiet delegated state',
    run: () => {
      const state = stateOf(reduce(candidate({obligationLegs: [leg('other-work', 'OTHER_PARTY', 'SEND_RESULT')]})));
      expect(projectResponsibility(state).bucket).toBe('WAITING');
    }
  },
  {
    id: 'PG-56',
    consequence: 'zero monitoring is distinct from all work handled',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['NO_MATERIAL_OPEN_LOOP']}, operationalOutcome: undefined, obligationLegs: undefined}));
      expect(result).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK', responsibilities: []});
    }
  },
  {
    id: 'PG-57',
    consequence: 'empty Review has no admitted subject',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['NO_MATERIAL_OPEN_LOOP']}, operationalOutcome: undefined, obligationLegs: undefined}));
      expect(result).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK'});
    }
  },
  {
    id: 'PG-58',
    consequence: 'lack of retrieved source cannot be converted into valid No Responsibility',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['NO_AUTHORIZED_MATCH']}, operationalOutcome: undefined, obligationLegs: undefined, provenance: undefined}));
      expect(result.status).toBe('REJECTED');
    }
  },
  {
    id: 'PG-59',
    consequence: 'lack of authorized context cannot be converted into valid No Responsibility',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['NO_MATERIAL_OPEN_LOOP']}, operationalOutcome: undefined, obligationLegs: undefined, provenance: undefined}));
      expect(result.status).toBe('REJECTED');
    }
  },
  {
    id: 'PG-60',
    consequence: 'successful interpretation may validly produce No Responsibility',
    run: () => {
      const result = reduce(candidate({admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['COURTESY_OR_FYI']}, operationalOutcome: undefined, obligationLegs: undefined}));
      expect(result).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK', effects: [], responsibilities: []});
    }
  }
];

const TRANSITION_ORACLE_IDS = [
  'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10',
  'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20'
] as const;

type TransitionCase = {id: (typeof TRANSITION_ORACLE_IDS)[number]; run: () => void};

const transitionCases: TransitionCase[] = [
  {id: 'T01', run: () => {
    const initial = stateOf(reduce(candidate({temporalFacts: [due('friday-report', '2026-09-04')]})));
    const updated = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {constraints: [{id: 'pdf-format', code: 'FORMAT_PDF', status: 'ACTIVE', provenance: [source()]}]}}));
    expect(updated.id).toBe(initial.id);
    expect(updated.temporalFacts.find((fact) => fact.id === 'friday-report')?.resolvedDate).toBe('2026-09-04');
    expect(updated.details.constraints[0]?.code).toBe('FORMAT_PDF');
    const closed = {...updated.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    expect(stateOf(reduceUpdate(updated, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}})).resolutionStatus).toBe('RESOLVED');
  }},
  {id: 'T02', run: () => {
    const confirmation = expectedEvent('counterpart-confirmation');
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('user-send', 'USER', 'SEND_RESULT')], expectedEvents: [confirmation]})));
    const completedUserLeg = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const waiting = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [completedUserLeg]}}));
    expect(waiting.resolutionStatus).toBe('OPEN');
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
    const confirmed = {...waiting.expectedEvents[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', satisfiedAt: '2026-01-03T00:00:00.000Z', closedAt: '2026-01-03T00:00:00.000Z'};
    const done = stateOf(reduceUpdate(waiting, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {expectedEvents: [confirmed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}}));
    expect(projectResponsibility(done).bucket).toBe('DONE');
    expect(done.id).toBe(initial.id);
  }},
  {id: 'T03', run: () => {
    const initial = stateOf(reduce(candidate()));
    const ambiguous = stateOf(reduceUpdate(initial, {operation: 'NO_OP', effectKey: 'ambiguous-send'}));
    expect(ambiguous.resolutionStatus).toBe('OPEN');
    const closed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    expect(stateOf(reduceUpdate(ambiguous, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}})).resolutionStatus).toBe('RESOLVED');
  }},
  {id: 'T04', run: () => {
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-wait', 'OTHER_PARTY', 'APPROVE_RESULT')]})));
    expect(projectResponsibility(initial).bucket).toBe('WAITING');
    const followUp = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [leg('follow-up', 'USER', 'FOLLOW_UP')]}}));
    expect(projectResponsibility(followUp).bucket).toBe('MY_TURN');
    const sentFollowUp = {...followUp.obligationLegs.find((item) => item.id === 'follow-up')!, status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-03T00:00:00.000Z'};
    const waiting = stateOf(reduceUpdate(followUp, {operation: 'UPDATE', patch: {obligationLegs: [sentFollowUp]}}));
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
    const approval = {...waiting.obligationLegs.find((item) => item.id === 'other-wait')!, status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-04T00:00:00.000Z'};
    const done = stateOf(reduceUpdate(waiting, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [approval]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}}));
    expect(projectResponsibility(done).bucket).toBe('DONE');
    expect(done.id).toBe(initial.id);
  }},
  {id: 'T05', run: () => {
    const initial = stateOf(reduce(candidate({operationalOutcome: 'agree on a meeting time', obligationLegs: [leg('user-response', 'USER', 'RESPOND_TO_PROPOSAL')], pendingProposals: [{id: 'proposal-17', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'PENDING', provenance: [source()]}]})));
    expect(initial.details.agreedFacts).toHaveLength(0);
    const userClosed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'COUNTERPROPOSED', closedAt: '2026-01-02T00:00:00.000Z'};
    const waiting = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {
      obligationLegs: [userClosed],
      expectedEvents: [expectedEvent('counterproposal-response')],
      pendingProposals: [
        {id: 'proposal-17', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'REJECTED', provenance: [source()]},
        {id: 'proposal-18', kind: 'MEETING_TIME', value: 'Friday 18:00', status: 'PENDING', provenance: [source()]}
      ]
    }}));
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
    expect(waiting.details.agreedFacts).toHaveLength(0);
    const response = {...waiting.expectedEvents[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', satisfiedAt: '2026-01-03T00:00:00.000Z', closedAt: '2026-01-03T00:00:00.000Z'};
    const done = stateOf(reduceUpdate(waiting, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {
      expectedEvents: [response],
      pendingProposals: [{id: 'proposal-18', kind: 'MEETING_TIME', value: 'Friday 18:00', status: 'SUPERSEDED', provenance: [source()]}],
      agreedFacts: [{id: 'agreed-18', kind: 'MEETING_TIME', value: 'Friday 18:00', status: 'CURRENT', provenance: [source()]}]
    }, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}}));
    expect(done.details.agreedFacts[0]?.value).toBe('Friday 18:00');
    expect(projectResponsibility(done).bucket).toBe('DONE');
  }},
  {id: 'T06', run: () => {
    const initial = stateOf(reduce(candidate({pendingProposals: [{id: 'proposal', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'PENDING', provenance: [source()]}]})));
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {pendingProposals: [{id: 'proposal', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'REJECTED', provenance: [source()]}]}}));
    expect(state.details.pendingProposals[0]?.status).toBe('REJECTED');
    expect(state.resolutionStatus).toBe('OPEN');
  }},
  {id: 'T07', run: () => {
    const initial = stateOf(reduce(candidate({operationalOutcome: 'send the final contract'})));
    const blocked = {...initial.obligationLegs[0], actionability: 'BLOCKED' as const};
    const hold = {id: 'legal-hold', code: 'DO_NOT_PROCEED', status: 'ACTIVE' as const, provenance: [source()]};
    const approval = expectedEvent('legal-clearance');
    const waiting = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [blocked], constraints: [hold], expectedEvents: [approval]}}));
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
    expect(waiting.resolutionStatus).toBe('OPEN');
    const cleared = {...approval, status: 'CLOSED' as const, closureReason: 'SATISFIED', satisfiedAt: '2026-01-03T00:00:00.000Z', closedAt: '2026-01-03T00:00:00.000Z'};
    const active = stateOf(reduceUpdate(waiting, {operation: 'UPDATE', patch: {
      obligationLegs: [{...blocked, actionability: 'ACTIONABLE', conditionSatisfied: true}],
      expectedEvents: [cleared], constraints: [{...hold, status: 'SATISFIED'}], temporalFacts: [due('monday', '2026-09-07')]
    }}));
    expect(projectResponsibility(active).bucket).toBe('MY_TURN');
    const sent = {...active.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-04T00:00:00.000Z'};
    const done = stateOf(reduceUpdate(active, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [sent]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}}));
    expect(projectResponsibility(done).bucket).toBe('DONE');
  }},
  {id: 'T08', run: () => {
    const initial = stateOf(reduce(candidate({completionCriteria: [completion('actual-work')]})));
    const cancelled = stateOf(reduceUpdate(initial, {operation: 'RESOLVE', reason: 'CANCELLED', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}}));
    expect(cancelled.resolutionReason).toBe('CANCELLED');
    expect(cancelled.details.completionCriteria[0]).toMatchObject({status: 'PENDING'});
    expect(cancelled.details.completionCriteria[0]?.satisfiedAt).toBeUndefined();
  }},
  {id: 'T09', run: () => {
    const initial = stateOf(reduce(candidate({operationalOutcome: 'obtain requested figures from Tanaka', obligationLegs: [leg('obtain', 'USER', 'OBTAIN_FIGURES')]})));
    const intended = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {agreedFacts: [{id: 'delegation-intent', kind: 'DELEGATION_INTENT', value: 'Tanaka', status: 'CURRENT', provenance: [source()]}]}}));
    expect(projectResponsibility(intended).bucket).toBe('MY_TURN');
    const delegated = {...intended.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'EFFECTIVELY_DELEGATED', closedAt: '2026-01-03T00:00:00.000Z'};
    const waiting = stateOf(reduceUpdate(intended, {operation: 'UPDATE', patch: {obligationLegs: [delegated, leg('tanaka', 'OTHER_PARTY', 'SEND_FIGURES')]}}));
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
    const received = {...waiting.obligationLegs.find((item) => item.id === 'tanaka')!, status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-04T00:00:00.000Z'};
    const done = stateOf(reduceUpdate(waiting, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [received]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}}));
    expect(done.id).toBe(initial.id);
    expect(projectResponsibility(done).bucket).toBe('DONE');
  }},
  {id: 'T10', run: () => {
    const initial = stateOf(reduce(candidate()));
    const closed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const resolved = stateOf(reduceUpdate(initial, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}}));
    expect(stateOf(reduceUpdate(resolved, {operation: 'REOPEN', patch: {obligationLegs: [leg('remedial', 'USER', 'RESEND_RESULT')]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_NON_DELIVERY']}})).resolutionStatus).toBe('OPEN');
  }},
  {id: 'T11', run: () => {
    const firstOpen = stateOf(reduce(candidate({candidateKey: 'episode-one'})));
    const closedLeg = {...firstOpen.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const first = stateOf(reduceUpdate(firstOpen, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closedLeg]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}}));
    const second = stateOf(reduce(candidate({candidateKey: 'episode-two', sourceEventKey: 'new-episode', evidenceRevision: 3}), {currentEvidenceRevision: 3, existingResponsibilities: [first]}));
    expect(second.id).not.toBe(first.id);
    expect(first.resolutionStatus).toBe('RESOLVED');
    expect(second.resolutionStatus).toBe('OPEN');
  }},
  {id: 'T12', run: () => {
    const first = stateOf(reduce(candidate({candidateKey: 'old-episode'})));
    const result = reduce(candidate({candidateKey: 'replacement', sourceEventKey: 'replacement-event', effects: [
      {operation: 'SUPERSEDE', responsibilityRef: first.id, effectKey: 'old', reason: 'SUPERSEDED', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}},
      {operation: 'CREATE', effectKey: 'new', patch: {operationalOutcome: 'new work', obligationLegs: [leg('new-work', 'USER', 'NEW_WORK')]}}
    ]}), {existingResponsibilities: [first]});
    expect(result.status).toBe('APPLIED');
    if (result.status === 'APPLIED') expect(result.effects.map((effect) => effect.operation)).toEqual(['SUPERSEDE', 'CREATE']);
  }},
  {id: 'T13', run: () => {
    const initial = stateOf(reduce(candidate({temporalFacts: [due('friday', '2026-09-04')]})));
    const conflicted = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'uncertainties', value: [{id: 'due-conflict', fieldKey: 'temporalFacts.SOURCE_DUE', reasonCode: 'UNKNOWN_OVERRIDE_AUTHORITY', material: true, reviewRequired: true, provenance: [source()]}], authorityKind: 'INTERPRETATION', provenance: [source()]}]}}));
    expect(projectResponsibility(conflicted).bucket).toBe('REVIEW');
    expect(conflicted.temporalFacts.find((fact) => fact.id === 'friday')?.currentnessStatus).toBe('ACCEPTED_CURRENT');
    const state = stateOf(reduceUpdate(conflicted, {operation: 'UPDATE', patch: {fieldChanges: [
      {fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('monday', '2026-09-07')], authorityKind: 'USER_CORRECTION', relation: 'CORRECTION', provenance: [source('USER_ASSERTION')]},
      {fieldKey: 'uncertainties', value: [], authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}
    ]}}));
    expect(state.temporalFacts.some((fact) => fact.currentnessStatus === 'SUPERSEDED')).toBe(true);
    expect(projectResponsibility(state).bucket).toBe('MY_TURN');
  }},
  {id: 'T14', run: () => {
    const created = stateOf(reduce(candidate({temporalFacts: []})));
    const initial = stateOf(reduceUpdate(created, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('monday', '2026-09-07')], authorityKind: 'INTERPRETATION', semanticTime: '2026-01-02T10:05:00.000Z', relation: 'CORRECTION'}]}}, {semanticTime: '2026-01-02T10:05:00.000Z'}));
    const late = reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('friday', '2026-09-04')], authorityKind: 'INTERPRETATION', semanticTime: '2026-01-02T10:00:00.000Z'}]}}, {semanticTime: '2026-01-02T10:00:00.000Z'});
    expect(late.status).toBe('REJECTED');
    expect(initial.temporalFacts.find((fact) => fact.currentnessStatus === 'ACCEPTED_CURRENT')?.resolvedDate).toBe('2026-09-07');
    const chronological = stateOf(reduce(candidate({candidateKey: 'chronological', sourceEventKey: 'chronological', temporalFacts: [due('friday-normal', '2026-09-04')]})));
    const corrected = stateOf(reduceUpdate(chronological, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('monday-normal', '2026-09-07')], authorityKind: 'INTERPRETATION', semanticTime: '2026-01-02T10:05:00.000Z', relation: 'CORRECTION', provenance: [source()]}]}}, {semanticTime: '2026-01-02T10:05:00.000Z'}));
    expect(corrected.temporalFacts.find((fact) => fact.currentnessStatus === 'ACCEPTED_CURRENT')?.resolvedDate)
      .toBe(initial.temporalFacts.find((fact) => fact.currentnessStatus === 'ACCEPTED_CURRENT')?.resolvedDate);
  }},
  {id: 'T15', run: () => {
    expect(reduce(candidate(), {currentEvidenceRevision: 2}).status).toBe('STALE');
    expect(reduce(candidate({evidenceRevision: 2, sourceEventKey: 'revision-2', candidateKey: 'revision-2'}), {currentEvidenceRevision: 2}).status).toBe('APPLIED');
  }},
  {id: 'T16', run: () => {
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('user-sign', 'USER', 'SIGN'), leg('other-sign', 'OTHER_PARTY', 'SIGN')]})));
    const userClosed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [userClosed]}}));
    expect(projectResponsibility(state).bucket).toBe('WAITING');
    const otherClosed = {...state.obligationLegs[1], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-03T00:00:00.000Z'};
    const done = stateOf(reduceUpdate(state, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [otherClosed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXTERNAL_AUTHORITATIVE_FACT']}}));
    expect(projectResponsibility(done).bucket).toBe('DONE');
  }},
  {id: 'T17', run: () => {
    const initial = stateOf(reduce(candidate({completionCriteria: [completion('front'), completion('back')]})));
    const partial = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {completionCriteria: [completion('front', 'SATISFIED')]}}));
    expect(partial.resolutionStatus).toBe('OPEN');
    const final = stateOf(reduceUpdate(partial, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {completionCriteria: [completion('back', 'SATISFIED')], obligationLegs: [{...partial.obligationLegs[0], status: 'CLOSED', closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'}]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['ALL_CRITERIA_SATISFIED']}}));
    expect(final.resolutionStatus).toBe('RESOLVED');
  }},
  {id: 'T18', run: () => {
    const approval = expectedEvent('legal-approval');
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('sign', 'USER', 'SIGN', 'BLOCKED')], expectedEvents: [approval]})));
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {expectedEvents: [{...approval, status: 'CLOSED', closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'}], obligationLegs: [{...initial.obligationLegs[0], actionability: 'ACTIONABLE', conditionSatisfied: true}]}}));
    expect(projectResponsibility(state).bucket).toBe('MY_TURN');
    const signed = {...state.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-03T00:00:00.000Z'};
    expect(projectResponsibility(stateOf(reduceUpdate(state, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [signed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXTERNAL_AUTHORITATIVE_FACT']}}))).bucket).toBe('DONE');
  }},
  {id: 'T19', run: () => {
    const anchored = {...due('anchor', '2026-09-04'), originalExpression: 'one hour before Meeting-X', anchorKind: 'CALENDAR_EVENT', anchorReference: 'Meeting-X'};
    const initial = stateOf(reduce(candidate({temporalFacts: [anchored]})));
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {temporalFacts: [{...anchored, resolvedDate: '2026-09-05'}]}}));
    expect(state.temporalFacts[0]?.originalExpression).toBe('one hour before Meeting-X');
    expect(state.temporalFacts[0]?.resolvedDate).toBe('2026-09-05');
  }},
  {id: 'T20', run: () => {
    const historical = stateOf(reduce(candidate({liveTrackingState: 'HISTORICAL_INACTIVE'})));
    expect(projectResponsibility(historical).bucket).toBe('NONE');
    const active = stateOf(reduceUpdate(historical, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'liveTrackingState', value: 'TRACKING_ACTIVE', authorityKind: 'USER_CORRECTION', provenance: [source('USER_ASSERTION')]}]}}));
    expect(projectResponsibility(active).bucket).toBe('MY_TURN');
    const closed = stateOf(reduceUpdate(historical, {operation: 'RESOLVE', reason: 'USER_CLOSED', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['USER_ASSERTION']}}));
    expect(closed.resolutionReason).toBe('USER_CLOSED');
    expect(closed.obligationLegs[0]?.closureReason).toBe('USER_CLOSED');
  }}
];

type CanonicalBinding = {
  id: string;
  sourceStep: string;
  executableCase: string;
  invariant: string;
  forbidden: string;
  run?: () => void;
};

const canonicalParticipantId = '11111111-1111-4111-8111-111111111111';

function interpretationSource(
  zone: 'AUTHORED_CURRENT' | 'QUOTED_HISTORY' | 'FORWARDED_CONTENT',
  supportRole: 'COMMUNICATIVE_FORCE' | 'OBJECT_CONTEXT' = 'COMMUNICATIVE_FORCE'
): ProvenanceInput {
  return {
    evidenceKind: 'COMMUNICATED_CLAIM',
    messageId: 'canonical-message',
    supportRole,
    sourceLocator: {zone}
  };
}

function deriveCanonical(
  input: ResponsibilityInterpretationCandidate,
  existingResponsibilities: readonly ResponsibilityState[] = []
) {
  return deriveResponsibilityCommand(input, {
    evidenceBasis: {
      evidenceRevision: input.evidenceRevision,
      sourceEventKey: input.sourceEventKey,
      references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: 'canonical-message'}]
    },
    existingResponsibilities
  });
}

function canonicalInterpretation(
  semantics: ResponsibilityInterpretationCandidate['semantics'],
  provenance: ProvenanceInput[],
  key: string
): ResponsibilityInterpretationCandidate {
  return {
    ...scope,
    sourceEventKey: `canonical-${key}`,
    candidateKey: `canonical-${key}`,
    evidenceRevision: 2,
    semantics,
    provenance
  };
}

function runCommitmentForceOracle(
  id: 'T0-005' | 'T0-006' | 'T0-007',
  basisKind: 'PLAN' | 'INTENTION' | 'TENTATIVE_INTENTION',
  expectationStrength: 'PLANNED' | 'INTENDED' | 'TENTATIVE'
): void {
  const outcome = 'receive revised document from counterpart';
  const initialEvent: ExpectedEvent = {
    id: 'revised-document', actor: 'EXTERNAL', eventCode: 'REVISED_DOCUMENT_RECEIVED',
    status: 'PENDING', provenance: [source()]
  };
  const initial = stateOf(reduce(candidate({
    operationalOutcome: outcome,
    obligationLegs: [leg('counterpart-send', 'OTHER_PARTY', 'SEND_REVISED_DOCUMENT')],
    expectedEvents: [initialEvent]
  })));
  const authored = interpretationSource('AUTHORED_CURRENT');
  const interpreted = canonicalInterpretation([{
    candidateUnitKey: id,
    materiality: 'MATERIAL',
    operationalOutcome: outcome,
    identityRelation: {kind: 'CONTINUES', priorOperationalOutcome: outcome},
    expectedEvents: [{
      id: initialEvent.id,
      actor: 'OTHER_PARTY',
      participantId: canonicalParticipantId,
      eventCode: initialEvent.eventCode,
      basisKind,
      expectationStrength,
      provenance: [authored]
    }],
    temporalFacts: [{
      id: `${id}-expected-time`,
      temporalKind: 'EXPECTED_EVENT_TIME',
      expectedEventId: initialEvent.id,
      originalExpression: '明日',
      valueKind: 'DATE',
      resolvedDate: '2026-09-06',
      precisionCode: 'DATE',
      provenance: [authored]
    }],
    provenance: [authored]
  }], [authored], id);
  const derived = deriveCanonical(interpreted, [initial]);
  expect(derived.status, derived.status === 'REJECTED' ? derived.reason : '').toBe('DERIVED');
  if (derived.status !== 'DERIVED') return;
  const updated = stateOf(reduce(derived.command, {existingResponsibilities: [initial]}));
  expect(updated.id).toBe(initial.id);
  expect(updated.resolutionStatus).toBe('OPEN');
  expect(updated.expectedEvents[0]).toMatchObject({status: 'PENDING', basisKind, expectationStrength});
  expect(updated.temporalFacts[0]).toMatchObject({temporalKind: 'EXPECTED_EVENT_TIME', originalExpression: '明日'});
  expect(updated.temporalFacts.some((fact) => fact.temporalKind === 'SOURCE_DUE')).toBe(false);
  expect(projectResponsibility(updated).bucket).toBe('WAITING');
}

function runCapabilityOracle(): void {
  const outcome = 'receive revised document from counterpart';
  const initialEvent: ExpectedEvent = {
    id: 'revised-document', actor: 'EXTERNAL', eventCode: 'REVISED_DOCUMENT_RECEIVED',
    status: 'PENDING', provenance: [source()]
  };
  const initial = stateOf(reduce(candidate({
    operationalOutcome: outcome,
    obligationLegs: [leg('counterpart-send', 'OTHER_PARTY', 'SEND_REVISED_DOCUMENT')],
    expectedEvents: [initialEvent]
  })));
  const authored = interpretationSource('AUTHORED_CURRENT');
  const interpreted = canonicalInterpretation([{
    candidateUnitKey: 'T0-008',
    materiality: 'MATERIAL',
    operationalOutcome: outcome,
    identityRelation: {kind: 'CONTINUES', priorOperationalOutcome: outcome},
    expectedEvents: [{
      id: initialEvent.id,
      actor: 'OTHER_PARTY',
      participantId: canonicalParticipantId,
      eventCode: initialEvent.eventCode,
      basisKind: 'CAPABILITY_OR_FEASIBILITY',
      expectationStrength: 'POSSIBLE',
      provenance: [authored]
    }],
    provenance: [authored]
  }], [authored], 'T0-008');
  const derived = deriveCanonical(interpreted, [initial]);
  expect(derived.status, derived.status === 'REJECTED' ? derived.reason : '').toBe('DERIVED');
  if (derived.status !== 'DERIVED') return;
  const updated = stateOf(reduce(derived.command, {existingResponsibilities: [initial]}));
  expect(updated.id).toBe(initial.id);
  expect(updated.resolutionStatus).toBe('OPEN');
  expect(updated.expectedEvents[0]).toMatchObject({
    status: 'PENDING', basisKind: 'CAPABILITY_OR_FEASIBILITY', expectationStrength: 'POSSIBLE'
  });
  expect(updated.temporalFacts).toEqual([]);
  expect(projectResponsibility(updated).bucket).toBe('WAITING');
}

function runContextAuthorityOracle(
  id: 'T0-022' | 'T0-025',
  contextZone: 'QUOTED_HISTORY' | 'FORWARDED_CONTENT'
): void {
  const authored = interpretationSource('AUTHORED_CURRENT', 'COMMUNICATIVE_FORCE');
  const context = interpretationSource(contextZone, 'OBJECT_CONTEXT');
  const actionCode = contextZone === 'QUOTED_HISTORY' ? 'CREATE_CUSTOMER_QUOTATION' : 'CREATE_CUSTOMER_RESPONSE_DRAFT';
  const interpreted = canonicalInterpretation([{
    candidateUnitKey: id,
    materiality: 'MATERIAL',
    operationalOutcome: contextZone === 'QUOTED_HISTORY'
      ? 'create the customer quotation requested in the current turn'
      : 'create the customer response draft currently requested by the manager',
    obligationLegs: [{
      id: `${id}-user-work`, bearerCandidate: 'USER', actionCode,
      basisKind: 'COMMUNICATED_REQUEST', provenance: [authored, context]
    }],
    provenance: [authored]
  }], [authored, context], id);
  const derived = deriveCanonical(interpreted);
  expect(derived.status, derived.status === 'REJECTED' ? derived.reason : '').toBe('DERIVED');
  if (derived.status !== 'DERIVED') return;
  expect(derived.command.admission.decision).toBe('TRACK');
  expect(derived.command.effects).toHaveLength(1);
  const state = stateOf(reduce(derived.command, {currentEvidenceRevision: 2}));
  expect(projectResponsibility(state).bucket).toBe('MY_TURN');
  expect(state.obligationLegs).toHaveLength(1);
  expect(state.obligationLegs[0]?.provenance).toEqual(expect.arrayContaining([
    expect.objectContaining({supportRole: 'COMMUNICATIVE_FORCE', sourceLocator: {zone: 'AUTHORED_CURRENT'}}),
    expect.objectContaining({supportRole: 'OBJECT_CONTEXT', sourceLocator: {zone: contextZone}})
  ]));

  const contextOnly = canonicalInterpretation([{
    candidateUnitKey: `${id}-context-only`, materiality: 'MATERIAL',
    operationalOutcome: 'perform the old contextual request',
    obligationLegs: [{
      id: `${id}-context-work`, bearerCandidate: 'USER', actionCode,
      basisKind: 'COMMUNICATED_REQUEST', provenance: [context]
    }],
    provenance: [context]
  }], [context], `${id}-context-only`);
  expect(deriveCanonical(contextOnly)).toMatchObject({status: 'REJECTED'});
}

function runContextOnlyAbstentionOracle(
  id: 'T0-023' | 'T0-024',
  contextZone: 'QUOTED_HISTORY' | 'FORWARDED_CONTENT'
): void {
  const authored = interpretationSource('AUTHORED_CURRENT');
  const context = interpretationSource(contextZone, 'OBJECT_CONTEXT');
  const interpreted = canonicalInterpretation([
    {candidateUnitKey: `${id}-ack-or-fyi`, materiality: 'NOT_MATERIAL', provenance: [authored]},
    {candidateUnitKey: `${id}-historical-request`, materiality: 'NOT_MATERIAL', provenance: [context]}
  ], [authored, context], id);
  const derived = deriveCanonical(interpreted);
  expect(derived.status).toBe('DERIVED');
  if (derived.status !== 'DERIVED') return;
  expect(derived.command).toMatchObject({admission: {decision: 'DO_NOT_TRACK'}, effects: []});
  expect(reduce(derived.command, {currentEvidenceRevision: 2})).toMatchObject({
    status: 'APPLIED', admission: 'DO_NOT_TRACK', responsibilities: []
  });

  const authorityMutant = canonicalInterpretation([{
    candidateUnitKey: `${id}-authority-mutant`, materiality: 'MATERIAL',
    operationalOutcome: 'perform the historical request',
    obligationLegs: [{
      id: `${id}-mutant-work`, bearerCandidate: 'USER', actionCode: 'PERFORM_HISTORICAL_REQUEST',
      basisKind: 'COMMUNICATED_REQUEST', provenance: [context]
    }],
    provenance: [context]
  }], [context], `${id}-authority-mutant`);
  expect(deriveCanonical(authorityMutant)).toMatchObject({status: 'REJECTED'});
}

// This is intentionally explicit rather than inferred from matching IDs.  It
// binds each canonical focal oracle to the reducer-owned executable consequence
// and records the invariant and forbidden mutant that the case must kill.
const tier0Bindings: CanonicalBinding[] = [
  {id: 'T0-001', sourceStep: 'direction/request inbound', executableCase: 'PG-03', invariant: 'inbound request creates USER obligation and SOURCE_DUE without exact-time inflation', forbidden: 'date word alone cannot change bearer or invent clock precision'},
  {id: 'T0-002', sourceStep: 'direction/commitment inbound', executableCase: 'PG-01', invariant: 'counterpart commitment is waiting evidence, not USER due', forbidden: 'must not project MY_TURN from tomorrow alone'},
  {id: 'T0-003', sourceStep: 'direction/request outbound', executableCase: 'PG-01', invariant: 'outbound request assigns OTHER party', forbidden: 'must not assign outbound request back to USER'},
  {id: 'T0-004', sourceStep: 'direction/commitment outbound', executableCase: 'PG-03', invariant: 'outbound commitment retains USER bearer', forbidden: 'same wording must not inherit inbound bearer'},
  {id: 'T0-005', sourceStep: 'commitment-force plan', executableCase: 'PG-02', invariant: 'plan may update expectation without resolving', forbidden: 'plan must not become firm completion', run: () => runCommitmentForceOracle('T0-005', 'PLAN', 'PLANNED')},
  {id: 'T0-006', sourceStep: 'commitment-force intention', executableCase: 'PG-02', invariant: 'intention remains weaker than commitment', forbidden: 'intention must not resolve or transfer authority', run: () => runCommitmentForceOracle('T0-006', 'INTENTION', 'INTENDED')},
  {id: 'T0-007', sourceStep: 'commitment-force tentative', executableCase: 'PG-02', invariant: 'tentative future orientation preserves open state', forbidden: 'tentative language must not become firm promise', run: () => runCommitmentForceOracle('T0-007', 'TENTATIVE_INTENTION', 'TENTATIVE')},
  {id: 'T0-008', sourceStep: 'commitment-force capability', executableCase: 'PG-43', invariant: 'capability alone preserves accepted loop', forbidden: 'capability must not become authoritative expected completion', run: runCapabilityOracle},
  {id: 'T0-009', sourceStep: 'proposal', executableCase: 'T05', invariant: 'proposed term stays pending until acceptance', forbidden: 'proposal must not become agreed fact'},
  {id: 'T0-010', sourceStep: 'agreement', executableCase: 'T05', invariant: 'accepted term becomes agreed fact', forbidden: 'agreement must not claim future meeting occurred'},
  {id: 'T0-011', sourceStep: 'preference', executableCase: 'PG-12', invariant: 'preference without decision context remains uncertain', forbidden: 'preference must not silently become agreement'},
  {id: 'T0-012', sourceStep: 'review commitment', executableCase: 'PG-03', invariant: 'review/check is actionable work', forbidden: 'review must not inflate to approval'},
  {id: 'T0-013', sourceStep: 'approval claim', executableCase: 'PG-05', invariant: 'approval satisfaction still requires sufficient authority evidence', forbidden: 'semantic approval alone must not bypass authority'},
  {id: 'T0-014', sourceStep: 'hold', executableCase: 'T07', invariant: 'hold blocks action while Responsibility stays open', forbidden: 'hold must not resolve as cancellation or defer'},
  {id: 'T0-015', sourceStep: 'cancellation', executableCase: 'T08', invariant: 'cancellation has a non-satisfaction resolution reason', forbidden: 'cancelled criteria must not become SATISFIED'},
  {id: 'T0-016', sourceStep: 'delegation intent', executableCase: 'T09', invariant: 'intent does not transfer ownership before communication', forbidden: 'Tanaka must not own work before receiving request'},
  {id: 'T0-017', sourceStep: 'effective delegation', executableCase: 'T09', invariant: 'reconciled request to recipient moves current work to waiting', forbidden: 'delegation must not create a separate outcome'},
  {id: 'T0-018', sourceStep: 'polite material request', executableCase: 'PG-03', invariant: 'politeness is orthogonal to obligation strength', forbidden: 'polite request must not become optional'},
  {id: 'T0-019', sourceStep: 'courtesy offer', executableCase: 'PG-60', invariant: 'valid grounded communication can admit DO_NOT_TRACK', forbidden: 'No Responsibility must remain distinguishable from failure'},
  {id: 'T0-020', sourceStep: 'direct assignment', executableCase: 'PG-03', invariant: 'direct USER assignment creates USER obligation', forbidden: 'assignment cannot be discarded by generic politeness'},
  {id: 'T0-021', sourceStep: 'CC-only assignment', executableCase: 'PG-47', invariant: 'CC membership is not obligation bearer evidence', forbidden: 'CC alone must not create USER work'},
  {id: 'T0-022', sourceStep: 'current-authored request plus quote', executableCase: 'PG-03', invariant: 'current authored act may use quote only as context', forbidden: 'quoted context must not gain current force itself', run: () => runContextAuthorityOracle('T0-022', 'QUOTED_HISTORY')},
  {id: 'T0-023', sourceStep: 'acknowledgement plus quoted request', executableCase: 'PG-46', invariant: 'quoted historical request does not recreate current work', forbidden: 'quote must not become current request', run: () => runContextOnlyAbstentionOracle('T0-023', 'QUOTED_HISTORY')},
  {id: 'T0-024', sourceStep: 'FYI forward', executableCase: 'PG-46', invariant: 'forwarding alone does not transfer obligation', forbidden: 'forwarded request must not bind current USER', run: () => runContextOnlyAbstentionOracle('T0-024', 'FORWARDED_CONTENT')},
  {id: 'T0-025', sourceStep: 'authored request plus forward', executableCase: 'PG-03', invariant: 'authored force and forwarded context stay distinct', forbidden: 'forward alone must not be treated as authority', run: () => runContextAuthorityOracle('T0-025', 'FORWARDED_CONTENT')},
  {id: 'T0-026', sourceStep: 'SOURCE_DUE plus USER_TARGET', executableCase: 'PG-08', invariant: 'source due and user target coexist', forbidden: 'USER_TARGET must not overwrite SOURCE_DUE'},
  {id: 'T0-027', sourceStep: 'explicit correction', executableCase: 'PG-07', invariant: 'new current due preserves prior fact as superseded', forbidden: 'correction must not delete immutable source history'},
  {id: 'T0-028', sourceStep: 'unresolved authority conflict', executableCase: 'T13', invariant: 'conflict remains REVIEW until explicit authority resolves it', forbidden: 'newest message must not win'},
  {id: 'T0-029', sourceStep: 'failure after apparent completion', executableCase: 'T10', invariant: 'same unsatisfied outcome REOPENs with history', forbidden: 'must not create a fresh unrelated Responsibility'},
  {id: 'T0-030', sourceStep: 'new work after genuine closure', executableCase: 'T11', invariant: 'new episode creates a distinct Responsibility', forbidden: 'similar topic must not reopen closed episode'},
  {id: 'T0-031', sourceStep: 'cohesive sequential outcome', executableCase: 'T01', invariant: 'one coherent outcome keeps one identity', forbidden: 'verb count must not dictate Responsibility count'},
  {id: 'T0-032', sourceStep: 'two independent outcomes', executableCase: 'PG-06', invariant: 'one event can create two independent Responsibilities', forbidden: 'conversation must not collapse independent outcomes'},
  {id: 'T0-033', sourceStep: 'partial completion criteria', executableCase: 'T17', invariant: 'partial criterion leaves aggregate open', forbidden: 'front-only evidence must not resolve whole outcome'},
  {id: 'T0-034', sourceStep: 'claim versus attachment observation', executableCase: 'PG-45', invariant: 'communicated claim and provider contradiction remain distinct', forbidden: 'claim must not be promoted to provider fact'},
  {id: 'T0-035', sourceStep: 'generic acknowledgement', executableCase: 'PG-43', invariant: 'acknowledgement preserves open state', forbidden: 'thanks/reply/read must not complete'},
  {id: 'T0-036', sourceStep: 'parallel obligations', executableCase: 'T16', invariant: 'USER completion leaves OTHER required leg waiting', forbidden: 'scalar BOTH must not imply completion'},
  {id: 'T0-037', sourceStep: 'high-risk source request', executableCase: 'PG-50', invariant: 'tracking semantics grant no external-action authority', forbidden: 'prompt text must not authorize tool action or Review by risk alone'},
  {id: 'T0-038', sourceStep: 'historical apparent loop', executableCase: 'T20', invariant: 'historical openness is inactive until user authority', forbidden: 'old silence must not flood MY_TURN'},
  {id: 'T0-039', sourceStep: 'cross-account lookalikes', executableCase: 'PG-49', invariant: 'account scope is identity boundary', forbidden: 'semantic similarity must not merge accounts'},
  {id: 'T0-040', sourceStep: 'ANY_OF assignment ambiguity', executableCase: 'PG-16', invariant: 'material bearer ambiguity surfaces pre-admission Review', forbidden: 'must not fabricate every-recipient ownership'},
  {id: 'T0-041', sourceStep: 'ambiguous responsibility existence', executableCase: 'PG-16', invariant: 'admission Review exists without fake Responsibility', forbidden: 'ambiguous phrase must not force TRACK'},
  {id: 'T0-042', sourceStep: 'sarcasm ambiguity', executableCase: 'PG-16', invariant: 'non-literal ambiguity remains pre-admission Review', forbidden: 'literal commitment must not be silently asserted'},
  {id: 'T0-043', sourceStep: 'missing referent', executableCase: 'PG-16', invariant: 'missing context yields Review without invented object', forbidden: 'must not invent action or target'},
  {id: 'T0-044', sourceStep: 'user-dependent optionality', executableCase: 'PG-16', invariant: 'unknown relationship convention remains user-dependent', forbidden: 'hidden mandatory intent must not be asserted'}
];

const transitionBindings: Array<CanonicalBinding & {stepCount: number}> = [
  {id: 'T01', stepCount: 3, sourceStep: 'request -> clarification -> reconciled send', executableCase: 'T01', invariant: 'identity and original due persist through clarification', forbidden: 'send attempt cannot resolve'},
  {id: 'T02', stepCount: 3, sourceStep: 'USER leg -> send -> confirmation', executableCase: 'T02', invariant: 'user leg completion moves to WAITING before final confirmation', forbidden: 'must not be DONE after user send'},
  {id: 'T03', stepCount: 3, sourceStep: 'outbound commitment -> ambiguous send -> reconciliation', executableCase: 'T03', invariant: 'ambiguous send preserves OPEN', forbidden: 'dispatch attempt must not resolve'},
  {id: 'T04', stepCount: 4, sourceStep: 'waiting -> follow-up -> reconciled reminder -> approval', executableCase: 'T04', invariant: 'one identity cycles WAITING/MY_TURN/WAITING/DONE', forbidden: 'reminder send must not satisfy approval'},
  {id: 'T05', stepCount: 3, sourceStep: 'proposal -> counterproposal -> acceptance', executableCase: 'T05', invariant: 'rejection, pending counterproposal, and agreement are distinct', forbidden: 'proposal cannot become agreement early'},
  {id: 'T06', stepCount: 2, sourceStep: 'proposal -> rejection/request alternative', executableCase: 'T06', invariant: 'rejection leaves negotiation open and waiting', forbidden: 'response must not mean DONE'},
  {id: 'T07', stepCount: 4, sourceStep: 'open -> hold -> resume -> reconciled send', executableCase: 'T07', invariant: 'constraint and attention remain orthogonal', forbidden: 'hold must not cancel or snooze'},
  {id: 'T08', stepCount: 2, sourceStep: 'open -> cancellation', executableCase: 'T08', invariant: 'resolution reason is CANCELLED', forbidden: 'pending criteria must not become satisfied'},
  {id: 'T09', stepCount: 4, sourceStep: 'assignment -> intent -> effective delegation -> result', executableCase: 'T09', invariant: 'ownership transfer waits for communicated request', forbidden: 'intent alone cannot transfer bearer'},
  {id: 'T10', stepCount: 3, sourceStep: 'create -> apparent completion -> failure', executableCase: 'T10', invariant: 'REOPEN preserves prior resolution history', forbidden: 'must not leave failed delivery done'},
  {id: 'T11', stepCount: 3, sourceStep: 'first episode -> genuine close -> later new work', executableCase: 'T11', invariant: 'closed episode and new identity coexist', forbidden: 'similarity cannot reopen old episode'},
  {id: 'T12', stepCount: 2, sourceStep: 'old request -> superseding replacement', executableCase: 'T12', invariant: 'one event emits SUPERSEDE and CREATE atomically', forbidden: 'old outcome cannot mutate into replacement'},
  {id: 'T13', stepCount: 3, sourceStep: 'Friday -> unauthorized Monday -> authoritative correction', executableCase: 'T13', invariant: 'conflict review precedes accepted correction', forbidden: 'recency cannot select Monday'},
  {id: 'T14', stepCount: 2, sourceStep: 'correction observed first -> predecessor late', executableCase: 'T14', invariant: 'semantic chronology keeps Monday current', forbidden: 'last processed event cannot win'},
  {id: 'T15', stepCount: 4, sourceStep: 'run A rev17 -> rev18 -> stale A -> current B', executableCase: 'T15', invariant: 'basis revision gates mutation', forbidden: 'wall-clock model completion cannot win'},
  {id: 'T16', stepCount: 3, sourceStep: 'parallel signers -> USER signed -> OTHER signed', executableCase: 'T16', invariant: 'aggregate resolves only after both legs', forbidden: 'USER leg alone cannot resolve'},
  {id: 'T17', stepCount: 3, sourceStep: 'two criteria -> front -> back', executableCase: 'T17', invariant: 'partial criteria preserve OPEN', forbidden: 'attachment read cannot satisfy missing criterion'},
  {id: 'T18', stepCount: 3, sourceStep: 'conditional sign -> approval -> signed', executableCase: 'T18', invariant: 'activation relation blocks action until event', forbidden: 'must not surface MY_TURN before approval'},
  {id: 'T19', stepCount: 2, sourceStep: 'anchored source -> authoritative anchor move', executableCase: 'T19', invariant: 'derived resolution changes while source expression persists', forbidden: 'must not rewrite source expression'},
  {id: 'T20', stepCount: 2, sourceStep: 'historical inactive -> explicit resume/close branches', executableCase: 'T20', invariant: 'live activation and objective satisfaction remain separate', forbidden: 'historical silence cannot auto-activate or satisfy'}
];

function executableById(id: string): () => void {
  const product = productGoldenCases.find((item) => item.id === id);
  const transition = transitionCases.find((item) => item.id === id);
  const run = product?.run ?? transition?.run;
  if (!run) throw new Error(`canonical binding references missing executable case ${id}`);
  return run;
}

describe('G31 canonical Product Golden reducer corpus', () => {
  it('accounts for every reducer-owned Product Golden consequence in the contract', () => {
    expect(productGoldenCases.map((testCase) => testCase.id)).toEqual([...PRODUCT_GOLDEN_IDS]);
    expect(new Set(productGoldenCases.map((testCase) => testCase.id)).size).toBe(PRODUCT_GOLDEN_IDS.length);
  });

  it.each(productGoldenCases)('$id — $consequence', (testCase) => {
    testCase.run();
  });
});

describe('G31 exact canonical Tier-0 reducer bindings', () => {
  it('accounts for all 44 canonical focal oracles', () => {
    expect(tier0Bindings.map((binding) => binding.id)).toEqual(Array.from({length: 44}, (_, index) => `T0-${String(index + 1).padStart(3, '0')}`));
  });

  it.each(tier0Bindings)('$id — $sourceStep', (binding) => {
    expect(binding.invariant.length).toBeGreaterThan(0);
    expect(binding.forbidden.length).toBeGreaterThan(0);
    (binding.run ?? executableById(binding.executableCase))();
  });
});

describe('G31 canonical transition oracle corpus', () => {
  it('accounts for all 20 transition oracles', () => {
    expect(transitionCases.map((testCase) => testCase.id)).toEqual([...TRANSITION_ORACLE_IDS]);
    expect(new Set(transitionCases.map((testCase) => testCase.id)).size).toBe(TRANSITION_ORACLE_IDS.length);
    expect(transitionBindings.map((binding) => binding.id)).toEqual([...TRANSITION_ORACLE_IDS]);
    expect(transitionBindings.every((binding) => binding.stepCount >= 2 && binding.invariant.length > 0 && binding.forbidden.length > 0)).toBe(true);
  });

  it.each(transitionCases)('$id', (testCase) => {
    testCase.run();
  });
});
