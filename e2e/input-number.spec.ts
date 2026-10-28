import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=input-number');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('InputNumber keeps zero, publishes numbers and null once and preserves incomplete decimal text while editing', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await expect(input).toHaveValue('0');
  await input.fill('-');
  await expect(input).toHaveValue('-');
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('0');
  await input.press('Tab');
  await expect(input).toHaveValue('0');
  await expect(page.getByRole('spinbutton', { name: 'Default number', exact: true })).toBeFocused();
  await input.fill('1.');
  await expect(input).toHaveValue('1.');
  await input.press('2');
  await expect(input).toHaveValue('1.2');
  await expect(input).toHaveAttribute('aria-valuenow', '1.2');
  await input.fill('');
  await expect(input).not.toHaveAttribute('aria-valuenow');
  await input.fill('0');

  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[1,1.2,null,0]');
  await expect(page.getByRole('status', { name: 'Number native inputs', exact: true })).toHaveText('5');
});

test('InputNumber preserves a typing cursor and trailing zeroes until blur or Enter', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.fill('1.20');
  await expect(input).toHaveValue('1.20');
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(1, 1));
  await input.press('5');
  await expect(input).toHaveValue('15.20');
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(2);
  await input.press('Enter');
  await expect(input).toHaveValue('10');
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('10');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[1.2,10]');
  await expect(page.getByRole('status', { name: 'Number submissions', exact: true })).toHaveText('1');
  await expect(page.getByRole('status', { name: 'Number FormData', exact: true })).toHaveText('{"amount":["10"],"defaults":"2.5"}');
});

test('InputNumber steps with arrows and pointer controls without submitting or floating-point tails', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.fill('0.2');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('0.3');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('0.2');
  const wrapper = input.locator('..');
  await wrapper.getByRole('button', { name: 'Увеличить значение', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('0.3');
  await wrapper.getByRole('button', { name: 'Уменьшить значение', exact: true }).click();
  await expect(input).toHaveValue('0.2');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[0.2,0.3,0.2,0.3,0.2]');
  await expect(page.getByRole('status', { name: 'Number submissions', exact: true })).toHaveText('0');
});

test('InputNumber respects keyboard cancellation and controls visibility independently', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await page.getByLabel('Cancel number keys', { exact: true }).check();
  await input.press('ArrowUp');
  await expect(input).toHaveValue('0');
  await page.getByLabel('Cancel number keys', { exact: true }).uncheck();
  await page.getByLabel('Enable number keyboard', { exact: true }).uncheck();
  await input.press('ArrowUp');
  await expect(input).toHaveValue('0');
  await input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true }).click();
  await expect(input).toHaveValue('0.1');
  await page.getByLabel('Show number controls', { exact: true }).uncheck();
  await expect(input.locator('..').getByRole('button')).toHaveCount(0);
  await page.getByLabel('Enable number keyboard', { exact: true }).check();
  await input.press('ArrowUp');
  await expect(input).toHaveValue('0.2');
});

test('InputNumber accepts external values and changing bounds without callbacks or stale drafts', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.fill('0.');
  await page.getByRole('button', { name: 'Set number externally', exact: true }).click();
  await expect(input).toHaveValue('7.125');
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: 'Shrink number range', exact: true }).click();
  await expect(input).toHaveValue('7.125');
  await expect(input).toHaveAttribute('aria-valuemax', '1');
  await expect(input.locator('..')).toHaveClass(/ant-input-number-out-of-range/);
  await page.getByRole('button', { name: 'Set number to zero', exact: true }).click();
  await expect(input).toHaveValue('0');
  await page.getByRole('button', { name: 'Clear number externally', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[]');
});

test('InputNumber clears a stale empty draft when the owner changes between non-finite values', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.fill('');
  await input.fill('-');
  await page.getByRole('button', { name: 'Set non-finite number', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).not.toHaveAttribute('aria-valuenow');
  await input.fill('.');
  await page.getByRole('button', { name: 'Set infinite number', exact: true }).click();
  await expect(input).toHaveValue('');
  expect(await page.locator('#input-number-native-form').evaluate((element) => new FormData(element as HTMLFormElement).get('amount'))).toBe('');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[null]');
});

test('InputNumber normalizes user drafts on blur and Enter and rounds precision at commit', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await page.getByRole('button', { name: 'Set number precision', exact: true }).click();
  await expect(input).toHaveValue('0.00');
  await input.fill('1.005');
  await expect(input).toHaveValue('1.005');
  await input.press('Tab');
  await expect(input).toHaveValue('1.01');
  await input.fill('-99');
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('1.01');
  await input.press('Enter');
  await expect(input).toHaveValue('-10.00');
  await input.fill('wrong');
  await input.press('Tab');
  await expect(input).toHaveValue('-10.00');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[1.005,1.01,-10]');
});

test('InputNumber disables motion away from a bound and lets an exceeded external value move back into range', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.fill('10');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('10');
  await expect(input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Set exceeded number', exact: true }).click();
  await input.press('ArrowDown');
  await expect(input).toHaveValue('10');
  await input.fill('-10');
  await expect(input.locator('..').getByRole('button', { name: 'Уменьшить значение', exact: true })).toBeDisabled();
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[10,10,-10]');
});

test('InputNumber inherits disabled state, preserves readonly submission and keeps explicit enabled overrides', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await page.getByLabel('Readonly bound number', { exact: true }).check();
  await expect(input).toHaveAttribute('readonly');
  await expect(input.locator('..').getByRole('button')).toHaveCount(0);
  await input.press('ArrowUp');
  expect(await page.locator('#input-number-native-form').evaluate((element) => new FormData(element as HTMLFormElement).get('amount'))).toBe('0');
  await page.getByLabel('Readonly bound number', { exact: true }).uncheck();
  await page.getByLabel('Disable bound number', { exact: true }).check();
  await expect(input).toBeDisabled();
  await input.dispatchEvent('input');
  expect(await page.locator('#input-number-native-form').evaluate((element) => new FormData(element as HTMLFormElement).get('amount'))).toBeNull();
  await page.getByLabel('Disable bound number', { exact: true }).uncheck();
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(input).toBeDisabled();
  await expect(page.getByRole('spinbutton', { name: 'Enabled number override', exact: true })).toBeEnabled();
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[]');
});

test('InputNumber serializes the numeric model once and restores native defaults without callbacks', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  const defaults = page.getByRole('spinbutton', { name: 'Default number', exact: true });
  await input.fill('1.20');
  expect(await page.locator('#input-number-native-form').evaluate((element) => new FormData(element as HTMLFormElement).getAll('amount'))).toEqual(['1.2']);
  await input.fill('');
  await defaults.fill('4');
  await page.getByRole('button', { name: 'Replace number default', exact: true }).click();
  await page.getByRole('button', { name: 'Read number FormData', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Number FormData', exact: true })).toHaveText('{"amount":[""],"defaults":"4"}');
  await page.getByRole('button', { name: 'Reset native numbers', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(defaults).toHaveValue('2.5');
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('null');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[1.2,null]');
});

test('InputNumber respects target and window reset cancellation and its external form owner', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  const outside = page.getByRole('spinbutton', { name: 'Outside number', exact: true });
  await input.fill('2');
  await outside.fill('7');
  await page.getByLabel('Cancel number reset', { exact: true }).check();
  await page.getByRole('button', { name: 'Reset native numbers', exact: true }).click();
  await expect(input).toHaveValue('2');
  await page.getByLabel('Cancel number reset', { exact: true }).uncheck();
  await page.evaluate(() => window.addEventListener('reset', (event) => event.preventDefault(), { once: true }));
  await page.getByRole('button', { name: 'Reset native numbers', exact: true }).click();
  await expect(input).toHaveValue('2');
  await page.getByRole('button', { name: 'Reset outside number', exact: true }).click();
  await expect(outside).toHaveValue('3.5');
  await expect(input).toHaveValue('2');
  await page.getByRole('button', { name: 'Read outside number', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Outside number data', exact: true })).toHaveText('3.5');
});

test('InputNumber integrates required, numeric validation, labels, error focus, submission and Form reset', async ({ page }) => {
  const fixture = page.locator('#input-number-form-fixture');
  const quantity = fixture.getByRole('spinbutton', { name: 'Number quantity', exact: true });
  const price = fixture.getByRole('spinbutton', { name: 'Number price', exact: true });
  await fixture.getByRole('button', { name: 'Submit number form', exact: true }).click();
  await expect(quantity).toBeFocused();
  await expect(quantity).toHaveAttribute('aria-invalid', 'true');
  await expect(quantity).toHaveAccessibleDescription('Enter quantity');
  await expect(price).not.toHaveAttribute('aria-invalid');
  await quantity.fill('0');
  await quantity.press('Tab');
  await expect(quantity).toHaveAccessibleDescription('Quantity must be from 1 to 10');
  await fixture.getByText('Number quantity', { exact: true }).click();
  await expect(quantity).toBeFocused();
  await quantity.fill('2');
  await fixture.getByRole('button', { name: 'Submit number form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Number form saved', exact: true })).toHaveText('{"quantity":2,"price":0}');
  expect(await fixture.locator('form').evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual({ quantity: '2', price: '0' });
  await fixture.getByRole('button', { name: 'Reset number form', exact: true }).click();
  await expect(quantity).toHaveValue('');
  await expect(quantity).not.toHaveAttribute('aria-invalid');
  await expect(price).toHaveValue('0.00');
});

test('InputNumber clears a focused draft when resetting the model to the same number and accepts external Form setters', async ({ page }) => {
  const fixture = page.locator('#input-number-form-fixture');
  const price = fixture.getByRole('spinbutton', { name: 'Number price', exact: true });
  await price.fill('-');
  await expect(price).toHaveValue('-');
  await fixture.getByRole('button', { name: 'Reset number model', exact: true }).click();
  await expect(price).toHaveValue('0.00');
  await expect(price).toBeFocused();
  const quantity = fixture.getByRole('spinbutton', { name: 'Number quantity', exact: true });
  await quantity.fill('.');
  await fixture.getByRole('button', { name: 'Set form quantity externally', exact: true }).click();
  await expect(quantity).toHaveValue('4');
  await page.getByLabel('Disable number form', { exact: true }).check();
  await expect(quantity).toBeDisabled();
  await expect(price).toBeDisabled();
  await expect(fixture.getByRole('spinbutton', { name: 'Form enabled number override', exact: true })).toBeEnabled();
});

test('InputNumber uses native required and numeric validity without requiring a hidden field', async ({ page }) => {
  const fixture = page.locator('#input-number-required-fixture');
  const input = fixture.getByRole('spinbutton', { name: 'Required number', exact: true });
  await fixture.getByRole('button', { name: 'Submit required number', exact: true }).click();
  await expect(input).toBeFocused();
  expect(await input.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  await input.fill('bad');
  expect(await input.evaluate((element: HTMLInputElement) => element.checkValidity())).toBe(false);
  await input.fill('0');
  await fixture.getByRole('button', { name: 'Submit required number', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Required number submissions', exact: true })).toHaveText('1');
});

test('InputNumber waits for composition and ignores the composing Enter and arrow keys', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.dispatchEvent('compositionstart');
  await input.fill('1.5');
  await input.dispatchEvent('keydown', { key: 'ArrowUp', isComposing: true });
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(input).toHaveValue('1.5');
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('0');
  await input.dispatchEvent('compositionend');
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('1.5');
  await input.dispatchEvent('input');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[1.5]');
});

test('InputNumber releases native reset work on unmount and reconnects to its owner on remount', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  await input.fill('2');
  await page.getByRole('button', { name: 'Reset and unmount number', exact: true }).click();
  await expect(input).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Number owner', exact: true })).toHaveText('2');
  await page.getByLabel('Mount bound number', { exact: true }).check();
  await expect(input).toHaveValue('2');
  await page.getByRole('button', { name: 'Reset native numbers', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.getByRole('status', { name: 'Number changes', exact: true })).toHaveText('[2]');
});

test('InputNumber inherits themes, sizes, RTL and merged locale and respects reduced motion', async ({ page }, testInfo) => {
  const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
  const wrapper = input.locator('..');
  await expect(wrapper).toHaveCSS('height', '32px');
  await expect(page.getByRole('spinbutton', { name: 'Large number', exact: true }).locator('..')).toHaveCSS('height', '40px');
  await expect(page.getByRole('spinbutton', { name: 'Small number', exact: true }).locator('..')).toHaveCSS('height', '24px');
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Small number provider', { exact: true }).check();
  await page.getByLabel('Dark number theme', { exact: true }).check();
  await page.getByLabel('Compact number theme', { exact: true }).check();
  await page.getByLabel('Purple number theme', { exact: true }).check();
  await page.getByLabel('English locale', { exact: true }).check();
  await input.focus();
  await expect(wrapper).toHaveCSS('height', '20px');
  await expect(wrapper).toHaveCSS('font-size', '12px');
  await expect(wrapper).toHaveCSS('direction', 'rtl');
  await expect(wrapper).toHaveCSS('border-color', 'rgb(114, 46, 209)');
  await expect(wrapper).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(wrapper.getByRole('button', { name: 'Increase value', exact: true })).toBeVisible();
  const nested = page.getByRole('spinbutton', { name: 'Nested locale number', exact: true }).locator('..');
  await expect(nested.getByRole('button', { name: 'More', exact: true })).toHaveCount(1);
  await expect(nested.getByRole('button', { name: 'Decrease value', exact: true })).toHaveCount(1);
  await wrapper.screenshot({ path: testInfo.outputPath('input-number-dark-rtl.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(wrapper).toHaveCSS('transition-duration', '0s');
  await expect(input).toHaveCSS('transition-duration', '0s');
  const box = (await wrapper.boundingBox())!;
  const controls = (await wrapper.locator('.ant-input-number-actions').boundingBox())!;
  expect(controls.x).toBeLessThan(box.x + box.width / 2);
});

test.describe('mobile InputNumber', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('keeps numeric entry and controls within the viewport', async ({ page }, testInfo) => {
    const input = page.getByRole('spinbutton', { name: 'Bound number', exact: true });
    await input.fill('-1.2');
    await expect(input).toHaveAttribute('inputmode', 'decimal');
    await input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true }).tap();
    await expect(input).toHaveValue('-1.1');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('#input-number-native-form').screenshot({ path: testInfo.outputPath('input-number-mobile.png') });
  });
});
