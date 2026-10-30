import { test, expect } from './test';

test(
  'ConfigProvider updates inherited direction and locale in controls and dialogs',
  async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'Component browser fixtures' }).waitFor();
    await page.getByLabel('Right to left').check();
    await page.getByLabel('English locale').check();

    await expect(page.getByLabel('Plain select', { exact: true })).toHaveCSS('direction', 'rtl');
    await expect(
      page.locator('#select-fixture').getByRole('button', { name: 'Clear', exact: true })
    )
      .toBeVisible();

    await page.getByRole('button', { name: 'Open modal', exact: true }).click();

    const dialog = page.getByRole('dialog', { name: 'Fixture modal' });

    await expect(dialog).toHaveCSS('direction', 'rtl');
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'OK', exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(dialog).not.toBeVisible();
  }
);
