import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import {CommunicationRepository} from '../src/server/db/repositories/communication';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import {ResponsibilityRepository} from '../src/server/db/repositories/responsibility';
import * as schema from '../src/server/db/schema';
import {extractGmailFailedDeliveryStatus} from '../src/server/gmail/delivery-status';
import {normalizeGmailMessage} from '../src/server/gmail/normalize';
import {GmailSendService} from '../src/server/gmail/send';
import type {GmailMessage, GmailProviderClient} from '../src/server/gmail/types';
import type {TrustedResponsibilityCommand} from '../src/server/responsibility';

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

function failedDsnMessage(originalMessageId: string): GmailMessage {
  return {
    id: 'g51-dsn', threadId: 'g51-dsn-thread', labelIds: ['INBOX'], internalDate: '1893456001000',
    payload: {mimeType: 'multipart/report', headers: [
      {name: 'From', value: 'Mail Delivery Subsystem <mailer-daemon@example.net>'},
      {name: 'To', value: 'owner@example.com'},
      {name: 'Subject', value: 'Delivery Status Notification (Failure)'},
      {name: 'Message-ID', value: '<g51-dsn@example.net>'},
      {name: 'Content-Type', value: 'multipart/report; report-type=delivery-status; boundary=g51-dsn'}
    ], parts: [
      {mimeType: 'text/plain', body: {data: Buffer.from('Delivery failed.').toString('base64url')}},
      {mimeType: 'message/delivery-status', body: {data: Buffer.from('Final-Recipient: rfc822; person@example.com\r\nAction: failed\r\nStatus: 5.1.1\r\n').toString('base64url')}},
      {mimeType: 'text/rfc822-headers', body: {data: Buffer.from(`Message-ID: ${originalMessageId}\r\nSubject: Re: G51 request\r\n`).toString('base64url')}}
    ]}
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
  const responsibilityRepository = new ResponsibilityRepository(db);
  const initialCommand: TrustedResponsibilityCommand = {
    commandSource: 'TRUSTED_SYSTEM',
    userId,
    connectedAccountId: accountId,
    conversationId: source.conversationId,
    sourceEventKey: 'g51-initial-responsibility',
    candidateKey: 'g51-initial-responsibility',
    applicationKey: 'g51-initial-responsibility',
    evidenceRevision: source.evidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP']},
    operationalOutcome: 'reply to the request',
    obligationLegs: [{
      id: randomUUID(), bearer: 'USER', actionCode: 'REPLY_TO_REQUEST', status: 'OPEN', actionability: 'ACTIONABLE', basisKind: 'COMMUNICATED_REQUEST',
      provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: source.messageId}]
    }],
    provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: source.messageId}]
  };
  const initialResult = await responsibilityRepository.applyTrustedCommand(initialCommand);
  assert(initialResult.status === 'APPLIED' && initialResult.effects[0]?.state, 'G51 Responsibility fixture was not admitted');
  const initialResponsibility = initialResult.effects[0]!.state!;

  const communication = new CommunicationRepository(db);
  const draft = await communication.saveDraft({
    userId, connectedAccountId: accountId, conversationId: source.conversationId,
    inReplyToMessageId: source.messageId, mode: 'REPLY', body: 'Confirmed.'
  });
  const responsibilityBinding = {responsibilityId: initialResponsibility.id, aggregateVersion: initialResponsibility.aggregateVersion, evidenceRevision: initialResponsibility.acceptedEvidenceRevision};
  const operation = await communication.requestImmediateSend({userId, draftId: draft.id, responsibilityBinding});
  assert((await communication.listReconcilableSendOperations()).every((item) => item.id !== operation.id), 'PENDING SendOperation must never be cron-reconcilable');
  let sentMessageId = '';
  const providerFinalMessageId = '<g51-provider-final@mail.gmail.com>';
  const sent = () => message(sentMessageId, providerFinalMessageId, ['SENT']);
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
    listMessagesByRfc822MessageId: async (_token, messageId) => messageId === providerFinalMessageId
      ? ({messages: [{id: sentMessageId, threadId: 'g51-thread'}]})
      : ({messages: []})
  };
  const credentials = {getAccessToken: async () => 'g51-test-token'};
  const service = new GmailSendService(
    provider,
    credentials as never,
    communication,
    evidence,
    responsibilityRepository
  );
  const reconciled = await service.dispatch({userId, sendOperationId: operation.id});
  assert(reconciled.status === 'RECONCILED', 'G51 provider acceptance did not reconcile the SendOperation');
  assert(sendCalls === 1, 'G51 dispatch did not perform exactly one provider send');
  const replay = await service.dispatch({userId, sendOperationId: operation.id});
  assert(replay.status === 'RECONCILED' && sendCalls === 1, 'G51 duplicate dispatch sent again');
  const repeatedRequest = await communication.requestImmediateSend({userId, draftId: draft.id, responsibilityBinding});
  assert(repeatedRequest.id === operation.id, 'lost-response/page-reload request did not converge on the reconciled immutable draft snapshot');
  const repeatedDispatch = await service.dispatch({userId, sendOperationId: repeatedRequest.id});
  assert(repeatedDispatch.status === 'RECONCILED' && sendCalls === 1, 'replayed explicit request duplicated the provider send');

  const resultingResponsibility = await responsibilityRepository.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: initialResponsibility.id});
  assert(resultingResponsibility?.state.resolutionStatus === 'RESOLVED', 'reconciled sent Source did not apply the bound Responsibility consequence');

  const dsnMessage = failedDsnMessage(providerFinalMessageId);
  const deliveryStatus = await extractGmailFailedDeliveryStatus(dsnMessage);
  assert(deliveryStatus, 'structured failed DSN fixture was not recognized');
  const dsnSource = await evidence.upsertNormalizedMessage(await normalizeGmailMessage({
    userId, connectedAccountId: accountId, accountEmail: 'owner@example.com', message: dsnMessage
  }));
  const targetBeforeBounce = await responsibilityRepository.getResponsibility({
    userId, connectedAccountId: accountId, responsibilityId: initialResponsibility.id
  });
  assert(targetBeforeBounce, 'resolved Responsibility disappeared before non-delivery proof');
  const crossThreadGeneric: TrustedResponsibilityCommand = {
    commandSource: 'TRUSTED_SYSTEM', userId, connectedAccountId: accountId,
    conversationId: targetBeforeBounce.state.conversationId,
    sourceEventKey: 'g51-cross-thread-generic', candidateKey: 'g51-cross-thread-generic',
    applicationKey: 'g51-cross-thread-generic', evidenceRevision: targetBeforeBounce.semanticEvidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP']},
    provenance: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: dsnSource.messageId}],
    effects: [{operation: 'NO_OP', responsibilityRef: targetBeforeBounce.state.id, effectKey: 'g51-cross-thread-generic'}]
  };
  const crossThreadRejected = await responsibilityRepository.applyTrustedCommand(crossThreadGeneric);
  assert(crossThreadRejected.status === 'REJECTED', 'generic cross-thread Source bypassed conversation evidence authorization');
  const reopened = await service.observeProviderNonDelivery({
    userId, connectedAccountId: accountId, accessToken: 'g51-test-token',
    sourceMessageId: dsnSource.messageId, deliveryStatus
  });
  assert(reopened, 'trusted DSN did not re-enter Responsibility reduction');
  const afterBounce = await responsibilityRepository.getResponsibility({
    userId, connectedAccountId: accountId, responsibilityId: initialResponsibility.id
  });
  assert(afterBounce?.state.resolutionStatus === 'OPEN', 'trusted non-delivery did not REOPEN the previously reconciled Responsibility');
  assert(afterBounce.state.obligationLegs.some((leg) => leg.actionCode === 'REPLY_TO_REQUEST' && leg.status === 'OPEN'),
    'trusted non-delivery did not restore the exact communication leg');
  assert(afterBounce.state.resolutionHistory.length >= 1, 'REOPEN erased prior resolution history');
  const replayedBounce = await service.observeProviderNonDelivery({
    userId, connectedAccountId: accountId, accessToken: 'g51-test-token',
    sourceMessageId: dsnSource.messageId, deliveryStatus
  });
  assert(replayedBounce === false, 'replayed DSN applied a second non-delivery mutation');

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
