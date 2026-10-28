import { test, expect } from './test';

test('production pages reference an available favicon without browser errors', async ({ page }) => {
  await page.goto('/ant-design');
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('type', 'image/svg+xml');
  const href = await icon.getAttribute('href');
  const response = await page.request.get(new URL(href!, page.url()).href);

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  expect(await response.text()).toContain('<svg');
});
