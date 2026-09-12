import {expect, test} from '@playwright/test';
import type {AttentionItemReadModel, AttentionReadModel} from '../src/lib/attention-types';

const nav = (page: import('@playwright/test').Page, label: string) => page.getByRole('button', {name: `${label}を表示`});
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
const sourceAccount = {
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
  await page.getByRole('button', {name: 'ナビゲーションを開く'}).click();
  await nav(page, '会話').click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByLabel('詳細').getByText('添付の見積書をご確認いただけますか。')).toBeVisible();
  await expect(page.getByLabel('宛先')).toHaveValue('sender@example.com');
  await expect(page.getByText(/From: Browser mailbox <browser@example.invalid>/)).toBeVisible();
  await expect(page.getByRole('button', {name: '送信する'})).toBeEnabled();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.getByRole('button', {name: /佐藤ひろ子/})).toBeVisible();
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
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByText('Sourceの会話を読み込んでいます。')).toBeVisible();
  expect(detailRequests).toBe(1);
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
  await expect(page.getByText(/From: Browser mailbox <browser@example.invalid>/)).toBeVisible();
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
  for (const width of [1600, 1440, 1180, 900, 768, 720, 430, 390]) {
    await page.setViewportSize({width, height: 900});
    await page.goto('/ja');
    await waitForAuthenticatedShell(page);
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
        scrollWidth,
        viewport: window.innerWidth
      };
    });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
    if (width >= 1440) expect(geometry.display).toBe('grid');
    if (width >= 900 && width < 1180) expect(geometry.nav.width).toBeLessThanOrEqual(72);
    if (width >= 720 && width < 900) {
      expect(geometry.display).toBe('grid');
      expect(geometry.header.width).toBeCloseTo(width, 0);
      expect(geometry.surface.y).toBeGreaterThanOrEqual(geometry.header.y + geometry.header.height);
      expect(geometry.detail.y).toBeGreaterThanOrEqual(geometry.header.y + geometry.header.height);
    }
    if (width < 720) {
      expect(geometry.display).toBe('block');
      expect(geometry.surface.width).toBeCloseTo(width, 0);
      expect(geometry.detail.width).toBe(0);
    }
  }

  await page.setViewportSize({width: 900, height: 844});
  await page.goto('/ja');
  await waitForAuthenticatedShell(page);
  await nav(page, '会話').focus();
  await expect(page.locator('.nav-tooltip', {hasText: '会話'})).toBeVisible();
});

test('preserves core reading and focus visibility at 125, 150, and 200 percent browser-equivalent zoom and text scaling', async ({page}) => {
  for (const {scale, width} of [{scale: 1.25, width: 1152}, {scale: 1.5, width: 960}, {scale: 2, width: 720}]) {
    await page.setViewportSize({width, height: 844});
    await page.goto('/ja');
    await page.evaluate((textScale) => {
      document.documentElement.style.fontSize = `${textScale * 100}%`;
    }, scale);
    if (width < 900) await page.getByRole('button', {name: 'ナビゲーションを開く'}).click();
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
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/ja');

  await page.getByRole('button', {name: 'ナビゲーションを開く'}).click();
  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: '元の会話を開く'}).click();
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await expect(page.locator('#source-responsibility-1')).toBeFocused();

  await page.getByRole('button', {name: 'ナビゲーションを開く'}).click();
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
  await expect(page.getByRole('heading', {name: /おはようございます/})).toBeVisible();

  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /返信する/}).click();
  await page.getByLabel('本文').press('/');
  await expect(page.getByRole('heading', {name: '見積書の確認を終える'})).toBeVisible();
});

test('expires, re-authenticates, and signs out without changing mailbox monitoring semantics', async ({page}) => {
  await page.unroute('**/api/auth/get-session**');
  let authenticated = true;
  await page.route('**/api/auth/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/get-session')) {
      await route.fulfill({json: authenticated ? appSession : null});
      return;
    }
    if (path.endsWith('/sign-in/email')) {
      authenticated = true;
      await route.fulfill({json: {redirect: false, token: appSession.session.token, user: appSession.user}});
      return;
    }
    if (path.endsWith('/sign-out')) {
      authenticated = false;
      await route.fulfill({json: {success: true}});
      return;
    }
    await route.abort();
  });

  await page.goto('/ja');
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();

  authenticated = false;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', {name: 'セッションの期限が切れました'})).toBeVisible();
  await expect(page.getByText(/サーバー側の監視が停止したことは意味しません/)).toBeVisible();

  await page.getByLabel('メールアドレス').fill('browser@example.invalid');
  await page.getByLabel('パスワード').fill('password-123');
  await page.getByRole('button', {name: 'サインインする'}).click();
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();

  await nav(page, '設定').click();
  await page.getByRole('button', {name: 'この端末からログアウト'}).click();
  await expect(page.getByText(/この端末からログアウトしました。Lunowaの監視設定は変更されていません/)).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Lunowaにサインイン'})).toBeVisible();
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
