import {defineConfig} from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './proofs/better-auth-uuid/schema.ts',
  out: './proofs/better-auth-uuid/drizzle',
  dbCredentials: {
    // Generation is offline. Runtime tests require P14_DATABASE_URL instead.
    url: 'postgresql://postgres:postgres@127.0.0.1:55414/lunowa_issue_14'
  }
});
