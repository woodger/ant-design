import { test, expect } from './test';
import type { Locator } from '@playwright/test';

async function clickHalf(star: Locator, fraction: number) {
  await star.scrollIntoViewIfNeeded();
  const box = (await star.locator('..').boundingBox())!;
  await star.page().mouse.click(box.x + box.width * fraction, box.y + box.height / 2);
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=rate');
  await expect(page.locator('#fixture-rate')).toBeVisible();
});

test('Rate renders source stars, cumulative checked state and independent defaults', async ({ page }) => {
  const root = page.getByRole('radiogroup', { name: 'Rating', exact: true });
  await expect(root.getByRole('radio')).toHaveCount(5);
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(2);
  await expect(root.locator('.ant-rate-star-half')).toHaveCount(1);
  await expect(root.locator('[aria-checked="true"]')).toHaveCount(3);
  await expect(page.locator('#independent-rate .ant-rate-star-full')).toHaveCount(3);
  await expect(page.getByLabel('Rate native element', { exact: true })).toHaveText('UL');
});

test('Rate preserves hover without changing value and clears hover before publishing a click', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  const star = root.getByRole('radio', { name: '4', exact: true });
  await star.scrollIntoViewIfNeeded();
  const box = (await star.locator('..').boundingBox())!;
  await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(3);
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('2.5');
  await page.mouse.down(); await page.mouse.up();
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('3.5');
  await expect(page.getByLabel('Rate events', { exact: true })).toHaveText(/hover:3\.5\|hover:undefined\|change:3\.5$/);
  await page.getByRole('button', { name: 'After Rate', exact: true }).hover();
  await expect(page.getByLabel('Rate events', { exact: true })).toHaveText(/hover:undefined$/);
  await expect(page.getByLabel('Rate leaves', { exact: true })).toHaveText('1');
});

test('Rate clears a repeated half and suppresses the cleaned hover until a different hit or leave', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  const star = root.getByRole('radio', { name: '3', exact: true });
  await clickHalf(star, 0.25);
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('0');
  const box = (await star.locator('..').boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
  await expect(root.locator('.ant-rate-star-half')).toHaveCount(0);
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(3);
  await page.getByRole('button', { name: 'After Rate', exact: true }).hover();
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(0);
});

test('Rate reports repeated values with allowClear false and suppresses rejected controlled updates', async ({ page }) => {
  await page.getByLabel('Allow clear Rate', { exact: true }).uncheck();
  await clickHalf(page.locator('#fixture-rate').getByRole('radio', { name: '3', exact: true }), 0.25);
  await expect(page.getByLabel('Rate events', { exact: true })).toContainText('change:2.5');
  await page.getByLabel('Reject Rate changes', { exact: true }).check();
  await page.getByRole('button', { name: 'Clear Rate events', exact: true }).click();
  await page.locator('#fixture-rate').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('2.5');
  await expect(page.getByLabel('Rate events', { exact: true })).toHaveText('change:3|change:3');
  await expect(page.locator('#fixture-rate .ant-rate-star-full')).toHaveCount(2);
});

test('Rate retains source arrow arithmetic, callback order and physical RTL reversal', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await root.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('3');
  await expect(page.getByLabel('Rate keys', { exact: true })).toHaveText('ArrowRight:true');
  await page.getByLabel('Right to left', { exact: true }).check();
  await root.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('2.5');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('3');
  await expect(root).toHaveClass(/ant-rate-rtl/);
});

test('Rate respects arrow boundaries and keyboard false while Enter still selects a full star', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await page.getByRole('button', { name: 'Set Rate to zero', exact: true }).click();
  await root.focus(); await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Rate keys', { exact: true })).toContainText('ArrowLeft:false');
  await page.getByLabel('Keyboard Rate', { exact: true }).uncheck();
  await root.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('0');
  await root.getByRole('radio', { name: '4', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('4');
  await expect(page.getByLabel('Rate events', { exact: true })).toHaveText('hover:undefined|change:4');
  await page.getByRole('button', { name: 'After Rate', exact: true }).focus();
  await root.getByRole('radio', { name: '5', exact: true }).focus(); await page.keyboard.press('Space');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('5');
});

test('Rate computes RTL halves against the original unscaled star and scroll offset', async ({ page }) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  const star = page.locator('#fixture-rate').getByRole('radio', { name: '2', exact: true });
  await clickHalf(star, 0.75);
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('1.5');
  await clickHalf(star, 0.25);
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('2');
  await page.getByLabel('Allow half Rate', { exact: true }).uncheck();
  await clickHalf(page.locator('#fixture-rate').getByRole('radio', { name: '5', exact: true }), 0.75);
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('5');
});

test('Rate inherits disabled and explicit false restores controls without changing source styles', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(root).toHaveAttribute('tabindex', '-1');
  await expect(root.getByRole('radio').first()).toBeDisabled();
  await root.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('2.5');
  await page.getByRole('combobox', { name: 'Rate disabled', exact: true }).selectOption('false');
  await expect(root).toHaveAttribute('tabindex', '0');
  await root.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('3');
});

test('Rate applies source sizes, compact metrics, theme colors and nested config replacement', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await expect(root).toHaveClass(/owner-rate root-rate context-rate/);
  await expect(root).toHaveCSS('opacity', '0.8');
  for (const [size, pixels] of [['small', '15px'], ['middle', '20px'], ['medium', '20px'], ['large', '25px']] as const) {
    await page.getByRole('combobox', { name: 'Rate size', exact: true }).selectOption(size);
    await expect(root).toHaveCSS('font-size', pixels);
  }
  await page.getByRole('combobox', { name: 'Rate size', exact: true }).selectOption('inherit');
  await page.getByRole('combobox', { name: 'Provider Rate size', exact: true }).selectOption('small');
  await expect(root).toHaveCSS('font-size', '15px');
  await page.getByLabel('Compact Rate theme', { exact: true }).check();
  await expect(root).toHaveCSS('font-size', '12.5px');
  await page.getByLabel('Dark Rate theme', { exact: true }).check();
  await expect(root).toHaveCSS('color', 'rgb(216, 189, 20)');
  await expect(root.locator('.ant-rate-star-zero .ant-rate-star-second').last()).toHaveCSS('color', 'rgba(255, 255, 255, 0.12)');
  await expect(page.locator('#nested-rate')).toHaveCSS('color', 'rgb(250, 219, 20)');
  await expect(page.locator('#nested-rate')).toHaveCSS('opacity', '0.6');
  await expect(page.locator('#nested-rate')).not.toHaveClass(/context-rate/);
});

test('Rate inherits Form disabled context and preserves an explicit false override', async ({ page }) => {
  const root = page.getByRole('radiogroup', { name: 'Form Rating', exact: true });
  await page.getByLabel('Disabled Rate Form', { exact: true }).check();
  await expect(root.getByRole('radio').first()).toBeDisabled();
  await page.getByLabel('Override disabled Rate Form', { exact: true }).check();
  await expect(root.getByRole('radio').first()).toBeEnabled();
  await root.focus(); await page.keyboard.press('ArrowRight');
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(1);
});

test('Rate tooltips preserve star spacing and support string and object configuration', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  const before = (await root.boundingBox())!.width;
  for (const kind of ['string', 'object']) {
    await page.getByRole('combobox', { name: 'Rate tooltips', exact: true }).selectOption(kind);
    expect((await root.boundingBox())!.width).toBe(before);
    await root.getByRole('radio', { name: '4', exact: true }).hover();
    await expect(page.getByRole('tooltip', { name: 'Good', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip', { name: 'Good', exact: true })).not.toBeVisible();
    await page.getByRole('button', { name: 'After Rate', exact: true }).hover();
  }
});

test('Rate forwards custom character props and lets characterRender replace tooltip composition', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await page.getByLabel('Custom Rate character', { exact: true }).check();
  await expect(root.locator('[data-star="2"]')).toHaveText(['3', '3']);
  await page.getByRole('combobox', { name: 'Rate tooltips', exact: true }).selectOption('object');
  await page.getByLabel('Custom Rate render', { exact: true }).check();
  await expect(root.locator('.custom-rate-render')).toHaveCount(5);
  await root.getByRole('radio', { name: '4', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('4');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('Rate ref methods focus and blur the root and disabled methods leave focus unchanged', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await page.getByRole('button', { name: 'Focus Rate', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(root).toBeFocused();
  await expect(root).toHaveCSS('outline-style', 'dashed');
  await page.getByRole('button', { name: 'Blur Rate', exact: true }).click();
  await expect(root).not.toBeFocused();
  await expect(page.getByLabel('Rate focus', { exact: true })).toHaveText('focus|blur');
  await page.getByRole('combobox', { name: 'Rate disabled', exact: true }).selectOption('true');
  await page.getByRole('button', { name: 'Focus Rate', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Focus Rate', exact: true })).toBeFocused();
});

test('Rate characterRender can replace the origin and use the source event helpers', async ({ page }) => {
  await page.getByLabel('Allow half Rate', { exact: true }).uncheck();
  await page.getByLabel('Replace Rate render', { exact: true }).check();
  await page.getByRole('button', { name: 'Custom rating 4', exact: true }).click();
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('4');
});

test('Rate uncontrolled choices persist through native reset and do not submit a native form value', async ({ page }) => {
  await page.getByLabel('Controlled Rate', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Toggle Rate mount', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle Rate mount', exact: true }).click();
  const root = page.locator('#fixture-rate');
  await root.getByRole('radio', { name: '2', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(2);
  await page.getByRole('button', { name: 'Reset Rate native form', exact: true }).click();
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(2);
  const fields = await page.getByRole('form', { name: 'Rate native form' }).evaluate(form => [...new FormData(form as HTMLFormElement).entries()]);
  expect(fields).toEqual([]);
});

test('Rate external values and changing counts do not publish changes or clamp the owner', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await page.getByRole('button', { name: 'Set Rate to four', exact: true }).click();
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(4);
  await page.getByRole('combobox', { name: 'Rate count', exact: true }).selectOption('3');
  await expect(root.getByRole('radio')).toHaveCount(3);
  await expect(page.getByLabel('Rate value', { exact: true })).toHaveText('4');
  await page.getByRole('button', { name: 'Release Rate value', exact: true }).click();
  await root.focus(); await page.keyboard.press('ArrowRight');
  await expect(root.locator('.ant-rate-star-full')).toHaveCount(0);
  await expect(page.getByLabel('Rate events', { exact: true })).toHaveText('');
  await page.getByRole('combobox', { name: 'Rate count', exact: true }).selectOption('0');
  await expect(root.getByRole('radio')).toHaveCount(0);
});

test('Rate only applies autoFocus at mount and cleans tooltip timers when unmounted', async ({ page }) => {
  const root = page.locator('#fixture-rate');
  await page.getByLabel('Autofocus Rate', { exact: true }).check();
  await expect(root).not.toBeFocused();
  await page.getByRole('button', { name: 'Toggle Rate mount', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle Rate mount', exact: true }).click();
  await expect(root).toBeFocused();
  await page.getByRole('combobox', { name: 'Rate tooltips', exact: true }).selectOption('string');
  await root.getByRole('radio', { name: '5', exact: true }).hover();
  await page.getByRole('button', { name: 'Toggle Rate mount', exact: true }).click();
  await expect(root).toHaveCount(0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('Rate hover and focus CSS retain source transforms and respect reduced motion', async ({ page }) => {
  const star = page.locator('#fixture-rate').getByRole('radio', { name: '4', exact: true });
  await star.focus();
  await expect(star).toHaveCSS('outline-style', 'dashed');
  await expect(star).toHaveCSS('transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(star).toHaveCSS('transition-duration', '0s');
  await expect(star.locator('.ant-rate-star-first')).toHaveCSS('transition-duration', '0s');
});

test('Rate gallery hydrates, selects a rating and remains usable in a narrow RTL dark layout', async ({ page, request }) => {
  expect(await (await request.get('/ant-design')).text()).toContain('id="rate"');
  await page.goto('/ant-design#rate');
  const root = page.locator('#rate');
  await root.getByRole('radiogroup', { name: 'Оценка', exact: true }).getByRole('radio', { name: '4', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(root.getByLabel('Выбранная оценка', { exact: true })).toHaveText('4');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4174?fixture=rate');
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Rate theme', { exact: true }).check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
