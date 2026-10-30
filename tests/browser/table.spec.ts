import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=table');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'Table cycles stable sorting with Enter and Space and exposes the active order',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'People', exact: true });
    const names = table.locator('tbody tr > td:nth-child(2)');
    const score = table.getByRole('button', { name: 'Score', exact: true });
    const header = table.getByRole('columnheader', { name: 'Score', exact: true });

    await expect(names).toHaveText(['Anna', 'Boris', 'Clara']);
    await expect(page.getByRole('status', { name: 'Table changes', exact: true })).toHaveText('[]');

    await score.focus();
    await score.press('Enter');

    await expect(names).toHaveText(['Gala', 'Boris', 'Iris']);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(score).toBeFocused();
    await expect(score).toHaveCSS('outline-style', 'solid');
    await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('1:3:score:ascend');

    await score.press('Space');

    await expect(names).toHaveText(['Henry', 'Elena', 'Leon']);
    await expect(header).toHaveAttribute('aria-sort', 'descending');

    await score.press('Enter');

    await expect(names).toHaveText(['Anna', 'Boris', 'Clara']);
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('1:3:none');

    const changes = JSON.parse(
      (await page.getByRole('status', { name: 'Table changes', exact: true }).textContent())!
    );

    expect(changes).toHaveLength(3);
    expect(changes[0]).toEqual(
      {
        action: 'sort',
        page: 1,
        size: 3,
        total: 12,
        sorter: { columnKey: 'score', order: 'ascend' },
        ids: [6, 1, 8, 3, 10, 0, 2, 9, 5, 11, 4, 7]
      }
    );
    expect(changes[2].ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    await expect(page.getByRole('status', { name: 'Table submissions' })).toHaveText('0');
  }
);

test(
  'Table sorts the entire collection before paginating and keeps the current page',
  async ({ page }) => {
    const fixture = page.locator('#table-fixture');
    const table = page.getByRole('table', { name: 'People', exact: true });
    const names = table.locator('tbody tr > td:nth-child(2)');
    const pagination = fixture.getByRole('navigation', { name: 'People pages', exact: true });

    await pagination.getByRole('button', { name: 'Страница 2', exact: true }).click();

    await expect(names).toHaveText(['David', 'Elena', 'Felix']);

    await table.getByRole('button', { name: 'Score', exact: true }).click();

    await expect(names).toHaveText(['David', 'Kira', 'Anna']);
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');

    await pagination.getByRole('combobox').click();
    await pagination.getByRole('option', { name: '5 / стр.', exact: true }).click();

    await expect(names).toHaveText(['Anna', 'Clara', 'John', 'Felix', 'Leon']);
    await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('2:5:score:ascend');

    await table.getByRole('button', { name: 'Inspect Anna', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Table action' })).toHaveText('0:Anna:0');
    await expect(page.getByRole('status', { name: 'Table submissions' })).toHaveText('0');
  }
);

test(
  'Table clamps a size change on the last page and emits one pagination event',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Set last table page' }).click();

    const pagination = page.getByRole('navigation', { name: 'People pages', exact: true });

    await pagination.getByRole('combobox').click();
    await pagination.getByRole('option', { name: '10 / стр.', exact: true }).click();

    await expect(
      page.getByRole('table', { name: 'People', exact: true })
        .locator('tbody tr > td:nth-child(2)')
    )
      .toHaveText(['Kira', 'Leon']);
    await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('2:10:none');

    const changes = JSON.parse(
      (await page.getByRole('status', { name: 'Table changes', exact: true }).textContent())!
    );

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject(
      { action: 'paginate', page: 2, size: 10, total: 12, sorter: null }
    );
  }
);

test(
  'Table selects only enabled rows on the current page and retains off-page keys',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'People', exact: true });
    const all = table.getByRole('checkbox', { name: 'Выбрать все строки на странице', exact: true });
    const selected = page.getByRole('status', { name: 'Table selected keys' });
    const pagination = page.getByRole('navigation', { name: 'People pages', exact: true });

    await table.getByRole('checkbox', { name: 'Select Anna', exact: true }).check();

    await expect(all).toHaveJSProperty('indeterminate', true);

    await pagination.getByRole('button', { name: 'Страница 2', exact: true }).click();

    await expect(all).not.toBeChecked();
    await expect(all).toHaveJSProperty('indeterminate', false);

    await all.check();

    await expect(selected).toHaveText('[0,3,4,5]');
    await expect(all).toBeChecked();

    await pagination.getByRole('button', { name: 'Страница 1', exact: true }).click();

    await expect(table.getByRole('checkbox', { name: 'Select Anna', exact: true })).toBeChecked();
    await expect(table.getByRole('checkbox', { name: 'Select Boris', exact: true })).toBeDisabled();

    await all.check();

    await expect(selected).toHaveText('[0,3,4,5,2]');
    await expect(table.getByRole('checkbox', { name: 'Select Boris', exact: true })).not
      .toBeChecked();

    await all.uncheck();

    await expect(selected).toHaveText('[3,4,5]');

    const changes = JSON.parse(
      (await page.getByRole('status', { name: 'Table selection changes' }).textContent())!
    );

    expect(changes[2]).toMatchObject({ keys: [0, 3, 4, 5, 2], ids: [0, 3, 4, 5, 2], type: 'all' });
    expect(changes[3]).toMatchObject({ keys: [3, 4, 5], ids: [3, 4, 5], type: 'all' });
    await expect(page.getByRole('status', { name: 'Table changes', exact: true })).not
      .toContainText('"action":"select"');
  }
);

test(
  'Table accepts external sorting, paging and selection without emitting user callbacks',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Set table state from parent' }).click();

    const table = page.getByRole('table', { name: 'People', exact: true });

    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Felix', 'John', 'Anna']);
    await expect(table.getByRole('columnheader', { name: 'Score', exact: true })).toHaveAttribute(
      'aria-sort',
      'descending'
    );
    await expect(table.getByRole('checkbox', { name: 'Select Anna', exact: true })).toBeChecked();
    await expect(page.getByRole('status', { name: 'Table selected keys' })).toHaveText('[0,7]');

    await page.getByRole('button', { name: 'Clear table selection' }).click();

    await expect(table.getByRole('checkbox', { name: 'Select Anna', exact: true })).not
      .toBeChecked();
    await expect(page.getByRole('status', { name: 'Table changes', exact: true })).toHaveText('[]');
    await expect(page.getByRole('status', { name: 'Table selection changes' })).toHaveText('[]');
  }
);

test(
  'Table keeps selection through sorting and record replacement and returns current records',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'People', exact: true });

    await table.getByRole('checkbox', { name: 'Select Anna', exact: true }).check();
    await page.getByRole('button', { name: 'Replace selected record' }).click();

    await expect(table.getByRole('checkbox', { name: 'Select Updated Anna', exact: true }))
      .toBeChecked();

    await table.getByRole('checkbox', { name: 'Select Clara', exact: true }).check();

    const changes = JSON.parse(
      (await page.getByRole('status', { name: 'Table selection changes' }).textContent())!
    );

    expect(changes).toHaveLength(2);
    expect(changes[1]).toMatchObject({ keys: [0, 2], names: ['Updated Anna', 'Clara'] });

    await table.getByRole('button', { name: 'Score', exact: true }).click();
    await page.getByRole('navigation', { name: 'People pages', exact: true }).getByRole(
      'button',
      { name: 'Страница 3', exact: true }
    )
      .click();

    await expect(table.getByRole('checkbox', { name: 'Select Clara', exact: true })).toBeChecked();
    await expect(page.getByRole('status', { name: 'Table selected keys' })).toHaveText('[0,2]');
  }
);

test(
  'Table clamps a shrinking collection and restores retained keys without synthetic events',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'People', exact: true });

    await table.getByRole('checkbox', { name: 'Select Anna', exact: true }).check();
    await page.getByRole('button', { name: 'Set last table page' }).click();
    await page.getByRole('button', { name: 'Shrink table data' }).click();

    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Anna', 'Boris']);
    await expect(
      page.getByRole('navigation', { name: 'People pages', exact: true })
        .locator('[aria-current="page"]')
    )
      .toHaveText('1');
    await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('4:3:none');

    await page.getByRole('button', { name: 'Empty table data' }).click();

    await expect(table.getByRole('cell', { name: 'Нет данных', exact: true })).toHaveAttribute(
      'colspan',
      '4'
    );
    await expect(table.locator('.ant-empty-normal .ant-empty-image svg')).toHaveAttribute(
      'viewBox',
      '0 0 64 41'
    );
    await expect(table.locator('.ant-empty')).not.toHaveAttribute('role');
    await expect(table.locator('.ant-empty')).not.toHaveAttribute('aria-live');
    await expect(
      table.getByRole(
        'checkbox',
        { name: 'Выбрать все строки на странице', exact: true }
      )
    )
      .toBeDisabled();
    await expect(page.getByRole('status', { name: 'Table selected keys' })).toHaveText('[0]');

    await page.getByRole('button', { name: 'Restore table data' }).click();

    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['John', 'Kira', 'Leon']);

    await page.getByRole('navigation', { name: 'People pages', exact: true }).getByRole(
      'button',
      { name: 'Страница 1', exact: true }
    )
      .click();

    await expect(table.getByRole('checkbox', { name: 'Select Anna', exact: true })).toBeChecked();

    const changes = JSON.parse(
      (await page.getByRole('status', { name: 'Table changes', exact: true }).textContent())!
    );

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ action: 'paginate', page: 1, total: 12 });

    const selections = JSON.parse(
      (await page.getByRole('status', { name: 'Table selection changes' }).textContent())!
    );

    expect(selections).toHaveLength(1);
  }
);

test('Table ignores a removed sort column without mutating its owner state', async ({ page }) => {
  await page.getByRole('button', { name: 'Set table state from parent' }).click();
  await page.getByRole('button', { name: 'Remove sorted column' }).click();

  const table = page.getByRole('table', { name: 'People', exact: true });

  await expect(table.getByRole('columnheader', { name: 'Score', exact: true })).toHaveCount(0);
  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['David', 'Elena', 'Felix']);
  await expect(table.locator('[aria-sort]')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('2:3:score:descend');
  await expect(page.getByRole('status', { name: 'Table changes', exact: true })).toHaveText('[]');
});

test(
  'Table can disable pagination without slicing data or changing owner state',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Set last table page' }).click();
    await page.getByLabel('Disable table pagination', { exact: true }).check();

    await expect(page.getByRole('table', { name: 'People', exact: true }).locator('tbody tr'))
      .toHaveCount(12);
    await expect(page.getByRole('navigation', { name: 'People pages', exact: true })).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'Table owner' })).toHaveText('4:3:none');
    await expect(page.getByRole('status', { name: 'Table changes', exact: true })).toHaveText('[]');
  }
);

test(
  'Table loading and disabled context block managed controls and preserve explicit overrides',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'People', exact: true });

    await page.getByLabel('Table loading', { exact: true }).check();

    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#table-fixture').getByRole('status', { name: '', exact: true }))
      .toHaveText('Загрузка данных…');
    await expect(page.locator('#table-fixture .loading-state .ant-spin')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(page.locator('#table-fixture .loading-state').getByRole('status')).toHaveCount(0);
    await expect(table.getByRole('button', { name: 'Score', exact: true })).toBeDisabled();
    await expect(table.getByRole('checkbox', { name: 'Select Anna', exact: true })).toBeDisabled();
    await expect(
      page.getByRole('navigation', { name: 'People pages', exact: true })
        .getByRole('combobox')
    )
      .toBeDisabled();

    await page.getByLabel('Table loading', { exact: true }).uncheck();

    await expect(table).not.toHaveAttribute('aria-busy');

    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(table.getByRole('button', { name: 'Score', exact: true })).toBeDisabled();
    await expect(
      page.getByRole('table', { name: 'Default people', exact: true }).getByRole(
        'button',
        { name: 'Score', exact: true }
      )
    )
      .toBeEnabled();
  }
);

test('Table disables select-all when every row is disabled', async ({ page }) => {
  await page.getByLabel('Disable every row selection', { exact: true }).check();

  const table = page.getByRole('table', { name: 'People', exact: true });

  await expect(table.getByRole('checkbox', { name: 'Выбрать все строки на странице', exact: true }))
    .toBeDisabled();
  await expect(table.getByRole('checkbox', { name: 'Select Anna', exact: true })).toBeDisabled();
  await expect(page.getByRole('status', { name: 'Table selection changes' })).toHaveText('[]');
});

test('Table supports uncontrolled initial sorting, selection and paging', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Default people', exact: true });

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['David', 'Boris']);
  await expect(table.getByRole('checkbox', { name: 'Выбрать строку 3', exact: true })).toBeChecked();

  await table.getByRole('checkbox', { name: 'Выбрать строку 1', exact: true }).check();

  await expect(table.getByRole('checkbox', { name: 'Выбрать все строки на странице', exact: true }))
    .toBeChecked();

  await table.getByRole('button', { name: 'Score', exact: true }).click();

  await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Clara', 'David']);
  await expect(table.getByRole('columnheader', { name: 'Score', exact: true })).not
    .toHaveAttribute('aria-sort');
});

test(
  'Table inherits RTL and locale and keeps nested empty text and snippet overrides',
  async ({ page }) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('English locale', { exact: true }).check();

    const table = page.getByRole('table', { name: 'People', exact: true });

    await expect(table).toHaveCSS('direction', 'rtl');
    await expect(table.getByRole('button', { name: 'Score', exact: true }))
      .toHaveAccessibleDescription('Sort ascending');
    await expect(table.getByRole('checkbox', { name: 'Select all rows on this page', exact: true }))
      .toBeEnabled();

    const first = (await table.getByRole('columnheader', { name: 'Name', exact: true })
      .boundingBox())!;
    const second = (await table.getByRole('columnheader', { name: 'Score', exact: true })
      .boundingBox())!;

    expect(first.x).toBeGreaterThan(second.x);
    await expect(page.getByRole('table', { name: 'Custom empty people', exact: true }))
      .toContainText('Custom empty table');
    await expect(
      page.getByRole('table', { name: 'Custom empty people', exact: true })
        .locator('.ant-empty')
    )
      .toHaveCount(1);
    await expect(
      page.getByRole('table', { name: 'Empty snippet people', exact: true }).getByRole(
        'link',
        { name: 'Create a person' }
      )
    )
      .toBeVisible();
    await expect(
      page.getByRole('table', { name: 'Empty snippet people', exact: true })
        .locator('.ant-empty')
    )
      .toHaveCount(0);
  }
);

test(
  'Table follows theme colors and size settings while keeping selection visible',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'People', exact: true });
    const cell = table.locator('tbody tr > td:nth-child(2)').first();

    await expect(cell).toHaveCSS('padding-block-start', '12px');

    await page.getByLabel('Table size', { exact: true }).selectOption('small');

    await expect(cell).toHaveCSS('padding-block-start', '8px');

    await page.getByLabel('Table size', { exact: true }).selectOption('large');

    await expect(cell).toHaveCSS('padding-block-start', '16px');

    await page.getByLabel('Table size', { exact: true }).selectOption('middle');
    await table.getByRole('checkbox', { name: 'Select Anna', exact: true }).check();

    const checked = table.locator('tbody .ant-checkbox-checked');

    await page.mouse.move(0, 0);

    await expect(checked).toHaveCSS('background-color', 'rgb(22, 119, 255)');

    await page.getByLabel('Purple table theme', { exact: true }).check();

    await expect(checked).toHaveCSS('background-color', 'rgb(114, 46, 209)');

    await page.getByLabel('Dark table theme', { exact: true }).check();

    await expect(page.locator('#table-fixture .ant-table')).toHaveCSS(
      'background-color',
      'rgb(20, 20, 20)'
    );
    await expect(cell).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');

    await page.getByLabel('Compact table theme', { exact: true }).check();

    await expect(cell).toHaveCSS('font-size', '12px');
  }
);

test.describe('mobile table', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('scrolls a wide table with the keyboard without widening the document', async ({ page }) => {
    const region = page.locator('#table-fixture').getByRole(
      'region',
      { name: 'People', exact: true }
    );

    await expect.poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
      .toBe(true);
    await expect.poll(() => region.evaluate((element) => element.scrollWidth > element.clientWidth))
      .toBe(true);
    await region.focus();

    await expect(region).toBeFocused();

    await region.press('ArrowRight');

    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

    await expect(
      page.getByRole('navigation', { name: 'People pages', exact: true })
        .getByRole('combobox')
    )
      .toBeVisible();
  });
});
