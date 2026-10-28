import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=divider');
  await expect(page.locator('#fixture-divider')).toBeVisible();
});

test('Divider retains native separator semantics, exposes its element and does not intercept focus', async ({ page }) => {
  const divider = page.getByRole('separator', { name: 'Sections' });
  await expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(divider).toContainText('Section');
  await expect(page.getByRole('status', { name: 'Divider native element' })).toHaveText('fixture-divider');
  await page.getByRole('button', { name: 'Before Divider' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After Divider' })).toBeFocused();
  await page.getByLabel('Divider text', { exact: true }).fill('');
  await expect(divider.locator('.ant-divider-inner-text')).toHaveCount(0);
  await expect(divider).toHaveClass(/ant-divider-rail/);
  await page.getByLabel('Divider text', { exact: true }).fill('0');
  await expect(divider.locator('.ant-divider-inner-text')).toHaveText('0');
  await page.getByLabel('Rich Divider title').check();
  await expect(divider.locator('strong')).toHaveText('0');
});

test('Divider changes line variants and hides vertical content without a horizontal border', async ({ page }) => {
  const divider = page.locator('#fixture-divider');
  const rail = divider.locator('.ant-divider-rail-start');
  for (const variant of ['solid', 'dashed', 'dotted']) {
    await page.getByLabel('Divider variant').selectOption(variant);
    await expect(rail).toHaveCSS('border-top-style', variant);
  }
  await page.getByLabel('Divider variant').selectOption('solid');
  await page.getByLabel('Dashed Divider alias').check();
  await expect(rail).toHaveCSS('border-top-style', 'dashed');
  await page.getByLabel('Divider orientation').selectOption('vertical');
  await expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  await expect(divider.locator('.ant-divider-inner-text')).toHaveCount(0);
  await expect(divider).toHaveCSS('border-top-width', '0px');
  await expect(divider).toHaveCSS('border-left-style', 'dashed');
  await expect(divider).toHaveCSS('margin-top', '0px');
  await page.getByLabel('Right to left', { exact: true }).check();
  await expect(divider).toHaveCSS('border-right-style', 'dashed');
});

test('Divider preserves logical and physical placements in both directions', async ({ page }) => {
  const divider = page.locator('#fixture-divider');
  const title = divider.locator('.ant-divider-inner-text');
  for (const rtl of [false, true]) {
    await page.getByLabel('Right to left', { exact: true }).setChecked(rtl);
    for (const placement of ['start', 'end', 'left', 'right', 'center']) {
      await page.getByLabel('Divider placement').selectOption(placement);
      const logical = placement === 'left' ? rtl ? 'end' : 'start' : placement === 'right' ? rtl ? 'start' : 'end' : placement;
      await expect(divider).toHaveClass(new RegExp(`ant-divider-with-text-${logical}`));
      const bounds = (await divider.boundingBox())!;
      const content = (await title.boundingBox())!;
      const physicalLeft = logical === 'start' ? !rtl : logical === 'end' ? rtl : undefined;
      if (physicalLeft === true) expect(content.x + content.width / 2).toBeLessThan(bounds.x + bounds.width / 2);
      if (physicalLeft === false) expect(content.x + content.width / 2).toBeGreaterThan(bounds.x + bounds.width / 2);
      if (logical === 'center') expect(Math.abs(content.x + content.width / 2 - bounds.x - bounds.width / 2)).toBeLessThan(1);
    }
  }
});

test('Divider inherits sizes and applies plain and semantic styles with margin compatibility', async ({ page }) => {
  const divider = page.locator('#fixture-divider');
  const title = divider.locator('.ant-divider-inner-text');
  for (const [size, margin] of [['small', '8px'], ['middle', '16px'], ['large', '16px']]) {
    await page.getByLabel('Divider context size').selectOption(size);
    await expect(divider).toHaveCSS('margin-top', margin);
  }
  await page.getByLabel('Divider text', { exact: true }).fill('');
  await expect(divider).toHaveCSS('margin-top', '24px');
  await page.getByRole('combobox', { name: 'Divider size', exact: true }).selectOption('small');
  await expect(divider).toHaveCSS('margin-top', '8px');
  await page.getByLabel('Divider text', { exact: true }).fill('Title');
  await page.getByLabel('Plain Divider title').check();
  await expect(divider).toHaveCSS('font-weight', '400');
  await page.getByLabel('Divider placement').selectOption('start');
  await page.getByLabel('Divider legacy margin').fill('10');
  await expect(title).toHaveCSS('margin-inline-start', '10px');
  await expect(divider.locator('.ant-divider-rail-start')).toHaveCSS('width', '0px');
  await page.getByLabel('Divider legacy margin').fill('2em');
  await expect(title).toHaveCSS('margin-inline-start', '28px');
  await page.getByLabel('Custom Divider slots').check();
  await expect(divider).toHaveClass(/custom-divider-start/);
  await expect(title).toHaveCSS('font-style', 'italic');
  await expect(divider.locator('.custom-divider-rail').first()).toHaveCSS('border-top-color', 'rgb(0, 128, 0)');
});

test('Divider follows dark compact themes and remains usable on a narrow screen when disabled', async ({ page }) => {
  const divider = page.locator('#fixture-divider');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByLabel('Dark Divider theme').check();
  await page.getByLabel('Compact Divider theme').check();
  await page.getByLabel('Disable all components', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await expect(divider).toHaveCSS('border-top-color', 'rgba(253, 253, 253, 0.12)');
  await expect(divider).toHaveAttribute('dir', 'rtl');
  const bounds = (await divider.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(360);
  await expect(divider).toContainText('Section');
});
