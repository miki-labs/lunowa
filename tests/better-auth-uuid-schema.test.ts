import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {describe, expect, it} from 'vitest';

const authConfig = resolve('proofs/better-auth-uuid/auth.config.ts');
const generatedAuthSchema = resolve('proofs/better-auth-uuid/auth-schema.ts');
const evidence = resolve('proofs/better-auth-uuid/evidence.json');

async function readGeneratedSql() {
  const sqlFiles = (await readdir(resolve('proofs/better-auth-uuid/drizzle')))
    .filter((file) => file.endsWith('.sql'));
  expect(sqlFiles).toHaveLength(1);
  return readFile(resolve('proofs/better-auth-uuid/drizzle', sqlFiles[0] ?? ''), 'utf8');
}

describe('P14 generated Drizzle schema contract', () => {
  it('keeps Better Auth IDs and auth user FKs as PostgreSQL UUIDs', async () => {
    const sql = await readGeneratedSql();

    expect(sql).toContain('CREATE TABLE "user"');
    expect(sql).toContain('"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL');
    expect(sql).toContain('"user_id" uuid NOT NULL');
    expect(sql).toContain('"responsibility_proof_fixture"');
    expect(sql).toContain('FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")');
    expect(sql).not.toMatch(/"id" text PRIMARY KEY/);
  });

  it('preserves the installed Better Auth 1.7 issuer/accountId account key', async () => {
    const sql = await readGeneratedSql();

    expect(sql).toContain('"account_issuer_accountId_uidx" ON "account" USING btree ("issuer","account_id")');
  });

  it('binds Drizzle SQL to Better Auth CLI output and the precise account-key policy', async () => {
    const [authSource, generatedSource, evidenceSource] = await Promise.all([
      readFile(authConfig, 'utf8'),
      readFile(generatedAuthSchema, 'utf8'),
      readFile(evidence, 'utf8')
    ]);
    const result = JSON.parse(evidenceSource) as {
      acceptance: Record<string, {status: string}>;
      accountSemantics: {identityStrategy: string; identitySelector: string[]};
    };

    expect(authSource).toContain("generateId: 'uuid'");
    expect(authSource).toContain("strategy: 'issuer-account-id'");
    expect(generatedSource).toContain('uuid("id")');
    expect(generatedSource).toContain('uuid("user_id")');
    expect(result.accountSemantics).toMatchObject({
      identityStrategy: 'issuer-account-id',
      identitySelector: ['issuer', 'accountId']
    });
    for (const acceptanceId of ['47', '48', '49']) {
      expect(result.acceptance[acceptanceId]?.status).toBe('PASS');
    }
  });
});
