import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=card');
  await expect(page.locator('#fixture-card')).toBeVisible();
});

test('Card preserves body/header style precedence, zero slots and native actions', async ({ page }) => {
  const root = page.locator('#fixture-card');
  await expect(root.locator('.ant-card-extra')).toHaveText('0');
  await expect(root.locator('.ant-card-body')).toHaveCSS('padding', '0px');
  await page.getByLabel('Styled Card', { exact: true }).check();
  await expect(root.locator('.ant-card-head')).toHaveCSS('padding', '10px');
  await expect(root.locator('.ant-card-body')).toHaveCSS('padding', '20px');
  await expect(root.locator('.ant-card-head-title')).toHaveCSS('color', 'rgb(1, 2, 3)');
  await root.getByRole('button', { name: 'Card action', exact: true }).click();
  await expect(page.getByLabel('Card extra clicks', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Card submissions', { exact: true })).toHaveText('0');
});

test('Card tabs honor empty default keys, propagate selection before callbacks and expose both native extras', async ({ page }) => {
  await page.getByLabel('Card tabs', { exact: true }).check();
  const root = page.locator('#fixture-card');
  await expect(root.getByRole('tab', { name: 'Alpha', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(root.locator('.ant-tabs')).toHaveClass(/ant-tabs-large/);
  await root.getByRole('tab', { name: 'Alpha', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab', { name: 'Beta', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Card changes', { exact: true })).toHaveText('["beta:beta"]');
  await root.getByRole('button', { name: 'Left extra', exact: true }).click();
  await root.getByRole('button', { name: 'Right extra', exact: true }).click();
  await expect(page.getByLabel('Card extra clicks', { exact: true })).toHaveText('2');
  await expect(page.getByLabel('Card submissions', { exact: true })).toHaveText('0');
  await page.getByLabel('Small Card', { exact: true }).check();
  await expect(root.locator('.ant-tabs')).toHaveClass(/ant-tabs-small/);
});

test('Card detects direct grids and removes its observer when unmounted', async ({ page }) => {
  const root = page.locator('#fixture-card');
  await page.getByLabel('Card grids', { exact: true }).check();
  await expect(root).toHaveClass(/ant-card-contain-grid/);
  await expect(root.locator('.ant-card-body')).toHaveCSS('display', 'flex');
  const grids = root.locator('.ant-card-grid');
  await expect(grids).toHaveCount(2);
  await expect(grids.first()).not.toHaveClass(/ant-card-grid-hoverable/);
  await expect(grids.last()).toHaveClass(/ant-card-grid-hoverable/);
  const bounds = await grids.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width));
  expect(Math.abs(bounds[0] - bounds[1])).toBeLessThan(1);
  await page.getByLabel('Loading Card', { exact: true }).check();
  await expect(root.locator('.ant-skeleton-paragraph > li').first()).toBeVisible();
  await page.getByLabel('Loading Card', { exact: true }).uncheck();
  await page.getByLabel('Card grids', { exact: true }).uncheck();
  await expect(root).not.toHaveClass(/ant-card-contain-grid/);
  await page.getByLabel('Mount Card', { exact: true }).uncheck();
  await page.getByLabel('Card grids', { exact: true }).check();
  await expect(root).toHaveCount(0);
});

test('Card replaces only its loading body, parks owned focus and releases it on unmount', async ({ page }) => {
  const root = page.locator('#fixture-card');
  await page.getByRole('textbox', { name: 'Card draft', exact: true }).focus();
  await page.keyboard.press('F3');
  await expect(root.locator('.ant-card-body')).toBeFocused();
  await expect(root.locator('.ant-card-body')).toHaveAttribute('aria-busy', 'true');
  await expect(root.getByRole('status')).toBeVisible();
  await expect(root.locator('.ant-card-cover')).toBeVisible();
  await expect(root.getByRole('button', { name: 'Card action', exact: true })).toBeVisible();
  await page.keyboard.press('F3');
  await expect(page.getByRole('textbox', { name: 'Card draft', exact: true })).toHaveValue('Initial draft');
  await expect(root.locator('.ant-card-body')).toBeFocused();
  await page.keyboard.press('F4');
  await expect(page.getByRole('button', { name: 'After Card', exact: true })).toBeFocused();
});

test('Card inherits size, dark container, compact tokens and RTL', async ({ page }) => {
  const root = page.locator('#fixture-card');
  await page.getByLabel('Dark Card', { exact: true }).check();
  await page.getByLabel('Small Card', { exact: true }).check();
  await page.getByLabel('Compact Card', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await expect(root).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(root.locator('.ant-card-actions')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(root).toHaveCSS('direction', 'rtl');
  await expect(root).toHaveClass(/ant-card-small/);
  await page.getByLabel('Borderless Card', { exact: true }).check();
  await expect(root).not.toHaveClass(/ant-card-bordered/);
});

test('Card gallery paints direct grids before hydration and hydrates tab and loading controls', async ({ page, browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('http://127.0.0.1:4173/ant-design#card');
    const gridCard = staticPage.locator('#card .ant-card').nth(1);
    await expect(gridCard).not.toHaveClass(/ant-card-contain-grid/);
    await expect(gridCard.locator('.ant-card-body')).toHaveCSS('display', 'flex');
    await expect(gridCard.locator('.ant-card-body')).toHaveCSS('padding', '0px');
  } finally { await context.close(); }
  await page.goto('/ant-design#card');
  const section = page.locator('#card');
  await section.getByRole('tab', { name: 'Детали', exact: true }).click();
  await expect(section.locator('.ant-card-meta-title')).toHaveText('Svelte 5 и TypeScript');
  await section.getByRole('button', { name: 'Загрузка', exact: true }).click();
  await expect(section.getByRole('status')).toBeVisible();
  await section.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect(section.locator('.ant-card-meta-title')).toHaveText('Svelte 5 и TypeScript');
});
