import { test, expect } from './test';

test.describe('Result showcase', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/ant-design#result'); });

  test('submits a valid form, focuses the outcome, and preserves edited values on return', async ({ page }, testInfo) => {
    const fixture = page.locator('#result'); const name = fixture.getByRole('textbox', { name: 'Имя в заявке' }); const email = fixture.getByRole('textbox', { name: 'Email в заявке' });
    await name.fill('Мария'); await email.fill('maria@example.com'); await fixture.screenshot({ path: testInfo.outputPath('result-example-form.png') });
    await fixture.getByRole('button', { name: 'Отправить заявку', exact: true }).click(); await expect(fixture.getByRole('form', { name: 'Заявка Result', exact: true })).toHaveAttribute('aria-busy', 'true'); await expect(name).toBeDisabled();
    const outcome = fixture.getByRole('region', { name: 'Результат отправки заявки', exact: true }); await expect(outcome.getByRole('heading', { name: 'Заявка отправлена', exact: true })).toBeVisible(); await expect(outcome).toBeFocused();
    await expect(outcome).toContainText('Мария, maria@example.com'); await expect(outcome.locator('[aria-live], [role="alert"], [role="status"]')).toHaveCount(0);
    await outcome.screenshot({ path: testInfo.outputPath('result-example-success.png') });
    await outcome.getByRole('button', { name: 'Изменить заявку', exact: true }).click(); await expect(name).toHaveValue('Мария'); await expect(email).toHaveValue('maria@example.com'); await expect(name).toBeFocused();
  });

  test('keeps invalid data in Form, focuses the invalid field, and does not show a completion', async ({ page }) => {
    const fixture = page.locator('#result'); const name = fixture.getByRole('textbox', { name: 'Имя в заявке' }); const email = fixture.getByRole('textbox', { name: 'Email в заявке' });
    await name.fill(''); await email.fill('invalid'); await fixture.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
    await expect(name).toBeFocused(); await expect(name).toHaveAttribute('aria-invalid', 'true'); await expect(email).toHaveValue('invalid'); await expect(fixture.getByText('Проверьте email', { exact: true })).toBeVisible();
    await expect(fixture.getByRole('region', { name: 'Результат отправки заявки', exact: true })).toHaveCount(0); await expect(fixture.getByRole('status', { name: 'Результат примера Result', exact: true })).toHaveText('Состояние: editing. Действий: 0.');
  });

  test('retains a failed submission and retries successfully with the same values', async ({ page }, testInfo) => {
    const fixture = page.locator('#result'); await fixture.getByRole('textbox', { name: 'Имя в заявке' }).fill('Алексей'); await fixture.getByRole('textbox', { name: 'Email в заявке' }).fill('alex@example.com');
    await fixture.getByRole('checkbox', { name: 'Ошибка отправки Result', exact: true }).check(); await fixture.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
    const outcome = fixture.getByRole('region', { name: 'Результат отправки заявки', exact: true }); await expect(outcome.getByRole('heading', { name: 'Не удалось отправить заявку', exact: true })).toBeVisible(); await expect(outcome).toBeFocused();
    await outcome.screenshot({ path: testInfo.outputPath('result-example-error.png') });
    await fixture.getByRole('checkbox', { name: 'Ошибка отправки Result', exact: true }).uncheck(); await outcome.getByRole('button', { name: 'Повторить отправку', exact: true }).click();
    await expect(outcome.getByRole('heading', { name: 'Заявка отправлена', exact: true })).toBeVisible(); await expect(outcome).toBeFocused(); await expect(outcome).toContainText('Алексей, alex@example.com');
    await outcome.getByRole('button', { name: 'Изменить заявку', exact: true }).click(); await expect(fixture.getByRole('textbox', { name: 'Имя в заявке' })).toHaveValue('Алексей'); await expect(fixture.getByRole('textbox', { name: 'Email в заявке' })).toHaveValue('alex@example.com');
  });

  test('edits an unsuccessful submission without losing the draft', async ({ page }) => {
    const fixture = page.locator('#result'); await fixture.getByRole('textbox', { name: 'Имя в заявке' }).fill('Ольга');
    await fixture.getByRole('checkbox', { name: 'Ошибка отправки Result', exact: true }).check(); await fixture.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
    await fixture.getByRole('heading', { name: 'Не удалось отправить заявку', exact: true }).waitFor(); await fixture.getByRole('button', { name: 'Изменить заявку', exact: true }).click();
    const name = fixture.getByRole('textbox', { name: 'Имя в заявке' }); await expect(name).toHaveValue('Ольга'); await expect(name).toBeFocused();
  });

  test('resets pending submission without allowing its late completion to replace the form', async ({ page }) => {
    const fixture = page.locator('#result'); await fixture.getByRole('textbox', { name: 'Имя в заявке' }).fill('Старый запрос');
    await fixture.getByRole('button', { name: 'Отправить заявку', exact: true }).click(); await expect(fixture.getByRole('form', { name: 'Заявка Result', exact: true })).toHaveAttribute('aria-busy', 'true');
    const reset = fixture.getByRole('button', { name: 'Сбросить пример Result', exact: true }); await reset.click(); await expect(fixture.getByRole('textbox', { name: 'Имя в заявке' })).toBeEnabled(); await page.waitForTimeout(850);
    await expect(fixture.getByRole('textbox', { name: 'Имя в заявке' })).toHaveValue('Анна'); await expect(fixture.getByRole('region', { name: 'Результат отправки заявки', exact: true })).toHaveCount(0); await expect(reset).toBeFocused();
    await fixture.getByRole('button', { name: 'Отправить заявку', exact: true }).click(); await expect(fixture.getByRole('heading', { name: 'Заявка отправлена', exact: true })).toBeVisible();
  });

  test('changes visual statuses and actions independently of form data and HTTP routing', async ({ page }) => {
    const fixture = page.locator('#result'); const preview = fixture.getByRole('group', { name: 'Предпросмотр Result', exact: true });
    await fixture.getByRole('textbox', { name: 'Имя в заявке' }).fill('Черновик');
    for (const status of ['403', '404', '500', 'warning']) {
      await fixture.getByRole('combobox', { name: 'Статус Result', exact: true }).click(); await page.getByRole('option', { name: status, exact: true }).click(); await expect(preview).toHaveClass(new RegExp(`ant-result-${status}`));
    }
    await preview.getByRole('button', { name: 'Действие Result', exact: true }).click(); await fixture.getByRole('checkbox', { name: 'Действие в Result', exact: true }).uncheck(); await expect(preview.getByRole('button')).toHaveCount(0);
    await expect(fixture.getByRole('textbox', { name: 'Имя в заявке' })).toHaveValue('Черновик'); await expect(fixture.getByRole('status', { name: 'Результат примера Result', exact: true })).toHaveText('Состояние: editing. Действий: 1.'); expect(new URL(page.url()).pathname).toBe('/ant-design');
  });
});

test.describe('Empty showcase', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/ant-design#empty'); });

  test('creates the first record through Empty and keeps focus on the stable table region', async ({ page }, testInfo) => {
    const fixture = page.locator('#empty'); const table = fixture.getByRole('table', { name: 'Участники примера Empty', exact: true });
    await expect(table.getByRole('cell', { name: 'Участников пока нет. Создать первого участника', exact: true })).toBeVisible();
    await fixture.screenshot({ path: testInfo.outputPath('empty-example.png') });
    await fixture.getByRole('textbox', { name: 'Имя нового участника', exact: true }).fill('Мария');
    await table.getByRole('button', { name: 'Создать первого участника', exact: true }).click();
    await expect(table.getByRole('cell', { name: 'Мария', exact: true })).toBeVisible(); await expect(table.locator('.ant-empty')).toHaveCount(0);
    await expect(fixture.getByRole('region', { name: 'Участники примера Empty', exact: true })).toBeFocused();
    await expect(fixture.getByRole('status', { name: 'Результат примера Empty', exact: true })).toHaveText('Участников: 1. Показано: 1. Действий: 0.');
  });

  test('shows an empty search result and restores the original records through the reset action', async ({ page }) => {
    const fixture = page.locator('#empty'); const table = fixture.getByRole('table', { name: 'Участники примера Empty', exact: true });
    await table.getByRole('button', { name: 'Создать первого участника', exact: true }).click();
    await fixture.getByRole('textbox', { name: 'Поиск в примере Empty', exact: true }).fill('Missing');
    await expect(table.getByText('По вашему запросу ничего не найдено.', { exact: true })).toBeVisible();
    await table.getByRole('button', { name: 'Сбросить поиск участников', exact: true }).click();
    await expect(fixture.getByRole('textbox', { name: 'Поиск в примере Empty', exact: true })).toHaveValue('');
    await expect(table.getByRole('cell', { name: 'Анна', exact: true })).toBeVisible(); await expect(fixture.getByRole('region', { name: 'Участники примера Empty', exact: true })).toBeFocused();
  });

  test('clears records back to Empty and rejects a blank member name', async ({ page }) => {
    const fixture = page.locator('#empty'); const name = fixture.getByRole('textbox', { name: 'Имя нового участника', exact: true });
    await name.fill('   '); await expect(fixture.getByRole('button', { name: 'Создать первого участника', exact: true })).toBeDisabled();
    await expect(fixture.getByRole('button', { name: 'Добавить участника в пример Empty', exact: true })).toBeDisabled();
    await name.fill('Анна'); await fixture.getByRole('button', { name: 'Создать первого участника', exact: true }).click();
    await fixture.getByRole('button', { name: 'Очистить список участников', exact: true }).click(); await expect(name).toBeFocused();
    await expect(fixture.getByRole('button', { name: 'Создать первого участника', exact: true })).toBeVisible();
    await expect(fixture.getByRole('status', { name: 'Результат примера Empty', exact: true })).toHaveText('Участников: 0. Показано: 0. Действий: 0.');
  });

  test('changes the image, rich description and footer preview without affecting records', async ({ page }) => {
    const fixture = page.locator('#empty'); const preview = fixture.locator('.preview');
    await fixture.getByRole('combobox', { name: 'Иллюстрация Empty', exact: true }).click(); await page.getByRole('option', { name: 'Свой Snippet', exact: true }).click();
    await expect(preview.locator('svg')).toHaveAttribute('viewBox', '0 0 160 100');
    await fixture.getByRole('combobox', { name: 'Описание Empty', exact: true }).click(); await page.getByRole('option', { name: 'Snippet', exact: true }).click();
    await fixture.getByRole('textbox', { name: 'Текст Empty', exact: true }).fill('Пустой проект'); await expect(preview.locator('strong')).toHaveText('Пустой проект');
    await preview.getByRole('button', { name: 'Попробовать действие Empty', exact: true }).click();
    await expect(fixture.getByRole('status', { name: 'Результат примера Empty', exact: true })).toHaveText('Участников: 0. Показано: 0. Действий: 1.');
    await fixture.getByRole('checkbox', { name: 'Действие Empty', exact: true }).uncheck(); await expect(preview.locator('.ant-empty-footer')).toHaveCount(0);
  });
});

test.describe('Skeleton showcase', () => {
  test.beforeEach(async ({ page }) => {
    const time = new Date('2026-10-27T12:00:00Z'); await page.clock.install({ time }); await page.clock.pauseAt(time);
    await page.goto('/ant-design#skeleton');
  });

  test('shows the first-load skeleton and then mounts the loaded card', async ({ page }, testInfo) => {
    const fixture = page.locator('#skeleton'); const skeleton = fixture.locator('#showcase-skeleton');
    const input = fixture.getByRole('textbox', { name: 'Имя в карточке Skeleton', exact: true }); await expect(input).toHaveCount(0);
    await fixture.getByRole('button', { name: 'Загрузить карточку', exact: true }).click(); await expect(skeleton.locator('.ant-skeleton')).toBeVisible();
    await expect(skeleton.locator('.ant-skeleton-content')).toHaveAttribute('aria-busy', 'true'); await expect(skeleton.locator('.loading-status')).toHaveText('Загрузка…');
    await page.emulateMedia({ reducedMotion: 'reduce' }); await fixture.screenshot({ path: testInfo.outputPath('skeleton-example.png') });
    await page.clock.fastForward(700); await expect(input).toHaveValue('Анна'); await expect(skeleton.locator('.ant-skeleton')).toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Результат примера Skeleton', exact: true })).toHaveText('Карточка загружена. Версия: 1.');
  });

  test('refreshes through Spin while retaining the same edited card and its focused action', async ({ page }) => {
    const fixture = page.locator('#skeleton'); await fixture.getByRole('button', { name: 'Быстрый ответ карточки', exact: true }).click(); await page.clock.fastForward(100);
    const input = fixture.getByRole('textbox', { name: 'Имя в карточке Skeleton', exact: true }); const original = await input.elementHandle(); await input.fill('Мария');
    await fixture.getByRole('checkbox', { name: 'Уведомления карточки', exact: true }).uncheck(); await fixture.getByRole('button', { name: 'Изменить карточку Skeleton', exact: true }).click();
    const trigger = fixture.getByRole('button', { name: 'Обновить загруженную карточку', exact: true }); await trigger.click();
    const spin = fixture.locator('#skeleton-example-refresh'); await expect(spin).toBeFocused(); await expect(spin.locator('.ant-spin-container')).toHaveAttribute('inert', '');
    await expect(fixture.locator('#showcase-skeleton .ant-skeleton')).toHaveCount(0); await page.clock.fastForward(250); await expect(spin.locator('.ant-spin-section')).toBeVisible();
    await page.clock.fastForward(500); await expect(trigger).toBeFocused(); await expect(input).toHaveValue('Мария');
    await expect(fixture.getByRole('checkbox', { name: 'Уведомления карточки', exact: true })).not.toBeChecked();
    await expect(fixture.getByText('Изменений в карточке: 1. Версия данных: 2.', { exact: true })).toBeVisible();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  });

  test('retries first-load and refresh errors through Alert while retaining an existing draft', async ({ page }) => {
    const fixture = page.locator('#skeleton'); const fail = fixture.getByRole('button', { name: 'Ошибка загрузки карточки', exact: true });
    const retry = fixture.getByRole('button', { name: 'Повторить загрузку карточки', exact: true });
    const input = fixture.getByRole('textbox', { name: 'Имя в карточке Skeleton', exact: true });
    await fail.click(); await page.clock.fastForward(700); await expect(fixture.getByRole('alert')).toContainText('Попробуйте загрузить карточку ещё раз.');
    await expect(input).toHaveCount(0); await retry.click(); await expect(fixture.locator('#showcase-skeleton')).toBeFocused();
    await page.clock.fastForward(700); await page.keyboard.press('Tab'); await expect(input).toBeFocused(); await input.fill('Черновик');
    await fail.click(); await page.clock.fastForward(700); await expect(input).toHaveValue('Черновик'); await expect(fixture.getByRole('alert')).toContainText('Черновик сохранён.');
    await retry.click(); await page.clock.fastForward(700); await expect(input).toHaveValue('Черновик');
    await expect(fixture.getByRole('status', { name: 'Результат примера Skeleton', exact: true })).toHaveText('Карточка загружена. Версия: 2.');
  });

  test('cancels pending loads and resets the card without late results before a fresh attempt', async ({ page }) => {
    const fixture = page.locator('#skeleton'); const start = fixture.getByRole('button', { name: 'Загрузить карточку', exact: true });
    const result = fixture.getByRole('status', { name: 'Результат примера Skeleton', exact: true });
    await start.click(); await fixture.getByRole('button', { name: 'Отменить загрузку карточки', exact: true }).click(); await expect(start).toBeFocused();
    await page.clock.fastForward(1000); await expect(result).toHaveText('Загрузка карточки отменена.'); await expect(fixture.locator('#skeleton-example-name')).toHaveCount(0);
    await start.click(); await page.clock.fastForward(700); await fixture.getByRole('textbox', { name: 'Имя в карточке Skeleton', exact: true }).fill('Discard this draft');
    await start.click(); await fixture.getByRole('button', { name: 'Сбросить пример Skeleton', exact: true }).click(); await page.clock.fastForward(1000);
    await expect(result).toHaveText('Загрузите карточку участника.'); await expect(fixture.locator('#skeleton-example-name')).toHaveCount(0);
    await start.click(); await page.clock.fastForward(700); await expect(fixture.getByRole('textbox', { name: 'Имя в карточке Skeleton', exact: true })).toHaveValue('Анна');
  });

  test('changes the decorative preview without starting a request', async ({ page }) => {
    const fixture = page.locator('#skeleton'); const preview = fixture.locator('.preview');
    await fixture.getByRole('checkbox', { name: 'Заголовок Skeleton', exact: true }).uncheck(); await fixture.getByRole('checkbox', { name: 'Скругление Skeleton', exact: true }).check();
    await fixture.getByRole('spinbutton', { name: 'Строки Skeleton', exact: true }).fill('5'); await page.keyboard.press('Tab');
    await expect(preview.locator('.ant-skeleton-title')).toHaveCount(0); await expect(preview.locator('li')).toHaveCount(5); await expect(preview.locator('.ant-skeleton')).toHaveClass(/ant-skeleton-round/);
    await expect(preview.getByRole('status')).toHaveCount(0); await expect(fixture.getByRole('status', { name: 'Результат примера Skeleton', exact: true })).toHaveText('Загрузите карточку участника.');
  });
});

test.describe('Spin showcase', () => {
  test.beforeEach(async ({ page }) => {
    const time = new Date('2026-10-27T12:00:00Z'); await page.clock.install({ time }); await page.clock.pauseAt(time);
    await page.goto('/ant-design#spin');
  });

  test('skips the indicator for a fast response while retaining the draft', async ({ page }) => {
    const fixture = page.locator('#spin'); const spin = fixture.locator('#showcase-spin');
    const content = spin.locator('.ant-spin-container'); const indicator = spin.locator('.ant-spin-section');
    const draft = fixture.getByRole('textbox', { name: 'Имя в черновике', exact: true }); await draft.fill('Мария');
    await fixture.getByRole('button', { name: 'Быстрый ответ', exact: true }).click();
    await expect(content).toHaveAttribute('inert', ''); await expect(content).toHaveAttribute('aria-busy', 'true'); await expect(indicator).toHaveCount(0);
    await page.clock.fastForward(100); await expect(content).not.toHaveAttribute('inert'); await expect(indicator).toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Результат примера Spin', exact: true })).toHaveText('Данные обновлены. Версия: 1.');
    await expect(draft).toHaveValue('Мария'); await page.clock.fastForward(1000); await expect(indicator).toHaveCount(0);
  });

  test('parks focus during a slow request and retains the same edited card after completion', async ({ page }, testInfo) => {
    const fixture = page.locator('#spin'); const spin = fixture.locator('#showcase-spin');
    const draft = fixture.getByRole('textbox', { name: 'Имя в черновике', exact: true }); const original = await draft.elementHandle();
    await draft.fill('Мария'); await fixture.getByRole('checkbox', { name: 'Уведомления профиля', exact: true }).uncheck();
    await fixture.getByRole('button', { name: 'Изменить карточку', exact: true }).click();
    const trigger = fixture.getByRole('button', { name: 'Обновить из карточки', exact: true }); await trigger.click();
    await expect(spin).toBeFocused(); await expect(spin.locator('.ant-spin-section')).toHaveCount(0);
    await page.clock.fastForward(250); await expect(spin.getByRole('status', { name: 'Загружаем профиль…', exact: true })).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' }); await fixture.screenshot({ path: testInfo.outputPath('spin-example.png') });
    await page.clock.fastForward(500); await expect(trigger).toBeFocused(); await expect(draft).toHaveValue('Мария');
    await expect(fixture.getByRole('checkbox', { name: 'Уведомления профиля', exact: true })).not.toBeChecked();
    await expect(fixture.getByText('Изменений в карточке: 1. Версия данных: 1.', { exact: true })).toBeVisible();
    expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  });

  test('retries a failed request through Alert without discarding the draft', async ({ page }) => {
    const fixture = page.locator('#spin'); const result = fixture.getByRole('status', { name: 'Результат примера Spin', exact: true });
    const draft = fixture.getByRole('textbox', { name: 'Имя в черновике', exact: true }); await draft.fill('Черновик');
    await fixture.getByRole('button', { name: 'Ошибка загрузки профиля', exact: true }).click(); await page.clock.fastForward(700);
    await expect(result).toHaveText('Не удалось загрузить профиль.'); await expect(fixture.getByRole('alert')).toContainText('Черновик сохранён.');
    await expect(draft).toHaveValue('Черновик'); await fixture.getByRole('button', { name: 'Повторить загрузку профиля', exact: true }).click();
    await expect(fixture.getByRole('alert')).toHaveCount(0); await expect(fixture.locator('#showcase-spin')).toBeFocused(); await page.clock.fastForward(700);
    await expect(result).toHaveText('Данные обновлены. Версия: 1.'); await expect(draft).toHaveValue('Черновик');
    await page.keyboard.press('Tab'); await expect(draft).toBeFocused();
  });

  test('cancels and resets pending requests without late results and accepts a fresh request', async ({ page }) => {
    const fixture = page.locator('#spin'); const start = fixture.getByRole('button', { name: 'Загрузить профиль', exact: true });
    const result = fixture.getByRole('status', { name: 'Результат примера Spin', exact: true });
    await start.click(); await page.clock.fastForward(250); await fixture.getByRole('button', { name: 'Отменить загрузку', exact: true }).click();
    await expect(start).toBeFocused(); await expect(result).toHaveText('Загрузка отменена.'); await page.clock.fastForward(1000);
    await expect(result).toHaveText('Загрузка отменена.'); await expect(fixture.locator('#showcase-spin .ant-spin-section')).toHaveCount(0);
    await start.click(); await fixture.getByRole('button', { name: 'Сбросить пример Spin', exact: true }).click(); await page.clock.fastForward(1000);
    await expect(result).toHaveText('Измените черновик и обновите данные.'); await expect(fixture.getByRole('textbox', { name: 'Имя в черновике', exact: true })).toHaveValue('Анна');
    await start.click(); await page.clock.fastForward(700); await expect(result).toHaveText('Данные обновлены. Версия: 1.');
  });
});

test('showcase changes line and circle Progress through shared controls', async ({ page }, testInfo) => {
  await page.goto('/ant-design#progress'); const fixture = page.locator('#progress');
  const line = fixture.getByRole('progressbar', { name: 'Линейный прогресс', exact: true });
  const circle = fixture.getByRole('progressbar', { name: 'Круговой прогресс', exact: true });
  await expect(line).toHaveAttribute('aria-valuenow', '42.5'); await expect(circle).toHaveAttribute('aria-valuenow', '42.5');
  await page.screenshot({ path: testInfo.outputPath('progress-example.png') });
  const input = fixture.getByRole('spinbutton', { name: 'Процент Progress', exact: true });
  await input.fill('25.5'); await input.press('Tab'); await expect(line).toHaveAttribute('aria-valuenow', '25.5'); await expect(circle).toHaveAttribute('aria-valuenow', '25.5');
  const slider = fixture.getByRole('slider', { name: 'Изменить процент Progress', exact: true });
  await slider.focus(); await slider.press('End'); await expect(line).toHaveClass(/ant-progress-status-success/); await expect(circle).toHaveClass(/ant-progress-status-success/); await expect(slider).toBeFocused();
  await fixture.getByRole('combobox', { name: 'Статус Progress', exact: true }).click(); await page.getByRole('option', { name: 'exception', exact: true }).click();
  await expect(line).toHaveClass(/ant-progress-status-exception/); await expect(circle).toHaveClass(/ant-progress-status-exception/);
  await fixture.getByRole('checkbox', { name: 'Показывать значение Progress', exact: true }).uncheck(); await expect(fixture.locator('.ant-progress-indicator')).toHaveCount(0);
  await expect(circle).toHaveAttribute('aria-valuenow', '100');
});

test('showcase reports export stages and cancels without a late result before retrying', async ({ page }) => {
  const time = new Date('2026-10-27T12:00:00Z'); await page.clock.install({ time }); await page.clock.pauseAt(time);
  await page.goto('/ant-design#notification'); const fixture = page.locator('#notification');
  const notice = page.locator('#showcase-notifications .ant-notification-notice:not([inert])');
  await fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true }).click();
  const meter = notice.getByRole('progressbar', { name: 'Подготовка отчёта', exact: true }); const original = await meter.elementHandle();
  await expect(meter).toHaveAttribute('aria-valuenow', '0'); await page.clock.runFor(200); await expect(meter).toHaveAttribute('aria-valuenow', '25');
  await notice.getByRole('button', { name: 'Отменить экспорт', exact: true }).click(); await expect(notice).toHaveAccessibleName('Экспорт отменён');
  await expect(fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true })).toBeFocused();
  await page.clock.fastForward(5000); await expect(notice).toHaveAccessibleName('Экспорт отменён'); await expect(meter).toHaveAttribute('aria-valuenow', '25');
  expect(await meter.evaluate((node, old) => node === old, original)).toBe(true); await expect(notice.getByRole('button', { name: 'Скачать отчёт', exact: true })).toHaveCount(0);
  await notice.getByRole('button', { name: 'Повторить экспорт', exact: true }).click(); await expect(meter).toHaveAttribute('aria-valuenow', '0');
  await page.clock.fastForward(700); await expect(notice).toHaveAccessibleName('Отчёт готов'); await expect(meter).toHaveAttribute('aria-valuenow', '100');
});

test('showcase exports a report through Notification and downloads its actual CSV content', async ({ page }, testInfo) => {
  await page.clock.install(); await page.goto('/ant-design#notification');
  const fixture = page.locator('#notification'); const notice = page.locator('#showcase-notifications .ant-notification-notice:not([inert])');
  await fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true }).click();
  await expect(notice).toHaveAccessibleName('Готовим отчёт'); await expect(fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true })).toBeDisabled();
  await page.clock.fastForward(700); await expect(notice).toHaveAccessibleName('Отчёт готов'); await expect(notice).toHaveCount(1);
  await expect.poll(() => notice.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.screenshot({ path: testInfo.outputPath('notification-example.png') });
  const downloading = page.waitForEvent('download'); await notice.getByRole('button', { name: 'Скачать отчёт', exact: true }).click();
  const download = await downloading; expect(download.suggestedFilename()).toBe('report.csv');
  const stream = await download.createReadStream(); let content = ''; for await (const chunk of stream) content += chunk.toString();
  expect(content).toContain('name,framework\r\nAnna,Svelte\r\nBoris,TypeScript');
  await expect(fixture.getByRole('status', { name: 'Результат примера Notification', exact: true })).toHaveText('Отчёт скачан.');
  await notice.getByRole('button', { name: 'Закрыть результат экспорта', exact: true }).click(); await expect(notice).toHaveCount(0);
  await expect(fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true })).toBeFocused();
});

test('showcase retries a failed Notification export in place and recovers focus after replacing actions', async ({ page }) => {
  await page.clock.install(); await page.goto('/ant-design#notification');
  const fixture = page.locator('#notification'); const notice = page.locator('#showcase-notifications .ant-notification-notice:not([inert])');
  await fixture.getByRole('checkbox', { name: 'Ошибка следующего экспорта', exact: true }).check();
  await fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true }).click(); await page.clock.fastForward(700);
  await expect(notice).toHaveAccessibleName('Не удалось подготовить отчёт');
  await expect(notice.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '90'); await expect(notice.getByRole('progressbar')).toHaveClass(/ant-progress-status-exception/);
  await notice.getByRole('button', { name: 'Повторить экспорт', exact: true }).click(); await expect(notice).toHaveAccessibleName('Готовим отчёт');
  await expect(fixture.getByRole('checkbox', { name: 'Ошибка следующего экспорта', exact: true })).toBeFocused();
  await page.clock.fastForward(700); await expect(notice).toHaveAccessibleName('Отчёт готов'); await expect(notice).toHaveCount(1);
  await expect(notice.getByRole('button', { name: 'Скачать отчёт', exact: true })).toBeEnabled();
});

test('showcase cancels a pending Notification export when reset and accepts a fresh request', async ({ page }) => {
  await page.clock.install(); await page.goto('/ant-design#notification');
  const fixture = page.locator('#notification'); const notice = page.locator('#showcase-notifications .ant-notification-notice:not([inert])');
  await fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true }).click();
  await fixture.getByRole('button', { name: 'Сбросить пример Notification', exact: true }).click(); await page.clock.fastForward(5000);
  await expect(notice).toHaveCount(0); await expect(fixture.getByRole('status', { name: 'Результат примера Notification', exact: true })).toHaveText('Пример экспорта сброшен.');
  await fixture.getByRole('button', { name: 'Экспортировать отчёт', exact: true }).click(); await page.clock.fastForward(700);
  await expect(notice).toHaveAccessibleName('Отчёт готов');
});

test('showcase updates a loading Message to success or error and supports retry', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto('/ant-design#message');
  const fixture = page.locator('#message');
  const notices = page.locator('#showcase-messages .ant-message-notice:not([inert])');
  await fixture.getByRole('button', { name: 'Сохранить настройки с сообщением', exact: true }).click();
  await expect(notices).toHaveText('Сохраняем настройки…');
  await expect(notices).toHaveClass(/ant-message-notice-loading/);
  await page.clock.fastForward(700);
  await expect(notices).toHaveText('Настройки сохранены.');
  await expect(notices).toHaveClass(/ant-message-notice-success/);
  await expect(notices).toHaveCount(1);
  await expect.poll(() => notices.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.screenshot({ path: testInfo.outputPath('message-example.png') });
  await fixture.getByRole('checkbox', { name: 'Ошибка следующего сохранения Message', exact: true }).check();
  await fixture.getByRole('button', { name: 'Сохранить настройки с сообщением', exact: true }).click();
  await page.clock.fastForward(700);
  await expect(notices).toContainText('Не удалось сохранить настройки.');
  await expect(notices).toHaveClass(/ant-message-notice-error/);
  await fixture.getByRole('button', { name: 'Сохранить настройки с сообщением', exact: true }).click();
  await page.clock.fastForward(700);
  await expect(notices).toHaveText('Настройки сохранены.');
  await page.clock.fastForward(4000);
  await expect(page.locator('#showcase-messages')).toHaveCount(0);
});

test('showcase waits for Message completion and cancels pending feedback when reset', async ({ page }) => {
  await page.clock.install();
  await page.goto('/ant-design#message');
  const fixture = page.locator('#message');
  const notices = page.locator('#showcase-messages .ant-message-notice:not([inert])');
  await fixture.getByRole('button', { name: 'Последовательные сообщения', exact: true }).click();
  await expect(notices).toHaveText('Проверяем данные…');
  await page.clock.fastForward(1500);
  await expect(notices).toHaveText('Данные проверены.');
  await fixture.getByRole('button', { name: 'Сбросить пример Message', exact: true }).click();
  await expect(page.locator('#showcase-messages')).toHaveCount(0);
  await fixture.getByRole('button', { name: 'Сохранить настройки с сообщением', exact: true }).click();
  await fixture.getByRole('button', { name: 'Сбросить пример Message', exact: true }).click();
  await page.clock.fastForward(5000);
  await expect(page.locator('#showcase-messages')).toHaveCount(0);
  await expect(fixture.getByRole('status', { name: 'Результат примера Message', exact: true })).toHaveText('Пример сброшен.');
});

test('showcase applies Alert actions, dismisses notifications and recreates closed instances', async ({ page }, testInfo) => {
  await page.goto('/ant-design#alert');
  const fixture = page.locator('#alert');
  const message = fixture.getByRole('status', { name: 'Настраиваемое сообщение', exact: true });
  await fixture.getByRole('combobox', { name: 'Тип сообщения', exact: true }).selectOption('error');
  await expect(message).toContainText('Не удалось сохранить настройки');
  await message.getByRole('button', { name: 'Повторить сохранение', exact: true }).click();
  await expect(message).toContainText('Настройки сохранены');
  await expect(message).toHaveClass(/ant-alert-success/);
  await expect(fixture.getByRole('status', { name: 'Результат уведомления', exact: true })).toHaveText('Настройки применены.');
  await fixture.screenshot({ path: testInfo.outputPath('alert-example.png') });
  await message.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(message).toHaveCount(0);
  await expect(fixture.getByRole('status', { name: 'Результат уведомления', exact: true })).toHaveText('Сообщение закрыто.');
  const restore = fixture.getByRole('button', { name: 'Показать сообщение снова', exact: true });
  await expect(restore).toBeFocused();
  await restore.click();
  await expect(message).toBeVisible();
  await expect(message).toContainText('Настройки сохранены');
});

test('showcase edits Table rows in Drawer, validates fields and retains unsaved form and tab state', async ({ page }, testInfo) => {
  await page.goto('/ant-design#drawer');
  const fixture = page.locator('#drawer');
  const trigger = fixture.getByRole('button', { name: 'Редактировать: Анна', exact: true });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Участник: Анна', exact: true });
  const name = drawer.getByLabel('Имя в карточке', { exact: true });
  await name.fill('');
  await drawer.getByRole('button', { name: 'Сохранить участника', exact: true }).click();
  await expect(drawer.getByText('Введите имя участника.', { exact: true })).toBeVisible();
  await expect(name).toBeFocused();
  await name.fill('Мария');
  await drawer.getByRole('combobox', { name: 'Роль в карточке', exact: true }).click();
  await drawer.getByRole('option', { name: 'Менеджер', exact: true }).click();
  await drawer.getByRole('tab', { name: 'Заметки карточки', exact: true }).click();
  await drawer.getByRole('textbox', { name: 'Заметка в карточке', exact: true }).fill('Новый комментарий');
  await drawer.getByRole('button', { name: 'Закрыть карточку', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(name).toHaveValue('Мария');
  await expect(drawer.getByRole('tab', { name: 'Заметки карточки', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(drawer.getByRole('textbox', { name: 'Заметка в карточке', exact: true })).toHaveValue('Новый комментарий');
  await expect.poll(() => drawer.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await page.screenshot({ path: testInfo.outputPath('drawer-editor.png') });
  await drawer.getByRole('button', { name: 'Сохранить участника', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(fixture.getByRole('row').filter({ hasText: 'Мария' })).toContainText('Менеджер');
  await expect(fixture.getByRole('status', { name: 'Результат карточки участника', exact: true })).toHaveText('Участник сохранён: Мария.');
});

test('showcase resets destroyed Drawer editors and keeps separate records independent', async ({ page }) => {
  await page.goto('/ant-design#drawer');
  const fixture = page.locator('#drawer');
  await fixture.getByRole('checkbox', { name: 'Сбрасывать карточку при закрытии', exact: true }).check();
  await fixture.getByRole('button', { name: 'Редактировать: Анна', exact: true }).click();
  const anna = page.getByRole('dialog', { name: 'Участник: Анна', exact: true });
  await anna.getByLabel('Имя в карточке', { exact: true }).fill('Несохранённый черновик');
  await page.keyboard.press('Escape');
  await expect(anna).toBeHidden();
  await fixture.getByRole('button', { name: 'Редактировать: Анна', exact: true }).click();
  await expect(anna.getByLabel('Имя в карточке', { exact: true })).toHaveValue('Анна');
  await page.keyboard.press('Escape');
  await expect(anna).toBeHidden();
  await fixture.getByRole('button', { name: 'Редактировать: Михаил', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Участник: Михаил', exact: true }).getByLabel('Имя в карточке', { exact: true })).toHaveValue('Михаил');
});

test('showcase edits collapsed form sections, keeps reset actions independent and supports nested fields', async ({ page }, testInfo) => {
  await page.goto('/ant-design#collapse');
  const fixture = page.locator('#collapse');
  const form = fixture.getByRole('group', { name: 'Анкета участника', exact: true });
  const contacts = form.getByRole('button', { name: 'Контакты', exact: true });
  await fixture.getByLabel('Имя для связи', { exact: true }).fill('Мария');
  await contacts.click();
  await form.getByRole('button', { name: 'Уведомления', exact: true }).click();
  await fixture.getByRole('checkbox', { name: 'Получать новости анкеты', exact: true }).uncheck();
  await contacts.click();
  await expect(fixture.getByLabel('Имя для связи', { exact: true })).toHaveValue('Мария');
  await fixture.getByRole('button', { name: 'Сохранить анкету', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат анкеты', exact: true })).toHaveText('Анкета сохранена: Мария. Новости: выключены.');
  await form.getByRole('button', { name: 'Сбросить анкету', exact: true }).click();
  await expect(contacts).toHaveAttribute('aria-expanded', 'true');
  await expect(fixture.getByLabel('Имя для связи', { exact: true })).toHaveValue('Анна');
  await form.getByRole('button', { name: 'Дополнительно', exact: true }).click();
  const nested = fixture.getByRole('group', { name: 'Дополнительные поля', exact: true });
  await nested.getByRole('button', { name: 'Адрес', exact: true }).click();
  await expect(nested.getByLabel('Город участника', { exact: true })).toHaveValue('Москва');
  await page.setViewportSize({ width: 1280, height: 1200 });
  await fixture.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await fixture.screenshot({ path: testInfo.outputPath('collapse-form.png') });
  await fixture.getByRole('checkbox', { name: 'Сбрасывать содержимое при скрытии', exact: true }).check();
  await nested.getByLabel('Город участника', { exact: true }).fill('Казань');
  await form.getByRole('button', { name: 'Дополнительно', exact: true }).click();
  await form.getByRole('button', { name: 'Дополнительно', exact: true }).click();
  await expect(nested.getByRole('button', { name: 'Адрес', exact: true })).toHaveAttribute('aria-expanded', 'false');
});

test('showcase preserves tab drafts, saves the profile and demonstrates destroyOnHidden', async ({ page }, testInfo) => {
  await page.goto('/ant-design#tabs');
  const fixture = page.locator('#tabs');
  const tabs = fixture.getByRole('tablist', { name: 'Разделы участника', exact: true });
  const profile = fixture.getByRole('tabpanel', { name: 'Профиль', exact: true });
  await profile.getByLabel('Имя участника', { exact: true }).fill('Мария');
  await tabs.getByRole('tab', { name: 'Настройки', exact: true }).click();
  await fixture.getByRole('checkbox', { name: 'Получать еженедельный отчёт', exact: true }).check();
  await tabs.getByRole('tab', { name: 'История', exact: true }).click();
  await expect(fixture.getByRole('table', { name: 'История участника', exact: true })).toBeVisible();
  await tabs.getByRole('tab', { name: 'Профиль', exact: true }).click();
  await expect(profile.getByLabel('Имя участника', { exact: true })).toHaveValue('Мария');
  await profile.getByRole('button', { name: 'Сохранить профиль участника', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат профиля участника', exact: true })).toHaveText('Профиль сохранён: Мария.');
  await fixture.screenshot({ path: testInfo.outputPath('tabs-profile.png') });
  await tabs.getByRole('tab', { name: 'Настройки', exact: true }).click();
  await expect(fixture.getByRole('checkbox', { name: 'Получать еженедельный отчёт', exact: true })).toBeChecked();
  await fixture.getByRole('checkbox', { name: 'Сбрасывать содержимое при скрытии', exact: true }).check();
  await tabs.getByRole('tab', { name: 'Профиль', exact: true }).click();
  await expect(profile.getByLabel('Имя участника', { exact: true })).toHaveValue('Анна');
  await expect(tabs.getByRole('tab', { name: 'Доступ', exact: true })).toBeDisabled();
  await fixture.getByRole('button', { name: 'Открыть вкладки в окне', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Вкладки в карточке', exact: true });
  await dialog.getByRole('tab', { name: 'Заметки', exact: true }).click();
  await expect(dialog.getByLabel('Заметка об участнике', { exact: true })).toHaveValue('Новый участник проекта');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('showcase runs table row commands through Dropdown and opens a member card', async ({ page }, testInfo) => {
  await page.goto('/ant-design#dropdown');
  const fixture = page.locator('#dropdown');
  const button = fixture.getByRole('button', { name: 'Действия: Анна', exact: true });
  const popup = page.getByRole('menu', { name: 'Действия: Анна', exact: true });
  await button.press('ArrowDown');
  await expect(popup.getByRole('menuitem', { name: 'Открыть карточку', exact: true })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('dropdown-table.png') });
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Карточка: Анна', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Разработчик');
  await expect(popup).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await button.click();
  await popup.getByRole('menuitem', { name: 'Создать копию', exact: true }).click();
  await expect(fixture.getByRole('cell', { name: 'Анна (копия)', exact: true })).toBeVisible();
  await expect(fixture.getByRole('status', { name: 'Результат действия меню', exact: true })).toHaveText('Анна: создана копия.');
  await button.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(fixture.getByRole('cell', { name: 'Анна', exact: true }).locator('..')).toContainText('В архиве');
  await button.click();
  await expect(popup.getByRole('menuitem', { name: 'В архив', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await fixture.getByRole('button', { name: 'Восстановить участников', exact: true }).click();
  await expect(fixture.getByRole('cell', { name: 'Анна (копия)', exact: true })).toHaveCount(0);
});

test('showcase cancels deletion, handles failure and retries Popconfirm before removing a table row', async ({ page }, testInfo) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.goto('/ant-design#popconfirm');
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const fixture = page.locator('#popconfirm');
  const trigger = fixture.getByRole('button', { name: 'Удалить: Анна', exact: true });
  const popup = fixture.getByRole('dialog', { name: 'Удалить запись «Анна»?', exact: true });
  const restore = fixture.getByRole('button', { name: 'Восстановить записи', exact: true });
  await trigger.click();
  await popup.getByRole('button', { name: 'Оставить', exact: true }).click();
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await fixture.getByRole('checkbox', { name: 'Следующее удаление завершится ошибкой', exact: true }).check();
  await trigger.click();
  await popup.getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(popup).toHaveAttribute('aria-busy', 'true');
  await page.keyboard.press('Escape');
  await expect(popup).toBeVisible();
  await page.clock.runFor(600);
  await expect(popup.getByRole('alert')).toHaveText('Не удалось выполнить действие. Попробуйте ещё раз.');
  await expect(popup.getByRole('button', { name: 'Удалить', exact: true })).toBeEnabled();
  await expect(restore).toBeEnabled();
  await expect(trigger).toBeVisible();
  await page.clock.runFor(300);
  await page.screenshot({ path: testInfo.outputPath('popconfirm-error.png') });
  await popup.getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(popup.getByRole('alert')).toHaveCount(0);
  await page.clock.runFor(600);
  await expect(trigger).toHaveCount(0);
  await expect(popup).toBeHidden();
  await expect(fixture.getByRole('status', { name: 'Результат удаления', exact: true })).toHaveText('Анна: запись удалена.');
  await expect(restore).toBeFocused();
  await restore.click();
  await expect(trigger).toBeVisible();
});

test('showcase edits and saves a profile inside Popover and restores its trigger focus', async ({ page }, testInfo) => {
  await page.goto('/ant-design#popover');
  const fixture = page.locator('#popover');
  const button = fixture.getByRole('button', { name: 'Настроить профиль', exact: true });
  await button.click();
  const popup = fixture.getByRole('dialog', { name: 'Редактирование профиля', exact: true });
  const input = popup.getByRole('textbox', { name: 'Имя в профиле', exact: true });
  await expect(input).toBeFocused();
  await input.fill('Мария');
  await popup.getByRole('button', { name: 'Сохранить профиль', exact: true }).click();
  await expect(popup).toBeHidden();
  await expect(button).toBeFocused();
  await expect(fixture.getByRole('status', { name: 'Сохранённое имя профиля', exact: true })).toHaveText('В карточке: Мария');
  await button.click();
  await expect(input).toHaveValue('Мария');
  await input.fill('Черновик');
  await popup.getByRole('button', { name: 'Отмена', exact: true }).click();
  await button.click();
  await expect(input).toHaveValue('Мария');
  await page.screenshot({ path: testInfo.outputPath('popover.png') });
});

test('showcase changes Popover placement and opens its hover and focus card', async ({ page }) => {
  await page.goto('/ant-design#popover');
  const fixture = page.locator('#popover');
  await fixture.getByRole('combobox', { name: 'Положение карточки', exact: true }).selectOption('bottom');
  await fixture.getByRole('checkbox', { name: 'Стрелка карточки', exact: true }).uncheck();
  const button = fixture.getByRole('button', { name: 'Подробности о профиле', exact: true });
  await button.focus();
  const popup = fixture.getByRole('dialog', { name: 'Карточка участника', exact: true });
  await expect(popup).toBeVisible();
  await expect(popup).toHaveClass(/ant-popover-placement-bottom/);
  await expect(popup.locator('.ant-popover-arrow')).toHaveCount(0);
  await button.press('Tab');
  const close = popup.getByRole('button', { name: 'Понятно', exact: true });
  await expect(close).toBeFocused();
  await close.click();
  await expect(popup).toBeHidden();
  await expect(button).toBeFocused();
});

test('showcase opens Tooltip with keyboard and external state and changes placement and arrow', async ({ page }, testInfo) => {
  await page.goto('/ant-design#tooltip');
  const fixture = page.locator('#tooltip');
  const button = fixture.getByRole('button', { name: 'Наведите или нажмите Tab', exact: true });
  await button.focus();
  const tip = fixture.getByRole('tooltip').filter({ hasText: 'Изменения сохранятся после проверки формы.' });
  await expect(tip).toBeVisible();
  await expect(button).toHaveAccessibleDescription('Изменения сохранятся после проверки формы.');
  await button.press('Escape');
  await expect(tip).toBeHidden();
  await expect(button).toBeFocused();
  await fixture.getByRole('combobox', { name: 'Положение подсказки', exact: true }).selectOption('bottom');
  await fixture.getByRole('checkbox', { name: 'Стрелка', exact: true }).uncheck();
  await button.focus();
  await expect(tip).toHaveClass(/ant-tooltip-placement-bottom/);
  await expect(tip.locator('.ant-tooltip-arrow')).toHaveCount(0);
  await fixture.getByRole('button', { name: 'Показать подсказку', exact: true }).click();
  await expect(fixture.getByRole('tooltip').filter({ hasText: 'Подсказкой можно управлять через bind:open.' })).toBeVisible();
  await fixture.screenshot({ path: testInfo.outputPath('tooltip.png') });
});

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

test('showcase loads remote pages and applies sorting and filtering through the presentation model', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const table = page.getByRole('table', { name: 'Удалённые участники', exact: true });
  const names = table.locator('tbody tr > td:nth-child(2)');
  const pagination = page.getByRole('navigation', { name: 'Страницы удалённых участников', exact: true });
  const status = page.getByRole('status', { name: 'Результат удалённой загрузки', exact: true });
  await expect(names).toHaveText(['Участник 01', 'Участник 02', 'Участник 03', 'Участник 04', 'Участник 05']);
  await expect(status).toHaveText('Всего: 36. Страница: 1. Выбрано: 0.');
  await table.getByRole('checkbox', { name: 'Выбрать удалённого участника 1', exact: true }).check();
  await pagination.getByRole('button', { name: 'Страница 2', exact: true }).click();
  await expect(names).toHaveText(['Участник 06', 'Участник 07', 'Участник 08', 'Участник 09', 'Участник 10']);
  await table.getByRole('checkbox', { name: 'Выбрать удалённого участника 6', exact: true }).check();
  await pagination.getByRole('button', { name: 'Страница 1', exact: true }).click();
  await expect(table.getByRole('checkbox', { name: 'Выбрать удалённого участника 1', exact: true })).toBeChecked();
  await expect(status).toHaveText('Всего: 36. Страница: 1. Выбрано: 2.');
  await table.getByRole('button', { name: 'Фильтр: Команда', exact: true }).click();
  const teams = page.getByRole('dialog', { name: 'Фильтр: Команда', exact: true });
  await teams.getByRole('checkbox', { name: 'Дизайн', exact: true }).check();
  await teams.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(names).toHaveText(['Участник 02', 'Участник 05', 'Участник 08', 'Участник 11', 'Участник 14']);
  await expect(status).toHaveText('Всего: 12. Страница: 1. Выбрано: 2.');
  await table.getByRole('button', { name: 'Задачи', exact: true }).click();
  await expect(names).toHaveText(['Участник 32', 'Участник 26', 'Участник 20', 'Участник 14', 'Участник 08']);
  await table.getByRole('button', { name: 'Задачи', exact: true }).click();
  await expect(names).toHaveText(['Участник 05', 'Участник 11', 'Участник 17', 'Участник 23', 'Участник 29']);
  await page.locator('#server-table').screenshot({ path: testInfo.outputPath('server-table.png') });
});

test('showcase retries a failed remote page with its existing query', async ({ page }) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#server-table');
  const table = fixture.getByRole('table', { name: 'Удалённые участники', exact: true });
  const names = table.locator('tbody tr > td:nth-child(2)');
  await expect(names).toHaveCount(5);
  await fixture.getByRole('navigation', { name: 'Страницы удалённых участников', exact: true }).getByRole('button', { name: 'Страница 2', exact: true }).click();
  await expect(names.first()).toHaveText('Участник 06');
  await fixture.getByRole('button', { name: 'Пример ошибки загрузки', exact: true }).click();

  await expect(fixture.getByRole('alert')).toContainText('Не удалось загрузить данные. Попробуйте ещё раз.');
  await expect(fixture.getByRole('alert')).toHaveClass(/ant-alert-error/);
  await expect(table.getByRole('cell', { name: 'Нет данных', exact: true })).toBeVisible();
  await fixture.getByRole('button', { name: 'Повторить загрузку', exact: true }).click();

  await expect(names).toHaveText(['Участник 06', 'Участник 07', 'Участник 08', 'Участник 09', 'Участник 10']);
  await expect(fixture.getByRole('alert')).toHaveCount(0);
  await expect(fixture.getByRole('status', { name: 'Результат удалённой загрузки', exact: true })).toHaveText('Всего: 36. Страница: 2. Выбрано: 0.');
});

test('showcase toggles fixed table layout while preserving remote data and selection', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/ant-design');
  const fixture = page.locator('#server-table');
  const table = fixture.getByRole('table', { name: 'Удалённые участники', exact: true });
  const region = fixture.getByRole('region', { name: 'Удалённые участники', exact: true });
  const pagination = fixture.getByRole('navigation', { name: 'Страницы удалённых участников', exact: true });
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveCount(5);
  await table.getByRole('checkbox', { name: 'Выбрать удалённого участника 1', exact: true }).check();
  await pagination.getByRole('combobox').click();
  await pagination.getByRole('option', { name: '10 / стр.', exact: true }).click();
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveCount(10);
  await region.evaluate((element) => { element.scrollTo({ left: element.scrollWidth, top: 220 }); });
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect.poll(() => region.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const cells = element.querySelector('thead tr')!.children;
    return Math.max(Math.abs(cells[0].getBoundingClientRect().left - bounds.left), Math.abs(cells[4].getBoundingClientRect().right - bounds.left - element.clientWidth), Math.abs(cells[1].getBoundingClientRect().top - bounds.top));
  })).toBeLessThan(1.5);
  await region.screenshot({ path: testInfo.outputPath('showcase-fixed-table.png') });
  await fixture.getByRole('checkbox', { name: 'Закрепить заголовок и колонки', exact: true }).uncheck();

  await expect(table.locator('.table-fixed-cell')).toHaveCount(0);
  await expect(region).toHaveCSS('max-height', 'none');
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveCount(10);
  await expect(table.getByRole('checkbox', { name: 'Выбрать удалённого участника 1', exact: true })).toBeChecked();
  await expect(fixture.getByRole('status', { name: 'Результат удалённой загрузки', exact: true })).toHaveText('Всего: 36. Страница: 1. Выбрано: 1.');
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

test('showcase expands participant cards and retains expansion independently of selection and pagination', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#expandable-table');
  const table = fixture.getByRole('table', { name: 'Карточки участников', exact: true });
  const pagination = fixture.getByRole('navigation', { name: 'Страницы карточек участников', exact: true });
  await expect(table.locator('.ant-table-expanded-row')).toContainText('marina@example.com');
  await expect(table.getByRole('button', { name: 'Раскрыть строку 3', exact: true })).toHaveCount(0);
  await table.getByRole('checkbox', { name: 'Выбрать карточку 1', exact: true }).check();
  await pagination.getByRole('button', { name: 'Страница 2', exact: true }).click();
  await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);
  await table.getByRole('button', { name: 'Раскрыть строку 4', exact: true }).click();
  await expect(table.locator('.ant-table-expanded-row')).toContainText('oleg@example.com');
  await pagination.getByRole('button', { name: 'Страница 1', exact: true }).click();
  await expect(table.locator('.ant-table-expanded-row')).toContainText('marina@example.com');
  await expect(table.getByRole('checkbox', { name: 'Выбрать карточку 1', exact: true })).toBeChecked();
  await expect(fixture.getByRole('status', { name: 'Раскрытие карточек', exact: true })).toHaveText('Раскрыто: 2. Выбрано: 1.');
  await fixture.screenshot({ path: testInfo.outputPath('expandable-table.png') });
  await fixture.getByRole('button', { name: 'Свернуть все подробности', exact: true }).click();

  await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);
  await expect(fixture.getByRole('status', { name: 'Раскрытие карточек', exact: true })).toHaveText('Раскрыто: 0. Выбрано: 1.');
  await expect(fixture.getByRole('button', { name: 'Свернуть все подробности', exact: true })).toBeDisabled();
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

test('showcase validates and submits CheckboxGroup permissions with select-all and reset', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#checkbox');
  const group = fixture.getByRole('group', { name: 'Права участника', exact: true });
  const read = group.getByRole('checkbox', { name: 'Просмотр', exact: true });
  const all = fixture.getByRole('checkbox', { name: 'Все права', exact: true });
  await all.check();
  await expect(group.getByRole('checkbox', { name: 'Недоступное право', exact: true })).toBeDisabled();
  await fixture.getByRole('button', { name: 'Сохранить права', exact: true }).click();
  await expect(read).toBeFocused();
  await expect(group).toHaveAccessibleDescription('Выберите не более двух прав.');
  await group.getByRole('checkbox', { name: 'Экспорт', exact: true }).uncheck();
  await fixture.getByRole('button', { name: 'Сохранить права', exact: true }).click();
  await expect(fixture.getByRole('status')).toHaveText('Сохранены права: Просмотр, Редактирование.');
  expect(await fixture.locator('form').evaluate((element) => new FormData(element as HTMLFormElement).getAll('permissions'))).toEqual(['read', 'edit']);
  await fixture.screenshot({ path: testInfo.outputPath('checkbox-group.png') });
  await all.check();
  await all.uncheck();
  await fixture.getByRole('button', { name: 'Сохранить права', exact: true }).click();
  await expect(group).toHaveAccessibleDescription('Выберите хотя бы одно право.');
  await fixture.getByRole('button', { name: 'Сбросить права', exact: true }).click();
  await expect(fixture.locator('.output')).toHaveText('Выбрано прав: 1 из 3.');
  await expect(read).toBeChecked();
  await expect(read).not.toHaveAttribute('aria-invalid');
  await expect(all).toHaveAttribute('aria-checked', 'mixed');
});

test('showcase validates RadioGroup choices, submits zero and false and resets its form', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#radio');
  const plan = fixture.getByRole('radiogroup', { name: 'Тариф участника', exact: true });
  const published = fixture.getByRole('radiogroup', { name: 'Режим публикации', exact: true });
  const draft = published.getByRole('radio', { name: 'Черновик', exact: true });
  await expect(plan.getByRole('radio', { name: 'Базовый', exact: true })).toBeChecked();
  await expect(plan.getByRole('radio', { name: 'Архивный', exact: true })).toBeDisabled();
  await fixture.getByRole('button', { name: 'Сохранить настройки', exact: true }).click();
  await expect(draft).toBeFocused();
  await expect(published).toHaveAccessibleDescription('Выберите режим публикации.');
  await draft.check();
  await fixture.getByRole('radio', { name: 'Вертикально', exact: true }).check();
  await expect(plan).toHaveAttribute('aria-orientation', 'vertical');
  await fixture.getByRole('button', { name: 'Сохранить настройки', exact: true }).click();
  await expect(fixture.getByRole('status')).toHaveText('Тариф: Базовый. Публикация: Черновик.');
  expect(await fixture.locator('form').evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual({ plan: '0', published: 'false' });
  await fixture.screenshot({ path: testInfo.outputPath('radio.png') });
  await fixture.getByRole('button', { name: 'Сбросить настройки', exact: true }).click();
  await expect(plan.getByRole('radio', { name: 'Базовый', exact: true })).toBeChecked();
  await expect(published.locator('input:checked')).toHaveCount(0);
  await expect(published).not.toHaveAttribute('aria-invalid');
  await expect(fixture.getByRole('status')).toHaveCount(0);
});

test('showcase synchronizes Slider and InputNumber, applies a completed change and validates and resets volume', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#slider');
  const slider = fixture.getByRole('slider', { name: 'Громкость уведомлений', exact: true });
  const exact = fixture.getByRole('spinbutton', { name: 'Точная громкость', exact: true });
  const applied = fixture.getByRole('status', { name: 'Применённая громкость', exact: true });
  await expect(slider).toHaveValue('40');
  await slider.focus();
  await page.keyboard.down('ArrowRight');
  await expect(exact).toHaveValue('45');
  await expect(applied).toHaveText('Применено: 40%.');
  await page.keyboard.up('ArrowRight');
  await expect(applied).toHaveText('Применено: 45%.');
  await exact.fill('70');
  await exact.press('Tab');
  await expect(slider).toHaveValue('70');
  await expect(applied).toHaveText('Применено: 70%.');
  expect(await fixture.locator('form').evaluate((element) => new FormData(element as HTMLFormElement).getAll('volume'))).toEqual(['70']);
  await fixture.getByRole('button', { name: 'Сохранить громкость', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат настройки громкости', exact: true })).toHaveText('Громкость сохранена: 70%.');
  await fixture.screenshot({ path: testInfo.outputPath('slider.png') });
  await fixture.getByRole('button', { name: 'Сбросить громкость', exact: true }).click();
  await expect(slider).toHaveValue('40');
  await expect(exact).toHaveValue('40');
  await expect(applied).toHaveText('Применено: 40%.');
  await exact.fill('');
  await exact.press('Tab');
  await expect(exact).toHaveValue('0');
  await expect(slider).toHaveValue('0');
  await fixture.getByRole('button', { name: 'Сохранить громкость', exact: true }).click();
  await expect(slider).toBeFocused();
  await expect(slider).toHaveAttribute('aria-invalid', 'true');
  await expect(slider).toHaveAccessibleDescription('Для сохранения выберите громкость от 10 до 90. 0%');
  await slider.press('ArrowRight');
  await slider.press('ArrowRight');
  await fixture.getByRole('button', { name: 'Сохранить громкость', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат настройки громкости', exact: true })).toHaveText('Громкость сохранена: 10%.');
});

test('showcase changes Slider orientation and reverse and disables both synchronized controls', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#slider');
  const slider = fixture.getByRole('slider', { name: 'Громкость уведомлений', exact: true });
  const exact = fixture.getByRole('spinbutton', { name: 'Точная громкость', exact: true });
  await fixture.getByRole('checkbox', { name: 'Вертикальное расположение', exact: true }).check();
  await fixture.getByRole('checkbox', { name: 'Обратное направление', exact: true }).check();
  await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  await slider.press('ArrowUp');
  await expect(slider).toHaveValue('35');
  await expect(exact).toHaveValue('35');
  await fixture.screenshot({ path: testInfo.outputPath('slider-vertical.png') });
  await fixture.getByRole('checkbox', { name: 'Недоступно', exact: true }).check();
  await expect(slider).toBeDisabled();
  await expect(exact).toBeDisabled();
  await fixture.getByRole('checkbox', { name: 'Недоступно', exact: true }).uncheck();
  await expect(slider).toBeEnabled();
  await expect(slider).toHaveValue('35');
});

test('showcase calculates a numeric order, preserves zero and submits and resets its form', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#input-number');
  const quantity = fixture.getByRole('spinbutton', { name: 'Количество', exact: true });
  const price = fixture.getByRole('spinbutton', { name: 'Цена за единицу', exact: true });
  await expect(quantity).toHaveValue('2');
  await expect(price).toHaveValue('12.50');
  await expect(fixture.getByRole('status', { name: 'Стоимость заказа', exact: true })).toHaveText(/25,00.*₽/);
  await price.fill('0.2');
  await price.press('ArrowUp');
  await expect(price).toHaveValue('0.30');
  await quantity.fill('3');
  await fixture.getByRole('button', { name: 'Рассчитать заказ', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат расчёта', exact: true })).toHaveText(/Заказ рассчитан: 0,90.*₽/);
  expect(await fixture.locator('form').evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual({ quantity: '3', price: '0.3' });
  await fixture.screenshot({ path: testInfo.outputPath('input-number.png') });
  await quantity.fill('0');
  await fixture.getByRole('button', { name: 'Рассчитать заказ', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат расчёта', exact: true })).toHaveText(/Заказ рассчитан: 0,00.*₽/);
  await fixture.getByRole('button', { name: 'Сбросить заказ', exact: true }).click();
  await expect(quantity).toHaveValue('2');
  await expect(price).toHaveValue('12.50');
  await expect(fixture.getByRole('status', { name: 'Результат расчёта', exact: true })).toHaveCount(0);
});

test('showcase validates empty numeric fields and focuses the named invalid control', async ({ page }) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#input-number');
  const quantity = fixture.getByRole('spinbutton', { name: 'Количество', exact: true });
  await quantity.fill('');
  await fixture.getByRole('button', { name: 'Рассчитать заказ', exact: true }).click();
  await expect(quantity).toBeFocused();
  await expect(quantity).toHaveAttribute('aria-invalid', 'true');
  await expect(quantity).toHaveAccessibleDescription('Введите количество.');
  await expect(fixture.getByRole('status', { name: 'Стоимость заказа', exact: true })).toHaveText('Стоимость: —');
  await quantity.fill('1');
  await quantity.press('Enter');
  await expect(fixture.getByRole('status', { name: 'Результат расчёта', exact: true })).toHaveText(/Заказ рассчитан: 12,50.*₽/);
});

test('showcase saves a Switch setting immediately, rolls back an error and retries', async ({ page }) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#switch');
  const widget = fixture.getByRole('switch', { name: 'Автоматические уведомления', exact: true });
  const status = fixture.getByRole('status', { name: 'Сохранение уведомлений', exact: true });
  await widget.click();
  await expect(status).toHaveText('Уведомления включены.');
  await expect(widget).toHaveAttribute('aria-checked', 'true');
  await fixture.getByRole('checkbox', { name: 'Ошибка следующего сохранения', exact: true }).check();
  await widget.click();
  await expect(fixture.getByRole('alert')).toHaveText('Не удалось сохранить настройку. Попробуйте ещё раз.');
  await expect(widget).toHaveAttribute('aria-checked', 'true');
  await expect(fixture.getByRole('checkbox', { name: 'Ошибка следующего сохранения', exact: true })).not.toBeChecked();
  await widget.click();
  await expect(status).toHaveText('Уведомления выключены.');
  await expect(widget).toHaveAttribute('aria-checked', 'false');
  await expect(fixture.getByRole('alert')).toHaveCount(0);
});

test('showcase validates a Switch field, serializes it and resets its form', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#switch');
  const widget = fixture.getByRole('switch', { name: 'Еженедельный отчёт', exact: true });
  await fixture.getByRole('button', { name: 'Сохранить параметры', exact: true }).click();
  await expect(widget).toBeFocused();
  await expect(widget).toHaveAccessibleDescription('Включите отчёт для проверки формы.');
  await fixture.getByText('Еженедельный отчёт', { exact: true }).click();
  await fixture.getByRole('button', { name: 'Сохранить параметры', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Результат формы Switch', exact: true })).toHaveText('Параметры сохранены.');
  expect(await fixture.locator('form').evaluate((element) => new FormData(element as HTMLFormElement).get('digest'))).toBe('on');
  await fixture.screenshot({ path: testInfo.outputPath('switch.png') });
  await fixture.getByRole('button', { name: 'Сбросить параметры', exact: true }).click();
  await expect(widget).toHaveAttribute('aria-checked', 'false');
  await expect(widget).not.toHaveAttribute('aria-invalid');
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

test('showcase submits and resets a multiple Select with array validation', async ({ page }, testInfo) => {
  await page.goto('/ant-design');
  const fixture = page.locator('#select-multiple');
  const input = fixture.getByLabel('Команды участника', { exact: true });
  await expect(fixture.getByRole('status', { name: 'Выбранные команды', exact: true })).toHaveText('Выбрано команд: 2.');
  await input.click();
  await fixture.getByRole('option', { name: 'Аналитика', exact: true }).click();
  await fixture.getByRole('option', { name: 'Поддержка', exact: true }).click();
  await expect(fixture.getByRole('option', { name: 'Архив', exact: true })).toBeDisabled();
  await input.press('Escape');
  await fixture.getByRole('button', { name: 'Сохранить команды', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAccessibleDescription('Выберите не более трёх команд.');
  await fixture.getByRole('button', { name: 'Удалить Поддержка', exact: true }).click();
  await fixture.getByRole('button', { name: 'Сохранить команды', exact: true }).click();
  await expect(fixture.getByRole('status').filter({ hasText: 'Сохранены команды:' })).toHaveText('Сохранены команды: Разработка, Дизайн, Аналитика.');
  await fixture.screenshot({ path: testInfo.outputPath('multiple-select.png') });
  await fixture.getByRole('button', { name: 'Очистить', exact: true }).click();
  await fixture.getByRole('button', { name: 'Сохранить команды', exact: true }).click();
  await expect(input).toHaveAccessibleDescription('Выберите хотя бы одну команду.');
  await fixture.getByRole('button', { name: 'Сбросить команды', exact: true }).click();

  await expect(fixture.getByRole('status', { name: 'Выбранные команды', exact: true })).toHaveText('Выбрано команд: 2.');
  await expect(input).not.toHaveAttribute('aria-invalid');
  expect(await fixture.locator('form').evaluate((element) => new FormData(element as HTMLFormElement).getAll('teams'))).toEqual(['0', '1']);
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
    const remoteRegion = page.locator('#server-table').getByRole('region', { name: 'Удалённые участники', exact: true });
    await expect.poll(() => remoteRegion.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
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

  test('renders Result, its native actions and an idle form before hydration', async ({ page }) => {
    const response = await page.goto('/ant-design#result'); expect(response?.status()).toBe(200);
    const fixture = page.locator('#result'); const preview = fixture.getByRole('group', { name: 'Предпросмотр Result', exact: true });
    await expect(preview.getByRole('heading', { name: 'Операция завершена', level: 3, exact: true })).toBeVisible(); await expect(preview.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(preview.getByRole('button', { name: 'Действие Result', exact: true })).toBeVisible(); await expect(preview.locator('[aria-live], [role="alert"], [role="status"]')).toHaveCount(0);
    await expect(fixture.getByRole('textbox', { name: 'Имя в заявке' })).toHaveValue('Анна'); await expect(fixture.getByRole('form', { name: 'Заявка Result', exact: true })).not.toHaveAttribute('aria-busy');
    await expect(fixture.getByRole('region', { name: 'Результат отправки заявки', exact: true })).toHaveCount(0); await expect(fixture.getByRole('status', { name: 'Результат примера Result', exact: true })).toHaveText('Состояние: editing. Действий: 0.');
  });

  test('renders Empty illustrations, footer actions and unique paint IDs before hydration', async ({ page }) => {
    await page.goto('/ant-design#empty'); const fixture = page.locator('#empty');
    await expect(fixture.locator('.preview .ant-empty-image svg')).toHaveAttribute('viewBox', '0 0 184 152');
    await expect(fixture.getByRole('table', { name: 'Участники примера Empty', exact: true }).getByRole('button', { name: 'Создать первого участника', exact: true })).toBeVisible();
    await expect(fixture.getByRole('status', { name: 'Результат примера Empty', exact: true })).toHaveText('Участников: 0. Показано: 0. Действий: 0.');
    const ids = await page.locator('pattern[id]').evaluateAll(nodes => nodes.map(node => node.id)); expect(ids.length).toBeGreaterThan(7); expect(new Set(ids).size).toBe(ids.length);
  });

  test('renders a decorative Skeleton preview and idle card before hydration', async ({ page }) => {
    await page.goto('/ant-design#skeleton'); const fixture = page.locator('#skeleton'); const skeleton = fixture.locator('#showcase-skeleton');
    await expect(fixture.locator('.preview .ant-skeleton-host')).toHaveAttribute('aria-hidden', 'true'); await expect(fixture.locator('.preview li')).toHaveCount(3);
    await expect(skeleton).toHaveRole('group'); await expect(skeleton).toHaveAccessibleName('Карточка участника');
    await expect(skeleton.locator('.ant-skeleton-content')).toHaveAttribute('aria-busy', 'false'); await expect(skeleton.locator('.loading-status')).toHaveCount(0);
    await expect(fixture.locator('#skeleton-example-name')).toHaveCount(0); await expect(fixture.getByRole('status', { name: 'Результат примера Skeleton', exact: true })).toHaveText('Загрузите карточку участника.');
  });

  test('renders available Spin content and decorative sizes before hydration', async ({ page }) => {
    await page.goto('/ant-design#spin'); const fixture = page.locator('#spin'); const spin = fixture.locator('#showcase-spin');
    await expect(spin).toHaveRole('group'); await expect(spin).toHaveAccessibleName('Профиль участника');
    await expect(spin.locator('.ant-spin-container')).toHaveAttribute('aria-busy', 'false'); await expect(spin.locator('.ant-spin-container')).not.toHaveAttribute('inert');
    await expect(spin.locator('.ant-spin-section')).toHaveCount(0); await expect(fixture.getByRole('textbox', { name: 'Имя в черновике', exact: true })).toHaveValue('Анна');
    await expect(fixture.locator('.sizes .ant-spin[aria-hidden="true"]')).toHaveCount(3);
    await expect(fixture.getByRole('status', { name: 'Результат примера Spin', exact: true })).toHaveText('Измените черновик и обновите данные.');
  });

  test('renders Progress geometry and semantic values before hydration', async ({ page }) => {
    await page.goto('/ant-design#progress'); const fixture = page.locator('#progress');
    await expect(fixture.getByRole('progressbar', { name: 'Линейный прогресс', exact: true })).toHaveAttribute('aria-valuenow', '42.5');
    const circle = fixture.getByRole('progressbar', { name: 'Круговой прогресс', exact: true });
    await expect(circle).toHaveAttribute('aria-valuetext', '42.5%'); await expect(circle.locator('svg')).toBeVisible();
    await expect(circle.locator('.ant-progress-circle-path')).toHaveAttribute('r', '47');
  });

  test('provides labelled form controls and keeps the modal hidden before hydration', async ({ page }) => {
    await page.goto('/ant-design');

    await expect(page.getByRole('heading', { name: 'Ant Design для Svelte', exact: true })).toBeVisible();
    await expect(page.getByLabel('Редактируемое значение', { exact: true })).toHaveValue('Svelte 5');
    await expect(page.getByLabel('Имя', { exact: true })).toHaveCount(1);
    await expect(page.getByLabel('Роль', { exact: true })).toHaveValue('Разработчик');
    await expect(page.locator('#select-multiple').getByRole('button', { name: 'Удалить Разработка', exact: true })).toBeVisible();
    await expect(page.locator('#select-multiple').getByRole('button', { name: 'Удалить Дизайн', exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Все права', exact: true })).toHaveAttribute('aria-checked', 'mixed');
    await expect(page.getByRole('checkbox', { name: 'Просмотр', exact: true })).toBeChecked();
    await expect(page.getByRole('group', { name: 'Права участника', exact: true })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Тариф участника', exact: true }).getByRole('radio', { name: 'Базовый', exact: true })).toBeChecked();
    await expect(page.getByRole('radiogroup', { name: 'Режим публикации', exact: true }).getByRole('radio')).toHaveCount(2);
    await expect(page.getByRole('switch', { name: 'Автоматические уведомления', exact: true })).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('switch', { name: 'Еженедельный отчёт', exact: true })).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('spinbutton', { name: 'Количество', exact: true })).toHaveValue('2');
    await expect(page.getByRole('spinbutton', { name: 'Цена за единицу', exact: true })).toHaveValue('12.50');
    await expect(page.getByRole('slider', { name: 'Громкость уведомлений', exact: true })).toHaveValue('40');
    await expect(page.getByRole('spinbutton', { name: 'Точная громкость', exact: true })).toHaveValue('40');
    await expect(page.getByRole('navigation', { name: 'Пример пагинации', exact: true }).locator('[aria-current="page"]')).toHaveText('1');
    const table = page.getByRole('table', { name: 'Участники проекта', exact: true });
    await expect(table.locator('tbody tr')).toHaveCount(5);
    await expect(table.locator('tbody tr > td:nth-child(2)').first()).toHaveText('Анна Иванова');
    await expect(page.getByRole('table', { name: 'Удалённые участники', exact: true }).getByRole('cell', { name: 'Нет данных', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Результат удалённой загрузки', exact: true })).toHaveText('Всего: 0. Страница: 1. Выбрано: 0.');
    const expanded = page.getByRole('table', { name: 'Карточки участников', exact: true });
    await expect(expanded.locator('.ant-table-row')).toHaveCount(3);
    await expect(expanded.locator('.ant-table-expanded-row')).toContainText('marina@example.com');
    await expect(expanded.getByRole('button', { name: 'Свернуть строку 1', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#modal dialog')).not.toBeVisible();
    await expect(page.locator('#dropdown dialog')).not.toBeVisible();
    await expect(page.locator('#tabs dialog')).not.toBeVisible();
  });
});
