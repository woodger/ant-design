import type { Page } from '@playwright/test';
import { test, expect } from './test';

const trigger = (page: Page) => page.getByRole('button', { name: 'Dropdown trigger', exact: true });
const menu = (page: Page, name = 'Dropdown trigger') => page.getByRole('menu', { name, exact: true });
const command = (page: Page, name: string) => menu(page).getByRole('menuitem', { name, exact: true });
const status = (page: Page, name: string) => page.getByRole('status', { name: `Dropdown ${name}`, exact: true });
async function mode(page: Page, value: string) { await page.getByRole('combobox', { name: 'Dropdown mode', exact: true }).selectOption(value); }
async function freeze(page: Page) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=dropdown');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Dropdown exposes a native menu button, named commands and a separator', async ({ page }, testInfo) => {
  await trigger(page).click();
  await expect(menu(page)).toBeVisible();
  await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'menu');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger(page)).toHaveAccessibleDescription('Owner menu help.');
  const id = await menu(page).getAttribute('id');
  expect((await trigger(page).getAttribute('aria-controls'))?.split(' ')).toEqual(['dropdown-owner-controls', id]);
  await expect(command(page, 'Open')).toBeFocused();
  await expect(command(page, 'Export')).toBeDisabled();
  await expect(menu(page).getByRole('separator')).toHaveCount(1);
  await expect(command(page, 'Report').locator('strong')).toHaveText('Report');
  await expect(menu(page).getByTestId('dropdown-icon')).toBeVisible();
  await expect(status(page, 'changes')).toHaveText('[true]');
  await page.screenshot({ path: testInfo.outputPath('dropdown-light.png') });
});

test('Dropdown navigates eligible commands with wrapping arrows, Home and End', async ({ page }) => {
  await trigger(page).press('ArrowDown');
  await expect(command(page, 'Open')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(command(page, 'Rename')).toBeFocused();
  await page.keyboard.press('End');
  await expect(command(page, 'Archive')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(command(page, 'Open')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(command(page, 'Archive')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(command(page, 'Open')).toBeFocused();
  await expect(menu(page).locator('[role="menuitem"][tabindex="0"]')).toHaveCount(1);
});

test('Dropdown opens at the last command with ArrowUp and restores focus with Escape', async ({ page }) => {
  await trigger(page).press('ArrowUp');
  await expect(command(page, 'Archive')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(status(page, 'changes')).toHaveText('[true,false]');
});

for (const key of ['Enter', 'Space']) {
  test(`Dropdown activates through ${key}, emits item before menu and never submits the form`, async ({ page }) => {
    await trigger(page).press(key);
    await expect(command(page, 'Open')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press(key);
    await expect(menu(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    await expect(status(page, 'open')).toHaveText('false');
    await expect(status(page, 'events')).toHaveText('["item:rename","menu:rename"]');
    await expect(status(page, 'changes')).toHaveText('[true]');
    await expect(status(page, 'submissions')).toHaveText('0');
  });
}

test('Dropdown activates the empty-string key and an unusual key without selector errors', async ({ page }) => {
  await page.getByLabel('Special Dropdown key', { exact: true }).check();
  await trigger(page).click();
  await command(page, 'Open').click();
  await expect(menu(page)).toBeHidden();
  await expect(status(page, 'events')).toHaveText('["menu:"]');
  await trigger(page).press('ArrowUp');
  await expect(command(page, 'Archive')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(status(page, 'events')).toHaveText(JSON.stringify(['menu:', 'menu:"[odd]# key']));
});

test('Dropdown typeahead cycles repeated letters, refines prefixes and resets after a pause', async ({ page }) => {
  await freeze(page);
  await trigger(page).press('ArrowDown');
  await page.clock.runFor(20);
  await page.keyboard.press('r');
  await expect(command(page, 'Rename')).toBeFocused();
  await page.keyboard.press('r');
  await expect(command(page, 'Report')).toBeFocused();
  await page.clock.runFor(1100);
  await page.keyboard.type('ren');
  await expect(command(page, 'Rename')).toBeFocused();
  await page.clock.runFor(1100);
  await page.keyboard.press('a');
  await expect(command(page, 'Archive')).toBeFocused();
  await page.clock.runFor(1100);
  await page.keyboard.press('z');
  await expect(command(page, 'Archive')).toBeFocused();
  await expect(status(page, 'events')).toHaveText('[]');
});

test('Dropdown closes on Tab or ShiftTab and keeps normal document focus order', async ({ page }) => {
  await trigger(page).press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await expect(menu(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'After Dropdown', exact: true })).toBeFocused();
  await trigger(page).press('ArrowUp');
  await page.keyboard.press('Shift+Tab');
  await expect(menu(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(status(page, 'changes')).toHaveText('[true,false,true,false]');
});

test('Dropdown closes on outside click or second trigger click and preserves the outside focus', async ({ page }) => {
  await trigger(page).click();
  await trigger(page).click();
  await expect(menu(page)).toBeHidden();
  await trigger(page).click();
  const after = page.getByRole('button', { name: 'After Dropdown', exact: true });
  await after.click();
  await expect(menu(page)).toBeHidden();
  await expect(after).toBeFocused();
  await expect(status(page, 'changes')).toHaveText('[true,false,true,false]');
});

test('Dropdown respects cancellation on trigger, item and menu clicks', async ({ page }) => {
  await page.getByLabel('Cancel Dropdown trigger click', { exact: true }).check();
  await trigger(page).click();
  await expect(menu(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[]');
  await page.getByLabel('Cancel Dropdown trigger click', { exact: true }).uncheck();
  await page.getByLabel('Prevent Dropdown item click', { exact: true }).check();
  await trigger(page).click();
  await command(page, 'Rename').click();
  await expect(menu(page)).toBeVisible();
  await expect(command(page, 'Rename')).toBeFocused();
  await expect(status(page, 'events')).toHaveText('["item:rename"]');
  await page.keyboard.press('Escape');
  await page.getByLabel('Prevent Dropdown item click', { exact: true }).uncheck();
  await page.getByLabel('Prevent Dropdown menu click', { exact: true }).check();
  await trigger(page).click();
  await command(page, 'Rename').click();
  await expect(menu(page)).toBeVisible();
  await expect(status(page, 'events')).toHaveText('["item:rename","item:rename","menu:rename"]');
});

test('Dropdown hover delays cancel, preserve focus and retain the menu under the pointer', async ({ page }) => {
  await freeze(page);
  await mode(page, 'hover');
  const before = page.getByRole('button', { name: 'Before Dropdown', exact: true });
  await before.focus();
  await trigger(page).hover();
  await page.clock.runFor(99);
  await expect(menu(page)).toBeHidden();
  await page.clock.runFor(1);
  await expect(menu(page)).toBeVisible();
  await expect(before).toBeFocused();
  await command(page, 'Rename').hover();
  await page.clock.runFor(200);
  await expect(menu(page)).toBeVisible();
  await expect(before).toBeFocused();
  await before.hover();
  await page.clock.runFor(99);
  await expect(menu(page)).toBeVisible();
  await page.clock.runFor(1);
  await expect(menu(page)).toBeHidden();
  await trigger(page).hover();
  await page.clock.runFor(50);
  await before.hover();
  await page.clock.runFor(200);
  await expect(menu(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[true,false]');
});

test('Dropdown defaults to hover and still opens with a native keyboard click', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Default hover Dropdown', exact: true });
  const popup = menu(page, 'Default hover Dropdown');
  await button.hover();
  await expect(popup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await button.press('Space');
  await expect(popup.getByRole('menuitem')).toBeFocused();
});

test('Dropdown pins a hover menu on click and keeps keyboard focus while the pointer leaves', async ({ page }) => {
  await mode(page, 'both');
  await trigger(page).hover();
  await expect(menu(page)).toBeVisible();
  await trigger(page).click();
  await expect(command(page, 'Open')).toBeFocused();
  await page.getByRole('button', { name: 'Before Dropdown', exact: true }).hover();
  await expect(menu(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[true,false]');
});

test('Dropdown supports manual and default visibility without callback feedback', async ({ page }) => {
  await mode(page, 'manual');
  await trigger(page).click();
  await trigger(page).press('ArrowDown');
  await expect(menu(page)).toBeHidden();
  await trigger(page).focus();
  await page.keyboard.press('F4');
  await expect(menu(page)).toBeVisible();
  await expect(trigger(page)).toBeFocused();
  await expect(status(page, 'changes')).toHaveText('[]');
  await page.keyboard.press('F4');
  await expect(menu(page)).toBeHidden();
  await page.getByLabel('Mount default Dropdown', { exact: true }).check();
  await page.getByRole('button', { name: 'Default Dropdown trigger', exact: true }).scrollIntoViewIfNeeded();
  await expect(menu(page, 'Default menu')).toBeVisible();
  await expect(page.getByRole('status', { name: 'Default Dropdown changes', exact: true })).toHaveText('[]');
});

test('Dropdown disables without latching an attempted click and restores focus when disabled while open', async ({ page }) => {
  await page.getByLabel('Disable Dropdown', { exact: true }).check();
  await trigger(page).click();
  await expect(menu(page)).toBeHidden();
  await page.keyboard.press('F3');
  await trigger(page).click();
  await expect(command(page, 'Open')).toBeFocused();
  await page.keyboard.press('F3');
  await expect(menu(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(status(page, 'events')).toHaveText('[]');
  await expect(status(page, 'changes')).toHaveText('[true]');
});

test('Dropdown inherits disabled configuration and allows an explicit enabled override', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  const inherited = page.getByRole('button', { name: 'Inherited Dropdown trigger', exact: true });
  await expect(inherited).toBeDisabled();
  const override = page.getByRole('button', { name: 'Enabled Dropdown override', exact: true });
  await override.click();
  await expect(menu(page, 'Enabled Dropdown override').getByRole('menuitem', { name: 'Enabled action' })).toBeFocused();
});

test('Dropdown ignores a disabled native trigger even with hover enabled', async ({ page }) => {
  await freeze(page);
  await mode(page, 'both');
  await page.getByLabel('Disable Dropdown native trigger', { exact: true }).check();
  await trigger(page).hover();
  await page.clock.runFor(200);
  await expect(menu(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[]');
});

test('Dropdown repairs menu focus when the owner disables or removes the focused command', async ({ page }) => {
  await trigger(page).press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(command(page, 'Rename')).toBeFocused();
  await page.keyboard.press('F7');
  await expect(command(page, 'Rename')).toBeDisabled();
  await expect(command(page, 'Open')).toBeFocused();
  await page.keyboard.press('F7');
  await page.keyboard.press('ArrowDown');
  await expect(command(page, 'Rename')).toBeFocused();
  await page.keyboard.press('F8');
  await expect(command(page, 'Rename')).toHaveCount(0);
  await expect(command(page, 'Open')).toBeFocused();
  await page.keyboard.press('F9');
  await expect(menu(page)).toBeVisible();
  await expect(menu(page)).toBeFocused();
  await expect(menu(page)).toContainText('Ничего не найдено');
  await expect(status(page, 'changes')).toHaveText('[true]');
});

test('Dropdown focuses its menu when every item is disabled and Tab still exits', async ({ page }) => {
  await page.getByLabel('Disable all Dropdown items', { exact: true }).check();
  await trigger(page).press('ArrowDown');
  await expect(menu(page)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(status(page, 'events')).toHaveText('[]');
  await page.keyboard.press('Tab');
  await expect(menu(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'After Dropdown', exact: true })).toBeFocused();
});

test('Dropdown cancels delayed opening when disabled, unmounted or its trigger is replaced', async ({ page }) => {
  await freeze(page);
  await mode(page, 'hover');
  for (const key of ['F3', 'F5', 'F6']) {
    await trigger(page).hover();
    await page.clock.runFor(50);
    await page.keyboard.press(key);
    await page.clock.runFor(200);
    await expect(menu(page)).toBeHidden();
    await page.keyboard.press(key);
    await page.getByRole('button', { name: 'Before Dropdown', exact: true }).hover();
    await page.clock.runFor(200);
  }
  await expect(status(page, 'changes')).toHaveText('[]');
});

test('Dropdown reconnects a replaced trigger and restores the previous owner metadata', async ({ page }) => {
  await trigger(page).click();
  await trigger(page).evaluate((element) => { element.setAttribute('aria-haspopup', 'tree'); element.setAttribute('aria-controls', 'latest-owner-controls'); });
  await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'menu');
  const original = await trigger(page).elementHandle();
  await page.keyboard.press('F6');
  const replacement = page.getByRole('button', { name: 'Replacement Dropdown trigger', exact: true });
  await expect(replacement).toHaveAttribute('aria-haspopup', 'menu');
  await expect(menu(page, 'Replacement Dropdown trigger').getByRole('menuitem', { name: 'Open', exact: true })).toBeFocused();
  expect(await original?.getAttribute('aria-haspopup')).toBe('tree');
  expect(await original?.getAttribute('aria-controls')).toBe('latest-owner-controls');
  await page.keyboard.press('Escape');
  await expect(replacement).toBeFocused();
});

for (const placement of ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight']) {
  test(`Dropdown positions ${placement} with an optional arrow and an anchor-width minimum`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Dropdown placement', exact: true }).selectOption(placement);
    await page.getByLabel('Dropdown arrow', { exact: true }).check();
    await trigger(page).click();
    await expect(menu(page)).toBeVisible();
    const popup = menu(page).locator('..');
    await expect(popup).toHaveClass(new RegExp(`ant-dropdown-placement-${placement}(?: |$)`));
    const anchor = (await trigger(page).boundingBox())!;
    const bounds = (await popup.boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(anchor.width - 1);
    if (placement.startsWith('top')) expect(bounds.y + bounds.height).toBeLessThanOrEqual(anchor.y - 7);
    else expect(bounds.y).toBeGreaterThanOrEqual(anchor.y + anchor.height + 7);
    if (placement.endsWith('Left')) expect(Math.abs(bounds.x - anchor.x)).toBeLessThan(1);
    else if (placement.endsWith('Right')) expect(Math.abs(bounds.x + bounds.width - anchor.x - anchor.width)).toBeLessThan(1);
    else expect(Math.abs(bounds.x + bounds.width / 2 - anchor.x - anchor.width / 2)).toBeLessThan(1);
    await expect(popup.locator('.ant-dropdown-arrow')).toBeVisible();
  });
}

test('Dropdown flips above at the viewport edge and follows its trigger after scrolling', async ({ page }) => {
  await trigger(page).scrollIntoViewIfNeeded();
  await trigger(page).evaluate((element) => { window.scrollBy(0, element.getBoundingClientRect().bottom - window.innerHeight + 12); });
  await trigger(page).click();
  const popup = menu(page).locator('..');
  await expect(popup).toHaveClass(/ant-dropdown-placement-topLeft/);
  await page.evaluate(() => window.scrollBy(0, 100));
  await expect.poll(async () => {
    const anchor = (await trigger(page).boundingBox())!;
    const bounds = (await popup.boundingBox())!;
    return Math.abs(bounds.x - anchor.x) < 1 && bounds.y + bounds.height <= anchor.y - 7;
  }).toBe(true);
});

test('Dropdown escapes overflow clipping and supports a scrollable long menu', async ({ page }) => {
  await page.getByRole('button', { name: 'Clipped Dropdown trigger', exact: true }).click();
  await expect(menu(page, 'Clipped menu')).toBeVisible();
  await menu(page, 'Clipped menu').getByRole('menuitem', { name: 'Clipped last action' }).click();
  await expect(menu(page, 'Clipped menu')).toBeHidden();
  await page.getByLabel('Many Dropdown items', { exact: true }).check();
  await trigger(page).press('ArrowDown');
  await page.keyboard.press('End');
  const last = command(page, 'Command 40');
  await expect(last).toBeFocused();
  await expect.poll(() => menu(page).evaluate((element) => element.scrollTop > 0)).toBe(true);
  const bounds = (await menu(page).boundingBox())!;
  const itemBounds = (await last.boundingBox())!;
  expect(itemBounds.y + itemBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
});

test('Dropdown inherits RTL, dark and compact styles and respects reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Dropdown theme', { exact: true }).check();
  await page.getByLabel('Compact Dropdown theme', { exact: true }).check();
  await trigger(page).click();
  const popup = menu(page).locator('..');
  await expect(popup).toHaveClass(/ant-dropdown-placement-bottomRight/);
  await expect(menu(page)).toHaveCSS('direction', 'rtl');
  await expect(menu(page)).toHaveCSS('background-color', 'rgb(31, 31, 31)');
  await expect(command(page, 'Open')).toHaveCSS('font-size', '12px');
  await expect(command(page, 'Open')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.08)');
  await expect(command(page, 'Open')).toHaveCSS('transition-duration', '0s');
  await expect(command(page, 'Export')).toHaveCSS('color', 'rgba(255, 255, 255, 0.25)');
  await page.screenshot({ path: testInfo.outputPath('dropdown-dark-rtl.png') });
});

test('Dropdown handles one Escape before its Modal and keeps action focus inside the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Dropdown modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Dropdown modal', exact: true });
  const button = dialog.getByRole('button', { name: 'Modal Dropdown trigger', exact: true });
  await button.press('ArrowDown');
  await expect(menu(page, 'Modal actions').getByRole('menuitem')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu(page, 'Modal actions')).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(button).toBeFocused();
  await button.click();
  await menu(page, 'Modal actions').getByRole('menuitem').press('Enter');
  await expect(page.getByRole('status', { name: 'Modal Dropdown choice', exact: true })).toHaveText('modal');
  await expect(button).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test.describe('mobile Dropdown', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('opens by touch and wraps long labels inside the viewport', async ({ page }, testInfo) => {
    await page.getByLabel('Long Dropdown labels', { exact: true }).check();
    await trigger(page).tap();
    await expect(menu(page)).toBeVisible();
    const bounds = (await menu(page).boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(8);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(367);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('dropdown-mobile.png') });
    await command(page, 'Archive').tap();
    await expect(menu(page)).toBeHidden();
    await expect(status(page, 'events')).toHaveText('["menu:archive"]');
  });
});
