import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=affix');
  await expect(page.locator('#fixture-affix')).toBeVisible();
});

test('Affix keeps one native field and its focus while preserving the flow placeholder', async ({ page }) => {
  const root = page.locator('#fixture-affix');
  const fixed = root.locator(':scope > div').last();
  const input = page.getByRole('textbox', { name: 'Affix draft', exact: true });
  const initial = await root.boundingBox();
  const original = await input.elementHandle();
  await input.fill('retained');
  await page.locator('#affix-scroll').evaluate(node => { node.scrollTop = 120; });
  await expect(fixed).toHaveCSS('position', 'fixed');
  await expect(fixed).toHaveClass(/affix-inner/);
  await expect(root).toHaveClass('affix-outer');
  await expect(root.locator(':scope > [aria-hidden=true]')).toHaveCount(1);
  await expect.poll(async () => Math.abs((await root.boundingBox())!.height - initial!.height)).toBeLessThan(0.6);
  const target = await page.locator('#affix-scroll').boundingBox();
  expect(Math.abs((await fixed.boundingBox())!.y - target!.y - 10)).toBeLessThan(0.6);
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(input).toHaveCount(1);
  await page.locator('#affix-scroll').evaluate(node => { node.scrollTop = 0; });
  await expect(fixed).not.toHaveClass(/ant-affix/);
  await expect(input).toHaveValue('retained');
  await page.getByRole('button', { name: 'Read Affix form', exact: true }).click();
  await expect(page.getByLabel('Affix form data', { exact: true })).toHaveText('[["draft","retained"]]');
  await expect(page.getByLabel('Affix changes', { exact: true })).toHaveText('[true,false]');
});

test('Affix reacts to offsets, resize and null targets in RTL without duplicate change callbacks', async ({ page }) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  const fixed = page.locator('#fixture-affix > div').last();
  await page.locator('#affix-scroll').evaluate(node => { node.scrollTop = 120; });
  await expect(fixed).toHaveCSS('position', 'fixed');
  await page.getByLabel('Affix offset', { exact: true }).fill('24');
  const top = (await page.locator('#affix-scroll').boundingBox())!.y;
  await expect.poll(async () => Math.abs((await fixed.boundingBox())!.y - top - 24)).toBeLessThan(0.6);
  await page.getByLabel('Affix width', { exact: true }).fill('310');
  await expect(fixed).toHaveCSS('width', '310px');
  await page.getByLabel('Null Affix target', { exact: true }).check();
  await page.locator('#affix-scroll').evaluate(node => { node.scrollTop = 0; });
  await page.getByRole('button', { name: 'Refresh Affix', exact: true }).click();
  await expect(fixed).toHaveCSS('position', 'fixed');
  await page.getByLabel('Null Affix target', { exact: true }).uncheck();
  await expect(fixed).not.toHaveClass(/ant-affix/);
  await expect(page.getByLabel('Affix changes', { exact: true })).toHaveText('[true,false]');
});

test('Affix supports bottom anchoring and returns content to flow at the boundary', async ({ page }) => {
  await page.getByLabel('Bottom Affix', { exact: true }).check();
  const fixed = page.locator('#fixture-affix > div').last();
  await expect(fixed).toHaveCSS('position', 'fixed');
  const target = (await page.locator('#affix-scroll').boundingBox())!;
  expect(Math.abs((await fixed.boundingBox())!.y + (await fixed.boundingBox())!.height - (target.y + target.height - 10))).toBeLessThan(0.6);
  await page.locator('#affix-scroll').evaluate(node => { node.scrollTop = 200; });
  await expect(fixed).not.toHaveClass(/ant-affix/);
});

test('Affix switches to window scroll and cleans up fixed content on unmount', async ({ page }) => {
  await page.getByLabel('Window Affix', { exact: true }).check();
  const fixed = page.locator('#fixture-affix > div').last();
  await page.evaluate(() => { document.body.style.minHeight = '2200px'; window.scrollTo(0, 750); });
  await expect(fixed).toHaveCSS('top', '10px');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(fixed).not.toHaveClass(/ant-affix/);
  await page.getByLabel('Mount Affix', { exact: true }).uncheck();
  await page.evaluate(() => { window.scrollTo(0, 750); window.dispatchEvent(new Event('resize')); });
  await expect(page.locator('#fixture-affix')).toHaveCount(0);
  await expect(page.getByLabel('Affix changes', { exact: true })).toHaveText('[true,false]');
});

test('Affix gallery hydrates its action and remains within a narrow container', async ({ page }) => {
  await page.goto('/ant-design#affix');
  const section = page.locator('#affix');
  await section.getByRole('button', { name: 'Действие (0)', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Действие (1)', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  const box = (await section.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});
