import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-result');
const icon = (page: Page) => host(page).locator('.ant-result-icon');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Result ${name}`, exact: true }).selectOption(value);
const check = (page: Page, name: string, checked = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(checked);
const hotkey = (page: Page, key: string) => page.keyboard.press(`Control+Alt+Shift+${key}`);

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=result');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
});

test('Result renders a passive named completion with a semantic heading and decorative icon', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('group'); await expect(host(page)).toHaveAccessibleName('Operation result');
  await expect(host(page)).not.toHaveAttribute('aria-live'); await expect(host(page)).not.toHaveAttribute('tabindex');
  await expect(host(page).getByRole('heading', { name: 'Operation complete', level: 2, exact: true })).toBeVisible();
  await expect(icon(page)).toHaveAttribute('aria-hidden', 'true'); await expect(icon(page)).toHaveAttribute('inert', '');
  await expect(icon(page).locator('svg')).toHaveAttribute('focusable', 'false'); await expect(icon(page).locator('title')).toHaveCount(0);
  await expect(host(page).getByRole('status')).toHaveCount(0); await expect(host(page).getByRole('alert')).toHaveCount(0);
  await page.locator('#result-fixture .surface').screenshot({ path: testInfo.outputPath('result-info-light.png') });
});

for (const [status, color, pathStart, glyph] of [
  ['success', 'rgb(82, 196, 26)', 'M512 64C', 'l71.2 98.8 157.2-218'],
  ['error', 'rgb(255, 77, 79)', 'M512 64c', 'L512 466.745'],
  ['info', 'rgb(22, 119, 255)', 'M512 64C', 'V296zm32 440'],
  ['warning', 'rgb(250, 173, 20)', 'M955.7', 'v184c0 4.4']
]) test(`Result displays the official ${status} icon and theme color`, async ({ page }) => {
  await setting(page, 'status', status); await expect(host(page)).toHaveClass(new RegExp(`ant-result-${status}`));
  await expect(icon(page)).toHaveCSS('color', color); await expect(icon(page).locator('path')).toHaveAttribute('d', new RegExp(`^${pathStart.replace('.', '\\.')}`));
  expect(await icon(page).locator('path').getAttribute('d')).toContain(glyph);
  await expect(icon(page).locator('.anticon')).toHaveCSS('font-size', '72px');
});

for (const [status, width] of [['403', '251'], ['404', '252'], ['500', '254']]) test(`Result preserves the official ${status} illustration for string and numeric statuses`, async ({ page }, testInfo) => {
  await setting(page, 'status', status); const svg = icon(page).locator('svg');
  await expect(svg).toHaveAttribute('viewBox', `0 0 ${width} 294`); await expect(host(page)).toHaveClass(new RegExp(`ant-result-${status}`));
  const geometry = await svg.locator('path').evaluateAll(nodes => nodes.map(node => node.getAttribute('d')));
  await check(page, 'Numeric Result status'); await setting(page, 'icon', 'none'); await expect(svg).toBeVisible();
  await setting(page, 'icon', 'custom'); await expect(svg).toHaveAttribute('viewBox', `0 0 ${width} 294`); await expect(host(page).getByText('Decorative Result control')).toHaveCount(0);
  expect(await svg.locator('path').evaluateAll(nodes => nodes.map(node => node.getAttribute('d')))).toEqual(geometry);
  await expect(svg).toHaveAttribute('aria-hidden', 'true'); await expect(svg.locator('title')).toHaveCount(0);
  await page.locator('#result-fixture .surface').screenshot({ path: testInfo.outputPath(`result-${status}.png`) });
});

test('Result renders rich text at the requested heading level and forwards owner naming', async ({ page }) => {
  await check(page, 'Rich Result text'); await setting(page, 'heading level', '3');
  await expect(host(page).getByRole('heading', { name: 'Operation complete', level: 3, exact: true }).locator('strong')).toBeVisible();
  await expect(host(page).locator('.ant-result-subtitle em')).toHaveText('Your draft has been preserved.');
  await check(page, 'Label Result by owner'); await expect(host(page)).toHaveAccessibleName('Owner completion title'); await expect(host(page)).toHaveAttribute('aria-describedby', 'result-hint');
  await page.getByRole('textbox', { name: 'Result title', exact: true }).fill('<img src=x>');
  await expect(host(page).getByRole('heading', { name: '<img src=x>', exact: true })).toBeVisible(); await expect(host(page).locator('img')).toHaveCount(0);
});

test('Result can hide the icon and empty text independently while retaining its actions', async ({ page }) => {
  await setting(page, 'icon', 'none'); await expect(icon(page)).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Result title', exact: true }).fill(''); await page.getByRole('textbox', { name: 'Result subtitle', exact: true }).fill('');
  await expect(host(page).getByRole('heading')).toHaveCount(0); await expect(host(page).locator('.ant-result-subtitle')).toHaveCount(0);
  await button(page, 'Result primary action').click(); await expect(page.getByRole('status', { name: 'Result action count', exact: true })).toHaveText('1');
});

test('Result keeps custom icons decorative and follows native Tab order through actions and details', async ({ page }) => {
  await setting(page, 'icon', 'custom'); await expect(icon(page).locator('svg')).toHaveAttribute('viewBox', '0 0 72 72');
  await expect(host(page).getByRole('button', { name: 'Decorative Result control', exact: true })).toHaveCount(0);
  await button(page, 'Before Result').focus(); await page.keyboard.press('Tab'); await expect(button(page, 'Result primary action')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByRole('status', { name: 'Result action count', exact: true })).toHaveText('1');
  await page.keyboard.press('Tab'); await expect(button(page, 'Result secondary action')).toBeFocused(); await page.keyboard.press('Tab'); await expect(button(page, 'Remove Result')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(host(page).getByRole('textbox', { name: 'Result retained draft', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(button(page, 'Result details action')).toBeFocused(); await page.keyboard.press('Tab'); await expect(button(page, 'After Result')).toBeFocused();
});

test('Result preserves action identity and draft data while status, theme, and title change', async ({ page }) => {
  const action = await button(page, 'Result primary action').elementHandle(); const draft = host(page).getByRole('textbox', { name: 'Result retained draft', exact: true });
  await draft.fill('Unsaved details'); await button(page, 'Result primary action').click();
  await setting(page, 'status', '404'); await check(page, 'Dark Result theme'); await setting(page, 'status', 'success');
  await page.getByRole('textbox', { name: 'Result title', exact: true }).fill('Updated completion');
  await expect(draft).toHaveValue('Unsaved details'); expect(await button(page, 'Result primary action').evaluate((node, old) => node === old, action)).toBe(true);
  await expect(page.getByRole('status', { name: 'Result action count', exact: true })).toHaveText('1');
});

test('Result restores a following neighbor when its own action removes the component', async ({ page }) => {
  await button(page, 'Remove Result').click(); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Result')).toBeFocused();
});

test('Result restores a neighbor on programmatic unmount and preserves an outside focus choice', async ({ page }) => {
  await button(page, 'Result primary action').focus(); await hotkey(page, 'A'); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Result')).toBeFocused();
  await hotkey(page, 'A'); await button(page, 'Result primary action').focus(); await button(page, 'Before Result').focus(); await hotkey(page, 'A'); await expect(button(page, 'Before Result')).toBeFocused();
});

test('Result respects the owner focus selected in the same update that removes it', async ({ page }) => {
  await check(page, 'Result owner focus'); await button(page, 'Remove Result').click();
  await expect(page.getByRole('textbox', { name: 'Result outside input', exact: true })).toBeFocused();
});

test('Result moves to the remaining action when the focused action disappears', async ({ page }) => {
  await button(page, 'Result primary action').focus(); await hotkey(page, 'B'); await expect(button(page, 'Result primary action')).toHaveCount(0); await expect(button(page, 'Result secondary action')).toBeFocused();
});

test('Result recovers focus in retained details when all extra actions disappear', async ({ page }) => {
  const draft = host(page).getByRole('textbox', { name: 'Result retained draft', exact: true }); await draft.fill('Still here');
  await button(page, 'Result primary action').focus(); await hotkey(page, 'C'); await expect(host(page).locator('.ant-result-extra')).toHaveCount(0); await expect(draft).toBeFocused(); await expect(draft).toHaveValue('Still here');
});

test('Result restores a neighbor when every action disappears and releases previous focus ownership', async ({ page }) => {
  await check(page, 'Result details', false); await button(page, 'Result primary action').focus(); await hotkey(page, 'C'); await expect(button(page, 'After Result')).toBeFocused();
  await button(page, 'Before Result').focus(); await hotkey(page, 'A'); await expect(button(page, 'Before Result')).toBeFocused();
});

for (const kind of ['Modal', 'Drawer']) {
  test(`Result restores focus inside ${kind} when its action removes it`, async ({ page }) => {
    const opener = button(page, `Open Result ${kind}`); await opener.click(); const dialog = page.getByRole('dialog', { name: `Result host ${kind.toLowerCase()}`, exact: true });
    await dialog.getByRole('button', { name: `Finish ${kind} Result`, exact: true }).click(); await expect(dialog.locator('.ant-result')).toHaveCount(0); await expect(dialog.getByRole('button', { name: `After ${kind} Result`, exact: true })).toBeFocused();
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  });
  test(`Result recovers within the ${kind} trap after programmatic removal`, async ({ page }) => {
    await button(page, `Open Result ${kind}`).click(); const dialog = page.getByRole('dialog', { name: `Result host ${kind.toLowerCase()}`, exact: true });
    await dialog.getByRole('button', { name: `Finish ${kind} Result`, exact: true }).focus(); await hotkey(page, kind === 'Modal' ? 'D' : 'F'); await expect(dialog.getByRole('button', { name: `After ${kind} Result`, exact: true })).toBeFocused();
    await page.keyboard.press('Tab'); await expect.poll(() => dialog.evaluate(node => !node.ownerDocument.hasFocus() || node.contains(node.ownerDocument.activeElement))).toBe(true);
  });
}

test('Result follows dark compact tokens and RTL without adding motion or changing exception paint', async ({ page }, testInfo) => {
  await setting(page, 'status', 'success'); const title = host(page).getByRole('heading', { name: 'Operation complete', exact: true }); const light = await title.evaluate(node => getComputedStyle(node).color);
  await check(page, 'Dark Result theme'); await check(page, 'Compact Result theme'); await check(page, 'Right to left');
  await expect(host(page)).toHaveAttribute('dir', 'rtl'); await expect(host(page)).toHaveClass(/ant-result-rtl/); await expect(host(page)).toHaveCSS('direction', 'rtl');
  expect(await title.evaluate(node => getComputedStyle(node).color)).not.toBe(light); await expect(icon(page)).toHaveCSS('color', 'rgb(82, 196, 26)');
  await page.emulateMedia({ reducedMotion: 'reduce' }); expect(await host(page).evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await setting(page, 'status', '500'); await expect(icon(page).locator('path').first()).toHaveAttribute('fill', '#E4EBF7');
  await page.locator('#result-fixture .surface').screenshot({ path: testInfo.outputPath('result-dark-compact-rtl.png') });
});

test('Result wraps long text and actions with every illustration on a 320px viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole('textbox', { name: 'Result title', exact: true }).fill('LongUnbrokenCompletionTitle'.repeat(8));
  await page.getByRole('textbox', { name: 'Result subtitle', exact: true }).fill('LongUnbrokenCompletionDescription'.repeat(12));
  for (const status of ['warning', '403', '404', '500']) {
    await setting(page, 'status', status); const bounds = await host(page).evaluate(node => ({ host: node.getBoundingClientRect().width, width: node.clientWidth, scroll: node.scrollWidth, svg: node.querySelector('svg')!.getBoundingClientRect().width }));
    expect(bounds.host).toBeLessThanOrEqual(272); expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1); expect(bounds.svg).toBeLessThanOrEqual(bounds.width);
  }
  await page.locator('#result-fixture .surface').screenshot({ path: testInfo.outputPath('result-mobile.png') });
});

test('Result example cancels pending completion when unmounted and starts a fresh form on remount', async ({ page }) => {
  await button(page, 'Toggle Result example').click(); const example = page.locator('#result-example-fixture');
  await example.getByRole('button', { name: 'Отправить заявку', exact: true }).click(); await expect(example.getByRole('form', { name: 'Заявка Result', exact: true })).toHaveAttribute('aria-busy', 'true');
  await button(page, 'Toggle Result example').click(); await button(page, 'Toggle Result example').click(); await page.waitForTimeout(850);
  await expect(example.getByRole('status', { name: 'Результат примера Result', exact: true })).toHaveText('Состояние: editing. Действий: 0.');
  await expect(example.getByRole('textbox', { name: 'Имя в заявке' })).toHaveValue('Анна'); await expect(example.getByRole('region', { name: 'Результат отправки заявки', exact: true })).toHaveCount(0);
});
