import { defineConfig } from "drizzle-kit";
import { PROOF_DATABASE_URL } from "./proof-config";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./proofs/better-auth-uuid/auth-schema.ts",
    "./proofs/better-auth-uuid/domain-schema.ts",
  ],
  out: "./proofs/better-auth-uuid/migrations",
  dbCredentials: {
    url: process.env.P14_DATABASE_URL ?? PROOF_DATABASE_URL,
  },
});
