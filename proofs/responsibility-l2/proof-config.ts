import { defineConfig } from "drizzle-kit";

export const PROOF_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:55413/lunowa_issue_13";

export default defineConfig({
  dialect: "postgresql",
  schema: "./proofs/responsibility-l2/schema.ts",
  out: "./proofs/responsibility-l2/migrations",
  dbCredentials: {
    url: process.env.P13_DATABASE_URL ?? PROOF_DATABASE_URL,
  },
});
