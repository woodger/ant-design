import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-tag');
const toggle = (page: Page) => page.locator('#fixture-checkable-tag');
const close = (page: Page) => host(page).getByRole('button');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const check = (page: Page, name: string, value = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(value);
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Tag ${name}`, exact: true }).selectOption(value);
const output = (page: Page, name: string) => page.getByRole('status', { name, exact: true });
const hotkey = (page: Page, digit: number) => page.keyboard.press(`Control+Alt+Shift+Digit${digit}`);

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174'); await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible(); });

test('Tag renders named content with a native described close button and no announcements', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('group'); await expect(host(page)).toHaveAccessibleName('Fixture tag'); await expect(close(page)).toHaveAccessibleName('Закрыть'); await expect(close(page)).toHaveAccessibleDescription('Frontend');
  await expect(close(page)).toHaveAttribute('type', 'button'); await expect(host(page)).not.toHaveAttribute('tabindex'); await expect(host(page)).not.toHaveAttribute('aria-live'); await expect(host(page).locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await page.locator('#tag-surface').screenshot({ path: testInfo.outputPath('tag-light.png') });
});

test('Tag closes once, restores the next neighbor and does not submit its form', async ({ page }) => {
  await close(page).click(); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Tag')).toBeFocused(); await expect(output(page, 'Tag close count')).toHaveText('1'); await expect(output(page, 'Tag form submissions')).toHaveText('0');
  await setting(page, 'color', 'success'); await expect(host(page)).toHaveCount(0); await button(page, 'Restore Tag').click(); await expect(host(page)).toBeVisible();
});

test('Tag supports native Enter and Space to close without submitting a form', async ({ page }) => {
  for (const [index, key] of ['Enter', 'Space'].entries()) {
    if (index) await button(page, 'Restore Tag').click(); await close(page).focus(); await page.keyboard.press(key); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Tag')).toBeFocused();
  }
  await expect(output(page, 'Tag close count')).toHaveText('2'); await expect(output(page, 'Tag form submissions')).toHaveText('0');
});

test('Tag keeps its content and focused close button when onClose prevents the default', async ({ page }) => {
  await check(page, 'Prevent Tag closing'); await close(page).click(); await expect(host(page)).toBeVisible(); await expect(close(page)).toBeFocused(); await expect(output(page, 'Tag close count')).toHaveText('1');
  await check(page, 'Prevent Tag closing', false); await close(page).click(); await expect(host(page)).toHaveCount(0); await expect(output(page, 'Tag close count')).toHaveText('2');
});

test('Tag stops close activation from bubbling and protects against a reentrant callback', async ({ page }) => {
  await check(page, 'Prevent Tag closing'); await check(page, 'Reenter Tag closing');
  await page.locator('#tag-surface').evaluate(node => { node.setAttribute('data-clicks', '0'); node.addEventListener('click', () => node.setAttribute('data-clicks', String(Number(node.getAttribute('data-clicks')) + 1))); });
  await close(page).click(); await expect(output(page, 'Tag close count')).toHaveText('1'); await expect(page.locator('#tag-surface')).toHaveAttribute('data-clicks', '0'); await expect(host(page)).toBeVisible();
});

test('Tag restores focus when its close control disappears while the label remains', async ({ page }) => {
  await close(page).focus(); await hotkey(page, 2); await expect(host(page)).toBeVisible(); await expect(close(page)).toHaveCount(0); await expect(button(page, 'After Tag')).toBeFocused();
  await button(page, 'Before Tag').focus(); await page.keyboard.press('Tab'); await expect(button(page, 'After Tag')).toBeFocused();
});

test('Tag restores a neighbor after programmatic unmount and preserves an outside focus choice', async ({ page }) => {
  await close(page).focus(); await hotkey(page, 1); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Tag')).toBeFocused();
  await hotkey(page, 1); await close(page).focus(); await button(page, 'Before Tag').focus(); await hotkey(page, 1); await expect(button(page, 'Before Tag')).toBeFocused();
});

test('Tag honors owner focus when its callback removes the entire component', async ({ page }) => {
  await check(page, 'Unmount Tag on close'); await check(page, 'Tag owner focus'); await close(page).click(); await expect(host(page)).toHaveCount(0); await expect(page.getByRole('textbox', { name: 'Tag outside input', exact: true })).toBeFocused(); await expect(output(page, 'Tag close count')).toHaveText('1');
});

test('Tag inherits disabled context and an explicit false enables the close and toggle buttons', async ({ page }) => {
  await check(page, 'Disable all components'); await expect(close(page)).toBeDisabled(); await expect(toggle(page)).toBeDisabled();
  await setting(page, 'disabled mode', 'off'); await expect(close(page)).toBeEnabled(); await expect(toggle(page)).toBeEnabled(); await toggle(page).click(); await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true'); await expect(output(page, 'Tag close count')).toHaveText('0');
});

test('Tag and CheckableTag preserve content and selection while disabled', async ({ page }) => {
  await check(page, 'Parent checked Tag'); await setting(page, 'color', 'error'); await setting(page, 'variant', 'solid'); await setting(page, 'disabled mode', 'on');
  await expect(host(page)).toContainText('Frontend'); await expect(close(page)).toBeDisabled(); await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true'); await expect(toggle(page)).toBeDisabled();
  await close(page).evaluate(node => (node as HTMLButtonElement).click()); await toggle(page).evaluate(node => (node as HTMLButtonElement).click()); await expect(output(page, 'Tag close count')).toHaveText('0'); await expect(output(page, 'CheckableTag changes')).toHaveText('[]');
});

test('Tag applies all preset and status colors without changing content or closing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const colors = new Map<string, string>();
  for (const color of ['default', 'success', 'processing', 'error', 'warning', 'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold']) {
    await setting(page, 'color', color); await expect(host(page)).toHaveClass(new RegExp(`ant-tag-${color}`)); await expect(host(page)).toContainText('Frontend'); colors.set(color, await host(page).evaluate(node => getComputedStyle(node).color));
  }
  expect(colors.get('blue')).not.toBe(colors.get('purple')); expect(colors.get('pink')).toBe('rgb(196, 29, 127)'); expect(colors.get('magenta')).toBe('rgb(196, 29, 127)'); await expect(output(page, 'Tag close count')).toHaveText('0');
});

for (const variant of ['filled', 'outlined', 'solid']) test(`Tag renders the ${variant} variant and preserves its disabled appearance`, async ({ page }) => {
  await setting(page, 'variant', variant); await setting(page, 'color', 'success'); await expect(host(page)).toHaveClass(new RegExp(`ant-tag-${variant}`));
  if (variant === 'solid') await expect(host(page)).toHaveCSS('background-color', 'rgb(82, 196, 26)');
  else await expect(host(page)).toHaveCSS('background-color', 'rgb(246, 255, 237)');
  await setting(page, 'disabled mode', 'on'); await expect(host(page)).toHaveCSS('color', 'rgba(0, 0, 0, 0.25)');
});

test('Tag supports live text, custom decorative icons and escaped markup', async ({ page }) => {
  await check(page, 'Custom Tag icons'); await expect(host(page).locator('.ant-tag-icon')).toHaveAttribute('aria-hidden', 'true'); await expect(host(page).locator('.ant-tag-icon')).toHaveAttribute('inert', ''); await expect(close(page).locator('svg')).toHaveAttribute('viewBox', '0 0 20 20');
  await page.getByRole('textbox', { name: 'Tag text', exact: true }).fill('<img src=x>'); await expect(host(page)).toContainText('<img src=x>'); await expect(host(page).locator('img')).toHaveCount(0); await expect(close(page)).toHaveAccessibleDescription('<img src=x>');
});

test('Tag updates the close label with locale and preserves stable control identity', async ({ page }) => {
  const original = await close(page).elementHandle(); await check(page, 'English locale'); await expect(close(page)).toHaveAccessibleName('Close'); await setting(page, 'variant', 'outlined'); await setting(page, 'color', 'warning');
  expect(await close(page).evaluate((node, old) => node === old, original)).toBe(true); await expect(output(page, 'Tag close count')).toHaveText('0');
});

test('Tag follows dark compact themes RTL and reduced motion', async ({ page }, testInfo) => {
  const light = await host(page).evaluate(node => getComputedStyle(node).backgroundColor);
  await check(page, 'Dark Tag theme'); await check(page, 'Compact Tag theme'); await check(page, 'Right to left'); await expect(host(page)).toHaveAttribute('dir', 'rtl'); await expect(toggle(page)).toHaveAttribute('dir', 'rtl');
  expect(await host(page).evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(light); await expect(host(page)).toHaveCSS('color', 'rgb(105, 177, 255)');
  await setting(page, 'color', 'default'); await setting(page, 'variant', 'solid'); await expect(host(page)).toHaveCSS('color', 'rgb(20, 20, 20)');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(host(page)).toHaveCSS('transition-duration', '0s'); await expect(toggle(page)).toHaveCSS('transition-duration', '0s');
  await page.locator('#tag-surface').screenshot({ path: testInfo.outputPath('tag-dark-compact-rtl.png') });
});

test('Tag wraps long labels on a 320px viewport while keeping its close button reachable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 }); await check(page, 'Custom Tag icons'); await page.getByRole('textbox', { name: 'Tag text', exact: true }).fill('LongUnbrokenTagText'.repeat(16));
  const bounds = await host(page).evaluate(node => ({ right: node.getBoundingClientRect().right, width: node.clientWidth, scroll: node.scrollWidth })); expect(bounds.right).toBeLessThanOrEqual(320); expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
  await page.locator('#tag-surface').screenshot({ path: testInfo.outputPath('tag-mobile.png') }); await close(page).click(); await expect(button(page, 'After Tag')).toBeFocused();
});

test('CheckableTag reports requests without mutating checked until the owner accepts them', async ({ page }) => {
  await check(page, 'Accept CheckableTag changes', false); await toggle(page).click(); await toggle(page).click(); await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false'); await expect(output(page, 'CheckableTag changes')).toHaveText('[true,true]');
  await check(page, 'Parent checked Tag'); await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true'); await expect(output(page, 'CheckableTag changes')).toHaveText('[true,true]');
});

test('CheckableTag toggles through native Enter Space and Tab without submitting a form', async ({ page }) => {
  await button(page, 'Before CheckableTag').focus(); await page.keyboard.press('Tab'); await expect(toggle(page)).toBeFocused(); await page.keyboard.press('Enter'); await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Space'); await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false'); await page.keyboard.press('Tab'); await expect(button(page, 'After CheckableTag')).toBeFocused(); await expect(output(page, 'CheckableTag changes')).toHaveText('[true,false]'); await expect(output(page, 'Tag form submissions')).toHaveText('0');
});

for (const owner of [false, true]) test(`CheckableTag restores ${owner ? 'owner' : 'neighbor'} focus when its callback unmounts it`, async ({ page }) => {
  await check(page, 'Unmount CheckableTag on change'); if (owner) await check(page, 'Tag owner focus'); await toggle(page).click(); await expect(toggle(page)).toHaveCount(0); await expect(owner ? page.getByRole('textbox', { name: 'Tag outside input', exact: true }) : button(page, 'After CheckableTag')).toBeFocused(); await expect(output(page, 'CheckableTag changes')).toHaveText('[true]');
});

test('CheckableTag releases its focus ownership after programmatic unmount', async ({ page }) => {
  await toggle(page).focus(); await hotkey(page, 3); await expect(toggle(page)).toHaveCount(0); await expect(button(page, 'After CheckableTag')).toBeFocused(); await hotkey(page, 3); await toggle(page).focus(); await button(page, 'Before CheckableTag').focus(); await hotkey(page, 3); await expect(button(page, 'Before CheckableTag')).toBeFocused();
});

for (const kind of ['Modal', 'Drawer']) test(`Tag restores focus inside ${kind} after closing and unmount`, async ({ page }) => {
  const opener = button(page, `Open Tag ${kind}`); await opener.click(); const dialog = page.getByRole('dialog', { name: `Tag host ${kind.toLowerCase()}`, exact: true });
  await dialog.getByRole('button', { name: `Close ${kind} tag`, exact: true }).click(); await expect(dialog.getByRole('button', { name: `After ${kind} Tag`, exact: true })).toBeFocused(); await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  await opener.click(); await dialog.getByRole('button', { name: `Close ${kind} tag`, exact: true }).focus(); await hotkey(page, kind === 'Modal' ? 4 : 5); await expect(dialog.getByRole('button', { name: `After ${kind} Tag`, exact: true })).toBeFocused();
});
