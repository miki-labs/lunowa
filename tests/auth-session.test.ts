import {readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

import {createAppAuth} from '@/server/auth/auth';
import {AppSessionAccessError, authorizeAppSession, sessionAccessResponse, type AuthenticatedAppSession} from '@/server/auth/session';

const userId = 'c8b653d9-dceb-48d1-a4fc-e4df475f3493';
const otherUserId = '4fc27216-5284-439f-a916-e778d352659c';

const session: AuthenticatedAppSession = {
  user: {id: userId, email: 'owner@example.invalid', name: 'Owner'},
  session: {
    id: 'c5914335-9762-4518-b61a-50734591b06b',
    userId,
    expiresAt: new Date('2030-01-02T00:00:00.000Z')
  }
};

describe('production auth contract', () => {
  it('keeps the P14 UUID schema and migration as the production FK target', () => {
    const migrations = readdirSync(resolve(process.cwd(), 'drizzle/migrations'))
      .filter((name) => name.endsWith('.sql'))
      .sort();
    expect(migrations).toHaveLength(4);
    expect(migrations[0]).toMatch(/^0000_/);
    expect(migrations[1]).toMatch(/^0001_/);
    expect(migrations[2]).toMatch(/^0002_/);
    expect(migrations[3]).toMatch(/^0003_/);

    const authSql = readFileSync(
      resolve(process.cwd(), 'drizzle/migrations', migrations.find((name) => name.startsWith('0000_'))!),
      'utf8'
    );
    expect(authSql).toContain('CREATE TABLE "user"');
    expect(authSql).toContain('"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid()');
    expect(authSql).toContain('CREATE TABLE "session"');
    expect(authSql).toContain('"user_id" uuid NOT NULL');
    expect(authSql).toContain('"session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")');
    expect(authSql).not.toContain('connected_account');
    expect(authSql).not.toContain('gmail');

    const evidenceSql = readFileSync(
      resolve(process.cwd(), 'drizzle/migrations', migrations.find((name) => name.startsWith('0001_'))!),
      'utf8'
    );
    expect(evidenceSql).toContain('REFERENCES "public"."user"("id")');
    expect(evidenceSql).toContain('CREATE TABLE "connected_accounts"');
  });

  it('configures only local application credentials and the proven UUID generator', () => {
    const auth = createAppAuth({} as never, {
      secret: 'test-secret-that-is-longer-than-thirty-two-characters',
      baseURL: 'http://auth.test.invalid'
    });
    const options = auth.options as typeof auth.options & {
      advanced?: {database?: {generateId?: string}};
      account?: {accountLinking?: {enabled?: boolean}};
      socialProviders?: Record<string, unknown>;
    };

    expect(options.advanced?.database?.generateId).toBe('uuid');
    expect(options.emailAndPassword?.enabled).toBe(true);
    expect(options.account?.accountLinking?.enabled).toBe(false);
    expect(Object.keys(options.socialProviders ?? {})).toEqual([]);
  });

  it('requires a production-strength session secret', () => {
    expect(() => createAppAuth({} as never, {secret: 'too-short', baseURL: 'http://auth.test.invalid'}))
      .toThrow(/at least 32 characters/);
  });
});

describe('protected BFF authorization', () => {
  it('accepts the current unexpired owner session', () => {
    expect(authorizeAppSession(session, userId, new Date('2030-01-01T00:00:00.000Z'))).toBe(session);
  });

  it.each([
    ['missing', null, new Date('2030-01-01T00:00:00.000Z')],
    ['expired', session, new Date('2030-01-02T00:00:00.000Z')]
  ])('rejects %s sessions as unauthenticated', (_label, candidate, now) => {
    expect(() => authorizeAppSession(candidate, userId, now)).toThrow(
      expect.objectContaining({status: 401, code: 'UNAUTHENTICATED'})
    );
  });

  it('rejects cross-user access without returning owner data', async () => {
    expect(() => authorizeAppSession(session, otherUserId, new Date('2030-01-01T00:00:00.000Z'))).toThrow(
      expect.objectContaining({status: 403, code: 'FORBIDDEN'})
    );

    const response = sessionAccessResponse(new AppSessionAccessError(403, 'FORBIDDEN'));
    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({error: 'FORBIDDEN'});
    expect(response?.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects an internally inconsistent session/user relationship', () => {
    expect(() => authorizeAppSession({
      ...session,
      session: {...session.session, userId: otherUserId}
    }, userId, new Date('2030-01-01T00:00:00.000Z'))).toThrow(
      expect.objectContaining({status: 403, code: 'FORBIDDEN'})
    );
  });
});
