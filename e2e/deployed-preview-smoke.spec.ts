import {expect, test} from '@playwright/test';

test('serves the protected Lunowa sign-in boundary at desktop and compact viewports', async ({page}) => {
  await page.route('**/api/auth/get-session**', (route) => route.fulfill({json: null}));
  for (const viewport of [{width: 1440, height: 900}, {width: 390, height: 844}]) {
    await test.step(`${viewport.width}px viewport`, async () => {
      await page.setViewportSize(viewport);
      const response = await page.goto('/ja');

      expect(response?.ok(), 'the preview must respond successfully').toBe(true);
      await expect(page.getByRole('heading', {name: 'Lunowaへようこそ'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Google で続行'})).toBeVisible();
      await expect(page.getByText(/サインインだけでは、Gmailの読み取りや送信は許可されません/)).toBeVisible();
    });
  }
});
