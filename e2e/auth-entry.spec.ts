import {expect, test} from '@playwright/test';

test('Google-only entry supports both locales, compact layouts, keyboard focus and text enlargement', async ({page}) => {
  await page.route('**/api/auth/get-session**', (route) => route.fulfill({json: null}));
  for (const locale of ['ja', 'en']) {
    for (const width of [1440, 900, 430, 320]) {
      await page.setViewportSize({width, height: 900});
      await page.goto(`/${locale}`);
      const button = page.getByRole('button', {name: locale === 'ja' ? 'Google で続行' : 'Continue with Google'});
      await expect(button).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('input')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.getByRole('link', {name: '日本語'}).press('Tab');
      await expect(page.getByRole('link', {name: 'English'})).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(button).toBeFocused();
      expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
      // WCAG text-resize case; viewport tests above separately exercise reflow.
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      await expect(button).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

test('locale links switch actual copy and failed Google initiation allows retry', async ({page}) => {
  await page.route('**/api/auth/get-session**', (route) => route.fulfill({json: null}));
  await page.route('**/api/auth/sign-in/social', (route) => route.fulfill({status: 400, json: {message: 'PRIVATE_PROVIDER_DETAIL'}}));
  await page.goto('/ja');
  await page.getByRole('link', {name: 'English'}).click();
  await expect(page.getByRole('heading', {name: 'Welcome to Lunowa'})).toBeVisible();
  await page.getByRole('button', {name: 'Continue with Google'}).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('We couldn’t complete Google sign-in.');
  await expect(page.getByText('PRIVATE_PROVIDER_DETAIL')).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Try again with Google'})).toHaveAttribute('aria-busy', 'false');
});

test('session lookup failure offers a truthful retry before showing sign-in', async ({page}) => {
  let failed = true;
  await page.route('**/api/auth/get-session**', (route) => route.fulfill(failed
    ? {status: 500, json: {message: 'unavailable'}} : {json: null}));
  await page.goto('/ja');
  await expect(page.getByRole('heading', {name: 'サインイン状態を確認できません'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Google で続行'})).toHaveCount(0);
  failed = false;
  await page.getByRole('button', {name: 'もう一度確認する'}).click();
  await expect(page.getByRole('heading', {name: 'Lunowaへようこそ'})).toBeVisible();
});
