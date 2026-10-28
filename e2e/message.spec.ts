import type { Page } from '@playwright/test';
import { test, expect } from './test';

const list = (page: Page, id = 'fixture-messages') => page.locator(`#${id}`);
const notices = (page: Page, id = 'fixture-messages') => list(page, id).locator('.ant-message-notice:not([inert])');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const events = (page: Page) => page.locator('output[aria-label="Message events"]');
const completions = (page: Page) => page.locator('output[aria-label="Message completions"]');
async function setting(page: Page, name: string, value: string) { await page.getByRole('combobox', { name: `Message ${name}`, exact: true }).selectOption(value); }

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto('http://127.0.0.1:4174?fixture=message');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
});

test('Message shows a passive native popover above the page without moving focus', async ({ page }, testInfo) => {
  const input = page.getByRole('textbox', { name: 'Message focus target', exact: true });
  await input.fill('Keep my draft');
  await page.keyboard.press('Control+Alt+n');
  await expect(list(page)).toBeVisible();
  await expect(list(page)).toHaveAttribute('popover', 'manual');
  await expect(notices(page)).toHaveRole('status');
  await expect(notices(page)).toHaveAttribute('aria-atomic', 'true');
  await expect(notices(page)).toContainText('Keyboard notification');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Keep my draft');
  await expect(notices(page).locator('button, [tabindex]')).toHaveCount(0);
  await expect(list(page).locator('.ant-message-notice-icon')).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  const bounds = (await notices(page).boundingBox())!;
  expect(bounds.y).toBeCloseTo(8, 0);
  expect(bounds.x + bounds.width / 2).toBeCloseTo(page.viewportSize()!.width / 2, 0);
  await page.screenshot({ path: testInfo.outputPath('message-light.png') });
});

test('Message renders all five types and respects the ordinary FIFO limit', async ({ page }) => {
  for (const type of ['info', 'success', 'warning', 'error', 'loading']) await button(page, `Message ${type}`).click();
  await expect(notices(page)).toHaveCount(3);
  await expect(notices(page)).toHaveText(['Warning message', 'Error message', 'Loading message']);
  await expect(notices(page).last()).toHaveClass(/ant-message-notice-loading/);
  await expect(notices(page).last().locator('svg')).toHaveClass(/loading/);
  await expect(events(page)).toHaveText('["close:Info message","close:Success message"]');
});

test('Message auto-dismisses the default three seconds and completes its returned handle', async ({ page }) => {
  await button(page, 'Message default duration').click();
  await expect(notices(page)).toContainText('Default duration');
  await page.clock.fastForward(4000);
  await expect(list(page)).toHaveCount(0);
});

test('Message preserves persistent duration zero and closes through a callable handle', async ({ page }) => {
  await button(page, 'Message info').click();
  await page.clock.fastForward(20_000);
  await expect(notices(page)).toContainText('Info message');
  await button(page, 'Close last Message').click();
  await expect(list(page)).toHaveCount(0);
  await expect(events(page)).toHaveText('["close:Info message"]');
  await expect(completions(page)).toHaveText('["Info message:true"]');
});

test('Message updates a loading key in place and closes the latest content through the original handle', async ({ page }) => {
  await button(page, 'Start Message task').click();
  const element = await notices(page).elementHandle();
  await button(page, 'Finish Message task').click();
  await expect(notices(page)).toHaveCount(1);
  await expect(notices(page)).toHaveText('Saved task');
  expect(await notices(page).evaluate((node, original) => node === original, element)).toBe(true);
  await expect(notices(page)).toHaveClass(/ant-message-notice-success/);
  await button(page, 'Close task handle').click();
  await expect(list(page)).toHaveCount(0);
  await expect(events(page)).toHaveText('["close:Saved task"]');
  await expect(completions(page)).toHaveText('["Saving task:true","Saved task:true"]');
});

test('Message resets the deadline when an active key is updated', async ({ page }) => {
  await setting(page, 'duration', '1');
  await button(page, 'Start Message task').click();
  await page.clock.fastForward(10_000);
  await expect(notices(page)).toHaveText('Saving task');
  await button(page, 'Finish Message task').click();
  await page.clock.fastForward(300);
  await expect(notices(page)).toHaveText('Saved task');
  await page.clock.fastForward(1000);
  await expect(list(page)).toHaveCount(0);
  await expect(events(page)).toHaveText('["close:Saved task"]');
});

test('Message ignores old handles after a closed key is reused', async ({ page }) => {
  await button(page, 'Start Message task').click();
  await button(page, 'Close task handle').click();
  await expect(list(page)).toHaveCount(0);
  await button(page, 'Start Message task').click();
  await button(page, 'Close previous task handle').click();
  await expect(notices(page)).toHaveText('Saving task');
  await expect(events(page)).toHaveText('["close:Saving task"]');
});

test('Message enforces maxCount without moving updated keys to the end', async ({ page }) => {
  await setting(page, 'limit', '2');
  await button(page, 'Recreate Message instance').click();
  await button(page, 'Start Message task').click();
  await button(page, 'Add unique Message').click();
  await button(page, 'Finish Message task').click();
  await button(page, 'Add unique Message').click();
  await expect(notices(page)).toHaveText(['Message 1', 'Message 2']);
  await expect(events(page)).toHaveText('["close:Saved task"]');
});

test('Message destroys one key or all notices without affecting another instance', async ({ page }) => {
  await button(page, 'Start Message task').click();
  await button(page, 'Message info').click();
  await button(page, 'Show independent Message').click();
  await button(page, 'Destroy Message task').click();
  await expect(notices(page)).toHaveText('Info message');
  await button(page, 'Destroy all Messages').click();
  await expect(list(page)).toHaveCount(0);
  await expect(notices(page, 'secondary-messages')).toHaveText('Independent message');
});

test('Message pauses hover deadlines and resumes only the remaining time', async ({ page }) => {
  await setting(page, 'duration', '1');
  await button(page, 'Message info').click();
  await notices(page).hover();
  await page.clock.fastForward(5000);
  await expect(notices(page)).toHaveText('Info message');
  await button(page, 'Add unique Message').hover();
  await page.clock.fastForward(1500);
  await expect(list(page)).toHaveCount(0);
});

test('Message can continue its timer while hovered when pauseOnHover is disabled', async ({ page }) => {
  await page.getByLabel('Pause Message on hover', { exact: true }).uncheck();
  await setting(page, 'duration', '1');
  await button(page, 'Message info').click();
  await notices(page).hover();
  await page.clock.fastForward(2000);
  await expect(list(page)).toHaveCount(0);
});

test('Message pauses a hidden context without consuming its queued duration', async ({ page }) => {
  await page.getByLabel('Hide Message context', { exact: true }).check();
  await setting(page, 'duration', '1');
  await button(page, 'Message info').click();
  await page.clock.fastForward(5000);
  await expect(list(page)).toBeHidden();
  await expect(events(page)).toHaveText('[]');
  await page.getByLabel('Hide Message context', { exact: true }).uncheck();
  await expect(notices(page)).toBeVisible();
  await page.clock.fastForward(1500);
  await expect(list(page)).toHaveCount(0);
});

test('Message pauses a hidden document immediately while animation frames are suspended', async ({ page }) => {
  await setting(page, 'duration', '1');
  await button(page, 'Message info').click();
  await expect(notices(page)).toBeVisible();
  await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.evaluate(() => {
    // Скрытая вкладка не обязана выдавать следующий animation frame.
    const request = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => document.visibilityState === 'hidden' ? 0 : request(callback);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(list(page)).toBeHidden();
  await page.clock.fastForward(5000);
  await expect(events(page)).toHaveText('[]');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'visibilityState');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(notices(page)).toBeVisible();
  await page.clock.fastForward(1500);
  await expect(list(page)).toHaveCount(0);
});

test('Message queues before its first holder mount and starts the clock after appearing', async ({ page }) => {
  await button(page, 'Queue before Message mount').click();
  await page.clock.fastForward(5000);
  await expect(list(page)).toHaveCount(0);
  await button(page, 'Toggle Message holder').click();
  await expect(notices(page)).toHaveText('Queued before mount');
  await page.clock.fastForward(1500);
  await expect(list(page)).toHaveCount(0);
});

test('Message drops late calls while detached and reconnects the same instance cleanly', async ({ page }) => {
  await button(page, 'Message info').click();
  await button(page, 'Toggle Message holder').click();
  await expect(list(page)).toHaveCount(0);
  await expect(completions(page)).toHaveText('["Info message:false"]');
  await button(page, 'Message success').click();
  await expect(completions(page)).toHaveText('["Info message:false","Success message:false"]');
  await expect(events(page)).toHaveText('[]');
  await button(page, 'Toggle Message holder').click();
  await button(page, 'Message warning').click();
  await expect(notices(page)).toHaveText('Warning message');
});

test('Message holder replacement cannot inherit an old instance or its timers', async ({ page }) => {
  await button(page, 'Start Message task').click();
  await button(page, 'Recreate Message instance').click();
  await expect(completions(page)).toHaveText('["Saving task:false"]');
  await button(page, 'Message success').click();
  await button(page, 'Close task handle').click();
  await expect(notices(page)).toHaveText('Success message');
  await expect(events(page)).toHaveText('[]');
});

test('Message completion follows its exit animation and removal from the DOM', async ({ page }) => {
  await button(page, 'Message info').click();
  await expect(notices(page)).toBeVisible();
  await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  await notices(page).evaluate((node) => node.style.setProperty('--ant-motion-duration-mid', '10s'));
  await button(page, 'Close last Message').click();
  const root = list(page).locator('.ant-message-notice');
  const count = await root.evaluate((node) => { const motions = node.getAnimations(); for (const motion of motions) motion.pause(); return motions.length; });
  expect(count).toBeGreaterThan(0);
  await expect(root).toHaveAttribute('inert', '');
  await expect(root).toHaveAttribute('aria-hidden', 'true');
  await expect(events(page)).toHaveText('["close:Info message"]');
  await expect(completions(page)).toHaveText('[]');
  await root.evaluate((node) => { for (const motion of node.getAnimations()) motion.finish(); });
  await expect(list(page)).toHaveCount(0);
  await expect(completions(page)).toHaveText('["Info message:true"]');
});

test('Message cancels pending exit callbacks when its holder is removed', async ({ page }) => {
  await button(page, 'Message info').click();
  await expect(notices(page)).toBeVisible();
  await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  await notices(page).evaluate((node) => node.style.setProperty('--ant-motion-duration-mid', '10s'));
  await button(page, 'Close last Message').click();
  await list(page).locator('.ant-message-notice').evaluate((node) => { for (const motion of node.getAnimations()) motion.pause(); });
  await page.keyboard.press('Control+Alt+m');
  await expect(list(page)).toHaveCount(0);
  await expect(completions(page)).toHaveText('["Info message:false"]');
  await page.keyboard.press('Control+Alt+m');
  await button(page, 'Message success').click();
  await expect(notices(page)).toHaveText('Success message');
});

test('Message supports passive snippets, custom icons and explicit urgent roles', async ({ page }) => {
  await setting(page, 'role', 'alert');
  await button(page, 'Message custom content').click();
  await expect(notices(page)).toHaveRole('alert');
  await expect(notices(page).locator('strong')).toHaveText('Rich message');
  await expect(notices(page).locator('em')).toHaveText('with markup');
  await expect(notices(page).locator('.ant-message-notice-icon')).toHaveText('★');
  await expect(notices(page).locator('.ant-message-notice-icon')).toHaveAttribute('aria-hidden', 'true');
});

test('Message supports live top positioning without replacing existing notices', async ({ page }) => {
  await button(page, 'Message info').click();
  await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  await setting(page, 'top', '80');
  expect((await notices(page).boundingBox())!.y).toBeCloseTo(80, 0);
  await setting(page, 'top', '10vh');
  expect((await notices(page).boundingBox())!.y).toBeCloseTo(page.viewportSize()!.height * 0.1, 0);
  await expect(notices(page)).toHaveText('Info message');
});

test('Message inherits dark compact RTL styles and preserves logical icon order', async ({ page }, testInfo) => {
  for (const label of ['Right to left', 'Dark Message theme', 'Compact Message theme']) await page.getByLabel(label, { exact: true }).check();
  await button(page, 'Message error').click();
  await expect(notices(page)).toHaveCSS('background-color', 'rgb(31, 31, 31)');
  await expect(notices(page)).toHaveCSS('font-size', '12px');
  await expect(notices(page)).toHaveCSS('direction', 'rtl');
  await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
  const icon = (await notices(page).locator('.ant-message-notice-icon').boundingBox())!;
  const title = (await notices(page).locator('.ant-message-notice-title').boundingBox())!;
  expect(icon.x).toBeGreaterThan(title.x);
  await page.screenshot({ path: testInfo.outputPath('message-dark-rtl.png') });
});

test('Message disables entrance, exit and spinner motion under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await button(page, 'Message loading').click();
  expect(await notices(page).evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  await button(page, 'Close last Message').click();
  await expect(list(page)).toHaveCount(0);
  await expect(completions(page)).toHaveText('["Loading message:true"]');
});

test('Message keeps feedback available when form controls are disabled', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await button(page, 'Message success').click();
  await expect(notices(page)).toHaveText('Success message');
});

test('Message inside Modal stays above its host and preserves input focus and Escape', async ({ page }) => {
  await button(page, 'Open Message Modal').click();
  const host = page.getByRole('dialog', { name: 'Message host modal', exact: true });
  const input = host.getByRole('textbox', { name: 'Modal Message input', exact: true });
  await input.fill('Modal draft retained');
  await page.keyboard.press('Control+Alt+s');
  await expect(notices(page, 'modal-messages')).toHaveText('Modal notification');
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(host).toBeHidden();
  await expect(list(page, 'modal-messages')).toBeHidden();
  await button(page, 'Open Message Modal').click();
  await expect(notices(page, 'modal-messages')).toBeVisible();
  await expect(input).toHaveValue('Modal draft retained');
});

test('Message waits for a closed Modal context before starting its deadline', async ({ page }) => {
  await button(page, 'Queue Modal message').click();
  await page.clock.fastForward(5000);
  await expect(list(page, 'modal-messages')).toBeHidden();
  await button(page, 'Open Message Modal').click();
  await expect(notices(page, 'modal-messages')).toHaveText('Queued Modal message');
  await page.clock.fastForward(1500);
  await expect(list(page, 'modal-messages')).toHaveCount(0);
});

test('Message pauses background holders until their native Modal closes', async ({ page }) => {
  await setting(page, 'duration', '1');
  await button(page, 'Message info').click();
  await button(page, 'Open Message Modal').click();
  const host = page.getByRole('dialog', { name: 'Message host modal', exact: true });
  await expect(list(page)).toBeHidden();
  await page.clock.fastForward(5000);
  await expect(events(page)).toHaveText('[]');
  await page.keyboard.press('Escape');
  await expect(host).toBeHidden();
  await expect(notices(page)).toHaveText('Info message');
  await page.clock.fastForward(1500);
  await expect(list(page)).toHaveCount(0);
});

test('Message works in Drawer without interfering with its keyboard and scrolling contract', async ({ page }) => {
  await button(page, 'Open Message Drawer').click();
  const host = page.getByRole('dialog', { name: 'Message host drawer', exact: true });
  const input = host.getByRole('textbox', { name: 'Drawer Message input', exact: true });
  await input.fill('Drawer draft retained');
  await page.keyboard.press('Control+Alt+d');
  await expect(notices(page, 'drawer-messages')).toHaveText('Drawer notification');
  await expect(input).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(host).toBeHidden();
  await expect(list(page, 'drawer-messages')).toBeHidden();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});

test('Message follows the active nested modal context without resurfacing its parent holder', async ({ page }) => {
  await button(page, 'Open Message Modal').click();
  const host = page.getByRole('dialog', { name: 'Message host modal', exact: true });
  await host.getByRole('button', { name: 'Show Modal message', exact: true }).click();
  await expect(notices(page, 'modal-messages')).toBeVisible();
  await host.getByRole('button', { name: 'Open nested Message Drawer', exact: true }).click();
  const nested = page.getByRole('dialog', { name: 'Nested Message drawer', exact: true });
  await nested.getByRole('button', { name: 'Show nested Message', exact: true }).click();
  await expect(notices(page, 'nested-messages')).toHaveText('Nested notification');
  await expect(list(page, 'modal-messages')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(nested).toBeHidden();
  await expect(notices(page, 'modal-messages')).toBeVisible();
  await expect(list(page, 'nested-messages')).toBeHidden();
});

test.describe('mobile Message', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('wraps long feedback within the viewport and leaves background controls reachable', async ({ page }, testInfo) => {
    await button(page, 'Message long content').tap();
    await expect(notices(page)).toBeVisible();
    await expect.poll(() => notices(page).evaluate((node) => node.getAnimations().length)).toBe(0);
    const bounds = (await notices(page).boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('message-mobile.png') });
    await button(page, 'Destroy all Messages').tap();
    await expect(list(page)).toHaveCount(0);
  });
});
