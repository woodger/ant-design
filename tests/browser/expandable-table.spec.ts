import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=table-expandable');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'Table expands zero with Enter and Space, reports callbacks in order and never submits the form',
  async ({ page }) => {
    const fixture = page.locator('#expandable-table-fixture');
    const table = fixture.getByRole('table', { name: 'Expandable people', exact: true });
    const trigger = table.getByRole('button', { name: 'Раскрыть строку 0', exact: true });

    await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);
    await expect(table.getByRole('button', { name: 'Раскрыть строку 1', exact: true }))
      .toHaveCount(0);

    await trigger.focus();
    await trigger.press('Enter');

    const collapse = table.getByRole('button', { name: 'Свернуть строку 0', exact: true });

    await expect(collapse).toBeFocused();
    await expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Aster:0');
    await expect(table.locator('.ant-table-expanded-row td')).toHaveAttribute('colspan', '5');

    const target = (await collapse.getAttribute('aria-controls'))!;

    expect(await page.evaluate((id) => Boolean(document.getElementById(id)), target)).toBe(true);

    await collapse.press('Space');

    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await expect(table.getByRole('textbox', { name: 'Note for 0', exact: true })).toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Expanded owner keys', exact: true }))
      .toHaveText('[]');

    const events = JSON.parse(
      (await fixture.getByRole('status', { name: 'Expansion events', exact: true })
        .textContent())!
    );

    expect(events).toEqual([
      { type: 'expand', expanded: true, key: 0, name: 'Aster', owner: [0] },
      { type: 'keys', keys: [0] },
      { type: 'expand', expanded: false, key: 0, name: 'Aster', owner: [] },
      { type: 'keys', keys: [] }
    ]);
    await expect(fixture.getByRole('status', { name: 'Expansion data events', exact: true }))
      .toHaveText('[]');
    await expect(fixture.getByRole('status', { name: 'Expansion submissions', exact: true }))
      .toHaveText('0');
  }
);

test(
  'Table supports uncontrolled initial expansion and unique targets across table instances',
  async ({ page }) => {
    const first = page.getByRole('table', { name: 'Expandable people', exact: true });
    const second = page.getByRole('table', { name: 'Initial expansion', exact: true });

    await expect(second.locator('.ant-table-expanded-row')).toContainText('Details Aster:0');

    await first.getByRole('button', { name: 'Раскрыть строку 0', exact: true }).click();

    const firstId = await first.getByRole('button', { name: 'Свернуть строку 0', exact: true })
      .getAttribute('aria-controls');
    const secondId = await second.getByRole('button', { name: 'Свернуть строку 0', exact: true })
      .getAttribute('aria-controls');

    expect(firstId).not.toBe(secondId);

    await second.getByRole('button', { name: 'Свернуть строку 0', exact: true }).click();

    await expect(second.locator('.ant-table-expanded-row')).toHaveCount(0);
    await expect(first.locator('.ant-table-expanded-row')).toHaveCount(1);

    await second.getByRole('button', { name: 'Раскрыть строку 1', exact: true }).click();

    await expect(second.locator('.ant-table-expanded-row')).toContainText('Details Birch:1');
  }
);

test(
  'external keys, row predicates and configuration changes update expansion without user callbacks',
  async ({ page }) => {
    const fixture = page.locator('#expandable-table-fixture');
    const table = fixture.getByRole('table', { name: 'Expandable people', exact: true });

    await fixture.getByRole('button', { name: 'Set expanded keys externally', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Aster:0');

    await fixture.getByRole('button', { name: 'Replace expanded record', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Updated Aster:0');

    await fixture.getByLabel('Block zero expansion', { exact: true }).check();

    await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);
    await expect(table.getByRole('button', { name: /строку 0$/ })).toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Expanded owner keys', exact: true }))
      .toHaveText('[0,3,99]');

    await fixture.getByLabel('Block zero expansion', { exact: true }).uncheck();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Updated Aster:0');

    await fixture.getByLabel('Enable row expansion', { exact: true }).uncheck();

    await expect(table.getByRole('columnheader', { name: 'Подробности', exact: true }))
      .toHaveCount(0);
    await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);

    await fixture.getByLabel('Enable row expansion', { exact: true }).check();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Updated Aster:0');

    await fixture.getByRole('button', { name: 'Clear expanded keys externally', exact: true })
      .click();

    await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Expansion events', exact: true }))
      .toHaveText('[]');
    await expect(fixture.getByRole('status', { name: 'Expansion data events', exact: true }))
      .toHaveText('[]');
  }
);

test(
  'Table retains hidden expanded keys through sorting, filtering and pages with page-relative snippet indexes',
  async ({ page }) => {
    const fixture = page.locator('#expandable-table-fixture');
    const table = fixture.getByRole('table', { name: 'Expandable people', exact: true });

    await fixture.getByRole('button', { name: 'Set expanded keys externally', exact: true }).click();
    await table.getByRole('button', { name: 'Expansion score', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Dahlia:2');

    await fixture.getByRole('navigation', { name: 'Expandable people pages', exact: true }).getByRole(
      'button',
      { name: 'Страница 2', exact: true }
    )
      .click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Aster:1');

    await table.getByRole('button', { name: 'Фильтр: Expansion team', exact: true }).click();

    const menu = page.getByRole('dialog', { name: 'Фильтр: Expansion team', exact: true });

    await menu.getByRole('checkbox', { name: 'Core', exact: true }).check();
    await menu.getByRole('button', { name: 'Применить', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Aster:0');

    await table.getByRole('button', { name: 'Раскрыть строку 6', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Expanded owner keys', exact: true }))
      .toHaveText('[0,3,99,6]');
    await expect(table.locator('.ant-table-row')).toHaveCount(3);
    await expect(table.locator('.ant-table-expanded-row')).toHaveCount(2);

    const events = JSON.parse(
      (await fixture.getByRole('status', { name: 'Expansion data events', exact: true })
        .textContent())!
    );

    expect(events.map((event: { action: string }) => event.action))
      .toEqual(['sort', 'paginate', 'filter']);
    expect(events[2]).toEqual(
      {
        action: 'filter',
        pagination: { current: 1, pageSize: 3, total: 4 },
        ids: [0, 6, 2, 4]
      }
    );
  }
);

test(
  'selection and detail actions remain independent and collapsing unmounts snippet controls',
  async ({ page }) => {
    const fixture = page.locator('#expandable-table-fixture');
    const table = fixture.getByRole('table', { name: 'Expandable people', exact: true });

    await table.getByRole('button', { name: 'Раскрыть строку 0', exact: true }).click();
    await table.getByRole('checkbox', { name: 'Select expansion 0', exact: true }).check();
    await table.getByRole('textbox', { name: 'Note for 0', exact: true }).fill('Local input state');
    await table.getByRole('button', { name: 'Inspect detail 0', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Expansion inspected', exact: true }))
      .toHaveText('0');
    await expect(fixture.getByRole('status', { name: 'Expanded owner keys', exact: true }))
      .toHaveText('[0]');

    await table.getByRole('button', { name: 'Свернуть строку 0', exact: true }).click();
    await table.getByRole('button', { name: 'Раскрыть строку 0', exact: true }).click();

    await expect(table.getByRole('textbox', { name: 'Note for 0', exact: true }))
      .toHaveValue('Initial Aster');
    await expect(table.getByRole('checkbox', { name: 'Select expansion 0', exact: true }))
      .toBeChecked();
    await expect(fixture.getByRole('status', { name: 'Expansion selection events', exact: true }))
      .toHaveText('1');
    await expect(fixture.getByRole('status', { name: 'Expansion data events', exact: true }))
      .toHaveText('[]');
    await expect(fixture.getByRole('status', { name: 'Expansion submissions', exact: true }))
      .toHaveText('0');
  }
);

test(
  'Table preserves expanded keys between server pages and empty data without caching records',
  async ({ page }) => {
    const fixture = page.locator('#expandable-table-fixture');
    const table = fixture.getByRole('table', { name: 'Expandable people', exact: true });

    await table.getByRole('button', { name: 'Раскрыть строку 0', exact: true }).click();
    await fixture.getByRole('button', { name: 'Load another server page', exact: true }).click();

    await expect(table.locator('.ant-table-row')).toHaveCount(3);
    await expect(table.locator('.ant-table-expanded-row')).toHaveCount(0);

    await fixture.getByRole('navigation', { name: 'Expandable people pages', exact: true }).getByRole(
      'button',
      { name: 'Страница 5', exact: true }
    )
      .click();
    await table.getByRole('button', { name: 'Раскрыть строку 3', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Dahlia:0');
    await expect(fixture.getByRole('status', { name: 'Expanded owner keys', exact: true }))
      .toHaveText('[0,3]');

    await fixture.getByRole('button', { name: 'Restore expandable data', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Aster:0');

    await fixture.getByRole('button', { name: 'Empty expandable data', exact: true }).click();

    await expect(table.getByRole('cell', { name: 'Нет данных', exact: true })).toHaveAttribute(
      'colspan',
      '5'
    );
    await expect(fixture.getByRole('status', { name: 'Expanded owner keys', exact: true }))
      .toHaveText('[0,3]');

    await fixture.getByRole('button', { name: 'Restore expandable data', exact: true }).click();

    await expect(table.locator('.ant-table-expanded-row')).toContainText('Details Aster:0');

    const events = JSON.parse(
      (await fixture.getByRole('status', { name: 'Expansion events', exact: true })
        .textContent())!
    );

    expect(events.filter((event: { type: string }) => event.type === 'expand')).toEqual([
      { type: 'expand', expanded: true, key: 0, name: 'Aster', owner: [0] },
      { type: 'expand', expanded: true, key: 3, name: 'Dahlia', owner: [0, 3] }
    ]);

    const dataEvents = JSON.parse(
      (await fixture.getByRole('status', { name: 'Expansion data events', exact: true })
        .textContent())!
    );

    expect(dataEvents).toEqual(
      [
        {
          action: 'paginate',
          pagination: { current: 5, pageSize: 3, total: 30 },
          ids: [3, 4, 5]
        }
      ]
    );
  }
);

test(
  'expansion follows loading and inherited disabled state with an explicit override',
  async ({ page }) => {
    const fixture = page.locator('#expandable-table-fixture');
    const trigger = fixture.getByRole('button', { name: 'Раскрыть строку 0', exact: true });

    await fixture.getByLabel('Expandable table loading', { exact: true }).check();

    await expect(trigger).toBeDisabled();

    await fixture.getByLabel('Expandable table loading', { exact: true }).uncheck();
    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(trigger).toBeDisabled();
    await expect(
      page.getByRole('table', { name: 'Initial expansion', exact: true }).getByRole(
        'button',
        { name: 'Свернуть строку 0', exact: true }
      )
    )
      .toBeEnabled();

    await page.getByLabel('Disable all components', { exact: true }).uncheck();

    await expect(trigger).toBeEnabled();
    await expect(fixture.getByRole('status', { name: 'Expansion events', exact: true }))
      .toHaveText('[]');
  }
);

test(
  'expanded rows keep widths and fixed column offsets while their content stays in the scroll viewport',
  async ({ page }, testInfo) => {
    const fixture = page.locator('#expandable-table-fixture');
    const region = fixture.getByRole('region', { name: 'Expandable people', exact: true });
    const widths = await region.locator('thead th').evaluateAll(
      (cells) => cells.map((cell) => cell.getBoundingClientRect().width)
    );

    await region.getByRole('button', { name: 'Раскрыть строку 0', exact: true }).click();
    await expect.poll(
      () =>
        region.locator('thead th').evaluateAll(
          (cells, before) =>
            Math.max(
              ...cells.map(
                (cell, index) => Math.abs(cell.getBoundingClientRect().width - before[index])
              )
            ),
          widths
        )
    )
      .toBeLessThan(1.5);
    await region.evaluate((element) => { element.scrollTo({ left: 200, top: 40 }); });
    await expect.poll(() => region.evaluate((element) => {
      const cells = [...element.querySelectorAll('thead th')]
        .map((cell) => cell.getBoundingClientRect());
      const bounds = element.getBoundingClientRect();
      const detail = element.querySelector('.expanded-content')!.getBoundingClientRect();

      return Math.max(
        Math.abs(cells[0].left - bounds.left),
        Math.abs(cells[1].left - cells[0].right),
        Math.abs(cells[2].left - cells[1].right),
        Math.abs(cells[4].right - bounds.left - element.clientWidth),
        Math.abs(detail.left - bounds.left),
        Math.max(0, detail.width - element.clientWidth)
      );
    })).toBeLessThan(1.5);
    await region.screenshot({ path: testInfo.outputPath('expanded-table.png') });
    await fixture.getByLabel('Show expandable selection', { exact: true }).uncheck();

    await expect(region.locator('.ant-table-expanded-row td')).toHaveAttribute('colspan', '4');
    await expect(region.locator('thead th')).toHaveCount(4);

    await fixture.getByLabel('Pin expandable columns', { exact: true }).uncheck();

    await expect(region.locator('.table-fixed-cell')).toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Expansion data events', exact: true }))
      .toHaveText('[]');
  }
);

test(
  'expansion inherits locale, RTL, dark theme and compact sizing',
  async ({ page }, testInfo) => {
    const fixture = page.locator('#expandable-table-fixture');
    const table = fixture.getByRole('table', { name: 'Expandable people', exact: true });

    await page.getByLabel('English locale', { exact: true }).check();
    await page.getByLabel('Right to left', { exact: true }).check();
    await fixture.getByLabel('Dark expandable table', { exact: true }).check();
    await fixture.getByLabel('Compact expandable table', { exact: true }).check();

    await expect(table.getByRole('columnheader', { name: 'Details', exact: true })).toBeVisible();

    const trigger = table.getByRole('button', { name: 'Expand row 0', exact: true });

    await expect(trigger).toHaveCSS('background-color', 'rgb(20, 20, 20)');

    await trigger.click();

    await expect(table.getByRole('button', { name: 'Collapse row 0', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(table.locator('.expanded-content')).toHaveCSS('direction', 'rtl');
    await expect(table.locator('.expanded-content')).toHaveCSS('font-size', '12px');
    await expect(table.locator('.ant-table-expanded-row td')).toHaveCSS(
      'background-color',
      'rgba(255, 255, 255, 0.04)'
    );

    await fixture.getByRole('region', { name: 'Expandable people', exact: true })
      .evaluate((element) => { element.scrollLeft = -200; });
    await expect.poll(
      () =>
        table.locator('.expanded-content').evaluate(
          (element) =>
            Math.abs(
              element.getBoundingClientRect().right
              - element.closest('.ant-table-content')!
                .getBoundingClientRect().right
            )
        )
    )
      .toBeLessThan(1.5);
    await table.screenshot({ path: testInfo.outputPath('expanded-table-rtl-dark.png') });
  }
);

test.describe('mobile expanded table', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'keeps expanded controls visible while horizontally scrolling an unpinned table',
    async ({ page }) => {
      const fixture = page.locator('#expandable-table-fixture');
      const region = fixture.getByRole('region', { name: 'Expandable people', exact: true });

      await region.getByRole('button', { name: 'Раскрыть строку 0', exact: true }).click();

      await expect(region.locator('.ant-table-expanded-row td')).toHaveCSS('padding', '0px');

      await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
      await expect.poll(
        () =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      )
        .toBe(true);
      await expect.poll(() => region.locator('.expanded-content').evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const viewport = element.closest('.ant-table-content')!.getBoundingClientRect();

        return bounds.left >= viewport.left - 1 && bounds.right <= viewport.right + 1;
      })).toBe(true);
      await region.getByRole('textbox', { name: 'Note for 0', exact: true }).fill('Mobile note');
      await region.getByRole('button', { name: 'Inspect detail 0', exact: true }).click();

      await expect(fixture.getByRole('status', { name: 'Expansion inspected', exact: true }))
        .toHaveText('0');
    }
  );
});
