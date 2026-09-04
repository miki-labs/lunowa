import {defineConfig} from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './src/server/db/schema/auth.ts',
    './src/server/db/schema/evidence.ts',
    './src/server/db/schema/responsibility.ts'
  ],
  out: './drizzle/migrations'
});
