import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

import {normalizedEvidenceFixture} from '@/server/evidence/fixtures';
import {canonicalizeParticipant} from '@/server/evidence/normalized';

const migration = readFileSync(
  resolve(process.cwd(), 'drizzle/migrations/0001_parallel_drax.sql'),
  'utf8'
);

describe('G19 provider-neutral evidence foundation', () => {
  it('keeps the production migration on the G10 User UUID target', () => {
    expect(migration).toContain('CREATE TABLE "connected_accounts"');
    expect(migration).toContain('CREATE TABLE "provider_sync_states"');
    expect(migration).toContain('CREATE TABLE "conversations"');
    expect(migration).toContain('CREATE TABLE "messages"');
    expect(migration).toContain('CREATE TABLE "attachments"');
    expect(migration).toContain('CREATE TABLE "participant_identities"');
    expect(migration).toContain('CREATE TABLE "message_participants"');
    expect(migration).toContain('REFERENCES "public"."user"("id")');
    expect(migration).toContain('"semantic_evidence_revision" bigint DEFAULT 0 NOT NULL');
    expect(migration).toContain('conversations_revision_nonnegative');
    expect(migration).toContain('conversations_semantic_evidence_revision_monotonic');
    expect(migration).not.toContain('p13_fixture_');
    expect(migration).not.toContain('CREATE TABLE "responsibilities"');
    expect(migration.toLowerCase()).not.toContain('gmail');
  });

  it('emits the ownership and provider uniqueness constraints', () => {
    expect(migration).toContain('"connected_accounts_id_user_uq" UNIQUE("id","user_id")');
    expect(migration).toContain('"conversations_id_account_uq" UNIQUE("id","connected_account_id")');
    expect(migration).toContain('"participant_identities_id_user_uq" UNIQUE("id","user_id")');
    expect(migration).toContain('"messages_id_account_uq" UNIQUE("id","connected_account_id")');
    expect(migration).toContain('"messages_account_provider_message_uq" UNIQUE("connected_account_id","provider_message_id")');
    expect(migration).toContain('"messages_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id")');
    expect(migration).toContain('"messages_conversation_account_fk" FOREIGN KEY ("conversation_id","connected_account_id")');
    expect(migration).toContain('"message_participants_participant_owner_fk" FOREIGN KEY ("participant_id","user_id")');
  });

  it('provides a normalized fixture and canonicalizes identity without Gmail', () => {
    const fixture = normalizedEvidenceFixture(
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002'
    );
    expect(fixture.providerMessageId).toBe('provider-message-001');
    expect(fixture.attachments).toHaveLength(1);
    expect(canonicalizeParticipant({email: ' Sender@Example.com '}).canonicalEmail).toBe('sender@example.com');
    expect(() => canonicalizeParticipant({email: 'not-an-email'})).toThrow(/canonical email/);
  });
});
