import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';

import * as schema from '../src/server/db/schema';
import {CommunicationInputError, CommunicationRepository, DraftConflictError} from '../src/server/db/repositories/communication';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G50_DATABASE_URL;
assert(databaseUrl, 'G50_DATABASE_URL is required; no mock or fallback database is accepted.');
const pool = new Pool({connectionString: databaseUrl, max: 4, application_name: 'lunowa-g50-communication'});
const database = drizzle(pool, {schema});
const userId = randomUUID();
const otherUserId = randomUUID();
let accountId = '';
const conversationId = randomUUID();

try {
  const version = await pool.query<{server_version_num: string}>("SELECT current_setting('server_version_num') AS server_version_num");
  assert(version.rows[0]?.server_version_num === '180006', 'G50 integration requires PostgreSQL 18.6.');
  const tables = await pool.query<{table_name: string}>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  assert(tables.rowCount === 0, 'G50 integration requires a clean database.');
  await migrate(database, {migrationsFolder: resolve(import.meta.dirname, '../drizzle/migrations')});
  await pool.query(`INSERT INTO "user" (id, name, email) VALUES ($1, 'G50 user', $2), ($3, 'G50 other', $4)`, [
    userId, `g50-${userId}@example.invalid`, otherUserId, `g50-other-${otherUserId}@example.invalid`
  ]);

  const evidence = new EvidenceRepository(database);
  accountId = await evidence.upsertConnectedAccount({
    userId,
    provider: 'gmail',
    providerAccountId: `g50-account-${accountId}`,
    emailAddress: 'owner@example.invalid',
    displayName: 'G50 owner',
    credentialReference: 'g50-credential',
    grantedCapabilities: ['mail_read', 'mail_send']
  });
  const normalized = await evidence.upsertNormalizedMessage({
    userId,
    connectedAccountId: accountId,
    conversation: {id: conversationId, providerThreadId: 'g50-thread', normalizedSubject: 'G50 request'},
    providerMessageId: 'g50-message',
    providerThreadId: 'g50-thread',
    direction: 'INBOUND',
    sender: {email: 'sender@example.invalid', displayName: 'Sender'},
    recipients: [{email: 'owner@example.invalid', displayName: 'G50 owner'}, {email: 'other@example.invalid', displayName: 'Other'}],
    cc: [{email: 'copy@example.invalid', displayName: 'Copy'}],
    subject: 'G50 request',
    textBody: 'Please review this.',
    occurredAt: new Date('2030-01-01T00:00:00.000Z')
  });
  const repository = new CommunicationRepository(database);
  const draft = await repository.saveDraft({
    userId,
    connectedAccountId: accountId,
    conversationId,
    inReplyToMessageId: normalized.messageId,
    mode: 'REPLY_ALL',
    body: '確認しました。'
  });
  assert(draft.version === 1 && draft.recipients.map(({email}) => email).join('|') === 'sender@example.invalid|other@example.invalid', 'Reply All did not use trusted observed recipients.');
  assert(draft.cc.map(({email}) => email).join('|') === 'copy@example.invalid' && draft.bcc.length === 0, 'Reply All recipient visibility/Bcc safety failed.');
  const initialContext = await repository.getReplyContext({userId, connectedAccountId: accountId, conversationId, inReplyToMessageId: normalized.messageId, mode: 'REPLY_ALL'});
  assert(initialContext.connectedAccount.sendAuthorized, 'live send capability was not exposed in the trusted reply context.');
  await repository.saveDraft({
    userId, connectedAccountId: accountId, conversationId, inReplyToMessageId: normalized.messageId, mode: 'REPLY_ALL', body: 'role check',
    recipients: [{email: 'copy@example.invalid'}]
  }).then(() => { throw new Error('Cc recipient was silently promoted into To'); }, (error: unknown) => {
    assert(error instanceof CommunicationInputError && error.code === 'RECIPIENT_NOT_AUTHORIZED', 'To/Cc authorization boundary was not enforced.');
  });

  const updated = await repository.saveDraft({
    userId, draftId: draft.id, expectedVersion: 1, connectedAccountId: accountId, conversationId,
    inReplyToMessageId: normalized.messageId, mode: 'REPLY_ALL', body: '確認しました。\n次の条件をお願いします。'
  });
  assert(updated.version === 2 && updated.body.includes('\n'), 'Draft versioned update did not preserve serialized text.');
  await repository.saveDraft({
    userId, draftId: draft.id, expectedVersion: 1, connectedAccountId: accountId, conversationId,
    inReplyToMessageId: normalized.messageId, mode: 'REPLY_ALL', body: 'stale overwrite'
  }).then(() => { throw new Error('stale draft overwrite was accepted'); }, (error: unknown) => {
    assert(error instanceof DraftConflictError && error.currentVersion === 2, 'stale draft conflict was not deterministic.');
  });

  const operation = await repository.requestImmediateSend({userId, draftId: updated.id});
  const repeated = await repository.requestImmediateSend({userId, draftId: updated.id});
  assert(operation.id === repeated.id && operation.status === 'PENDING', 'repeated client request did not replay one pending SendOperation.');
  assert(operation.providerMessageId === null && operation.providerResultId === null, 'G50 request claimed provider success.');
  const count = await pool.query<{count: string}>(`SELECT count(*)::text AS count FROM send_operations WHERE user_id = $1`, [userId]);
  assert(count.rows[0]?.count === '1', 'idempotency created duplicate SendOperation rows.');
  await repository.saveDraft({
    userId, draftId: updated.id, expectedVersion: 2, connectedAccountId: accountId, conversationId,
    inReplyToMessageId: normalized.messageId, mode: 'REPLY_ALL', body: 'must not overwrite pending snapshot'
  }).then(() => { throw new Error('pending SendOperation allowed its Draft snapshot to be overwritten'); }, (error: unknown) => {
    assert(error instanceof CommunicationInputError && error.code === 'DRAFT_SEND_IN_PROGRESS', 'pending SendOperation did not freeze its Draft snapshot.');
  });

  const unauthorizedDraft = await repository.saveDraft({
    userId, connectedAccountId: accountId, conversationId, inReplyToMessageId: normalized.messageId, mode: 'REPLY', body: 'capability check'
  });
  await pool.query(`UPDATE connected_accounts SET granted_capabilities = '["mail_read"]'::jsonb WHERE id = $1 AND user_id = $2`, [accountId, userId]);
  const noSendContext = await repository.getReplyContext({userId, connectedAccountId: accountId, conversationId, inReplyToMessageId: normalized.messageId, mode: 'REPLY'});
  assert(!noSendContext.connectedAccount.sendAuthorized, 'revoked send capability was rendered as available.');
  await repository.requestImmediateSend({userId, draftId: unauthorizedDraft.id}).then(
    () => { throw new Error('Send was accepted without the account capability'); },
    (error: unknown) => assert(error instanceof CommunicationInputError && error.code === 'ACCOUNT_SEND_NOT_AUTHORIZED', 'Send capability was not re-authorized at request time.')
  );
  await pool.query(`UPDATE connected_accounts SET granted_capabilities = '["mail_read", "mail_send"]'::jsonb WHERE id = $1 AND user_id = $2`, [accountId, userId]);

  const offlineDraft = await repository.saveDraft({
    userId, connectedAccountId: accountId, conversationId, inReplyToMessageId: normalized.messageId, mode: 'REPLY', body: 'offline attempt'
  });
  await pool.query(`UPDATE connected_accounts SET connection_state = 'DISCONNECTED' WHERE id = $1 AND user_id = $2`, [accountId, userId]);
  await repository.requestImmediateSend({userId, draftId: offlineDraft.id}).then(
    () => { throw new Error('offline Send created a consequential operation'); },
    (error: unknown) => assert(error instanceof CommunicationInputError && error.code === 'ACCOUNT_NOT_CONNECTED', 'offline Send did not stop at the capability boundary.')
  );
  const offlineCount = await pool.query<{count: string}>(`SELECT count(*)::text AS count FROM send_operations WHERE user_id = $1 AND draft_id = $2`, [userId, offlineDraft.id]);
  assert(offlineCount.rows[0]?.count === '0', 'offline Send was silently queued.');

  const otherDraft = await repository.getDraft(otherUserId, draft.id);
  assert(otherDraft === null, 'draft read crossed the user boundary.');
  console.log('G50 communication production integration: PASS');
} finally {
  await pool.end();
}
