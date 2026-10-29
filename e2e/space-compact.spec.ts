import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=space-compact');
  await expect(page.locator('#fixture-space-compact')).toBeVisible();
});

test('Compact controls inherit group size before the provider and explicit control size overrides the group', async ({ page }) => {
  const root = page.locator('#fixture-space-compact');
  await expect(page.locator('#compact-text')).toHaveClass(/ant-input-sm/);
  await expect(root.locator('.fixture-compact-number')).toHaveClass(/ant-input-number-sm/);
  await expect(root.locator('.ant-select')).toHaveClass(/ant-select-sm/);
  await expect(root.getByRole('button', { name: 'Apply compact group', exact: true })).toHaveClass(/ant-btn-sm/);
  await expect(page.locator('#compact-text')).toHaveCSS('height', '24px');
  await page.getByLabel('Override compact input size', { exact: true }).check();
  await expect(page.locator('#compact-text')).toHaveCSS('height', '40px');
  await expect(root.locator('.fixture-compact-number')).toHaveCSS('height', '24px');
  await page.getByLabel('Compact group size', { exact: true }).selectOption('');
  await expect(root.locator('.fixture-compact-number')).toHaveCSS('height', '40px');
});

test('Compact joins logical corners and overlaps adjacent borders by one pixel in both directions', async ({ page }) => {
  const root = page.locator('#fixture-space-compact');
  await expect(page.locator('#compact-text')).toHaveCSS('border-start-start-radius', '4px');
  await expect(page.locator('#compact-text')).toHaveCSS('border-start-end-radius', '0px');
  await expect(root.locator('.fixture-compact-number')).toHaveCSS('border-radius', '0px');
  await expect(root.locator('.ant-select')).toHaveCSS('border-radius', '0px');
  const last = root.getByRole('button', { name: 'Apply compact group', exact: true });
  await expect(last).toHaveCSS('border-start-start-radius', '0px');
  await expect(last).toHaveCSS('border-start-end-radius', '4px');
  for (const rtl of [false, true]) {
    await page.getByLabel('Right to left', { exact: true }).setChecked(rtl);
    await expect.poll(async () => {
      const bounds = await root.evaluate(node => [...node.children].map(child => child.getBoundingClientRect()).filter(rect => rect.width > 0).map(rect => ({ x: rect.x, right: rect.right })));
      if (bounds.length !== 4) return Infinity;
      return Math.max(...bounds.slice(1).map((next, index) => Math.abs((rtl ? next.right - bounds[index].x : bounds[index].right - next.x) - 1)));
    }).toBeLessThan(0.6);
  }
});

test('Compact preserves drafts and owned focus during keyed reordering and updates first and last flags', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Compact draft', exact: true });
  await input.fill('Retained compact draft');
  const previous = await input.elementHandle();
  await page.keyboard.press('F4');
  await expect(input).toBeFocused();
  await expect(input).toHaveClass(/ant-input-compact-last-item/);
  await page.keyboard.press('F4');
  await expect(input).toBeFocused();
  await expect(input).toHaveClass(/ant-input-compact-first-item/);
  expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);
  await expect(input).toHaveValue('Retained compact draft');
  await page.getByRole('button', { name: 'Apply compact group', exact: true }).first().click();
  await expect(page.getByLabel('Compact clicks', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Compact submissions', { exact: true })).toHaveText('0');
});

test('nested Compact propagates edge flags but resolves its own size from ConfigProvider', async ({ page }) => {
  await expect(page.locator('#nested-compact-first')).toHaveClass(/ant-input-compact-first-item/);
  await expect(page.locator('#nested-compact-end-input')).not.toHaveClass(/ant-input-compact-first-item/);
  await expect(page.locator('#nested-compact-last')).toHaveClass(/ant-btn-compact-last-item/);
  await expect(page.locator('#nested-compact-left .nested-compact-button')).not.toHaveClass(/ant-btn-compact-last-item/);
  await page.getByLabel('Explicit nested compact size', { exact: true }).uncheck();
  await expect(page.locator('#nested-compact-first')).toHaveCSS('height', '40px');
  await expect(page.locator('#nested-compact-end-input')).toHaveClass(/ant-input-sm/);
  await expect(page.locator('#nested-compact-end-input')).toHaveCSS('font-size', '14px');
  await expect(page.locator('#vertical-compact')).toHaveCSS('flex-direction', 'column');
  const first = page.getByRole('button', { name: 'Vertical first', exact: true });
  await expect(first).toHaveCSS('border-bottom-left-radius', '0px');
  await expect(first).toHaveCSS('border-top-left-radius', '4px');
});

test('Addon applies independent variants, statuses and disabled appearance while keeping adjacent controls native', async ({ page }) => {
  const addon = page.locator('#compact-addon-before');
  await expect(addon).toHaveClass(/ant-space-addon-small/);
  await expect(addon).toHaveCSS('height', '24px');
  await page.getByLabel('Addon status', { exact: true }).selectOption('error');
  await expect(addon).toHaveCSS('color', 'rgb(255, 77, 79)');
  await page.getByLabel('Addon variant', { exact: true }).selectOption('filled');
  await expect(addon).toHaveCSS('background-color', 'rgb(255, 242, 240)');
  await page.getByLabel('Disabled addon appearance', { exact: true }).check();
  await expect(addon).toHaveCSS('color', 'rgba(0, 0, 0, 0.25)');
  await expect(page.getByRole('textbox', { name: 'Addon address', exact: true })).toBeEnabled();
  await page.getByLabel('Addon variant', { exact: true }).selectOption('borderless');
  await expect(addon).toHaveCSS('border-top-width', '0px');
});

test('Compact context stays on popup triggers and is isolated inside Modal Drawer and Popover', async ({ page }) => {
  await page.getByRole('button', { name: 'Open compact modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Compact modal', exact: true });
  const field = modal.getByRole('textbox', { name: 'Modal independent input', exact: true });
  await expect(field).not.toHaveClass(/ant-input-compact-item/);
  await expect(field).toHaveCSS('height', '40px');
  await expect(modal.getByRole('button', { name: 'Modal independent action', exact: true })).not.toHaveClass(/ant-btn-compact-item/);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open compact drawer', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Compact drawer', exact: true });
  await expect(drawer.getByRole('textbox', { name: 'Drawer independent input', exact: true })).toHaveCSS('height', '40px');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open compact popover', exact: true }).click();
  const popover = page.getByRole('dialog', { name: 'Compact popover', exact: true });
  await expect(popover.getByRole('textbox', { name: 'Popover independent input', exact: true })).not.toHaveClass(/ant-input-compact-item/);
  await expect(popover.getByRole('textbox', { name: 'Popover independent input', exact: true })).toHaveCSS('height', '40px');
});

test('Compact gallery hydrates its address control and keeps the group within a narrow viewport', async ({ page }) => {
  await page.goto('/ant-design#space');
  const section = page.locator('#space');
  await section.getByRole('textbox', { name: 'Домен проекта', exact: true }).fill('migration');
  await section.getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(section.getByLabel('Адрес проекта', { exact: true })).toHaveText('migration.org');
  await page.setViewportSize({ width: 320, height: 900 });
  const root = section.locator('.ant-space-compact');
  const bounds = (await root.boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(await root.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
});
