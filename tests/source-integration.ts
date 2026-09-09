import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {eq} from 'drizzle-orm';
import {Pool} from 'pg';

import {GET as getSourceConversation} from '../src/app/api/bff/users/[userId]/source/conversations/[conversationId]/route';
import {GET as getSourceConversations} from '../src/app/api/bff/users/[userId]/source/conversations/route';
import {GET as getSourceSearch} from '../src/app/api/bff/users/[userId]/source/search/route';
import {GET as getAttachment} from '../src/app/api/bff/users/[userId]/gmail/accounts/[accountId]/attachments/[attachmentId]/route';
import {createAppAuth} from '../src/server/auth/auth';
import {getDatabasePool} from '../src/server/db';
import {GmailAttachmentService} from '../src/server/gmail/attachments';
import {GmailProviderError} from '../src/server/gmail/types';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import {GmailRepository} from '../src/server/db/repositories/gmail';
import {SourceAccessError, SourceRepository} from '../src/server/db/repositories/source';
import * as databaseSchema from '../src/server/db/schema';
import {connectedAccounts} from '../src/server/db/schema';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function cookieHeader(headers: Headers): string {
  const responseHeaders = headers as Headers & {getSetCookie?: () => string[]};
  const cookies = typeof responseHeaders.getSetCookie === 'function'
    ? responseHeaders.getSetCookie()
    : [responseHeaders.get('set-cookie') ?? ''];
  return cookies.map((cookie) => cookie.split(';', 1)[0]).filter(Boolean).join('; ');
}

async function responseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

const databaseUrl = process.env.G21_DATABASE_URL;
assert(databaseUrl, 'G21_DATABASE_URL is required; no mock or fallback database is accepted.');

process.env.DATABASE_URL = databaseUrl;
process.env.BETTER_AUTH_SECRET = 'g21-source-integration-secret-at-least-thirty-two-bytes';
process.env.BETTER_AUTH_URL = 'http://g21-source-auth.invalid';

const pool = new Pool({connectionString: databaseUrl, max: 4, application_name: 'lunowa-g21-source'});
const db = drizzle(pool, {schema: databaseSchema});
const migrationFolder = resolve(import.meta.dirname, '../drizzle/migrations');
let runtimePoolStarted = false;

function routeRequest(url: string, cookie: string): Request {
  return new Request(url, {headers: {cookie}});
}

try {
  const preexisting = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  assert(preexisting.rowCount === 0, 'G21 integration requires a clean PostgreSQL database.');
  await migrate(db, {migrationsFolder: migrationFolder});
  const version = await pool.query<{server_version_num: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num"
  );
  assert(version.rows[0]?.server_version_num === '180006', 'G21 integration requires PostgreSQL 18.6.');

  const auth = createAppAuth(db, {
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL
  });
  const password = 'G21-source-integration-password-123!';
  const ownerSignUp = await auth.api.signUpEmail({
    body: {name: 'G21 Source Owner', email: `g21-owner-${randomUUID()}@example.invalid`, password},
    returnHeaders: true
  });
  const ownerId = ownerSignUp.response.user?.id;
  const ownerCookie = cookieHeader(ownerSignUp.headers);
  assert(ownerId && ownerCookie, 'G21 owner sign-up did not create an authenticated session.');
  const otherSignUp = await auth.api.signUpEmail({
    body: {name: 'G21 Other User', email: `g21-other-${randomUUID()}@example.invalid`, password},
    returnHeaders: true
  });
  const otherId = otherSignUp.response.user?.id;
  assert(otherId, 'G21 second user was not created.');

  const evidence = new EvidenceRepository(db);
  const sourceAccountId = await evidence.upsertConnectedAccount({
    userId: ownerId,
    provider: 'gmail',
    providerAccountId: `g21-owner-mailbox-${randomUUID()}`,
    emailAddress: ownerSignUp.response.user.email,
    displayName: 'G21 owner mailbox',
    credentialReference: 'g21-test-credential',
    grantedCapabilities: ['mail_read', 'attachment_fetch']
  });
  const healthyAt = new Date('2030-01-01T03:00:00.000Z');
  await evidence.upsertProviderSyncState({
    userId: ownerId,
    connectedAccountId: sourceAccountId,
    status: 'HEALTHY',
    lastSuccessAt: healthyAt,
    lastFullReconcileAt: healthyAt
  });

  const message = async (input: {
    sender: string;
    senderName: string;
    subject: string;
    textBody: string;
    occurredAt: string;
    withAttachment?: boolean;
  }) => {
    const conversationId = randomUUID();
    const providerThreadId = `g21-thread-${conversationId}`;
    return evidence.upsertNormalizedMessage({
      userId: ownerId,
      connectedAccountId: sourceAccountId,
      conversation: {id: conversationId, providerThreadId, normalizedSubject: input.subject},
      providerMessageId: `g21-message-${conversationId}`,
      providerThreadId,
      direction: 'INBOUND',
      sender: {email: input.sender, displayName: input.senderName},
      recipients: [{email: ownerSignUp.response.user.email, displayName: 'G21 Source Owner'}],
      subject: input.subject,
      textBody: input.textBody,
      occurredAt: new Date(input.occurredAt),
      providerReceivedAt: new Date(input.occurredAt),
      readState: 'READ',
      sanitizedHtmlBody: '<p>safe source body</p>',
      attachments: input.withAttachment ? [{
        providerAttachmentId: 'g21-attachment-provider-id',
        filename: 'evidence.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 14,
        contentDisposition: 'attachment',
        contentReference: 'gmail://g21-attachment-provider-id',
        previewState: 'LOCAL_RENDER_FAILED'
      }] : []
    });
  };

  const combinedMatch = await message({
    sender: 'requested-sender@example.invalid',
    senderName: 'Requested Sender',
    subject: 'Invoice evidence',
    textBody: 'Invoice body',
    occurredAt: '2030-01-01T03:00:00.000Z',
    withAttachment: true
  });
  const textOnlyDifferentSender = await message({
    sender: 'other-sender@example.invalid',
    senderName: 'Other Sender',
    subject: 'Invoice evidence',
    textBody: 'Invoice body',
    occurredAt: '2030-01-01T02:00:00.000Z'
  });
  const senderOnlyDifferentText = await message({
    sender: 'requested-sender@example.invalid',
    senderName: 'Requested Sender',
    subject: 'Unrelated evidence',
    textBody: 'Different body',
    occurredAt: '2030-01-01T01:00:00.000Z'
  });

  const senderEmail = 'requested-sender@example.invalid';
  const senderIdentity = await db
    .select({email: databaseSchema.participantIdentities.canonicalEmail})
    .from(databaseSchema.participantIdentities)
    .where(eq(databaseSchema.participantIdentities.userId, ownerId));
  assert(senderIdentity.some(({email}) => email === senderEmail), 'G21 sender participant fixture was not persisted.');

  const repository = new SourceRepository(db);
  const combinedFirst = await repository.searchSource(ownerId, {
    text: 'Invoice',
    sender: senderEmail,
    connectedAccountId: sourceAccountId
  });
  const combinedSecond = await repository.searchSource(ownerId, {
    text: 'Invoice',
    sender: senderEmail,
    connectedAccountId: sourceAccountId
  });
  assert(
    combinedFirst.total === 1 && combinedFirst.conversations[0]?.id === combinedMatch.conversationId &&
      combinedSecond.conversations.map(({id}) => id).join('|') === combinedFirst.conversations.map(({id}) => id).join('|'),
    'combined text + sender search did not apply independent deterministic filters'
  );
  assert(
    !combinedFirst.conversations.some(({id}) => id === textOnlyDifferentSender.conversationId || id === senderOnlyDifferentText.conversationId),
    'combined text + sender search returned a false positive'
  );

  const listFirst = await repository.listConversations({userId: ownerId, connectedAccountId: sourceAccountId, limit: 1});
  assert(listFirst.total === 3 && listFirst.conversations.length === 1 && listFirst.nextCursor, 'Source list did not expose a continuation cursor.');
  const listSecond = await repository.listConversations({
    userId: ownerId,
    connectedAccountId: sourceAccountId,
    limit: 1,
    cursor: listFirst.nextCursor
  });
  assert(listSecond.query.accountId === sourceAccountId && listSecond.conversations.length === 1, 'Source list cursor lost account context.');
  assert(listSecond.conversations[0]?.id !== listFirst.conversations[0]?.id, 'Source list cursor repeated its prior page.');
  const listThird = listSecond.nextCursor
    ? await repository.listConversations({userId: ownerId, connectedAccountId: sourceAccountId, limit: 1, cursor: listSecond.nextCursor})
    : null;
  const listedIds = [
    ...listFirst.conversations,
    ...listSecond.conversations,
    ...(listThird?.conversations ?? [])
  ].map(({id}) => id);
  assert(new Set(listedIds).size === listFirst.total, 'Source list continuation could not retrieve the complete bounded result set.');

  const searchFirst = await repository.searchSource(ownerId, {text: 'Invoice', connectedAccountId: sourceAccountId, limit: 1});
  assert(searchFirst.total === 2 && searchFirst.conversations.length === 1 && searchFirst.nextCursor, 'Source search did not expose a continuation cursor.');
  const searchSecond = await repository.searchSource(ownerId, {
    text: 'Invoice',
    connectedAccountId: sourceAccountId,
    limit: 1,
    cursor: searchFirst.nextCursor
  });
  assert(
    searchSecond.query.text === 'Invoice' && searchSecond.query.accountId === sourceAccountId &&
      new Set([...searchFirst.conversations, ...searchSecond.conversations].map(({id}) => id)).size === searchFirst.total,
    'Source search continuation lost query/account context or omitted a matching conversation'
  );
  let invalidCursorError: unknown;
  try {
    await repository.searchSource(ownerId, {text: 'Different query', connectedAccountId: sourceAccountId, limit: 1, cursor: searchFirst.nextCursor});
  } catch (error) {
    invalidCursorError = error;
  }
  assert(invalidCursorError instanceof Error && invalidCursorError.message === 'SOURCE_INVALID_CURSOR', 'Source cursor was reusable outside its original query scope.');

  const noMatch = await repository.searchSource(ownerId, {
    text: 'not present',
    sender: 'nobody@example.invalid',
    connectedAccountId: sourceAccountId,
    from: new Date('2030-01-01T00:00:00.000Z'),
    to: new Date('2030-01-02T00:00:00.000Z')
  });
  assert(
    noMatch.total === 0 && noMatch.query.text === 'not present' && noMatch.query.sender === 'nobody@example.invalid' &&
      noMatch.query.accountId === sourceAccountId && noMatch.query.from && noMatch.query.to,
    'Source no-match did not preserve query/account/filter context'
  );

  const emptyOtherUser = await repository.listConversations({userId: otherId});
  assert(emptyOtherUser.conversations.length === 0 && emptyOtherUser.readiness === 'unavailable', 'Source leaked data to a user without a connected account.');
  let foreignAccountError: unknown;
  try {
    await repository.searchSource(otherId, {connectedAccountId: sourceAccountId, text: 'Invoice'});
  } catch (error) {
    foreignAccountError = error;
  }
  assert(foreignAccountError instanceof SourceAccessError && foreignAccountError.code === 'ACCOUNT_NOT_FOUND', 'Source account scope did not reject a foreign account.');

  runtimePoolStarted = true;
  const bffSearch = await getSourceSearch(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/search?q=Invoice&sender=${encodeURIComponent(senderEmail)}&accountId=${sourceAccountId}`, ownerCookie),
    {params: Promise.resolve({userId: ownerId})}
  );
  const bffSearchBody = await responseJson<{total: number; conversations: {id: string}[]; query: {sender: string | null}}>(bffSearch);
  assert(bffSearch.status === 200 && bffSearchBody.total === 1 && bffSearchBody.conversations[0]?.id === combinedMatch.conversationId && bffSearchBody.query.sender === senderEmail, 'BFF did not execute the persisted combined Source search.');

  const bffSearchFirst = await getSourceSearch(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/search?q=Invoice&accountId=${sourceAccountId}&limit=1`, ownerCookie),
    {params: Promise.resolve({userId: ownerId})}
  );
  const bffSearchFirstBody = await responseJson<{total: number; conversations: {id: string}[]; nextCursor: string | null}>(bffSearchFirst);
  assert(bffSearchFirst.status === 200 && bffSearchFirstBody.total === 2 && bffSearchFirstBody.conversations.length === 1 && bffSearchFirstBody.nextCursor, 'BFF Source search did not expose persisted pagination.');
  const bffSearchNext = await getSourceSearch(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/search?q=Invoice&accountId=${sourceAccountId}&limit=1&cursor=${encodeURIComponent(bffSearchFirstBody.nextCursor)}`, ownerCookie),
    {params: Promise.resolve({userId: ownerId})}
  );
  const bffSearchNextBody = await responseJson<{total: number; conversations: {id: string}[]; query: {text: string; accountId: string | null}}>(bffSearchNext);
  assert(bffSearchNext.status === 200 && bffSearchNextBody.total === 2 && bffSearchNextBody.query.text === 'Invoice' && bffSearchNextBody.query.accountId === sourceAccountId && bffSearchNextBody.conversations[0]?.id !== bffSearchFirstBody.conversations[0]?.id, 'BFF Source search continuation lost query/account context or repeated a page.');

  for (const [index, occurredAt] of [['2', '2030-01-01T04:00:00.000Z'], ['3', '2030-01-01T05:00:00.000Z']] as const) {
    await evidence.upsertNormalizedMessage({
      userId: ownerId,
      connectedAccountId: sourceAccountId,
      conversation: {
        id: combinedMatch.conversationId,
        providerThreadId: `g21-thread-${combinedMatch.conversationId}`,
        normalizedSubject: 'Invoice evidence'
      },
      providerMessageId: `g21-batched-detail-message-${index}`,
      providerThreadId: `g21-thread-${combinedMatch.conversationId}`,
      direction: 'INBOUND',
      sender: {email: 'requested-sender@example.invalid', displayName: 'Requested Sender'},
      recipients: [{email: ownerSignUp.response.user.email, displayName: 'G21 Source Owner'}],
      cc: [{email: `copy-${index}@example.invalid`, displayName: `Copy ${index}`}],
      subject: 'Invoice evidence',
      textBody: `Additional detail message ${index}`,
      occurredAt: new Date(occurredAt),
      providerReceivedAt: new Date(occurredAt),
      readState: 'READ',
      sanitizedHtmlBody: `<p>additional safe body ${index}</p>`,
      attachments: []
    });
  }
  let detailQueryCount = 0;
  const detailDb = drizzle(pool, {
    schema: databaseSchema,
    logger: {logQuery: () => { detailQueryCount += 1; }}
  });
  const batchedDetail = await new SourceRepository(detailDb).getConversation({
    userId: ownerId,
    connectedAccountId: sourceAccountId,
    conversationId: combinedMatch.conversationId
  });
  assert(
    batchedDetail?.messages.length === 3 && detailQueryCount <= 5,
    `Source detail regressed to per-message database round trips (queries=${detailQueryCount}, messages=${batchedDetail?.messages.length ?? 0})`
  );
  assert(
    batchedDetail.messages[0]?.sender.email === senderEmail &&
      batchedDetail.messages[0]?.recipients[0]?.email === ownerSignUp.response.user.email &&
      batchedDetail.messages[0]?.attachments[0]?.filename === 'evidence.pdf' &&
      batchedDetail.messages[1]?.cc[0]?.email === 'copy-2@example.invalid' &&
      batchedDetail.messages[2]?.cc[0]?.email === 'copy-3@example.invalid',
    'batched Source detail changed sender/recipient/attachment projection semantics'
  );

  const bffNoMatch = await getSourceSearch(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/search?q=not-present&sender=nobody%40example.invalid&accountId=${sourceAccountId}`, ownerCookie),
    {params: Promise.resolve({userId: ownerId})}
  );
  const bffNoMatchBody = await responseJson<{total: number; query: {text: string; sender: string | null; accountId: string | null}}>(bffNoMatch);
  assert(bffNoMatch.status === 200 && bffNoMatchBody.total === 0 && bffNoMatchBody.query.text === 'not-present' && bffNoMatchBody.query.sender === 'nobody@example.invalid' && bffNoMatchBody.query.accountId === sourceAccountId, 'BFF no-match response lost its search context.');

  const bffList = await getSourceConversations(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/conversations?accountId=${sourceAccountId}&limit=1`, ownerCookie),
    {params: Promise.resolve({userId: ownerId})}
  );
  const bffListBody = await responseJson<{total: number; conversations: {id: string}[]; nextCursor: string | null}>(bffList);
  assert(bffList.status === 200 && bffListBody.conversations.length === 1 && bffListBody.nextCursor, 'BFF Source list did not expose persisted pagination.');
  const bffListNext = await getSourceConversations(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/conversations?accountId=${sourceAccountId}&limit=1&cursor=${encodeURIComponent(bffListBody.nextCursor)}`, ownerCookie),
    {params: Promise.resolve({userId: ownerId})}
  );
  const bffListNextBody = await responseJson<{conversations: {id: string}[]; query: {accountId: string | null}}>(bffListNext);
  assert(bffListNext.status === 200 && bffListNextBody.query.accountId === sourceAccountId && bffListNextBody.conversations[0]?.id !== bffListBody.conversations[0]?.id, 'BFF Source list continuation lost scope or repeated a page.');

  const ownerDetail = await getSourceConversation(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/conversations/${combinedMatch.conversationId}`, ownerCookie),
    {params: Promise.resolve({userId: ownerId, conversationId: combinedMatch.conversationId})}
  );
  const ownerDetailBody = await responseJson<{messages: {attachments: {id: string}[]}[]; account: {connectionState: string; sync: {status: string}}}>(ownerDetail);
  assert(ownerDetail.status === 200 && ownerDetailBody.messages[0]?.attachments[0]?.id, 'BFF Source detail did not return persisted authorized attachment evidence.');
  const attachmentId = ownerDetailBody.messages[0]!.attachments[0]!.id;

  const foreignDetail = await getSourceConversation(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${otherId}/source/conversations/${combinedMatch.conversationId}`, ownerCookie),
    {params: Promise.resolve({userId: otherId, conversationId: combinedMatch.conversationId})}
  );
  assert(foreignDetail.status === 403, 'BFF Source detail did not reject cross-user access.');

  await evidence.upsertProviderSyncState({
    userId: ownerId,
    connectedAccountId: sourceAccountId,
    status: 'ERROR',
    lastSuccessAt: healthyAt,
    lastFullReconcileAt: healthyAt,
    lastErrorCode: 'HISTORY_GAP'
  });
  const degradedDetail = await getSourceConversation(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${ownerId}/source/conversations/${combinedMatch.conversationId}`, ownerCookie),
    {params: Promise.resolve({userId: ownerId, conversationId: combinedMatch.conversationId})}
  );
  const degradedDetailBody = await responseJson<{account: {connectionState: string; sync: {status: string; errorCode: string | null}}}>(degradedDetail);
  assert(
    degradedDetail.status === 200 && degradedDetailBody.account.connectionState === 'CONNECTED' &&
      degradedDetailBody.account.sync.status === 'ERROR' && degradedDetailBody.account.sync.errorCode === 'HISTORY_GAP',
    'Source detail did not retain connected-account degraded sync state'
  );

  const gmailRepository = new GmailRepository(db);
  const credentials = {getAccessToken: async () => 'g21-access-token', markReconnectRequired: async () => undefined};
  const content = Buffer.from('safe attachment').toString('base64url');
  const attachmentService = new GmailAttachmentService({
    getAttachment: async () => ({data: content})
  } as never, credentials as never, gmailRepository);
  const fetched = await attachmentService.fetch({userId: ownerId, connectedAccountId: sourceAccountId, attachmentId});
  assert(fetched.filename === 'evidence.pdf' && fetched.content.toString() === 'safe attachment', 'authorized attachment access did not use the persisted Source ownership boundary.');
  let foreignAttachmentError: unknown;
  try {
    await attachmentService.fetch({userId: otherId, connectedAccountId: sourceAccountId, attachmentId});
  } catch (error) {
    foreignAttachmentError = error;
  }
  assert(foreignAttachmentError instanceof GmailProviderError && foreignAttachmentError.code === 'ATTACHMENT_NOT_FOUND', 'attachment access leaked across users.');
  const blockedAttachmentService = new GmailAttachmentService({
    getAttachment: async () => { throw new GmailProviderError(403, 'provider-unsafe'); }
  } as never, credentials as never, gmailRepository);
  let blockedError: unknown;
  try {
    await blockedAttachmentService.fetch({userId: ownerId, connectedAccountId: sourceAccountId, attachmentId});
  } catch (error) {
    blockedError = error;
  }
  assert(blockedError instanceof GmailProviderError && blockedError.status === 403 && blockedError.code === 'PROVIDER_SECURITY_BLOCK', 'provider attachment security block was not preserved.');

  const foreignAttachmentRoute = await getAttachment(
    routeRequest(`http://g21-source-auth.invalid/api/bff/users/${otherId}/gmail/accounts/${sourceAccountId}/attachments/${attachmentId}`, ownerCookie),
    {params: Promise.resolve({userId: otherId, accountId: sourceAccountId, attachmentId})}
  );
  assert(foreignAttachmentRoute.status === 403, 'BFF attachment authorization did not remain isolated for a foreign user.');

  const count = await db.select({id: connectedAccounts.id}).from(connectedAccounts).where(eq(connectedAccounts.userId, ownerId));
  assert(count.length === 1, 'G21 fixture did not preserve one owner account scope.');
  console.log(JSON.stringify({
    kind: 'g21-source-postgresql-bff-result-v1',
    postgres: version.rows[0]?.server_version_num,
    checks: [
      'persisted Source combined text and sender oracle',
      'deterministic Source list/search cursor continuation',
      'no-match query/account/filter context',
      'cross-user and foreign-account isolation',
      'BFF owner session and persisted Source detail',
      'connected-account degraded sync visibility',
      'attachment authorization and provider security block'
    ],
    status: 'PASS'
  }, null, 2));
} finally {
  if (runtimePoolStarted) await getDatabasePool().end();
  await pool.end();
}
