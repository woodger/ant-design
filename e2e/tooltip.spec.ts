import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

function trigger(page: Page) { return page.getByRole('button', { name: 'Tooltip trigger', exact: true }); }
function tooltip(page: Page, title = 'Helpful description') { return page.getByRole('tooltip').filter({ hasText: title }); }

async function centered(popup: Locator, anchor: Locator) {
  await expect.poll(async () => {
    const tip = await popup.boundingBox();
    const target = await anchor.boundingBox();

    return tip && target ? Math.abs(tip.x + tip.width / 2 - target.x - target.width / 2) : Infinity;
  }).toBeLessThan(2);
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=tooltip');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Tooltip respects enter and leave delays, remains hoverable and keeps focus on its trigger', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const button = trigger(page);
  await button.hover();
  await page.clock.runFor(199);
  await expect(tooltip(page)).toBeHidden();
  await page.clock.runFor(1);
  await expect(tooltip(page)).toBeVisible();
  await tooltip(page).hover();
  await page.clock.runFor(200);
  await expect(tooltip(page)).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(149);
  await expect(tooltip(page)).toBeVisible();
  await page.clock.runFor(1);
  await expect(tooltip(page)).toBeHidden();
  await button.focus();
  await expect(tooltip(page)).toBeVisible();
  await tooltip(page).click();
  await expect(button).toBeFocused();
  await button.press('Escape');
  await expect(tooltip(page)).toBeHidden();
  await expect(button).toBeFocused();
  await page.clock.runFor(500);
  await expect(tooltip(page)).toBeHidden();
});

test('Tooltip preserves the child click handler and adds no Tab stop', async ({ page }) => {
  const button = trigger(page);
  await button.click();
  await expect(page.getByRole('status', { name: 'Tooltip clicks', exact: true })).toHaveText('1');
  await expect(tooltip(page)).toBeVisible();
  await button.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Tooltip input', exact: true })).toBeFocused();
  await page.getByRole('textbox', { name: 'Tooltip input', exact: true }).fill('Typed text');
  await expect(page.getByRole('status', { name: 'Tooltip inputs', exact: true })).toHaveText('1');
  await expect(tooltip(page, 'Input description')).toBeVisible();
});

test('Tooltip merges changing owner descriptions and removes only its own ID when cleared', async ({ page }) => {
  const button = trigger(page);
  await expect(button).toHaveAccessibleDescription('Original help. Helpful description');
  const ids = (await button.getAttribute('aria-describedby'))!.split(' ');
  await expect(page.locator(`[id="${ids[1]}"]`)).toHaveAttribute('role', 'tooltip');
  await button.focus();
  await page.keyboard.press('F7');
  await expect(button).toHaveAccessibleDescription('Updated help. Helpful description');
  await page.keyboard.press('F3');
  await expect(tooltip(page)).toBeHidden();
  await expect(button).toHaveAttribute('aria-describedby', 'tooltip-updated-help');
});

test('Tooltip bind:open reflects interactions and external updates emit no feedback callback', async ({ page }) => {
  const button = trigger(page);
  const changes = page.getByRole('status', { name: 'Tooltip changes', exact: true });
  await button.focus();
  await expect(page.getByRole('status', { name: 'Tooltip open', exact: true })).toHaveText('true');
  await expect(changes).toHaveText('[true]');
  await page.keyboard.press('F4');
  await expect(tooltip(page)).toBeHidden();
  await expect(changes).toHaveText('[true]');
  await page.keyboard.press('F4');
  await expect(tooltip(page)).toBeVisible();
  await expect(changes).toHaveText('[true]');
  await button.press('Escape');
  await expect(changes).toHaveText('[true,false]');
});

test('Tooltip supports numeric zero and hides empty titles without description links', async ({ page }) => {
  const button = trigger(page);
  await page.getByRole('button', { name: 'Use zero Tooltip', exact: true }).click();
  await button.focus();
  await expect(page.getByRole('tooltip').filter({ hasText: /^\s*0\s*$/ })).toBeVisible();
  await expect(button).toHaveAccessibleDescription('Original help. 0');
  await page.getByRole('button', { name: 'Use empty Tooltip', exact: true }).click();
  await button.focus();
  await expect(button).toHaveAttribute('aria-describedby', 'tooltip-original-help');
  await expect(page.getByRole('tooltip').filter({ hasText: /^\s*$/ })).toBeHidden();
});

test('Tooltip filters hover and focus triggers and explains disabled controls on hover', async ({ page }) => {
  const focus = page.getByRole('button', { name: 'Focus Tooltip trigger', exact: true });
  await focus.hover();
  await expect(tooltip(page, 'Focus description')).toBeHidden();
  await focus.focus();
  await expect(tooltip(page, 'Focus description')).toBeVisible();
  const hover = page.getByRole('button', { name: 'Hover Tooltip trigger', exact: true });
  await page.mouse.move(0, 0);
  await hover.focus();
  await expect(tooltip(page, 'Hover description')).toBeHidden();
  await hover.hover();
  await expect(tooltip(page, 'Hover description')).toBeVisible();
  await page.getByRole('button', { name: 'Disabled Tooltip trigger', exact: true }).hover();
  await expect(tooltip(page, 'Disabled explanation')).toBeVisible();
});

test('Tooltip initializes defaultOpen and dismisses it with Escape', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Default Tooltip trigger', exact: true });
  await button.scrollIntoViewIfNeeded();
  await expect(tooltip(page, 'Initially visible')).toBeVisible();
  await button.focus();
  await button.press('Escape');
  await expect(tooltip(page, 'Initially visible')).toBeHidden();
  await expect(button).toBeFocused();
});

test('Tooltip Escape closes the most recently shown popup while an earlier popup remains open', async ({ page }) => {
  await page.getByRole('button', { name: 'Default Tooltip trigger', exact: true }).scrollIntoViewIfNeeded();
  const initial = tooltip(page, 'Initially visible');
  await expect(initial).toBeVisible();
  await trigger(page).focus();
  await expect(tooltip(page)).toBeVisible();
  await expect(initial).toBeVisible();
  await trigger(page).press('Escape');
  await expect(tooltip(page)).toBeHidden();
  await expect(initial).toBeVisible();
});

for (const placement of ['top', 'bottom', 'left', 'right']) {
  test(`Tooltip positions on the ${placement} with an optional arrow`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tooltip placement', exact: true }).selectOption(placement);
    const button = trigger(page);
    await button.focus();
    const tip = tooltip(page);
    await expect(tip).toHaveClass(new RegExp(`ant-tooltip-placement-${placement}`));
    await expect.poll(async () => {
      const target = (await button.boundingBox())!;
      const box = (await tip.boundingBox())!;
      if (placement === 'top') return Math.abs(target.y - box.y - box.height - 8);
      if (placement === 'bottom') return Math.abs(box.y - target.y - target.height - 8);
      if (placement === 'left') return Math.abs(target.x - box.x - box.width - 8);
      return Math.abs(box.x - target.x - target.width - 8);
    }).toBeLessThan(2);
    await expect(tip.locator('.ant-tooltip-arrow')).toBeVisible();
    await page.getByLabel('Tooltip arrow', { exact: true }).uncheck();
    await button.focus();
    await expect(tip.locator('.ant-tooltip-arrow')).toHaveCount(0);
  });
}

test('Tooltip flips near the viewport edge and allows overflow adjustment to be disabled', async ({ page }) => {
  const button = trigger(page);
  await button.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await button.focus();
  await expect(tooltip(page)).toHaveClass(/ant-tooltip-placement-bottom/);
  await page.getByLabel('Adjust Tooltip overflow', { exact: true }).uncheck();
  await button.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await button.focus();
  await expect(tooltip(page)).toHaveClass(/ant-tooltip-placement-top/);
  await expect.poll(async () => (await tooltip(page).boundingBox())!.y).toBeLessThan(0);
});

test('Tooltip remains outside clipping ancestors in the native top layer', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Clipped Tooltip trigger', exact: true });
  await button.focus();
  const tip = tooltip(page, 'Outside clipping');
  await expect(tip).toBeVisible();
  const box = (await tip.boundingBox())!;
  await expect(tip).toHaveJSProperty('popover', 'manual');
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[role="tooltip"]')?.textContent, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  expect(hit).toContain('Outside clipping');
});

test('Tooltip follows scrolling, layout changes and viewport resizing while open', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Scrolling Tooltip trigger', exact: true });
  await button.focus();
  const tip = tooltip(page, 'Moving description');
  await expect(tip).toBeVisible();
  await centered(tip, button);
  const before = (await tip.boundingBox())!;
  await page.locator('#tooltip-fixture .scroller').evaluate((element) => { element.scrollTop += 20; });
  await expect.poll(async () => Math.abs((await tip.boundingBox())!.y - before.y + 20)).toBeLessThan(2);
  await page.keyboard.press('F8');
  await centered(tip, button);
  await page.setViewportSize({ width: 900, height: 650 });
  await centered(tip, button);
});

test('Tooltip closes before its Modal and keeps focus inside the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Tooltip modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Tooltip modal', exact: true });
  const button = dialog.getByRole('button', { name: 'Modal Tooltip trigger', exact: true });
  await button.focus();
  await expect(tooltip(page, 'Inside modal')).toBeVisible();
  await expect(tooltip(page, 'Inside modal')).toHaveJSProperty('popover', 'manual');
  await button.press('Escape');
  await expect(tooltip(page, 'Inside modal')).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(button).toBeFocused();
  await button.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open Tooltip modal', exact: true })).toBeFocused();
});

for (const action of ['F3', 'F5', 'F6']) {
  test(`Tooltip discards pending opening after ${action === 'F3' ? 'clearing its title' : action === 'F5' ? 'unmounting' : 'replacing its trigger'}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    await trigger(page).hover();
    await page.clock.runFor(100);
    await page.keyboard.press(action);
    await page.clock.runFor(300);
    await expect(tooltip(page)).toBeHidden();
    await expect(page.getByRole('status', { name: 'Tooltip changes', exact: true })).toHaveText('[]');
  });
}

test('Tooltip inherits dark compact RTL themes and disables motion', async ({ page }, testInfo) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Tooltip theme', { exact: true }).check();
  await page.getByLabel('Compact Tooltip theme', { exact: true }).check();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger(page).focus();
  const tip = tooltip(page);
  await expect(tip).toHaveAttribute('dir', 'rtl');
  await expect(tip.locator('.ant-tooltip-container')).toHaveCSS('background-color', 'rgb(66, 66, 66)');
  await expect(tip).toHaveCSS('animation-duration', '0s');
  await expect(tip).toHaveCSS('transition-duration', '0s');
  await page.screenshot({ path: testInfo.outputPath('tooltip-dark-rtl.png') });
});

test('Slider Tooltip shows the current value and follows the handle through keyboard changes and dragging', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=slider');
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  const root = input.locator('..');
  const tip = root.getByRole('tooltip');
  const handle = root.locator('.ant-slider-handle');
  await input.focus();
  await expect(tip).toHaveText('20');
  await centered(tip, handle);
  await input.press('ArrowRight');
  await expect(tip).toHaveText('25');
  await centered(tip, handle);
  await page.mouse.move(0, 0);
  const start = (await handle.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  const rail = (await root.locator('.ant-slider-rail').boundingBox())!;
  await page.mouse.move(rail.x + rail.width * 0.8, rail.y + rail.height / 2);
  await expect(input).toHaveValue('80');
  await expect(tip).toHaveText('80');
  await centered(tip, handle);
  await page.mouse.move(rail.x + rail.width + 80, rail.y + 60);
  await expect(tip).toHaveText('100');
  await page.mouse.up();
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[25,100]');
});

test('Slider Tooltip formats values, supports forced visibility and suppresses disabled and empty modes', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Formatted Tooltip Slider', exact: true });
  const tip = slider.locator('..').getByRole('tooltip');
  const mode = page.getByRole('combobox', { name: 'Slider Tooltip mode', exact: true });
  await slider.focus();
  await expect(tip).toHaveText('30%');
  await expect(slider).toHaveAccessibleDescription('30%');
  await slider.press('ArrowRight');
  await expect(tip).toHaveText('31%');
  for (const value of ['hidden', 'disabled', 'null', 'empty']) {
    await mode.selectOption(value);
    await slider.focus();
    await expect(tip).toBeHidden();
    await expect(slider).not.toHaveAttribute('aria-describedby');
  }
  await mode.focus();
  await mode.selectOption('forced');
  await expect(tip).toBeVisible();
  await expect(mode).toBeFocused();
});

test('Slider Tooltip Escape dismissal preserves focus and numeric callbacks until the next action', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=slider');
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  const tip = input.locator('..').getByRole('tooltip');
  await input.focus();
  await expect(tip).toBeVisible();
  await input.press('Escape');
  await expect(tip).toBeHidden();
  await expect(input).toBeFocused();
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[]');
  await input.press('ArrowRight');
  await expect(tip).toHaveText('25');
  await page.keyboard.press('F3');
  await expect(input).toBeDisabled();
  await expect(tip).toBeHidden();
  await expect(input).not.toHaveAttribute('aria-describedby');
});

test('Slider Tooltip works inside Modal and closes before the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Tooltip modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Tooltip modal', exact: true });
  const slider = dialog.getByRole('slider', { name: 'Modal Tooltip Slider', exact: true });
  await slider.focus();
  await expect(slider.locator('..').getByRole('tooltip')).toHaveText('45');
  await slider.press('Escape');
  await expect(slider.locator('..').getByRole('tooltip')).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(slider).toBeFocused();
});

test('Tooltip keeps its popup within a narrow viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await trigger(page).focus();
  const tip = tooltip(page);
  await expect(tip).toBeVisible();
  const box = (await tip.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(367);
  await page.screenshot({ path: testInfo.outputPath('tooltip-mobile.png') });
});
