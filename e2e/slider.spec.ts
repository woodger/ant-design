import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

async function railPoint(input: Locator, fraction: number) {
  await input.scrollIntoViewIfNeeded();
  const rail = (await input.locator('..').locator('.ant-slider-rail').boundingBox())!;
  const vertical = await input.getAttribute('aria-orientation') === 'vertical';

  return { x: rail.x + rail.width * (vertical ? 0.5 : fraction), y: rail.y + rail.height * (vertical ? fraction : 0.5) };
}

async function clickRail(page: Page, input: Locator, fraction: number) {
  const point = await railPoint(input, fraction);
  await page.mouse.click(point.x, point.y);
}

async function startDrag(page: Page, input: Locator, fraction: number) {
  await input.scrollIntoViewIfNeeded();
  const handle = (await input.locator('..').locator('.ant-slider-handle').boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  const target = await railPoint(input, fraction);
  await page.mouse.move(target.x, target.y, { steps: 4 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Slider keeps keyboard updates live and completes once after keyup including repeats and Home/End', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await input.focus();
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowRight');
  await expect(input).toHaveValue('35');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
  await page.keyboard.up('ArrowRight');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[25,30,35]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[35]');
  await input.press('Home');
  await expect(input).toHaveValue('0');
  await input.press('Home');
  await input.press('End');
  await expect(input).toHaveValue('100');
  await input.press('ArrowRight');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[35,0,100]');
  await expect(page.getByRole('status', { name: 'Slider submissions', exact: true })).toHaveText('0');
});

test('Slider labels focus the native range and its visible handle has a keyboard focus ring', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await page.getByText('Bound Slider', { exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('20');
  await input.press('ArrowUp');
  await expect.poll(() => input.locator('..').locator('.ant-slider-handle').evaluate((element) => getComputedStyle(element, '::after').outlineWidth)).toBe('6px');
  await expect(input).toHaveAccessibleName('Bound Slider');
});

test('Slider clicks the rail and completes a drag beyond its bounds only after pointer release', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await clickRail(page, input, 0.75);
  await expect(input).toHaveValue('75');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[75]');
  await startDrag(page, input, 0.9);
  await expect(input).toHaveValue('90');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[75]');
  const rail = (await input.locator('..').locator('.ant-slider-rail').boundingBox())!;
  await page.mouse.move(rail.x + rail.width + 100, rail.y + 60);
  await expect(input).toHaveValue('100');
  await page.mouse.up();
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[75,100]');
  await expect(input).toBeFocused();
});

test('Slider and InputNumber share one numeric owner without feedback callbacks and retain decimal steps', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  const exact = page.getByRole('spinbutton', { name: 'Exact Slider value', exact: true });
  await exact.fill('45');
  await expect(input).toHaveValue('45');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[]');
  await input.press('ArrowUp');
  await expect(exact).toHaveValue('50');
  await page.getByRole('button', { name: 'Use fractional Slider', exact: true }).click();
  await input.press('ArrowRight');
  await expect(input).toHaveValue('0.3');
  await expect(exact).toHaveValue('0.3');
  await input.press('ArrowLeft');
  await expect(input).toHaveValue('0.2');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[50,0.3,0.2]');
});

test('Slider accepts external values and normalized display without emitting callbacks', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await page.getByRole('button', { name: 'Set exceeded Slider', exact: true }).click();
  await expect(input).toHaveValue('100');
  await expect(page.getByRole('status', { name: 'Slider owner', exact: true })).toHaveText('120');
  await page.getByRole('button', { name: 'Shrink Slider range', exact: true }).click();
  await expect(input).toHaveValue('50');
  await expect(input).toHaveAttribute('aria-valuemax', '50');
  await page.getByRole('button', { name: 'Set non-finite Slider', exact: true }).click();
  await expect(input).toHaveValue('0');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
});

test('Slider respects canceled pointer and keyboard actions and keyboard=false', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await page.getByLabel('Cancel Slider pointer', { exact: true }).check();
  await clickRail(page, input, 0.8);
  await expect(input).toHaveValue('20');
  await page.getByLabel('Cancel Slider keys', { exact: true }).check();
  await input.press('ArrowRight');
  await expect(input).toHaveValue('20');
  await page.getByLabel('Cancel Slider keys', { exact: true }).uncheck();
  await page.getByLabel('Enable Slider keyboard', { exact: true }).uncheck();
  await input.press('End');
  await expect(input).toHaveValue('20');
  await page.getByLabel('Cancel Slider pointer', { exact: true }).uncheck();
  await clickRail(page, input, 0.8);
  await expect(input).toHaveValue('80');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[80]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[80]');
});

test('Slider inherits disabled state and preserves explicit enabled overrides', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await page.getByLabel('Disable bound Slider', { exact: true }).check();
  await expect(input).toBeDisabled();
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  expect(await page.locator('#slider-native-form').evaluate((element) => new FormData(element as HTMLFormElement).get('volume'))).toBeNull();
  await page.getByLabel('Disable bound Slider', { exact: true }).uncheck();
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(input).toBeDisabled();
  await expect(page.getByRole('slider', { name: 'Enabled Slider override', exact: true })).toBeEnabled();
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
});

for (const [key, outcome] of [['F3', 'disable'], ['F4', 'external owner'], ['F5', 'range replacement'], ['F6', 'unmount']] as const) {
  test(`Slider cancels a pending drag after ${outcome} without a late completion`, async ({ page }) => {
    const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
    await startDrag(page, input, 0.8);
    await expect(input).toHaveValue('80');
    await page.keyboard.press(key);
    if (key === 'F3') await page.keyboard.press('F3');
    const owner = await page.getByRole('status', { name: 'Slider owner', exact: true }).textContent();
    await page.mouse.move(700, 400);
    await page.mouse.up();
    await expect(page.getByRole('status', { name: 'Slider owner', exact: true })).toHaveText(owner!);
    await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
    if (key === 'F6') await expect(input).toHaveCount(0);
    else await expect(input).toHaveValue(key === 'F4' ? '60' : key === 'F5' ? '50' : '80');
  });
}

test('Slider cancels keyboard completion after owner replacement, blur and a model reset with the same value', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await input.focus();
  await page.keyboard.down('ArrowRight');
  await page.getByRole('button', { name: 'Set Slider externally', exact: true }).click();
  await page.keyboard.up('ArrowRight');
  await expect(input).toHaveValue('60');
  await page.keyboard.down('ArrowRight');
  await page.getByRole('button', { name: 'Read Slider FormData', exact: true }).focus();
  await page.keyboard.up('ArrowRight');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
  const fixture = page.locator('#slider-form-fixture');
  await fixture.getByRole('button', { name: 'Set form Slider externally', exact: true }).click();
  const level = fixture.getByRole('slider', { name: 'Slider level', exact: true });
  await level.focus();
  await page.keyboard.down('Home');
  await expect(level).toHaveValue('0');
  await page.keyboard.press('F7');
  await page.keyboard.up('Home');
  await expect(fixture.getByRole('status', { name: 'Slider form completed', exact: true })).toHaveText('[]');
});

test('Slider cancels a held key synchronously when its native form resets to the same value', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await input.focus();
  await page.keyboard.down('Home');
  await expect(input).toHaveValue('0');
  await page.evaluate(() => {
    (document.getElementById('slider-native-form') as HTMLFormElement).reset();
    document.getElementById('bound-slider')!.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', bubbles: true }));
  });
  await page.keyboard.up('Home');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
  await expect(page.getByRole('status', { name: 'Slider owner', exact: true })).toHaveText('0');
});

test('Slider cancels a lost pointer capture notification and accepts the next independent action', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await input.evaluate((element: HTMLInputElement) => element.addEventListener('pointerdown', (event) => {
    element.dataset.capturePointer = String(event.pointerId);
  }, { once: true }));
  await startDrag(page, input, 0.8);
  await expect(input).toHaveValue('80');
  await input.dispatchEvent('lostpointercapture', { pointerId: Number(await input.getAttribute('data-capture-pointer')) });
  const target = await railPoint(input, 0.6);
  await page.mouse.move(target.x, target.y);
  await page.mouse.up();
  await expect(input).toHaveValue('80');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
  await clickRail(page, input, 0.4);
  await expect(input).toHaveValue('40');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[40]');
});

test('Slider restores native defaults, serializes zero once and respects target and window reset cancellation', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  const defaults = page.getByRole('slider', { name: 'Default Slider', exact: true });
  await input.press('Home');
  await defaults.press('End');
  await page.getByRole('button', { name: 'Replace Slider default', exact: true }).click();
  await page.getByRole('button', { name: 'Read Slider FormData', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Slider FormData', exact: true })).toHaveText('{"volume":["0"],"defaults":"100"}');
  await page.getByLabel('Cancel Slider reset', { exact: true }).check();
  await page.getByRole('button', { name: 'Reset native Sliders', exact: true }).click();
  await expect(defaults).toHaveValue('100');
  await page.getByLabel('Cancel Slider reset', { exact: true }).uncheck();
  await page.evaluate(() => window.addEventListener('reset', (event) => event.preventDefault(), { once: true }));
  await page.getByRole('button', { name: 'Reset native Sliders', exact: true }).click();
  await expect(defaults).toHaveValue('100');
  await page.getByRole('button', { name: 'Reset native Sliders', exact: true }).click();
  await expect(input).toHaveValue('0');
  await expect(defaults).toHaveValue('35');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[0]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[0]');
});

test('Slider honors external native form ownership and releases a queued reset on unmount', async ({ page }) => {
  const outside = page.getByRole('slider', { name: 'Outside Slider', exact: true });
  await outside.press('End');
  await page.getByRole('button', { name: 'Reset native Sliders', exact: true }).click();
  await expect(outside).toHaveValue('100');
  await page.getByRole('button', { name: 'Reset outside Slider', exact: true }).click();
  await expect(outside).toHaveValue('15');
  await page.getByRole('button', { name: 'Read outside Slider', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Outside Slider data', exact: true })).toHaveText('15');
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await input.press('End');
  await page.getByRole('button', { name: 'Reset and unmount Slider', exact: true }).click();
  await expect(input).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Slider owner', exact: true })).toHaveText('100');
});

test('Slider Form validates numbers, accepts required zero, focuses errors and resets its model and FormData', async ({ page }) => {
  const fixture = page.locator('#slider-form-fixture');
  const level = fixture.getByRole('slider', { name: 'Slider level', exact: true });
  const gain = fixture.getByRole('slider', { name: 'Slider gain', exact: true });
  await fixture.getByRole('button', { name: 'Submit Slider form', exact: true }).click();
  await expect(level).toBeFocused();
  await expect(level).toHaveAttribute('aria-invalid', 'true');
  await expect(level).toHaveAccessibleDescription('Level must be from 20 to 80 0');
  await expect(gain).not.toHaveAttribute('aria-invalid');
  await fixture.getByText('Slider level', { exact: true }).click();
  await expect(level).toBeFocused();
  await clickRail(page, level, 0.6);
  await fixture.getByRole('button', { name: 'Submit Slider form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Slider form saved', exact: true })).toHaveText('{"level":60,"gain":0}');
  expect(await fixture.locator('form').evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual({ level: '60', gain: '0' });
  await fixture.getByRole('button', { name: 'Reset Slider form', exact: true }).click();
  await expect(level).toHaveValue('0');
  await expect(level).not.toHaveAttribute('aria-invalid');
  await page.getByLabel('Disable Slider form', { exact: true }).check();
  await expect(level).toBeDisabled();
  await expect(gain).toBeDisabled();
  await expect(fixture.getByRole('slider', { name: 'Form enabled Slider override', exact: true })).toBeEnabled();
});

test('Slider completes a native assistive input/change pair once without a pointer or key event', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await input.evaluate((element: HTMLInputElement) => {
    element.value = '55';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(input).toHaveValue('55');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[55]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[55]');
});

test('Slider uses reachable steps and remains finite and quiet with a fixed range', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await page.getByRole('button', { name: 'Use non-dividing Slider step', exact: true }).click();
  await expect(input).toHaveValue('9');
  await input.press('End');
  await input.press('ArrowLeft');
  await expect(input).toHaveValue('6');
  await page.getByRole('button', { name: 'Use fixed Slider range', exact: true }).click();
  await expect(input).toHaveValue('4');
  await input.press('ArrowRight');
  await clickRail(page, input, 0.9);
  await expect(input).toHaveValue('4');
  await expect(page.getByRole('status', { name: 'Slider changes', exact: true })).toHaveText('[6]');
  await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[6]');
});

test('Slider reverses horizontal RTL and vertical geometry and keyboard directions', async ({ page }) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  await page.getByLabel('Right to left', { exact: true }).check();
  await clickRail(page, input, 0.25);
  await expect(input).toHaveValue('75');
  await input.press('ArrowRight');
  await expect(input).toHaveValue('70');
  await page.getByLabel('Reverse Slider', { exact: true }).check();
  await clickRail(page, input, 0.25);
  await expect(input).toHaveValue('25');
  await input.press('ArrowRight');
  await expect(input).toHaveValue('30');
  await page.getByLabel('Reverse Slider', { exact: true }).uncheck();
  await page.getByLabel('Vertical Slider', { exact: true }).check();
  await expect(input).toHaveAttribute('aria-orientation', 'vertical');
  await clickRail(page, input, 0.25);
  await expect(input).toHaveValue('75');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('80');
  await page.getByLabel('Reverse Slider', { exact: true }).check();
  await clickRail(page, input, 0.25);
  await expect(input).toHaveValue('25');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('20');
});

test('Slider inherits dark, primary and compact themes and disables visual motion', async ({ page }, testInfo) => {
  const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
  const root = input.locator('..');
  await page.getByLabel('Dark Slider theme', { exact: true }).check();
  await page.getByLabel('Purple Slider theme', { exact: true }).check();
  await page.getByLabel('Compact Slider theme', { exact: true }).check();
  await input.focus();
  await expect(root).toHaveCSS('font-size', '12px');
  await expect(root).toHaveCSS('--ant-slider-handle-active-color', '#722ed1');
  const background = await root.locator('.ant-slider-handle').evaluate((element) => getComputedStyle(element, '::after').backgroundColor);
  expect(background).toBe('rgb(31, 31, 31)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root.locator('.ant-slider-track')).toHaveCSS('transition-duration', '0s');
  const transition = await root.locator('.ant-slider-handle').evaluate((element) => getComputedStyle(element, '::after').transitionDuration);
  expect(transition).toBe('0s');
  await root.locator('..').screenshot({ path: testInfo.outputPath('slider-dark.png') });
});

test.describe('mobile Slider', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('drags with a real touch sequence and cancels a native touch without a completion', async ({ page }, testInfo) => {
    const input = page.getByRole('slider', { name: 'Bound Slider', exact: true });
    await input.scrollIntoViewIfNeeded();
    const start = await railPoint(input, 0.2);
    const end = await railPoint(input, 0.8);
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: end.x, y: end.y }] });
      await expect(input).toHaveValue('80');
      await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[]');
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[80]');
      const next = await railPoint(input, 0.4);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: end.x, y: end.y }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: next.x, y: next.y }] });
      await expect(input).toHaveValue('40');
      await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      await expect(page.getByRole('status', { name: 'Slider completed', exact: true })).toHaveText('[80]');
    } finally { await client.detach(); }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('#slider-native-form').screenshot({ path: testInfo.outputPath('slider-mobile.png') });
  });
});
