import { test, expect } from './test';

test('showcase hydrates and updates theme colors and component sizes', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const input = page.getByLabel('Редактируемое значение', { exact: true });
  const primary = page.getByRole('button', { name: 'Основная', exact: true });
  const checked = page.locator('#checkbox .ant-checkbox-checked');
  const activePage = page.locator('#pagination .ant-pagination-item-active');
  const table = page.getByRole('table', { name: 'Участники проекта', exact: true });
  await input.fill('Browser input');

  await expect(page.locator('#inputs .output')).toContainText('Browser input');
  await expect(primary).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(input).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(checked).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(activePage).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#table .ant-table')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('light.png'), fullPage: true });

  await page.getByRole('button', { name: 'Фиолетовый', exact: true }).click();
  await expect(primary).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await expect(checked).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await expect(activePage.getByRole('button')).toHaveCSS('color', 'rgb(114, 46, 209)');
  await page.getByRole('button', { name: 'Тёмная тема' }).click();

  await expect(input).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(activePage).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(page.locator('#table .ant-table')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await page.screenshot({ path: testInfo.outputPath('dark.png'), fullPage: true });

  await page.getByRole('button', { name: 'L', exact: true }).click();
  await expect(input).toHaveCSS('height', '40px');
  await expect(activePage).toHaveCSS('height', '40px');
  await expect(table.getByRole('columnheader', { name: 'Участник', exact: true })).toHaveCSS('padding-block-start', '16px');
  await page.getByRole('button', { name: 'S', exact: true }).click();
  await expect(input).toHaveCSS('height', '24px');
  await expect(activePage).toHaveCSS('height', '24px');
  await expect(table.getByRole('columnheader', { name: 'Участник', exact: true })).toHaveCSS('padding-block-start', '8px');
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await expect(input).toHaveCSS('height', '32px');
  await expect(activePage).toHaveCSS('height', '32px');
  await expect(table.getByRole('columnheader', { name: 'Участник', exact: true })).toHaveCSS('padding-block-start', '12px');
  const normalHeight = (await input.boundingBox())!.height;
  await page.locator('#overview').getByRole('button', { name: 'Обычная', exact: true }).click();

  await expect.poll(async () => (await input.boundingBox())!.height).toBeLessThan(normalHeight);
  await expect(activePage).toHaveCSS('height', '28px');
});

test('showcase keeps table selection between pages and exposes sorting, loading and empty states', async ({ page }) => {
  await page.goto('/ant-design');
  const table = page.getByRole('table', { name: 'Участники проекта', exact: true });
  const pagination = page.getByRole('navigation', { name: 'Страницы участников', exact: true });
  await table.getByRole('checkbox', { name: 'Выбрать: Анна Иванова', exact: true }).check();
  await pagination.getByRole('button', { name: 'Страница 2', exact: true }).click();
  await table.getByRole('checkbox', { name: 'Выбрать: Егор Смирнов', exact: true }).check();
  await pagination.getByRole('button', { name: 'Страница 1', exact: true }).click();

  await expect(table.getByRole('checkbox', { name: 'Выбрать: Анна Иванова', exact: true })).toBeChecked();
  await expect(page.locator('#table .output')).toContainText('Выбрано участников: 2.');
  await table.getByRole('button', { name: 'Задачи', exact: true }).click();
  await expect(table.locator('tbody tr > td:nth-child(2)').first()).toHaveText('Дарья Орлова');
  await page.getByRole('checkbox', { name: 'Загрузка таблицы', exact: true }).check();

  await expect(table).toHaveAttribute('aria-busy', 'true');
  await expect(table.getByRole('button', { name: 'Задачи', exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Загрузка таблицы', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Пустые данные', exact: true }).check();

  await expect(table.getByRole('cell', { name: 'Нет данных', exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Пустые данные', exact: true }).uncheck();
  await expect(table.locator('tbody tr')).toHaveCount(5);
  await expect(page.locator('#table .output')).toContainText('Выбрано участников: 2.');
});

test('showcase applies combined filters, shows empty results and restores data after reset', async ({ page }) => {
  await page.goto('/ant-design');
  const table = page.getByRole('table', { name: 'Участники проекта', exact: true });
  await table.getByRole('button', { name: 'Фильтр: Команда', exact: true }).click();
  const teams = page.getByRole('dialog', { name: 'Фильтр: Команда', exact: true });
  await teams.getByRole('checkbox', { name: 'Поддержка', exact: true }).check();
  await teams.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Глеб Волков', 'Жанна Белова', 'Лев Попов']);
  await table.getByRole('button', { name: 'Фильтр: Статус', exact: true }).click();
  const status = page.getByRole('dialog', { name: 'Фильтр: Статус', exact: true });
  await status.getByRole('radio', { name: 'Приостановлен', exact: true }).check();
  await status.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(table.getByRole('cell', { name: 'Нет данных', exact: true })).toBeVisible();
  await expect(table.getByRole('checkbox', { name: 'Выбрать все строки на странице', exact: true })).toBeDisabled();
  await table.getByRole('button', { name: 'Фильтр: Статус', exact: true }).click();
  await status.getByRole('button', { name: 'Сбросить', exact: true }).click();
  await status.getByRole('button', { name: 'Применить', exact: true }).click();
  await expect(table.locator('tbody tr')).toHaveCount(3);
  await table.getByRole('button', { name: 'Фильтр: Команда', exact: true }).click();
  await teams.getByRole('button', { name: 'Сбросить', exact: true }).click();
  await teams.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Анна Иванова', 'Борис Соколов', 'Вера Петрова', 'Глеб Волков', 'Дарья Орлова']);
});

test('showcase updates the select-all checkbox and pagination bindings after hydration', async ({ page }) => {
  await page.goto('/ant-design');
  const all = page.getByRole('checkbox', { name: 'Все права', exact: true });
  await expect(all).toHaveJSProperty('indeterminate', true);
  await all.check();

  await expect(page.locator('#checkbox .output')).toHaveText('Выбрано прав: 3 из 3.');
  await expect(all).toHaveJSProperty('indeterminate', false);
  await page.getByRole('checkbox', { name: 'Редактирование', exact: true }).uncheck();

  await expect(all).toHaveAttribute('aria-checked', 'mixed');
  await expect(page.locator('#checkbox .output')).toHaveText('Выбрано прав: 2 из 3.');
  const pagination = page.getByRole('navigation', { name: 'Пример пагинации', exact: true });
  await pagination.getByRole('button', { name: 'Следующая страница', exact: true }).click();
  await expect(page.locator('#pagination .output')).toHaveText('Страница: 2. Записей на странице: 10.');
  await pagination.getByRole('combobox').click();
  await pagination.getByRole('option', { name: '50 / стр.', exact: true }).click();

  await expect(page.locator('#pagination .output')).toHaveText('Страница: 2. Записей на странице: 50.');
  await expect(pagination.locator('.ant-pagination-total-text')).toHaveText('51–100 из 137');
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
    const pagination = page.getByRole('navigation', { name: 'Пример пагинации', exact: true });
    await expect(pagination.getByRole('combobox')).toBeVisible();
    const tableRegion = page.locator('#table').getByRole('region', { name: 'Участники проекта', exact: true });
    await expect.poll(() => tableRegion.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
    await pagination.getByRole('combobox').click();
    await pagination.getByRole('option', { name: '20 / стр.', exact: true }).click();
    await expect(page.locator('#pagination .output')).toHaveText('Страница: 1. Записей на странице: 20.');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
    await expect(page.getByRole('checkbox', { name: 'Все права', exact: true })).toHaveAttribute('aria-checked', 'mixed');
    await expect(page.getByRole('checkbox', { name: 'Просмотр', exact: true })).toBeChecked();
    await expect(page.getByRole('navigation', { name: 'Пример пагинации', exact: true }).locator('[aria-current="page"]')).toHaveText('1');
    const table = page.getByRole('table', { name: 'Участники проекта', exact: true });
    await expect(table.locator('tbody tr')).toHaveCount(5);
    await expect(table.locator('tbody tr > td:nth-child(2)').first()).toHaveText('Анна Иванова');
    await expect(page.locator('dialog')).not.toBeVisible();
  });
});
