import {describe, expect, it, vi} from 'vitest';

import {runTemporalReconciliation} from '@/server/gmail/worker';
import {disconnectGmailAccount} from '@/server/integrity/disconnect';
import {projectAccountMonitoringIntegrity, sourceReadinessAllowsHealthyMonitoring} from '@/server/integrity/projection';

describe('G60 integrity and recovery boundaries', () => {
  it('keeps intentional disconnect distinct from unexpected monitoring degradation', () => {
    expect(projectAccountMonitoringIntegrity({
      connectionState: 'DISCONNECTED',
      syncStatus: 'ERROR',
      syncErrorCode: 'INTENTIONAL_DISCONNECT',
      lastSuccessAt: new Date('2030-01-01T00:00:00.000Z'),
      lastFullReconcileAt: null
    })).toEqual({
      status: 'disconnected',
      reasonCode: 'INTENTIONAL_DISCONNECT',
      lastTrustworthyAt: '2030-01-01T00:00:00.000Z',
      recoveryAction: null
    });
    expect(projectAccountMonitoringIntegrity({
      connectionState: 'RECONNECT_REQUIRED',
      syncStatus: 'ERROR',
      syncErrorCode: 'AUTH_REVOKED',
      lastSuccessAt: new Date('2030-01-01T00:00:00.000Z'),
      lastFullReconcileAt: null
    }).recoveryAction).toBe('RECONNECT');
  });

  it('does not allow partial or unavailable coverage to make a healthy monitoring claim', () => {
    expect(sourceReadinessAllowsHealthyMonitoring('ready')).toBe(true);
    expect(sourceReadinessAllowsHealthyMonitoring('partial')).toBe(false);
    expect(sourceReadinessAllowsHealthyMonitoring('unavailable')).toBe(false);
  });

  it('stops delegated monitoring before removing the Gmail credential', async () => {
    const order: string[] = [];
    const stopTrackingForDisconnectedAccount = vi.fn(async () => {
      order.push('monitoring');
      return 2;
    });
    const disconnect = vi.fn(async () => {
      order.push('credential');
    });

    await expect(disconnectGmailAccount(
      {userId: 'user-a', connectedAccountId: 'account-a', requestKey: 'disconnect-1'},
      {stopTrackingForDisconnectedAccount} as never,
      {disconnect} as never
    )).resolves.toEqual({stoppedResponsibilities: 2});
    expect(order).toEqual(['monitoring', 'credential']);
    expect(stopTrackingForDisconnectedAccount).toHaveBeenCalledWith({
      userId: 'user-a', connectedAccountId: 'account-a', requestKey: 'disconnect-1'
    });
    expect(disconnect).toHaveBeenCalledWith('user-a', 'account-a');
  });

  it('fails closed and preserves the credential when monitoring cannot be stopped', async () => {
    const disconnect = vi.fn(async () => undefined);
    await expect(disconnectGmailAccount(
      {userId: 'user-a', connectedAccountId: 'account-a', requestKey: 'disconnect-2'},
      {stopTrackingForDisconnectedAccount: vi.fn(async () => { throw new Error('STOP_FAILED'); })} as never,
      {disconnect} as never
    )).rejects.toThrow('STOP_FAILED');
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('sweeps overdue Temporal work per tenant and delegates evidence to the trusted repository', async () => {
    const now = new Date('2030-01-02T00:00:00.000Z');
    const listDueUserIds = vi.fn(async () => ['user-a', 'user-b']);
    const loadTemporalEvidence = vi.fn(async () => ({evidenceRevision: 3, references: [], userAttentionNeeded: false}));
    const reconcileOverdue = vi.fn(async (input: {userId: string; loadEvidence: (value: {contract: never; trigger: never; responsibilityId: string}) => Promise<unknown>}) => {
      await input.loadEvidence({contract: {} as never, trigger: {} as never, responsibilityId: 'responsibility-1'});
      return [{status: 'NO_OP', triggerId: `${input.userId}-trigger`}];
    });

    await expect(runTemporalReconciliation(
      {listDueUserIds, reconcileOverdue} as never,
      {loadTemporalEvidence} as never,
      20,
      now
    )).resolves.toEqual({users: 2, processed: 2, failed: 0});
    expect(reconcileOverdue).toHaveBeenCalledTimes(2);
    expect(loadTemporalEvidence).toHaveBeenCalledTimes(2);
    expect(listDueUserIds).toHaveBeenCalledWith(now, 20);
  });
});
