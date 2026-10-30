import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=float-button');

  await expect(page.locator('#fixture-float-button')).toBeVisible();
});

test(
  'FloatButton preserves fixed geometry and default icon size without an extra content box',
  async ({ page }) => {
    const fixed = page.locator('#fixture-fixed-float');

    await expect(fixed).toHaveCSS('position', 'fixed');
    await expect(fixed).toHaveCSS('width', '40px');
    await expect(fixed).toHaveCSS('height', '40px');
    await expect(fixed.locator('.anticon')).toHaveCSS('font-size', '18px');
    await expect(fixed.locator(':scope > span')).toHaveCount(1);

    const box = (await fixed.boundingBox())!;
    const viewport = page.viewportSize()!;

    expect(Math.abs(viewport.width - box.x - box.width - 24)).toBeLessThan(0.6);
    expect(Math.abs(viewport.height - box.y - box.height - 48)).toBeLessThan(0.6);
  }
);

test(
  'FloatButton keeps source content zero, legacy description, native submit and href',
  async ({ page }) => {
    const button = page.locator('#fixture-float-button');

    await page.getByLabel('FloatButton shape', { exact: true }).selectOption('square');
    await page.getByLabel('FloatButton content', { exact: true }).selectOption('zero');

    await expect(button).toHaveText('0');
    await expect(button.locator('.anticon')).toHaveCount(0);

    await button.click();

    await expect(page.getByLabel('FloatButton submissions', { exact: true }))
      .toHaveText('0');

    await page.getByLabel('FloatButton submit', { exact: true }).check();
    await button.click();

    await expect(page.getByLabel('FloatButton submissions', { exact: true }))
      .toHaveText('1');

    await page.getByLabel('FloatButton content', { exact: true }).selectOption('legacy');

    await expect(button).toHaveText('Old');

    await page.getByLabel('FloatButton href', { exact: true }).check();
    await button.click();

    await expect(page).toHaveURL(/#float-target$/);

    await page.getByLabel('Disable FloatButton', { exact: true }).check();

    await expect(button).not.toHaveAttribute('href');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  }
);

test(
  'FloatButton combines Badge and Tooltip zero/rich content without changing the control geometry',
  async ({ page }) => {
    const button = page.locator('#fixture-float-button');

    await page.getByLabel('FloatButton badge', { exact: true }).check();

    await expect(button.locator('.ant-badge-count')).toHaveText('5');
    await expect(button).toHaveCSS('height', '40px');

    await page.getByLabel('FloatButton tooltip', { exact: true }).selectOption('zero');
    await button.focus();

    await expect(page.getByRole('tooltip')).toHaveText('0');

    await page.keyboard.press('Escape');
    await page.getByLabel('FloatButton tooltip', { exact: true }).focus();
    await page.getByLabel('FloatButton tooltip', { exact: true }).selectOption('rich');
    await button.focus();

    await expect(page.getByRole('tooltip').locator('strong')).toHaveText('Floating help');

    await page.keyboard.press('Escape');
    await page.getByLabel('FloatButton badge dot', { exact: true }).check();

    await expect(button.locator('.ant-badge-dot')).toBeVisible();
  }
);

test(
  'FloatButtonGroup opens with native Enter, retains item clicks and closes only for outside clicks',
  async ({ page }) => {
    const group = page.locator('.fixture-floating-group');
    const trigger = group.getByRole('button', { name: 'Floating menu', exact: true });

    await expect(group.getByRole('button', { name: 'First floating child', exact: true }))
      .toHaveCount(0);

    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const first = group.getByRole('button', { name: 'First floating child', exact: true });

    await expect(first).toBeVisible();
    await expect(first).toHaveClass(/ant-float-btn-circle/);

    await first.click();

    await expect(page.getByLabel('Floating item clicks', { exact: true })).toHaveText('1');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Outside floating control', exact: true }).click();

    await expect(first).toHaveCount(0);
    await expect(page.getByLabel('Floating group changes', { exact: true }))
      .toHaveText('[true,false]');
  }
);

test(
  'FloatButtonGroup controlled requests respect owner rejection and hover disabled guard',
  async ({ page }) => {
    await page.getByLabel('Control floating group', { exact: true }).check();
    await page.getByLabel('Accept floating group requests', { exact: true }).uncheck();

    const group = page.locator('.fixture-floating-group');

    await group.getByRole('button', { name: 'Floating menu', exact: true }).click();

    await expect(group.getByRole('button', { name: 'First floating child', exact: true }))
      .toHaveCount(0);
    await expect(page.getByLabel('Floating group changes', { exact: true })).toHaveText('[true]');

    await page.getByLabel('Owner floating open', { exact: true }).check();

    await expect(group.getByRole('button', { name: 'First floating child', exact: true }))
      .toBeVisible();

    await page.getByLabel('Owner floating open', { exact: true }).uncheck();

    await expect(group.getByRole('button', { name: 'First floating child', exact: true }))
      .toHaveCount(0);

    await page.getByLabel('Floating group trigger', { exact: true }).selectOption('hover');
    await page.getByLabel('Disable floating group', { exact: true }).check();

    const changes = await page.getByLabel('Floating group changes', { exact: true }).textContent();

    await group.hover();

    await expect(page.getByLabel('Floating group changes', { exact: true }))
      .toHaveText(changes!);
  }
);

test(
  'FloatButtonGroup square joins structured and opaque tooltip children in vertical and RTL horizontal layouts',
  async ({ page }) => {
    await page.getByLabel('Floating group trigger', { exact: true }).selectOption({ label: 'None' });
    await page.getByLabel('Floating group shape', { exact: true }).selectOption('square');

    const group = page.locator('.fixture-floating-group');
    const first = group.getByRole('button', { name: 'First floating child', exact: true });
    const second = group.getByRole('button', { name: 'Second floating child', exact: true });

    await expect(first).toHaveCSS('border-end-start-radius', '0px');
    await expect(second).toHaveCSS('border-start-start-radius', '0px');

    const overlap = async () => {
      const a = (await first.boundingBox())!;
      const b = (await second.boundingBox())!;

      return b.y - a.y - a.height;
    };

    await expect.poll(overlap).toBeCloseTo(-1, 1);
    await page.getByLabel('Structured floating items', { exact: true }).uncheck();

    await expect(first).toHaveCSS('border-end-start-radius', '0px');
    await expect(second).toHaveCSS('border-start-start-radius', '0px');

    await expect.poll(overlap).toBeCloseTo(-1, 1);
    await page.getByLabel('Floating group placement', { exact: true }).selectOption('left');
    await page.getByLabel('Right to left', { exact: true }).check();

    await expect(group.locator('.ant-space-compact')).not.toHaveClass(/ant-space-compact-vertical/);
    await expect(second).toHaveCSS('border-start-start-radius', '0px');
  }
);

for (const placement of ['top', 'bottom', 'left', 'right'] as const)
  test(
    `FloatButtonGroup keeps physical ${placement} placement`,
    async ({ page }) => {
      await page.getByLabel('Floating group placement', { exact: true }).selectOption(placement);

      const group = page.locator('.fixture-floating-group');
      const trigger = group.getByRole('button', { name: 'Floating menu', exact: true });

      await trigger.click();

      const list = group.locator('.ant-float-btn-group-list');

      await expect(list).toBeVisible();

      await expect.poll(async () => {
        const a = (await trigger.boundingBox())!;
        const b = (await list.boundingBox())!;

        return placement === 'top'
          ? b.y + b.height < a.y
          : placement === 'bottom'
            ? b.y > a.y + a.height
            : placement === 'left' ? b.x + b.width < a.x : b.x > a.x + a.width;
      }).toBe(true);
    }
  );

test(
  'BackTop measures element progress and returns to zero with native click callbacks',
  async ({ page }) => {
    await expect(page.locator('#fixture-back-top')).toHaveCount(0);

    await page.getByRole('button', { name: 'Scroll floating target', exact: true }).click();

    const back = page.locator('#fixture-back-top');

    await expect(back).toBeVisible();
    await expect(back).toHaveCSS('--ant-float-btn-progress', '0.5turn');

    await back.click();
    await expect.poll(() => page.locator('#float-scroll').evaluate(node => node.scrollTop)).toBe(0);

    await expect(back).toHaveCount(0);
    await expect(page.getByLabel('BackTop clicks', { exact: true })).toHaveText('1');
  }
);

for (const target of ['window', 'document'] as const)
  test(
    `BackTop supports ${target} targets and reduced motion`,
    async ({ page }) => {
      await page.getByLabel('BackTop target', { exact: true }).selectOption(target);
      await page.evaluate(() => {
        document.body.style.minHeight = '4000px';
        window.scrollTo(0, 800);
      });

      const back = page.locator('#fixture-back-top');

      await expect(back).toBeVisible();

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await back.click();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

      await expect(back).toHaveCount(0);
    }
  );

test('FloatButton config icons and semantic layers remain reactive', async ({ page }) => {
  await page.getByLabel('Configure floating icons', { exact: true }).check();
  await page.getByLabel('FloatButton semantic layers', { exact: true }).check();

  await expect(page.locator('#fixture-float-button')).toHaveCSS('color', 'rgb(0, 0, 255)');

  const group = page.locator('.fixture-floating-group');

  await group.getByRole('button', { name: 'Floating menu', exact: true }).click();

  await expect(group.getByTestId('float-context-close')).toBeVisible();
  await expect(group.getByRole('button', { name: 'First floating child', exact: true }))
    .toHaveClass(/float-item/);

  await page.getByRole('button', { name: 'Scroll floating target', exact: true }).click();

  await expect(page.locator('#fixture-back-top').getByTestId('float-context-back')).toBeVisible();
});
