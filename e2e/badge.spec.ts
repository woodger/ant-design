import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-badge');
const indicator = (page: Page) => host(page).locator('sup');
const target = (page: Page) => host(page).getByRole('button', { name: 'Badge inbox', exact: true });
const check = (page: Page, name: string, value = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(value);
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Badge ${name}`, exact: true }).selectOption(value);
const number = (page: Page, name: string, value: string) => page.getByRole('spinbutton', { name: `Badge ${name}`, exact: true }).fill(value);
const output = (page: Page, name: string) => page.getByRole('status', { name: `Badge ${name}`, exact: true });
const hotkey = (page: Page, digit: number) => page.keyboard.press(`Control+Alt+Shift+Digit${digit}`);
const bounds = (locator: Locator) => locator.evaluate(node => { const rect = node.getBoundingClientRect(); return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height }; });

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=badge'); await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible(); });

test('Badge describes the full count without announcements or additional tab stops', async ({ page }, testInfo) => {
  await number(page, 'count', '120'); await expect(indicator(page)).toHaveText('99+'); await expect(target(page)).toHaveAccessibleDescription('Количество: 120');
  await expect(indicator(page)).toHaveAttribute('aria-hidden', 'true'); await expect(host(page)).toHaveAttribute('title', '120'); await expect(host(page)).not.toHaveAttribute('tabindex'); await expect(host(page).locator('[aria-live], [role="status"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Before Badge', exact: true }).focus(); await page.keyboard.press('Tab'); await expect(target(page)).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'After Badge', exact: true })).toBeFocused();
  await page.locator('#badge-surface').screenshot({ path: testInfo.outputPath('badge-light.png') });
});

test('Badge preserves the focused child node and removes stale description links across zero and missing counts', async ({ page }) => {
  const original = await target(page).elementHandle(); await target(page).focus();
  for (const digit of [6, 6, 7, 6]) {
    await hotkey(page, digit); await expect(target(page)).toBeFocused(); expect(await target(page).evaluate((node, old) => node === old, original)).toBe(true);
    const id = await target(page).getAttribute('aria-describedby'); if (id) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1); else await expect(host(page).locator('.ant-badge-description')).toHaveCount(0);
  }
  await expect(indicator(page)).toHaveCount(0); await expect(target(page)).not.toHaveAttribute('aria-describedby');
});

test('Badge leaves native child activation and form submission intact', async ({ page }) => {
  await target(page).focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await target(page).click();
  await expect(output(page, 'clicks')).toHaveText('3'); await expect(output(page, 'submissions')).toHaveText('3'); await expect(target(page)).toHaveAttribute('type', 'submit');
});

test('Badge follows overflow bounds and preserves signed fractional count values', async ({ page }) => {
  await number(page, 'count', '99'); await expect(indicator(page)).toHaveText('99'); await number(page, 'count', '100'); await expect(indicator(page)).toHaveText('99+');
  await number(page, 'overflow', '0'); await expect(indicator(page)).toHaveText('0+'); await number(page, 'overflow', '2.5'); await expect(indicator(page)).toHaveText('2.5+');
  await number(page, 'count', '-4'); await expect(indicator(page)).toHaveText('-4'); await number(page, 'count', '1.5'); await expect(indicator(page)).toHaveText('1.5'); await expect(output(page, 'owner count')).toHaveText('1.5');
});

test('Badge normalizes nonfinite values without changing owner state', async ({ page }) => {
  await target(page).focus();
  for (const [digit, value] of [[8, 'NaN'], [9, 'Infinity']] as const) { await hotkey(page, digit); await expect(indicator(page)).toHaveCount(0); await expect(target(page)).toHaveAttribute('data-count', 'undefined'); await expect(output(page, 'owner count')).toHaveText(value); await expect(target(page)).toBeFocused(); }
  await hotkey(page, 6); await hotkey(page, 6); await hotkey(page, 0); await expect(indicator(page)).toHaveText('99+'); await expect(indicator(page)).toHaveCSS('margin-top', '0px'); await expect(indicator(page)).toHaveCSS('inset-inline-end', '0px');
});

test('Badge dot mode follows source zero rules and retains the full accessible count', async ({ page }) => {
  await check(page, 'Badge dot mode'); await expect(indicator(page)).toHaveClass(/ant-badge-dot/); await expect(indicator(page)).toHaveText(''); await expect(target(page)).toHaveAccessibleDescription('Количество: 5');
  await number(page, 'count', '0'); await expect(indicator(page)).toHaveCount(0); await check(page, 'Badge show zero'); await expect(indicator(page)).toHaveClass(/ant-badge-count/); await expect(indicator(page)).not.toHaveClass(/ant-badge-dot/); await expect(indicator(page)).toHaveText('0');
  await number(page, 'count', ''); await expect(indicator(page)).toHaveClass(/ant-badge-dot/); await expect(target(page)).toHaveAccessibleDescription('Есть обновления');
});

test('Badge switches to standalone counts and sizes without adding interactive controls', async ({ page }) => {
  await check(page, 'Standalone Badge'); await expect(target(page)).toHaveCount(0); await expect(host(page)).toHaveClass(/ant-badge-not-a-wrapper/); await expect(indicator(page)).toHaveCSS('position', 'relative'); await expect(indicator(page)).toHaveCSS('transform', 'none'); await expect(indicator(page)).toHaveCSS('height', '20px');
  await setting(page, 'size', 'small'); await expect(indicator(page)).toHaveCSS('height', '14px'); await expect(indicator(page)).toHaveCSS('min-width', '14px'); await expect(host(page).getByRole('button')).toHaveCount(0);
});

test('Badge renders all five passive statuses and gives a numeric count priority', async ({ page }) => {
  const row = page.locator('#badge-statuses'); await expect(row.locator('.ant-badge-status-dot')).toHaveCount(5);
  for (const status of ['success', 'processing', 'default', 'error', 'warning']) await expect(row.locator(`.ant-badge-status-dot.ant-badge-status-${status}`)).toBeVisible();
  await expect(row.locator('[role="status"], [aria-live], [tabindex]')).toHaveCount(0); await expect(page.locator('#badge-numeric-status sup')).toHaveText('5'); await expect(page.locator('#badge-numeric-status')).not.toHaveClass(/ant-badge-status(?:\s|$)/); await expect(page.locator('#badge-numeric-status sup')).toHaveCSS('background-color', 'rgb(255, 77, 79)');
});

test('Badge wrapped statuses need dot mode and standalone statuses stay visible with hidden zero', async ({ page }) => {
  await number(page, 'count', ''); await setting(page, 'status', 'success'); await expect(indicator(page)).toHaveCount(0); await check(page, 'Badge dot mode'); await expect(indicator(page)).toHaveCSS('background-color', 'rgb(82, 196, 26)');
  await check(page, 'Standalone Badge'); await number(page, 'count', '0'); await expect(host(page).locator('.ant-badge-status-dot')).toBeVisible(); await expect(indicator(page)).toHaveCount(0); await expect(host(page).locator('.ant-badge-description')).toHaveText('Успешно');
});

test('Badge applies all thirteen preset colors to count and status indicators', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); const colors = new Map<string, string>();
  for (const color of ['blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold']) { await setting(page, 'color', color); await expect(indicator(page)).toHaveClass(new RegExp(`ant-badge-color-${color}`)); colors.set(color, await indicator(page).evaluate(node => getComputedStyle(node).backgroundColor)); }
  expect(colors.get('blue')).toBe('rgb(22, 119, 255)'); expect(colors.get('purple')).toBe('rgb(114, 46, 209)'); expect(colors.get('pink')).toBe(colors.get('magenta'));
  await check(page, 'Standalone Badge'); await number(page, 'count', ''); await setting(page, 'color', 'purple'); await expect(host(page).locator('.ant-badge-status-dot')).toHaveCSS('background-color', 'rgb(114, 46, 209)');
});

test('Badge renders escaped string and rich status text with literal zero visibility rules', async ({ page }) => {
  await check(page, 'Standalone Badge'); await number(page, 'count', ''); await setting(page, 'status', 'success'); const input = page.getByRole('textbox', { name: 'Badge text', exact: true });
  await input.fill('<img src=x>'); await expect(host(page)).toContainText('<img src=x>'); await expect(host(page).locator('img')).toHaveCount(0); await check(page, 'Badge text snippet'); await expect(host(page).locator('strong')).toHaveText('<img src=x>');
  await check(page, 'Badge text snippet', false); await input.fill('0'); await expect(host(page).locator('.ant-badge-status-text')).toHaveCount(0); await check(page, 'Badge show zero'); await expect(host(page).locator('.ant-badge-status-text')).toHaveText('0');
});

test('Badge supports explicit and suppressed native titles independently of descriptions', async ({ page }) => {
  for (const mode of ['off', 'null']) { await setting(page, 'title', mode); await expect(host(page)).not.toHaveAttribute('title'); await expect(indicator(page)).not.toHaveAttribute('title'); await expect(target(page)).toHaveAccessibleDescription('Количество: 5'); }
  await setting(page, 'title', 'custom'); await expect(host(page)).toHaveAttribute('title', 'Unread messages'); await expect(indicator(page)).toHaveAttribute('title', 'Unread messages');
});

test('Badge merges nested locale overrides and updates inherited descriptions live', async ({ page }) => {
  const original = await target(page).elementHandle(); await check(page, 'English locale'); await expect(target(page)).toHaveAccessibleDescription('Count: 5'); await expect(page.locator('#badge-partial-count .ant-badge-description')).toHaveText('Count: 120'); await expect(page.locator('#badge-partial-warning .ant-badge-description')).toHaveText('Custom warning'); await expect(page.locator('#badge-partial-error .ant-badge-description')).toHaveText('Error');
  expect(await target(page).evaluate((node, old) => node === old, original)).toBe(true); await check(page, 'English locale', false); await expect(target(page)).toHaveAccessibleDescription('Количество: 5');
});

test('Badge offsets follow logical end in RTL without moving its child', async ({ page }) => {
  const original = await bounds(target(page)); const base = await bounds(indicator(page));
  await number(page, 'offset X', '12.5'); await number(page, 'offset Y', '-6'); const moved = await bounds(indicator(page)); expect(moved.x - base.x).toBeCloseTo(12.5, 1); expect(moved.y - base.y).toBeCloseTo(-6, 1); expect(await bounds(target(page))).toEqual(original);
  await check(page, 'Right to left'); await expect(host(page)).toHaveAttribute('dir', 'rtl'); const rtl = await bounds(indicator(page)); await number(page, 'offset X', '0'); const zero = await bounds(indicator(page)); expect(rtl.x - zero.x).toBeCloseTo(-12.5, 1);
});

test('Badge uses dark compact tokens while keeping medium size independent of context', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await setting(page, 'color', 'blue'); await check(page, 'Dark Badge theme'); await check(page, 'Compact Badge theme'); await check(page, 'Right to left');
  await expect(indicator(page)).toHaveCSS('background-color', 'rgb(22, 119, 255)'); await expect(indicator(page)).toHaveCSS('height', '20px'); await expect(indicator(page)).toHaveCSS('box-shadow', 'rgb(20, 20, 20) 0px 0px 0px 1px'); await setting(page, 'size', 'small'); await expect(indicator(page)).toHaveCSS('height', '14px');
  await page.locator('#badge-surface').screenshot({ path: testInfo.outputPath('badge-dark-compact-rtl.png') });
});

test('Badge processing pulse respects reduced motion', async ({ page }) => {
  const processing = page.locator('#badge-statuses .ant-badge-status-dot.ant-badge-status-processing'); await expect(processing).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  expect(await processing.evaluate(node => getComputedStyle(node, '::after').animationName)).toBe('antStatusProcessing'); await page.emulateMedia({ reducedMotion: 'reduce' }); expect(await processing.evaluate(node => getComputedStyle(node, '::after').animationName)).toBe('none'); await expect(indicator(page)).toHaveCSS('transition-duration', '0s');
});

test('Badge stays within its mobile surface', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 }); await number(page, 'count', '120');
  const bounds = await page.locator('#badge-surface').evaluate(node => ({ right: node.getBoundingClientRect().right, width: node.clientWidth, scroll: node.scrollWidth })); expect(bounds.right).toBeLessThanOrEqual(320); expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
  await page.locator('#badge-surface').screenshot({ path: testInfo.outputPath('badge-mobile.png') }); await expect(target(page)).toHaveAccessibleDescription('Количество: 120');
});
