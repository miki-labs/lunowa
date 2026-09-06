import {expect, test} from '@playwright/test';

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

test.beforeEach(async ({page}) => {
  await page.route('**/api/auth/get-session**', (route) => route.fulfill({json: appSession}));
  await page.route('**/api/bff/users/**/source/search**', (route) => route.fulfill({json: sourcePage}));
  await page.route('**/api/bff/users/**/source/conversations**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    await route.fulfill({json: pathname.endsWith('/source-conversation-1') ? sourceDetail : sourcePage});
  });
});

test('renders the shell and navigates a Needs You item to its Moment', async ({page}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/ja');
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();
  await nav(page, '対応が必要').click();
  await page.getByRole('button', {name: /見積書を確認して返信する/}).click();
  await expect(page.getByRole('heading', {name: '見積書を確認して返信する'})).toBeVisible();
  await expect(page.getByRole('button', {name: '返信を書く'})).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('preserves a draft and exposes a usable compact navigation drawer', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/ja');
  await page.getByRole('button', {name: 'ナビゲーションを開く'}).click();
  await nav(page, '会話').click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  const draft = page.getByLabel('本文');
  await draft.fill('確認しました。');
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByLabel('本文')).toHaveValue('確認しました。');
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
    await nav(page, '会話').click();
    await page.getByRole('button', {name: /佐藤ひろ子/}).click();
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
  await expect(page.locator('#needs-open-source')).toBeFocused();

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
  await expect(page.getByRole('heading', {name: 'ホーム'})).toBeVisible();

  await nav(page, '会話').click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await page.getByLabel('本文').press('/');
  await expect(page.getByRole('heading', {name: '来期の見積書について'})).toBeVisible();
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
