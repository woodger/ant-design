import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('#fixture-steps');
const step = (page: Page, name: string) => host(page).getByRole('button', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const check = (page: Page, name: string, value = true) => page.getByRole('checkbox', { name, exact: true }).setChecked(value);
const setting = (page: Page, name: string, value: string) => page.getByRole('combobox', { name: `Steps ${name}`, exact: true }).selectOption(value);
const hotkey = (page: Page, key: string) => page.keyboard.press(`Control+Alt+Shift+${key}`);
const changes = (page: Page) => page.getByRole('status', { name: 'Steps changes', exact: true });

test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=steps'); await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible(); });

test('Steps exposes a named ordered list, one current step and passive status descriptions', async ({ page }, testInfo) => {
  await expect(host(page)).toHaveRole('list'); await expect(host(page)).toHaveAccessibleName('Order steps'); await expect(host(page).getByRole('listitem')).toHaveCount(3);
  await expect(step(page, 'Step review')).toHaveAttribute('aria-current', 'step'); await expect(step(page, 'Step review')).toHaveAccessibleDescription('Выполняется Check details');
  await expect(host(page).locator('[aria-current="step"]')).toHaveCount(1); await expect(host(page).locator('[aria-live], [role="status"], [role="tablist"]')).toHaveCount(0);
  await expect(host(page).locator('.ant-steps-item-icon').first()).toHaveAttribute('inert', ''); await expect(host(page).locator('svg').first()).toHaveAttribute('aria-hidden', 'true');
  await page.locator('#steps-fixture .surface').screenshot({ path: testInfo.outputPath('steps-light.png') });
});

test('Steps uses native Tab Enter and Space, skips disabled steps and does not submit its surrounding page', async ({ page }) => {
  await button(page, 'Before Steps').focus(); await page.keyboard.press('Tab'); await expect(step(page, 'Step data')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(changes(page)).toHaveText('[0]'); await expect(step(page, 'Step data')).toHaveAttribute('aria-current', 'step');
  await page.keyboard.press('Enter'); await expect(changes(page)).toHaveText('[0]'); await page.keyboard.press('Tab'); await expect(step(page, 'Step review')).toBeFocused();
  await page.keyboard.press('Space'); await expect(changes(page)).toHaveText('[0,1]'); await page.keyboard.press('Tab'); await expect(button(page, 'After Steps')).toBeFocused();
});

test('Steps reports a requested index and waits for the owner to accept the selection', async ({ page }) => {
  await check(page, 'Accept Steps selection', false); await step(page, 'Step data').click(); await expect(changes(page)).toHaveText('[0]'); await expect(step(page, 'Step review')).toHaveAttribute('aria-current', 'step');
  await page.getByRole('spinbutton', { name: 'Steps current', exact: true }).fill('2'); await expect(step(page, 'Step send')).toHaveAttribute('aria-current', 'step'); await expect(step(page, 'Step send')).toBeDisabled(); await expect(changes(page)).toHaveText('[0]');
});

test('Steps normalizes external indexes without rewriting owner values or generating callbacks', async ({ page }) => {
  const value = page.getByRole('spinbutton', { name: 'Steps current', exact: true }); await value.fill('-5'); await expect(step(page, 'Step data')).toHaveAttribute('aria-current', 'step'); await expect(value).toHaveValue('-5');
  await value.fill('999'); await expect(host(page).locator('[aria-current]')).toHaveCount(0); await expect(host(page).locator('.ant-steps-item-finish')).toHaveCount(3); await expect(value).toHaveValue('999'); await expect(changes(page)).toHaveText('[]');
});

for (const [status, label] of [['wait', 'Ожидается'], ['process', 'Выполняется'], ['finish', 'Завершён'], ['error', 'Ошибка']]) test(`Steps exposes the ${status} state of its current item`, async ({ page }) => {
  await setting(page, 'status', status); await expect(host(page).locator('[data-steps-key="review"]').first()).toHaveClass(new RegExp(`ant-steps-item-${status}`)); await expect(step(page, 'Step review')).toHaveAccessibleDescription(`${label} Check details`);
  await expect(host(page).locator('[data-steps-key="data"]').first()).toHaveClass(/ant-steps-item-finish/); await expect(host(page).locator('[data-steps-key="send"]').first()).toHaveClass(/ant-steps-item-wait/);
});

test('Steps preserves explicit item statuses, rich text and decorative custom icons', async ({ page }) => {
  await check(page, 'Rich Steps content'); await check(page, 'Custom Steps icon'); await check(page, 'Explicit Steps status');
  await expect(host(page).locator('[data-steps-key="data"]').first()).toHaveClass(/ant-steps-item-error/); await expect(step(page, 'Step review').locator('strong')).toBeVisible(); await expect(step(page, 'Step review')).toHaveAccessibleDescription('Выполняется Rich review description');
  await expect(host(page).getByRole('button', { name: 'Decorative Steps control', exact: true })).toHaveCount(0); await expect(host(page).locator('svg').first()).toHaveAttribute('viewBox', '0 0 32 32');
});

test('Steps keeps passive lists out of Tab order and restores a neighbor if interactivity disappears', async ({ page }) => {
  await step(page, 'Step review').focus(); await hotkey(page, 'N'); await expect(host(page).getByRole('button')).toHaveCount(0); await expect(button(page, 'After Steps')).toBeFocused();
  await expect(host(page).locator('[aria-current="step"]')).toHaveCount(1); await button(page, 'Before Steps').focus(); await page.keyboard.press('Tab'); await expect(button(page, 'After Steps')).toBeFocused(); await expect(changes(page)).toHaveText('[]');
});

test('Steps restores the next available step when its focused step becomes disabled', async ({ page }) => {
  await check(page, 'Disable last step', false); await step(page, 'Step review').focus(); await hotkey(page, 'H'); await expect(step(page, 'Step review')).toBeDisabled(); await expect(step(page, 'Step send')).toBeFocused(); await expect(changes(page)).toHaveText('[]');
});

test('Steps falls back to a previous step when no following step is available', async ({ page }) => {
  await step(page, 'Step review').focus(); await hotkey(page, 'H'); await expect(step(page, 'Step data')).toBeFocused();
});

test('Steps restores a neighboring step on removal and preserves its current index contract', async ({ page }) => {
  await check(page, 'Disable last step', false); await step(page, 'Step review').focus(); await hotkey(page, 'I'); await expect(step(page, 'Step review')).toHaveCount(0); await expect(step(page, 'Step send')).toBeFocused(); await expect(step(page, 'Step send')).toHaveAttribute('aria-current', 'step'); await expect(changes(page)).toHaveText('[]');
});

test('Steps keeps the same focused button while keyed steps are reordered', async ({ page }) => {
  const original = await step(page, 'Step review').elementHandle(); await step(page, 'Step review').focus(); await hotkey(page, 'M');
  await expect(step(page, 'Step review')).toBeFocused(); expect(await step(page, 'Step review').evaluate((node, old) => node === old, original)).toBe(true); await expect(changes(page)).toHaveText('[]');
});

test('Steps restores an outside neighbor when emptied or unmounted and does not steal an outside focus choice', async ({ page }) => {
  await step(page, 'Step review').focus(); await hotkey(page, 'Q'); await expect(host(page).getByRole('listitem')).toHaveCount(0); await expect(button(page, 'After Steps')).toBeFocused();
  await hotkey(page, 'Q'); await step(page, 'Step data').focus(); await hotkey(page, 'G'); await expect(host(page)).toHaveCount(0); await expect(button(page, 'After Steps')).toBeFocused();
  await hotkey(page, 'G'); await step(page, 'Step review').focus(); await button(page, 'Before Steps').focus(); await hotkey(page, 'G'); await expect(button(page, 'Before Steps')).toBeFocused();
});

test('Steps honors the owner focus when selection removes the component', async ({ page }) => {
  await check(page, 'Remove Steps on selection'); await check(page, 'Steps owner focus'); await step(page, 'Step data').click(); await expect(host(page)).toHaveCount(0); await expect(page.getByRole('textbox', { name: 'Steps outside input', exact: true })).toBeFocused(); await expect(changes(page)).toHaveText('[0]');
});

test('Steps inherits disabled context and supports an explicit root override while keeping item restrictions', async ({ page }) => {
  await check(page, 'Disable all components'); await expect(step(page, 'Step data')).toBeDisabled(); await expect(step(page, 'Step review')).toBeDisabled();
  await button(page, 'Toggle Steps disabled override').click(); await expect(step(page, 'Step data')).toBeEnabled(); await expect(step(page, 'Step send')).toBeDisabled(); await expect(changes(page)).toHaveText('[]');
});

test('Steps inherits locale, merges partial translations and forwards owner naming', async ({ page }) => {
  await check(page, 'English locale'); await expect(step(page, 'Step review')).toHaveAccessibleDescription('In progress Check details');
  await check(page, 'Custom Steps locale'); await expect(step(page, 'Step review')).toHaveAccessibleDescription('In progress Check details'); await setting(page, 'status', 'error'); await expect(step(page, 'Step review')).toHaveAccessibleDescription('Custom failure Check details');
  await check(page, 'Label Steps by owner'); await expect(host(page)).toHaveAccessibleName('Owner steps title'); await expect(host(page)).toHaveAttribute('aria-describedby', 'steps-owner-hint');
});

test('Steps follows orientation, size, theme and RTL while respecting reduced motion', async ({ page }, testInfo) => {
  await setting(page, 'orientation', 'vertical'); await setting(page, 'size', 'small'); await expect(host(page)).toHaveCSS('flex-direction', 'column'); await expect(host(page).locator('.ant-steps-item-icon').first()).toHaveCSS('width', '24px');
  await check(page, 'Dark Steps theme'); await check(page, 'Compact Steps theme'); await check(page, 'Right to left'); await expect(host(page)).toHaveAttribute('dir', 'rtl'); await expect(host(page)).toHaveCSS('direction', 'rtl');
  await expect(host(page).locator('.ant-steps-item-title').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)'); await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(host(page).locator('.ant-steps-item-icon').first()).toHaveCSS('transition-duration', '0s');
  await page.locator('#steps-fixture .surface').screenshot({ path: testInfo.outputPath('steps-dark-small-rtl.png') });
});

test('Steps switches responsively at 532px and can preserve the horizontal layout on a narrow screen', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 532, height: 800 }); await expect(host(page)).toHaveClass(/ant-steps-horizontal/); await page.setViewportSize({ width: 531, height: 800 }); await expect(host(page)).toHaveClass(/ant-steps-vertical/);
  await page.setViewportSize({ width: 320, height: 800 }); await page.getByRole('textbox', { name: 'Steps long title', exact: true }).fill('LongUnbrokenStepTitle'.repeat(10)); await expect(host(page)).toHaveClass(/ant-steps-vertical/);
  let bounds = await host(page).evaluate(node => ({ width: node.clientWidth, scroll: node.scrollWidth })); expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
  await page.locator('#steps-fixture .surface').screenshot({ path: testInfo.outputPath('steps-mobile.png') }); await check(page, 'Responsive Steps', false); await expect(host(page)).toHaveClass(/ant-steps-horizontal/);
  await check(page, 'Disable last step', false); await step(page, 'Step send').focus(); await expect(step(page, 'Step send')).toBeFocused();
  await expect(host(page)).toHaveCSS('overflow-x', 'auto'); expect(await host(page).evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const kind of ['Modal', 'Drawer']) test(`Steps restores focus within ${kind} after selection and programmatic unmount`, async ({ page }) => {
  const opener = button(page, `Open Steps ${kind}`); await opener.click(); const dialog = page.getByRole('dialog', { name: `Steps host ${kind.toLowerCase()}`, exact: true });
  await dialog.getByRole('button', { name: `${kind} step two`, exact: true }).click(); await expect(dialog.locator('.ant-steps')).toHaveCount(0); await expect(dialog.getByRole('button', { name: `After ${kind} Steps`, exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused(); await opener.click(); await dialog.getByRole('button', { name: `${kind} step two`, exact: true }).focus(); await hotkey(page, kind === 'Modal' ? 'S' : 'V'); await expect(dialog.getByRole('button', { name: `After ${kind} Steps`, exact: true })).toBeFocused();
});

test('Steps example cancels pending completion on unmount and remounts an idle workflow', async ({ page }) => {
  await button(page, 'Toggle Steps example').click(); const example = page.locator('#steps-example-fixture');
  await example.getByRole('button', { name: 'Проверить данные заявки', exact: true }).click(); await example.getByRole('button', { name: 'К отправке заявки', exact: true }).click(); await example.getByRole('button', { name: 'Отправить многошаговую заявку', exact: true }).click(); await expect(example.getByRole('region', { name: 'Текущий этап заявки', exact: true })).toHaveAttribute('aria-busy', 'true');
  await button(page, 'Toggle Steps example').click(); await button(page, 'Toggle Steps example').click(); await page.waitForTimeout(850); await expect(example.getByRole('status', { name: 'Результат примера Steps', exact: true })).toHaveText('Этап: 0. Состояние: editing.');
});
