import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=layout');
  await expect(page.locator('#fixture-sider')).toBeVisible();
});

test('Layout uses native parts and detects Sider registration without leaking through nested layouts', async ({ page }) => {
  const root = page.locator('#fixture-layout');
  await expect(root).toHaveClass(/ant-layout-has-sider/);
  await expect(page.locator('#nested-layout')).not.toHaveClass(/ant-layout-has-sider/);
  expect(await page.locator('#fixture-header').evaluate(node => node.tagName)).toBe('HEADER');
  expect(await page.locator('#fixture-content').evaluate(node => node.tagName)).toBe('MAIN');
  expect(await page.locator('#fixture-footer').evaluate(node => node.tagName)).toBe('FOOTER');
  await page.locator('#nested-layout').evaluate(node => (node as HTMLElement).style.setProperty('--ant-layout-header-height', '96px'));
  await expect(page.locator('#fixture-header')).toHaveCSS('height', '96px');
  await page.locator('#nested-layout').evaluate(node => (node as HTMLElement).style.removeProperty('--ant-layout-header-height'));
  await page.getByRole('combobox', { name: 'Has sider', exact: true }).selectOption('false');
  await expect(root).toHaveCSS('flex-direction', 'column');
  await page.getByRole('combobox', { name: 'Has sider', exact: true }).selectOption('auto');
  await expect(root).toHaveCSS('flex-direction', 'row');
  await page.getByLabel('Mount sider').uncheck();
  await expect(root).not.toHaveClass(/ant-layout-has-sider/);
  await expect(root).toHaveCSS('flex-direction', 'column');
});

test('Sider native trigger handles Enter and Space without submitting or replacing drafts', async ({ page }) => {
  const sider = page.locator('#fixture-sider');
  await page.getByRole('textbox', { name: 'Sidebar draft' }).fill('Retained draft');
  const input = await sider.locator('input').elementHandle();
  await sider.getByRole('button', { name: 'Свернуть боковую панель' }).focus();
  await page.keyboard.press('Enter');
  await expect(sider).toHaveCSS('width', '80px');
  await expect(sider.getByRole('button', { name: 'Развернуть боковую панель' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(sider).toHaveCSS('width', '200px');
  await expect(sider.locator('input')).toHaveValue('Retained draft');
  expect(await sider.locator('input').evaluate((node, previous) => node === previous, input)).toBe(true);
  await expect(page.getByRole('status', { name: 'Layout submissions' })).toHaveText('0');
  await expect(page.getByRole('status', { name: 'Layout changes' })).toHaveText('[{"collapsed":true,"type":"clickTrigger"},{"collapsed":false,"type":"clickTrigger"}]');
});

test('Sider breakpoint collapses to zero, transfers owned focus and permits manual expansion below the threshold', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Collapsed sider width', exact: true }).fill('0');
  await page.getByRole('combobox', { name: 'Sider breakpoint' }).selectOption('md');
  await page.getByRole('textbox', { name: 'Sidebar draft' }).focus();
  await page.setViewportSize({ width: 500, height: 800 });
  const sider = page.locator('#fixture-sider');
  await expect(sider).toHaveCSS('width', '0px');
  await expect(sider.locator('.ant-layout-sider-children')).toHaveAttribute('inert', '');
  await expect(sider.getByRole('button', { name: 'Развернуть боковую панель' })).toBeFocused();
  await sider.getByRole('button', { name: 'Развернуть боковую панель' }).click();
  await expect(sider).toHaveCSS('width', '200px');
  await expect(sider.locator('.ant-layout-sider-children')).not.toHaveAttribute('inert');
  await expect(page.getByRole('status', { name: 'Layout breakpoints' })).toHaveText('[false,true]');
  await page.getByLabel('Mount sider').uncheck();
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByRole('status', { name: 'Layout breakpoints' })).toHaveText('[false,true]');
});

test('Sider preserves the code-level xxxl threshold, locale and light theme tokens', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 800 });
  await page.getByRole('combobox', { name: 'Sider breakpoint' }).selectOption('xxxl');
  await expect(page.getByRole('status', { name: 'Layout breakpoints' })).toHaveText('[false]');
  await page.setViewportSize({ width: 1839, height: 800 });
  await expect(page.getByRole('status', { name: 'Layout breakpoints' })).toHaveText('[false,true]');
  await page.getByLabel('English locale', { exact: true }).check();
  await expect(page.locator('#fixture-sider').getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Sider theme', exact: true }).selectOption('light');
  await page.getByLabel('Dark layout theme').check();
  await expect(page.locator('#fixture-sider')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await page.getByLabel('Compact layout theme').check();
  await expect(page.locator('#fixture-header')).toHaveCSS('height', '56px');
});

test('Layout paints its sidebar in the correct SSR direction before hydration and hydrates its external trigger', async ({ page, browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('http://127.0.0.1:4173/ant-design#layout');
    await expect(staticPage.locator('#layout .ant-layout').first()).toHaveCSS('flex-direction', 'row');
    await expect(staticPage.locator('#layout .ant-layout-sider')).toHaveCSS('width', '200px');
  } finally { await context.close(); }
  await page.goto('/ant-design#layout');
  const section = page.locator('#layout');
  await section.getByRole('button', { name: 'Свернуть меню', exact: true }).click();
  await expect(section.locator('.ant-layout-sider')).toHaveCSS('width', '0px');
});

test('Layout gallery collapses its sidebar on narrow viewports and retains an external control', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/ant-design#layout');
  const section = page.locator('#layout');
  await expect(section.locator('.ant-layout-sider')).toHaveCSS('width', '0px');
  const button = section.getByRole('button', { name: 'Развернуть меню', exact: true });
  await expect(button).toBeVisible();
  const bounds = (await button.boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 1000, height: 900 });
  await expect(section.locator('.ant-layout-sider')).toHaveCSS('width', '200px');
});
