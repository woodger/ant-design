import { test, expect } from './test';

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=date-picker'); });

test('DatePicker selects a native calendar cell, updates Dayjs through callbacks and closes', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Calendar date', exact: true });
  await expect(input).toHaveValue('2026-10-15'); await input.click();
  const popup = page.getByRole('dialog'); await expect(popup).toBeVisible();
  await expect(popup.getByRole('grid').getByRole('row')).toHaveCount(7);
  await popup.getByRole('button', { name: '2026-10-25', exact: true }).click();
  await expect(input).toHaveValue('2026-10-25'); await expect(input).toBeFocused();
  await expect(page.getByLabel('Picker changes', { exact: true })).toHaveText('["2026-10-25"]'); await expect(popup).toHaveCount(0);
});

test('DatePicker datetime keeps draft until OK and preserves UTC and applies source millisecondStep while changing day/minute', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Calendar datetime', exact: true }); await input.click();
  const popup = page.getByRole('dialog'); await popup.getByRole('button', { name: '2026-10-20', exact: true }).click();
  await popup.getByRole('button', { name: 'minute 45', exact: true }).click();
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-15T10:20:30.123Z');
  await popup.getByRole('button', { name: 'ОК', exact: true }).click();
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-20T10:45:30.100Z');
  await expect(page.getByLabel('Picker datetime UTC', { exact: true })).toHaveText('UTC');
  await expect(input).toHaveValue('2026-10-20 10:45:30');
});

test('DatePicker cancel discards unconfirmed time and source inputReadOnly still permits calendar and clearing', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Calendar datetime', exact: true }); await input.click();
  await page.getByRole('button', { name: 'hour 15', exact: true }).click(); await input.press('Escape');
  await expect(input).toHaveValue('2026-10-15 10:20:30');
  await page.getByLabel('Readonly picker input', { exact: true }).check(); await expect(input).toHaveAttribute('readonly', '');
  await input.click(); await page.getByRole('button', { name: '2026-10-21', exact: true }).click();
  await page.getByRole('button', { name: 'ОК', exact: true }).click(); await expect(input).toHaveValue('2026-10-21 10:20:30');
  await input.locator('xpath=../..').getByRole('button', { name: 'Очистить', exact: true }).click();
  await expect(input).toHaveValue(''); await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('null');
});

test('DatePicker strictly validates manual input and restores invalid text on blur', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Calendar date', exact: true });
  await input.fill('2025-02-29'); await expect(input).toHaveAttribute('aria-invalid', 'true'); await input.press('Enter');
  await expect(page.getByLabel('Picker changes', { exact: true })).toHaveText('[]');
  await page.getByRole('heading', { name: 'Component browser fixtures', exact: true }).click(); await expect(input).toHaveValue('2026-10-15');
  await input.fill('2024-02-29'); await input.press('Enter'); await expect(page.getByLabel('Picker value', { exact: true })).toHaveText('2024-02-29');
});

test('DatePicker controlled owner may reject changes without changing the displayed value', async ({ page }) => {
  await page.getByLabel('Accept picker changes', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Calendar date', exact: true }); await input.click();
  await page.getByRole('button', { name: '2026-10-22', exact: true }).click();
  await expect(input).toHaveValue('2026-10-15'); await expect(page.getByLabel('Picker changes', { exact: true })).toHaveText('["2026-10-22"]');
});

test('DatePicker applies date and dependent time constraints before commit', async ({ page }) => {
  await page.getByLabel('Restrict picker dates and times', { exact: true }).check();
  const date = page.getByRole('combobox', { name: 'Calendar date', exact: true }); await date.click();
  await expect(page.getByRole('button', { name: '2026-10-09', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '2026-10-13', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '2026-10-12', exact: true }).focus(); await page.getByRole('button', { name: '2026-10-12', exact: true }).press('ArrowRight');
  await expect(page.getByRole('button', { name: '2026-10-14', exact: true })).toBeFocused(); await date.press('Escape');
  await page.getByRole('combobox', { name: 'Calendar datetime', exact: true }).click();
  await expect(page.getByRole('button', { name: 'hour 11', exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: 'minute 25', exact: true })).toBeDisabled();
});

test('DatePicker keyboard enters the grid, moves dates and restores focus on Escape', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Calendar date', exact: true }); await input.focus(); await input.press('ArrowDown');
  const cell = page.getByRole('button', { name: '2026-10-15', exact: true }); await expect(cell).toBeFocused();
  await cell.press('ArrowRight'); const next = page.getByRole('button', { name: '2026-10-16', exact: true }); await expect(next).toBeFocused();
  await next.press('Escape'); await expect(input).toBeFocused(); await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('DatePicker switches month/year panels, localizes labels and supports global disabled overrides', async ({ page }) => {
  await page.getByLabel('English picker locale', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Uncontrolled date', exact: true }); await input.click();
  await page.getByRole('button', { name: 'Choose a month', exact: true }).click(); await page.getByRole('button', { name: '2026-12', exact: true }).click();
  await page.getByRole('button', { name: '2026-12-15', exact: true }).click(); await expect(input).toHaveValue('2026-12-15');
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(input).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Enabled date', exact: true })).toBeEnabled();
});

test('DatePicker native form submits display strings and hides seconds while retaining source time-step alignment', async ({ page }) => {
  await page.getByLabel('Hide picker seconds', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Calendar datetime', exact: true }); await input.click();
  await page.getByRole('button', { name: '2026-10-23', exact: true }).click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-23T10:20:30.100Z');
  await page.getByRole('button', { name: 'Read picker data', exact: true }).click();
  await expect(page.getByLabel('Picker FormData', { exact: true })).toHaveText('{"date":"2026-10-15","time":"2026-10-23 10:20"}');
});

test('DatePicker preserves explicitly configured millisecond precision for panel selection and manual input', async ({ page }) => {
  await page.getByLabel('Picker millisecond precision', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Calendar datetime', exact: true }); await input.click();
  await page.getByRole('button', { name: 'minute 21', exact: true }).click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-15T10:21:30.123Z');
  await input.fill('2026-10-15 10:21:30.987'); await input.press('Enter');
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-15T10:21:30.987Z');
});

for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati']) test.describe(`DatePicker in ${timezoneId}`, () => {
  test.use({ timezoneId });
  test('uses the supplied Dayjs UTC mode without forcing the browser timezone on panel edits', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Calendar datetime', exact: true }); await expect(input).toHaveValue('2026-10-15 10:20:30');
    await input.click(); await page.getByRole('button', { name: '2026-10-20', exact: true }).click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
    await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-20T10:20:30.100Z');
    await expect(page.getByLabel('Picker datetime UTC', { exact: true })).toHaveText('UTC');
  });
});

test('DatePicker gallery hydrates its Dayjs values and commits confirmed datetime', async ({ page }) => {
  await page.goto('/ant-design#date-picker');
  const input = page.getByRole('combobox', { name: 'Дата и время события', exact: true }); await input.click();
  await page.getByRole('button', { name: '2026-10-30', exact: true }).click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
  await expect(page.getByLabel('Значение datetime DatePicker', { exact: true })).toHaveText('2026-10-30 10:30:15.100');
});


test('DatePicker without confirmation keeps a datetime draft until close and retains UTC panel precision', async ({ page }) => {
  await page.getByLabel('Confirm picker datetime', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Calendar datetime', exact: true }); await input.click();
  await page.getByRole('button', { name: 'minute 24', exact: true }).click();
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-15T10:20:30.123Z');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('heading', { name: 'Component browser fixtures', exact: true }).click();
  await expect(page.getByLabel('Picker datetime value', { exact: true })).toHaveText('2026-10-15T10:24:30.100Z');
});

test('DatePicker disabling closes an uncontrolled popup without reopening it on enable', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Calendar date', exact: true }); await input.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Disable all components', { exact: true }).uncheck(); await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('DatePicker stores Dayjs in Form, validates null, submits the object value and resets', async ({ page }) => {
  const input = page.getByRole('combobox', { name: '* Form datetime', exact: true });
  await page.getByRole('button', { name: 'Submit picker form', exact: true }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(input).toHaveAccessibleDescription('Choose a date'); await expect(input).toBeFocused();
  await input.click(); await page.getByRole('button', { name: '2026-10-20', exact: true }).click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
  await expect(page.getByLabel('Form Dayjs value', { exact: true })).toHaveText('Dayjs');
  await page.getByRole('button', { name: 'Submit picker form', exact: true }).click();
  await expect(page.getByLabel('Form submitted date', { exact: true })).toHaveText('2026-10-20 08:30:00.000');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await page.getByRole('button', { name: 'Reset picker form', exact: true }).click();
  await expect(input).toHaveValue(''); await expect(page.getByLabel('Form Dayjs value', { exact: true })).toHaveText('null');
});

test('DatePicker keeps source control geometry and native calendar colors while navigating RTL', async ({ page }) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Calendar date', exact: true });
  await expect(input.locator('xpath=../..')).toHaveCSS('height', '32px');
  await input.focus(); await input.press('ArrowDown');
  await page.getByRole('button', { name: '2026-10-15', exact: true }).press('ArrowLeft');
  const next = page.getByRole('button', { name: '2026-10-16', exact: true }); await expect(next).toBeFocused();
  expect(await next.evaluate(node => getComputedStyle(node).color === getComputedStyle(node.parentElement!).color)).toBe(true);
  const previousMonth = page.getByRole('button', { name: '2026-09-30', exact: true });
  expect(await previousMonth.evaluate(node => getComputedStyle(node).color === getComputedStyle(node.parentElement!).color)).toBe(true);
});


test('DatePicker scrolls the selected time units into view when opening its panel', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Calendar datetime', exact: true }).click();
  const column = page.getByRole('list', { name: 'minute', exact: true });
  const selected = column.getByRole('button', { name: 'minute 20', exact: true });
  await expect.poll(async () => {
    const area = (await column.boundingBox())!; const cell = (await selected.boundingBox())!;
    return cell.y >= area.y && cell.y + cell.height <= area.y + area.height;
  }).toBe(true);
});

test('DatePicker decade navigation keeps the selected decade and moves keyboard focus by a decade', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Calendar date', exact: true }).click();
  const popup = page.getByRole('dialog');
  await popup.locator('.ant-picker-year-btn').click(); await popup.locator('.ant-picker-year-btn').click();
  const decade = popup.getByRole('button', { name: '2020', exact: true });
  await expect(decade.locator('xpath=..')).toHaveClass(/ant-picker-cell-selected/);
  await decade.focus(); await decade.press('ArrowRight'); await expect(popup.getByRole('button', { name: '2030', exact: true })).toBeFocused();
});
