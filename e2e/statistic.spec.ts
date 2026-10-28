import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=statistic');
  await expect(page.locator('#fixture-statistic')).toBeVisible();
});

test('Statistic preserves string precision and separators without rounding or numeric coercion', async ({ page }) => {
  const root = page.locator('#fixture-statistic');
  const value = root.locator('.ant-statistic-content-value');
  await expect(value).toHaveText('112,893.129');
  await page.getByRole('spinbutton', { name: 'Statistic precision' }).fill('2');
  await expect(value).toHaveText('112,893.12');
  await page.getByRole('textbox', { name: 'Statistic value', exact: true }).fill('12345678901234567890.567');
  await expect(value).toHaveText('12,345,678,901,234,567,890.56');
  await page.getByRole('textbox', { name: 'Statistic group separator' }).fill(' ');
  await page.getByRole('textbox', { name: 'Statistic decimal separator' }).fill(',');
  await expect(value).toHaveText('12 345 678 901 234 567 890,56');
  await page.getByRole('textbox', { name: 'Statistic value', exact: true }).fill('-');
  await expect(value).toHaveText('-');
  await expect(value.locator('.ant-statistic-content-value-int')).toHaveCount(0);
});

test('Statistic supports snippets formatters valueRender and semantic styles without changing native focus order', async ({ page }) => {
  const root = page.locator('#fixture-statistic');
  await expect(root).toHaveAttribute('data-fixture', 'statistic');
  await expect(page.getByRole('status', { name: 'Statistic native element' })).toHaveText('fixture-statistic');
  await page.getByRole('button', { name: 'Before Statistic' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After Statistic' })).toBeFocused();
  await page.getByLabel('Rich Statistic title').check();
  await expect(root.locator('.ant-statistic-title strong')).toHaveText('Active users');
  await page.getByRole('combobox', { name: 'Statistic formatter' }).selectOption('text');
  await expect(root.locator('.ant-statistic-content-value')).toHaveText('Custom 112893.129');
  await page.getByRole('combobox', { name: 'Statistic formatter' }).selectOption('rich');
  await expect(root.locator('.ant-statistic-content-value strong')).toHaveText('Custom 112893.129');
  await page.getByLabel('Wrapped Statistic value').check();
  await expect(root.locator('mark > .ant-statistic-content-value')).toBeVisible();
  await page.getByLabel('Custom Statistic slots').check();
  await expect(root).toHaveClass(/metric-ready/);
  await expect(root.locator('.ant-statistic-content')).toHaveCSS('font-weight', '600');
  await expect(root.locator('.metric-value')).toHaveCSS('color', 'rgb(0, 128, 0)');
});

test('Statistic keeps its title and outside focus while loading and restores the latest value', async ({ page }) => {
  const root = page.locator('#fixture-statistic');
  await page.getByLabel('Loading Statistic').check();
  await expect(root.locator('.ant-statistic-content')).toHaveCount(0);
  await expect(root.locator('.ant-skeleton-active')).toBeVisible();
  await expect(root.locator('.ant-statistic-title')).toHaveText('Active users');
  await page.getByRole('textbox', { name: 'Statistic value', exact: true }).fill('42');
  await page.getByLabel('Loading Statistic').uncheck();
  await expect(page.getByLabel('Loading Statistic')).toBeFocused();
  await expect(root.locator('.ant-statistic-content-value')).toHaveText('42');
  await expect(root.locator('.ant-skeleton')).toHaveCount(0);
});

test('Statistic follows dark compact RTL themes with an LTR value and logical unit spacing', async ({ page }) => {
  const root = page.locator('#fixture-statistic');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByLabel('Dark Statistic theme').check();
  await page.getByLabel('Compact Statistic theme').check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(root).toHaveAttribute('dir', 'rtl');
  await expect(root.locator('.ant-statistic-content-value')).toHaveCSS('direction', 'ltr');
  await expect(root.locator('.ant-statistic-title')).toHaveCSS('font-size', '12px');
  await expect(root.locator('.ant-statistic-content')).toHaveCSS('font-size', '20px');
  await expect(root.locator('.ant-statistic-content')).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await expect(root.locator('.ant-statistic-content-suffix')).toHaveCSS('margin-inline-start', '4px');
  const bounds = (await root.boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(360);
});

test('Statistic gallery renders on the server and updates after hydration', async ({ page, request }) => {
  const response = await request.get('/ant-design');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('id="statistic"');
  await page.goto('/ant-design#statistic');
  const section = page.locator('#statistic');
  const values = section.locator('.ant-statistic-content-value');
  await expect(values).toHaveText(['112,893', '123,456.78', '93']);
  await section.getByRole('button', { name: 'Добавить участника', exact: true }).click();
  await expect(values.first()).toHaveText('112,894');
  await section.getByRole('button', { name: 'Показать загрузку', exact: true }).click();
  await expect(section.locator('.ant-skeleton')).toHaveCount(3);
  await section.getByRole('button', { name: 'Показать значения', exact: true }).click();
  await expect(values).toHaveText(['112,894', '123,456.78', '93']);
});
