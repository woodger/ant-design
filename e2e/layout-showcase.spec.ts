import { test, expect } from './test';

test('Divider and Flex examples render on the server and retain their controls after hydration', async ({ page, request }) => {
  const response = await request.get('/ant-design');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('id="divider"');
  expect(html).toContain('ant-divider-with-text-start');
  expect(html).toContain('id="flex"');
  expect(html).toContain('ant-flex-gap-small');

  await page.goto('/ant-design#flex');
  const flex = page.locator('#flex');
  await expect(flex.locator('.ant-flex > button')).toHaveCount(3);
  await flex.getByRole('checkbox', { name: 'Вертикальная компоновка' }).check();
  await expect(flex.locator('.ant-flex')).toHaveCSS('flex-direction', 'column');
  await flex.getByRole('combobox', { name: 'Интервал' }).selectOption('large');
  await expect(flex.locator('.ant-flex')).toHaveCSS('gap', '24px');
  const divider = page.locator('#divider');
  await divider.getByRole('combobox', { name: 'Подпись' }).selectOption('end');
  await divider.getByRole('combobox', { name: 'Линия' }).selectOption('dotted');
  await expect(divider.locator('.ant-divider-with-text')).toHaveClass(/ant-divider-with-text-end/);
  await expect(divider.locator('.ant-divider-rail-start')).toHaveCSS('border-top-style', 'dotted');
});
