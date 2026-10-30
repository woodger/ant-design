import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=flex');

  await expect(page.locator('#fixture-flex')).toBeVisible();
});

test(
  'Flex preserves direct children, native events and focus order while exposing its selected root',
  async ({ page }) => {
    const root = page.locator('#fixture-flex');

    await expect(root.locator(':scope > button')).toHaveCount(3);
    await expect(root).toHaveCSS('font-size', '21px');
    await expect(root).toHaveClass(/custom-flex outer-flex/);

    await page.getByRole('button', { name: 'Before Flex' }).focus();
    for (const name of ['First Flex item', 'Second Flex item', 'Third Flex item', 'After Flex']) {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name })).toBeFocused();
    }
    await page.getByRole('button', { name: 'First Flex item' }).click();

    await expect(page.getByRole('status', { name: 'Flex clicks', exact: true })).toHaveText('1');

    for (const component of ['section', 'span', 'div']) {
      await page.getByRole('combobox', { name: 'Flex component', exact: true })
        .selectOption(component);
      await expect(page.getByRole('status', { name: 'Flex native element', exact: true }))
        .toHaveText(component.toUpperCase());
      await expect(root.locator(':scope > button')).toHaveCount(3);
    }
    await page.getByLabel('Empty Flex', { exact: true }).check();

    await expect(root).toHaveCSS('display', 'none');

    await page.getByLabel('Empty Flex', { exact: true }).uncheck();

    await expect(root).toHaveCSS('display', 'flex');
  }
);

test(
  'Flex gives orientation precedence over vertical and uses default vertical stretch',
  async ({ page }) => {
    const root = page.locator('#fixture-flex');

    await page.getByLabel('Vertical Flex alias').check();

    await expect(root).toHaveCSS('flex-direction', 'column');
    await expect(root).toHaveCSS('align-items', 'stretch');

    await page.getByRole('combobox', { name: 'Flex orientation', exact: true })
      .selectOption('horizontal');

    await expect(root).toHaveCSS('flex-direction', 'row');

    await page.getByRole('combobox', { name: 'Flex orientation', exact: true })
      .selectOption('vertical');
    await page.getByRole('combobox', { name: 'Flex align', exact: true }).selectOption('center');

    await expect(root).toHaveCSS('align-items', 'center');

    await page.getByRole('combobox', { name: 'Flex justify', exact: true })
      .selectOption('space-between');

    await expect(root).toHaveCSS('justify-content', 'space-between');
  }
);

test(
  'Flex preserves preset, numeric, zero and CSS gaps and the flex shorthand',
  async ({ page }) => {
    const root = page.locator('#fixture-flex');
    const input = page.getByRole('textbox', { name: 'Flex gap', exact: true });

    for (const [gap, expected] of [
      ['small', '8px'],
      ['middle', '16px'],
      ['medium', '16px'],
      ['large', '24px'],
      ['2px 12px', '2px 12px']
    ]) {
      await input.fill(gap);
      await expect(root).toHaveCSS('gap', expected);
    }
    await page.getByLabel('Numeric Flex gap').check();
    await input.fill('13');

    await expect(root).toHaveCSS('gap', '13px');

    const first = (await root.getByRole('button').nth(0).boundingBox())!;
    const second = (await root.getByRole('button').nth(1).boundingBox())!;

    expect(second.x - first.x - first.width).toBeCloseTo(13, 0);

    await input.fill('0');

    await expect(root).toHaveCSS('gap', '0px');

    await page.getByRole('textbox', { name: 'Flex shorthand' }).fill('0 1 auto');

    await expect(root).toHaveCSS('flex', '0 1 auto');
  }
);

test(
  'Flex lets inline style override preset gaps while custom gaps override inline style',
  async ({ page }) => {
    const root = page.locator('#fixture-flex');
    const gap = page.getByRole('textbox', { name: 'Flex gap', exact: true });

    await page.getByRole('textbox', { name: 'Flex inline gap', exact: true }).fill('99px');

    await expect(root).toHaveCSS('gap', '99px');

    await page.getByLabel('Numeric Flex gap').check();
    await gap.fill('12');

    await expect(root).toHaveCSS('gap', '12px');

    await page.getByLabel('Numeric Flex gap').uncheck();
    await gap.fill('2px 12px');

    await expect(root).toHaveCSS('gap', '2px 12px');
  }
);

test(
  'Flex wraps on narrow screens and preserves RTL visual order without changing native tab order',
  async ({ page }) => {
    const root = page.locator('#fixture-flex');

    await page.setViewportSize({ width: 280, height: 800 });
    await page.getByRole('combobox', { name: 'Flex wrap', exact: true }).selectOption('true');

    await expect(root).toHaveCSS('flex-wrap', 'wrap');

    const first = (await root.getByRole('button').first().boundingBox())!;
    const third = (await root.getByRole('button').last().boundingBox())!;

    expect(third.y).toBeGreaterThan(first.y);

    for (const wrap of ['nowrap', 'wrap-reverse', 'false']) {
      await page.getByRole('combobox', { name: 'Flex wrap', exact: true }).selectOption(wrap);
      await expect(root).toHaveCSS('flex-wrap', wrap === 'false' ? 'nowrap' : wrap);
    }
    await page.setViewportSize({ width: 800, height: 800 });
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Dark Flex theme').check();
    await page.getByLabel('Compact Flex theme').check();
    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(root).toHaveCSS('direction', 'rtl');

    const rtlFirst = (await root.getByRole('button').first().boundingBox())!;
    const rtlSecond = (await root.getByRole('button').nth(1).boundingBox())!;

    expect(rtlFirst.x).toBeGreaterThan(rtlSecond.x);

    await root.getByRole('button').first().focus();
    await page.keyboard.press('Tab');

    await expect(root.getByRole('button').nth(1)).toBeFocused();
  }
);
