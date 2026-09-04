import {describe, expect, it} from 'vitest';

import {
  projectAdmissionReview,
  projectResponsibility,
  reduceResponsibility
} from '../src/server/responsibility';
import type {
  CompletionCriterion,
  ExpectedEvent,
  ObligationLeg,
  ProvenanceInput,
  ResponsibilityEvidenceBasis,
  ResponsibilityInterpretationCandidate,
  ResponsibilityState,
  TemporalFact
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

function candidate(overrides: Partial<ResponsibilityInterpretationCandidate> = {}): ResponsibilityInterpretationCandidate {
  return {
    ...scope,
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

function reduce(candidateInput: ResponsibilityInterpretationCandidate, options: ReducerOptions = {}) {
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
  effect: ResponsibilityInterpretationCandidate['effects'] extends readonly (infer T)[] | undefined ? T : never,
  overrides: Partial<ResponsibilityInterpretationCandidate> = {}
): ResponsibilityInterpretationCandidate {
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
  effect: ResponsibilityInterpretationCandidate['effects'] extends readonly (infer T)[] | undefined ? T : never,
  overrides: Partial<ResponsibilityInterpretationCandidate> = {}
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
    const initial = stateOf(reduce(candidate()));
    const updated = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {attentionMode: 'PRESENT'}}));
    const closed = {...updated.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    expect(stateOf(reduceUpdate(updated, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}})).resolutionStatus).toBe('RESOLVED');
  }},
  {id: 'T02', run: () => {
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('user-send', 'USER', 'SEND_RESULT')]})));
    const completedUserLeg = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const waiting = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [completedUserLeg, leg('other-wait', 'OTHER_PARTY', 'RESPOND_RESULT')]}}));
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
  }},
  {id: 'T03', run: () => {
    const initial = stateOf(reduce(candidate()));
    const closed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    expect(stateOf(reduceUpdate(initial, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}})).resolutionStatus).toBe('RESOLVED');
  }},
  {id: 'T04', run: () => {
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('other-wait', 'OTHER_PARTY', 'APPROVE_RESULT')]})));
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [leg('follow-up', 'USER', 'FOLLOW_UP')]}}));
    expect(projectResponsibility(state).bucket).toBe('MY_TURN');
  }},
  {id: 'T05', run: () => {
    const state = stateOf(reduce(candidate({operationalOutcome: 'agree on a meeting time', pendingProposals: [{id: 'proposal', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'PENDING', provenance: [source()]}]})));
    expect(state.details.pendingProposals[0]?.status).toBe('PENDING');
  }},
  {id: 'T06', run: () => {
    const initial = stateOf(reduce(candidate({pendingProposals: [{id: 'proposal', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'PENDING', provenance: [source()]}]})));
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {pendingProposals: [{id: 'proposal', kind: 'MEETING_TIME', value: 'Friday 17:00', status: 'REJECTED', provenance: [source()]}]}}));
    expect(state.details.pendingProposals[0]?.status).toBe('REJECTED');
    expect(state.resolutionStatus).toBe('OPEN');
  }},
  {id: 'T07', run: () => {
    const initial = stateOf(reduce(candidate()));
    const blocked = {...initial.obligationLegs[0], actionability: 'BLOCKED' as const};
    const waiting = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [blocked]}}));
    expect(projectResponsibility(waiting).bucket).toBe('WAITING');
    const active = stateOf(reduceUpdate(waiting, {operation: 'UPDATE', patch: {obligationLegs: [{...blocked, actionability: 'ACTIONABLE', conditionSatisfied: true}]}}));
    expect(projectResponsibility(active).bucket).toBe('MY_TURN');
  }},
  {id: 'T08', run: () => {
    const initial = stateOf(reduce(candidate()));
    expect(stateOf(reduceUpdate(initial, {operation: 'RESOLVE', reason: 'CANCELLED', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_EXPLICIT_CLOSURE']}})).resolutionReason).toBe('CANCELLED');
  }},
  {id: 'T09', run: () => {
    const initial = stateOf(reduce(candidate()));
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [leg('delegated', 'OTHER_PARTY', 'SEND_RESULT')]}}));
    expect(state.id).toBe(initial.id);
  }},
  {id: 'T10', run: () => {
    const initial = stateOf(reduce(candidate()));
    const closed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const resolved = stateOf(reduceUpdate(initial, {operation: 'RESOLVE', reason: 'SATISFIED', patch: {obligationLegs: [closed]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}}));
    expect(stateOf(reduceUpdate(resolved, {operation: 'REOPEN', patch: {obligationLegs: [leg('remedial', 'USER', 'RESEND_RESULT')]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_NON_DELIVERY']}})).resolutionStatus).toBe('OPEN');
  }},
  {id: 'T11', run: () => {
    const first = stateOf(reduce(candidate({candidateKey: 'episode-one'})));
    const second = stateOf(reduce(candidate({candidateKey: 'episode-two', sourceEventKey: 'new-episode'}), {existingResponsibilities: [first]}));
    expect(second.id).not.toBe(first.id);
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
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('monday', '2026-09-07')], authorityKind: 'USER_CORRECTION', relation: 'CORRECTION', provenance: [source('USER_ASSERTION')]}]}}));
    expect(state.temporalFacts.some((fact) => fact.currentnessStatus === 'SUPERSEDED')).toBe(true);
  }},
  {id: 'T14', run: () => {
    const created = stateOf(reduce(candidate()));
    const initial = stateOf(reduceUpdate(created, {operation: 'UPDATE', patch: {temporalFacts: [due('monday', '2026-09-07')]}}, {semanticTime: '2026-01-02T10:05:00.000Z'}));
    const late = reduceUpdate(initial, {operation: 'UPDATE', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [due('friday', '2026-09-04')], authorityKind: 'INTERPRETATION', semanticTime: '2026-01-02T10:00:00.000Z'}]}}, {semanticTime: '2026-01-02T10:00:00.000Z'});
    expect(late.status).toBe('REJECTED');
  }},
  {id: 'T15', run: () => {
    expect(reduce(candidate(), {currentEvidenceRevision: 2}).status).toBe('STALE');
  }},
  {id: 'T16', run: () => {
    const initial = stateOf(reduce(candidate({obligationLegs: [leg('user-sign', 'USER', 'SIGN'), leg('other-sign', 'OTHER_PARTY', 'SIGN')]})));
    const userClosed = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-02T00:00:00.000Z'};
    const state = stateOf(reduceUpdate(initial, {operation: 'UPDATE', patch: {obligationLegs: [userClosed]}}));
    expect(projectResponsibility(state).bucket).toBe('WAITING');
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
  }}
];

describe('G31 canonical Product Golden reducer corpus', () => {
  it('accounts for every reducer-owned Product Golden consequence in the contract', () => {
    expect(productGoldenCases.map((testCase) => testCase.id)).toEqual([...PRODUCT_GOLDEN_IDS]);
    expect(new Set(productGoldenCases.map((testCase) => testCase.id)).size).toBe(PRODUCT_GOLDEN_IDS.length);
  });

  it.each(productGoldenCases)('$id — $consequence', (testCase) => {
    testCase.run();
  });
});

describe('G31 canonical transition oracle corpus', () => {
  it('accounts for all 20 transition oracles', () => {
    expect(transitionCases.map((testCase) => testCase.id)).toEqual([...TRANSITION_ORACLE_IDS]);
    expect(new Set(transitionCases.map((testCase) => testCase.id)).size).toBe(TRANSITION_ORACLE_IDS.length);
  });

  it.each(transitionCases)('$id', (testCase) => {
    testCase.run();
  });
});
