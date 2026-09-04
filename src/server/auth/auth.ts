import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';

import {getDatabase} from '@/server/db';
import * as authSchema from '@/server/db/schema/auth';

type DrizzleDatabase = Parameters<typeof drizzleAdapter>[0];

export type AppAuthEnvironment = {
  secret: string;
  baseURL: string;
};

export function createAppAuth(database: DrizzleDatabase, environment: AppAuthEnvironment) {
  if (environment.secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
  }

  return betterAuth({
    appName: 'Lunowa',
    secret: environment.secret,
    baseURL: environment.baseURL,
    database: drizzleAdapter(database, {
      provider: 'pg',
      schema: authSchema,
      transaction: true
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true
    },
    account: {
      accountLinking: {enabled: false}
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 60 * 24,
      cookieCache: {enabled: false}
    },
    advanced: {
      database: {generateId: 'uuid'}
    }
  });
}

let applicationAuth: ReturnType<typeof createAppAuth> | undefined;

function requiredEnvironment(name: 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL'): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Lunowa application requests.`);
  return value;
}

export function getAppAuth() {
  if (!applicationAuth) {
    applicationAuth = createAppAuth(getDatabase(), {
      secret: requiredEnvironment('BETTER_AUTH_SECRET'),
      baseURL: requiredEnvironment('BETTER_AUTH_URL')
    });
  }
  return applicationAuth;
}
