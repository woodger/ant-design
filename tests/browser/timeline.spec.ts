import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=timeline');

  await expect(page.locator('#fixture-timeline')).toBeVisible();
});

test(
  'Timeline remains a passive ordered list and maps colors and loading onto source Steps geometry',
  async ({ page }) => {
    const root = page.locator('#fixture-timeline');

    await expect(root).toHaveRole('list');
    await expect(root.locator(':scope > li')).toHaveCount(4);
    await expect(root.getByRole('button')).toHaveCount(0);
    await expect(root.locator('[aria-current]')).toHaveCount(0);
    await expect(root.locator('.ant-steps-item-status')).toHaveCount(0);
    await expect(root.locator('.ant-timeline-item-content').last()).toHaveText('0');
    await expect(root.locator('.ant-timeline-item-icon').nth(1)).toHaveCSS(
      'color',
      'rgb(125, 76, 219)'
    );
    await expect(root.locator('.ant-timeline-item').nth(2)).toHaveClass(/ant-steps-item-process/);
    await expect(root.locator('.ant-timeline-item').nth(2).locator('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  }
);

test(
  'Timeline computes alternate placement before reverse and connects reversed pending from the preceding status',
  async ({ page }) => {
    const root = page.locator('#fixture-timeline');

    await page.getByLabel('Timeline mode', { exact: true }).selectOption('alternate');

    await expect(root.locator('li').nth(1)).toHaveClass(/ant-timeline-item-placement-end/);

    await page.getByLabel('Pending Timeline', { exact: true }).check();
    await page.getByLabel('Reverse Timeline', { exact: true }).check();

    await expect(root.locator('.ant-timeline-item-content').first()).toHaveText('Waiting');
    await expect(root.locator('li').first().locator('.ant-timeline-item-rail'))
      .toHaveClass(/ant-steps-item-rail-process/);
    await expect(root.locator('li').nth(3)).toHaveClass(/ant-timeline-item-placement-end/);
  }
);

test(
  'Timeline retains a keyed native draft and focus across both directions of reverse',
  async ({ page }) => {
    const draft = page.getByRole('textbox', { name: 'Timeline draft', exact: true });
    const original = await draft.elementHandle();

    await draft.fill('retained event draft');
    await page.keyboard.press('F4');

    await expect(draft).toHaveValue('retained event draft');
    await expect(draft).toBeFocused();

    await page.keyboard.press('F4');

    await expect(draft).toBeFocused();
    expect(await draft.evaluate((node, previous) => node === previous, original)).toBe(true);
  }
);

test(
  'Timeline supports numeric, percentage and fixed title spans with source style priority',
  async ({ page }) => {
    const root = page.locator('#fixture-timeline');
    const icon = root.locator('.ant-timeline-item-icon').first();

    await page.getByLabel('Timeline title span', { exact: true }).selectOption('100px');
    await expect.poll(
      async () =>
        Math.abs(
          (await icon.boundingBox())!.x + (await icon.boundingBox())!.width / 2
          - (await root
            .boundingBox())!.x
          - 100
        )
    )
      .toBeLessThan(1);
    await page.getByLabel('Timeline title span', { exact: true }).selectOption('25%');

    const quarter = (await root.boundingBox())!.width / 4;

    await expect.poll(
      async () =>
        Math.abs(
          (await icon.boundingBox())!.x + (await icon.boundingBox())!.width / 2
          - (await root
            .boundingBox())!.x
          - quarter
        )
    )
      .toBeLessThan(1);
    await page.getByLabel('Timeline title span', { exact: true }).selectOption('8');

    const third = (await root.boundingBox())!.width / 3;

    await expect.poll(
      async () =>
        Math.abs(
          (await icon.boundingBox())!.x + (await icon.boundingBox())!.width / 2
          - (await root
            .boundingBox())!.x
          - third
        )
    )
      .toBeLessThan(1);
    await page.getByLabel('Timeline mode', { exact: true }).selectOption('alternate');

    await expect(root).not.toHaveAttribute('style', /--ant-timeline-head-span:/);
  }
);

test(
  'Timeline inherits dark compact tokens and RTL, merges semantic styles and recovers focus on removal',
  async ({ page }) => {
    await page.getByLabel('Dark Timeline', { exact: true }).check();
    await page.getByLabel('Compact Timeline', { exact: true }).check();
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Semantic Timeline', { exact: true }).check();

    const root = page.locator('#fixture-timeline');

    await expect(root).toHaveCSS('direction', 'rtl');
    await expect(root).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(root.locator('.custom-timeline-title').first()).toHaveCSS('font-weight', '700');
    await expect(root.locator('li').first()).toHaveCSS('padding-bottom', '10px');
    await expect(root.locator('.ant-timeline-item-rail').first()).toHaveCSS(
      'border-color',
      'rgba(253, 253, 253, 0.12)'
    );

    await page.getByRole('textbox', { name: 'Timeline draft', exact: true }).focus();
    await page.getByLabel('Mount Timeline', { exact: true })
      .evaluate((node: HTMLInputElement) => node.click());

    await expect(page.getByRole('button', { name: 'After Timeline', exact: true })).toBeFocused();
  }
);

test(
  'Timeline horizontal orientation retains source responsive behavior',
  async ({ page }) => {
    await page.getByLabel('Horizontal Timeline', { exact: true }).check();

    const root = page.locator('#fixture-timeline');

    await expect(root).toHaveClass(/ant-steps-horizontal/);

    await page.setViewportSize({ width: 575, height: 800 });

    await expect(root).toHaveClass(/ant-steps-vertical/);

    await expect(root).toHaveClass(/ant-timeline-horizontal/);
  }
);
