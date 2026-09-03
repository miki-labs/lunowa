import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const PROOF_ACCOUNT_IDENTITY_STRATEGY = "provider-id" as const;
export const PROOF_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:55414/lunowa_issue_14";

type DrizzleDatabase = Parameters<typeof drizzleAdapter>[0];
type AccountOptions = NonNullable<BetterAuthOptions["account"]> & {
  identityStrategy: typeof PROOF_ACCOUNT_IDENTITY_STRATEGY;
};

// Keep the issue's explicit Better Auth account identity selection in the
// actual options object. The cast is limited to this proof boundary because
// the published 1.7.2 declaration does not yet describe the vendor option.
const proofAccountOptions = {
  identityStrategy: "provider-id",
} as AccountOptions;

export function createProofAuth(
  database: DrizzleDatabase,
  schema?: Record<string, unknown>,
) {
  return betterAuth({
    secret: "p14-better-auth-uuid-proof-secret-32-bytes",
    baseURL: "http://p14-proof.invalid",
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    account: proofAccountOptions,
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
  });
}
