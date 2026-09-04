import {defineConfig} from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/server/db/schema/auth.ts', './src/server/db/schema/evidence.ts'],
  out: './drizzle/migrations'
});
