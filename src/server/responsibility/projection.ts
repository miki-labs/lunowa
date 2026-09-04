import type {Projection, ResponsibilityState} from './types';

/**
 * Projection is deliberately calculated from the accepted vector. It is not
 * persisted as a lifecycle status and a new message cannot promote an item by
 * recency alone.
 */
export function projectResponsibility(state: ResponsibilityState): Projection {
  if (state.resolutionStatus === 'RESOLVED') {
    return state.liveTrackingState === 'TRACKING_ACTIVE'
      ? {
          bucket: 'DONE',
          subjectKind: 'RESPONSIBILITY',
          primaryReason: `resolved:${state.resolutionReason ?? 'explicit'}`
        }
      : {
          bucket: 'NONE',
          subjectKind: 'NONE',
          primaryReason: 'historical-or-user-closed-responsibility'
        };
  }

  const materialReview = state.details.uncertainties.some(
    (uncertainty) => uncertainty.material && uncertainty.reviewRequired
  );
  if (materialReview) {
    return {
      bucket: 'REVIEW',
      subjectKind: 'RESPONSIBILITY',
      primaryReason: 'material-decision-critical-uncertainty'
    };
  }

  if (state.liveTrackingState === 'HISTORICAL_INACTIVE') {
    return {
      bucket: 'NONE',
      subjectKind: 'NONE',
      primaryReason: 'historical-candidate-is-not-live-work'
    };
  }

  if (state.attentionMode === 'DEFERRED') {
    return {
      bucket: 'LATER',
      subjectKind: 'RESPONSIBILITY',
      primaryReason: 'user-intentionally-deferred-attention'
    };
  }

  const userAction = state.obligationLegs.find(
    (leg) =>
      leg.bearer === 'USER' &&
      leg.status === 'OPEN' &&
      leg.actionability === 'ACTIONABLE' &&
      leg.conditionSatisfied !== false
  );
  if (userAction) {
    return {
      bucket: 'MY_TURN',
      subjectKind: 'RESPONSIBILITY',
      primaryReason: `open-user-obligation:${userAction.actionCode}`
    };
  }

  return {
    bucket: 'WAITING',
    subjectKind: 'RESPONSIBILITY',
    primaryReason: 'open-loop-awaits-counterpart-or-external-event'
  };
}

export function projectAdmissionReview(): Projection {
  return {
    bucket: 'REVIEW',
    subjectKind: 'ADMISSION_REVIEW',
    primaryReason: 'responsibility-existence-or-admission-is-unresolved'
  };
}
