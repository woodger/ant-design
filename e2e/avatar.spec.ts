import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-avatar');
const owner = (page: Page) => page.locator('#avatar-owner');
const text = (page: Page) => host(page).locator('.ant-avatar-string');
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Avatar ${name}`, exact: true }).selectOption(value);
const input = (page: Page, name: string) => page.getByRole('textbox', { name: `Avatar ${name}`, exact: true });
const check = (page: Page, name: string, value = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(value);
const number = (page: Page, name: string, value: string) => page.getByRole('spinbutton', { name: `Avatar ${name}`, exact: true }).fill(value);
const errors = (page: Page) => page.getByRole('status', { name: 'Avatar image errors', exact: true });
const loaded = (page: Page) => expect.poll(() => host(page).locator('img').evaluate(node => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0)).toBe(true);
const scale = (page: Page) => text(page).evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a);
const goodSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#1677ff"/></svg>';

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=avatar'); await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible(); });

test('Avatar keeps a full accessible name while fitting initials without announcements', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('img'); await expect(host(page)).toHaveAccessibleName('Fixture user'); await expect(host(page)).toHaveAccessibleDescription('Participant profile'); await expect(text(page)).toHaveText('AVATAR'); await expect.poll(() => scale(page)).toBeLessThan(1);
  const width = await text(page).evaluate(node => node.getBoundingClientRect().width); expect(width).toBeLessThanOrEqual(24.5); await expect(host(page)).not.toHaveAttribute('tabindex'); await expect(host(page)).not.toHaveAttribute('aria-live'); await expect(host(page).locator('[role="status"]')).toHaveCount(0);
  await page.locator('#avatar-surface').screenshot({ path: testInfo.outputPath('avatar-light.png') });
});

test('Avatar leaves native Tab Enter Space and form submission to its owner', async ({ page }) => {
  await page.getByRole('button', { name: 'Before Avatar', exact: true }).focus(); await page.keyboard.press('Tab'); await expect(owner(page)).toBeFocused(); await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await expect(page.getByRole('status', { name: 'Avatar submissions', exact: true })).toHaveText('2');
  await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'After Avatar', exact: true })).toBeFocused();
});

test('Avatar preserves its root and focused owner across image and text changes', async ({ page }) => {
  const root = await host(page).elementHandle(); const button = await owner(page).elementHandle(); await owner(page).focus();
  for (let index = 0; index < 4; index++) { await page.keyboard.press('Control+Alt+Shift+F11'); await expect(owner(page)).toBeFocused(); expect(await host(page).evaluate((node, previous) => node === previous, root)).toBe(true); expect(await owner(page).evaluate((node, previous) => node === previous, button)).toBe(true); }
  await expect(text(page)).toHaveText('AVATAR'); await expect(host(page)).toHaveAccessibleName('Fixture user');
});

test('Avatar renders an image before icon and text and forwards native image attributes', async ({ page }) => {
  await check(page, 'Avatar icon fallback'); await setting(page, 'image mode', 'image'); await loaded(page); await expect(host(page).locator('.ant-avatar-icon-content')).toHaveCount(0); await expect(text(page)).toHaveCount(0); await expect(host(page).locator('img')).toHaveAttribute('alt', ''); await expect(host(page).locator('img')).toHaveAttribute('aria-hidden', 'true'); await expect(host(page).locator('img')).toHaveAttribute('draggable', 'false'); await expect(host(page).locator('img')).toHaveAttribute('crossorigin', 'anonymous'); await expect(host(page).locator('img')).toHaveCSS('object-fit', 'cover');
});

test('Avatar falls back once to icon then initials and recovers on a new source', async ({ page }) => {
  await check(page, 'Avatar icon fallback'); await setting(page, 'image mode', 'broken'); await expect(errors(page)).toHaveText('1'); await expect(host(page).locator('img')).toHaveCount(0); await expect(host(page).locator('.ant-avatar-icon-content svg')).toBeVisible(); await expect(host(page)).toHaveAccessibleName('Fixture user');
  await check(page, 'Avatar icon fallback', false); await expect(text(page)).toHaveText('AVATAR'); await expect(errors(page)).toHaveText('1'); await setting(page, 'image mode', 'image'); await loaded(page); await setting(page, 'image mode', 'broken'); await expect(errors(page)).toHaveText('2'); await expect(text(page)).toBeVisible();
});

test('Avatar lets onError prevent fallback without repeated callbacks on unrelated updates', async ({ page }) => {
  await check(page, 'Prevent Avatar fallback'); await setting(page, 'image mode', 'broken'); await expect(errors(page)).toHaveText('1'); await expect(host(page).locator('img')).toHaveCount(1); await expect(text(page)).toHaveCount(0); await input(page, 'text').fill('Changed'); await setting(page, 'shape', 'square'); await expect(errors(page)).toHaveText('1'); await expect(host(page)).toHaveAccessibleName('Fixture user');
  await check(page, 'Prevent Avatar fallback', false); await setting(page, 'image mode', 'none'); await setting(page, 'image mode', 'broken'); await expect(errors(page)).toHaveText('2'); await expect(text(page)).toHaveText('Changed');
});

test('Avatar preserves a replacement source chosen synchronously by onError', async ({ page }) => {
  await check(page, 'Recover Avatar in onError'); const root = await host(page).elementHandle(); await setting(page, 'image mode', 'broken'); await expect(errors(page)).toHaveText('1'); await loaded(page); await expect(host(page)).toHaveClass(/ant-avatar-image/); expect(await host(page).evaluate((node, previous) => node === previous, root)).toBe(true);
});

test('Avatar retries when srcSet changes even when src stays the same', async ({ page }) => {
  await page.route('**/avatar-good.svg', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: goodSvg }));
  await setting(page, 'image mode', 'broken'); await expect(errors(page)).toHaveText('1'); await input(page, 'srcSet').fill('/avatar-good.svg 1x'); await loaded(page); await expect(host(page).locator('img')).toHaveAttribute('srcset', '/avatar-good.svg 1x'); expect(await host(page).locator('img').evaluate(node => node instanceof HTMLImageElement ? node.currentSrc : '')).toContain('/avatar-good.svg'); await expect(errors(page)).toHaveText('1');
  await input(page, 'srcSet').fill(''); await expect(errors(page)).toHaveText('2'); await expect(text(page)).toBeVisible();
});

test('Avatar detaches error listeners from replaced images and unmounted roots', async ({ page }) => {
  await setting(page, 'image mode', 'image'); await loaded(page); const previous = await host(page).locator('img').elementHandle(); await setting(page, 'image mode', 'none'); await previous!.evaluate(node => node.dispatchEvent(new Event('error'))); await expect(errors(page)).toHaveText('0');
  await setting(page, 'image mode', 'image'); await loaded(page); const unmounted = await host(page).locator('img').elementHandle(); await owner(page).focus(); await page.keyboard.press('Control+Alt+Shift+F12'); await expect(host(page)).toHaveCount(0); await unmounted!.evaluate(node => node.dispatchEvent(new Event('error'))); await expect(errors(page)).toHaveText('0'); await expect(owner(page)).toBeFocused();
});

test('Avatar inherits context size and supports explicit named and numeric sizes', async ({ page }) => {
  await expect(host(page)).toHaveCSS('width', '32px'); await setting(page, 'context size', 'small'); await expect(host(page)).toHaveCSS('width', '24px'); await setting(page, 'size', 'medium'); await expect(host(page)).toHaveCSS('width', '32px'); await setting(page, 'size', 'large'); await expect(host(page)).toHaveCSS('width', '40px');
  await setting(page, 'size', 'custom'); await number(page, 'numeric size', '50.5'); await expect(host(page)).toHaveCSS('width', '50.5px'); await expect(host(page)).toHaveCSS('height', '50.5px'); await expect(host(page)).toHaveCSS('font-size', '18px'); await check(page, 'Avatar icon fallback'); await expect(host(page)).toHaveCSS('font-size', '25.25px');
  for (const value of ['0', '-10']) { await number(page, 'numeric size', value); await expect(host(page)).toHaveCSS('width', '24px'); }
});

test('Avatar applies circle and size-specific square radii', async ({ page }) => {
  await expect(host(page)).toHaveCSS('border-radius', '50%'); await setting(page, 'shape', 'square'); await expect(host(page)).toHaveCSS('border-radius', '6px'); await setting(page, 'size', 'small'); await expect(host(page)).toHaveCSS('border-radius', '4px'); await setting(page, 'size', 'large'); await expect(host(page)).toHaveCSS('border-radius', '8px');
});

test('Avatar refits live text gap font weight and custom root width', async ({ page }) => {
  await input(page, 'text').fill('A'); await expect.poll(() => scale(page)).toBe(1); await input(page, 'text').fill('LONGUSERNAME'); await expect.poll(() => scale(page)).toBeLessThan(0.4); const previous = await scale(page);
  await number(page, 'gap', '8'); await expect.poll(() => scale(page)).toBeLessThan(previous); await input(page, 'root style').fill('width: 96px; height: 96px'); await expect(host(page)).toHaveCSS('width', '96px'); await expect.poll(() => text(page).evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(80, 0);
  await check(page, 'Rich Avatar text'); await expect(text(page).locator('strong')).toHaveText('LONGUSERNAME'); await expect.poll(() => text(page).evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(80, 0); await input(page, 'text').fill('A'); await expect.poll(() => scale(page)).toBe(1);
});

test('Avatar respects owner style precedence for numeric size', async ({ page }) => {
  await setting(page, 'size', 'custom'); await input(page, 'root style').fill('width: 80px; height: 80px; font-size: 20px; background: rgb(114, 46, 209)'); await expect(host(page)).toHaveCSS('width', '80px'); await expect(host(page)).toHaveCSS('height', '80px'); await expect(host(page)).toHaveCSS('font-size', '20px'); await expect(host(page)).toHaveCSS('background-color', 'rgb(114, 46, 209)'); await expect(host(page)).toHaveClass(/custom-avatar/); await expect(host(page)).toHaveAttribute('title', 'Avatar title');
});

test('Avatar refits after a concealed ancestor becomes visible', async ({ page }) => {
  await check(page, 'Concealed Avatar'); await input(page, 'text').fill('VeryLongHiddenAvatarName'); await check(page, 'Concealed Avatar', false); await expect(text(page)).toBeVisible(); await expect.poll(() => text(page).evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(24, 0);
});

test('Avatar keeps decorative content and custom snippet controls out of the tab order', async ({ page }) => {
  await check(page, 'Decorative Avatar'); await expect(host(page)).toHaveAttribute('aria-hidden', 'true'); await expect(host(page)).not.toHaveAttribute('role'); await expect(page.getByRole('button', { name: 'Inert Avatar icon', exact: true })).toHaveCount(0); await expect(page.getByRole('button', { name: 'Inert Avatar text', exact: true })).toHaveCount(0);
  await page.locator('#avatar-inert-text button').evaluate(node => (node as HTMLButtonElement).focus()); await expect(page.locator('#avatar-inert-text button')).not.toBeFocused();
});

test('Avatar uses external names and treats unnamed avatars as decorative', async ({ page }) => {
  await check(page, 'Linked Avatar name'); await expect(host(page)).toHaveAccessibleName('External avatar name'); await expect(host(page)).toHaveAttribute('aria-labelledby', 'avatar-fixture-name'); await check(page, 'Linked Avatar name', false); await input(page, 'alt').fill(''); await expect(host(page)).toHaveAttribute('aria-hidden', 'true'); await expect(host(page)).not.toHaveAttribute('role');
  await input(page, 'root label').fill('Named avatar'); await expect(host(page)).toHaveAccessibleName('Named avatar'); await expect(host(page)).toHaveRole('img'); await expect(host(page)).not.toHaveAttribute('aria-hidden');
});

test('Avatar escapes text and retains a full accessible name independently of initials', async ({ page }) => {
  await input(page, 'text').fill('<img src=x>'); await expect(text(page)).toHaveText('<img src=x>'); await expect(host(page).locator('img')).toHaveCount(0); await input(page, 'alt').fill('A much longer participant name'); await expect(host(page)).toHaveAccessibleName('A much longer participant name'); await expect(text(page)).toHaveText('<img src=x>');
});

test('Avatar disconnects its real resize observers across image changes and unmount', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.ResizeObserver; const active = new Set<ResizeObserver>();
    window.ResizeObserver = class extends Native {
      override observe(node: Element, options?: ResizeObserverOptions) { super.observe(node, options); if (node.id === 'fixture-avatar' || node.parentElement?.id === 'fixture-avatar') active.add(this); }
      override disconnect() { active.delete(this); super.disconnect(); }
    };
    Object.assign(window, { avatarObserverCount: () => active.size });
  });
  await page.reload(); const count = () => page.evaluate(() => (window as unknown as { avatarObserverCount(): number }).avatarObserverCount()); await expect.poll(count).toBe(1); await setting(page, 'image mode', 'image'); await loaded(page); await expect.poll(count).toBe(0);
  await setting(page, 'image mode', 'none'); await expect.poll(count).toBe(1); await owner(page).focus(); await page.keyboard.press('Control+Alt+Shift+F12'); await expect.poll(count).toBe(0); await expect(owner(page)).toBeFocused(); await page.keyboard.press('Control+Alt+Shift+F12'); await expect.poll(count).toBe(1);
});

test('Avatar follows dark compact and RTL context without adding motion', async ({ page }, testInfo) => {
  await check(page, 'Dark Avatar theme'); await check(page, 'Compact Avatar theme'); await check(page, 'Right to left'); await expect(host(page)).toHaveAttribute('dir', 'rtl'); await expect(host(page)).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.25)'); await expect(host(page)).toHaveCSS('color', 'rgb(255, 255, 255)'); await expect(host(page)).toHaveCSS('width', '32px');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(host(page)).toHaveCSS('animation-name', 'none'); await expect(text(page)).toHaveCSS('transition-duration', '0s'); await page.locator('#avatar-surface').screenshot({ path: testInfo.outputPath('avatar-dark-compact-rtl.png') });
});

for (const kind of ['Modal', 'Drawer']) test(`Avatar fits inside ${kind} and leaves focus restoration to its host`, async ({ page }) => {
  const opener = page.getByRole('button', { name: `Open Avatar ${kind}`, exact: true }); await opener.click(); const dialog = page.getByRole('dialog', { name: `Avatar host ${kind.toLowerCase()}`, exact: true }); const avatar = dialog.getByRole('img', { name: `${kind} user`, exact: true });
  await expect(avatar).toBeVisible(); await expect.poll(() => avatar.locator('.ant-avatar-string').evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(56, 0); await dialog.getByRole('button', { name: `After ${kind} Avatar`, exact: true }).focus(); await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
});

test('Avatar fits long initials and its native owner on a 320px viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 }); await input(page, 'text').fill('LongUnbrokenParticipantName'.repeat(8)); await expect.poll(() => text(page).evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(24, 0);
  const bounds = await page.locator('#avatar-surface').evaluate(node => ({ right: node.getBoundingClientRect().right, width: node.clientWidth, scroll: node.scrollWidth })); expect(bounds.right).toBeLessThanOrEqual(320); expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1); await page.locator('#avatar-surface').screenshot({ path: testInfo.outputPath('avatar-mobile.png') });
});
