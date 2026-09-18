import {expect, test} from '@playwright/test';
import path from 'node:path';

// This visual-only route is deliberately absent from normal production builds.
test.skip(process.env.PLAYWRIGHT_FIDELITY !== 'true', 'Requires the opt-in local reference preview server');

for (const variant of ['desktop', 'moment']) {
  test(`${variant}: reference geometry, local interactions and draft preservation`, async ({page}, testInfo) => {
    await page.setViewportSize({width:1448,height:1086});
    const apiRequests:string[] = [];
    const errors:string[] = [];
    page.on('request', request => {if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url());});
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
    await page.goto(`/ja/preview?view=${variant}`);
    await expect(page.getByRole('heading', {name:'返信して日程を確定する'})).toBeVisible();
    await expect(page.locator('.rf-mail-row')).toHaveCount(8);
    await expect(page.getByRole('textbox', {name:'返信本文'})).toBeVisible();
    await page.screenshot({caret:'initial',path:process.env.FIDELITY_ARTIFACT_DIR ? path.join(process.env.FIDELITY_ARTIFACT_DIR, `reference-${variant}-1448.png`) : testInfo.outputPath(`${variant}.png`)});
    const panes = await page.locator('.rf-sidebar,.rf-mail-pane,.rf-detail').evaluateAll(elements => elements.map(element => {const r = element.getBoundingClientRect(); return {x:r.x,width:r.width};}));
    expect(panes[0].width).toBeCloseTo(variant === 'desktop' ? 275.46 : 264.62,0);
    expect(panes[1].width).toBeCloseTo(variant === 'desktop' ? 477.46 : 428.01,0);
    await page.getByRole('button', {name:'返信する',exact:true}).click();
    const reply = page.getByRole('textbox', {name:'返信本文'});
    await expect(reply).toBeFocused();
    await reply.fill('保持する下書き');
    await page.getByRole('button', {name:'左パネルを折り畳む'}).click();
    await expect(page.getByRole('button', {name:'左パネルを展開'})).toBeVisible();
    await expect(reply).toHaveValue('保持する下書き');
    await page.getByRole('button', {name:'左パネルを展開'}).click();
    await page.getByRole('button', {name:/佐藤 健一.*見積書/}).click();
    await expect(reply).toHaveValue('');
    await page.locator('.rf-mail-row').first().click();
    await expect(reply).toHaveValue('保持する下書き');
    await page.getByRole('button', {name:'送信',exact:true}).click();
    await expect(page.getByRole('status')).toContainText('実際のメール送信');
    await expect(reply).toHaveValue('保持する下書き');
    expect(apiRequests).toEqual([]);
    expect(errors).toEqual([]);
    await page.getByRole('button', {name:'閉じる',exact:true}).click();
    await page.setViewportSize({width:430,height:932});
    await expect(reply).toBeVisible();
    await expect(reply).toHaveValue('保持する下書き');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({caret:'initial',path:process.env.FIDELITY_ARTIFACT_DIR ? path.join(process.env.FIDELITY_ARTIFACT_DIR, `reference-${variant}-430.png`) : testInfo.outputPath(`${variant}-430.png`)});
    await page.getByRole('button', {name:'一覧へ戻る'}).click();
    await expect(page.locator('.rf-mail-pane')).toBeVisible();
    await expect(page.locator('.rf-mail-row').first()).toBeFocused();
    await page.setViewportSize({width:320,height:740});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('.rf-mail-row').first().click();
    await expect(page.getByRole('heading', {name:/田中 太郎/})).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (variant === 'moment') {
      await page.getByRole('button', {name:'検索',exact:true}).click();
      await expect(page.getByRole('textbox', {name:'メールやタスクを検索'})).toBeFocused();
    }
  });
}

test('English and compact view retain readable content without horizontal overflow', async ({page}) => {
  for (const width of [1448,900,430,320]) {
    await page.setViewportSize({width,height:1086});
    await page.goto('/en/preview?view=moment');
    if (width <= 1000) await page.locator('.rf-mail-row').first().click();
    await expect(page.getByRole('textbox', {name:'Reply message'})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('panel boundaries resize with pointer and keyboard while retaining the reply', async ({page}, testInfo) => {
  await page.setViewportSize({width:1448,height:1086});
  await page.goto('/ja/preview?view=moment');
  const reply = page.getByRole('textbox', {name:'返信本文'});
  await reply.fill('パネルの幅を変えても保持する下書き');
  const sidebar = page.locator('.rf-sidebar');
  const list = page.locator('.rf-mail-pane');
  const first = page.getByRole('separator', {name:'左メニューの幅を調整'});
  const second = page.getByRole('separator', {name:'メール一覧と本文の幅を調整'});
  const initial = (await sidebar.boundingBox())!.width;
  const drag = async (handle: typeof first, delta: number) => {
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2,box.y + 350);
    await page.mouse.down();
    await page.mouse.move(box.x + delta,box.y + 350,{steps:12});
    await page.mouse.up();
  };
  await drag(first,70);
  expect((await sidebar.boundingBox())!.width).toBeGreaterThan(initial + 60);
  const listBefore = (await list.boundingBox())!.width;
  await drag(second,100);
  expect((await list.boundingBox())!.width).toBeGreaterThan(listBefore + 90);
  await expect(reply).toHaveValue('パネルの幅を変えても保持する下書き');
  await second.focus();
  const keyboardBefore = (await list.boundingBox())!.width;
  await second.press('ArrowLeft');
  expect((await list.boundingBox())!.width).toBeLessThan(keyboardBefore);
  await drag(second,600);
  expect((await page.locator('.rf-detail').boundingBox())!.width).toBeGreaterThanOrEqual(419);
  expect(await page.locator('.rf-detail').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({caret:'initial',path:process.env.FIDELITY_ARTIFACT_DIR ? path.join(process.env.FIDELITY_ARTIFACT_DIR,'reference-panels-resized.png') : testInfo.outputPath('resized.png')});
  await first.dblclick();
  expect((await sidebar.boundingBox())!.width).toBeCloseTo(initial,0);
  await page.getByRole('button', {name:'左パネルを折り畳む'}).click();
  expect((await sidebar.boundingBox())!.width).toBeCloseTo(76,0);
  await page.getByRole('button', {name:'左パネルを展開'}).click();
  await expect(reply).toHaveValue('パネルの幅を変えても保持する下書き');
  await page.setViewportSize({width:430,height:932});
  await expect(first).toBeHidden();
  await page.locator('.rf-mail-row').first().click();
  await expect(reply).toHaveValue('パネルの幅を変えても保持する下書き');
  await page.setViewportSize({width:1448,height:1086});
  await expect(first).toBeVisible();
  await expect(reply).toHaveValue('パネルの幅を変えても保持する下書き');
});
