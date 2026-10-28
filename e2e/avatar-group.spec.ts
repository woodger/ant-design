import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-avatar-group');
const avatars = (page: Page) => host(page).locator(':scope > .ant-avatar');
const more = (page: Page) => host(page).getByRole('button');
const popup = (page: Page) => page.getByRole('dialog', { name: 'Скрытые участники', exact: true });
const check = (page: Page, name: string, value = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(value);
const number = (page: Page, name: string, value: string) => page.getByRole('spinbutton', { name: `AvatarGroup ${name}`, exact: true }).fill(value);
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `AvatarGroup ${name}`, exact: true }).selectOption(value);
const hotkey = (page: Page, key: string) => page.keyboard.press(`Control+Alt+Shift+${key}`);

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174'); await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible(); });

test('AvatarGroup names its visible members and counts overflow separately', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('group'); await expect(host(page)).toHaveAccessibleName('Участники'); await expect(host(page)).toHaveAccessibleDescription('Project members'); await expect(avatars(page)).toHaveCount(2); await expect(avatars(page).first()).toHaveAccessibleName('Анна'); await expect(more(page)).toHaveAccessibleName('Ещё участников: 3'); await expect(more(page)).toHaveAttribute('type', 'button'); await expect(more(page)).toHaveAttribute('aria-haspopup', 'dialog'); await expect(more(page)).toHaveAttribute('aria-expanded', 'false'); await expect(host(page)).not.toHaveAttribute('tabindex'); await expect(host(page).locator('[aria-live], [role="status"]')).toHaveCount(0);
  await page.locator('#avatar-group-surface').screenshot({ path: testInfo.outputPath('avatar-group-light.png') });
});

test('AvatarGroup opens a named list with native Enter Space and Escape without submitting', async ({ page }) => {
  await setting(page, 'trigger', 'click');
  for (const key of ['Enter', 'Space']) { await page.getByRole('button', { name: 'Before AvatarGroup', exact: true }).focus(); await page.keyboard.press('Tab'); await expect(more(page)).toBeFocused(); await page.keyboard.press(key); await expect(popup(page)).toBeVisible(); await expect(popup(page)).toBeFocused(); await expect(popup(page).getByRole('listitem')).toHaveCount(3); await expect(popup(page)).toContainText('Вера'); await expect(popup(page)).toContainText('Елена'); await expect(popup(page)).toContainText('Игорь'); await page.keyboard.press('Escape'); await expect(more(page)).toBeFocused(); await expect(popup(page)).toHaveCount(0); }
  await expect(page.getByRole('status', { name: 'Group submissions', exact: true })).toHaveText('0');
});

test('AvatarGroup loads hidden images only while the overflow is open and clears hidden content on close', async ({ page }) => {
  let requests = 0; await page.route('**/avatar-group-lazy.svg', route => { requests++; return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="blue"/></svg>' }); });
  await check(page, 'Lazy group image'); await expect(host(page).locator('[src="/avatar-group-lazy.svg"]')).toHaveCount(0); expect(requests).toBe(0); await more(page).click(); await expect(popup(page).locator('img')).toBeVisible(); await expect.poll(() => requests).toBe(1); await page.keyboard.press('Escape'); await expect(host(page).locator('.ant-avatar-group-list')).toHaveCount(0); await more(page).click(); await expect(popup(page).getByRole('listitem')).toHaveCount(3);
});

test('AvatarGroup supports default hover and configured focus opening without moving outside focus', async ({ page }) => {
  await more(page).hover(); await expect(popup(page)).toBeVisible(); await page.mouse.move(0, 0); await expect(popup(page)).toHaveCount(0); await setting(page, 'trigger', 'focus'); await more(page).focus(); await expect(popup(page)).toBeVisible(); await expect(more(page)).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'After AvatarGroup', exact: true })).toBeFocused(); await expect(popup(page)).toHaveCount(0);
});

test('AvatarGroup closes on outside activation and preserves the outside input focus', async ({ page }) => {
  await more(page).click(); await expect(popup(page)).toBeFocused(); const outside = page.getByRole('textbox', { name: 'Group outside input', exact: true }); await outside.click(); await expect(outside).toBeFocused(); await expect(popup(page)).toHaveCount(0); await expect(more(page)).toHaveAttribute('aria-expanded', 'false');
});

test('AvatarGroup preserves the overflow button and popup focus while items reorder', async ({ page }) => {
  const original = await more(page).elementHandle(); await more(page).click(); await hotkey(page, 'Backslash'); await expect(popup(page)).toBeFocused(); await expect(avatars(page).first()).toHaveAccessibleName('Игорь'); await expect(popup(page).getByRole('listitem').last()).toContainText('Анна'); expect(await more(page).evaluate((node, previous) => node === previous, original)).toBe(true); await page.keyboard.press('Escape'); await expect(more(page)).toBeFocused();
});

test('AvatarGroup preserves keyed avatar identity and an existing image failure through reordering', async ({ page }) => {
  await number(page, 'limit', '0'); await check(page, 'Broken group image'); await expect(page.getByRole('status', { name: 'Group image errors', exact: true })).toHaveText('1'); const anna = host(page).getByRole('img', { name: 'Анна', exact: true }); const original = await anna.elementHandle(); await hotkey(page, 'Backslash'); expect(await anna.evaluate((node, previous) => node === previous, original)).toBe(true); await expect(anna.locator('.ant-avatar-string')).toHaveText('АН'); await expect(page.getByRole('status', { name: 'Group image errors', exact: true })).toHaveText('1');
});

test('AvatarGroup releases focus to a neighbor when the limit removes an open overflow', async ({ page }) => {
  await setting(page, 'trigger', 'click');
  await more(page).click(); await expect(popup(page)).toBeFocused(); await hotkey(page, 'BracketLeft'); await expect(more(page)).toHaveCount(0); await expect(avatars(page)).toHaveCount(5); await expect(page.getByRole('button', { name: 'After AvatarGroup', exact: true })).toBeFocused(); await hotkey(page, 'BracketLeft'); await expect(more(page)).toHaveAttribute('aria-expanded', 'false'); await expect(popup(page)).toHaveCount(0);
});

test('AvatarGroup recovers focus when a focused overflow disappears with every member', async ({ page }) => {
  await more(page).focus(); await hotkey(page, 'Semicolon'); await expect(avatars(page)).toHaveCount(0); await expect(more(page)).toHaveCount(0); await expect(page.getByRole('button', { name: 'After AvatarGroup', exact: true })).toBeFocused();
});

test('AvatarGroup restores a neighbor after unmount and respects an owner focus choice', async ({ page }) => {
  await more(page).click(); await hotkey(page, 'BracketRight'); await expect(host(page)).toHaveCount(0); await expect(page.getByRole('button', { name: 'After AvatarGroup', exact: true })).toBeFocused(); await expect(page.locator('.ant-avatar-group-popover:popover-open')).toHaveCount(0);
  await hotkey(page, 'BracketRight'); await check(page, 'Group owner focus'); await more(page).click(); await hotkey(page, 'BracketRight'); await expect(page.getByRole('textbox', { name: 'Group outside input', exact: true })).toBeFocused();
});

test('AvatarGroup keeps an outside focus choice when an inactive group unmounts', async ({ page }) => {
  const outside = page.getByRole('textbox', { name: 'Group outside input', exact: true }); await more(page).focus(); await outside.focus(); await hotkey(page, 'BracketRight'); await expect(host(page)).toHaveCount(0); await expect(outside).toBeFocused();
});

test('AvatarGroup applies count boundaries after deduplication', async ({ page }) => {
  await page.getByRole('button', { name: 'Duplicate fixture members', exact: true }).click(); await expect(avatars(page)).toHaveCount(2); await expect(more(page)).toHaveAccessibleName('Ещё участников: 3');
  for (const count of ['0', '-1', '5', '100', '']) { await number(page, 'limit', count); await expect(avatars(page)).toHaveCount(5); await expect(more(page)).toHaveCount(0); }
  await number(page, 'limit', '0.5'); await expect(avatars(page)).toHaveCount(1); await expect(more(page)).toHaveAccessibleName('Ещё участников: 4');
});

test('AvatarGroup inherits context and group geometry and preserves individual overrides in its popup', async ({ page }) => {
  await setting(page, 'context size', 'small'); await expect(avatars(page).first()).toHaveCSS('width', '24px'); await setting(page, 'size', 'large'); await setting(page, 'shape', 'square'); await check(page, 'Individual group overrides'); await expect(avatars(page).first()).toHaveCSS('width', '24px'); await expect(avatars(page).first()).toHaveCSS('border-radius', '50%'); await expect(avatars(page).nth(1)).toHaveCSS('width', '40px'); await expect(avatars(page).nth(1)).toHaveCSS('border-radius', '8px'); await expect(more(page).locator('.ant-avatar')).toHaveCSS('width', '40px'); await more(page).click(); await expect(popup(page).locator('.ant-avatar').first()).toHaveCSS('width', '40px'); await expect(popup(page).locator('.ant-avatar').first()).toHaveCSS('border-radius', '8px');
});

test('AvatarGroup supports numeric sizes overflow styling and rich inert item snippets', async ({ page }) => {
  await setting(page, 'size', 'custom'); await number(page, 'numeric size', '50'); await check(page, 'Rich group fallback'); await expect(avatars(page).nth(1).locator('strong')).toHaveText('Rich fallback'); await page.getByRole('textbox', { name: 'AvatarGroup overflow style', exact: true }).fill('background: rgb(114, 46, 209); color: white'); await expect(more(page).locator('.ant-avatar')).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await check(page, 'Interactive group icon'); await more(page).click(); await expect(popup(page).getByRole('button', { name: 'Inert group icon', exact: true })).toHaveCount(0); await popup(page).locator('.ant-avatar-icon-content button').evaluate(node => (node as HTMLButtonElement).focus()); await expect(popup(page)).toBeFocused();
});

test('AvatarGroup updates nested locale names counts and description references', async ({ page }) => {
  await check(page, 'English locale'); await expect(host(page)).toHaveAccessibleName('Members'); await expect(more(page)).toHaveAccessibleName('More members: 3'); await more(page).click(); await expect(page.getByRole('dialog', { name: 'Hidden members', exact: true })).toBeVisible(); await page.keyboard.press('Escape');
  const partial = page.locator('#partial-locale-group'); await expect(partial).toHaveAccessibleName('Members'); await partial.getByRole('button').click(); await expect(page.getByRole('dialog', { name: 'Custom hidden members', exact: true })).toBeVisible(); await page.keyboard.press('Escape'); await check(page, 'Linked group name'); await expect(host(page)).toHaveAccessibleName('External team');
});

test('AvatarGroup preserves logical overlap and applies a theme-colored border in RTL', async ({ page }, testInfo) => {
  const first = await avatars(page).first().boundingBox(); const second = await avatars(page).nth(1).boundingBox(); expect(second!.x - first!.x).toBeCloseTo(24, 0); await check(page, 'Dark AvatarGroup theme'); await check(page, 'Compact AvatarGroup theme'); await check(page, 'Right to left'); await expect(host(page)).toHaveAttribute('dir', 'rtl'); await expect(avatars(page).first()).toHaveCSS('border-color', 'rgb(20, 20, 20)');
  const rtlFirst = await avatars(page).first().boundingBox(); const rtlSecond = await avatars(page).nth(1).boundingBox(); expect(rtlFirst!.x - rtlSecond!.x).toBeCloseTo(24, 0); await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(more(page)).toHaveCSS('animation-name', 'none'); await page.locator('#avatar-group-surface').screenshot({ path: testInfo.outputPath('avatar-group-dark-compact-rtl.png') });
});

test('AvatarGroup keeps its disclosure available when surrounding components are disabled', async ({ page }) => {
  await check(page, 'Disable all components'); await expect(more(page)).toBeEnabled(); await more(page).click(); await expect(popup(page)).toBeVisible();
});

for (const kind of ['Modal', 'Drawer']) test(`AvatarGroup restores focus inside ${kind} after the group disappears`, async ({ page }) => {
  const opener = page.getByRole('button', { name: `Open group ${kind}`, exact: true }); await opener.click(); const dialog = page.getByRole('dialog', { name: `Group host ${kind.toLowerCase()}`, exact: true }); const group = dialog.getByRole('group', { name: `${kind} team`, exact: true }); await group.getByRole('button').click(); await expect(popup(page)).toBeFocused(); await page.keyboard.press('Escape'); await expect(group.getByRole('button')).toBeFocused();
  await group.getByRole('button').click(); await hotkey(page, 'BracketRight'); await expect(group).toHaveCount(0); await expect(dialog.getByRole('button', { name: `After ${kind} group`, exact: true })).toBeFocused(); await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
});

test('AvatarGroup wraps a full mobile roster and keeps long hidden names within its popup', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 }); await page.getByRole('button', { name: 'Add many group members', exact: true }).click(); await number(page, 'limit', '0');
  const bounds = await host(page).evaluate(node => ({ left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right, width: node.clientWidth, scroll: node.scrollWidth })); expect(bounds.left).toBeGreaterThanOrEqual(0); expect(bounds.right).toBeLessThanOrEqual(320); expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1); await page.locator('#avatar-group-surface').screenshot({ path: testInfo.outputPath('avatar-group-mobile.png') }); await number(page, 'limit', '2'); await more(page).click(); await expect(popup(page).getByRole('listitem')).toHaveCount(18); const box = await popup(page).boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(320);
});
