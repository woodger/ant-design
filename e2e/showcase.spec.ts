import { test, expect } from './test';

test('showcase hydrates and updates theme colors and component sizes', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const input = page.getByLabel('Редактируемое значение', { exact: true });
  const primary = page.getByRole('button', { name: 'Основная', exact: true });
  await input.fill('Browser input');

  await expect(page.locator('#inputs .output')).toContainText('Browser input');
  await expect(primary).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(input).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('light.png'), fullPage: true });

  await page.getByRole('button', { name: 'Фиолетовый', exact: true }).click();
  await expect(primary).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await page.getByRole('button', { name: 'Тёмная тема' }).click();

  await expect(input).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await page.screenshot({ path: testInfo.outputPath('dark.png'), fullPage: true });

  await page.getByRole('button', { name: 'L', exact: true }).click();
  await expect(input).toHaveCSS('height', '40px');
  await page.getByRole('button', { name: 'S', exact: true }).click();
  await expect(input).toHaveCSS('height', '24px');
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await expect(input).toHaveCSS('height', '32px');
  const normalHeight = (await input.boundingBox())!.height;
  await page.locator('#overview').getByRole('button', { name: 'Обычная', exact: true }).click();

  await expect.poll(async () => (await input.boundingBox())!.height).toBeLessThan(normalHeight);
});

test('showcase validates its real form and resets values after successful submission', async ({ page }) => {
  await page.goto('/ant-design');
  const name = page.getByLabel('Имя', { exact: true });
  const email = page.getByLabel('Email', { exact: true });
  const password = page.getByLabel('Пароль', { exact: true });
  const confirmation = page.getByLabel('Подтверждение пароля', { exact: true });
  await page.getByRole('button', { name: 'Проверить форму', exact: true }).click();

  await expect(name).toBeFocused();
  await expect(name).toHaveAccessibleDescription('Введите имя участника.');
  await name.fill('Анна');
  await email.fill('invalid');
  await password.fill('password123');
  await confirmation.fill('different');
  await page.getByRole('button', { name: 'Проверить форму', exact: true }).click();

  await expect(email).toHaveAccessibleDescription('Укажите email в формате name@example.com.');
  await expect(confirmation).toHaveAccessibleDescription('Пароли должны совпадать.');
  await email.fill('anna@example.com');
  await confirmation.fill('password123');
  await page.getByRole('button', { name: 'Проверить форму', exact: true }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Проверка пройдена:' })).toHaveText('Проверка пройдена: Анна, anna@example.com.');
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click();

  await expect(name).toHaveValue('');
  await expect(email).toHaveValue('');
  await expect(password).toHaveValue('');
  await expect(confirmation).toHaveValue('');
});

test('ConfigProvider updates inherited direction and locale in controls and dialogs', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174');
  await page.getByLabel('Right to left').check();
  await page.getByLabel('English locale').check();

  await expect(page.getByLabel('Plain select', { exact: true })).toHaveCSS('direction', 'rtl');
  await expect(page.locator('#select-fixture').getByRole('button', { name: 'Clear', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'Fixture modal' });
  await expect(dialog).toHaveCSS('direction', 'rtl');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'OK', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

  await expect(dialog).not.toBeVisible();
});

test.describe('mobile showcase', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('keeps the page and modal within the viewport', async ({ page }, testInfo) => {
    await page.goto('/ant-design');
    await expect(page.getByRole('heading', { name: 'Ant Design для Svelte', exact: true })).toBeVisible();

    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
    const opener = page.getByRole('button', { name: 'Открыть модальное окно', exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Всё готово к работе', exact: true });
    await expect(dialog).toBeVisible();
    const bounds = (await dialog.boundingBox())!;

    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
    expect(bounds.height).toBeLessThanOrEqual(812);
    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(opener).toBeFocused();
  });
});

test.describe('server-rendered showcase', () => {
  test.use({ javaScriptEnabled: false });

  test('provides labelled form controls and keeps the modal hidden before hydration', async ({ page }) => {
    await page.goto('/ant-design');

    await expect(page.getByRole('heading', { name: 'Ant Design для Svelte', exact: true })).toBeVisible();
    await expect(page.getByLabel('Редактируемое значение', { exact: true })).toHaveValue('Svelte 5');
    await expect(page.getByLabel('Имя', { exact: true })).toHaveCount(1);
    await expect(page.getByLabel('Роль', { exact: true })).toHaveValue('Разработчик');
    await expect(page.locator('dialog')).not.toBeVisible();
  });
});
