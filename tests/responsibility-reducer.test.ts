import {describe, expect, it} from 'vitest';

import {projectResponsibility, reduceResponsibility} from '../src/server/responsibility';
import type {
  ObligationLeg,
  ResponsibilityEvidenceBasis,
  ResponsibilityInterpretationCandidate,
  ResponsibilityState,
  TemporalFact
} from '../src/server/responsibility';

const scope = {
  userId: 'user-1',
  connectedAccountId: 'account-1',
  conversationId: 'conversation-1'
};

function leg(id: string, bearer: ObligationLeg['bearer'], actionCode: string, actionability: ObligationLeg['actionability'] = 'ACTIONABLE'): ObligationLeg {
  return {
    id,
    bearer,
    actionCode,
    status: 'OPEN',
    actionability,
    basisKind: 'COMMUNICATED_REQUEST',
    provenance: []
  };
}

function candidate(overrides: Partial<ResponsibilityInterpretationCandidate> = {}): ResponsibilityInterpretationCandidate {
  return {
    ...scope,
    sourceEventKey: 'message-1',
    candidateKey: 'candidate-1',
    evidenceRevision: 1,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP']},
    operationalOutcome: 'send the revised document',
    obligationLegs: [leg('user-send', 'USER', 'SEND_REVISED_DOCUMENT')],
    provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: 'message-1'}],
    ...overrides
  };
}

type ReducerOptions = NonNullable<Parameters<typeof reduceResponsibility>[1]>;

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

function created(result: ReturnType<typeof reduceResponsibility>): ResponsibilityState {
  expect(result.status).toBe('APPLIED');
  if (result.status !== 'APPLIED') throw new Error(result.reason);
  const state = result.effects[0]?.state;
  if (!state) throw new Error('expected a Responsibility effect');
  return state;
}

describe('deterministic Responsibility admission and reducer', () => {
  it('rejects ungrounded candidates instead of manufacturing source provenance', () => {
    const ungrounded = candidate({sourceMessageId: 'message-1', provenance: undefined});
    const result = reduceResponsibility(ungrounded, {
      evidenceBasis: {
        evidenceRevision: 1,
        sourceEventKey: ungrounded.sourceEventKey,
        references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: 'message-1'}]
      }
    });
    expect(result.status).toBe('REJECTED');
    if (result.status === 'REJECTED') expect(result.reason).toContain('candidate provenance is required');
  });

  it('derives admission from the grounded open-loop shape, not the candidate label', () => {
    const mislabeledAbstention = reduce(candidate({
      admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['MODEL_SAID_NO_TASK']}
    }));
    expect(mislabeledAbstention.status).toBe('REJECTED');

    const noResponsibility = reduce(candidate({
      admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['COURTESY_FORMULA']},
      operationalOutcome: undefined,
      obligationLegs: undefined
    }));
    expect(noResponsibility).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK', responsibilities: []});
  });

  it('tracks a clear high-risk loop without turning risk alone into admission Review', () => {
    const result = reduce(candidate({
      riskDetails: [{
        id: 'payment-risk',
        targetKind: 'OBLIGATION',
        riskClass: 'HIGH',
        reasonCode: 'HIGH_RISK_REQUEST',
        provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId: 'message-1'}]
      }]
    }));
    expect(result.status).toBe('APPLIED');
    if (result.status === 'APPLIED') {
      expect(result.admission).toBe('TRACK');
      expect(result.admissionReview).toBeUndefined();
    }
  });

  it('admits a grounded user request as CREATE and projects MY_TURN', () => {
    const due: TemporalFact = {
      id: 'due-1',
      temporalKind: 'SOURCE_DUE',
      originalExpression: '明日までに',
      valueKind: 'DATE',
      resolvedDate: '2026-08-25',
      precisionCode: 'DATE',
      currentnessStatus: 'ACCEPTED_CURRENT',
      provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', sourceExcerptShort: '明日までに'}]
    };
    const result = reduce(candidate({temporalFacts: [due]}), {currentEvidenceRevision: 1});
    const state = created(result);
    expect(result.effects[0]?.operation).toBe('CREATE');
    expect(projectResponsibility(state).bucket).toBe('MY_TURN');
    expect(state.temporalFacts[0]?.temporalKind).toBe('SOURCE_DUE');
    expect(state.temporalFacts[0]?.precisionCode).toBe('DATE');
  });

  it('keeps an outbound request as OTHER-party waiting work', () => {
    const result = reduce(candidate({
      sourceEventKey: 'outbound-1',
      candidateKey: 'outbound-1',
      operationalOutcome: 'receive the revised document',
      obligationLegs: [leg('other-send', 'OTHER_PARTY', 'SEND_REVISED_DOCUMENT')]
    }));
    const state = created(result);
    expect(state.obligationLegs[0]?.bearer).toBe('OTHER_PARTY');
    expect(projectResponsibility(state).bucket).toBe('WAITING');
  });

  it('preserves valid DO_NOT_TRACK as a successful abstention with no state', () => {
    const result = reduce(candidate({
      admission: {decision: 'DO_NOT_TRACK', reasonCodes: ['COURTESY_OR_FYI']},
      operationalOutcome: undefined,
      obligationLegs: undefined
    }));
    expect(result).toMatchObject({status: 'APPLIED', admission: 'DO_NOT_TRACK', effects: [], responsibilities: []});
  });

  it('keeps admission NEEDS_REVIEW separate from a fake Responsibility', () => {
    const result = reduce(candidate({
      admission: {decision: 'NEEDS_REVIEW', reasonCodes: ['RESPONSIBILITY_EXISTENCE_AMBIGUOUS'], candidateSummary: {question: 'which recipient is assigned?'}}
    }));
    expect(result.status).toBe('APPLIED');
    if (result.status !== 'APPLIED') return;
    expect(result.admissionReview?.status).toBe('OPEN');
    expect(result.responsibilities).toHaveLength(0);
  });

  it('applies a field-scoped temporal correction and preserves the old fact', () => {
    const oldDue: TemporalFact = {
      id: 'due-friday', temporalKind: 'SOURCE_DUE', originalExpression: '金曜まで', valueKind: 'DATE', resolvedDate: '2026-08-28', precisionCode: 'DATE', currentnessStatus: 'ACCEPTED_CURRENT', provenance: []
    };
    const target: TemporalFact = {
      id: 'user-target', temporalKind: 'USER_TARGET', valueKind: 'DATE', resolvedDate: '2026-08-27', precisionCode: 'DATE', currentnessStatus: 'ACCEPTED_CURRENT', provenance: []
    };
    const initial = created(reduce(candidate({temporalFacts: [oldDue, target]})));
    const correction = reduce(candidate({
      sourceEventKey: 'message-2', candidateKey: 'correction-1', evidenceRevision: 2, responsibilityRef: initial.id,
      temporalFacts: undefined,
      effects: [{
        operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'correction',
        patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', authorityKind: 'USER_CORRECTION', value: [{...oldDue, id: 'due-monday', resolvedDate: '2026-08-31', provenance: [{evidenceKind: 'USER_ASSERTION'}]}]}]}
      }]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [initial]});
    const corrected = created(correction);
    expect(corrected.temporalFacts.find((fact) => fact.id === 'due-friday')?.currentnessStatus).toBe('SUPERSEDED');
    expect(corrected.temporalFacts.find((fact) => fact.id === 'due-monday')?.resolvedDate).toBe('2026-08-31');
    expect(corrected.temporalFacts.find((fact) => fact.id === 'user-target')?.resolvedDate).toBe('2026-08-27');
    expect(corrected.fieldDecisions.at(-1)?.fieldKey).toBe('temporalFacts.SOURCE_DUE');
  });

  it('projects a material conflict as REVIEW without using recency as authority', () => {
    const initial = created(reduce(candidate()));
    const result = reduce(candidate({
      sourceEventKey: 'message-2', candidateKey: 'conflict-1', evidenceRevision: 2, responsibilityRef: initial.id,
      effects: [{operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'conflict', patch: {fieldChanges: [{fieldKey: 'uncertainties', authorityKind: 'INTERPRETATION', value: [{id: 'due-conflict', fieldKey: 'temporalFacts.SOURCE_DUE', reasonCode: 'CONFLICTING_AUTHORITY', material: true, reviewRequired: true, provenance: []}]}]}}]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [initial]});
    const state = created(result);
    expect(projectResponsibility(state).bucket).toBe('REVIEW');
  });

  it('rejects weak completion evidence and accepts a reconciled completion only when no requirement remains', () => {
    const initial = created(reduce(candidate()));
    const weak = reduce(candidate({
      sourceEventKey: 'read-1', candidateKey: 'read-1', evidenceRevision: 2, responsibilityRef: initial.id,
      effects: [{operation: 'RESOLVE', responsibilityRef: initial.id, effectKey: 'read', reason: 'SATISFIED', resolutionEvidence: {strength: 'WEAK', kinds: ['READ']}}]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [initial]});
    expect(weak.status).toBe('REJECTED');

    const closedLeg = {...initial.obligationLegs[0], status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: '2026-01-03T00:00:00.000Z'};
    const resolved = reduce(candidate({
      sourceEventKey: 'send-reconciled-1', candidateKey: 'send-reconciled-1', evidenceRevision: 3, responsibilityRef: initial.id,
      effects: [{operation: 'RESOLVE', responsibilityRef: initial.id, effectKey: 'send', reason: 'SATISFIED', patch: {obligationLegs: [closedLeg]}, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['PROVIDER_RECONCILED_SEND']}}]
    }), {currentEvidenceRevision: 3, existingResponsibilities: [initial]});
    expect(created(resolved).resolutionReason).toBe('SATISFIED');
  });

  it('supports a supersede plus replacement CREATE from one evidence event', () => {
    const first = created(reduce(candidate()));
    const result = reduce(candidate({
      sourceEventKey: 'replacement-1', candidateKey: 'replacement-1', evidenceRevision: 2,
      operationalOutcome: 'create a termination notice',
      effects: [
        {operation: 'SUPERSEDE', responsibilityRef: first.id, effectKey: 'old', reason: 'SUPERSEDED', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}},
        {operation: 'CREATE', effectKey: 'new', patch: {operationalOutcome: 'create a termination notice', obligationLegs: [leg('new-user-work', 'USER', 'CREATE_TERMINATION_NOTICE')]}}
      ]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [first]});
    expect(result.status).toBe('APPLIED');
    if (result.status !== 'APPLIED') return;
    expect(result.effects.map((effect) => effect.operation)).toEqual(['SUPERSEDE', 'CREATE']);
    expect(result.effects[0]?.state?.resolutionReason).toBe('SUPERSEDED');
    expect(projectResponsibility(result.effects[1]?.state as ResponsibilityState).bucket).toBe('MY_TURN');
  });

  it('rejects stale evidence and cross-conversation matching', () => {
    expect(reduce(candidate(), {currentEvidenceRevision: 2}).status).toBe('STALE');
    const initial = created(reduce(candidate()));
    const crossConversation = reduce(candidate({
      conversationId: 'conversation-2', evidenceRevision: 2, responsibilityRef: initial.id,
      sourceEventKey: 'cross-thread', candidateKey: 'cross-thread', effects: [{operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'cross'}]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [initial]});
    expect(crossConversation.status).toBe('REJECTED');
  });

  it('uses semantic chronology and explicit authority, never worker arrival order, for corrections', () => {
    const friday: TemporalFact = {
      id: 'friday', temporalKind: 'SOURCE_DUE', valueKind: 'DATE', resolvedDate: '2026-08-28', precisionCode: 'DATE', currentnessStatus: 'ACCEPTED_CURRENT', provenance: []
    };
    const initial = created(reduce(candidate({temporalFacts: [friday]})));
    const correction = reduce(candidate({
      sourceEventKey: 'correction-first', candidateKey: 'correction-first', evidenceRevision: 2, semanticTime: '2026-01-02T10:05:00.000Z', responsibilityRef: initial.id,
      effects: [{operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'correction', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [{...friday, id: 'monday', resolvedDate: '2026-08-31', provenance: []}], authorityKind: 'INTERPRETATION', semanticTime: '2026-01-02T10:05:00.000Z', relation: 'CORRECTION'}]}}]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [initial]});
    const corrected = created(correction);
    const lateOriginal = reduce(candidate({
      sourceEventKey: 'original-late', candidateKey: 'original-late', evidenceRevision: 3, semanticTime: '2026-01-02T10:00:00.000Z', responsibilityRef: initial.id,
      effects: [{operation: 'UPDATE', responsibilityRef: initial.id, effectKey: 'late-original', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [friday], authorityKind: 'INTERPRETATION', semanticTime: '2026-01-02T10:00:00.000Z', relation: 'NONE'}]}}]
    }), {currentEvidenceRevision: 3, existingResponsibilities: [corrected]});
    expect(lateOriginal.status).toBe('REJECTED');

    const userCorrected = reduce(candidate({
      sourceEventKey: 'user-correction', candidateKey: 'user-correction', evidenceRevision: 3, responsibilityRef: corrected.id,
      effects: [{operation: 'UPDATE', responsibilityRef: corrected.id, effectKey: 'user-correction', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [{...friday, id: 'user-friday', provenance: []}], authorityKind: 'USER_CORRECTION'}]}}]
    }), {currentEvidenceRevision: 3, existingResponsibilities: [corrected]});
    const userState = created(userCorrected);
    const weakerLater = reduce(candidate({
      sourceEventKey: 'weaker-later', candidateKey: 'weaker-later', evidenceRevision: 4, responsibilityRef: userState.id,
      effects: [{operation: 'UPDATE', responsibilityRef: userState.id, effectKey: 'weaker-later', patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [{...friday, id: 'weak-later', resolvedDate: '2026-09-01', provenance: []}], authorityKind: 'INTERPRETATION'}]}}]
    }), {currentEvidenceRevision: 4, existingResponsibilities: [userState]});
    expect(weakerLater.status).toBe('REJECTED');
  });

  it('keeps historical candidates inactive and makes conditional obligations wait', () => {
    const historical = created(reduce(candidate({
      liveTrackingState: 'HISTORICAL_INACTIVE', attentionMode: 'PRESENT', sourceEventKey: 'history', candidateKey: 'history'
    })));
    expect(projectResponsibility(historical).bucket).toBe('NONE');

    const approvalEvent = {id: 'legal-approval', actor: 'EXTERNAL' as const, eventCode: 'LEGAL_APPROVAL', status: 'PENDING' as const, provenance: []};
    const conditional = created(reduce(candidate({
      sourceEventKey: 'conditional', candidateKey: 'conditional', obligationLegs: [leg('sign', 'USER', 'SIGN_AGREEMENT', 'BLOCKED')], expectedEvents: [approvalEvent]
    })));
    expect(projectResponsibility(conditional).bucket).toBe('WAITING');
    const activated = reduce(candidate({
      sourceEventKey: 'approval', candidateKey: 'approval', evidenceRevision: 2, responsibilityRef: conditional.id,
      effects: [{operation: 'UPDATE', responsibilityRef: conditional.id, effectKey: 'activate', patch: {obligationLegs: [{...conditional.obligationLegs[0], actionability: 'ACTIONABLE', conditionSatisfied: true}], expectedEvents: [{...approvalEvent, status: 'CLOSED', closureReason: 'SATISFIED', closedAt: '2026-01-03T00:00:00.000Z'}]}}]
    }), {currentEvidenceRevision: 2, existingResponsibilities: [conditional]});
    expect(projectResponsibility(created(activated)).bucket).toBe('MY_TURN');
  });
});
