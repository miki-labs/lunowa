import {expect, test} from '@playwright/test';

test('serves the Lunowa structural shell at desktop and compact viewports', async ({page}) => {
  for (const viewport of [{width: 1440, height: 900}, {width: 390, height: 844}]) {
    await test.step(`${viewport.width}px viewport`, async () => {
      await page.setViewportSize(viewport);
      const response = await page.goto('/ja');

      expect(response?.ok(), 'the preview must respond successfully').toBe(true);
      await expect(page.getByTestId('lunowa-shell')).toBeVisible();
      await expect(page.getByRole('heading', {name: 'ホーム'})).toBeVisible();
      await expect(page.getByText('Lunowaが見ています', {exact: false})).toBeVisible();
    });
  }
});
