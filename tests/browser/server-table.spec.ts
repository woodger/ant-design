import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=table-server');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'server Table renders the supplied page unchanged and paginates with the external total',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'Supplied server page', exact: true });
    const names = table.locator('tbody tr > td:nth-child(2)');
    const pagination = page.getByRole('navigation', { name: 'Supplied server pages', exact: true });

    await expect(names).toHaveText(['Zulu', 'Alpha', 'Mike']);
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('4');
    await expect(table.getByRole('columnheader', { name: 'Remote name', exact: true })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    await pagination.getByRole('button', { name: 'Страница 21', exact: true }).click();

    await expect(names).toHaveText(['Zulu', 'Alpha', 'Mike']);

    await pagination.getByRole('combobox').click();
    await pagination.getByRole('option', { name: '10 / стр.', exact: true }).click();

    await expect(names).toHaveText(['Zulu', 'Alpha', 'Mike']);
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('5');

    const events = JSON.parse(
      (await page.getByRole('status', { name: 'Server events', exact: true }).textContent())!
    );

    expect(events).toEqual([
      {
        action: 'paginate',
        pagination: { current: 21, pageSize: 2, total: 42 },
        sorter: { columnKey: 'name', order: 'ascend' },
        filters: { team: ['A'] },
        currentDataSource: [31, 32, 33]
      },
      {
        action: 'paginate',
        pagination: { current: 5, pageSize: 10, total: 42 },
        sorter: { columnKey: 'name', order: 'ascend' },
        filters: { team: ['A'] },
        currentDataSource: [31, 32, 33]
      }
    ]);
  }
);

test(
  'server Table reports remote sorting and filters without applying them to rows',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'Supplied server page', exact: true });

    await table.getByRole('button', { name: 'Remote score', exact: true }).click();

    await expect(table.getByRole('columnheader', { name: 'Remote score', exact: true })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    await table.getByRole('button', { name: 'Фильтр: Remote team', exact: true }).click();

    const menu = page.getByRole('dialog', { name: 'Фильтр: Remote team', exact: true });

    await menu.getByRole('checkbox', { name: 'Team A', exact: true }).uncheck();
    await menu.getByRole('checkbox', { name: 'Team B', exact: true }).check();
    await menu.getByRole('button', { name: 'Применить', exact: true }).click();

    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Zulu', 'Alpha', 'Mike']);

    const events = JSON.parse(
      (await page.getByRole('status', { name: 'Server events', exact: true }).textContent())!
    );

    expect(events).toEqual([
      {
        action: 'sort',
        pagination: { current: 4, pageSize: 2, total: 42 },
        sorter: { columnKey: 'score', order: 'ascend' },
        filters: { team: ['A'] },
        currentDataSource: [31, 32, 33]
      },
      {
        action: 'filter',
        pagination: { current: 1, pageSize: 2, total: 42 },
        sorter: { columnKey: 'score', order: 'ascend' },
        filters: { team: ['B'] },
        currentDataSource: [31, 32, 33]
      }
    ]);
  }
);

test(
  'switching to client mode restores local processing and ignores the external total',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'Supplied server page', exact: true });

    await page.getByLabel('Use client table mode', { exact: true }).check();

    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Zulu']);
    await expect(table.getByRole('button', { name: 'Remote score', exact: true })).toHaveCount(0);
    await expect(table.getByRole('button', { name: 'Фильтр: Remote team', exact: true }))
      .toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Supplied server pages', exact: true })
        .locator('[aria-current="page"]')
    )
      .toHaveText('2');

    await page.getByLabel('Use client table mode', { exact: true }).uncheck();

    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Zulu', 'Alpha', 'Mike']);
    await expect(page.getByRole('status', { name: 'Server owner', exact: true })).toHaveText(
      '{"current":4,"pageSize":2,"sorter":{"columnKey":"name","order":"ascend"},"filters":{"team":["A"]}}'
    );
    await expect(page.getByRole('status', { name: 'Server events', exact: true })).toHaveText('[]');
  }
);

test(
  'server Table retains selection across page replacement and returns only loaded records',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'Supplied server page', exact: true });

    await table.getByRole('checkbox', { name: 'Select remote Zulu', exact: true }).check();
    await page.getByRole('button', { name: 'Replace server page', exact: true }).click();

    const all = table.getByRole('checkbox', { name: 'Выбрать все строки на странице', exact: true });

    await expect(all).not.toBeChecked();

    await all.check();

    await expect(page.getByRole('status', { name: 'Server selected keys', exact: true }))
      .toHaveText('[31,41,42]');
    await expect(table.getByRole('checkbox', { name: 'Select remote Locked', exact: true })).not
      .toBeChecked();
    await expect(page.getByRole('status', { name: 'Server selections', exact: true })).toHaveText(
      '[{"keys":[31],"ids":[31],"type":"single"},{"keys":[31,41,42],"ids":[41,42],"type":"all"}]'
    );

    await page.getByRole('button', { name: 'Restore server page', exact: true }).click();

    await expect(table.getByRole('checkbox', { name: 'Select remote Zulu', exact: true }))
      .toBeChecked();
    await expect(all).toHaveJSProperty('indeterminate', true);

    await all.check();
    await all.uncheck();

    await expect(page.getByRole('status', { name: 'Server selected keys', exact: true }))
      .toHaveText('[41,42]');

    const selections = JSON.parse(
      (await page.getByRole('status', { name: 'Server selections', exact: true })
        .textContent())!
    );

    expect(selections[3]).toEqual({ keys: [41, 42], ids: [], type: 'all' });
    await expect(page.getByRole('status', { name: 'Server events', exact: true })).toHaveText('[]');
  }
);

test(
  'server Table accepts shrinking totals and empty pages without changing owner state or emitting events',
  async ({ page }) => {
    const table = page.getByRole('table', { name: 'Supplied server page', exact: true });
    const pagination = page.getByRole('navigation', { name: 'Supplied server pages', exact: true });

    await page.getByRole('button', { name: 'Shrink server total', exact: true }).click();

    await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');
    await expect(table.locator('tbody tr > td:nth-child(2)')).toHaveText(['Zulu', 'Alpha', 'Mike']);
    await expect(page.getByRole('status', { name: 'Server owner', exact: true }))
      .toContainText('"current":4');

    await page.getByLabel('Disable server pagination', { exact: true }).check();

    await expect(pagination).toHaveCount(0);
    await expect(table.locator('tbody tr')).toHaveCount(3);

    await page.getByRole('button', { name: 'Restore server page', exact: true }).click();
    await page.getByRole('button', { name: 'Empty server page', exact: true }).click();
    await page.getByLabel('Disable server pagination', { exact: true }).uncheck();

    await expect(table.getByRole('cell', { name: 'Нет данных', exact: true })).toBeVisible();
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('4');
    await expect(pagination.getByRole('button', { name: 'Страница 21', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Server events', exact: true })).toHaveText('[]');
  }
);

test('server controls inherit loading, disabled, RTL and locale', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Supplied server page', exact: true });

  await page.getByLabel('Server table loading', { exact: true }).check();

  await expect(table).toHaveAttribute('aria-busy', 'true');
  await expect(table.getByRole('button', { name: 'Remote score', exact: true })).toBeDisabled();
  await expect(table.getByRole('button', { name: 'Фильтр: Remote team', exact: true }))
    .toBeDisabled();
  await expect(table.getByRole('checkbox', { name: 'Select remote Zulu', exact: true }))
    .toBeDisabled();

  await page.getByLabel('Server table loading', { exact: true }).uncheck();
  await page.getByLabel('Disable all components', { exact: true }).check();

  await expect(table.getByRole('button', { name: 'Remote score', exact: true })).toBeDisabled();

  await page.getByLabel('Disable all components', { exact: true }).uncheck();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('English locale', { exact: true }).check();

  await expect(table).toHaveCSS('direction', 'rtl');
  await expect(table.getByRole('button', { name: 'Filter: Remote team', exact: true }))
    .toBeEnabled();
  await expect(table.getByRole('button', { name: 'Remote score', exact: true }))
    .toHaveAccessibleDescription('Sort ascending');
});
