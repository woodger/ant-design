import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=anchor');
  await expect(page.locator('#fixture-anchor')).toBeVisible();
});

test('Anchor tracks the nearest eligible section and honors per-link scroll offsets', async ({ page }) => {
  const root = page.locator('#fixture-anchor');
  const second = root.getByRole('link', { name: 'Second section', exact: true });
  await expect(root.getByRole('link', { name: 'First section', exact: true })).toHaveClass(/-title-active/);
  await second.click();
  await expect(second).toBeFocused();
  await expect(second).toHaveClass(/-title-active/);
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(310);
  await expect(page).toHaveURL(/#anchor-two$/);
  await expect(page.getByLabel('Anchor clicked', { exact: true })).toHaveText('#anchor-two');
  const before = await page.getByLabel('Anchor changes', { exact: true }).textContent();
  await page.locator('#anchor-scroll').evaluate(node => node.dispatchEvent(new Event('scroll')));
  await expect(page.getByLabel('Anchor changes', { exact: true })).toHaveText(before!);
  await page.locator('#anchor-scroll').evaluate(node => { node.scrollTop = 525; });
  await expect(root.getByRole('link', { name: 'Third section', exact: true })).toHaveClass(/-title-active/);
  await expect(root.locator('.anchor-custom-item')).toHaveCount(5);
  await expect(second).toHaveCSS('font-weight', '500');
});

test('Anchor preventDefault cancels history while preserving scroll and raw callbacks with mapped highlighting', async ({ page }) => {
  await page.getByLabel('Prevent Anchor history', { exact: true }).check();
  await page.getByLabel('Map Anchor highlight', { exact: true }).check();
  const initial = page.url();
  const root = page.locator('#fixture-anchor');
  await root.getByRole('link', { name: 'Second section', exact: true }).click();
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(310);
  expect(page.url()).toBe(initial);
  await expect(root.getByRole('link', { name: 'Third section', exact: true })).toHaveClass(/-title-active/);
  await expect(page.getByLabel('Anchor changes', { exact: true })).toContainText('#anchor-two');
  await root.getByRole('link', { name: 'Third section', exact: true }).click();
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(520);
  const changes = JSON.parse((await page.getByLabel('Anchor changes', { exact: true }).textContent())!) as string[];
  expect(changes.at(-1)).toBe('#anchor-three');
});

test('Anchor supports replace history, raw fragments with spaces and native Enter activation', async ({ page }) => {
  await page.getByLabel('Replace Anchor history', { exact: true }).check();
  const length = await page.evaluate(() => history.length);
  const link = page.locator('#fixture-anchor').getByRole('link', { name: 'Section with space', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#anchor%20space$/);
  expect(await page.evaluate(() => history.length)).toBe(length);
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(700);
  await expect(link).toBeFocused();
});

test('Anchor cancels superseded animations and retains the final target after rapid clicks', async ({ page }) => {
  await page.locator('#fixture-anchor').evaluate(node => {
    const links = [...node.querySelectorAll<HTMLAnchorElement>('a')];
    links[2].click(); links[3].click(); links[2].click(); links[2].click();
  });
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(310);
  await expect(page.locator('#fixture-anchor .ant-anchor-link-title-active')).toHaveText('Second section');
  await page.getByLabel('Mount Anchor', { exact: true }).uncheck();
  const before = await page.getByLabel('Anchor changes', { exact: true }).textContent();
  await page.locator('#anchor-scroll').evaluate(node => { node.scrollTop = 600; });
  await expect(page.locator('#fixture-anchor')).toHaveCount(0);
  await expect(page.getByLabel('Anchor changes', { exact: true })).toHaveText(before!);
});

test('Anchor horizontal mode excludes nested links, reveals LTR links and positions its indicator in RTL', async ({ page }) => {
  await page.getByLabel('Horizontal Anchor', { exact: true }).check();
  const root = page.locator('#fixture-anchor');
  await expect(root.getByRole('link', { name: 'Nested section', exact: true })).toHaveCount(0);
  await page.locator('#anchor-scroll').evaluate(node => { node.scrollTop = 700; });
  const link = root.getByRole('link', { name: 'Section with space', exact: true });
  await expect(link).toHaveClass(/-title-active/);
  await expect.poll(async () => {
    const box = (await link.boundingBox())!;
    const holder = (await root.boundingBox())!;
    return box.x >= holder.x - 1 && box.x + box.width <= holder.x + holder.width + 1;
  }).toBe(true);
  await page.getByLabel('Right to left', { exact: true }).check();
  await expect(root).toHaveCSS('direction', 'rtl');
  await page.locator('#anchor-scroll').evaluate(node => { node.scrollTop = 0; });
  await expect(root.getByRole('link', { name: 'First section', exact: true })).toHaveClass(/-title-active/);
  await page.locator('#anchor-scroll').evaluate(node => { node.scrollTop = 700; });
  await expect(link).toHaveClass(/-title-active/);
  await expect.poll(async () => Math.abs((await root.locator('.ant-anchor-ink').boundingBox())!.width - (await link.boundingBox())!.width)).toBeLessThan(0.6);
});

test('Anchor legacy links register, track scrolling and omit descendants in horizontal mode', async ({ page }) => {
  await page.getByLabel('Legacy Anchor links', { exact: true }).check();
  const root = page.locator('#fixture-anchor');
  await expect(root.getByRole('link', { name: 'Legacy nested', exact: true })).toBeVisible();
  await root.getByRole('link', { name: 'Legacy second', exact: true }).click();
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(310);
  await expect(root.getByRole('link', { name: 'Legacy second', exact: true })).toHaveClass(/-title-active/);
  await page.getByLabel('Horizontal Anchor', { exact: true }).check();
  await expect(root.getByRole('link', { name: 'Legacy nested', exact: true })).toHaveCount(0);
});

test('Anchor uses Affix against its custom container without cloning native links', async ({ page }) => {
  await page.getByLabel('Affixed Anchor', { exact: true }).check();
  const root = page.locator('#fixture-anchor');
  await expect(root.locator('..')).toHaveClass(/ant-affix/);
  await expect(root.getByRole('link', { name: 'Second section', exact: true })).toHaveCount(1);
  await root.getByRole('link', { name: 'Second section', exact: true }).click();
  await expect.poll(() => page.locator('#anchor-scroll').evaluate(node => node.scrollTop)).toBe(310);
});

test('Anchor gallery hydrates its navigation and remains usable at a narrow viewport', async ({ page }) => {
  await page.goto('/ant-design#anchor');
  const section = page.locator('#anchor');
  await section.getByRole('link', { name: 'Доставка', exact: true }).click();
  await expect(section.getByLabel('Текущий раздел Anchor', { exact: true })).toHaveText('#anchor-demo-delivery');
  await page.setViewportSize({ width: 320, height: 900 });
  const box = (await section.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});
