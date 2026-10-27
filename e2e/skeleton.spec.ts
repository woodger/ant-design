import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-skeleton');
const preview = (page: Page) => page.locator('#fixture-skeleton-preview');
const body = (page: Page) => host(page).locator('.ant-skeleton-content');
const input = (page: Page) => host(page).getByRole('textbox', { name: 'Skeleton child input', exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const check = (page: Page, name: string, value = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(value);
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Skeleton ${name}`, exact: true }).selectOption(value);
const toggle = (page: Page, key = 'J') => page.keyboard.press(`Control+Alt+Shift+${key}`);
async function expectRatio(element: Locator, parent: Locator, ratio: number) {
  const width = (await element.boundingBox())!.width; const total = (await parent.boundingBox())!.width;
  expect(Math.abs(width - total * ratio)).toBeLessThan(1);
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
});

test('Skeleton exposes an available ready region and an independent decorative default preview', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('group'); await expect(host(page)).toHaveAccessibleName('Profile content');
  await expect(body(page)).toHaveAttribute('aria-busy', 'false'); await expect(input(page)).toHaveValue('Initial Skeleton draft');
  await expect(host(page).locator('.loading-status')).toHaveCount(0); await expect(preview(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(preview(page).getByRole('status')).toHaveCount(0); await expect(preview(page).locator('li')).toHaveCount(3);
  await expect(preview(page).locator('.ant-skeleton-avatar')).toHaveCount(0);
  await expectRatio(preview(page).locator('.ant-skeleton-title'), preview(page).locator('.ant-skeleton-section'), 0.38);
  await expectRatio(preview(page).locator('li').last(), preview(page).locator('ul'), 0.61);
  await page.locator('#skeleton-fixture .surface').screenshot({ path: testInfo.outputPath('skeleton-light.png') });
});

test('Skeleton replaces children while busy and mounts fresh native and local state after loading', async ({ page }) => {
  const original = await input(page).elementHandle(); await input(page).fill('Discard this draft');
  await check(page, 'Skeleton child checkbox'); await button(page, 'Skeleton child counter').click();
  await button(page, 'Start Skeleton loading').click(); await expect(input(page)).toHaveCount(0);
  await expect(body(page)).toHaveAttribute('aria-busy', 'true'); await expect(host(page).locator('.loading-status')).toHaveText('Загрузка…');
  await expect(host(page).locator('.loading-status')).toHaveAttribute('aria-live', 'polite'); await expect(host(page).locator('.loading-status')).toHaveAttribute('aria-atomic', 'true');
  await expect(body(page).getByRole('status')).toHaveCount(0); await expect(body(page).locator('.ant-skeleton')).toHaveAttribute('aria-hidden', 'true');
  await expect(body(page).getByRole('heading')).toHaveCount(0); await expect(body(page).getByRole('button')).toHaveCount(0);
  await button(page, 'Finish Skeleton loading').click(); await expect(input(page)).toHaveValue('Initial Skeleton draft');
  await expect(host(page).getByRole('checkbox', { name: 'Skeleton child checkbox', exact: true })).not.toBeChecked();
  await expect(host(page).getByRole('status', { name: 'Skeleton child count', exact: true })).toHaveText('0');
  expect(await input(page).evaluate((node, old) => node === old, original)).toBe(false);
});

test('Skeleton parks focus before removing children and keeps it on the stable host until Tab enters fresh content', async ({ page }) => {
  await input(page).fill('Focused draft'); await toggle(page); await expect(host(page)).toBeFocused(); await expect(input(page)).toHaveCount(0);
  await expect(host(page)).toHaveAttribute('tabindex', '-1'); await toggle(page); await expect(host(page)).toBeFocused();
  await page.keyboard.press('Tab'); await expect(input(page)).toBeFocused(); await expect(input(page)).toHaveValue('Initial Skeleton draft');
});

test('Skeleton leaves an outside field focused throughout loading', async ({ page }) => {
  const outside = page.getByRole('textbox', { name: 'Skeleton outside input', exact: true }); await outside.fill('Outside focus');
  await toggle(page); await expect(outside).toBeFocused(); await toggle(page); await expect(outside).toBeFocused();
});

test('Skeleton lets Tab leave the loading region and preserves the user focus choice on completion', async ({ page }) => {
  await input(page).focus(); await toggle(page); await expect(host(page)).toBeFocused();
  await page.keyboard.press('Tab'); await expect(button(page, 'After Skeleton')).toBeFocused();
  await toggle(page); await expect(button(page, 'After Skeleton')).toBeFocused();
});

test('Skeleton accepts replacement children without moving focus into them automatically', async ({ page }) => {
  await input(page).focus(); await toggle(page); await toggle(page, 'L'); await toggle(page); await expect(host(page)).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('textbox', { name: 'Replacement Skeleton input', exact: true })).toBeFocused();
});

test('Skeleton unmount recovers parked focus and mounts an independent fresh instance', async ({ page }) => {
  await input(page).focus(); await toggle(page); await expect(host(page)).toBeFocused(); await toggle(page, 'K');
  await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Skeleton')).toBeFocused();
  await toggle(page); await toggle(page, 'K'); await expect(input(page)).toHaveValue('Initial Skeleton draft');
  await input(page).focus(); await toggle(page); await expect(host(page)).toBeFocused();
});

test('Skeleton unmount preserves focus selected outside the region', async ({ page }) => {
  await input(page).focus(); await toggle(page); await button(page, 'Before Skeleton').focus(); await toggle(page, 'K');
  await expect(button(page, 'Before Skeleton')).toBeFocused();
});

test('Skeleton derives avatar, title and paragraph defaults from the enabled parts', async ({ page }) => {
  await check(page, 'Skeleton avatar'); const avatar = preview(page).locator('.ant-skeleton-avatar');
  await expect(avatar).toHaveCSS('width', '40px'); await expect(avatar).toHaveCSS('height', '40px'); await expect(avatar).toHaveCSS('border-radius', '50%');
  await expect(preview(page).locator('li')).toHaveCount(2); await expectRatio(preview(page).locator('.ant-skeleton-title'), preview(page).locator('.ant-skeleton-section'), 0.5);
  await check(page, 'Skeleton paragraph', false); await expect(avatar).toHaveClass(/ant-skeleton-avatar-square/);
  await expect(preview(page).locator('ul')).toHaveCount(0); await setting(page, 'avatar shape', 'circle'); await expect(avatar).toHaveCSS('border-radius', '50%');
  await check(page, 'Skeleton title', false); await expect(preview(page).locator('.ant-skeleton-section')).toHaveCount(0);
});

for (const [size, width] of [['small', 24], ['medium', 32], ['large', 40], ['64', 64]] as const) {
  test(`Skeleton renders ${size} avatar geometry with a square aspect ratio`, async ({ page }) => {
    await check(page, 'Skeleton avatar'); await setting(page, 'avatar size', size);
    const avatar = preview(page).locator('.ant-skeleton-avatar'); await expect(avatar).toHaveCSS('width', `${width}px`); await expect(avatar).toHaveCSS('height', `${width}px`);
    await setting(page, 'provider size', 'small'); await expect(avatar).toHaveCSS('width', `${width}px`);
  });
}

test('Skeleton assigns scalar width to the last row and array widths to their individual rows', async ({ page }) => {
  await page.getByRole('spinbutton', { name: 'Skeleton rows', exact: true }).fill('3');
  await page.getByRole('textbox', { name: 'Skeleton paragraph width', exact: true }).fill('50%');
  const rows = preview(page).locator('li'); const paragraph = preview(page).locator('ul');
  await expectRatio(rows.first(), paragraph, 1); await expectRatio(rows.last(), paragraph, 0.5);
  await check(page, 'Per-row Skeleton widths'); await expect(rows.first()).toHaveCSS('width', '200px');
  await expectRatio(rows.nth(1), paragraph, 0.5); await expect(rows.last()).toHaveCSS('width', '0px');
});

test('Skeleton normalizes zero, fractional, invalid and excessive row counts without stale rows', async ({ page }) => {
  const field = page.getByRole('spinbutton', { name: 'Skeleton rows', exact: true }); const rows = preview(page).locator('li');
  await field.fill('0'); await expect(rows).toHaveCount(0); await field.fill('2.7'); await expect(rows).toHaveCount(2);
  await field.fill('-1'); await expect(rows).toHaveCount(3); await field.fill('1001'); await expect(rows).toHaveCount(1000);
  await field.fill(''); await expect(rows).toHaveCount(3);
});

test('Skeleton supports round shapes, zero title width and loading with every visual part disabled', async ({ page }) => {
  await check(page, 'Round Skeleton'); await expect(preview(page).locator('.ant-skeleton-title')).toHaveCSS('border-radius', '100px');
  await expect(preview(page).locator('li').first()).toHaveCSS('border-radius', '100px');
  await page.getByRole('textbox', { name: 'Skeleton title width', exact: true }).fill('0'); await expect(preview(page).locator('.ant-skeleton-title')).toHaveCSS('width', '0px');
  await check(page, 'Skeleton title', false); await check(page, 'Skeleton paragraph', false); await button(page, 'Start Skeleton loading').click();
  await expect(host(page).locator('.ant-skeleton > *')).toHaveCount(0); await expect(host(page).locator('.loading-status')).toHaveText('Загрузка…');
});

test('Skeleton inherits live locale, labelledby and describedby and supports decorative feedback', async ({ page }) => {
  await button(page, 'Start Skeleton loading').click(); await check(page, 'English locale'); await expect(host(page).locator('.loading-status')).toHaveText('Loading…');
  await check(page, 'Custom Skeleton locale'); await expect(host(page).locator('.loading-status')).toHaveText('Custom skeleton loading');
  await check(page, 'Label Skeleton by owner'); await expect(host(page)).toHaveAccessibleName('Skeleton owner title'); await expect(host(page)).toHaveAttribute('aria-describedby', 'skeleton-hint');
  await check(page, 'Decorative Skeleton'); await expect(host(page)).not.toHaveAttribute('role'); await expect(host(page).locator('.loading-status')).toHaveCount(0);
});

test('Skeleton adapts dark compact tokens and places its avatar on the RTL leading side', async ({ page }, testInfo) => {
  for (const name of ['Skeleton avatar', 'Dark Skeleton theme', 'Compact Skeleton theme', 'Right to left']) await check(page, name);
  const avatar = preview(page).locator('.ant-skeleton-avatar'); const section = preview(page).locator('.ant-skeleton-section');
  await expect(avatar).toHaveCSS('width', '36px'); await expect(avatar).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.12)');
  await expect(preview(page)).toHaveCSS('font-size', '12px'); await expect(preview(page)).toHaveCSS('direction', 'rtl');
  const a = (await avatar.boundingBox())!; const b = (await section.boundingBox())!; expect(a.x).toBeGreaterThan(b.x + b.width);
  await page.locator('#skeleton-fixture .surface').screenshot({ path: testInfo.outputPath('skeleton-dark-rtl.png') });
});

test('Skeleton toggles active animation and dynamically respects reduced motion without remounting', async ({ page }) => {
  const original = await preview(page).locator('.ant-skeleton-title').elementHandle(); await check(page, 'Active Skeleton');
  await expect.poll(() => preview(page).evaluate(node => node.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect.poll(() => preview(page).evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(preview(page).locator('.ant-skeleton-title')).toHaveCSS('background-image', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await expect.poll(() => preview(page).evaluate(node => node.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await check(page, 'Active Skeleton', false); await expect.poll(() => preview(page).evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await preview(page).locator('.ant-skeleton-title').evaluate((node, old) => node === old, original)).toBe(true);
});

test('Skeleton keeps loading feedback available when ConfigProvider disables controls', async ({ page }) => {
  await check(page, 'Disable all components'); await button(page, 'Start Skeleton loading').click();
  await expect(host(page).locator('.ant-skeleton')).toBeVisible(); await expect(host(page).locator('.loading-status')).toHaveText('Загрузка…');
});

for (const kind of ['Modal', 'Drawer']) {
  test(`Skeleton keeps focus and Escape within ${kind} while replacing content`, async ({ page }) => {
    await button(page, `Open Skeleton ${kind}`).click(); const dialog = page.getByRole('dialog', { name: `Skeleton host ${kind.toLowerCase()}`, exact: true });
    const field = dialog.getByRole('textbox', { name: `${kind} Skeleton input`, exact: true }); await field.fill('Removed draft');
    const key = kind === 'Modal' ? 'O' : 'P'; const skeleton = page.locator(kind === 'Modal' ? '#modal-skeleton' : '#drawer-skeleton');
    await toggle(page, key); await expect(skeleton).toBeFocused(); await expect(field).toHaveCount(0);
    await toggle(page, key); await expect(skeleton).toBeFocused(); await page.keyboard.press('Tab'); await expect(field).toBeFocused();
    await expect(field).toHaveValue(`${kind} draft`); await toggle(page, key); await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden(); await expect(button(page, `Open Skeleton ${kind}`)).toBeFocused();
  });
}

test.describe('mobile Skeleton', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('bounds large avatars and widths inside the viewport while preserving square geometry', async ({ page }, testInfo) => {
    await check(page, 'Skeleton avatar'); await setting(page, 'avatar size', '1000');
    await page.getByRole('textbox', { name: 'Skeleton title width', exact: true }).fill('5000px');
    await page.getByRole('textbox', { name: 'Skeleton paragraph width', exact: true }).fill('500%');
    await button(page, 'Start Skeleton loading').tap(); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const node of [preview(page).locator('.ant-skeleton-avatar'), preview(page).locator('.ant-skeleton-title'), preview(page).locator('li').last()]) {
      const box = (await node.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(375);
    }
    const avatar = (await preview(page).locator('.ant-skeleton-avatar').boundingBox())!; expect(Math.abs(avatar.width - avatar.height)).toBeLessThan(1);
    await page.locator('#skeleton-fixture .surface').screenshot({ path: testInfo.outputPath('skeleton-mobile.png') });
    await button(page, 'Finish Skeleton loading').tap(); await expect(input(page)).toBeVisible();
  });
});
