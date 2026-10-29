import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=theme');
});

test('compact spacing follows the pinned size map in Card Flex and Divider and updates reactively', async ({ page }) => {
  await expect(page.locator('#compact-spacing-card .ant-card-body')).toHaveCSS('padding', '16px');
  await expect(page.locator('#compact-spacing-flex')).toHaveCSS('column-gap', '4px');
  await expect(page.locator('#compact-spacing-divider')).toHaveCSS('margin-top', '16px');
  await page.getByLabel('Compact parent spacing', { exact: true }).uncheck();
  await expect(page.locator('#compact-spacing-card .ant-card-body')).toHaveCSS('padding', '24px');
  await expect(page.locator('#compact-spacing-flex')).toHaveCSS('column-gap', '8px');
  await expect(page.locator('#compact-spacing-divider')).toHaveCSS('margin-top', '24px');
});

test('nested spacing inherits compact mode, resets for explicit false and preserves inline token overrides', async ({ page }) => {
  await expect(page.locator('#inherited-spacing-card .ant-card-body')).toHaveCSS('padding', '16px');
  await expect(page.locator('#normal-spacing-card .ant-card-body')).toHaveCSS('padding', '24px');
  await expect(page.locator('#normal-spacing-flex')).toHaveCSS('column-gap', '8px');
  await expect(page.locator('#custom-spacing-card .ant-card-body')).toHaveCSS('padding', '30px');
});
