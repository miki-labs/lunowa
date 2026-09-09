import type {SourceReadiness} from '@/lib/source-types';

export type AccountMonitoringStatus = 'healthy' | 'unknown' | 'degraded' | 'disconnected';
export type IntegrityRecoveryAction = 'RECONNECT' | 'RECONCILE' | null;

export type AccountMonitoringIntegrity = {
  status: AccountMonitoringStatus;
  reasonCode: string | null;
  lastTrustworthyAt: string | null;
  recoveryAction: IntegrityRecoveryAction;
};

export type AccountIntegrityInput = {
  connectionState: string;
  syncStatus: string | null;
  syncErrorCode: string | null;
  lastSuccessAt: Date | null;
  lastFullReconcileAt: Date | null;
};

function iso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/**
 * Projects provider state into the promise Lunowa is allowed to make.
 * Connection, sync, and capability failures are intentionally not collapsed
 * into one global account error by callers; this projection only describes
 * whether monitoring for this account can currently be trusted.
 */
export function projectAccountMonitoringIntegrity(input: AccountIntegrityInput): AccountMonitoringIntegrity {
  const lastTrustworthyAt = iso(input.lastSuccessAt ?? input.lastFullReconcileAt);
  if (input.connectionState === 'DISCONNECTED' && input.syncErrorCode === 'INTENTIONAL_DISCONNECT') {
    return {status: 'disconnected', reasonCode: 'INTENTIONAL_DISCONNECT', lastTrustworthyAt, recoveryAction: null};
  }
  if (input.connectionState === 'RECONNECT_REQUIRED' || input.connectionState === 'ERROR') {
    return {status: 'degraded', reasonCode: input.syncErrorCode ?? 'RECONNECT_REQUIRED', lastTrustworthyAt, recoveryAction: 'RECONNECT'};
  }
  if (input.syncStatus === 'ERROR' || input.syncStatus === 'RECONCILIATION_REQUIRED') {
    return {status: 'degraded', reasonCode: input.syncErrorCode ?? 'RECONCILIATION_REQUIRED', lastTrustworthyAt, recoveryAction: 'RECONCILE'};
  }
  if (input.connectionState !== 'CONNECTED' || input.syncStatus !== 'HEALTHY' || !input.lastSuccessAt) {
    return {status: 'unknown', reasonCode: input.syncErrorCode, lastTrustworthyAt, recoveryAction: 'RECONCILE'};
  }
  return {status: 'healthy', reasonCode: null, lastTrustworthyAt, recoveryAction: null};
}

export function sourceReadinessAllowsHealthyMonitoring(readiness: SourceReadiness): boolean {
  return readiness === 'ready';
}
