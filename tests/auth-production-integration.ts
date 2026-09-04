import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {createLocalAccountIssuer} from 'better-auth';
import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import {GET as getUserSession} from '../src/app/api/bff/users/[userId]/session/route';
import {createAppAuth} from '../src/server/auth/auth';
import {authorizeAppSession} from '../src/server/auth/session';
import {getDatabasePool} from '../src/server/db';
import * as authSchema from '../src/server/db/schema/auth';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function cookieHeader(headers: Headers): string {
  const responseHeaders = headers as Headers & {getSetCookie?: () => string[]};
  const cookies = typeof responseHeaders.getSetCookie === 'function'
    ? responseHeaders.getSetCookie()
    : [responseHeaders.get('set-cookie') ?? ''];
  return cookies.map((cookie) => cookie.split(';', 1)[0]).filter(Boolean).join('; ');
}

const databaseUrl = process.env.G10_DATABASE_URL;
assert(databaseUrl, 'G10_DATABASE_URL is required; no mock or fallback database is accepted.');
const integrationSecret = 'g10-integration-secret-at-least-thirty-two-bytes';
process.env.DATABASE_URL = databaseUrl;
process.env.BETTER_AUTH_SECRET = integrationSecret;
process.env.BETTER_AUTH_URL = 'http://g10-auth.invalid';

const pool = new Pool({connectionString: databaseUrl, max: 4, application_name: 'lunowa-g10-production-auth'});
const db = drizzle(pool, {schema: authSchema});
const migrationFolder = resolve(import.meta.dirname, '../drizzle/migrations');
let runtimePoolStarted = false;

try {
  const version = await pool.query<{server_version_num: string}>('SELECT current_setting(\'server_version_num\') AS server_version_num');
  assert(version.rows[0]?.server_version_num === '180006', 'G10 integration requires PostgreSQL 18.6.');

  const preexisting = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  assert(preexisting.rowCount === 0, `G10 integration requires a clean database; found ${preexisting.rows.map(({table_name}) => table_name).join(', ')}.`);

  await migrate(db, {migrationsFolder: migrationFolder});

  const catalog = await pool.query<{data_type: string; is_primary_key: boolean}>(`
    SELECT format_type(attribute.atttypid, attribute.atttypmod) AS data_type,
      EXISTS (
        SELECT 1 FROM pg_index AS primary_index
        WHERE primary_index.indrelid = table_object.oid
          AND primary_index.indisprimary
          AND attribute.attnum = ANY(primary_index.indkey)
      ) AS is_primary_key
    FROM pg_class AS table_object
    JOIN pg_namespace AS namespace ON namespace.oid = table_object.relnamespace
    JOIN pg_attribute AS attribute ON attribute.attrelid = table_object.oid
    WHERE namespace.nspname = 'public' AND table_object.relname = 'user'
      AND attribute.attname = 'id' AND attribute.attnum > 0 AND NOT attribute.attisdropped
  `);
  assert(catalog.rows[0]?.data_type === 'uuid' && catalog.rows[0]?.is_primary_key, 'Production user.id is not a PostgreSQL UUID primary key.');

  const auth = createAppAuth(db, {
    secret: integrationSecret,
    baseURL: 'http://g10-auth.invalid'
  });
  assert(Object.keys((auth.options as {socialProviders?: Record<string, unknown>}).socialProviders ?? {}).length === 0, 'A Better Auth social provider is active.');

  const noSession = await auth.api.getSession({headers: new Headers()});
  assert(noSession === null, 'A signed-out request unexpectedly has a session.');

  const suffix = randomUUID();
  const password = 'G10-production-auth-password-123!';
  const first = await auth.api.signUpEmail({
    body: {name: 'G10 First User', email: `g10-first-${suffix}@example.invalid`, password},
    returnHeaders: true
  });
  const firstCookie = cookieHeader(first.headers);
  assert(first.response.user?.id && firstCookie, 'Local sign-up did not create a user and session cookie.');

  const second = await auth.api.signUpEmail({
    body: {name: 'G10 Second User', email: `g10-second-${suffix}@example.invalid`, password},
    returnHeaders: true
  });
  assert(second.response.user?.id, 'Second local user was not created.');

  const firstSession = await auth.api.getSession({headers: new Headers({cookie: firstCookie})});
  assert(firstSession, 'The signed-in session was not readable.');
  assert(firstSession.user.id === first.response.user.id && firstSession.session.userId === first.response.user.id, 'Session ownership changed during roundtrip.');
  authorizeAppSession(firstSession, first.response.user.id);
  let crossUserStatus: number | undefined;
  try {
    authorizeAppSession(firstSession, second.response.user.id);
  } catch (error) {
    crossUserStatus = (error as {status?: number}).status;
  }
  assert(crossUserStatus === 403, 'A user-scoped BFF check did not reject cross-user access.');

  runtimePoolStarted = true;
  const ownerResponse = await getUserSession(
    new Request(`http://g10-auth.invalid/api/bff/users/${first.response.user.id}/session`, {headers: {cookie: firstCookie}}),
    {params: Promise.resolve({userId: first.response.user.id})}
  );
  assert(ownerResponse.status === 200, 'The protected BFF route rejected its authenticated owner.');
  const crossUserResponse = await getUserSession(
    new Request(`http://g10-auth.invalid/api/bff/users/${second.response.user.id}/session`, {headers: {cookie: firstCookie}}),
    {params: Promise.resolve({userId: second.response.user.id})}
  );
  assert(crossUserResponse.status === 403, 'The protected BFF route did not reject a cross-user request.');
  const unauthenticatedResponse = await getUserSession(
    new Request(`http://g10-auth.invalid/api/bff/users/${first.response.user.id}/session`),
    {params: Promise.resolve({userId: first.response.user.id})}
  );
  assert(unauthenticatedResponse.status === 401, 'The protected BFF route did not reject an unauthenticated request.');

  const accounts = await pool.query<{provider_id: string; issuer: string; access_token: string | null; refresh_token: string | null; id_token: string | null}>(
    'SELECT provider_id, issuer, access_token, refresh_token, id_token FROM "account" WHERE user_id = $1',
    [first.response.user.id]
  );
  assert(accounts.rows.length === 1 && accounts.rows[0]?.provider_id === 'credential', 'Production sign-up created a non-credential auth account.');
  assert(accounts.rows[0]?.issuer === createLocalAccountIssuer('credential'), 'The local credential issuer is incorrect.');
  assert(!accounts.rows[0]?.access_token && !accounts.rows[0]?.refresh_token && !accounts.rows[0]?.id_token, 'A local auth account contains provider token material.');

  await pool.query('UPDATE "session" SET expires_at = now() - interval \'1 second\' WHERE id = $1', [firstSession.session.id]);
  const expired = await auth.api.getSession({
    headers: new Headers({cookie: firstCookie}),
    query: {disableCookieCache: true, disableRefresh: true}
  });
  assert(expired === null, 'An expired session still authorized access.');

  const reauthenticated = await auth.api.signInEmail({
    body: {email: first.response.user.email, password},
    returnHeaders: true
  });
  const reauthenticatedCookie = cookieHeader(reauthenticated.headers);
  const reauthenticatedSession = await auth.api.getSession({headers: new Headers({cookie: reauthenticatedCookie})});
  assert(reauthenticatedSession?.user.id === first.response.user.id, 'Re-authentication did not restore the same application identity.');

  const revocable = await auth.api.signInEmail({
    body: {email: first.response.user.email, password},
    returnHeaders: true
  });
  const revocableCookie = cookieHeader(revocable.headers);
  const revocableSession = await auth.api.getSession({headers: new Headers({cookie: revocableCookie})});
  assert(revocableSession, 'The revocation fixture session was not created.');
  const revoked = await auth.api.revokeSession({
    headers: new Headers({cookie: reauthenticatedCookie}),
    body: {token: revocableSession.session.token}
  });
  assert(revoked.status, 'Better Auth did not confirm session revocation.');
  assert(await auth.api.getSession({headers: new Headers({cookie: revocableCookie})}) === null, 'A revoked session still authorized access.');

  const signedOut = await auth.api.signOut({headers: new Headers({cookie: reauthenticatedCookie})});
  assert(signedOut.success, 'Better Auth did not confirm sign-out.');
  assert(await auth.api.getSession({headers: new Headers({cookie: reauthenticatedCookie})}) === null, 'A signed-out session still authorized access.');

  console.log(JSON.stringify({
    kind: 'g10-production-auth-result-v1',
    postgresql: '18.6',
    versions: {'better-auth': '1.7.2', 'drizzle-orm': '0.45.2', 'drizzle-kit': '0.31.10', pg: '8.23.0'},
    checks: ['clean migration', 'UUID user PK', 'signed out', 'signed in', 'cross-user rejection', 'expiry', 're-authentication', 'revocation', 'sign-out', 'credential-only account'],
    status: 'PASS'
  }, null, 2));
} finally {
  if (runtimePoolStarted) await getDatabasePool().end();
  await pool.end();
}
