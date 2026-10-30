import type { Locator } from '@playwright/test';
import { test, expect } from './test';

async function expectPinnedGeometry(region: Locator) {
  await expect.poll(() => region.evaluate((element) => {
    const table = element.querySelector('table')!;
    const bounds = element.getBoundingClientRect();
    const left = bounds.left + element.clientLeft;
    const right = left + element.clientWidth;
    const rtl = getComputedStyle(element).direction === 'rtl';
    const start = [
      ...table.querySelectorAll<HTMLTableCellElement>('thead .ant-table-cell-fix-start')
    ]
      .map((cell) => cell.getBoundingClientRect());
    const end = [...table.querySelectorAll<HTMLTableCellElement>('thead .ant-table-cell-fix-end')]
      .reverse()
      .map((cell) => cell.getBoundingClientRect());
    const errors: number[] = [];
    let startEdge = rtl ? right : left;
    let endEdge = rtl ? left : right;

    for (const cell of start) {
      errors.push(Math.abs((rtl ? cell.right : cell.left) - startEdge));
      startEdge = rtl ? cell.left : cell.right;
    }
    for (const cell of end) {
      errors.push(Math.abs((rtl ? cell.left : cell.right) - endEdge));
      endEdge = rtl ? cell.right : cell.left;
    }
    const headers = [...table.tHead!.rows[0].cells];
    const cells = [...table.tBodies[0].rows[0].cells];
    headers.forEach((header, index) => {
      const head = header.getBoundingClientRect();
      const body = cells[index].getBoundingClientRect();
      errors.push(Math.abs(head.left - body.left), Math.abs(head.width - body.width));
    });

    return Math.max(...errors);
  })).toBeLessThan(1.5);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=table-fixed');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'ordinary Table preserves page scrolling when fixed layout is not requested',
  async ({ page }) => {
    await page.goto('/?fixture=table');

    const region = page.locator('#table-fixture').getByRole(
      'region',
      { name: 'People', exact: true }
    );

    await expect(region).toHaveCSS('overscroll-behavior-y', 'auto');
    await expect(region).toHaveCSS('isolation', 'auto');

    await region.scrollIntoViewIfNeeded();
    // Wheel использует compositor hit test после отрисовки нового положения.
    await page.evaluate(
      () =>
        new Promise<void>(
          (resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );

    const bounds = (await region.boundingBox())!;
    const before = await page.evaluate(() => window.scrollY);

    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.wheel(0, 350);

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  }
);

test(
  'Table pins one native header and multiple columns through two-dimensional scrolling',
  async ({ page }, testInfo) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });
    const table = region.getByRole('table', { name: 'Pinned people', exact: true });

    await fixture.getByLabel('Pin team column', { exact: true }).check();

    await expect(table).toHaveCount(1);
    await expect(table.locator('thead')).toHaveCount(1);
    await expect(table.locator('tbody tr')).toHaveCount(24);

    const notes = table.getByRole('columnheader', { name: 'Scrolling notes', exact: true });
    const originalX = (await notes.boundingBox())!.x;

    await region.evaluate((element) => { element.scrollTo({ left: 350, top: 300 }); });

    await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBe(300);
    await expect.poll(async () => (await notes.boundingBox())!.x).toBeLessThan(originalX - 300);
    await expectPinnedGeometry(region);
    await expect.poll(
      () =>
        region.evaluate(
          (element) =>
            Math.abs(
              element.querySelector('th')!.getBoundingClientRect().top
              - element
                .getBoundingClientRect().top
            )
        )
    )
      .toBeLessThan(1.5);

    await expect(fixture.getByRole('status', { name: 'Fixed table events', exact: true }))
      .toHaveText('[]');
    await expect(fixture.getByRole('status', { name: 'Fixed table selections', exact: true }))
      .toHaveText('0');

    await region.screenshot({ path: testInfo.outputPath('fixed-table.png') });
  }
);

test('Table pins logical start and end correctly after switching to RTL', async ({ page }) => {
  const fixture = page.locator('#fixed-table-fixture');
  const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });

  await page.getByLabel('Right to left', { exact: true }).check();
  await fixture.getByLabel('Pin team column', { exact: true }).check();
  await region.evaluate((element) => { element.scrollTo({ left: -350, top: 300 }); });

  await expect(region).toHaveCSS('direction', 'rtl');

  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeLessThan(-300);
  await expectPinnedGeometry(region);
  await page.getByLabel('Right to left', { exact: true }).uncheck();
  await region.evaluate((element) => { element.scrollLeft = 350; });
  await expectPinnedGeometry(region);
});

test(
  'Table remeasures CSS widths and removed columns without emitting data changes',
  async ({ page }) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });
    const name = region.getByRole('columnheader', { name: 'Pinned name', exact: true });

    await fixture.getByLabel('Pin team column', { exact: true }).check();

    const width = (await name.boundingBox())!.width;

    await fixture.getByRole('button', { name: 'Widen pinned name', exact: true }).click();
    await expect.poll(async () => (await name.boundingBox())!.width).toBeGreaterThan(width);
    await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await expectPinnedGeometry(region);
    await fixture.getByLabel('Hide pinned name', { exact: true }).check();

    await expect(name).toHaveCount(0);

    await expectPinnedGeometry(region);
    await fixture.getByLabel('Pin selection column', { exact: true }).uncheck();
    await expectPinnedGeometry(region);
    await fixture.getByLabel('Pin data columns', { exact: true }).uncheck();

    await expect(region.locator('.table-fixed-cell')).toHaveCount(0);
    await expect(region.locator('tbody tr > td').first()).toHaveCSS('position', 'relative');

    await region.evaluate((element) => { element.scrollLeft = 0; });

    const originalX = (await region.locator('tbody tr > td').first().boundingBox())!.x;

    await region.evaluate((element) => { element.scrollLeft = 200; });
    await expect.poll(async () => (await region.locator('tbody tr > td').first().boundingBox())!.x)
      .toBeLessThan(originalX - 100);

    await expect(fixture.getByRole('status', { name: 'Fixed table events', exact: true }))
      .toHaveText('[]');
  }
);

test(
  'fixed Table keeps sorting, filters, selection and snippet actions usable above scrolled cells',
  async ({ page }) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });
    const table = region.getByRole('table');

    await fixture.getByLabel('Pin team column', { exact: true }).check();
    await region.evaluate((element) => { element.scrollTo({ left: 350, top: 300 }); });
    await table.getByRole('button', { name: 'Pinned score', exact: true }).click();

    await expect(table.locator('tbody tr > td:nth-child(2)').first()).toHaveText('Pinned 24');

    await table.getByRole('button', { name: 'Фильтр: Pinned team', exact: true }).click();

    const menu = page.getByRole('dialog', { name: 'Фильтр: Pinned team', exact: true });

    await expect(menu.getByRole('checkbox', { name: 'East', exact: true })).toBeFocused();

    const menuLeft = (await menu.boundingBox())!.x;

    await fixture.getByRole('button', { name: 'Widen pinned name', exact: true })
      .dispatchEvent('click');

    await expect(menu).toBeVisible();

    await expect.poll(async () => (await menu.boundingBox())!.x).toBeGreaterThan(menuLeft + 50);
    await region.evaluate((element) => { element.scrollTo({ left: 280, top: 250 }); });

    await expect(menu).toBeVisible();

    await menu.getByRole('checkbox', { name: 'East', exact: true }).check();
    await menu.getByRole('button', { name: 'Применить', exact: true }).click();

    await expect(table.locator('tbody tr')).toHaveCount(12);

    await table.getByRole('checkbox', { name: 'Select pinned 12', exact: true }).check();
    await table.getByRole('button', { name: 'Inspect 12', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Fixed selected keys', exact: true }))
      .toHaveText('[12]');
    await expect(fixture.getByRole('status', { name: 'Fixed inspected key', exact: true }))
      .toHaveText('12');
    await expect(fixture.getByRole('status', { name: 'Fixed table selections', exact: true }))
      .toHaveText('1');

    const events = JSON.parse(
      (await fixture.getByRole('status', { name: 'Fixed table events', exact: true })
        .textContent())!
    );

    expect(events.map((event: { action: string }) => event.action)).toEqual(['sort', 'filter']);
    expect(events[1]).toMatchObject(
      {
        filters: { team: ['East'] },
        pagination: { current: 1, pageSize: 6, total: 12 },
        ids: [24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2]
      }
    );
  }
);

test(
  'fixed Table preserves server page data and external totals when sorting and paginating',
  async ({ page }) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });

    await fixture.getByLabel('Fixed table server mode', { exact: true }).check();
    await fixture.getByLabel('Paginate fixed table', { exact: true }).check();
    await region.evaluate((element) => { element.scrollTo({ left: 350, top: 200 }); });
    await region.getByRole('button', { name: 'Pinned score', exact: true }).click();
    await fixture.getByRole('navigation', { name: 'Pinned people pages', exact: true }).getByRole(
      'button',
      { name: 'Страница 4', exact: true }
    )
      .click();

    await expect(region.locator('tbody tr')).toHaveCount(24);
    await expect(region.locator('tbody tr > td:nth-child(2)').first()).toHaveText('Pinned 1');

    await expectPinnedGeometry(region);

    const events = JSON.parse(
      (await fixture.getByRole('status', { name: 'Fixed table events', exact: true })
        .textContent())!
    );

    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject(
      {
        action: 'paginate',
        pagination: { current: 4, pageSize: 6, total: 120 },
        sorter: { columnKey: 'score', order: 'ascend' }
      }
    );
    expect(events[1].ids).toEqual(Array.from({ length: 24 }, (_, index) => index + 1));
  }
);

test(
  'keyboard focus reveals ordinary cell controls between pinned columns and below the header',
  async ({ page }) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });

    await region.evaluate(
      (element) => { element.scrollTo({ left: element.scrollWidth, top: 300 }); }
    );
    await region.getByRole('checkbox', { name: 'Select pinned 1', exact: true }).focus();
    await page.keyboard.press('Tab');

    const edit = region.getByRole('button', { name: 'Edit 1', exact: true });

    await expect(edit).toBeFocused();

    await expect.poll(() => region.evaluate((element) => {
      const edit = element.querySelector('tbody tr button')!.getBoundingClientRect();
      const name = element.querySelector('thead th:nth-child(2)')!.getBoundingClientRect();
      const score = element.querySelector('thead th:nth-child(5)')!.getBoundingClientRect();

      return Math.min(edit.left - name.right, score.left - edit.right, edit.top - name.bottom);
    })).toBeGreaterThanOrEqual(-1);
    await page.keyboard.press('Enter');

    await expect(fixture.getByRole('status', { name: 'Fixed inspected key', exact: true }))
      .toHaveText('1');
  }
);

test(
  'fixed Table retains opaque theme backgrounds for normal, sorted and selected cells',
  async ({ page }, testInfo) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });
    const header = region.getByRole('columnheader', { name: 'Pinned name', exact: true });
    const normal = region.locator('tbody tr > td:nth-child(2)').first();

    await region.getByRole('checkbox', { name: 'Select pinned 1', exact: true }).check();

    await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(header).toHaveCSS(
      'background-image',
      'linear-gradient(rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02))'
    );
    await expect(normal).toHaveCSS(
      'background-image',
      'linear-gradient(rgb(230, 244, 255), rgb(230, 244, 255))'
    );

    await fixture.getByLabel('Dark pinned table', { exact: true }).check();

    await expect(header).toHaveCSS('background-color', 'rgb(20, 20, 20)');
    await expect(header).toHaveCSS(
      'background-image',
      'linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04))'
    );
    await expect(normal).toHaveCSS('background-color', 'rgb(20, 20, 20)');

    await region.getByRole('button', { name: 'Pinned score', exact: true }).click();
    await region.evaluate((element) => { element.scrollTo({ left: 350, top: 300 }); });
    await expectPinnedGeometry(region);
    await region.screenshot({ path: testInfo.outputPath('fixed-table-dark.png') });
  }
);

test(
  'fixed Table handles empty/loading states, header removal and observer cleanup on remount',
  async ({ page }) => {
    const fixture = page.locator('#fixed-table-fixture');
    const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });

    await fixture.getByLabel('Empty fixed table', { exact: true }).check();

    await expect(region.getByRole('cell', { name: 'Нет данных', exact: true })).toHaveAttribute(
      'colspan',
      '6'
    );

    await fixture.getByLabel('Fixed table loading', { exact: true }).check();

    await expect(region.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    await expect(region.getByRole('button', { name: 'Pinned score', exact: true })).toBeDisabled();
    await expect(region.getByRole('button', { name: 'Фильтр: Pinned team', exact: true }))
      .toBeDisabled();

    await fixture.getByLabel('Mount fixed table', { exact: true }).uncheck();

    await expect(region).toHaveCount(0);

    await fixture.getByLabel('Empty fixed table', { exact: true }).uncheck();
    await fixture.getByLabel('Fixed table loading', { exact: true }).uncheck();
    await fixture.getByLabel('Mount fixed table', { exact: true }).check();
    await region.evaluate((element) => { element.scrollTo({ left: 350, top: 300 }); });
    await expectPinnedGeometry(region);
    await fixture.getByLabel('Pin table header', { exact: true }).uncheck();

    await expect(region.getByRole('columnheader', { name: 'Pinned name', exact: true })).toHaveCSS(
      'position',
      'sticky'
    );
    await expect(region.getByRole('columnheader', { name: 'Scrolling notes', exact: true })).toHaveCSS(
      'position',
      'relative'
    );
    await expect(region).toHaveCSS('max-height', 'none');
    await expect(fixture.getByRole('status', { name: 'Fixed table events', exact: true }))
      .toHaveText('[]');
  }
);

test.describe('narrow fixed table', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'falls back to horizontal scrolling when pinned columns do not fit and restores pinning after resize',
    async ({ page }) => {
      const fixture = page.locator('#fixed-table-fixture');
      const region = fixture.getByRole('region', { name: 'Pinned people', exact: true });

      await expect.poll(
        () =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      )
        .toBe(true);

      await expect(region.locator('tbody tr > td').first()).toHaveCSS('position', 'relative');

      await region.focus();
      await region.press('ArrowRight');
      await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      await region.evaluate((element) => { element.scrollTop = 200; });
      await expect.poll(
        () =>
          region.evaluate(
            (element) =>
              Math.abs(
                element.querySelector('th')!.getBoundingClientRect().top
                - element
                  .getBoundingClientRect().top
              )
          )
      )
        .toBeLessThan(1.5);
      await page.setViewportSize({ width: 1280, height: 900 });
      await region.evaluate((element) => { element.scrollLeft = 350; });

      await expect(region.locator('tbody tr > td').first()).toHaveCSS('position', 'sticky');

      await expectPinnedGeometry(region);
    }
  );
});
