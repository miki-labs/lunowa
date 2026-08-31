import {expect, test} from '@playwright/test';

const nav = (page: import('@playwright/test').Page, label: string) => page.getByRole('button', {name: `${label}を表示`});

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
    const geometry = await page.evaluate(() => {
      const shell = document.querySelector<HTMLElement>('.app-shell')!;
      const header = document.querySelector<HTMLElement>('.mobile-header')!;
      const surface = document.querySelector<HTMLElement>('.surface-pane')!;
      const detail = document.querySelector<HTMLElement>('.detail-pane')!;
      const nav = document.querySelector<HTMLElement>('.primary-nav')!;
      const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      return {
        columns: getComputedStyle(shell).gridTemplateColumns.split(' ').length,
        header: header.getBoundingClientRect().toJSON(),
        surface: surface.getBoundingClientRect().toJSON(),
        detail: detail.getBoundingClientRect().toJSON(),
        nav: nav.getBoundingClientRect().toJSON(),
        scrollWidth,
        viewport: window.innerWidth
      };
    });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
    if (width >= 1440) expect(geometry.columns).toBe(3);
    if (width >= 900 && width < 1180) expect(geometry.nav.width).toBeLessThanOrEqual(72);
    if (width >= 720 && width < 900) {
      expect(geometry.columns).toBe(2);
      expect(geometry.header.width).toBeCloseTo(width, 0);
      expect(geometry.surface.y).toBeGreaterThanOrEqual(geometry.header.y + geometry.header.height);
      expect(geometry.detail.y).toBeGreaterThanOrEqual(geometry.header.y + geometry.header.height);
    }
    if (width < 720) expect(geometry.columns).toBe(1);
  }

  await page.setViewportSize({width: 900, height: 844});
  await page.goto('/ja');
  await nav(page, '会話').focus();
  await expect(page.locator('.nav-tooltip', {hasText: '会話'})).toBeVisible();
});

test('preserves core reading and focus visibility at effective 125, 150, and 200 percent reflow widths', async ({page}) => {
  for (const width of [1152, 960, 720]) {
    await page.setViewportSize({width, height: 844});
    await page.goto('/ja');
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
        headerBottom: header.bottom
      };
    });
    expect(result.scrollWidth).toBeLessThanOrEqual(result.viewport);
    if (width === 720) expect(result.inputTop).toBeGreaterThanOrEqual(result.headerBottom);
  }
});

test('does not activate global search for editable input or Japanese IME composition boundary events', async ({page}) => {
  await page.goto('/ja');
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
