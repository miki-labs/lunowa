import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import {CommunicationRepository} from '../src/server/db/repositories/communication';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import * as schema from '../src/server/db/schema';
import {normalizeGmailMessage} from '../src/server/gmail/normalize';
import {GmailSendService, buildGmailMessageId} from '../src/server/gmail/send';
import type {GmailMessage, GmailProviderClient} from '../src/server/gmail/types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G51_DATABASE_URL;
assert(databaseUrl, 'G51_DATABASE_URL is required; no mock or fallback database is accepted.');
const pool = new Pool({connectionString: databaseUrl, max: 4, application_name: 'lunowa-g51-send'});
const db = drizzle(pool, {schema});

function message(id: string, messageId: string, labels: string[]): GmailMessage {
  return {
    id, threadId: 'g51-thread', labelIds: labels, internalDate: '1893456000000',
    payload: {mimeType: 'text/plain', headers: [
      {name: 'From', value: 'Owner <owner@example.com>'},
      {name: 'To', value: 'Person <person@example.com>'},
      {name: 'Subject', value: 'Re: G51 request'},
      {name: 'Message-ID', value: messageId},
      {name: 'References', value: '<g51-original@example.com>'}
    ], body: {data: Buffer.from(`body-${id}`).toString('base64url')}}
  };
}

try {
  await migrate(db, {migrationsFolder: resolve(import.meta.dirname, '../drizzle/migrations')});
  const userId = randomUUID();
  await db.insert(schema.user).values({id: userId, name: 'G51 user', email: `g51-${userId}@example.invalid`});
  const evidence = new EvidenceRepository(db);
  const accountId = await evidence.upsertConnectedAccount({
    userId, provider: 'gmail', providerAccountId: `g51-${userId}`,
    emailAddress: 'owner@example.com', credentialReference: `g51-credential-${userId}`,
    grantedCapabilities: ['mail_read', 'mail_send']
  });
  const original = message('g51-original', '<g51-original@example.com>', ['INBOX']);
  const source = await evidence.upsertNormalizedMessage(await normalizeGmailMessage({
    userId, connectedAccountId: accountId, accountEmail: 'owner@example.com', message: original
  }));
  const communication = new CommunicationRepository(db);
  const draft = await communication.saveDraft({
    userId, connectedAccountId: accountId, conversationId: source.conversationId,
    inReplyToMessageId: source.messageId, mode: 'REPLY', body: 'Confirmed.'
  });
  const operation = await communication.requestImmediateSend({userId, draftId: draft.id});
  let sentMessageId = '';
  const sent = () => message(sentMessageId, buildGmailMessageId(operation.id), ['SENT']);
  let sendCalls = 0;
  const provider: GmailProviderClient = {
    exchangeCode: async () => { throw new Error('not used'); },
    refresh: async () => { throw new Error('not used'); },
    revoke: async () => undefined,
    getProfile: async () => { throw new Error('not used'); },
    watch: async () => { throw new Error('not used'); },
    listMessages: async () => ({messages: []}),
    listHistory: async () => ({history: []}),
    getAttachment: async () => ({data: ''}),
    getMessage: async (_token, id) => id === original.id ? original : sent(),
    sendMessage: async () => {
      sendCalls += 1;
      sentMessageId = 'g51-sent';
      return {id: sentMessageId, threadId: 'g51-thread'};
    },
    listMessagesByRfc822MessageId: async () => ({messages: []})
  };
  const credentials = {getAccessToken: async () => 'g51-test-token'};
  const service = new GmailSendService(provider, credentials as never, communication, evidence);
  const reconciled = await service.dispatch({userId, sendOperationId: operation.id});
  assert(reconciled.status === 'RECONCILED', 'G51 provider acceptance did not reconcile the SendOperation');
  assert(sendCalls === 1, 'G51 dispatch did not perform exactly one provider send');
  const replay = await service.dispatch({userId, sendOperationId: operation.id});
  assert(replay.status === 'RECONCILED' && sendCalls === 1, 'G51 duplicate dispatch sent again');

  const persisted = await db.select({status: schema.sendOperations.status, attempts: schema.sendOperations.attemptCount})
    .from(schema.sendOperations);
  assert(persisted.length === 1 && persisted[0]?.status === 'RECONCILED' && persisted[0].attempts === 1,
    'G51 claim/state transition was not durable and idempotent');
  const sourceRows = await db.select({providerMessageId: schema.messages.providerMessageId})
    .from(schema.messages);
  assert(sourceRows.some((row) => row.providerMessageId === sentMessageId), 'G51 sent Gmail message was not persisted as Source evidence');
  process.stdout.write('G51 Gmail PostgreSQL SendOperation claim/reconciliation integration: PASS\n');
} finally {
  await pool.end();
}
