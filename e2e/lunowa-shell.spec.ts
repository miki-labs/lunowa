import {expect, test} from '@playwright/test';
import path from 'node:path';
import type {AttentionItemReadModel, AttentionReadModel} from '../src/lib/attention-types';
import type {SourceAccountReadModel} from '../src/lib/source-types';

const nav = (page: import('@playwright/test').Page, label: string) => page.getByRole('button', {name: `${label}を表示`});
const navEn = (page: import('@playwright/test').Page, label: string) => page.getByRole('button', {name: `Show ${label}`});
const waitForAuthenticatedShell = async (page: import('@playwright/test').Page) => {
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();
};
const appSession = {
  session: {
    id: '735cad1c-a617-4985-9e18-8ff3c8fc5190',
    userId: 'f5ab470d-97e3-44d3-a1e1-2575744152a2',
    token: 'browser-session-token',
    expiresAt: '2030-01-02T00:00:00.000Z',
    createdAt: '2030-01-01T00:00:00.000Z',
    updatedAt: '2030-01-01T00:00:00.000Z'
  },
  user: {
    id: 'f5ab470d-97e3-44d3-a1e1-2575744152a2',
    name: 'Browser User',
    email: 'browser@example.invalid',
    emailVerified: false,
    createdAt: '2030-01-01T00:00:00.000Z',
    updatedAt: '2030-01-01T00:00:00.000Z'
  }
};
const sourceAccount: SourceAccountReadModel = {
  id: 'source-account-1',
  provider: 'gmail',
  providerAccountId: 'browser@example.invalid',
  emailAddress: 'browser@example.invalid',
  displayName: 'Browser mailbox',
  connectionState: 'CONNECTED',
  sync: {
    status: 'HEALTHY',
    lastSuccessAt: '2030-01-01T00:00:00.000Z',
    lastFullReconcileAt: '2030-01-01T00:00:00.000Z',
    dataThroughAt: '2030-01-01T00:00:00.000Z',
    errorCode: null
  }
};
const secondSourceAccount: SourceAccountReadModel = {
  ...sourceAccount,
  id: 'source-account-2',
  providerAccountId: 'project@example.invalid',
  emailAddress: 'project@example.invalid',
  displayName: 'Project mailbox',
  connectionState: 'RECONNECT_REQUIRED',
  monitoring: {status: 'degraded', reasonCode: 'RECONNECT_REQUIRED', lastTrustworthyAt: '2029-12-31T22:00:00.000Z', recoveryAction: 'RECONNECT'},
  sync: {...sourceAccount.sync, status: 'RECONCILIATION_REQUIRED', errorCode: 'RECONNECT_REQUIRED'}
};
const sourcePage = {
  accounts: [sourceAccount],
  conversations: [{
    id: 'source-conversation-1',
    providerThreadId: 'source-thread-1',
    subject: '来期の見積書について',
    preview: '添付の見積書をご確認いただけますか。',
    lastMessageAt: '2030-01-01T00:00:00.000Z',
    messageCount: 1,
    hasAttachments: true,
    account: sourceAccount,
    latestSender: {email: 'sender@example.com', displayName: '佐藤ひろ子'}
  }],
  readiness: 'ready',
  dataThroughAt: '2030-01-01T00:00:00.000Z',
  query: {text: '', accountId: null, sender: null, from: null, to: null},
  total: 1,
  nextCursor: null
};
const attentionReadModel = {
  source: {readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z'},
  integrity: {status: 'healthy', message: null},
  needsYou: [{
    id: 'responsibility-1',
    subjectKind: 'RESPONSIBILITY',
    responsibilityId: 'responsibility-1',
    admissionReviewId: null,
    conversationId: 'source-conversation-1',
    connectedAccountId: 'source-account-1',
    acceptedEvidenceRevision: 1,
    aggregateVersion: 1,
    liveTrackingState: 'TRACKING_ACTIVE',
    surface: 'NEEDS_YOU',
    projection: {bucket: 'MY_TURN', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-user-obligation:REPLY'},
    operationalOutcome: '見積書の確認を終える',
    reviewQuestion: null,
    primaryAction: '返信する',
    awaitedEvent: null,
    returnCondition: null,
    nearestRelevantTime: null,
    overdue: false
  }],
  managed: [],
  later: [],
  review: [],
  done: [],
  strictZero: false,
  managedCount: 0,
  delegatedCount: 1,
  derivedAt: '2030-01-01T00:00:00.000Z'
};
const sourceDetail = {
  id: 'source-conversation-1',
  providerThreadId: 'source-thread-1',
  subject: '来期の見積書について',
  account: sourceAccount,
  evidenceRevision: 1,
  messages: [{
    id: 'source-message-1',
    providerMessageId: 'provider-message-1',
    providerThreadId: 'source-thread-1',
    direction: 'INBOUND',
    sender: {email: 'sender@example.com', displayName: '佐藤ひろ子'},
    recipients: [{email: 'browser@example.invalid', displayName: 'Browser User'}],
    cc: [],
    bcc: [],
    subject: '来期の見積書について',
    textBody: '添付の見積書をご確認いただけますか。',
    sanitizedHtmlBody: null,
    occurredAt: '2030-01-01T00:00:00.000Z',
    providerReceivedAt: '2030-01-01T00:00:00.000Z',
    readState: 'READ',
    providerDeletedAt: null,
    attachments: [{
      id: 'source-attachment-1',
      providerAttachmentId: 'provider-attachment-1',
      filename: 'estimate.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      contentDisposition: 'attachment',
      contentReference: 'gmail://source-message-1/provider-attachment-1',
      contentHash: null,
      previewState: 'PROVIDER_FETCH_REQUIRED'
    }]
  }]
};

const replyContextFor = (mode: 'REPLY' | 'REPLY_ALL', sendAuthorized = true) => ({
  connectedAccount: {id: 'source-account-1', emailAddress: 'browser@example.invalid', displayName: 'Browser mailbox', connectionState: 'CONNECTED', sendAuthorized},
  conversationId: 'source-conversation-1', providerThreadId: 'source-thread-1', inReplyToMessageId: 'source-message-1', inReplyToProviderMessageId: 'provider-message-1',
  evidenceRevision: 1, mode, sender: {email: 'browser@example.invalid', displayName: 'Browser mailbox'},
  recipients: mode === 'REPLY_ALL'
    ? [{email: 'sender@example.com', displayName: '佐藤ひろ子'}, {email: 'other@example.com', displayName: 'Other'}]
    : [{email: 'sender@example.com', displayName: '佐藤ひろ子'}],
  cc: mode === 'REPLY_ALL' ? [{email: 'copy@example.com', displayName: 'Copy'}] : [],
  bcc: [], subject: 'Re: 来期の見積書について',
  draft: {id: `browser-draft-${mode.toLowerCase()}`, version: 1, body: '確認しました。', recipients: mode === 'REPLY_ALL'
    ? [{email: 'sender@example.com', displayName: '佐藤ひろ子'}, {email: 'other@example.com', displayName: 'Other'}]
    : [{email: 'sender@example.com', displayName: '佐藤ひろ子'}], cc: mode === 'REPLY_ALL' ? [{email: 'copy@example.com', displayName: 'Copy'}] : []}
});

test.beforeEach(async ({page}) => {
  await page.route('**/api/auth/get-session**', (route) => route.fulfill({json: appSession}));
  await page.route('**/api/bff/users/**/attention', (route) => route.fulfill({json: attentionReadModel}));
  await page.route('**/api/bff/users/**/source/search**', (route) => route.fulfill({json: sourcePage}));
  await page.route('**/api/bff/users/**/source/conversations**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    await route.fulfill({json: pathname.endsWith('/source-conversation-1') ? sourceDetail : sourcePage});
  });
  await page.route('**/api/bff/users/**/drafts/context**', async (route) => {
    const mode = new URL(route.request().url()).searchParams.get('mode') === 'REPLY_ALL' ? 'REPLY_ALL' : 'REPLY';
    await route.fulfill({json: replyContextFor(mode)});
  });
  await page.route('**/api/bff/users/**/drafts', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    const body = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({json: {id: body.draftId ?? 'browser-draft-reply', version: Number(body.expectedVersion ?? 0) + 1, body: body.body}});
  });
  await page.route('**/api/bff/users/**/send-operations', (route) => route.fulfill({json: {accepted: true, operation: {id: 'browser-operation-1', status: 'PENDING'}}}));
});

test('renders the shell and navigates a Needs You item to its Moment', async ({page}) => {
  await page.setViewportSize({width: 1448, height: 1086});
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/ja');
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();
  await expect(page.getByLabel('表示状態')).toHaveCount(0);
  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await expect(page.getByRole('heading', {name: '見積書の確認を終える'})).toBeVisible();
  await expect(page.getByRole('button', {name: '返信を書く'})).toBeVisible();
  await expect(page.getByLabel('本文')).toBeVisible();
  if (process.env.M1_ARTIFACT_DIR) await page.screenshot({caret: 'initial', path: path.join(process.env.M1_ARTIFACT_DIR, 'production-moment-ja-1448.png')});
  expect(consoleErrors).toEqual([]);
});

test('keeps trusted delegation and LATER actions on the authenticated Product path', async ({page}) => {
  await page.unroute('**/api/bff/users/**/attention');
  const initialAttention = attentionReadModel as unknown as AttentionReadModel;
  const candidate: AttentionItemReadModel = {
    ...initialAttention.needsYou[0],
    subjectKind: 'RESPONSIBILITY',
    id: 'responsibility-candidate', responsibilityId: 'responsibility-candidate', conversationId: 'conversation-candidate',
    connectedAccountId: 'source-account-1', acceptedEvidenceRevision: 4, aggregateVersion: 2, liveTrackingState: 'HISTORICAL_INACTIVE',
    surface: 'NONE', projection: {bucket: 'NONE', subjectKind: 'NONE', primaryReason: 'historical-candidate-is-not-live-work'},
    operationalOutcome: '契約条件を確認する', primaryAction: null, awaitedEvent: '相手からの確認返信', returnCondition: '返信が届くまで'
  };
  const later: AttentionItemReadModel = {
    ...candidate,
    id: 'responsibility-later', responsibilityId: 'responsibility-later', conversationId: 'conversation-later',
    aggregateVersion: 3, liveTrackingState: 'TRACKING_ACTIVE', surface: 'LATER',
    projection: {bucket: 'LATER', subjectKind: 'RESPONSIBILITY', primaryReason: 'user-intentionally-deferred-attention'},
    operationalOutcome: '納品日の回答を見守る', awaitedEvent: '取引先からの納品日回答', returnCondition: '9月10日'
  };
  const waiting: AttentionItemReadModel = {...later, surface: 'MANAGED', projection: {bucket: 'WAITING', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-loop-awaits-counterpart-or-external-event'}};
  let model: AttentionReadModel = {...initialAttention, needsYou: [], managed: [], later: [], review: [], done: [], delegationCandidates: [candidate], strictZero: true, managedCount: 0, delegatedCount: 0};
  const actionBodies: Record<string, unknown>[] = [];
  await page.route('**/api/bff/users/**/attention', (route) => route.fulfill({json: model}));
  await page.route('**/api/bff/users/**/attention/actions', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    actionBodies.push(body);
    if (body.action === 'DELEGATE') model = {...model, delegationCandidates: [], managed: [waiting], managedCount: 1, strictZero: true, delegatedCount: 1};
    if (body.action === 'RETURN_ATTENTION') model = {...model, later: [], managed: [waiting], managedCount: 1, strictZero: true, delegatedCount: 1};
    await route.fulfill({json: {accepted: true}});
  });

  await page.goto('/ja');
  await page.getByRole('button', {name: /契約条件を確認する/}).click();
  await page.getByRole('button', {name: 'この件を任せる'}).click();
  await expect(page.getByText('保存を確認しました。現在の状態を更新しています', {exact: true})).toBeVisible();
  expect(actionBodies[0]?.action).toBe('DELEGATE');

  model = {...initialAttention, needsYou: [], managed: [], later: [later], review: [], done: [], delegationCandidates: [], strictZero: false, managedCount: 0, delegatedCount: 1};
  await page.reload();
  await nav(page, '管理中').click();
  await expect(page.getByRole('button', {name: /納品日の回答を見守る/})).toBeVisible();
  await page.getByRole('button', {name: /納品日の回答を見守る/}).click();
  await page.getByRole('button', {name: '今、確認する'}).click();
  await expect(page.getByText('注意を戻しました。現在の対応状態を再確認しています。')).toBeVisible();
  expect(actionBodies[1]?.action).toBe('RETURN_ATTENTION');
});

test('keeps Source truth readable and adds the trusted contextual reply entry on the real Source Conversation', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/ja');
  await nav(page, '会話').click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByLabel('詳細').getByText('添付の見積書をご確認いただけますか。')).toBeVisible();
  await expect(page.getByLabel('宛先')).toHaveValue('sender@example.com');
  await page.getByText('種類・Cc').click();
  await expect(page.getByText(/From: Browser mailbox <browser@example.invalid>/)).toBeVisible();
  await expect(page.getByRole('button', {name: '送信する'})).toBeEnabled();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.getByRole('button', {name: /佐藤ひろ子/})).toBeVisible();
});

test('renders the production Source list and selected conversation in the accepted workspace', async ({page}) => {
  await page.setViewportSize({width: 1448, height: 1086});
  await page.goto('/ja');
  await nav(page, '会話').click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.locator('.source-row.is-selected')).toHaveCount(1);
  await expect(page.getByText('browser@example.invalid', {exact: true}).first()).toBeVisible();
  await expect(page.getByRole('button', {name: /安全にダウンロード/})).toBeVisible();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByRole('button', {name: /安全にダウンロード/})).toBeVisible();
  await expect(page.getByText('Sourceの会話を読み込んでいます。')).toHaveCount(0);
  if (process.env.M1_ARTIFACT_DIR) await page.screenshot({caret: 'initial', path: path.join(process.env.M1_ARTIFACT_DIR, 'production-source-detail-1448.png'), fullPage: true});
});

test('keeps the newest account scope and renders a multi-message two-account candidate', async ({page}) => {
  const conversation = (id: string, account: typeof sourceAccount, sender: string, subject: string) => ({
    ...sourcePage.conversations[0], id, providerThreadId: `thread-${id}`, subject,
    preview: `${sender}からの確認事項と前回までのやり取りです。`, messageCount: id === 'project-conversation' ? 4 : 2,
    account, latestSender: {email: `${sender.toLowerCase()}@example.com`, displayName: sender}
  });
  const allPage = {...sourcePage, accounts: [sourceAccount, secondSourceAccount], conversations: [
    conversation('source-conversation-1', sourceAccount, '佐藤ひろ子', '来期の見積書について'),
    conversation('browser-follow-up', sourceAccount, '田中太郎', '契約更新の確認'),
    conversation('project-conversation', secondSourceAccount, '鈴木花子', 'Q2 プロジェクト進捗共有')
  ], readiness: 'degraded', total: 3};
  const scopedPage = (account: typeof sourceAccount) => ({...allPage, accounts: [account], conversations: allPage.conversations.filter((item) => item.account.id === account.id), query: {...allPage.query, accountId: account.id}, total: account.id === sourceAccount.id ? 2 : 1});
  const projectDetail = {...sourceDetail, id: 'project-conversation', providerThreadId: 'thread-project-conversation', subject: 'Q2 プロジェクト進捗共有', account: secondSourceAccount, messages: [
    {...sourceDetail.messages[0], id: 'project-message-1', providerMessageId: 'provider-project-1', sender: {email: 'suzuki@example.com', displayName: '鈴木花子'}, subject: 'Q2 プロジェクト進捗共有', textBody: '候補日時をお送りします。ご都合の良い日を教えてください。', attachments: []},
    {...sourceDetail.messages[0], id: 'project-message-2', providerMessageId: 'provider-project-2', direction: 'OUTBOUND', sender: {email: 'project@example.invalid', displayName: 'Project mailbox'}, textBody: 'ありがとうございます。候補を確認して改めてご連絡します。', attachments: []},
    {...sourceDetail.messages[0], id: 'project-message-3', providerMessageId: 'provider-project-3', sender: {email: 'suzuki@example.com', displayName: '鈴木花子'}, textBody: '5月23日、26日、27日の3候補です。', attachments: []},
    {...sourceDetail.messages[0], id: 'project-message-4', providerMessageId: 'provider-project-4', sender: {email: 'suzuki@example.com', displayName: '鈴木花子'}, textBody: '候補日時の資料を添付しました。', attachments: sourceDetail.messages[0].attachments}
  ]};
  const listRequests: string[] = [];
  await page.unroute('**/api/bff/users/**/source/conversations**');
  await page.unroute('**/api/bff/users/**/source/search**');
  await page.unroute('**/api/bff/users/**/drafts/context**');
  await page.route('**/api/bff/users/**/drafts/context**', async (route) => {
    const context = replyContextFor('REPLY', false);
    await route.fulfill({json: {
      ...context,
      connectedAccount: {id: secondSourceAccount.id, emailAddress: secondSourceAccount.emailAddress, displayName: secondSourceAccount.displayName, connectionState: secondSourceAccount.connectionState, sendAuthorized: false},
      conversationId: 'project-conversation',
      providerThreadId: 'thread-project-conversation',
      inReplyToMessageId: 'project-message-4',
      inReplyToProviderMessageId: 'provider-project-4',
      sender: {email: secondSourceAccount.emailAddress, displayName: secondSourceAccount.displayName},
      recipients: [{email: 'suzuki@example.com', displayName: '鈴木花子'}],
      subject: 'Re: Q2 プロジェクト進捗共有',
      draft: {...context.draft, id: 'project-draft', body: '', recipients: [{email: 'suzuki@example.com', displayName: '鈴木花子'}], cc: []}
    }});
  });
  await page.route('**/api/bff/users/**/source/search**', async (route) => {
    const accountId = new URL(route.request().url()).searchParams.get('accountId');
    await route.fulfill({json: accountId === secondSourceAccount.id ? scopedPage(secondSourceAccount) : allPage});
  });
  await page.route('**/api/bff/users/**/source/conversations**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/project-conversation')) return route.fulfill({json: projectDetail});
    if (url.pathname.includes('/source/conversations/')) return route.fulfill({json: sourceDetail});
    const accountId = url.searchParams.get('accountId');
    listRequests.push(accountId ?? 'all');
    if (accountId === sourceAccount.id) await new Promise((resolve) => setTimeout(resolve, 450));
    if (accountId === secondSourceAccount.id) await new Promise((resolve) => setTimeout(resolve, 40));
    await route.fulfill({json: accountId === sourceAccount.id ? scopedPage(sourceAccount) : accountId === secondSourceAccount.id ? scopedPage(secondSourceAccount) : allPage}).catch(() => undefined);
  });

  await page.setViewportSize({width: 1448, height: 1086});
  await page.goto('/ja');
  await nav(page, '会話').click();
  await page.locator('.mailbox-account', {hasText: 'Browser mailbox'}).click();
  await page.locator('.mailbox-account', {hasText: 'Project mailbox'}).click();
  await expect(page.getByRole('button', {name: /Q2 プロジェクト進捗共有/})).toBeVisible();
  await expect(page.getByRole('button', {name: /来期の見積書について/})).toHaveCount(0);
  await page.getByRole('button', {name: /Q2 プロジェクト進捗共有/}).click();
  await expect(page.getByText('候補日時の資料を添付しました。')).toBeVisible();
  await expect(page.getByTestId('production-detail-panel').getByText('Sourceの確認範囲に問題があります')).toBeVisible();
  await expect(page.getByLabel('本文')).toBeVisible();
  await expect(page.getByRole('button', {name: '送信する'})).toBeVisible();
  const composerBox = await page.locator('.compact-composer').boundingBox();
  expect(composerBox).not.toBeNull();
  expect(composerBox!.y + composerBox!.height).toBeLessThanOrEqual(1086);
  expect(listRequests).toContain('source-account-1');
  expect(listRequests.at(-1)).toBe('source-account-2');
  if (process.env.M1_ARTIFACT_DIR) await page.screenshot({caret: 'initial', path: path.join(process.env.M1_ARTIFACT_DIR, 'production-source-detail-2account-1448.png')});
  await page.setViewportSize({width: 900, height: 900});
  await page.goto('/ja');
  await waitForAuthenticatedShell(page);
  await expect(page.getByRole('button', {name: /Project mailbox/})).toBeVisible();
  const sidebarGeometry = await page.locator('.primary-nav').evaluate((sidebar) => {
    sidebar.scrollTop = sidebar.scrollHeight;
    const profile = sidebar.querySelector<HTMLElement>('.workspace-profile')!.getBoundingClientRect();
    return {maxScroll: sidebar.scrollHeight - sidebar.clientHeight, scrollTop: sidebar.scrollTop, profileTop: profile.top, profileBottom: profile.bottom, viewport: window.innerHeight};
  });
  expect(sidebarGeometry.maxScroll).toBeGreaterThan(0);
  expect(sidebarGeometry.scrollTop).toBeGreaterThan(0);
  expect(sidebarGeometry.profileTop).toBeGreaterThanOrEqual(0);
  expect(sidebarGeometry.profileBottom).toBeLessThanOrEqual(sidebarGeometry.viewport);
  if (process.env.M1_ARTIFACT_DIR) {
    for (const locale of ['ja', 'en'] as const) {
      for (const width of [900, 430, 320]) {
        await page.setViewportSize({width, height: 900});
        await page.goto(`/${locale}`);
        await (locale === 'ja' ? nav(page, '会話') : navEn(page, 'Conversations')).click();
        await page.locator('.mailbox-account', {hasText: 'Project mailbox'}).click();
        await expect(page.getByRole('button', {name: /Q2 プロジェクト進捗共有/})).toBeVisible();
        await page.locator('.surface-header h1').click();
        await page.screenshot({caret: 'initial', path: path.join(process.env.M1_ARTIFACT_DIR, `production-source-list-${locale}-${width}.png`)});
        await page.getByRole('button', {name: /Q2 プロジェクト進捗共有/}).click();
        await expect(page.getByLabel(locale === 'ja' ? '本文' : 'Message')).toBeVisible();
        await page.screenshot({caret: 'initial', path: path.join(process.env.M1_ARTIFACT_DIR, `production-source-detail-${locale}-${width}.png`)});
      }
    }
  }
});

test('shows truthful Source detail loading until the production-shaped conversation is ready', async ({page}) => {
  await page.unroute('**/api/bff/users/**/source/conversations**');
  let detailRequests = 0;
  await page.route('**/api/bff/users/**/source/conversations**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith('/source-conversation-1')) {
      detailRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 450));
      await route.fulfill({json: sourceDetail});
      return;
    }
    await route.fulfill({json: sourcePage});
  });

  await page.goto('/ja');
  await nav(page, '会話').click();
  const requestsBeforeOpen = detailRequests;
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByText('Sourceの会話を読み込んでいます。')).toBeVisible();
  expect(detailRequests).toBe(requestsBeforeOpen + 1);
  await expect(page.getByLabel('詳細').getByText('添付の見積書をご確認いただけますか。')).toBeVisible();
  await expect(page.getByRole('button', {name: '送信する'})).toBeEnabled();
  await expect(page.getByText('Sourceの会話を読み込んでいます。')).toHaveCount(0);
});

test('clears Source search loading when the user clears an in-flight query', async ({page}) => {
  await page.unroute('**/api/bff/users/**/source/search**');
  await page.route('**/api/bff/users/**/source/search**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!route.request().isNavigationRequest()) await route.fulfill({json: sourcePage}).catch(() => undefined);
  });

  await page.goto('/ja');
  await nav(page, '検索').click();
  const search = page.getByLabel('メールを検索');
  await search.fill('slow-query');
  await expect(page.getByText('認可されたSourceを検索しています。')).toBeVisible();
  await search.fill('');
  await expect(page.getByText('検索語を入力すると、認可された会話の原文を検索します。')).toBeVisible();
  await expect(page.getByText('認可されたSourceを検索しています。')).toHaveCount(0);
  await expect(page.locator('#source-conversation-1')).toHaveCount(0);
});

test('uses trusted Moment reply context and binds explicit Send to the active Responsibility', async ({page}) => {
  const sendBodies: Record<string, unknown>[] = [];
  await page.unroute('**/api/bff/users/**/send-operations');
  await page.route('**/api/bff/users/**/send-operations', async (route) => {
    sendBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({json: {accepted: true, operation: {id: 'browser-operation-1', status: 'RECONCILED'}}});
  });

  await page.goto('/ja');
  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await expect(page.getByLabel('宛先')).toHaveValue('sender@example.com');
  await page.getByText('種類・Cc').click();
  await expect(page.getByText(/From: Browser mailbox <browser@example.invalid>/)).toBeVisible();
  const sendIsUnobstructed = await page.getByRole('button', {name: '送信する'}).evaluate((send) => {
    const rect = send.getBoundingClientRect();
    return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)?.closest('button') === send;
  });
  expect(sendIsUnobstructed).toBe(true);
  await page.getByLabel('本文').press('Enter');
  expect(sendBodies).toHaveLength(0);
  await page.getByRole('button', {name: '送信する'}).click();
  await expect(page.getByRole('button', {name: '送信済み'})).toBeDisabled();
  expect(sendBodies).toEqual([{
    draftId: 'browser-draft-reply',
    responsibilityBinding: {
      responsibilityId: 'responsibility-1',
      aggregateVersion: 1,
      evidenceRevision: 1
    }
  }]);
  await expect(page.getByText(/現在の状態へ反映済み/)).toBeVisible();
  await expect(page.getByLabel('本文')).toBeDisabled();
  await expect(page.getByLabel('宛先')).toBeDisabled();
});

test('blocks browser-offline Send without creating a SendOperation', async ({page, context}) => {
  let sendRequests = 0;
  await page.unroute('**/api/bff/users/**/send-operations');
  await page.route('**/api/bff/users/**/send-operations', async (route) => {
    sendRequests += 1;
    await route.fulfill({json: {accepted: true, operation: {id: 'unexpected', status: 'PENDING'}}});
  });
  await page.goto('/ja');
  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await expect(page.getByRole('button', {name: '送信する'})).toBeEnabled();
  await context.setOffline(true);
  await page.getByRole('button', {name: '送信する'}).click();
  await expect(page.getByText(/現在オフラインです。送信されていません/)).toBeVisible();
  expect(sendRequests).toBe(0);
  await expect(page.getByLabel('本文')).toHaveValue('確認しました。');
  await context.setOffline(false);
});

test('keeps manual composer available but disables Send when mail_send permission is absent', async ({page}) => {
  await page.unroute('**/api/bff/users/**/drafts/context**');
  await page.route('**/api/bff/users/**/drafts/context**', async (route) => {
    const mode = new URL(route.request().url()).searchParams.get('mode') === 'REPLY_ALL' ? 'REPLY_ALL' : 'REPLY';
    await route.fulfill({json: replyContextFor(mode, false)});
  });
  await page.goto('/ja');
  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await expect(page.getByLabel('本文')).toHaveValue('確認しました。');
  await expect(page.getByText(/Gmailの送信権限がありません/)).toBeVisible();
  await expect(page.getByRole('button', {name: '送信する'})).toBeDisabled();
});

test('keeps each responsive stage in content-fit order and rail labels discoverable', async ({page}) => {
  for (const width of [1600, 1448, 1180, 900, 768, 720, 430, 390, 320]) {
    await page.setViewportSize({width, height: 900});
    await page.goto('/ja');
    await waitForAuthenticatedShell(page);
    if (width > 1000) await expect(page.locator('.detail-pane')).toBeVisible();
    else await expect(page.locator('.detail-pane')).toBeHidden();
    const geometry = await page.evaluate(() => {
      const shell = document.querySelector<HTMLElement>('.app-shell')!;
      const header = document.querySelector<HTMLElement>('.mobile-header')!;
      const surface = document.querySelector<HTMLElement>('.surface-pane')!;
      const detail = document.querySelector<HTMLElement>('.detail-pane')!;
      const nav = document.querySelector<HTMLElement>('.primary-nav')!;
      const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      return {
        display: getComputedStyle(shell).display,
        header: header.getBoundingClientRect().toJSON(),
        surface: surface.getBoundingClientRect().toJSON(),
        detail: detail.getBoundingClientRect().toJSON(),
        nav: nav.getBoundingClientRect().toJSON(),
        listPanel: document.getElementById('production-list-panel')!.getBoundingClientRect().toJSON(),
        scrollWidth,
        viewport: window.innerWidth
      };
    });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.display).toBe('flex');
    if (width <= 1000) expect(geometry.nav.width).toBeLessThanOrEqual(width <= 600 ? 64 : 210);
    if (width <= 1000) expect(geometry.detail.width).toBe(0);
    if (width <= 1000) expect(geometry.listPanel.width).toBeGreaterThanOrEqual(width - geometry.nav.width - 1);
    if (width === 320) {
      await expect(page.getByRole('button', {name: /すべてのGmail/})).toBeVisible();
      await expect(page.getByRole('button', {name: /Gmail · Browser mailbox · browser@example.invalid · 接続済み/})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Gmailを追加'})).toBeVisible();
      await expect(page.locator('.mailbox-compact-index')).toHaveText('1');
    }
  }

  await page.setViewportSize({width: 900, height: 844});
  await page.goto('/ja');
  await waitForAuthenticatedShell(page);
  await nav(page, '会話').focus();
  await expect(nav(page, '会話')).toBeFocused();

  for (const width of [900, 430, 320]) {
    await page.setViewportSize({width, height: 900});
    await page.goto('/ja');
    await nav(page, '会話').click();
    if (width <= 600) {
      const rowGeometry = await page.locator('.source-row').first().evaluate((row) => {
        const avatar = row.querySelector<HTMLElement>('.source-avatar')!.getBoundingClientRect();
        const content = row.querySelector<HTMLElement>('.source-main')!.getBoundingClientRect();
        return {avatarRight: avatar.right, contentLeft: content.left};
      });
      expect(rowGeometry.avatarRight).toBeLessThanOrEqual(rowGeometry.contentLeft);
    }
    await page.getByRole('button', {name: /来期の見積書について/}).click();
    const geometry = await page.evaluate(() => ({
      nav: document.querySelector<HTMLElement>('.primary-nav')!.getBoundingClientRect().toJSON(),
      detailPanel: document.getElementById('production-detail-panel')!.getBoundingClientRect().toJSON(),
      detailScrollWidth: document.querySelector<HTMLElement>('.detail-pane')!.scrollWidth,
      detailClientWidth: document.querySelector<HTMLElement>('.detail-pane')!.clientWidth,
      viewport: window.innerWidth
    }));
    expect(geometry.detailPanel.width).toBeGreaterThanOrEqual(geometry.viewport - geometry.nav.width - 1);
    expect(geometry.detailScrollWidth).toBeLessThanOrEqual(geometry.detailClientWidth);
  }
});

test('keeps the English Source reading path complete at desktop and compact widths', async ({page}) => {
  for (const width of [1448, 900, 430, 320]) {
    await page.setViewportSize({width, height: 900});
    await page.goto('/en');
    await navEn(page, 'Conversations').click();
    await page.locator('.mailbox-account', {hasText: 'Browser mailbox'}).click();
    await expect(page.locator('.status-region')).toHaveText('Showing conversations from the selected mailbox');
    await page.getByRole('button', {name: /来期の見積書について/}).click();
    await expect(page.getByText('1 message · Original source')).toBeVisible();
    await expect(page.getByLabel('Message')).toHaveValue('確認しました。');
    await expect(page.getByRole('button', {name: 'Send reply'})).toBeEnabled();
    await page.locator('.composer-recipient-line summary').click();
    await expect(page.getByText(/From: Browser mailbox <browser@example.invalid>/)).toBeVisible();
    const sendIsUnobstructed = await page.getByRole('button', {name: 'Send reply'}).evaluate((send) => {
      const rect = send.getBoundingClientRect();
      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)?.closest('button') === send;
    });
    expect(sendIsUnobstructed).toBe(true);
    if (width === 320) {
      const attachmentGeometry = await page.locator('.attachment-item').evaluate((item) => {
        const copy = item.querySelector<HTMLElement>('.attachment-copy')!.getBoundingClientRect();
        const download = item.querySelector<HTMLElement>('.attachment-download')!.getBoundingClientRect();
        const overlaps = !(copy.right <= download.left || download.right <= copy.left || copy.bottom <= download.top || download.bottom <= copy.top);
        return {overlaps, scrollWidth: item.scrollWidth, clientWidth: item.clientWidth};
      });
      expect(attachmentGeometry.overlaps).toBe(false);
      expect(attachmentGeometry.scrollWidth).toBeLessThanOrEqual(attachmentGeometry.clientWidth);
    }
    await page.locator('.composer-recipient-line summary').click();
    const geometry = await page.evaluate(() => ({
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewport: window.innerWidth
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
  }
});

test('preserves core reading and focus visibility at 125, 150, and 200 percent browser-equivalent zoom and text scaling', async ({page}) => {
  for (const {scale, width} of [{scale: 1.25, width: 1152}, {scale: 1.5, width: 960}, {scale: 2, width: 720}]) {
    await page.setViewportSize({width, height: 844});
    await page.goto('/ja');
    await page.evaluate((textScale) => {
      document.documentElement.style.fontSize = `${textScale * 100}%`;
    }, scale);
    await nav(page, '対応が必要').click();
    await page.getByRole('button', {name: /返信する/}).click();
    const draft = page.getByLabel('本文');
    await draft.focus();
    const result = await page.evaluate(() => {
      const input = document.getElementById('reply-body')!.getBoundingClientRect();
      const header = document.querySelector<HTMLElement>('.mobile-header')!.getBoundingClientRect();
      return {
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        viewport: window.innerWidth,
        inputTop: input.top,
        headerBottom: header.bottom,
        bodyFontSize: Number.parseFloat(getComputedStyle(document.body).fontSize)
      };
    });
    expect(result.scrollWidth).toBeLessThanOrEqual(result.viewport);
    expect(result.bodyFontSize).toBeCloseTo(16 * scale, 0);
    if (width === 720) expect(result.inputTop).toBeGreaterThanOrEqual(result.headerBottom);
  }
});

test('returns focus to compact conversation-entry controls', async ({page}) => {
  await page.setViewportSize({width: 900, height: 844});
  await page.goto('/ja');
  await nav(page, '会話').click();
  await page.getByRole('button', {name: /来期の見積書について/}).click();
  await expect(page.getByRole('heading', {name: '来期の見積書について'})).toBeFocused();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.locator('#source-conversation-1')).toBeFocused();

  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await expect(page.getByRole('heading', {name: '見積書の確認を終える'})).toBeFocused();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.locator('#attention-responsibility-1')).toBeFocused();

  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/ja');

  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: '元の会話を開く'}).click();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.locator('#source-responsibility-1')).toBeFocused();

  await nav(page, '検索').click();
  await page.getByLabel('メールを検索').fill('見積書');
  await page.locator('#source-conversation-1').click();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.locator('#source-conversation-1')).toBeFocused();
});

test('does not activate global search for editable input or Japanese IME composition boundary events', async ({page}) => {
  await page.goto('/ja');
  await waitForAuthenticatedShell(page);
  await page.keyboard.press('/');
  await expect(page.getByRole('heading', {name: '検索'})).toBeVisible();
  await nav(page, 'ホーム').click();

  await page.evaluate(() => {
    const dispatch = (isComposing: boolean, keyCode: number) => {
      const event = new KeyboardEvent('keydown', {key: '/', bubbles: true, composed: true, isComposing});
      Object.defineProperty(event, 'keyCode', {value: keyCode});
      document.dispatchEvent(event);
    };
    dispatch(true, 229); // composition start/middle
    dispatch(true, 229);
    dispatch(false, 229); // documented composition-end boundary compatibility event
  });
  await expect(page.getByRole('heading', {name: 'ホーム'})).toBeVisible();

  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await page.getByLabel('本文').press('/');
  await expect(page.getByRole('heading', {name: '見積書の確認を終える'})).toBeVisible();
});

test('expires, re-authenticates, and signs out without changing mailbox monitoring semantics', async ({page, context}) => {
  await page.unroute('**/api/auth/get-session**');
  let authenticated = true;
  await page.route('**/api/auth/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/get-session')) {
      await route.fulfill({json: authenticated ? appSession : null});
      return;
    }
    if (path.endsWith('/sign-in/social')) {
      await route.fulfill({json: {redirect: false, url: 'https://accounts.google.com/o/oauth2/v2/auth?state=fixture'}});
      return;
    }
    if (path.endsWith('/sign-out')) {
      authenticated = false;
      await route.fulfill({json: {success: true}});
      return;
    }
    await route.abort();
  });
  await context.route('https://accounts.google.com/**', async (route) => {
    authenticated = true;
    await route.fulfill({status: 302, headers: {location: new URL('/ja?auth=returned', page.url()).href}, body: ''});
  });

  await page.goto('/ja');
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();

  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await page.getByLabel('本文').fill('再ログイン後も残す未送信の下書き');

  authenticated = false;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', {name: 'もう一度、サインイン'})).toBeVisible();
  await expect(page.getByText(/サーバー側の監視が停止することはありません/)).toBeVisible();
  await expect(page.getByRole('link', {name: 'English'})).toHaveCount(0);

  await page.getByRole('button', {name: 'Google で続行'}).click();
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();
  await expect(page.getByLabel('本文')).toHaveValue('再ログイン後も残す未送信の下書き');

  await nav(page, '設定').click();
  await page.getByRole('button', {name: 'この端末からログアウト'}).click();
  await expect(page.getByText(/この端末からログアウトしました。Lunowaの監視設定は変更されていません/)).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Lunowaへようこそ'})).toBeVisible();
});

test('keeps mailbox disconnect failure and Product-account deletion boundaries truthful', async ({page}) => {
  let deleteAttempts = 0;
  await page.route('**/api/bff/users/**/gmail/accounts/source-account-1', async (route) => {
    if (route.request().method() === 'DELETE') {
      deleteAttempts += 1;
      await route.fulfill({status: 500, json: {error: 'SIMULATED_DISCONNECT_FAILURE'}});
      return;
    }
    await route.continue();
  });

  await page.goto('/ja');
  await waitForAuthenticatedShell(page);
  await nav(page, '設定').click();
  await expect(page.getByRole('heading', {name: '接続と監視'})).toBeVisible();
  await page.getByRole('button', {name: 'メール連携を解除する'}).click();
  await expect(page.getByText(/この解除で1件の監視が停止します/)).toBeVisible();
  await page.getByRole('button', {name: '解除を確定する'}).click();
  await expect(page.getByText(/解除処理を完了できませんでした/)).toBeVisible();
  expect(deleteAttempts).toBe(1);

  await expect(page.getByRole('heading', {name: 'Lunowaアカウントの削除'})).toBeVisible();
  await expect(page.getByText(/現在、この画面から削除処理は実行しません/)).toBeVisible();
});
