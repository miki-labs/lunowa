import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

/**
 * The single Better Auth configuration used by the CLI generator and the
 * runtime proof. The CLI receives this file directly and selects its Drizzle
 * PostgreSQL generator with --adapter/--dialect.
 */
export const proofAuthOptions = {
  baseURL: 'http://localhost:3000',
  secret: 'p14-local-proof-secret-that-is-long-enough-and-not-production',
  advanced: {
    database: {
      generateId: 'uuid' as const
    }
  },
  emailAndPassword: {
    enabled: true
  }
};

/**
 * Better Auth 1.7.2 has no `account.identityStrategy` option to select. Its
 * runtime account-key API is explicitly issuer + accountId, which is also the
 * generated unique index. Record that concrete installed-version policy here
 * instead of relying on an undocumented compatibility default.
 */
export const proofAccountIdentityPolicy = {
  strategy: 'issuer-account-id',
  selector: ['issuer', 'accountId'],
  localCredentialProviderId: 'credential',
  localCredentialIssuer: 'local:credential',
  localCredentialAccountId: 'user.id'
} as const;

// This adapter is generator-only: `auth generate` receives the same Drizzle
// PostgreSQL shape and does not open the lazy pg pool. Runtime construction is
// in auth.ts and uses the isolated P14 URL supplied by the test command.
const generatorPool = new Pool({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:55414/lunowa_issue_14'
});

export const auth = betterAuth({
  ...proofAuthOptions,
  database: drizzleAdapter(drizzle({client: generatorPool}), {provider: 'pg'})
});
