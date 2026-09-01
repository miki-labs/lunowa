import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {describe, expect, it} from 'vitest';

const generatedSql = resolve('proofs/better-auth-uuid/drizzle/0000_dear_felicia_hardy.sql');
const authConfig = resolve('proofs/better-auth-uuid/auth.ts');
const evidence = resolve('proofs/better-auth-uuid/evidence.json');

describe('P14 generated Drizzle schema contract', () => {
  it('keeps Better Auth IDs and auth user FKs as PostgreSQL UUIDs', async () => {
    const sql = await readFile(generatedSql, 'utf8');

    expect(sql).toContain('CREATE TABLE "user"');
    expect(sql).toContain('"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL');
    expect(sql).toContain('"user_id" uuid NOT NULL');
    expect(sql).toContain('"responsibility_proof_fixture"');
    expect(sql).toContain('FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")');
    expect(sql).not.toMatch(/"id" text PRIMARY KEY/);
  });

  it('records the Better Auth 1.7 account identity selector in generated SQL', async () => {
    const sql = await readFile(generatedSql, 'utf8');

    expect(sql).toContain('"account_issuer_account_id_unique" ON "account" USING btree ("issuer","account_id")');
  });

  it('requires Better Auth UUID mode and preserves a machine-readable acceptance ledger', async () => {
    const [authSource, evidenceSource] = await Promise.all([
      readFile(authConfig, 'utf8'),
      readFile(evidence, 'utf8')
    ]);
    const result = JSON.parse(evidenceSource) as {acceptance: Record<string, {status: string}>};

    expect(authSource).toContain("generateId: 'uuid'");
    for (const acceptanceId of ['47', '48', '49']) {
      expect(result.acceptance[acceptanceId]?.status).toMatch(/^(PASS|FAIL|BLOCKED|NOT_RUN)$/);
    }
  });
});
