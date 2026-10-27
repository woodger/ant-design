import type { Page } from '@playwright/test';
import { test, expect } from './test';

const progress = (page: Page) => page.locator('#fixture-progress');
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Progress ${name}`, exact: true }).selectOption(value);
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
async function settled(page: Page) { await expect.poll(() => progress(page).evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0); }

test.beforeEach(async ({ page }) => {
  await page.clock.install(); await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
});

test('Progress renders synchronized visual and semantic values without live regions or Tab stops', async ({ page }, testInfo) => {
  await expect(progress(page)).toHaveRole('progressbar'); await expect(progress(page)).toHaveAccessibleName('Ход выполнения');
  await expect(progress(page)).toHaveAccessibleDescription('Progress of the current operation.');
  for (const [name, value] of [['aria-valuemin', '0'], ['aria-valuemax', '100'], ['aria-valuenow', '42.5'], ['aria-valuetext', '42.5%']]) await expect(progress(page)).toHaveAttribute(name, value);
  await expect(progress(page).locator('.ant-progress-indicator')).toHaveText('42.5%');
  await expect(progress(page)).not.toHaveAttribute('aria-live'); await expect(progress(page).locator('button, [tabindex]')).toHaveCount(0);
  const ratio = await progress(page).evaluate((node) => node.querySelector('.ant-progress-track')!.getBoundingClientRect().width / node.querySelector('.ant-progress-rail')!.getBoundingClientRect().width);
  expect(ratio).toBeCloseTo(0.425, 2); await progress(page).scrollIntoViewIfNeeded(); await page.screenshot({ path: testInfo.outputPath('progress-light.png') });
});

for (const type of ['line', 'circle']) {
  test(`Progress clamps invalid ${type} values and preserves fractional percentages`, async ({ page }) => {
    await setting(page, 'type', type);
    for (const [name, value] of [['NaN', '0'], ['Infinity', '0'], ['negative', '0'], ['overflow', '100'], ['zero', '0']]) {
      await button(page, `Set Progress ${name}`).click(); await expect(progress(page)).toHaveAttribute('aria-valuenow', value);
      if (type === 'line') expect(await progress(page).locator('.ant-progress-track').evaluate((node) => (node as HTMLElement).style.width)).toBe(`${value}%`);
      else await expect(progress(page).locator('.ant-progress-circle-path')).toHaveCSS('opacity', value === '0' ? '0' : '1');
    }
    await page.getByRole('spinbutton', { name: 'Progress percent', exact: true }).fill('12.75'); await expect(progress(page)).toHaveAttribute('aria-valuenow', '12.75');
  });
  test(`Progress resolves automatic completion and explicit ${type} statuses`, async ({ page }) => {
    await setting(page, 'type', type); await button(page, 'Set Progress complete').click();
    await expect(progress(page)).toHaveClass(/ant-progress-status-success/); await expect(progress(page).locator('.anticon svg')).toHaveCount(1);
    await setting(page, 'status', 'normal'); await expect(progress(page).locator('.ant-progress-indicator')).toHaveText('100%');
    await setting(page, 'status', 'exception'); await expect(progress(page)).toHaveAttribute('aria-valuetext', '100%, Ошибка');
    await expect(progress(page).locator('.ant-progress-indicator')).toHaveCSS('color', 'rgb(255, 77, 79)');
    await page.getByRole('spinbutton', { name: 'Progress percent', exact: true }).fill('25'); await setting(page, 'status', 'success');
    await expect(progress(page)).toHaveAttribute('aria-valuenow', '25'); await expect(progress(page)).toHaveAttribute('aria-valuetext', '25%, Завершено');
  });
}

test('Progress formats normalized values and preserves accessible text when info is hidden', async ({ page }) => {
  await button(page, 'Set Progress complete').click(); await page.getByLabel('Format Progress', { exact: true }).check();
  await expect(progress(page).locator('.ant-progress-indicator')).toHaveText('Done 100%'); await expect(progress(page).locator('svg')).toHaveCount(0);
  await page.getByLabel('Show Progress info', { exact: true }).uncheck(); await expect(progress(page).locator('.ant-progress-indicator')).toHaveCount(0);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '100'); await expect(progress(page)).toHaveAttribute('aria-valuetext', 'Done 100%');
});

test('Progress preserves caller names and descriptions and inherits live partial translations', async ({ page }) => {
  await page.getByLabel('Labelled Progress', { exact: true }).check(); await expect(progress(page)).toHaveAccessibleName('Monthly export');
  await expect(progress(page)).not.toHaveAttribute('aria-label'); await page.getByLabel('Custom Progress value text', { exact: true }).check();
  await expect(progress(page)).toHaveAttribute('aria-valuetext', 'Two of four files');
  await page.getByLabel('Labelled Progress', { exact: true }).uncheck(); await page.getByLabel('Custom Progress value text', { exact: true }).uncheck();
  await page.getByLabel('English locale', { exact: true }).check(); await expect(progress(page)).toHaveAccessibleName('Progress');
  await button(page, 'Set Progress complete').click(); await expect(progress(page)).toHaveAttribute('aria-valuetext', '100%, Completed');
  await page.getByLabel('Custom Progress locale', { exact: true }).check(); await expect(progress(page)).toHaveAccessibleName('Custom progress');
  await expect(progress(page)).toHaveAttribute('aria-valuetext', '100%, Done'); await setting(page, 'status', 'exception');
  await expect(progress(page)).toHaveAttribute('aria-valuetext', '100%, Ошибка');
  await page.getByLabel('Named Progress', { exact: true }).check(); await expect(progress(page)).toHaveAccessibleName('Export progress');
});

test('Progress accepts owner updates without changing focus, Tab order or another instance', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Progress focus target', exact: true }); await input.fill('Unsent draft');
  await page.keyboard.press('Control+Alt+y'); await expect(progress(page)).toHaveAttribute('aria-valuenow', '80'); await expect(input).toBeFocused();
  await expect(input).toHaveValue('Unsent draft'); await expect(page.locator('#independent-progress')).toHaveAttribute('aria-valuenow', '75');
  await page.keyboard.press('Tab'); await expect(button(page, 'After Progress')).toBeFocused();
  await page.clock.fastForward(10_000); await expect(progress(page)).toHaveAttribute('aria-valuenow', '80');
});

for (const [size, height] of [['medium', 8], ['small', 6], ['pair', 4], ['css', 12], ['numeric', 24], ['invalid', 8]] as const) {
  test(`Progress supports ${size} line dimensions`, async ({ page }) => {
    await setting(page, 'size', size); await expect(progress(page).locator('.ant-progress-rail')).toHaveCSS('height', `${height}px`);
    if (size === 'pair') await expect(progress(page).locator('.ant-progress-body')).toHaveCSS('width', '260px');
    if (size === 'css') expect(await progress(page).locator('.ant-progress-body').evaluate((node) => (node as HTMLElement).style.width)).toBe('75%');
  });
}
for (const [size, diameter] of [['medium', 120], ['small', 60], ['numeric', 180], ['tiny', 16], ['invalid', 120]] as const) {
  test(`Progress supports ${size} circle dimensions`, async ({ page }) => {
    await setting(page, 'type', 'circle'); await setting(page, 'size', size); await expect(progress(page).locator('.ant-progress-body')).toHaveCSS('width', `${diameter}px`);
    const box = (await progress(page).locator('svg').boundingBox())!; expect(box.width).toBeCloseTo(box.height, 1);
    if (size === 'tiny') await expect(progress(page).locator('.ant-progress-indicator')).toHaveCount(0);
    await expect(progress(page)).toHaveAttribute('aria-valuenow', '42.5');
  });
}

test('Progress circle renders a real quarter arc with adjustable stroke width and caps', async ({ page }, testInfo) => {
  await setting(page, 'type', 'circle'); await page.getByRole('spinbutton', { name: 'Progress percent', exact: true }).fill('25');
  await page.getByRole('spinbutton', { name: 'Progress stroke width', exact: true }).fill('12');
  const path = progress(page).locator('.ant-progress-circle-path'); await expect(path).toHaveAttribute('r', '44'); await expect(path).toHaveAttribute('stroke-width', '12');
  const metrics = await path.evaluate((node) => ({ length: (node as SVGCircleElement).getTotalLength(), offset: Number(node.getAttribute('stroke-dashoffset')) }));
  expect(metrics.offset / metrics.length).toBeCloseTo(0.75, 2); await expect(path).toHaveAttribute('transform', 'rotate(-90 50 50)');
  for (const cap of ['round', 'butt', 'square']) { await setting(page, 'cap', cap); await expect(path).toHaveAttribute('stroke-linecap', cap); }
  await settled(page); await progress(page).scrollIntoViewIfNeeded(); await page.screenshot({ path: testInfo.outputPath('progress-circle.png') });
});

test('Progress honors custom colors and line cap styles even with explicit statuses', async ({ page }) => {
  for (const cap of ['butt', 'square', 'round']) { await setting(page, 'cap', cap); await expect(progress(page).locator('.ant-progress-rail')).toHaveCSS('border-radius', cap === 'round' ? '100px' : '0px'); }
  await page.getByLabel('Custom Progress colors', { exact: true }).check(); await setting(page, 'status', 'exception');
  await expect(progress(page).locator('.ant-progress-track')).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await expect(progress(page).locator('.ant-progress-rail')).toHaveCSS('background-color', 'rgb(255, 229, 143)');
  await setting(page, 'type', 'circle'); await expect(progress(page).locator('.ant-progress-circle-path')).toHaveCSS('stroke', 'rgb(114, 46, 209)');
  await expect(progress(page).locator('.ant-progress-circle-rail')).toHaveCSS('stroke', 'rgb(255, 229, 143)');
});

test('Progress uses dark compact tokens and fills from the logical start in RTL', async ({ page }, testInfo) => {
  for (const label of ['Right to left', 'Dark Progress theme', 'Compact Progress theme']) await page.getByLabel(label, { exact: true }).check();
  await expect(progress(page)).toHaveCSS('font-size', '12px'); await expect(progress(page)).toHaveCSS('direction', 'rtl');
  await expect(progress(page).locator('.ant-progress-rail')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.12)');
  await settled(page); const rail = (await progress(page).locator('.ant-progress-rail').boundingBox())!; const track = (await progress(page).locator('.ant-progress-track').boundingBox())!;
  expect(track.x + track.width).toBeCloseTo(rail.x + rail.width, 0); await setting(page, 'type', 'circle');
  await expect(progress(page).locator('.ant-progress-indicator')).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await progress(page).scrollIntoViewIfNeeded(); await page.screenshot({ path: testInfo.outputPath('progress-dark-rtl.png') });
});

test('Progress active decoration never advances its value and obeys live reduced motion', async ({ page }) => {
  await setting(page, 'status', 'active'); const track = progress(page).locator('.ant-progress-track');
  await expect.poll(() => track.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await page.clock.fastForward(5000); await expect(progress(page)).toHaveAttribute('aria-valuenow', '42.5');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect.poll(() => track.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.getByRole('spinbutton', { name: 'Progress percent', exact: true }).fill('65'); await expect(track).toHaveCSS('transition-duration', '0s');
  await setting(page, 'type', 'circle'); await expect(progress(page).locator('.ant-progress-circle-path')).toHaveCSS('transition-duration', '0s');
});

test('Progress remains readable with disabled controls and remounts the latest owner value', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(progress(page)).toBeVisible();
  const input = page.getByRole('textbox', { name: 'Progress focus target', exact: true }); await input.focus();
  await page.keyboard.press('Control+Alt+t'); await expect(progress(page)).toHaveCount(0); await page.keyboard.press('Control+Alt+y');
  await page.keyboard.press('Control+Alt+t'); await expect(progress(page)).toHaveAttribute('aria-valuenow', '80'); await expect(input).toBeFocused();
});
for (const kind of ['Modal', 'Drawer']) {
  test(`Progress updates inside ${kind} without taking focus or Escape`, async ({ page }) => {
    await button(page, `Open Progress ${kind}`).click(); const host = page.getByRole('dialog', { name: `Progress host ${kind.toLowerCase()}`, exact: true });
    const input = host.getByRole('textbox', { name: `${kind} Progress input`, exact: true }); await input.fill('Host draft');
    await page.keyboard.press('Control+Alt+y'); await expect(host.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80'); await expect(input).toBeFocused();
    await page.keyboard.press('Escape'); await expect(host).toBeHidden(); await expect(button(page, `Open Progress ${kind}`)).toBeFocused();
  });
}
test.describe('mobile Progress', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  for (const type of ['line', 'circle']) {
    test(`keeps oversized ${type} and long labels within the viewport`, async ({ page }, testInfo) => {
      await setting(page, 'type', type); await setting(page, 'size', 'oversized'); await page.getByLabel('Long Progress format', { exact: true }).check();
      await settled(page); const box = (await progress(page).boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(375);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(progress(page)).toHaveAttribute('aria-valuetext', /Processed 42.5% VeryLongProgress/);
      await progress(page).scrollIntoViewIfNeeded(); await page.screenshot({ path: testInfo.outputPath(`progress-mobile-${type}.png`) });
    });
  }
});
