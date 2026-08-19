import {expect, test} from '@playwright/test';

test('loads the localized Phase 0 bootstrap page', async ({page}) => {
  await page.goto('/ja');

  await expect(
    page.getByRole('heading', {name: 'Lunowaの基盤が動作しています'})
  ).toBeVisible();
  await expect(page.getByTestId('bootstrap-proof')).toBeVisible();
});
