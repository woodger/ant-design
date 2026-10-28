import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=segmented');
  await expect(page.locator('#fixture-segmented')).toBeVisible();
});

test('Segmented selects typed values and keeps external changes silent and independent', async ({ page }) => {
  const root = page.getByRole('radiogroup', { name: 'Period', exact: true });
  await expect(root.getByRole('radio', { name: 'Zero', exact: true })).toBeChecked();
  await root.getByText('Weekly', { exact: true }).click();
  await expect(page.getByRole('status', { name: 'Segmented value', exact: true })).toHaveText('string:week');
  await root.getByText('Zero', { exact: true }).click();
  await expect(page.getByRole('status', { name: 'Segmented value', exact: true })).toHaveText('number:0');
  await page.getByRole('button', { name: 'Set weekly externally' }).click();
  await expect(root.getByRole('radio', { name: 'Weekly', exact: true })).toBeChecked();
  await expect(page.getByRole('status', { name: 'Segmented changes', exact: true })).toHaveText('2');
  await page.getByRole('button', { name: 'Set missing externally' }).click();
  await expect(root.locator('input:checked')).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Independent period' }).getByRole('radio', { name: 'Daily' })).toBeChecked();
});

test('Segmented cycles source order in RTL and both orientations while skipping disabled options', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  await page.getByLabel('Disabled weekly option').check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await root.getByRole('radio', { name: 'Zero', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('radio', { name: 'Monthly', exact: true })).toBeChecked();
  await expect(root.getByRole('radio', { name: 'Monthly', exact: true })).toBeFocused();
  await page.getByLabel('Vertical Segmented alias').check();
  await expect(root).toHaveAttribute('aria-orientation', 'vertical');
  await root.getByRole('radio', { name: 'Monthly', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(root.getByRole('radio', { name: 'Zero', exact: true })).toBeChecked();
  await page.getByRole('combobox', { name: 'Segmented orientation' }).selectOption('horizontal');
  await expect(root).toHaveAttribute('aria-orientation', 'horizontal');
  await page.getByLabel('Disabled Segmented', { exact: true }).check();
  await expect(root.locator('input:enabled')).toHaveCount(0);
});

test('Segmented retains keyed selections and model values across reordering removal and native reset', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  await root.getByText('Monthly', { exact: true }).click();
  const handle = await root.getByRole('radio', { name: 'Monthly' }).elementHandle();
  await page.getByLabel('Reverse Segmented options').check();
  expect(await root.getByRole('radio', { name: 'Monthly' }).evaluate((node, previous) => node === previous, handle)).toBe(true);
  await page.getByRole('button', { name: 'Reset Segmented form' }).click();
  await expect(root.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  await page.getByLabel('Remove monthly option').check();
  await expect(root.locator('input:checked')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Segmented value', exact: true })).toHaveText('string:month');
  await page.getByLabel('Remove monthly option').uncheck();
  await expect(root.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  const data = await page.getByRole('form', { name: 'Segmented form' }).evaluate(form => [...new FormData(form as HTMLFormElement).entries()]);
  expect(data).toEqual([['period', 'on']]);
});

test('Segmented applies sizes, round block appearance, semantic snippets and dark compact tokens', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  for (const [size, height] of [['small', 24], ['middle', 32], ['large', 40]] as const) {
    await page.getByRole('combobox', { name: 'Segmented size', exact: true }).selectOption(size);
    expect((await root.boundingBox())!.height).toBe(height);
  }
  await page.getByRole('combobox', { name: 'Segmented shape' }).selectOption('round');
  await expect(root).toHaveCSS('border-radius', '9999px');
  await page.getByLabel('Block Segmented').check();
  await expect(root).toHaveCSS('display', 'flex');
  await page.getByLabel('Rich Segmented labels').check();
  await page.getByLabel('Custom Segmented slots').check();
  await expect(root.locator('strong')).toHaveText('Weekly');
  await expect(root.locator('.custom-segmented-icon svg')).toBeVisible();
  await expect(root.locator('.custom-segmented-label').first()).toHaveCSS('font-style', 'italic');
  await page.getByLabel('Dark Segmented theme').check();
  await page.getByLabel('Compact Segmented theme').check();
  await page.getByRole('combobox', { name: 'Segmented size', exact: true }).selectOption('middle');
  expect((await root.boundingBox())!.height).toBe(28);
  await expect(root).toHaveCSS('background-color', 'rgb(0, 0, 0)');
});

test('Segmented follows upstream explicit disabled semantics and its gallery hydrates', async ({ page, request }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(page.locator('#fixture-segmented input:enabled')).toHaveCount(3);
  const response = await request.get('/ant-design');
  expect(await response.text()).toContain('id="segmented"');
  await page.goto('/ant-design#segmented');
  const section = page.locator('#segmented');
  await expect(section.locator('strong')).toHaveText('58');
  await section.getByText('Месяц', { exact: true }).click();
  await expect(section.locator('strong')).toHaveText('211');
});
