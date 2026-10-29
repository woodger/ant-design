import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=steps-variants');
  await expect(page.locator('#fixture-steps-variants')).toBeVisible();
});

test('Steps maxCount keeps original indexes, numbers and controlled callbacks across collapsed windows', async ({ page }) => {
  const root = page.locator('#fixture-steps-variants');
  await expect(root.locator(':scope > li')).toHaveCount(5);
  await expect(root.getByRole('button', { name: 'Stage 5', exact: true })).toHaveAttribute('aria-current', 'step');
  await expect(root.getByRole('button', { name: 'Stage 10', exact: true }).locator('xpath=ancestor::li').locator('.ant-steps-item-icon')).toHaveText('20');
  const last = root.getByRole('button', { name: 'Stage 10', exact: true });
  await last.click();
  await expect(page.getByLabel('Steps variant changes', { exact: true })).toHaveText('[19]');
  await expect(page.getByLabel('Steps item clicks', { exact: true })).toHaveText('1');
  await expect(root.locator('.ant-steps-item-ellipsis button')).toHaveCount(1);
  await expect(root.locator('.ant-steps-item-ellipsis button')).toBeDisabled();
  await expect(root.getByRole('button', { name: 'Stage 10', exact: true })).toBeFocused();
  await root.getByRole('button', { name: 'Stage 10', exact: true }).click();
  await expect(page.getByLabel('Steps variant changes', { exact: true })).toHaveText('[19]');
  await expect(page.getByLabel('Steps item clicks', { exact: true })).toHaveText('2');
});

test('Steps panel forces horizontal layout and exposes only decorative arrows', async ({ page }) => {
  await page.getByLabel('Steps type', { exact: true }).selectOption('panel');
  await page.getByLabel('Steps variant', { exact: true }).selectOption('outlined');
  await page.getByLabel('Vertical Steps variants', { exact: true }).check();
  const root = page.locator('#fixture-steps-variants');
  await expect(root).toHaveClass(/ant-steps-panel/);
  await expect(root).toHaveClass(/ant-steps-horizontal/);
  await expect(root).toHaveClass(/ant-steps-outlined/);
  await expect(root.locator('.ant-steps-panel-arrow')).toHaveCount(5);
  for (const arrow of await root.locator('.ant-steps-panel-arrow').all()) await expect(arrow).toHaveAttribute('aria-hidden', 'true');
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(root).toHaveClass(/ant-steps-horizontal/);
  const box = (await root.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});

test('Steps dot and legacy progressDot honor type priority and expose snippet render info', async ({ page }) => {
  await page.getByLabel('Steps type', { exact: true }).selectOption('dot');
  const root = page.locator('#fixture-steps-variants');
  await expect(root).toHaveClass(/ant-steps-title-vertical/);
  await expect(root.locator('.ant-steps-item:not(.ant-steps-item-ellipsis) .ant-steps-item-icon')).toHaveCount(3);
  await page.getByLabel('Legacy Steps dots', { exact: true }).check();
  await expect(root.getByTestId('legacy-dot')).toHaveCount(5);
  await expect(root.getByTestId('legacy-dot').nth(2)).toHaveAttribute('data-index', '14');
  await page.getByLabel('Steps type', { exact: true }).selectOption('navigation');
  await expect(root.getByTestId('legacy-dot')).toHaveCount(0);
  await expect(root).not.toHaveClass(/ant-steps-dot/);
  await expect(root).toHaveClass(/ant-steps-title-horizontal/);
});

test('Steps percentage remains an accessible progressbar and is omitted in inline mode', async ({ page }) => {
  await page.getByLabel('Steps percentage', { exact: true }).check();
  const root = page.locator('#fixture-steps-variants');
  await expect(root.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  await expect(root.getByRole('progressbar')).toHaveAccessibleName('');
  await page.getByLabel('Steps type', { exact: true }).selectOption('inline');
  await expect(root.getByRole('progressbar')).toHaveCount(0);
  await expect(root).not.toHaveClass(/ant-steps-with-progress/);
});

test('Steps inline rich tooltip uses native keyboard focus, Escape dismissal and a single description', async ({ page }) => {
  await page.getByLabel('Steps type', { exact: true }).selectOption('inline');
  const stage = page.locator('#fixture-steps-variants').getByRole('button', { name: 'Stage 5', exact: true });
  await stage.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip.locator('strong')).toHaveText('Rich inline stage');
  await expect(stage).toHaveAccessibleDescription('Выполняется Rich inline stage');
  await expect(stage).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(stage).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(stage).not.toBeFocused();
});

test('Steps custom icon renderer can retain or replace origin with the provided Icon component', async ({ page }) => {
  const root = page.locator('#fixture-steps-variants');
  await page.getByLabel('Custom Steps icons', { exact: true }).check();
  await expect(root.locator('.custom-icon-index').nth(2)).toHaveText('14');
  await page.getByLabel('Replace Steps icon node', { exact: true }).check();
  await expect(root.getByTestId('custom-step-icon')).toHaveCount(5);
  await expect(root.getByTestId('custom-step-icon').nth(2)).toHaveText('15');
  await expect(root.getByTestId('custom-step-icon').nth(2)).toHaveCSS('display', 'flex');
  await page.getByLabel('Custom Steps icons', { exact: true }).uncheck();
  await expect(root.getByTestId('custom-step-icon')).toHaveCount(0);
});

test('Steps semantic styles, dark compact tokens, RTL and vertical titles remain reactive', async ({ page }) => {
  await page.getByLabel('Semantic Steps variants', { exact: true }).check();
  await page.getByLabel('Dark Steps variants', { exact: true }).check();
  await page.getByLabel('Compact Steps variants', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Vertical Steps titles', { exact: true }).check();
  const root = page.locator('#fixture-steps-variants');
  await expect(root).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(root).toHaveCSS('direction', 'rtl');
  await expect(root).toHaveClass(/ant-steps-title-vertical/);
  await expect(root.locator('.semantic-steps-title').first()).toHaveCSS('font-weight', '700');
  await expect(root.locator('li').first()).toHaveCSS('color', 'rgb(0, 128, 0)');
});

test('Steps variants gallery hydrates selection and navigation without changing the existing wizard', async ({ page }) => {
  await page.goto('/ant-design#steps');
  const section = page.locator('#steps');
  await section.getByRole('combobox', { name: 'Вариант Steps', exact: true }).click();
  await page.getByRole('option', { name: 'panel', exact: true }).click();
  const root = section.getByRole('list', { name: 'Расширенные этапы', exact: true });
  await expect(root).toHaveClass(/ant-steps-panel/);
  await root.getByRole('button', { name: 'Этап 8', exact: true }).click();
  await expect(root.getByRole('button', { name: 'Этап 8', exact: true })).toHaveAttribute('aria-current', 'step');
  await expect(section.getByRole('list', { name: 'Этапы заявки', exact: true })).toBeVisible();
});
