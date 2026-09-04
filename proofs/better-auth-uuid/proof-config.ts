import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const PROOF_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:55414/lunowa_issue_14";

type DrizzleDatabase = Parameters<typeof drizzleAdapter>[0];

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
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
  });
}
