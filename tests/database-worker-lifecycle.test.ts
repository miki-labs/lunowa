import {afterEach, describe, expect, it, vi} from 'vitest';

const poolConfigs = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock('pg', () => ({
  Pool: class Pool {
    constructor(config: Record<string, unknown>) {
      poolConfigs.push(config);
    }
  }
}));

describe('Cloudflare PostgreSQL connection lifecycle', () => {
  afterEach(() => {
    delete process.env.DATABASE_URL;
    poolConfigs.length = 0;
    vi.resetModules();
  });

  it('retires each pg client after one checkout instead of carrying TCP I/O across Worker requests', async () => {
    process.env.DATABASE_URL = 'postgresql://worker-test.invalid/lunowa';
    const {getDatabasePool} = await import('../src/server/db');

    getDatabasePool();

    expect(poolConfigs).toHaveLength(1);
    expect(poolConfigs[0]).toMatchObject({
      max: 5,
      maxUses: 1,
      allowExitOnIdle: true,
      application_name: 'lunowa-application'
    });
  });
});
