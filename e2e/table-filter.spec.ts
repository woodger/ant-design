import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=table-filters');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Table confirms multiple filter values, resets the page and reports filtered data before pagination', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await page.getByRole('button', { name: 'Set last filtered page', exact: true }).click();
  const trigger = table.getByRole('button', { name: 'Фильтр: Team', exact: true });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).toBeFocused();
  await menu.getByRole('checkbox', { name: 'Core', exact: true }).check();
  await menu.getByRole('checkbox', { name: 'Support', exact: true }).check();
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Ginger', 'Hazel']);
  await expect(page.getByRole('status', { name: 'Filter events', exact: true })).toHaveText('[]');
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Aster', 'Cedar']);
  await expect(page.getByRole('status', { name: 'Filter paging', exact: true })).toHaveText('1:2');
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"team":["Core","Support"]}');
  const events = JSON.parse((await page.getByRole('status', { name: 'Filter events', exact: true }).textContent())!);
  expect(events).toEqual([{ action: 'filter', pagination: { current: 1, pageSize: 2, total: 6 }, sorter: null, filters: { team: ['Core', 'Support'] }, keys: [0, 2, 3, 5, 6, 7] }]);
  await expect(page.getByRole('status', { name: 'Filter submissions', exact: true })).toHaveText('0');
});

test('Table cancels a filter draft on Escape, outside clicks and Tab without callbacks', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  const trigger = table.getByRole('button', { name: 'Фильтр: Team', exact: true });
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  await menu.getByRole('checkbox', { name: 'Core', exact: true }).press('Space');
  await page.keyboard.press('Escape');

  await expect(trigger).toBeFocused();
  await expect(menu).not.toBeVisible();
  await trigger.click();
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).not.toBeChecked();
  await menu.getByRole('checkbox', { name: 'Core', exact: true }).check();
  await page.getByRole('heading', { name: 'Component browser fixtures' }).click();
  await expect(menu).not.toBeVisible();
  await trigger.click();
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).not.toBeChecked();
  await menu.getByRole('button', { name: 'Применить', exact: true }).focus();
  await page.keyboard.press('Tab');

  await expect(menu).not.toBeVisible();
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{}');
  await expect(page.getByRole('status', { name: 'Filter events', exact: true })).toHaveText('[]');
});

test('Table resets a draft and applies the cleared filter only after confirmation', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  const trigger = table.getByRole('button', { name: 'Фильтр: Team', exact: true });
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await trigger.click();
  await menu.getByRole('checkbox', { name: 'Core', exact: true }).check();
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();
  await trigger.click();
  await menu.getByRole('button', { name: 'Сбросить', exact: true }).click();

  await expect(menu).toBeVisible();
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).not.toBeChecked();
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"team":["Core"]}');
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{}');
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Aster', 'Birch']);
  const events = JSON.parse((await page.getByRole('status', { name: 'Filter events', exact: true }).textContent())!);
  expect(events).toHaveLength(2);
  expect(events[1]).toMatchObject({ action: 'filter', filters: {}, pagination: { total: 8 } });
});

test('Table uses native single-choice keyboard behavior and preserves false and zero values', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await table.getByRole('button', { name: 'Фильтр: State', exact: true }).click();
  const state = page.getByRole('dialog', { name: 'Фильтр: State', exact: true });
  await expect(state.getByRole('radio', { name: 'Active', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(state.getByRole('radio', { name: 'Inactive', exact: true })).toBeChecked();
  await page.keyboard.press('Enter');

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Birch', 'Fern']);
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"active":[false]}');
  await page.getByRole('button', { name: 'Clear filters from parent', exact: true }).click();
  await table.getByRole('button', { name: 'Фильтр: Points', exact: true }).click();
  const points = page.getByRole('dialog', { name: 'Фильтр: Points', exact: true });
  await points.getByRole('checkbox', { name: 'Zero points', exact: true }).check();
  await points.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Ginger']);
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"score":[0]}');
  await expect(page.getByRole('status', { name: 'Filter submissions', exact: true })).toHaveText('0');
});

test('Table combines filtering with stable sorting, page changes and size changes', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await table.getByRole('button', { name: 'Points', exact: true }).click();
  await table.getByRole('button', { name: 'Фильтр: Team', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await menu.getByRole('checkbox', { name: 'Core', exact: true }).check();
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Aster', 'Cedar']);
  const pages = page.getByRole('navigation', { name: 'Filtered pages', exact: true });
  await pages.getByRole('button', { name: 'Страница 2', exact: true }).click();
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Fern', 'Hazel']);
  await pages.getByRole('combobox').click();
  await pages.getByRole('option', { name: '4 / стр.', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Aster', 'Cedar', 'Fern', 'Hazel']);
  const events = JSON.parse((await page.getByRole('status', { name: 'Filter events', exact: true }).textContent())!);
  expect(events).toHaveLength(4);
  expect(events[3]).toMatchObject({ action: 'paginate', sorter: { columnKey: 'score', order: 'ascend' }, filters: { team: ['Core'] }, pagination: { current: 1, pageSize: 4, total: 4 }, keys: [0, 2, 5, 7] });
});

test('Table preserves hidden selected keys and returns original-source records when selection changes', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await table.getByRole('checkbox', { name: 'Choose Aster', exact: true }).check();
  await table.getByRole('button', { name: 'Фильтр: Team', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await menu.getByRole('checkbox', { name: 'Support', exact: true }).check();
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();
  await page.getByRole('button', { name: 'Replace filtered records', exact: true }).click();
  await table.getByRole('checkbox', { name: 'Выбрать все строки на странице', exact: true }).check();

  await expect(page.getByRole('status', { name: 'Filter selected', exact: true })).toHaveText('[0,3,6]');
  const selections = JSON.parse((await page.getByRole('status', { name: 'Filter selection events', exact: true }).textContent())!);
  expect(selections).toEqual([{ keys: [0], names: ['Aster'] }, { keys: [0, 3, 6], names: ['New Aster', 'Dahlia', 'Ginger'] }]);
  await page.getByRole('button', { name: 'Clear filters from parent', exact: true }).click();
  await expect(table.getByRole('checkbox', { name: 'Choose New Aster', exact: true })).toBeChecked();
});

test('Table accepts external filters without resetting owner paging or emitting callbacks', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await page.getByRole('button', { name: 'Set last filtered page', exact: true }).click();
  await page.getByRole('button', { name: 'Set filters from parent (F4)', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Fern']);
  await expect(page.getByRole('status', { name: 'Filter paging', exact: true })).toHaveText('4:2');
  await expect(page.getByRole('status', { name: 'Filter events', exact: true })).toHaveText('[]');
  await table.getByRole('button', { name: 'Фильтр: Team', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).toBeChecked();
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Filter paging', exact: true })).toHaveText('4:2');
  await expect(page.getByRole('status', { name: 'Filter events', exact: true })).toHaveText('[]');
});

test('Table closes stale drafts on external filter changes, loading and column removal', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  const trigger = table.getByRole('button', { name: 'Фильтр: Team', exact: true });
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await trigger.click();
  await menu.getByRole('checkbox', { name: 'Support', exact: true }).check();
  await page.keyboard.press('F4');
  await expect(menu).not.toBeVisible();
  await trigger.click();
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).toBeChecked();
  await page.keyboard.press('F3');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeDisabled();
  await page.keyboard.press('F3');
  await trigger.click();
  await page.keyboard.press('F5');

  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"team":["Core"],"active":[false]}');
  await expect(page.getByRole('status', { name: 'Filter events', exact: true })).toHaveText('[]');
});

test('Table ignores unavailable filter configuration while retaining owner criteria for restoration', async ({ page }) => {
  await page.getByRole('button', { name: 'Set filters from parent (F4)', exact: true }).click();
  await page.getByRole('button', { name: 'Limit filter options', exact: true }).click();
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Birch', 'Fern']);
  await page.getByRole('button', { name: 'Remove filter column (F5)', exact: true }).click();
  await expect(table.getByRole('button', { name: 'Фильтр: Team', exact: true })).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"team":["Core"],"active":[false]}');
  await expect(page.getByRole('status', { name: 'Filter events', exact: true })).toHaveText('[]');
});

test('Table supports initial filters and their uncontrolled reset', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Default filtered people', exact: true });
  await expect(table.locator('tbody tr > td:first-child')).toHaveText(['Aster', 'Cedar', 'Fern', 'Hazel']);
  await table.getByRole('button', { name: 'Фильтр: Team', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Фильтр: Team', exact: true });
  await expect(menu.getByRole('checkbox', { name: 'Core', exact: true })).toBeChecked();
  await menu.getByRole('button', { name: 'Сбросить', exact: true }).click();
  await menu.getByRole('button', { name: 'Применить', exact: true }).click();

  await expect(table.locator('tbody tr')).toHaveCount(8);
});

test('Table filter Escape closes its popover before the containing modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Open filter modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Filter modal', exact: true });
  const trigger = modal.getByRole('button', { name: 'Фильтр: Team', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Фильтр: Team', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(modal).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Фильтр: Team', exact: true })).not.toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
});

test('Table filter follows inherited locale, RTL and theme colors', async ({ page }, testInfo) => {
  await page.getByLabel('English locale', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark filter theme', { exact: true }).check();
  await page.getByLabel('Purple filter theme', { exact: true }).check();
  const table = page.getByRole('table', { name: 'Filtered people', exact: true });
  await table.getByRole('button', { name: 'Filter: Team', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Filter: Team', exact: true });

  await expect(menu).toHaveCSS('direction', 'rtl');
  await expect(menu).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(menu.getByRole('button', { name: 'Apply', exact: true })).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await menu.screenshot({ path: testInfo.outputPath('filter-dark-rtl.png') });
  await menu.getByRole('checkbox', { name: 'Core', exact: true }).check();
  await menu.getByRole('button', { name: 'Apply', exact: true }).click();

  await expect(table.getByRole('button', { name: 'Filter: Team', exact: true })).toHaveCSS('color', 'rgb(114, 46, 209)');
});

test.describe('mobile table filters', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('keeps the popover visible above a scrolling table and within viewport bounds', async ({ page }, testInfo) => {
    const region = page.locator('#table-filter-fixture').getByRole('region', { name: 'Filtered people', exact: true });
    await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    const table = page.getByRole('table', { name: 'Filtered people', exact: true });
    await table.getByRole('button', { name: 'Фильтр: State', exact: true }).click();
    const menu = page.getByRole('dialog', { name: 'Фильтр: State', exact: true });
    await expect(menu).toBeVisible();
    const bounds = (await menu.boundingBox())!;

    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(812);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await menu.screenshot({ path: testInfo.outputPath('filter-mobile.png') });
    await menu.getByRole('radio', { name: 'Inactive', exact: true }).check();
    await menu.getByRole('button', { name: 'Применить', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Filter owner', exact: true })).toHaveText('{"active":[false]}');
  });
});
