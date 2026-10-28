import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-empty');
const image = (page: Page) => host(page).locator('.ant-empty-image');
const footer = (page: Page) => host(page).locator('.ant-empty-footer');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Empty ${name}`, exact: true }).selectOption(value);
const check = (page: Page, name: string, checked = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(checked);
const hotkey = (page: Page, key: string) => page.keyboard.press(`Control+Alt+Shift+${key}`);

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
});

test('Empty renders a passive named state with decorative default SVG and native actions', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('group'); await expect(host(page)).toHaveAccessibleName('Empty records');
  await expect(host(page)).not.toHaveAttribute('aria-live'); await expect(host(page)).not.toHaveAttribute('tabindex');
  await expect(image(page)).toHaveAttribute('inert', ''); await expect(image(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(image(page).locator('svg')).toHaveAttribute('viewBox', '0 0 184 152'); await expect(image(page)).toHaveCSS('height', '100px');
  await expect(host(page).locator('.ant-empty-description')).toHaveText('No records'); await expect(host(page).getByRole('status')).toHaveCount(0);
  await button(page, 'Before Empty').focus(); await page.keyboard.press('Tab'); await expect(button(page, 'Empty primary action')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByRole('status', { name: 'Empty actions count', exact: true })).toHaveText('1');
  await page.locator('#empty-fixture .surface').screenshot({ path: testInfo.outputPath('empty-light.png') });
});

test('Empty switches default and simple SVG without replacing its action or draft state', async ({ page }) => {
  const original = await button(page, 'Empty primary action').elementHandle(); await button(page, 'Empty primary action').click();
  await setting(page, 'image', 'simple'); await expect(host(page)).toHaveClass(/ant-empty-normal/); await expect(image(page)).toHaveCSS('height', '40px');
  await expect(image(page).locator('svg')).toHaveAttribute('viewBox', '0 0 64 41');
  await setting(page, 'image', 'default'); await expect(host(page)).not.toHaveClass(/ant-empty-normal/);
  await expect(page.getByRole('status', { name: 'Empty actions count', exact: true })).toHaveText('1');
  expect(await button(page, 'Empty primary action').evaluate((node, old) => node === old, original)).toBe(true);
});

test('Empty keeps built-in paint IDs unique across instances and resolves every local reference', async ({ page }) => {
  const result = await page.locator('#empty-fixture .surface').evaluate(node => {
    const ids = [...node.querySelectorAll('pattern[id]')].map(pattern => pattern.id);
    const references = [...node.querySelectorAll('[fill], [stroke]')].flatMap(element => ['fill', 'stroke'].map(attribute => element.getAttribute(attribute))).filter(value => value?.startsWith('url(#')).map(value => value!.slice(5, -1));
    return { ids, references };
  });
  expect(result.ids).toHaveLength(7); expect(new Set(result.ids).size).toBe(7);
  for (const reference of result.references) expect(result.ids).toContain(reference);
});

test('Empty supports inert custom image snippets and rich descriptions', async ({ page }) => {
  await setting(page, 'image', 'custom'); await setting(page, 'description mode', 'rich');
  await expect(image(page).locator('svg')).toHaveAttribute('viewBox', '0 0 120 80'); await expect(image(page).locator('pattern')).toHaveCount(0);
  await expect(host(page).locator('.ant-empty-description strong')).toHaveText('No records'); await expect(host(page).locator('.ant-empty-description')).toContainText('Rich empty details');
  await expect(host(page).getByRole('link', { name: 'Decorative image link', exact: true })).toHaveCount(0);
  await button(page, 'Before Empty').focus(); await page.keyboard.press('Tab'); await expect(button(page, 'Empty primary action')).toBeFocused();
});

test('Empty independently hides its image, description and footer', async ({ page }) => {
  await setting(page, 'image', 'none'); await expect(image(page)).toHaveCount(0); await expect(host(page).locator('.ant-empty-description')).toBeVisible();
  await setting(page, 'description mode', 'none'); await expect(host(page).locator('.ant-empty-description')).toHaveCount(0); await expect(footer(page)).toBeVisible();
  await check(page, 'Empty actions', false); await expect(footer(page)).toHaveCount(0); await expect(host(page)).toBeAttached();
});

test('Empty escapes changing descriptions without recreating the focused action', async ({ page }) => {
  const original = await button(page, 'Empty primary action').elementHandle();
  await page.getByRole('textbox', { name: 'Empty description', exact: true }).fill('<script>Unsafe</script>');
  await expect(host(page).locator('.ant-empty-description')).toHaveText('<script>Unsafe</script>'); await expect(host(page).locator('script')).toHaveCount(0);
  expect(await button(page, 'Empty primary action').evaluate((node, old) => node === old, original)).toBe(true);
});

test('Empty restores focus to the next available neighbor when its own action removes the component', async ({ page }) => {
  await button(page, 'Remove Empty').click(); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Empty')).toBeFocused();
  await button(page, 'Toggle Empty mount').click(); await expect(button(page, 'Empty primary action')).toBeVisible();
  await button(page, 'Empty primary action').focus(); await hotkey(page, 'E'); await expect(button(page, 'After Empty')).toBeFocused();
});

test('Empty respects the owner focus selected in the same update that removes the component', async ({ page }) => {
  await check(page, 'Empty owner focus'); await button(page, 'Remove Empty').click(); await expect(host(page)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Empty outside input', exact: true })).toBeFocused();
});

test('Empty preserves an outside focus choice when unmounted programmatically', async ({ page }) => {
  await button(page, 'Empty primary action').focus(); await button(page, 'Before Empty').focus(); await hotkey(page, 'E');
  await expect(button(page, 'Before Empty')).toBeFocused();
});

test('Empty recovers focus within a retained footer when its focused action is removed', async ({ page }) => {
  await button(page, 'Empty primary action').focus(); await hotkey(page, 'R'); await expect(button(page, 'Empty primary action')).toHaveCount(0);
  await expect(button(page, 'Empty secondary action')).toBeFocused();
});

test('Empty restores a neighbor when all footer actions are removed and releases its previous focus ownership', async ({ page }) => {
  await button(page, 'Empty primary action').focus(); await hotkey(page, 'T'); await expect(footer(page)).toHaveCount(0);
  await expect(button(page, 'After Empty')).toBeFocused(); await button(page, 'Before Empty').focus(); await hotkey(page, 'E');
  await expect(button(page, 'Before Empty')).toBeFocused();
});

test('Empty inherits live locale while preserving explicit descriptions and owner labels', async ({ page }) => {
  await setting(page, 'description mode', 'locale'); await expect(host(page).locator('.ant-empty-description')).toHaveText('Нет данных');
  await check(page, 'English locale'); await expect(host(page).locator('.ant-empty-description')).toHaveText('No data');
  await check(page, 'Custom Empty locale'); await expect(host(page).locator('.ant-empty-description')).toHaveText('Custom empty description');
  await setting(page, 'description mode', 'text'); await expect(host(page).locator('.ant-empty-description')).toHaveText('No records');
  await check(page, 'Label Empty by owner'); await expect(host(page)).toHaveAccessibleName('Empty owner title'); await expect(host(page)).toHaveAttribute('aria-describedby', 'empty-hint');
});

test('Empty follows dark compact tokens and RTL without regenerating its SVG paint IDs', async ({ page }, testInfo) => {
  const ids = await image(page).locator('pattern').evaluateAll(nodes => nodes.map(node => node.id));
  for (const name of ['Dark Empty theme', 'Compact Empty theme', 'Right to left']) await check(page, name);
  await expect(host(page)).toHaveCSS('direction', 'rtl'); await expect(host(page)).toHaveCSS('font-size', '12px'); await expect(image(page)).toHaveCSS('height', '90px');
  await expect(image(page).locator('pattern rect').first()).toHaveCSS('fill', 'rgb(20, 20, 20)');
  expect(await image(page).locator('pattern').evaluateAll(nodes => nodes.map(node => node.id))).toEqual(ids);
  await setting(page, 'image', 'simple'); await expect(image(page)).toHaveCSS('height', '36px');
  await page.locator('#empty-fixture .surface').screenshot({ path: testInfo.outputPath('empty-dark-rtl.png') });
});

test('Empty remains static under reduced motion and keeps its feedback available in a disabled context', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await check(page, 'Disable all components');
  await expect(image(page)).toBeVisible(); await expect(host(page).locator('.ant-empty-description')).toHaveText('No records');
  expect(await host(page).evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const kind of ['Modal', 'Drawer']) {
  test(`Empty restores focus inside ${kind} on removal and leaves Escape to its host`, async ({ page }) => {
    await button(page, `Open Empty ${kind}`).click(); const dialog = page.getByRole('dialog', { name: `Empty host ${kind.toLowerCase()}`, exact: true });
    await dialog.getByRole('button', { name: `Fill ${kind} Empty`, exact: true }).click();
    await expect(dialog.getByText(`${kind} content loaded`, { exact: true })).toBeVisible(); await expect(dialog.getByRole('button', { name: `After ${kind} Empty`, exact: true })).toBeFocused();
    await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); await expect(button(page, `Open Empty ${kind}`)).toBeFocused();
  });
}

test.describe('mobile Empty', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('wraps long descriptions and footer actions without widening the page', async ({ page }, testInfo) => {
    await page.getByRole('textbox', { name: 'Empty description', exact: true }).fill('VeryLongEmptyDescriptionWithoutSpaces'.repeat(8));
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const imageBox = (await image(page).boundingBox())!; expect(imageBox.x).toBeGreaterThanOrEqual(0); expect(imageBox.x + imageBox.width).toBeLessThanOrEqual(375);
    await page.locator('#empty-fixture .surface').screenshot({ path: testInfo.outputPath('empty-mobile.png') });
    await button(page, 'Empty primary action').tap(); await expect(page.getByRole('status', { name: 'Empty actions count', exact: true })).toHaveText('1');
  });
});
