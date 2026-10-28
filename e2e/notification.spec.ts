import type { Page } from '@playwright/test';
import { test, expect } from './test';

const holder = (page: Page, id = 'fixture-notifications') => page.locator(`#${id}`);
const notices = (page: Page, id = 'fixture-notifications') => holder(page, id).locator('.ant-notification-notice:not([inert])');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const events = (page: Page) => page.locator('output[aria-label="Notification events"]');
const after = (page: Page) => button(page, 'After Notification');
async function setting(page: Page, name: string, value: string) { await page.getByRole('combobox', { name: `Notification ${name}`, exact: true }).selectOption(value); }
async function settled(page: Page) { await expect(notices(page)).toBeVisible(); await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0); }
async function pauseExit(page: Page) {
  await settled(page);
  await notices(page).evaluate((node) => node.style.setProperty('--ant-motion-duration-mid', '10s'));
  await notices(page).getByRole('button', { name: 'Закрыть', exact: true }).click();
  const root = holder(page).locator('.ant-notification-notice');
  const count = await root.evaluate((node) => { const motions = node.getAnimations(); for (const motion of motions) motion.pause(); return motions.length; });
  expect(count).toBeGreaterThan(0);
  return root;
}

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto('http://127.0.0.1:4174?fixture=notification');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
});

test('Notification starts empty and shows a named native popover without stealing focus', async ({ page }, testInfo) => {
  await expect(holder(page)).toHaveCount(0);
  const input = page.getByRole('textbox', { name: 'Notification focus target', exact: true });
  await input.fill('My draft'); await page.keyboard.press('Control+Alt+v');
  await expect(holder(page)).toHaveAttribute('popover', 'manual');
  await expect(notices(page)).toHaveRole('alert');
  await expect(notices(page)).toHaveAccessibleName('Keyboard notification');
  await expect(notices(page)).toHaveAttribute('aria-atomic', 'true');
  await expect(input).toBeFocused(); await expect(input).toHaveValue('My draft');
  await expect(notices(page).getByRole('button', { name: 'Закрыть', exact: true })).toHaveAttribute('type', 'button');
  await settled(page); await page.screenshot({ path: testInfo.outputPath('notification-light.png') });
});

test('Notification renders a neutral open and all four types with decorative icons', async ({ page }) => {
  await button(page, 'Notification open').click();
  await expect(notices(page).locator('.ant-notification-notice-icon')).toHaveCount(0);
  await button(page, 'Destroy all Notifications').click(); await expect(holder(page)).toHaveCount(0);
  for (const type of ['success', 'info', 'warning', 'error']) await button(page, `Notification ${type}`).click();
  await expect(notices(page)).toHaveCount(3);
  await expect(notices(page).locator('.ant-notification-notice-title')).toHaveText(['info notification', 'warning notification', 'error notification']);
  await expect(notices(page).last().locator('.ant-notification-notice-icon')).toHaveAttribute('aria-hidden', 'true');
  await expect(notices(page).last().locator('.ant-notification-notice-description')).toHaveText('Detailed feedback for the current operation.');
});

for (const placement of ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight']) {
  test(`Notification positions ${placement} and grows toward the viewport interior`, async ({ page }) => {
    await setting(page, 'placement', placement); await button(page, 'Notification info').click(); await settled(page);
    const first = (await notices(page).boundingBox())!; const viewport = page.viewportSize()!;
    if (placement.endsWith('Left')) expect(first.x).toBeCloseTo(24, 0);
    else if (placement.endsWith('Right')) expect(first.x + first.width).toBeCloseTo(viewport.width - 24, 0);
    else expect(first.x + first.width / 2).toBeCloseTo(viewport.width / 2, 0);
    if (placement.startsWith('top')) expect(first.y).toBeCloseTo(24, 0);
    else expect(first.y + first.height).toBeCloseTo(viewport.height - 24, 0);
    await button(page, 'Add unique Notification').click();
    await expect(notices(page)).toHaveCount(2);
    await expect.poll(() => notices(page).last().evaluate((node) => node.getAnimations().length)).toBe(0);
    const added = (await notices(page).last().boundingBox())!;
    if (placement.startsWith('top')) expect(added.y).toBeGreaterThan(first.y + first.height);
    else expect(added.y + added.height).toBeLessThan(first.y);
  });
}

test('Notification updates a key without replacing its action controls or user draft', async ({ page }) => {
  await button(page, 'Notification with actions').click();
  const original = await notices(page).elementHandle();
  const input = notices(page).getByRole('textbox', { name: 'Notification action input', exact: true });
  await input.fill('Unsent draft'); await page.keyboard.press('Control+Alt+u');
  await expect(notices(page)).toHaveAccessibleName('Updated notification');
  await expect(input).toBeFocused(); await expect(input).toHaveValue('Unsent draft');
  expect(await notices(page).evaluate((node, old) => node === old, original)).toBe(true);
  await notices(page).getByRole('button', { name: 'Notification action', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Notification actions', exact: true })).toHaveText('1');
  await expect(notices(page)).toHaveCount(1); await expect(events(page)).toHaveText('[]');
  await notices(page).getByRole('button', { name: 'Dismiss from action', exact: true }).click();
  await expect(holder(page)).toHaveCount(0); await expect(events(page)).toHaveText('["close:Updated notification"]');
});

test('Notification updates placement for the same key without leaving a duplicate or paused hover timer', async ({ page }) => {
  await button(page, 'Notification with actions').click();
  await setting(page, 'duration', '1'); await setting(page, 'placement', 'bottomLeft');
  await notices(page).hover(); await page.keyboard.press('Control+Alt+u');
  await expect(notices(page)).toHaveCount(1);
  await expect(holder(page).locator('[data-placement="bottomLeft"]')).toBeVisible();
  await button(page, 'Add unique Notification').hover();
  await page.clock.fastForward(2000); await expect(holder(page)).toHaveCount(0);
  await expect(events(page)).toHaveText('["close:Updated notification"]');
});

test('Notification uses four and a half seconds by default', async ({ page }) => {
  await button(page, 'Notification default duration').click(); await expect(notices(page)).toBeVisible();
  await page.clock.fastForward(5000); await expect(holder(page)).toHaveCount(0);
});

test('Notification keeps duration zero until closed through the keyboard and restores focus', async ({ page }) => {
  await button(page, 'Notification info').click(); await page.clock.fastForward(20_000);
  await expect(notices(page)).toBeVisible();
  await notices(page).getByRole('button', { name: 'Закрыть', exact: true }).focus();
  await page.keyboard.press('Space'); await expect(holder(page)).toHaveCount(0);
  await expect(after(page)).toBeFocused(); await expect(events(page)).toHaveText('["close:info notification"]');
});

test('Notification restarts the duration when an active key changes', async ({ page }) => {
  await button(page, 'Notification with actions').click(); await page.clock.fastForward(10_000);
  await setting(page, 'duration', '1'); await button(page, 'Update Notification task').click();
  await page.clock.fastForward(300); await expect(notices(page)).toBeVisible();
  await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification limits all placements by FIFO without moving updated keys to the end', async ({ page }) => {
  await setting(page, 'limit', '2'); await button(page, 'Recreate Notification instance').click();
  await button(page, 'Notification with actions').click(); await button(page, 'Add unique Notification').click();
  await button(page, 'Update Notification task').click(); await setting(page, 'placement', 'bottomLeft');
  await button(page, 'Add unique Notification').click();
  await expect(notices(page).locator('.ant-notification-notice-title')).toHaveText(['Notification 1', 'Notification 2']);
  await expect(events(page)).toHaveText('["close:Updated notification"]');
});

test('Notification destroys a key or its own queue without touching an independent holder', async ({ page }) => {
  await button(page, 'Notification with actions').click(); await button(page, 'Notification info').click();
  await button(page, 'Show independent Notification').click(); await button(page, 'Destroy Notification task').click();
  await expect(notices(page)).toHaveAccessibleName('info notification');
  await button(page, 'Destroy all Notifications').click(); await expect(holder(page)).toHaveCount(0);
  await expect(notices(page, 'secondary-notifications')).toHaveAccessibleName('Independent notification');
});

test('Notification preserves remaining hover duration and resumes when the pointer leaves', async ({ page }) => {
  await setting(page, 'duration', '1'); await button(page, 'Notification info').click(); await notices(page).hover();
  await page.clock.fastForward(5000); await expect(notices(page)).toBeVisible();
  await after(page).hover(); await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification can continue its timer during hover when configured', async ({ page }) => {
  await page.getByLabel('Pause Notification on hover', { exact: true }).uncheck();
  await setting(page, 'duration', '1'); await button(page, 'Notification info').click(); await notices(page).hover();
  await page.clock.fastForward(2000); await expect(holder(page)).toHaveCount(0);
});

test('Notification pauses focused controls independently of hover settings and across key updates', async ({ page }) => {
  await page.getByLabel('Pause Notification on hover', { exact: true }).uncheck();
  await setting(page, 'duration', '1'); await button(page, 'Notification with actions').click();
  const input = notices(page).getByRole('textbox', { name: 'Notification action input', exact: true });
  await input.fill('Keep this draft'); await page.clock.fastForward(5000); await expect(input).toBeFocused();
  await page.keyboard.press('Control+Alt+u'); await page.clock.fastForward(5000);
  await expect(input).toHaveValue('Keep this draft'); await expect(input).toBeFocused();
  await page.keyboard.press('Tab'); await expect(notices(page).getByRole('button', { name: 'Notification action', exact: true })).toBeFocused();
  await page.clock.fastForward(5000); await expect(notices(page)).toBeVisible();
  await after(page).focus(); await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification recovers focus and resumes timers when an update removes focused actions', async ({ page }) => {
  await setting(page, 'duration', '1'); await button(page, 'Notification with actions').click();
  await notices(page).getByRole('textbox', { name: 'Notification action input', exact: true }).fill('Draft');
  await page.keyboard.press('Control+Alt+r'); await expect(notices(page)).toHaveAccessibleName('Actions removed');
  await expect(after(page)).toBeFocused(); await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification respects the focus explicitly selected by onClose', async ({ page }) => {
  await page.getByLabel('Notification callback chooses focus', { exact: true }).check();
  await button(page, 'Notification info').click(); await notices(page).getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(holder(page)).toHaveCount(0); await expect(button(page, 'Notification callback focus target')).toBeFocused();
});

test('Notification restores focus after closing all placements created in a different DOM order', async ({ page }) => {
  await button(page, 'Notification with actions').click();
  await setting(page, 'placement', 'topLeft'); await button(page, 'Add unique Notification').click();
  await expect(notices(page)).toHaveCount(2);
  await notices(page).first().getByRole('button', { name: 'Закрыть', exact: true }).focus();
  await page.keyboard.press('Control+Alt+x'); await expect(holder(page)).toHaveCount(0);
  await expect(after(page)).toBeFocused();
  await expect(events(page)).toHaveText('["close:Action notification","close:Notification 1"]');
});

test('Notification waits while hidden and resumes its full queued duration after showing', async ({ page }) => {
  await page.getByLabel('Hide Notification context', { exact: true }).check(); await setting(page, 'duration', '1');
  await button(page, 'Notification info').click(); await page.clock.fastForward(5000);
  await expect(holder(page)).toBeHidden(); await expect(events(page)).toHaveText('[]');
  await page.getByLabel('Hide Notification context', { exact: true }).uncheck(); await expect(notices(page)).toBeVisible();
  await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification queues before its initial holder mount and starts timers after appearing', async ({ page }) => {
  await button(page, 'Queue before Notification mount').click(); await page.clock.fastForward(5000);
  await expect(holder(page)).toHaveCount(0); await button(page, 'Toggle Notification holder').click();
  await expect(notices(page)).toHaveAccessibleName('Queued before mount');
  await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification discards detached queues and late responses until remounted', async ({ page }) => {
  await button(page, 'Notification with actions').click(); await button(page, 'Toggle Notification holder').click();
  await button(page, 'Notification error').click(); await page.clock.fastForward(10_000);
  await expect(events(page)).toHaveText('[]'); await expect(holder(page)).toHaveCount(0);
  await button(page, 'Toggle Notification holder').click(); await button(page, 'Notification success').click();
  await expect(notices(page)).toHaveAccessibleName('success notification');
});

test('Notification replacement drops previous timers and close callbacks', async ({ page }) => {
  await setting(page, 'duration', '1'); await button(page, 'Notification info').click();
  await button(page, 'Recreate Notification instance').click(); await page.clock.fastForward(5000);
  await expect(holder(page)).toHaveCount(0); await expect(events(page)).toHaveText('[]');
  await button(page, 'Notification error').click(); await expect(notices(page)).toHaveAccessibleName('error notification');
});

test('Notification retains inert content through exit and removes it only after animation', async ({ page }) => {
  await button(page, 'Notification info').click(); const root = await pauseExit(page);
  await expect(root).toHaveAttribute('inert', ''); await expect(root).toHaveAttribute('aria-hidden', 'true');
  await expect(events(page)).toHaveText('["close:info notification"]'); await expect(after(page)).toBeFocused();
  await root.evaluate((node) => { for (const motion of node.getAnimations()) motion.finish(); });
  await expect(holder(page)).toHaveCount(0);
});

test('Notification cancels pending exit animation during unmount and reconnects cleanly', async ({ page }) => {
  await button(page, 'Notification info').click(); const root = await pauseExit(page); const original = await root.elementHandle();
  await page.keyboard.press('Control+Alt+b'); await expect(holder(page)).toHaveCount(0);
  expect(await original!.evaluate((node) => node.isConnected)).toBe(false);
  await page.clock.fastForward(10_000); await expect(events(page)).toHaveText('["close:info notification"]');
  await page.keyboard.press('Control+Alt+b'); await button(page, 'Notification success').click(); await expect(notices(page)).toBeVisible();
});

test('Notification skips reduced motion and finishes an existing exit when the preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await button(page, 'Notification info').click();
  expect(await notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  await notices(page).getByRole('button', { name: 'Закрыть', exact: true }).click(); await expect(holder(page)).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await button(page, 'Notification error').click(); await pauseExit(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(holder(page)).toHaveCount(0);
});

for (const mode of ['hidden', 'disabled', 'custom']) {
  test(`Notification supports ${mode} close controls`, async ({ page }) => {
    await setting(page, 'close mode', mode); await button(page, 'Notification info').click();
    if (mode === 'hidden') await expect(notices(page).getByRole('button')).toHaveCount(0);
    else if (mode === 'disabled') await expect(notices(page).getByRole('button', { name: 'Закрыть', exact: true })).toBeDisabled();
    else { const close = notices(page).getByRole('button', { name: 'Dismiss report', exact: true }); await expect(close).toHaveText('×'); await close.click(); await expect(holder(page)).toHaveCount(0); }
  });
}

test('Notification supports rich content, custom decorative icons and explicit status roles', async ({ page }) => {
  await setting(page, 'role', 'status'); await button(page, 'Notification rich content').click();
  await expect(notices(page)).toHaveRole('status'); await expect(notices(page).locator('strong')).toHaveText('Rich title');
  await expect(notices(page).locator('em')).toHaveText('Rich description');
  await expect(notices(page).locator('.ant-notification-notice-icon')).toHaveText('★');
  await expect(notices(page).locator('.ant-notification-notice-icon')).toHaveAttribute('aria-hidden', 'true');
});

test('Notification inherits dark compact RTL styles and localized close names', async ({ page }, testInfo) => {
  for (const label of ['Right to left', 'English locale', 'Dark Notification theme', 'Compact Notification theme']) await page.getByLabel(label, { exact: true }).check();
  await button(page, 'Notification error').click(); await settled(page);
  await expect(notices(page)).toHaveCSS('background-color', 'rgb(31, 31, 31)'); await expect(notices(page)).toHaveCSS('font-size', '12px');
  await expect(notices(page)).toHaveCSS('direction', 'rtl'); await expect(notices(page).getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  const icon = (await notices(page).locator('.ant-notification-notice-icon').boundingBox())!;
  const title = (await notices(page).locator('.ant-notification-notice-title').boundingBox())!; expect(icon.x).toBeGreaterThan(title.x);
  await page.screenshot({ path: testInfo.outputPath('notification-dark-rtl.png') });
});

test('Notification moves live top and bottom offsets without replacing notices', async ({ page }) => {
  await button(page, 'Notification info').click(); await settled(page); await setting(page, 'top', '80');
  expect((await notices(page).boundingBox())!.y).toBeCloseTo(80, 0);
  await button(page, 'Destroy all Notifications').click(); await expect(holder(page)).toHaveCount(0);
  await setting(page, 'placement', 'bottomRight'); await button(page, 'Notification info').click(); await settled(page);
  await setting(page, 'bottom', '80'); const box = (await notices(page).boundingBox())!;
  expect(box.y + box.height).toBeCloseTo(page.viewportSize()!.height - 80, 0);
});

test('Notification remains dismissible when ConfigProvider disables form controls', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check(); await button(page, 'Notification info').click();
  await expect(notices(page).getByRole('button', { name: 'Закрыть', exact: true })).toBeEnabled();
  await notices(page).getByRole('button', { name: 'Закрыть', exact: true }).click(); await expect(holder(page)).toHaveCount(0);
});

test('Notification inside Modal preserves input focus, coexists with Message and leaves Escape to its host', async ({ page }) => {
  await button(page, 'Open Notification Modal').click(); const modal = page.getByRole('dialog', { name: 'Notification host modal', exact: true });
  const input = modal.getByRole('textbox', { name: 'Modal Notification input', exact: true }); await input.fill('Modal draft');
  await page.keyboard.press('Control+Alt+j'); await expect(notices(page, 'modal-notifications')).toBeVisible(); await expect(input).toBeFocused();
  await modal.getByRole('button', { name: 'Show Message beside Notification', exact: true }).click();
  await expect(modal.getByRole('status')).toHaveText('Message beside Notification'); await expect(notices(page, 'modal-notifications')).toBeVisible();
  await input.focus(); await page.keyboard.press('Escape'); await expect(modal).toBeHidden(); await expect(holder(page, 'modal-notifications')).toBeHidden();
  await button(page, 'Open Notification Modal').click(); await expect(notices(page, 'modal-notifications')).toBeVisible(); await expect(input).toHaveValue('Modal draft');
});

test('Notification restores focus within the active Modal when its close button is used', async ({ page }) => {
  await button(page, 'Open Notification Modal').click(); await page.keyboard.press('Control+Alt+j');
  await notices(page, 'modal-notifications').getByRole('button', { name: 'Закрыть', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(holder(page, 'modal-notifications')).toHaveCount(0); await expect(button(page, 'After Modal Notification')).toBeFocused();
});

test('Notification waits in a closed Modal before starting its full duration', async ({ page }) => {
  await button(page, 'Queue Modal Notification').click(); await page.clock.fastForward(5000); await expect(holder(page, 'modal-notifications')).toBeHidden();
  await button(page, 'Open Notification Modal').click(); await expect(notices(page, 'modal-notifications')).toBeVisible();
  await page.clock.fastForward(1500); await expect(holder(page, 'modal-notifications')).toHaveCount(0);
});

test('Notification pauses background holders under a native Modal', async ({ page }) => {
  await setting(page, 'duration', '1'); await button(page, 'Notification info').click(); await button(page, 'Open Notification Modal').click();
  await expect(holder(page)).toBeHidden(); await page.clock.fastForward(5000); await expect(events(page)).toHaveText('[]');
  await page.keyboard.press('Escape'); await expect(notices(page)).toBeVisible(); await page.clock.fastForward(1500); await expect(holder(page)).toHaveCount(0);
});

test('Notification works in Drawer and preserves its focus and scroll contract', async ({ page }) => {
  await button(page, 'Open Notification Drawer').click(); const drawer = page.getByRole('dialog', { name: 'Notification host drawer', exact: true });
  const input = drawer.getByRole('textbox', { name: 'Drawer Notification input', exact: true }); await input.fill('Drawer draft');
  await page.keyboard.press('Control+Alt+l'); await expect(notices(page, 'drawer-notifications')).toBeVisible(); await expect(input).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden'); await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden(); await expect(holder(page, 'drawer-notifications')).toBeHidden(); await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});

test('Notification follows the active nested modal context and resumes its parent after closing', async ({ page }) => {
  await button(page, 'Open Notification Modal').click(); await page.keyboard.press('Control+Alt+j'); await expect(notices(page, 'modal-notifications')).toBeVisible();
  await button(page, 'Open nested Notification Drawer').click(); await button(page, 'Show nested Notification').click();
  await expect(notices(page, 'nested-notifications')).toBeVisible(); await expect(holder(page, 'modal-notifications')).toBeHidden();
  await page.keyboard.press('Escape'); await expect(holder(page, 'nested-notifications')).toBeHidden(); await expect(notices(page, 'modal-notifications')).toBeVisible();
});

test.describe('mobile Notification', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('wraps long content and keeps actions and closing reachable without widening the page', async ({ page }, testInfo) => {
    await button(page, 'Notification long content').tap(); await settled(page);
    const bounds = (await notices(page).boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await notices(page).getByRole('textbox', { name: 'Notification action input', exact: true }).fill('Mobile draft');
    await notices(page).getByRole('button', { name: 'Notification action', exact: true }).tap();
    await expect(page.getByRole('status', { name: 'Notification actions', exact: true })).toHaveText('1');
    await page.screenshot({ path: testInfo.outputPath('notification-mobile.png') });
    await notices(page).getByRole('button', { name: 'Закрыть', exact: true }).tap(); await expect(holder(page)).toHaveCount(0);
  });
});
