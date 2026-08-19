import {expect, test} from '@playwright/test';

test('loads the localized Phase 0 bootstrap page without console errors', async ({
  page
}) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/ja');

  await expect(
    page.getByRole('heading', {name: 'Lunowaの基盤が動作しています'})
  ).toBeVisible();
  await expect(page.getByTestId('bootstrap-proof')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('keeps the bootstrap proof usable at a narrow viewport', async ({page}) => {
  await page.setViewportSize({width: 375, height: 667});
  await page.goto('/ja');

  const proof = page.getByTestId('bootstrap-proof');
  await expect(proof).toBeVisible();

  const box = await proof.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(375);
});
