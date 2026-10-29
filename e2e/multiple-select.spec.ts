import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=select-multiple');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('multiple Select toggles numeric options, retains zero and keeps the list open', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  const input = page.getByRole('combobox', { name: 'Multiple numbers', exact: true });
  const container = fixture.locator('.container').filter({ has: input });
  await input.click();
  const list = fixture.getByRole('listbox', { name: 'Multiple numbers', exact: true });
  await expect(list).toHaveAttribute('aria-multiselectable', 'true');
  await list.getByRole('option', { name: 'Two', exact: true }).click();

  await expect(list).toBeVisible();
  await expect(input).toBeFocused();
  await expect(list.getByRole('option', { name: 'Zero', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(container.getByRole('button', { name: 'Удалить Two', exact: true })).toBeVisible();
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0,2]');
  await list.getByRole('option', { name: 'Zero', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[2]');
  await expect(fixture.getByRole('status', { name: 'Multiple changes', exact: true })).toHaveText('[[0,2],[2]]');
  await expect(fixture.getByRole('status', { name: 'Multiple open changes', exact: true })).toHaveText('[true]');
});

test('multiple Select searches, clears search after selection and removes the last item with Backspace', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  const input = page.getByRole('combobox', { name: 'Multiple numbers', exact: true });
  await input.fill('thReE');
  await input.press('Enter');
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0,3]');
  await input.press('Backspace');
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0]');
  await input.fill('Tw');
  await input.press('Backspace');
  await expect(input).toHaveValue('T');
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0]');
  await input.fill('');
  await input.dispatchEvent('keydown', { key: 'Backspace', isComposing: true });
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0]');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.press('ArrowDown');
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('multiple Select supports selection-only keyboard navigation and skips disabled values during removal', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  await fixture.getByLabel('Search multiple options', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Multiple numbers', exact: true });
  await input.focus();
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  const two = fixture.getByRole('option', { name: 'Two', exact: true });
  await expect(input).toHaveAttribute('aria-activedescendant', (await two.getAttribute('id'))!);
  await input.press('End');
  await input.press('Home');
  await input.press('ArrowDown');
  await input.press('Space');
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0,2]');
  await fixture.getByLabel('Lock option two', { exact: true }).check();
  await input.focus();
  await input.press('Backspace');
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[2]');
  const container = fixture.locator('.container').filter({ has: input });
  await expect(container.getByRole('button', { name: 'Удалить Two', exact: true })).toHaveCount(0);
  await container.getByRole('button', { name: 'Очистить', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[]');
});

test('multiple Select accepts owner values and option replacement without synthetic value callbacks', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  const input = page.getByRole('combobox', { name: 'Multiple numbers', exact: true });
  const container = fixture.locator('.container').filter({ has: input });
  await fixture.getByRole('button', { name: 'Set multiple values externally', exact: true }).click();
  await expect(container.locator('.ant-select-selection-item')).toHaveCount(2);
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[2,0,2]');
  await fixture.getByLabel('Rename option zero', { exact: true }).check();
  await expect(container.getByRole('button', { name: 'Удалить Updated zero', exact: true })).toBeVisible();
  await fixture.getByLabel('Remove option zero', { exact: true }).check();
  await expect(container.getByRole('button', { name: 'Удалить Updated zero', exact: true })).toBeVisible();
  expect(await fixture.locator('#multiple-native-form').evaluate((element) => new FormData(element as HTMLFormElement).getAll('choices'))).toEqual(['2', '0']);
  await fixture.getByLabel('Remove option zero', { exact: true }).uncheck();
  await expect(container.getByRole('button', { name: 'Удалить Updated zero', exact: true })).toBeVisible();
  await fixture.getByRole('button', { name: 'Clear multiple values externally', exact: true }).click();
  await expect(container.locator('.ant-select-selection-item')).toHaveCount(0);
  await expect(fixture.getByRole('status', { name: 'Multiple changes', exact: true })).toHaveText('[]');
});

test('multiple callback arrays are independent of the bound value', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  await fixture.getByLabel('Mutate multiple callback array', { exact: true }).check();
  await page.getByRole('combobox', { name: 'Multiple numbers', exact: true }).click();
  await fixture.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0,2]');
  await expect(fixture.getByRole('status', { name: 'Multiple changes', exact: true })).toHaveText('[[0,2]]');
});

test('multiple Select serializes repeated FormData fields and restores native defaults without callbacks', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  await fixture.getByRole('button', { name: 'Read multiple FormData', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple FormData', exact: true })).toHaveText('{"choices":["0"],"defaults":["0","2"]}');
  await page.getByRole('combobox', { name: 'Multiple numbers', exact: true }).click();
  await fixture.getByRole('option', { name: 'Two', exact: true }).click();
  await page.getByRole('combobox', { name: 'Multiple numbers', exact: true }).press('Escape');
  const defaults = fixture.locator('.container').filter({ has: page.getByRole('combobox', { name: 'Default multiple', exact: true }) });
  await defaults.getByRole('button', { name: 'Удалить Zero', exact: true }).click();
  await fixture.getByRole('button', { name: 'Reset multiple native form', exact: true }).click();

  await expect(fixture.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[]');
  await expect(defaults.locator('.ant-select-selection-item')).toHaveCount(2);
  await expect(fixture.getByRole('status', { name: 'Multiple changes', exact: true })).toHaveText('[[0,2]]');
  await expect(fixture.getByRole('status', { name: 'Multiple default changes', exact: true })).toHaveText('1');
  await fixture.getByRole('button', { name: 'Read multiple FormData', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple FormData', exact: true })).toHaveText('{"choices":[],"defaults":["0","2"]}');
});

test('required multiple selection uses native validity instead of requiring search text', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  await fixture.getByRole('button', { name: 'Clear multiple values externally', exact: true }).click();
  await fixture.getByLabel('Native multiple required', { exact: true }).check();
  await fixture.getByRole('button', { name: 'Read multiple FormData', exact: true }).click();
  const input = page.getByRole('combobox', { name: 'Multiple numbers', exact: true });
  await expect(input).toBeFocused();
  await expect(fixture.getByRole('status', { name: 'Multiple native reads', exact: true })).toHaveText('0');
  await fixture.getByLabel('Search multiple options', { exact: true }).uncheck();
  await fixture.getByRole('button', { name: 'Read multiple FormData', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple native reads', exact: true })).toHaveText('0');
  await input.pressSequentially('Zero');
  await expect(input).toHaveValue('');
  await fixture.getByLabel('Search multiple options', { exact: true }).check();
  await input.fill('Zero');
  await input.press('Enter');
  await expect.poll(() => input.evaluate((element) => (element as HTMLInputElement).checkValidity())).toBe(true);
  await input.press('Escape');
  await fixture.getByLabel('Search multiple options', { exact: true }).uncheck();
  await fixture.getByRole('button', { name: 'Read multiple FormData', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple FormData', exact: true })).toHaveText('{"choices":["0"],"defaults":["0","2"]}');
});

test('multiple Select honors external form ownership for data and native reset', async ({ page }) => {
  const fixture = page.locator('#multiple-external-fixture');
  const input = fixture.getByRole('combobox', { name: 'Outside multiple', exact: true });
  await input.click();
  await fixture.getByRole('option', { name: 'Two', exact: true }).click();
  await fixture.getByRole('button', { name: 'Read external multiple FormData', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'External multiple FormData', exact: true })).toHaveText('["0","2"]');
  await fixture.getByRole('button', { name: 'Reset external multiple form', exact: true }).click();
  await fixture.getByRole('button', { name: 'Read external multiple FormData', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'External multiple FormData', exact: true })).toHaveText('["0"]');
  await expect(page.getByRole('status', { name: 'Multiple owner', exact: true })).toHaveText('[0]');
});

test('multiple Select integrates array validation, focus, submission and Form reset', async ({ page }) => {
  const fixture = page.locator('#multiple-form-fixture');
  const input = fixture.getByLabel('Multiple roles', { exact: true });
  await fixture.getByRole('button', { name: 'Submit array form', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-required', 'true');
  await expect(input).toHaveAccessibleDescription('Select two or three roles');
  await input.click();
  await fixture.getByRole('option', { name: 'Two', exact: true }).click();
  await fixture.getByRole('option', { name: 'Three', exact: true }).click();
  await input.press('Escape');
  await fixture.getByRole('button', { name: 'Submit array form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Array form saved', exact: true })).toHaveText('[0,2,3]');
  await fixture.getByRole('button', { name: 'Очистить', exact: true }).click();
  await fixture.getByRole('button', { name: 'Submit array form', exact: true }).click();
  await expect(input).toHaveAccessibleDescription('Select at least one role');
  await fixture.getByRole('button', { name: 'Reset array form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Array form values', exact: true })).toHaveText('[0]');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(fixture.getByRole('button', { name: 'Удалить Zero', exact: true })).toBeVisible();
});

test('array Form rejects stale asynchronous validation after an external value change', async ({ page }) => {
  const fixture = page.locator('#multiple-form-fixture');
  await fixture.getByLabel('Multiple roles', { exact: true }).click();
  await fixture.getByRole('option', { name: 'Two', exact: true }).click();
  await fixture.getByLabel('Hold array validation', { exact: true }).check();
  await fixture.getByRole('button', { name: 'Submit array form', exact: true }).click();
  await expect(fixture.getByLabel('Multiple roles', { exact: true })).toBeDisabled();
  await fixture.getByRole('button', { name: 'Replace array form values', exact: true }).click();
  await fixture.getByRole('button', { name: 'Complete array validation 1', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Array form finishes', exact: true })).toHaveText('0');
  await expect(fixture.getByRole('status', { name: 'Array form values', exact: true })).toHaveText('[2,3]');
  await fixture.getByLabel('Hold array validation', { exact: true }).uncheck();
  await fixture.getByRole('button', { name: 'Submit array form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Array form saved', exact: true })).toHaveText('[2,3]');
});

test('multiple Select respects disabled context and remains safe for empty and locked options', async ({ page }) => {
  const fixture = page.locator('#multiple-select-fixture');
  const input = page.getByRole('combobox', { name: 'Multiple numbers', exact: true });
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(input).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Enabled multiple override', exact: true })).toBeEnabled();
  expect(await fixture.locator('#multiple-native-form').evaluate((element) => new FormData(element as HTMLFormElement).getAll('choices'))).toEqual([]);
  await page.getByLabel('Disable all components', { exact: true }).uncheck();
  await fixture.getByLabel('Lock every multiple option', { exact: true }).check();
  await input.click();
  await input.press('End');
  await input.press('Enter');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await expect(fixture.getByRole('status', { name: 'Multiple changes', exact: true })).toHaveText('[]');
  await fixture.getByLabel('Empty multiple options', { exact: true }).check();
  await input.click();
  await expect(fixture.getByRole('listbox', { name: 'Multiple numbers', exact: true })).toContainText('Ничего не найдено');
});

test('multiple Select consumes Escape before its Modal and restores focus to the opener', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Open multiple modal', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Multiple select dialog', exact: true });
  const input = dialog.getByRole('combobox', { name: 'Dialog choices', exact: true });
  await input.click();
  await dialog.getByRole('option', { name: 'Zero', exact: true }).click();
  await input.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('multiple Select supports string values, RTL, locale and theme changes', async ({ page }, testInfo) => {
  const fixture = page.locator('#multiple-select-fixture');
  const strings = page.getByRole('combobox', { name: 'Multiple strings', exact: true });
  await strings.click();
  await fixture.getByRole('option', { name: 'String alpha', exact: true }).click();
  await fixture.getByRole('option', { name: 'String beta', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Multiple string owner', exact: true })).toHaveText('["alpha","beta"]');
  await page.getByLabel('English locale', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await fixture.getByLabel('Dark multiple theme', { exact: true }).check();
  await fixture.getByLabel('Compact multiple theme', { exact: true }).check();
  const container = fixture.locator('.container').filter({ has: strings });
  await expect(container.getByRole('button', { name: 'Remove String alpha', exact: true })).toBeVisible();
  await expect(strings).toHaveCSS('direction', 'rtl');
  await expect(strings).toHaveCSS('font-size', '12px');
  await expect(container.locator('.ant-select-selection-item').first()).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.08)');
  await container.screenshot({ path: testInfo.outputPath('multiple-select-rtl-dark.png') });
});

test.describe('mobile multiple Select', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('wraps long selected labels without widening the page or hiding remove buttons', async ({ page }, testInfo) => {
    const fixture = page.locator('#multiple-select-fixture');
    const input = page.getByRole('combobox', { name: 'Multiple strings', exact: true });
    await input.fill('Long choice');
    await fixture.getByRole('option', { name: /^Long choice/ }).click();
    const container = fixture.locator('.container').filter({ has: input });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const remove = container.getByRole('button', { name: /^Удалить Long choice/ });
    await expect(remove).toBeVisible();
    await container.screenshot({ path: testInfo.outputPath('multiple-select-mobile.png') });
    await remove.click();
    await expect(fixture.getByRole('status', { name: 'Multiple string owner', exact: true })).toHaveText('[]');
  });
});
