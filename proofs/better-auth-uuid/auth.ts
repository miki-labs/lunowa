import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import {account, betterAuthProofSchema, session, user, verification} from './schema';

export function createProofAuth(databaseUrl: string) {
  const pool = new Pool({connectionString: databaseUrl});
  const db = drizzle({client: pool, schema: {user, session, account, verification}});
  const auth = betterAuth({
    baseURL: 'http://localhost:3000',
    secret: 'p14-local-proof-secret-that-is-long-enough-and-not-production',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: betterAuthProofSchema,
      transaction: true
    }),
    advanced: {
      database: {
        generateId: 'uuid'
      }
    },
    emailAndPassword: {
      enabled: true
    }
  });

  return {auth, pool};
}
