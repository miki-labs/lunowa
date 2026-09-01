// @vitest-environment node

import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import {createProofAuth} from '../proofs/better-auth-uuid/auth';

const databaseUrl = process.env.P14_DATABASE_URL;
const runtime = databaseUrl ? describe : describe.skip;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertIsP14Namespace(url: string) {
  const parsed = new URL(url);
  expect(parsed.hostname).toBe('127.0.0.1');
  expect(parsed.port).toBe('55414');
  expect(parsed.pathname).toBe('/lunowa_issue_14');
}

runtime('P14 Better Auth UUID persistence proof (real PostgreSQL only)', () => {
  if (!databaseUrl) return;

  const {auth, pool} = createProofAuth(databaseUrl);
  let userId = '';
  let sessionToken = '';
  let sessionCookie = '';

  beforeAll(async () => {
    assertIsP14Namespace(databaseUrl);
    const version = await pool.query<{version: string}>('select version()');
    expect(version.rows[0]?.version).toMatch(/^PostgreSQL 18\./);

    const generatedSql = await readFile(
      resolve('proofs/better-auth-uuid/drizzle/0000_dear_felicia_hardy.sql'),
      'utf8'
    );
    await pool.query('drop table if exists responsibility_proof_fixture, verification, account, session, "user" cascade');
    await pool.query(generatedSql);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('47: creates an actual Better Auth user with a PostgreSQL UUID primary key', async () => {
    const response = await auth.api.signUpEmail({
      body: {email: 'p14@example.test', name: 'P14 User', password: 'p14-local-password'},
      asResponse: true
    });
    expect(response.status).toBe(200);
    const result = await response.json() as {token: string; user: {id: string}};
    userId = result.user.id;
    sessionToken = result.token;
    sessionCookie = response.headers.get('set-cookie')?.split(';', 1)[0] ?? '';

    expect(userId).toMatch(uuid);
    expect(sessionCookie).toMatch(/^better-auth\.session_token=/);
    const catalog = await pool.query<{data_type: string; udt_name: string}>(
      "select data_type, udt_name from information_schema.columns where table_schema = 'public' and table_name = 'user' and column_name = 'id'"
    );
    expect(catalog.rows).toEqual([{data_type: 'uuid', udt_name: 'uuid'}]);
  });

  it('48: roundtrips local credential account, durable session, and domain UUID FK', async () => {
    expect(userId).toMatch(uuid);
    expect(sessionToken).toBeTruthy();
    expect(sessionCookie).toBeTruthy();

    const accountRow = await pool.query<{issuer: string; provider_id: string; account_id: string; user_id: string}>(
      'select issuer, provider_id, account_id, user_id from account where user_id = $1',
      [userId]
    );
    expect(accountRow.rows).toEqual([{
      issuer: 'local:credential',
      provider_id: 'credential',
      account_id: userId,
      user_id: userId
    }]);

    const sessionRow = await pool.query<{user_id: string}>(
      'select user_id from session where token = $1',
      [sessionToken]
    );
    expect(sessionRow.rows).toEqual([{user_id: userId}]);

    const sessionResponse = await auth.api.getSession({
      headers: new Headers({cookie: sessionCookie}),
      asResponse: true
    });
    expect(sessionResponse.status).toBe(200);
    const sessionResult = await sessionResponse.json() as {user: {id: string}; session: {userId: string}};
    expect(sessionResult.user.id).toBe(userId);
    expect(sessionResult.session.userId).toBe(userId);

    const domainRow = await pool.query<{user_id: string}>(
      "insert into responsibility_proof_fixture (user_id, label) values ($1, 'UUID FK roundtrip') returning user_id",
      [userId]
    );
    expect(domainRow.rows).toEqual([{user_id: userId}]);
  });

  it('49: generated SQL and the PostgreSQL catalog preserve UUID IDs and UUID FKs', async () => {
    const columns = await pool.query<{table_name: string; column_name: string; udt_name: string}>(
      "select table_name, column_name, udt_name from information_schema.columns where table_schema = 'public' and table_name in ('user', 'session', 'account', 'verification', 'responsibility_proof_fixture') and column_name in ('id', 'user_id') order by table_name, column_name"
    );
    expect(columns.rows).toEqual(expect.arrayContaining([
      {table_name: 'user', column_name: 'id', udt_name: 'uuid'},
      {table_name: 'session', column_name: 'id', udt_name: 'uuid'},
      {table_name: 'session', column_name: 'user_id', udt_name: 'uuid'},
      {table_name: 'account', column_name: 'id', udt_name: 'uuid'},
      {table_name: 'account', column_name: 'user_id', udt_name: 'uuid'},
      {table_name: 'responsibility_proof_fixture', column_name: 'user_id', udt_name: 'uuid'}
    ]));
  });
});
