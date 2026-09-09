import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import * as schema from '../src/server/db/schema';
import {CommunicationRepository} from '../src/server/db/repositories/communication';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import {ResponsibilityRepository} from '../src/server/db/repositories/responsibility';
import {TemporalRepository} from '../src/server/db/repositories/temporal';
import {normalizeGmailMessage} from '../src/server/gmail/normalize';
import {GmailSendService} from '../src/server/gmail/send';
import type {GmailMessage, GmailProviderClient} from '../src/server/gmail/types';
import {buildAttentionReadModel} from '../src/server/responsibility/attention-read-model';
import {createDelegateResponsibilityCommand} from '../src/server/responsibility/attention';
import type {ResponsibilityState, TrustedResponsibilityCommand} from '../src/server/responsibility';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G80_DATABASE_URL;
assert(databaseUrl, 'G80_DATABASE_URL is required; no mock database fallback is accepted.');
const pool = new Pool({connectionString: databaseUrl, max: 5, application_name: 'lunowa-g80-complete-loop'});
const db = drizzle(pool, {schema});
function gmailMessage(input: {id: string; messageId: string; from: string; to: string; body: string; labels?: string[]}): GmailMessage {
  return {
    id: input.id,
    threadId: 'g80-thread',
    labelIds: input.labels ?? ['INBOX'],
    internalDate: '1893456000000',
    payload: {
      mimeType: 'text/plain',
      headers: [
        {name: 'From', value: input.from},
        {name: 'To', value: input.to},
        {name: 'Subject', value: 'G80 delegated loop'},
        {name: 'Message-ID', value: input.messageId}
      ],
      body: {data: Buffer.from(input.body).toString('base64url')}
    }
  };
}

function stateFrom(result: Awaited<ReturnType<ResponsibilityRepository['applyTrustedCommand']>>): ResponsibilityState {
  assert(result.status === 'APPLIED', result.status === 'APPLIED' ? 'missing applied state' : result.reason);
  const state = result.effects[0]?.state;
  assert(state, 'expected Responsibility state');
  return state;
}

function projection(state: ResponsibilityState, dataThroughAt: string) {
  return buildAttentionReadModel({responsibilities: [state], sourceReadiness: 'ready', dataThroughAt});
}
try {
  await migrate(db, {migrationsFolder: resolve(import.meta.dirname, '../drizzle/migrations')});

  const userId = randomUUID();
  const participantId = randomUUID();
  await db.insert(schema.user).values({id: userId, name: 'G80 user', email: `g80-${userId}@example.invalid`});
  await db.insert(schema.participantIdentities).values({
    id: participantId,
    userId,
    canonicalEmail: 'counterparty@example.com'
  });

  const evidence = new EvidenceRepository(db);
  const accountId = await evidence.upsertConnectedAccount({
    userId,
    provider: 'gmail',
    providerAccountId: `g80-${userId}`,
    emailAddress: 'owner@example.com',
    credentialReference: `g80-credential-${userId}`,
    grantedCapabilities: ['mail_read', 'mail_send']
  });
  const now = new Date('2030-01-01T00:00:00.000Z');
  await evidence.upsertProviderSyncState({
    userId,
    connectedAccountId: accountId,
    cursorOrDeltaToken: '100',
    status: 'HEALTHY',
    lastAttemptAt: now,
    lastSuccessAt: now,
    lastFullReconcileAt: now
  });
  const initialProvider = gmailMessage({
    id: 'g80-initial',
    messageId: '<g80-initial@example.com>',
    from: 'Counterparty <counterparty@example.com>',
    to: 'Owner <owner@example.com>',
    body: 'Please wait for my approval before proceeding.'
  });
  const initialSource = await evidence.upsertNormalizedMessage(await normalizeGmailMessage({
    userId,
    connectedAccountId: accountId,
    accountEmail: 'owner@example.com',
    message: initialProvider
  }));
  const responsibilities = new ResponsibilityRepository(db);
  const provenance = [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED' as const, messageId: initialSource.messageId}];
  const waitingCommand: TrustedResponsibilityCommand = {
    commandSource: 'TRUSTED_SYSTEM',
    userId,
    connectedAccountId: accountId,
    conversationId: initialSource.conversationId,
    sourceEventKey: 'g80-initial-responsibility',
    candidateKey: 'g80-initial-responsibility',
    applicationKey: 'g80-initial-responsibility',
    evidenceRevision: initialSource.evidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP']},
    operationalOutcome: 'obtain counterparty approval',
    liveTrackingState: 'HISTORICAL_INACTIVE',
    obligationLegs: [{
      id: randomUUID(),
      bearer: 'OTHER_PARTY',
      participantId,
      actionCode: 'SEND_APPROVAL',
      status: 'OPEN',
      actionability: 'BLOCKED',
      basisKind: 'COMMUNICATED_REQUEST',
      provenance
    }],
    provenance
  };
  const inactive = stateFrom(await responsibilities.applyTrustedCommand(waitingCommand));
  assert(inactive.liveTrackingState === 'HISTORICAL_INACTIVE', 'accepted pre-delegation state was not inactive');
  assert(projection(inactive, now.toISOString()).managedCount === 0, 'inactive Responsibility was presented as actively Managed');

  const delegated = stateFrom(await responsibilities.applyTrustedCommand(createDelegateResponsibilityCommand({
    state: inactive,
    requestKey: 'g80-delegate',
    evidenceRevision: inactive.acceptedEvidenceRevision,
    expectedAggregateVersion: inactive.aggregateVersion
  })));
  const managed = projection(delegated, now.toISOString());
  assert(managed.managedCount === 1 && managed.needsYou.length === 0, 'explicit delegation did not become quiet Managed');
  assert(managed.strictZero, 'healthy Managed work did not allow truthful zero attention');

  const temporal = new TemporalRepository(db);
  const quietTriggerId = randomUUID();
  await temporal.upsertTemporalContract({
    userId,
    connectedAccountId: accountId,
    responsibilityId: delegated.id,
    contractKind: 'PASSIVE_WAITING',
    createdBy: 'USER',
    returnCondition: {kind: 'TIME', label: 'reconsider current evidence'},
    triggers: [{id: quietTriggerId, triggerType: 'TIME', triggerAt: now.toISOString()}],
    now
  });
  const progressProvider = gmailMessage({
    id: 'g80-progress',
    messageId: '<g80-progress@example.com>',
    from: 'Counterparty <counterparty@example.com>',
    to: 'Owner <owner@example.com>',
    body: 'Progress update: approval is still pending.'
  });
  const progressSource = await evidence.upsertNormalizedMessage(await normalizeGmailMessage({
    userId,
    connectedAccountId: accountId,
    accountEmail: 'owner@example.com',
    message: progressProvider
  }));
  const quiet = await temporal.processTemporalTrigger({
    triggerId: quietTriggerId,
    userId,
    now,
    loadEvidence: async () => ({
      evidenceRevision: progressSource.evidenceRevision,
      references: [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED' as const, messageId: progressSource.messageId}],
      userAttentionNeeded: false
    })
  });
  assert(quiet.status === 'NO_OP', 'progress reply incorrectly resurfaced user attention');
  const quietState = (await responsibilities.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: delegated.id}))?.state;
  assert(quietState && projection(quietState, now.toISOString()).managedCount === 1, 'progress reply did not stay quiet Managed');
  const actionProvider = gmailMessage({
    id: 'g80-action',
    messageId: '<g80-action@example.com>',
    from: 'Counterparty <counterparty@example.com>',
    to: 'Owner <owner@example.com>',
    body: 'Approved. Please reply to confirm.'
  });
  const actionSource = await evidence.upsertNormalizedMessage(await normalizeGmailMessage({
    userId,
    connectedAccountId: accountId,
    accountEmail: 'owner@example.com',
    message: actionProvider
  }));
  const current = (await responsibilities.getResponsibility({userId, connectedAccountId: accountId, responsibilityId: delegated.id}))?.state;
  assert(current, 'Managed Responsibility disappeared before action reply');
  const actionProvenance = [{evidenceKind: 'PROVIDER_MESSAGE_OBSERVED' as const, messageId: actionSource.messageId}];
  const userLegId = randomUUID();
  const actionRequired = stateFrom(await responsibilities.applyTrustedCommand({
    commandSource: 'TRUSTED_SYSTEM',
    userId,
    connectedAccountId: accountId,
    conversationId: actionSource.conversationId,
    sourceEventKey: 'g80-action-required',
    candidateKey: 'g80-action-required',
    applicationKey: 'g80-action-required',
    evidenceRevision: actionSource.evidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: ['CURRENT_USER_ACTION_REQUIRED']},
    provenance: actionProvenance,
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: current.id,
      expectedAggregateVersion: current.aggregateVersion,
      effectKey: 'g80-action-required',
      patch: {obligationLegs: [{
        id: userLegId,
        bearer: 'USER',
        actionCode: 'REPLY_TO_REQUEST',
        status: 'OPEN',
        actionability: 'ACTIONABLE',
        basisKind: 'COMMUNICATED_REQUEST',
        provenance: actionProvenance
      }]},
      provenance: actionProvenance
    }]
  }));
  const needsYou = projection(actionRequired, now.toISOString());
  assert(needsYou.needsYou.length === 1 && needsYou.managedCount === 0, 'action-requiring reply did not return to Needs You');
  assert(!needsYou.strictZero, 'current user work was rendered as true zero');

  const communication = new CommunicationRepository(db);
  const draft = await communication.saveDraft({
    userId,
    connectedAccountId: accountId,
    conversationId: actionSource.conversationId,
    inReplyToMessageId: actionSource.messageId,
    mode: 'REPLY',
    body: 'Confirmed. Thank you.'
  });
  assert(draft.status === 'ACTIVE' && draft.body === 'Confirmed. Thank you.', 'manual fallback draft was not durably saved');
  const operation = await communication.requestImmediateSend({
    userId,
    draftId: draft.id,
    responsibilityBinding: {
      responsibilityId: actionRequired.id,
      aggregateVersion: actionRequired.aggregateVersion,
      evidenceRevision: actionRequired.acceptedEvidenceRevision
    }
  });
  assert(operation.status === 'PENDING' && operation.attemptCount === 0, 'explicit Send request skipped the pending authority boundary');

  let sendCalls = 0;
  const sentProvider = gmailMessage({
    id: 'g80-sent',
    messageId: '<g80-provider-final@mail.gmail.com>',
    from: 'Owner <owner@example.com>',
    to: 'Counterparty <counterparty@example.com>',
    body: 'Confirmed. Thank you.',
    labels: ['SENT']
  });
  const provider: GmailProviderClient = {
    exchangeCode: async () => { throw new Error('not used'); },
    refresh: async () => { throw new Error('not used'); },
    revoke: async () => undefined,
    getProfile: async () => { throw new Error('not used'); },
    watch: async () => { throw new Error('not used'); },
    listMessages: async () => ({messages: []}),
    listHistory: async () => ({history: []}),
    getAttachment: async () => ({data: ''}),
    getMessage: async (_token, id) => {
      if (id === actionProvider.id) return actionProvider;
      if (id === sentProvider.id) return sentProvider;
      throw new Error(`unexpected provider message ${id}`);
    },
    sendMessage: async (_token, input) => {
      sendCalls += 1;
      assert(input.threadId === 'g80-thread', 'provider Send left the source Gmail thread');
      return {id: sentProvider.id, threadId: 'g80-thread'};
    },
    listMessagesByRfc822MessageId: async (_token, messageId) =>
      messageId === '<g80-provider-final@mail.gmail.com>'
        ? {messages: [{id: sentProvider.id, threadId: 'g80-thread'}]}
        : {messages: []}
  };
  const sendService = new GmailSendService(
    provider,
    {getAccessToken: async () => 'g80-test-token'} as never,
    communication,
    evidence,
    responsibilities
  );
  const reconciled = await sendService.dispatch({userId, sendOperationId: operation.id});
  assert(reconciled.status === 'RECONCILED', 'provider acceptance did not reconcile the SendOperation');
  assert(sendCalls === 1, 'complete-loop Send performed more than one provider attempt');

  const replay = await sendService.dispatch({userId, sendOperationId: operation.id});
  assert(replay.status === 'RECONCILED' && sendCalls === 1, 'restart/retry replay duplicated the provider effect');
  const repeatedRequest = await communication.requestImmediateSend({
    userId,
    draftId: draft.id,
    responsibilityBinding: {
      responsibilityId: actionRequired.id,
      aggregateVersion: actionRequired.aggregateVersion,
      evidenceRevision: actionRequired.acceptedEvidenceRevision
    }
  });
  assert(repeatedRequest.id === operation.id, 'lost response did not converge on the immutable SendOperation');

  const finalResponsibility = (await responsibilities.getResponsibility({
    userId,
    connectedAccountId: accountId,
    responsibilityId: actionRequired.id
  }))?.state;
  assert(finalResponsibility, 'Responsibility disappeared after Send reconciliation');
  const closedReplyLeg = finalResponsibility.obligationLegs.find((leg) => leg.id === userLegId);
  assert(closedReplyLeg?.status === 'CLOSED', 'reconciled Send did not close the exact USER reply leg');
  assert(closedReplyLeg.provenance.some((item) =>
    item.evidenceKind === 'PROVIDER_RECONCILED_SEND' && item.sourceLocator?.sendOperationId === operation.id
  ), 'closed USER reply leg is missing provider-reconciled Send provenance');
  assert(finalResponsibility.obligationLegs.some((leg) =>
    leg.bearer === 'OTHER_PARTY' && leg.actionCode === 'SEND_APPROVAL' && leg.status === 'OPEN'
  ), 'reconciled Send incorrectly erased the remaining counterparty requirement');
  assert(finalResponsibility.resolutionStatus === 'OPEN', 'provider Send was incorrectly promoted to operational closure');
  const finalAttention = projection(finalResponsibility, now.toISOString());
  assert(finalAttention.needsYou.length === 0 && finalAttention.review.length === 0, 'reconciled Send left fabricated current user work');
  assert(finalAttention.managedCount === 1, 'remaining counterparty work did not return to quiet Managed');
  const sourceRows = await db.select({
    providerMessageId: schema.messages.providerMessageId,
    direction: schema.messages.direction
  }).from(schema.messages);
  assert(sourceRows.some((row) => row.providerMessageId === sentProvider.id && row.direction === 'OUTBOUND'), 'sent provider message was not persisted as inspectable outbound Source');
  assert(sourceRows.some((row) => row.providerMessageId === initialProvider.id), 'initial Source disappeared during the delegated loop');
  assert(sourceRows.some((row) => row.providerMessageId === progressProvider.id), 'progress Source disappeared during the delegated loop');
  assert(sourceRows.some((row) => row.providerMessageId === actionProvider.id), 'action-requiring Source disappeared during the delegated loop');

  const persistedOperations = await db.select({
    status: schema.sendOperations.status,
    attemptCount: schema.sendOperations.attemptCount
  }).from(schema.sendOperations);
  assert(persistedOperations.length === 1, 'complete loop created duplicate SendOperations');
  assert(persistedOperations[0]?.status === 'RECONCILED' && persistedOperations[0].attemptCount === 1, 'Send claim/reconciliation was not durable and exactly-once');

  process.stdout.write('G80 PostgreSQL complete delegation loop integration: PASS\n');
} finally {
  await pool.end();
}
