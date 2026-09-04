import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  PROOF_DATABASE_URL,
  createProofAuth,
} from "./proof-config";

const pool = new Pool({
  connectionString: process.env.P14_DATABASE_URL ?? PROOF_DATABASE_URL,
  max: 1,
  application_name: "lunowa-p14-schema-generation",
});

// This is the Better Auth CLI configuration. It is proof-only and is never
// imported by an application route or used for production authentication.
export const auth = createProofAuth(drizzle(pool));

export default auth;
