import {describe, expect, it} from 'vitest';
import {shellFixtures} from '@/components/lunowa-shell-model';

describe('G11 shell read-model contract', () => {
  it('is independently importable and preserves the accepted fixture set', () => {
    expect(shellFixtures).toHaveLength(15);
    expect(shellFixtures.map(({id}) => id)).toEqual([
      'normal',
      'zero',
      'not-delegated',
      'stopped',
      'loading',
      'partial',
      'degraded',
      'mutation-pending',
      'mutation-confirmed',
      'mutation-failed',
      'send-pending',
      'send-failed',
      'send-ambiguous',
      'send-reconciling',
      'session-expired'
    ]);
  });

  it('keeps the accepted cross-cutting axes distinct', () => {
    expect(shellFixtures.find(({id}) => id === 'zero')).toMatchObject({
      sourceReadiness: 'ready',
      integrity: 'healthy',
      monitoringPosture: 'active',
      hasNeedsYou: false,
      hasReview: false
    });
    expect(shellFixtures.find(({id}) => id === 'partial')).toMatchObject({
      sourceReadiness: 'partial',
      sourceRead: 'partially_available'
    });
    expect(shellFixtures.find(({id}) => id === 'not-delegated')).toMatchObject({
      monitoringPosture: 'not_delegated',
      integrity: 'healthy'
    });
    expect(shellFixtures.find(({id}) => id === 'send-ambiguous')).toMatchObject({
      mutation: 'idle',
      send: 'provider_ambiguous'
    });
  });
});
