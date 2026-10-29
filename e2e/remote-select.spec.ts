import { test, expect } from './test';

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=select-remote'); });

test('remote Select reports only typed search, bypasses local filtering and accepts owner updates', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Remote single', exact: true });
  await input.fill('unmatched'); await expect(page.getByLabel('Remote query', { exact: true })).toHaveText('unmatched');
  await expect(page.getByRole('option', { name: 'Cached zero', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replace remote page' }).click(); await input.click();
  await expect(page.getByRole('option', { name: 'Server result 20', exact: true })).toBeVisible();
  await input.press('Escape');
  const calls = await page.getByLabel('Remote search calls', { exact: true }).textContent();
  await page.getByRole('button', { name: 'Replace remote search' }).click(); await input.click(); await expect(input).toHaveValue('Parent search');
  await expect(page.getByLabel('Remote search calls', { exact: true })).toHaveText(calls!);
  await input.press('Enter'); await expect(input).toHaveValue('Server result 20');
  await expect(page.getByLabel('Remote search calls', { exact: true })).toHaveText(calls!);
});

test('remote Select controlled search respects owner rejection and object config overrides legacy props', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Remote single', exact: true });
  await page.getByLabel('Accept remote search', { exact: true }).uncheck();
  await input.fill('rejected'); await expect(input).toHaveValue('');
  await expect(page.getByLabel('Remote search calls', { exact: true })).toHaveText('["rejected"]');
  await page.getByLabel('Accept remote search', { exact: true }).check(); await page.getByLabel('Object search config', { exact: true }).check();
  await input.fill('server query'); await expect(input).toHaveValue('server query');
  await expect(page.getByRole('option', { name: 'Cached zero', exact: true })).toBeVisible();
});

test('remote Select retains selected single/multiple labels, disabled state and form values outside options', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Remote single', exact: true });
  const multi = page.locator('#remote-multiple').locator('xpath=../..');
  await page.getByRole('button', { name: 'Remove remote results' }).click();
  await expect(input).toHaveValue('Cached zero');
  await expect(multi.locator('.ant-select-selection-item-content')).toHaveText(['Cached zero', 'Locked remote']);
  await expect(multi.getByRole('button', { name: /Locked remote/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Read remote values' }).click();
  await expect(page.getByLabel('Remote data', { exact: true })).toHaveText('{"single":"0","multiple":["0","9"]}');
  await page.getByRole('button', { name: 'Rename remote option' }).click(); await expect(input).toHaveValue('Renamed zero');
  await page.getByRole('button', { name: 'Unknown remote selection' }).click(); await expect(input).toHaveValue('42');
  await expect(multi.locator('.ant-select-selection-item-content')).toHaveText(['42']);
});

test('remote Select exposes loading/error content and retries without stealing input focus', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Remote single', exact: true });
  await page.getByRole('button', { name: 'Remove remote results' }).click(); await page.getByLabel('Remote loading state', { exact: true }).check();
  await input.click(); await expect(input).toHaveAttribute('aria-busy', 'true'); await expect(page.getByRole('listbox')).toHaveText('Remote loading');
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(0);
  await page.getByLabel('Remote loading state', { exact: true }).uncheck(); await page.getByRole('button', { name: 'Fail remote request' }).click();
  await input.click(); await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Retry remote results' }).click(); await expect(input).toBeFocused();
  await expect(page.getByRole('option', { name: 'Server result 20', exact: true })).toBeVisible(); await expect(input).not.toHaveAttribute('aria-invalid');
});

test('remote Select forwards popup scrolling for append without losing active keyboard selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Replace remote page' }).click();
  const input = page.getByRole('combobox', { name: 'Remote single', exact: true }); await input.click();
  await page.getByRole('listbox').evaluate(node => { node.scrollTop = node.scrollHeight; });
  await expect(page.getByRole('option', { name: 'Appended result', exact: true })).toBeVisible();
  await expect.poll(async () => Number(await page.getByLabel('Remote scrolls', { exact: true }).textContent())).toBeGreaterThan(0);
  await expect(input).toBeFocused(); await input.press('End'); await input.press('Enter'); await expect(input).toHaveValue('Appended result');
});

test('remote Select gallery supports search, loading, retained selection and request retry', async ({ page }) => {
  await page.goto('/ant-design#select-remote'); const section = page.locator('#select-remote');
  const input = section.getByRole('combobox', { name: 'Поиск участников', exact: true });
  await input.click(); await page.getByRole('option', { name: 'Участник 01', exact: true }).click();
  await input.fill('36'); await expect(page.getByRole('option', { name: 'Участник 36', exact: true })).toBeVisible();
  await expect(section.locator('.ant-select-selection-item-content')).toHaveText(['Участник 01']);
  await input.press('Escape');
  await section.getByRole('button', { name: 'Ошибка следующего запроса' }).click();
  await expect(section.getByRole('alert')).toHaveText('Не удалось загрузить варианты.');
  await section.getByRole('button', { name: 'Повторить поиск участников' }).click();
  await input.click(); await expect(page.getByRole('option', { name: 'Участник 36', exact: true })).toBeVisible();
});
