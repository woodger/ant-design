import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=checkbox-pagination');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Checkbox clears mixed state and updates its binding once per keyboard or label action', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Bound checkbox', exact: true });
  await expect(checkbox).toHaveJSProperty('indeterminate', true);
  await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  await expect(page.getByRole('status', { name: 'Checkbox value', exact: true })).toHaveText('undefined');
  await expect(page.getByRole('status', { name: 'Checkbox changes', exact: true })).toBeEmpty();

  await checkbox.focus();
  await checkbox.press('Space');

  await expect(checkbox).toBeChecked();
  await expect(checkbox).toHaveJSProperty('indeterminate', false);
  await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  await expect(checkbox).toBeFocused();
  await expect(checkbox.locator('..')).toHaveCSS('outline-style', 'solid');
  await expect(page.getByRole('status', { name: 'Checkbox value', exact: true })).toHaveText('true');
  await expect(page.getByRole('status', { name: 'Checkbox mixed', exact: true })).toHaveText('false');

  await page.getByText('Bound checkbox', { exact: true }).click();

  await expect(checkbox).not.toBeChecked();
  await expect(page.getByRole('status', { name: 'Checkbox changes', exact: true })).toHaveText('true,false');
});

test('Checkbox accepts external checked and mixed updates without firing a user callback', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Bound checkbox', exact: true });
  await page.getByRole('button', { name: 'Set checkbox from parent' }).click();

  await expect(checkbox).toBeChecked();
  await expect(checkbox).toHaveJSProperty('indeterminate', true);
  await page.getByRole('button', { name: 'Clear checkbox from parent' }).click();

  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toHaveJSProperty('indeterminate', false);
  await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('status', { name: 'Checkbox changes', exact: true })).toBeEmpty();
});

test('Checkbox inherits disabled state and allows an explicit override', async ({ page }) => {
  await page.getByLabel('Disable all components').check();

  await expect(page.getByRole('checkbox', { name: 'Bound checkbox', exact: true })).toBeDisabled();
  const enabled = page.getByRole('checkbox', { name: 'Explicitly enabled checkbox', exact: true });
  await enabled.check();

  await expect(enabled).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'I accept the terms' })).toBeDisabled();
  await expect(page.getByRole('status', { name: 'Checkbox changes', exact: true })).toBeEmpty();
});

test('Checkbox preserves FormData and resets default and bound values without emitting change', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Default checkbox', exact: true });
  const data = page.getByRole('status', { name: 'Checkbox FormData', exact: true });
  const bound = page.getByRole('checkbox', { name: 'Bound checkbox', exact: true });
  await bound.focus();
  await bound.press('Space');
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: 'Read checkbox FormData' }).click();
  await expect(data).toHaveText('enabled');
  await checkbox.uncheck();
  await page.getByRole('button', { name: 'Read checkbox FormData' }).click();
  await expect(data).toHaveText('null');

  await page.getByRole('button', { name: 'Reset native checkbox' }).click();

  await expect(checkbox).toBeChecked();
  await expect(bound).not.toBeChecked();
  await expect(page.getByRole('status', { name: 'Checkbox value', exact: true })).toHaveText('false');
  await expect(page.getByRole('status', { name: 'Checkbox changes', exact: true })).toHaveText('true');
  await expect(page.getByRole('status', { name: 'Default checkbox changes' })).toHaveText('1');
  await page.getByRole('button', { name: 'Read checkbox FormData' }).click();
  await expect(data).toHaveText('enabled');
});

test('Checkbox integrates boolean validation, field accessibility, focus and Form reset', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'I accept the terms' });
  await expect(checkbox).toHaveAttribute('name', 'accepted');
  await expect(checkbox).toHaveAccessibleDescription('Required for submission');
  await page.getByRole('button', { name: 'Submit consent' }).click();

  await expect(checkbox).toBeFocused();
  await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  await expect(checkbox).toHaveAccessibleDescription('Accept the terms');
  await page.getByText('Consent', { exact: true }).click();

  await expect(checkbox).toBeChecked();
  await expect(checkbox).not.toHaveAttribute('aria-invalid');
  await page.getByRole('button', { name: 'Submit consent' }).click();
  await expect(page.getByRole('status', { name: 'Consent submissions' })).toHaveText('1');
  await page.getByRole('button', { name: 'Reset consent' }).click();

  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toHaveAccessibleDescription('Required for submission');
  await expect(checkbox).not.toHaveAttribute('aria-invalid');
});

test('Pagination uses native keyboard buttons, current-page semantics and bounded navigation', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  await expect(pagination.getByRole('button', { name: 'Предыдущая страница', exact: true })).toBeDisabled();
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('1');
  const next = pagination.getByRole('button', { name: 'Следующая страница', exact: true });
  await next.focus();
  await next.press('Enter');

  await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');
  await expect(page.getByRole('status', { name: 'Pagination owner', exact: true })).toHaveText('2:10');
  await pagination.getByRole('button', { name: 'Страница 2', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Pagination events', exact: true })).toHaveText('change:2:10');
  await pagination.getByRole('button', { name: 'Страница 24', exact: true }).click();

  await expect(pagination.getByRole('button', { name: 'Следующая страница', exact: true })).toBeDisabled();
  await expect(pagination.locator('[aria-label="Pagination range"]')).toHaveText('231–237 / 237');
  await expect(page.getByRole('status', { name: 'Pagination submissions' })).toHaveText('0');
});

test('Pagination jumps five pages and restores focus when a jump button disappears', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  const forward = pagination.getByRole('button', { name: 'Следующие страницы', exact: true });
  await forward.focus();
  await forward.press('Space');

  await expect(pagination.locator('[aria-current="page"]')).toHaveText('6');
  const backward = pagination.getByRole('button', { name: 'Предыдущие страницы', exact: true });
  await backward.focus();
  await backward.press('Enter');

  await expect(pagination.getByRole('button', { name: 'Страница 1', exact: true })).toBeFocused();
  await expect(pagination.getByRole('button', { name: 'Предыдущая страница', exact: true })).toBeDisabled();
  await expect(page.getByRole('status', { name: 'Pagination events', exact: true })).toHaveText('change:6:10;change:1:10');
});

test('Pagination clamps a page-size change and emits size then change with the old and new pages', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  await page.getByRole('button', { name: 'Set page from parent' }).click();
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('24');
  const select = pagination.getByRole('combobox', { name: 'Записей на странице', exact: true });
  await select.click();
  await page.getByRole('option', { name: '50 / стр.', exact: true }).click();

  await expect(pagination.locator('[aria-current="page"]')).toHaveText('5');
  await expect(pagination.locator('[aria-label="Pagination range"]')).toHaveText('201–237 / 237');
  await expect(select).toHaveValue('50 / стр.');
  await expect(page.getByRole('status', { name: 'Pagination owner', exact: true })).toHaveText('5:50');
  await expect(page.getByRole('status', { name: 'Pagination events', exact: true })).toHaveText('size:24:50;change:5:50');
});

test('Pagination clamps display on prop updates without changing owner state or emitting callbacks', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  await page.getByRole('button', { name: 'Set page from parent' }).click();
  await page.getByRole('button', { name: 'Set total to 15' }).click();

  await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');
  await expect(pagination.locator('[aria-label="Pagination range"]')).toHaveText('11–15 / 15');
  await expect(pagination.getByRole('combobox')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Pagination owner', exact: true })).toHaveText('24:10');
  await page.getByRole('button', { name: 'Set size from parent' }).click();

  await expect(pagination.locator('[aria-current="page"]')).toHaveText('1');
  await expect(page.getByRole('status', { name: 'Pagination owner', exact: true })).toHaveText('24:50');
  await expect(page.getByRole('status', { name: 'Pagination events', exact: true })).toBeEmpty();
});

test('Pagination represents an empty collection and can hide a single page', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  await page.getByRole('button', { name: 'Empty data' }).click();

  await expect(pagination.locator('[aria-label="Pagination range"]')).toHaveText('0–0 / 0');
  await expect(pagination.getByRole('button', { name: 'Страница 1', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(pagination.getByRole('button', { name: 'Предыдущая страница', exact: true })).toBeDisabled();
  await expect(pagination.getByRole('button', { name: 'Следующая страница', exact: true })).toBeDisabled();
  await page.getByLabel('Hide single page').check();

  await expect(pagination).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Pagination events', exact: true })).toBeEmpty();
});

test('Pagination keeps a huge collection bounded and normalizes invalid inputs in the browser', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  await page.getByRole('button', { name: 'Large data' }).click();

  await expect(pagination.locator('.ant-pagination-item')).toHaveCount(7);
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('1000');
  await expect(pagination.getByRole('button', { name: `Страница ${Number.MAX_SAFE_INTEGER}`, exact: true })).toBeVisible();
  await pagination.getByRole('combobox').click();
  await expect(page.getByRole('option', { name: '1 / стр.', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Invalid pagination inputs' }).click();

  await expect(pagination.locator('[aria-current="page"]')).toHaveText('1');
  await expect(pagination.locator('[aria-label="Pagination range"]')).toHaveText('0–0 / 0');
  await expect(page.getByRole('status', { name: 'Pagination owner', exact: true })).toHaveText('-5:0');
  await expect(page.getByRole('status', { name: 'Pagination events', exact: true })).toBeEmpty();
});

test('Pagination supports an uncontrolled initial page and disabled context overrides', async ({ page }) => {
  const initial = page.getByRole('navigation', { name: 'Default pagination', exact: true });
  await expect(initial.locator('[aria-current="page"]')).toHaveText('7');
  await expect(initial.getByRole('combobox')).toHaveCount(0);
  await initial.getByRole('button', { name: 'Предыдущая страница', exact: true }).click();
  await expect(initial.locator('[aria-current="page"]')).toHaveText('6');
  await page.getByLabel('Disable all components').check();

  const pagination = page.getByRole('navigation', { name: 'Пагинация', exact: true });
  for (const button of await pagination.getByRole('button').all()) {
    await expect(button).toBeDisabled();
  }
  await expect(pagination.getByRole('combobox')).toBeDisabled();
  await expect(page.getByRole('navigation', { name: 'Explicitly enabled pagination', exact: true }).getByRole('button', { name: 'Страница 1', exact: true })).toBeEnabled();
  await expect(page.getByRole('navigation', { name: 'Explicitly enabled pagination', exact: true }).getByRole('combobox')).toBeEnabled();
});

test('Pagination can show a size changer for a small collection with unique valid custom options', async ({ page }) => {
  const pagination = page.getByRole('navigation', { name: 'Explicitly enabled pagination', exact: true });
  const select = pagination.getByRole('combobox');
  await expect(select).toHaveValue('15 / стр.');
  await select.click();

  await expect(pagination.getByRole('option')).toHaveText(['10 / стр.', '15 / стр.', '20 / стр.']);
  await pagination.getByRole('option', { name: '20 / стр.', exact: true }).click();

  await expect(select).toHaveValue('20 / стр.');
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('1');
});

test('Pagination inherits reactive locale and RTL through nested partial configuration', async ({ page }) => {
  await page.getByLabel('Right to left').check();
  await page.getByLabel('English locale').check();
  const pagination = page.getByRole('navigation', { name: 'Pagination', exact: true });

  await expect(pagination).toHaveCSS('direction', 'rtl');
  await expect(pagination.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(pagination.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled();
  await expect(pagination.getByRole('combobox', { name: 'Items per page', exact: true })).toHaveValue('10 / page');
  const first = (await pagination.getByRole('button', { name: 'Page 1', exact: true }).boundingBox())!;
  const second = (await pagination.getByRole('button', { name: 'Page 2', exact: true }).boundingBox())!;
  expect(first.x).toBeGreaterThan(second.x);
  await expect(page.getByRole('navigation', { name: 'Custom pagination', exact: true }).getByRole('button', { name: 'Next page', exact: true })).toBeEnabled();
  await page.getByLabel('English locale').uncheck();

  await expect(page.getByRole('navigation', { name: 'Custom pagination', exact: true }).getByRole('button', { name: 'Следующая страница', exact: true })).toBeEnabled();
});
