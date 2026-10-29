import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=descriptions');
  await expect(page.locator('#fixture-descriptions')).toBeVisible();
});

test('Descriptions follows responsive column and span maps and detaches when removed', async ({ page }) => {
  await page.getByLabel('Responsive details').check();
  const root = page.locator('#fixture-descriptions');
  const spans = () => root.locator('td').evaluateAll(nodes => nodes.map(node => node.getAttribute('colspan')));
  await page.setViewportSize({ width: 500, height: 900 });
  await expect.poll(spans).toEqual(['1', '1', '1', '1']);
  await page.setViewportSize({ width: 700, height: 900 });
  await expect.poll(spans).toEqual(['1', '1', '2', '2']);
  await page.setViewportSize({ width: 1000, height: 900 });
  await expect.poll(spans).toEqual(['1', '2', '3', '3']);
  await page.setViewportSize({ width: 1300, height: 900 });
  await expect.poll(spans).toEqual(['1', '2', '1', '4']);
  await page.getByLabel('Mount details').uncheck();
  await page.setViewportSize({ width: 500, height: 900 });
  await expect(root).toHaveCount(0);
});

test('Descriptions places bordered styles on cells in both orientations and preserves zero content', async ({ page }) => {
  await page.getByLabel('Bordered details').check();
  const root = page.locator('#fixture-descriptions');
  for (const vertical of [false, true]) {
    await page.getByLabel('Vertical details').setChecked(vertical);
    const label = root.locator('th.ant-descriptions-item-label').first();
    const content = root.locator('td.ant-descriptions-item-content').first();
    await expect(label).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(content).toHaveCSS('color', 'rgb(1, 2, 3)');
    await expect(label).toHaveCSS('background-color', 'rgb(255, 255, 0)');
    await expect(content).toHaveCSS('background-color', 'rgb(255, 255, 0)');
    await expect(label.locator('span')).not.toHaveAttribute('style');
    await expect(root.locator('.ant-descriptions-item-label').nth(1)).toHaveText('0');
  }
});

test('Descriptions keeps drafts during appearance changes and isolates nested table styles', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Details draft', exact: true });
  await input.fill('Persistent draft');
  await page.getByLabel('Small details').check();
  await page.getByLabel('Dark details').check();
  await page.getByLabel('Details colon').uncheck();
  await page.getByLabel('Right to left', { exact: true }).check();
  await expect(input).toHaveValue('Persistent draft');
  await expect(page.locator('#fixture-descriptions')).toHaveCSS('direction', 'rtl');
  await expect(page.locator('#fixture-descriptions .ant-descriptions-item-label').first()).toHaveClass(/ant-descriptions-item-no-colon/);
  await page.getByLabel('Nested details').check();
  await page.getByLabel('Bordered details').check();
  await expect(page.locator('#fixture-descriptions > .ant-descriptions-view > table > tbody > tr > th').nth(1)).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.04)');
  const selectors = ['.ant-descriptions-row', 'td', '.ant-descriptions-item-label', '.ant-descriptions-item-content'];
  for (const selector of selectors) {
    const read = (node: Element) => {
      const style = getComputedStyle(node);
      return [style.paddingTop, style.paddingBottom, style.borderBottomWidth, style.display];
    };
    expect(await page.locator(`#nested-descriptions ${selector}`).first().evaluate(read)).toEqual(await page.locator(`#reference-descriptions ${selector}`).first().evaluate(read));
  }
});

test('Descriptions gallery hydrates its native appearance controls and responsive table', async ({ page }) => {
  await page.goto('/ant-design#descriptions');
  const section = page.locator('#descriptions');
  await expect(section.getByText('Ant Design Svelte', { exact: true })).toBeVisible();
  await section.getByLabel('Вертикально', { exact: true }).check();
  await expect(section.locator('.ant-descriptions-row')).toHaveCount(4);
  await section.getByLabel('Рамка', { exact: true }).uncheck();
  await expect(section.locator('.ant-descriptions')).not.toHaveClass(/ant-descriptions-bordered/);
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(section.locator('.ant-descriptions-row')).toHaveCount(8);
  const bounds = (await section.locator('.ant-descriptions').boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(await section.locator('.ant-descriptions').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
});
