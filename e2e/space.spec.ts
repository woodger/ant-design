import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=space');
  await expect(page.locator('#fixture-space')).toBeVisible();
});

test('Space uses independent preset and numeric gaps and lets inline style override both axes', async ({ page }) => {
  const root = page.locator('#fixture-space');
  await expect(root).toHaveCSS('display', 'inline-flex');
  await expect(root).toHaveCSS('column-gap', '8px');
  await expect(root).toHaveCSS('align-items', 'center');
  await page.getByLabel('Space size', { exact: true }).selectOption('custom');
  await expect(root).toHaveCSS('column-gap', '12px');
  await expect(root).toHaveCSS('row-gap', '24px');
  await page.getByLabel('Wrap Space', { exact: true }).check();
  await expect(root).toHaveCSS('flex-wrap', 'wrap');
  await page.getByLabel('Override Space style', { exact: true }).check();
  await expect(root).toHaveCSS('column-gap', '99px');
  await expect(root).toHaveCSS('row-gap', '99px');
  await expect(root).toHaveCSS('flex-wrap', 'nowrap');
});

test('Space preserves keyed drafts and focus during reorder and orientation changes without submitting', async ({ page }) => {
  const draft = page.getByRole('textbox', { name: 'Space draft', exact: true });
  await draft.fill('Retained draft');
  const previous = await draft.elementHandle();
  await page.keyboard.press('F4');
  await expect(draft).toHaveValue('Retained draft');
  expect(await draft.evaluate((node, input) => node === input, previous)).toBe(true);
  await expect(draft).toBeFocused();
  await page.keyboard.press('F4');
  await expect(draft).toBeFocused();
  await page.keyboard.press('F5');
  await expect(draft).toBeFocused();
  await page.getByLabel('Space orientation', { exact: true }).selectOption('vertical');
  await expect(page.locator('#fixture-space')).toHaveCSS('flex-direction', 'column');
  await expect(page.locator('#fixture-space')).toHaveCSS('align-items', 'normal');
  await expect(draft).toHaveValue('Retained draft');
  await expect(page.getByLabel('Space submissions', { exact: true })).toHaveText('0');
});

test('Space omits falsy wrappers, hides empty snippet content and uses semantic separator styles', async ({ page }) => {
  await page.getByLabel('Include empty Space values', { exact: true }).check();
  await page.getByLabel('Space separator', { exact: true }).check();
  const root = page.locator('#fixture-space');
  await expect(root.locator('.ant-space-item')).toHaveCount(4);
  await expect(root.locator('.ant-space-item').last()).toBeHidden();
  await expect(root.locator('.ant-space-item').nth(2)).toHaveText('0');
  await expect(root.locator('.ant-space-item-separator')).toHaveCount(3);
  await expect(root.locator('.ant-space-item-separator').first()).toHaveCSS('color', 'rgb(4, 5, 6)');
  await expect(root.locator('.ant-space-item').first()).toHaveCSS('color', 'rgb(1, 2, 3)');
});

test('Space follows theme spacing and RTL while preserving its inherited typography', async ({ page }) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Space', { exact: true }).check();
  await page.getByLabel('Compact Space', { exact: true }).check();
  const root = page.locator('#fixture-space');
  await expect(root).toHaveCSS('direction', 'rtl');
  await expect(root).toHaveCSS('column-gap', '4px');
  await root.evaluate(node => { node.parentElement!.style.fontSize = '19px'; });
  await expect(root).toHaveCSS('font-size', '19px');
});

test('Space gallery hydrates its actions and layout controls and wraps at a narrow viewport', async ({ page }) => {
  await page.goto('/ant-design#space');
  const section = page.locator('#space');
  await section.getByRole('button', { name: 'Сохранить (0)', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Сохранить (1)', exact: true })).toBeVisible();
  await section.getByLabel('Вертикально', { exact: true }).check();
  await expect(section.locator('.ant-space')).toHaveCSS('flex-direction', 'column');
  await section.getByLabel('Вертикально', { exact: true }).uncheck();
  await page.setViewportSize({ width: 320, height: 900 });
  const bounds = (await section.locator('.ant-space').boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(await section.locator('.ant-space').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
});
