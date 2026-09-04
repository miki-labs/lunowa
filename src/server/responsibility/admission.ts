import {ADMISSION_DECISIONS, type AdmissionDecision, type ResponsibilityInterpretationCandidate} from './types';

export type AdmissionResult =
  | {status: 'ACCEPTED'; decision: AdmissionDecision; reasonCodes: string[]}
  | {status: 'INVALID_CANDIDATE'; decision: null; reason: string};

/**
 * Admission is a small deterministic gate. It does not turn risk labels,
 * confidence, unread state, or the presence of a request into a review. The
 * interpretation candidate must carry the semantic decision and evidence
 * basis; the reducer then validates and applies that decision.
 */
export function admitResponsibilityCandidate(candidate: ResponsibilityInterpretationCandidate): AdmissionResult {
  if (!candidate.userId || !candidate.connectedAccountId || !candidate.conversationId) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'tenant scope is required'};
  }
  if (!candidate.sourceEventKey.trim() || !candidate.candidateKey.trim()) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'sourceEventKey and candidateKey are required'};
  }
  if (!Number.isSafeInteger(candidate.evidenceRevision) || candidate.evidenceRevision < 0) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'evidenceRevision must be a non-negative integer'};
  }
  if (!ADMISSION_DECISIONS.includes(candidate.admission.decision)) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'unknown admission decision'};
  }
  if (candidate.admission.reasonCodes.length === 0) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'admission requires at least one reason code'};
  }
  if (candidate.admission.decision === 'TRACK' && !candidate.operationalOutcome?.trim() && !candidate.effects?.length) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'TRACK requires a grounded operational outcome'};
  }
  return {
    status: 'ACCEPTED',
    decision: candidate.admission.decision,
    reasonCodes: [...candidate.admission.reasonCodes]
  };
}

export const admitCandidate = admitResponsibilityCandidate;
