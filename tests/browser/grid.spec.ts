import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=grid');

  await expect(page.locator('#fixture-row')).toBeVisible();
});

test(
  'Grid preserves 24-column widths gutters CSS units and nested row contexts',
  async ({ page }) => {
    const row = page.locator('#fixture-row');
    const first = page.locator('#grid-first');

    expect((await first.boundingBox())!.width).toBeCloseTo((await row.boundingBox())!.width / 2, 0);
    await expect(row).toHaveCSS('margin-inline-start', '-8px');
    await expect(row).toHaveCSS('row-gap', '8px');
    await expect(first).toHaveCSS('padding-inline-start', '8px');

    await page.getByLabel('Nested grid').check();

    await expect(page.locator('#nested-row')).toHaveCSS('margin-inline-start', '-4px');
    await expect(page.locator('#nested-column')).toHaveCSS('padding-inline-start', '4px');
    await expect(first).toHaveCSS('padding-inline-start', '8px');
    await expect(page.locator('#grid-fixed')).toHaveCSS('flex', '0 0 120px');
    await expect(page.locator('#grid-grow')).toHaveCSS('min-width', '0px');
    await expect(page.locator('#grid-fixed')).toHaveCSS('padding-inline-start', '16px');
  }
);

test(
  'Grid responds at all default media boundaries including xxxl and restores responsive zero values',
  async ({ page }) => {
    await page.getByLabel('Responsive grid', { exact: true }).check();
    for (const [width, divisor, gap] of [[500, 1, 8], [800, 3, 24], [1920, 4, 48]] as const) {
      await page.setViewportSize({ width, height: 800 });
      await expect(page.locator('#fixture-row')).toHaveCSS('margin-inline-start', `${gap / -2}px`);
      const row = (await page.locator('#fixture-row').boundingBox())!;
      expect((await page.locator('#grid-first').boundingBox())!.width).toBeCloseTo(
        row.width / divisor,
        0
      );
    }

    await expect(page.locator('#grid-second')).toHaveCSS('order', '0');
    await expect(page.locator('#grid-second')).toHaveCSS('margin-inline-start', '0px');

    await page.getByLabel('Hide first grid column').check();

    await expect(page.locator('#grid-first')).toBeHidden();

    await page.setViewportSize({ width: 575, height: 800 });

    await expect(page.getByRole('status', { name: 'Grid screens' })).toContainText('"xs":true');

    await page.setViewportSize({ width: 576, height: 800 });

    await expect(page.getByRole('status', { name: 'Grid screens' })).toContainText('"xs":false');

    for (const [width, key, matches] of [
      [767, 'md', false],
      [768, 'md', true],
      [991, 'lg', false],
      [992, 'lg', true],
      [1199, 'xl', false],
      [1200, 'xl', true],
      [1599, 'xxl', false],
      [1600, 'xxl', true],
      [1919, 'xxxl', false],
      [1920, 'xxxl', true]
    ] as const) {
      await page.setViewportSize({ width, height: 800 });
      await expect(page.getByRole('status', { name: 'Grid screens' }))
        .toContainText(`"${key}":${matches}`);
    }
  }
);

test(
  'Grid inherits RTL without changing DOM order and keeps non-wrapping columns',
  async ({ page }) => {
    await page.getByLabel('Right to left', { exact: true }).check();

    const first = (await page.locator('#grid-first').boundingBox())!;
    const second = (await page.locator('#grid-second').boundingBox())!;

    expect(first.x).toBeGreaterThan(second.x);
    await expect(page.locator('#fixture-row')).toHaveAttribute('dir', 'rtl');

    await page.getByLabel('Wrap grid').uncheck();

    await expect(page.locator('#fixture-row')).toHaveCSS('flex-wrap', 'nowrap');

    await page.getByLabel('Mount grid').uncheck();

    await expect(page.locator('#fixture-row')).toHaveCount(0);
  }
);
