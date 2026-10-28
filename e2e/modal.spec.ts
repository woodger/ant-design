import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=modal');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Modal keeps background controls inert and restores focus after Escape and reopening', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Open modal', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });
  await opener.click();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Закрыть', exact: true })).toBeFocused();
  for (const key of ['Shift+Tab', 'Shift+Tab', 'Tab', 'Tab']) {
    await page.keyboard.press(key);

    // Нативный dialog допускает переход к панели браузера, сохраняя фон страницы inert.
    await expect.poll(() => page.evaluate(() =>
      !document.hasFocus() || Boolean(document.querySelector('dialog[open]')?.contains(document.activeElement))
    )).toBe(true);
  }

  await dialog.getByRole('button', { name: 'Закрыть', exact: true }).focus();
  await page.getByLabel('Outside modal input', { exact: true }).evaluate((input: HTMLInputElement) => input.focus());
  await expect(dialog.getByRole('button', { name: 'Закрыть', exact: true })).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');

  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await opener.click();
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click();

  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(page.getByRole('status', { name: 'Cancelled count' })).toHaveText('2');
});

test('Modal closes on backdrop clicks and ignores drags starting inside the content', async ({ page }) => {
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });
  const bounds = (await dialog.boundingBox())!;

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 30);
  await page.mouse.down();
  await page.mouse.move(5, 5);
  await page.mouse.up();

  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);

  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status', { name: 'Cancelled count' })).toHaveText('1');
});

test('Modal respects disabled Escape and backdrop dismissal', async ({ page }) => {
  await page.getByLabel('Escape closes modal').uncheck();
  await page.getByLabel('Backdrop closes modal').uncheck();
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });

  await page.keyboard.press('Escape');
  await page.mouse.click(5, 5);

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();

  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status', { name: 'Cancelled count' })).toHaveText('1');
});

test('Select consumes Escape before its containing Modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });
  const select = dialog.getByLabel('Modal choice');
  await select.click();
  await select.fill('Gamma');
  await expect(dialog.getByRole('option', { name: 'Gamma', exact: true })).toBeVisible();

  await select.press('Escape');

  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog).toBeVisible();
  await select.press('Escape');

  await expect(dialog).not.toBeVisible();
});

test('Modal blocks cancellation while confirmation is pending and closes after success', async ({ page }) => {
  await page.getByLabel('Hold confirmation').check();
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();

  await expect(dialog.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Отмена', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Закрыть', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Complete confirmation' }).click();

  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status', { name: 'Confirmed count' })).toHaveText('1');
  await expect(page.getByRole('status', { name: 'Cancelled count' })).toHaveText('0');
  await expect(page.getByRole('button', { name: 'Open modal', exact: true })).toBeFocused();
});

test('Modal releases scrolling when unmounted while open', async ({ page }) => {
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

  await dialog.getByRole('button', { name: 'Unmount modal' }).click();

  await expect(page.locator('#modal-fixture dialog')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();

  await expect(dialog).toBeVisible();
});
