import {betterAuth} from 'better-auth';
import {APIError, createAuthMiddleware} from 'better-auth/api';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';

import {getDatabase} from '@/server/db';
import * as authSchema from '@/server/db/schema/auth';

type DrizzleDatabase = Parameters<typeof drizzleAdapter>[0];

export type AppAuthEnvironment = {
  secret: string;
  baseURL: string;
  google?: {clientId: string; clientSecret: string};
  /** Explicit opt-in for existing database acceptance fixtures, never runtime fallback. */
  credentialFixture?: boolean;
};

// App identity needs the verified Google subject, not reusable Google API tokens.
const discardIdentityTokens = async () => ({data: {
  accessToken: null, refreshToken: null, idToken: null,
  accessTokenExpiresAt: null, refreshTokenExpiresAt: null
}});

export function createAppAuth(database: DrizzleDatabase, environment: AppAuthEnvironment) {
  if (environment.secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
  }

  return betterAuth({
    appName: 'Lunowa',
    disabledPaths: ['/link-social'],
    secret: environment.secret,
    baseURL: environment.baseURL,
    database: drizzleAdapter(database, {
      provider: 'pg',
      schema: authSchema,
      transaction: true
    }),
    emailAndPassword: {
      enabled: environment.credentialFixture === true,
      autoSignIn: true
    },
    account: {
      accountLinking: {enabled: false},
      storeAccountCookie: false
    },
    socialProviders: environment.google ? {
      google: {
        clientId: environment.google.clientId,
        clientSecret: environment.google.clientSecret,
        accessType: 'online',
        includeGrantedScopes: false,
        prompt: 'select_account',
        disableIdTokenSignIn: true
      }
    } : {},
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path !== '/sign-in/social') return;
        // The public endpoint must not turn app login into mailbox authorization.
        if (context.body?.provider !== 'google' || context.body?.scopes !== undefined ||
            context.body?.additionalParams !== undefined || context.body?.idToken !== undefined) {
          throw new APIError('BAD_REQUEST', {message: 'Unsupported application sign-in options.'});
        }
      })
    },
    databaseHooks: {
      account: {
        create: {before: discardIdentityTokens},
        update: {before: discardIdentityTokens}
      }
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
    const clientId = process.env.GOOGLE_AUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
    if (Boolean(clientId) !== Boolean(clientSecret)) {
      throw new Error('Both GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET are required.');
    }
    applicationAuth = createAppAuth(getDatabase(), {
      secret: requiredEnvironment('BETTER_AUTH_SECRET'),
      baseURL: requiredEnvironment('BETTER_AUTH_URL'),
      google: clientId && clientSecret ? {clientId, clientSecret} : undefined
    });
  }
  return applicationAuth;
}
