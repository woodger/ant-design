import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=button');
  await expect(page.locator('#fixture-button')).toBeVisible();
});

test('Button resolves complete color/variant pairs, legacy type, ghost and icon placement in source order', async ({ page }) => {
  const button = page.locator('#fixture-button');
  await page.getByLabel('Button type', { exact: true }).selectOption('primary');
  await page.getByLabel('Ghost Button', { exact: true }).check();
  await expect(button).toHaveClass(/ant-btn-variant-outlined/);
  await expect(button).toHaveClass(/ant-btn-background-ghost/);
  await page.getByLabel('Button color', { exact: true }).selectOption('purple');
  await page.getByLabel('Button variant', { exact: true }).selectOption('filled');
  await expect(button).toHaveClass(/ant-btn-color-purple/);
  await expect(button).toHaveClass(/ant-btn-variant-filled/);
  await page.getByLabel('Button icon', { exact: true }).check();
  await page.getByLabel('End Button icon', { exact: true }).check();
  await expect(button).toHaveCSS('flex-direction', 'row-reverse');
  const icon = (await button.locator('.ant-btn-icon').boundingBox())!;
  const content = (await button.locator('span').last().boundingBox())!;
  expect(icon.x).toBeGreaterThan(content.x);
});

test('Button preserves native form behavior and type=link remains an action until href is provided', async ({ page }) => {
  const button = page.locator('#fixture-button');
  await page.getByLabel('Button type', { exact: true }).selectOption('link');
  await expect(button).toHaveRole('button');
  await button.click();
  await expect(page.getByLabel('Button submissions', { exact: true })).toHaveText('0');
  await page.getByLabel('Submit Button', { exact: true }).check();
  await button.click();
  await expect(page.getByLabel('Button submissions', { exact: true })).toHaveText('1');
  await page.getByLabel('Link Button href', { exact: true }).check();
  await expect(button).toHaveRole('link');
  await button.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#button-target$/);
  await expect(page.getByLabel('Button submissions', { exact: true })).toHaveText('1');
});

test('Button disabled href removes navigation and keyboard stop while retaining native anchor callback typing', async ({ page }) => {
  await page.locator('#button-native-link').click();
  await expect(page.locator('#button-native-link')).toHaveAttribute('data-anchor', /#button-target$/);
  await page.getByLabel('Link Button href', { exact: true }).check();
  await page.getByLabel('Disable Button', { exact: true }).check();
  const button = page.locator('#fixture-button');
  await expect(button).not.toHaveAttribute('href');
  await expect(button).toHaveAttribute('tabindex', '-1');
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await button.evaluate(node => (node as HTMLAnchorElement).click());
  await expect(page.getByLabel('Button clicks', { exact: true })).toHaveText('0');
});

test('Button delays loading, cancels replaced deadlines and keeps immediate loading natively disabled', async ({ page }) => {
  await page.clock.install();
  const button = page.locator('#fixture-button');
  await page.getByLabel('Button loading', { exact: true }).selectOption('delayed');
  await expect(button).toBeEnabled();
  await page.clock.fastForward(100);
  await page.getByLabel('Button loading', { exact: true }).selectOption('none');
  await page.clock.fastForward(300);
  await expect(button).not.toHaveClass(/ant-btn-loading/);
  await page.getByLabel('Button loading', { exact: true }).selectOption('delayed');
  await page.clock.fastForward(200);
  await expect(button).toBeDisabled(); await expect(button).toHaveAttribute('aria-busy', 'true');
  await page.getByLabel('Button loading', { exact: true }).selectOption('none');
  await expect(button).toBeEnabled();
  await page.getByLabel('Button loading', { exact: true }).selectOption('immediate');
  await expect(button).toBeDisabled();
  await button.evaluate(node => (node as HTMLButtonElement).click());
  await expect(page.getByLabel('Button clicks', { exact: true })).toHaveText('0');
});

test('Button uses config loadingIcon with local loading.icon priority and merges semantic layers', async ({ page }) => {
  const button = page.locator('#fixture-button');
  await page.getByLabel('Configure Button defaults', { exact: true }).check();
  await expect(button).toHaveClass(/ant-btn-color-green/);
  await expect(button).toHaveClass(/ant-btn-variant-filled/);
  await expect(button).toHaveClass(/ant-btn-round/);
  await page.getByLabel('Button loading', { exact: true }).selectOption('immediate');
  await expect(button.getByTestId('button-context-spinner')).toBeVisible();
  await page.getByLabel('Button loading', { exact: true }).selectOption('custom');
  await expect(button.getByTestId('button-custom-spinner')).toBeVisible();
  await expect(button.getByTestId('button-context-spinner')).toHaveCount(0);
  await page.getByLabel('Semantic Button styles', { exact: true }).check();
  await expect(button).toHaveClass(/configured-root/); await expect(button).toHaveClass(/local-button/);
  await expect(button).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(button.locator('.ant-btn-icon')).toHaveCSS('color', 'rgb(255, 165, 0)');
});

test('Button ConfigProvider inherits omitted config and replaces the whole nested config when explicitly provided', async ({ page }) => {
  await page.getByLabel('Configure Button defaults', { exact: true }).check();
  const nested = page.locator('#button-nested-config');
  await expect(nested).toHaveClass(/ant-btn-color-green/);
  await page.getByLabel('Reset nested Button config', { exact: true }).check();
  await expect(nested).toHaveClass(/ant-btn-color-default/);
  await expect(nested).not.toHaveClass(/configured-button/);
});

test('ButtonGroup resolves explicit size and Compact before group and resets nested undefined group size', async ({ page }) => {
  const root = page.locator('#button-group');
  await expect(root.getByRole('button', { name: 'Group small', exact: true })).toHaveCSS('height', '24px');
  await expect(root.getByRole('button', { name: 'Group explicit large', exact: true })).toHaveCSS('height', '40px');
  await expect(root.getByRole('button', { name: 'Compact over group', exact: true })).toHaveCSS('height', '40px');
  await expect(root.getByRole('button', { name: 'Nested group resets size', exact: true })).toHaveCSS('height', '40px');
});

test('Button applies scalar Chinese spacing on SSR and observes snippet text without changing owner DOM', async ({ page }) => {
  const button = page.locator('#fixture-button');
  await expect(page.locator('#button-scalar-cn')).toHaveText('按 钮');
  await expect(page.locator('#button-scalar-zero')).toHaveText('0');
  await page.getByLabel('Chinese Button text', { exact: true }).check();
  await expect(button).toHaveClass(/ant-btn-two-chinese-chars/);
  await expect(button).toHaveText('按钮');
  await page.getByLabel('Insert Chinese space', { exact: true }).uncheck();
  await expect(button).not.toHaveClass(/ant-btn-two-chinese-chars/);
  await page.getByLabel('Insert Chinese space', { exact: true }).check();
  await expect(button).toHaveClass(/ant-btn-two-chinese-chars/);
  await page.getByLabel('Button type', { exact: true }).selectOption('text');
  await expect(button).not.toHaveClass(/ant-btn-two-chinese-chars/);
});

test('Button autoFocus runs on mount and the gallery hydrates new variants and legacy grouping', async ({ page }) => {
  await page.getByLabel('Mount autofocus Button', { exact: true }).check();
  await expect(page.locator('#button-autofocus')).toBeFocused();
  await page.goto('/ant-design#buttons');
  const section = page.locator('#buttons');
  await section.getByRole('button', { name: 'Цветное действие (0)', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Цветное действие (1)', exact: true })).toBeVisible();
  await expect(section.getByRole('link', { name: 'Перейти к обзору', exact: true })).toHaveAttribute('href', '#overview');
  await page.setViewportSize({ width: 320, height: 900 });
  const box = (await section.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});
