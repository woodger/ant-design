import type { Locator } from '@playwright/test';
import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Input updates its binding and callback only when the user edits it', async ({ page }) => {
  const input = page.getByLabel('Bound input', { exact: true });
  await expect(input).toHaveValue('');

  await input.fill('Typed value');

  await expect(page.getByRole('status', { name: 'Input value', exact: true })).toHaveText('Typed value');
  await expect(page.getByRole('status', { name: 'Input changes' })).toHaveText('1');

  await page.getByRole('button', { name: 'Set input from parent' }).click();
  await expect(input).toHaveValue('Parent value');
  await page.getByRole('button', { name: 'Clear input from parent' }).click();

  await expect(input).toHaveValue('');
  await expect(page.getByRole('status', { name: 'Input value', exact: true })).toHaveText('undefined');
  await expect(page.getByRole('status', { name: 'Input changes' })).toHaveText('1');
});

test('Input supports editing and clearing an uncontrolled default value', async ({ page }) => {
  const input = page.getByLabel('Default input', { exact: true });
  await expect(input).toHaveValue('Initial default');

  await input.fill('Changed');
  await expect(input).toHaveValue('Changed');
  await input.fill('');

  await expect(input).toHaveValue('');
});

test('ConfigProvider disables controls while preserving explicit overrides', async ({ page }) => {
  await page.getByLabel('Disable all components').check();

  await expect(page.getByLabel('Bound input', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Plain select', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Explicitly enabled input')).toBeEnabled();

  await page.getByLabel('Disable all components').uncheck();

  await expect(page.getByLabel('Bound input', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('Plain select', { exact: true })).toBeEnabled();
});

test('Select skips disabled options and supports Home, End, Enter and wrapping', async ({ page }) => {
  const select = page.getByLabel('Plain select', { exact: true });
  const expectActive = async (option: Locator) => {
    await expect(select).toHaveAttribute('aria-activedescendant', (await option.getAttribute('id'))!);
  };
  await select.focus();
  await select.press('ArrowDown');

  await expectActive(page.getByRole('option', { name: 'Alpha', exact: true }));
  await select.press('ArrowDown');
  await expectActive(page.getByRole('option', { name: 'Gamma', exact: true }));
  await select.press('ArrowDown');
  await expectActive(page.getByRole('option', { name: 'Alpha', exact: true }));
  await select.press('End');
  await expectActive(page.getByRole('option', { name: 'Gamma', exact: true }));
  await select.press('Home');
  await expectActive(page.getByRole('option', { name: 'Alpha', exact: true }));
  await select.press('ArrowUp');
  await select.press('Enter');

  await expect(select).toHaveValue('Gamma');
  await expect(select).toBeFocused();
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('status', { name: 'Selected value' })).toHaveText('gamma');
});

test('Select opens when the arrow area is clicked', async ({ page }) => {
  const trigger = page.locator('#select-fixture .ant-select').first();
  const bounds = (await trigger.boundingBox())!;

  await trigger.click({ position: { x: bounds.width - 6, y: bounds.height / 2 } });

  await expect(page.getByLabel('Plain select', { exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('option', { name: 'Alpha', exact: true })).toBeVisible();
});

test('Select supports search, disabled matches and empty search results', async ({ page }) => {
  const select = page.getByLabel('Searchable select', { exact: true });
  await select.click();
  await select.fill('bEtA');

  await expect(page.getByRole('option', { name: 'Beta', exact: true })).toBeDisabled();
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'true');
  await select.fill('missing');
  await expect(page.getByText('Ничего не найдено', { exact: true })).toBeVisible();
  await expect(select).not.toHaveAttribute('aria-activedescendant');
  await select.fill('  GAMMA  ');
  await select.press('Enter');

  await expect(select).toHaveValue('Gamma');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
});

test('Select dismisses on Escape, Tab and outside pointer interaction', async ({ page }) => {
  const select = page.getByLabel('Plain select', { exact: true });
  await select.click();
  await select.press('Escape');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(select).toBeFocused();

  await select.click();
  await select.press('Tab');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#select-fixture').getByRole('button', { name: 'Очистить', exact: true })).toBeFocused();

  await select.click();
  await page.getByRole('heading', { name: 'Component browser fixtures', exact: true }).click();

  await expect(select).toHaveAttribute('aria-expanded', 'false');
});

test('Select clears through the keyboard and accepts an external reset', async ({ page }) => {
  const select = page.getByLabel('Plain select', { exact: true });
  await select.focus();
  await select.press('Delete');

  await expect(select).toHaveValue('');
  await expect(page.getByRole('status', { name: 'Selected value' })).toHaveText('undefined');
  await select.press('g');
  await select.press('Enter');
  await expect(select).toHaveValue('Gamma');
  await page.getByRole('button', { name: 'Clear selection from parent' }).click();

  await expect(select).toHaveValue('');
});

test('Select closes when disabled through a parent update and stays closed after enabling', async ({ page }) => {
  const select = page.getByLabel('Plain select', { exact: true });
  await select.click();
  await select.press('F2');

  await expect(select).toBeDisabled();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.keyboard.press('F2');

  await expect(select).toBeEnabled();
  await expect(select).toHaveAttribute('aria-expanded', 'false');
});

test('Select preserves numeric zero in bindings and FormData after clearing and selecting again', async ({ page }) => {
  const fixture = page.locator('#numeric-fixture');
  const select = page.getByLabel('Numeric select', { exact: true });
  await expect(select).toHaveValue('Zero');
  await fixture.getByRole('button', { name: 'Read FormData' }).click();
  await expect(page.getByRole('status', { name: 'FormData value' })).toHaveText('0');

  await select.focus();
  await select.press('Tab');
  await fixture.getByRole('button', { name: 'Очистить', exact: true }).press('Enter');

  await expect(select).toHaveValue('');
  await expect(page.getByRole('status', { name: 'Numeric value' })).toHaveText('undefined');
  await select.click();
  await page.getByRole('option', { name: 'Zero', exact: true }).click();
  await fixture.getByRole('button', { name: 'Read FormData' }).click();

  await expect(page.getByRole('status', { name: 'Numeric value' })).toHaveText('number:0');
  await expect(page.getByRole('status', { name: 'FormData value' })).toHaveText('0');
});

test('Select keeps empty and entirely disabled lists keyboard safe', async ({ page }) => {
  const empty = page.getByLabel('Empty select', { exact: true });
  await empty.focus();
  await empty.press('ArrowDown');
  await empty.press('Enter');

  await expect(empty).not.toHaveAttribute('aria-activedescendant');
  await expect(page.getByText('Ничего не найдено', { exact: true })).toBeVisible();
  await empty.press('Escape');

  const disabled = page.getByLabel('Disabled options', { exact: true });
  await disabled.focus();
  await disabled.press('ArrowDown');
  await disabled.press('End');
  await disabled.press('Enter');

  await expect(disabled).not.toHaveAttribute('aria-activedescendant');
  await expect(disabled).toHaveValue('');
  await expect(disabled).toHaveAttribute('aria-expanded', 'true');
});
