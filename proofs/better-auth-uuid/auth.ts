import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import {proofAuthOptions} from './auth.config';
import {account, session, user, verification} from './auth-schema';

export function createProofAuth(databaseUrl: string) {
  const pool = new Pool({connectionString: databaseUrl});
  const db = drizzle({client: pool, schema: {user, session, account, verification}});
  const auth = betterAuth({
    ...proofAuthOptions,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {user, session, account, verification},
      transaction: true
    })
  });

  return {auth, pool};
}
