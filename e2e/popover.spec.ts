import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

function trigger(page: Page) { return page.getByRole('button', { name: 'Popover trigger', exact: true }); }
function card(page: Page, name = 'Popover editor') { return page.getByRole('dialog', { name, exact: true }); }
function changes(page: Page) { return page.getByRole('status', { name: 'Popover changes', exact: true }); }

async function mode(page: Page, value: string) {
  await page.getByRole('combobox', { name: 'Popover trigger mode', exact: true }).selectOption(value);
}

async function centered(popup: Locator, anchor: Locator) {
  await expect.poll(async () => {
    const box = await popup.boundingBox();
    const target = await anchor.boundingBox();

    return box && target ? Math.abs(box.x + box.width / 2 - target.x - target.width / 2) : Infinity;
  }).toBeLessThan(2);
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=popover');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Popover click opens an interactive card, focuses its first enabled control and preserves child events', async ({ page }) => {
  await trigger(page).click();
  const popup = card(page);
  const name = popup.getByRole('textbox', { name: 'Popover name', exact: true });
  await expect(popup).toBeVisible();
  await expect(name).toBeFocused();
  await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger(page)).toHaveAccessibleDescription('Popover original help.');
  await name.fill('Grace');
  await expect(page.getByRole('status', { name: 'Popover name value', exact: true })).toHaveText('Grace');
  await expect(page.getByRole('status', { name: 'Popover inputs', exact: true })).toHaveText('1');
  await popup.getByRole('button', { name: 'Apply Popover action', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Popover actions', exact: true })).toHaveText('1');
  await expect(popup).toBeVisible();
  await expect(page.getByRole('status', { name: 'Popover clicks', exact: true })).toHaveText('1');
  await expect(changes(page)).toHaveText('[true]');
});

test('Popover closes on a second trigger click or outside click and preserves the outside target focus', async ({ page }) => {
  await trigger(page).click();
  await expect(card(page)).toBeVisible();
  await trigger(page).click();
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await trigger(page).click();
  await page.getByRole('button', { name: 'After Popover', exact: true }).click();
  await expect(card(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'After Popover', exact: true })).toBeFocused();
  await expect(changes(page)).toHaveText('[true,false,true,false]');
});

test('Popover opens with Enter and Space and Escape returns focus without reopening', async ({ page }) => {
  const button = trigger(page);
  await button.focus();
  await button.press('Enter');
  await expect(card(page).getByRole('textbox', { name: 'Popover name', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(card(page)).toBeHidden();
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.press('Space');
  await expect(card(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(changes(page)).toHaveText('[true,false,true,false]');
});

test('Popover respects child click cancellation and disabled native triggers', async ({ page }) => {
  await page.getByLabel('Cancel Popover click', { exact: true }).check();
  await trigger(page).click();
  await expect(card(page)).toBeHidden();
  await expect(changes(page)).toHaveText('[]');
  await expect(page.getByRole('status', { name: 'Popover clicks', exact: true })).toHaveText('1');
  const disabled = page.getByRole('button', { name: 'Disabled Popover trigger', exact: true });
  await disabled.hover();
  await disabled.locator('..').click();
  await expect(card(page, 'Disabled card')).toBeHidden();
});

test('Popover hover delays are cancellable and hovering or focusing its content keeps it open', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await mode(page, 'hover');
  const before = page.getByRole('button', { name: 'Before Popover', exact: true });
  await before.focus();
  await trigger(page).hover();
  await page.clock.runFor(199);
  await expect(card(page)).toBeHidden();
  await page.clock.runFor(1);
  await expect(card(page)).toBeVisible();
  await expect(before).toBeFocused();
  await card(page).hover();
  await page.clock.runFor(200);
  await expect(card(page)).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(149);
  await expect(card(page)).toBeVisible();
  await page.clock.runFor(1);
  await expect(card(page)).toBeHidden();
  await trigger(page).hover();
  await page.clock.runFor(200);
  const name = card(page).getByRole('textbox', { name: 'Popover name', exact: true });
  await name.focus();
  await page.mouse.move(0, 0);
  await page.clock.runFor(300);
  await expect(card(page)).toBeVisible();
  await name.press('Escape');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});

test('Popover focus mode uses natural Tab order through the card and back to the trigger', async ({ page }) => {
  await mode(page, 'focus');
  const button = trigger(page);
  await button.focus();
  await expect(card(page)).toBeVisible();
  await expect(button).toBeFocused();
  await button.press('Tab');
  const name = card(page).getByRole('textbox', { name: 'Popover name', exact: true });
  await expect(name).toBeFocused();
  await name.press('Shift+Tab');
  await expect(button).toBeFocused();
  await expect(card(page)).toBeVisible();
  await button.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Before Popover', exact: true })).toBeFocused();
  await expect(card(page)).toBeHidden();
});

test('Popover Tab leaves a click-open card and closes it without trapping or moving focus back', async ({ page }) => {
  await trigger(page).click();
  const link = card(page).getByRole('link', { name: 'Popover help link', exact: true });
  await link.focus();
  await link.press('Tab');
  await expect(page.getByRole('button', { name: 'After Popover', exact: true })).toBeFocused();
  await expect(card(page)).toBeHidden();
});

test('Popover combines hover, focus and click without immediately closing on the opening click', async ({ page }) => {
  await mode(page, 'mixed');
  await trigger(page).focus();
  await expect(card(page)).toBeVisible();
  await trigger(page).click();
  await expect(card(page).getByRole('textbox', { name: 'Popover name', exact: true })).toBeFocused();
  await expect(changes(page)).toHaveText('[true]');
  await page.keyboard.press('Escape');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(changes(page)).toHaveText('[true,false]');
});

test('Popover external open updates emit no callback or focus transfer and closing returns focus from its content', async ({ page }) => {
  await mode(page, 'manual');
  const before = page.getByRole('button', { name: 'Before Popover', exact: true });
  await before.focus();
  await page.keyboard.press('F4');
  await expect(card(page)).toBeVisible();
  await expect(before).toBeFocused();
  await expect(changes(page)).toHaveText('[]');
  await card(page).getByRole('textbox', { name: 'Popover name', exact: true }).focus();
  await page.keyboard.press('F4');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(changes(page)).toHaveText('[]');
  await expect(page.getByRole('status', { name: 'Popover open', exact: true })).toHaveText('false');
});

test('Popover content can close its binding without feedback and preserves the owner text on reopening', async ({ page }) => {
  await trigger(page).click();
  await card(page).getByRole('textbox', { name: 'Popover name', exact: true }).fill('Marie');
  await card(page).getByRole('button', { name: 'Close Popover editor', exact: true }).click();
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(changes(page)).toHaveText('[true]');
  await trigger(page).click();
  await expect(card(page).getByRole('textbox', { name: 'Popover name', exact: true })).toHaveValue('Marie');
  await expect(changes(page)).toHaveText('[true,true]');
});

test('Popover initializes defaultOpen without notifying its owner', async ({ page }) => {
  await page.getByLabel('Mount default Popover', { exact: true }).check();
  const button = page.getByRole('button', { name: 'Default Popover trigger', exact: true });
  await button.scrollIntoViewIfNeeded();
  await expect(card(page, 'Default card')).toBeVisible();
  await expect(page.getByRole('status', { name: 'Default Popover changes', exact: true })).toHaveText('[]');
  await page.keyboard.press('Escape');
  await expect(card(page, 'Default card')).toBeHidden();
  await expect(page.getByRole('status', { name: 'Default Popover changes', exact: true })).toHaveText('[false]');
});

test('Popover supports a rich title, a title-free accessible name and numeric zero', async ({ page }) => {
  await page.getByRole('button', { name: 'Rich Popover trigger', exact: true }).click();
  await expect(card(page, 'Rich Popover title')).toHaveText('Rich Popover title Rich content');
  await expect(card(page, 'Rich Popover title')).toBeFocused();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Untitled Popover trigger', exact: true }).click();
  await expect(card(page, 'Untitled card')).toHaveText('Content without a heading');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Zero Popover trigger', exact: true }).click();
  await expect(card(page, '0')).toHaveText('0 0');
});

test('Popover preserves and restores changing owner ARIA attributes when its content is cleared', async ({ page }) => {
  const button = trigger(page);
  await expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  const ids = (await button.getAttribute('aria-controls'))!.split(' ');
  expect(ids[0]).toBe('popover-original-control');
  await expect(page.locator(`[id="${ids[1]}"]`)).toHaveAttribute('role', 'dialog');
  await page.keyboard.press('F7');
  await expect(button).toHaveAttribute('aria-controls', `popover-updated-control ${ids[1]}`);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('F3');
  await expect(button).toHaveAttribute('aria-controls', 'popover-updated-control');
  await expect(button).toHaveAttribute('aria-haspopup', 'menu');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveAccessibleDescription('Popover original help.');
});

test('Popover replacement of its trigger preserves open content, focus, text and callbacks', async ({ page }) => {
  await trigger(page).click();
  const name = card(page).getByRole('textbox', { name: 'Popover name', exact: true });
  await name.fill('Katherine');
  await page.keyboard.press('F6');
  await expect(card(page)).toBeVisible();
  await expect(name).toHaveValue('Katherine');
  await expect(name).toBeFocused();
  await expect(changes(page)).toHaveText('[true]');
  const replacement = page.getByRole('button', { name: 'Replacement Popover trigger', exact: true });
  await expect(replacement).toHaveAttribute('aria-expanded', 'true');
  await name.press('Escape');
  await expect(replacement).toBeFocused();
});

test('Popover hides empty content without feedback and restores externally open content', async ({ page }) => {
  await trigger(page).click();
  await page.keyboard.press('F3');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(changes(page)).toHaveText('[true]');
  await page.keyboard.press('F3');
  await expect(card(page)).toBeVisible();
  await expect(trigger(page)).toBeFocused();
  await expect(changes(page)).toHaveText('[true]');
});

for (const action of ['F3', 'F5', 'F6']) {
  test(`Popover discards delayed opening after ${action === 'F3' ? 'clearing content' : action === 'F5' ? 'unmounting' : 'replacing its trigger'}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    await mode(page, 'hover');
    await trigger(page).hover();
    await page.clock.runFor(100);
    await page.keyboard.press(action);
    await page.clock.runFor(300);
    await expect(card(page)).toBeHidden();
    await expect(changes(page)).toHaveText('[]');
  });
}

for (const placement of ['top', 'bottom', 'left', 'right']) {
  test(`Popover positions on the ${placement} and permits its arrow to be hidden`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Popover placement', exact: true }).selectOption(placement);
    await trigger(page).evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await trigger(page).click();
    const popup = card(page);
    await expect(popup).toHaveClass(new RegExp(`ant-popover-placement-${placement}`));
    await expect.poll(async () => {
      const target = (await trigger(page).boundingBox())!;
      const box = (await popup.boundingBox())!;
      if (placement === 'top') return Math.abs(target.y - box.y - box.height - 8);
      if (placement === 'bottom') return Math.abs(box.y - target.y - target.height - 8);
      if (placement === 'left') return Math.abs(target.x - box.x - box.width - 8);
      return Math.abs(box.x - target.x - target.width - 8);
    }).toBeLessThan(2);
    await expect(popup.locator('.ant-popover-arrow')).toBeVisible();
    await page.getByLabel('Popover arrow', { exact: true }).uncheck();
    await trigger(page).click();
    await expect(popup.locator('.ant-popover-arrow')).toHaveCount(0);
  });
}

test('Popover changes placement without interrupting an active text edit or moving focus', async ({ page }) => {
  await trigger(page).click();
  const name = card(page).getByRole('textbox', { name: 'Popover name', exact: true });
  await name.fill('Grace Hopper');
  await name.press('Home');
  await name.press('ArrowRight');
  await page.getByRole('combobox', { name: 'Popover placement', exact: true }).selectOption('right');
  await expect(card(page)).toHaveClass(/ant-popover-placement-right/);
  await expect(name).toBeFocused();
  await name.press('x');
  await expect(name).toHaveValue('Gxrace Hopper');
  await expect(changes(page)).toHaveText('[true]');
});

test('Popover flips at the viewport edge and can disable overflow adjustment', async ({ page }) => {
  const button = trigger(page);
  await button.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await button.click();
  await expect(card(page)).toHaveClass(/ant-popover-placement-bottom/);
  await page.getByLabel('Adjust Popover overflow', { exact: true }).uncheck();
  await button.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await button.click();
  await expect(card(page)).toHaveClass(/ant-popover-placement-top/);
  await expect.poll(async () => (await card(page).boundingBox())!.y).toBeLessThan(0);
});

test('Popover escapes clipping ancestors through the native top layer', async ({ page }) => {
  await page.getByRole('button', { name: 'Clipped Popover trigger', exact: true }).click();
  const popup = card(page, 'Clipped card');
  await expect(popup).toBeVisible();
  await expect(popup).toHaveJSProperty('popover', 'manual');
  const box = (await popup.boundingBox())!;
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[role="dialog"]')?.textContent, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  expect(hit).toContain('Outside clipping');
});

test('Popover follows scrolling, layout changes and viewport resizing while open', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Scrolling Popover trigger', exact: true });
  await button.click();
  const popup = card(page, 'Moving card');
  await centered(popup, button);
  const before = (await popup.boundingBox())!;
  await page.locator('#popover-fixture .scroller').evaluate((element) => { element.scrollTop += 20; });
  await expect.poll(async () => Math.abs((await popup.boundingBox())!.y - before.y + 20)).toBeLessThan(2);
  await page.keyboard.press('F8');
  await centered(popup, button);
  await page.setViewportSize({ width: 900, height: 650 });
  await centered(popup, button);
});

test('Popover and its nested Tooltip consume Escape in their visual order', async ({ page }) => {
  await trigger(page).click();
  const explain = card(page).getByRole('button', { name: 'Explain Popover action', exact: true });
  await explain.focus();
  const hint = page.getByRole('tooltip').filter({ hasText: 'Popover hint' });
  await expect(hint).toBeVisible();
  await explain.press('Escape');
  await expect(hint).toBeHidden();
  await expect(card(page)).toBeVisible();
  await expect(explain).toBeFocused();
  await explain.press('Escape');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});

test('Popover remains interactive inside Modal and closes before the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Popover modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Popover modal', exact: true });
  const button = modal.getByRole('button', { name: 'Modal Popover trigger', exact: true });
  await button.click();
  const popup = card(page, 'Modal card');
  const input = popup.getByRole('textbox', { name: 'Modal Popover input', exact: true });
  await expect(input).toBeFocused();
  await input.fill('Inside dialog');
  await input.press('Escape');
  await expect(popup).toBeHidden();
  await expect(modal).toBeVisible();
  await expect(button).toBeFocused();
  await button.press('Escape');
  await expect(modal).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open Popover modal', exact: true })).toBeFocused();
});

test('Popover inherits dark compact RTL styles and respects reduced motion', async ({ page }, testInfo) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Popover theme', { exact: true }).check();
  await page.getByLabel('Compact Popover theme', { exact: true }).check();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger(page).click();
  const popup = card(page);
  await expect(popup).toHaveAttribute('dir', 'rtl');
  await expect(popup.locator('.ant-popover-container')).toHaveCSS('background-color', 'rgb(31, 31, 31)');
  await expect(popup.getByRole('textbox', { name: 'Popover name', exact: true })).toHaveCSS('font-size', '12px');
  await expect(popup).toHaveCSS('animation-duration', '0s');
  await expect(popup).toHaveCSS('transition-duration', '0s');
  await page.screenshot({ path: testInfo.outputPath('popover-dark-rtl.png') });
});

test.describe('mobile Popover', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test('opens through touch, keeps controls usable and fits its content within the viewport', async ({ page }, testInfo) => {
    await trigger(page).tap();
    const popup = card(page);
    await popup.getByRole('textbox', { name: 'Popover name', exact: true }).fill('Mobile');
    await popup.getByRole('button', { name: 'Apply Popover action', exact: true }).tap();
    await expect(page.getByRole('status', { name: 'Popover actions', exact: true })).toHaveText('1');
    const box = (await popup.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(367);
    expect(box.y).toBeGreaterThanOrEqual(8);
    expect(box.y + box.height).toBeLessThanOrEqual(804);
    await page.screenshot({ path: testInfo.outputPath('popover-mobile.png') });
  });
});
