import {expect, test} from '@playwright/test';

test('renders the shell and navigates a Needs You item to its Moment', async ({page}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/ja');
  await expect(page.getByTestId('lunowa-shell')).toBeVisible();
  await page.getByRole('button', {name: '対応が必要'}).click();
  await page.getByRole('button', {name: /見積書を確認して返信する/}).click();
  await expect(page.getByRole('heading', {name: '見積書を確認して返信する'})).toBeVisible();
  await expect(page.getByRole('button', {name: '返信を書く'})).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('preserves a draft and exposes a usable compact navigation drawer', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/ja');
  await page.getByRole('button', {name: 'ナビゲーションを開く'}).click();
  await page.getByRole('button', {name: '会話'}).click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  const draft = page.getByLabel('本文');
  await draft.fill('確認しました。');
  await page.getByRole('button', {name: /一覧に戻る/}).click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await expect(page.getByLabel('本文')).toHaveValue('確認しました。');
});

test('does not activate the slash search shortcut for composing IME input', async ({page}) => {
  await page.goto('/ja');
  await page.keyboard.press('/');
  await expect(page.getByRole('heading', {name: '検索'})).toBeVisible();

  await page.getByRole('button', {name: '会話'}).click();
  await page.getByRole('button', {name: /佐藤ひろ子/}).click();
  await page.getByLabel('本文').press('/');
  await expect(page.getByRole('heading', {name: '来期の見積書について'})).toBeVisible();
});
