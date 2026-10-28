import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=segmented');
  await expect(page.locator('#fixture-segmented')).toBeVisible();
});

test('Segmented selects typed values and keeps external changes silent and independent', async ({ page }) => {
  const root = page.getByRole('radiogroup', { name: 'Period', exact: true });
  await expect(root.getByRole('radio', { name: 'Zero', exact: true })).toBeChecked();
  await root.getByText('Weekly', { exact: true }).click();
  await expect(page.getByRole('status', { name: 'Segmented value', exact: true })).toHaveText('string:week');
  await root.getByText('Zero', { exact: true }).click();
  await expect(page.getByRole('status', { name: 'Segmented value', exact: true })).toHaveText('number:0');
  await page.getByRole('button', { name: 'Set weekly externally' }).click();
  await expect(root.getByRole('radio', { name: 'Weekly', exact: true })).toBeChecked();
  await expect(page.getByRole('status', { name: 'Segmented changes', exact: true })).toHaveText('2');
  await page.getByRole('button', { name: 'Set missing externally' }).click();
  await expect(root.locator('input:checked')).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Independent period' }).getByRole('radio', { name: 'Daily' })).toBeChecked();
});

test('Segmented cycles source order in RTL and both orientations while skipping disabled options', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  await page.getByLabel('Disabled weekly option').check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await root.getByRole('radio', { name: 'Zero', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('radio', { name: 'Monthly', exact: true })).toBeChecked();
  await expect(root.getByRole('radio', { name: 'Monthly', exact: true })).toBeFocused();
  await page.getByLabel('Vertical Segmented alias').check();
  await expect(root).toHaveAttribute('aria-orientation', 'vertical');
  await root.getByRole('radio', { name: 'Monthly', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(root.getByRole('radio', { name: 'Zero', exact: true })).toBeChecked();
  await page.getByRole('combobox', { name: 'Segmented orientation' }).selectOption('horizontal');
  await expect(root).toHaveAttribute('aria-orientation', 'horizontal');
  await page.getByLabel('Disabled Segmented', { exact: true }).check();
  await expect(root.locator('input:enabled')).toHaveCount(0);
});

test('Segmented retains keyed selections and model values across reordering removal and native reset', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  await root.getByText('Monthly', { exact: true }).click();
  const handle = await root.getByRole('radio', { name: 'Monthly' }).elementHandle();
  await page.getByLabel('Reverse Segmented options').check();
  expect(await root.getByRole('radio', { name: 'Monthly' }).evaluate((node, previous) => node === previous, handle)).toBe(true);
  await page.getByRole('button', { name: 'Reset Segmented form' }).click();
  await expect(root.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  await page.getByLabel('Remove monthly option').check();
  await expect(root.locator('input:checked')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Segmented value', exact: true })).toHaveText('string:month');
  await page.getByLabel('Remove monthly option').uncheck();
  await expect(root.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  const data = await page.getByRole('form', { name: 'Segmented form' }).evaluate(form => [...new FormData(form as HTMLFormElement).entries()]);
  expect(data).toEqual([['period', 'on']]);
});

test('Segmented applies sizes, round block appearance, semantic snippets and dark compact tokens', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  for (const [size, height] of [['small', 24], ['middle', 32], ['large', 40]] as const) {
    await page.getByRole('combobox', { name: 'Segmented size', exact: true }).selectOption(size);
    expect((await root.boundingBox())!.height).toBe(height);
  }
  await page.getByRole('combobox', { name: 'Segmented shape' }).selectOption('round');
  await expect(root).toHaveCSS('border-radius', '9999px');
  await page.getByLabel('Block Segmented').check();
  await expect(root).toHaveCSS('display', 'flex');
  await page.getByLabel('Rich Segmented labels').check();
  await page.getByLabel('Custom Segmented slots').check();
  await expect(root.locator('strong')).toHaveText('Weekly');
  await expect(root.locator('.custom-segmented-icon svg')).toBeVisible();
  await expect(root.locator('.custom-segmented-label').first()).toHaveCSS('font-style', 'italic');
  await page.getByLabel('Dark Segmented theme').check();
  await page.getByLabel('Compact Segmented theme').check();
  await page.getByRole('combobox', { name: 'Segmented size', exact: true }).selectOption('middle');
  expect((await root.boundingBox())!.height).toBe(28);
  await expect(root).toHaveCSS('background-color', 'rgb(0, 0, 0)');
});

test('Segmented follows upstream explicit disabled semantics and its gallery hydrates', async ({ page, request }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(page.locator('#fixture-segmented input:enabled')).toHaveCount(3);
  const response = await request.get('/ant-design');
  expect(await response.text()).toContain('id="segmented"');
  await page.goto('/ant-design#segmented');
  const section = page.locator('#segmented');
  await expect(section.locator('strong')).toHaveText('58');
  await section.getByText('Месяц', { exact: true }).click();
  await expect(section.locator('strong')).toHaveText('211');
});

test('Segmented moves a single thumb between measured options and cleans it up after rapid changes', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  await root.evaluate(node => (node as HTMLElement).style.setProperty('--ant-motion-duration-slow', '2s'));
  await root.getByText('Monthly', { exact: true }).click();
  const thumb = root.locator('.ant-segmented-thumb');
  await expect(thumb).toHaveCount(1);
  await expect(root.locator('.ant-segmented-item-selected')).toHaveCount(0);
  await expect(root.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  const endpoints = await thumb.evaluate(node => {
    const effect = node.getAnimations()[0].effect;
    if (!(effect instanceof KeyframeEffect)) throw new Error('Missing thumb keyframes');
    return effect.getKeyframes();
  });
  expect(endpoints[0].transform).not.toBe(endpoints[1].transform);
  await root.getByText('Weekly', { exact: true }).click();
  await expect(thumb).toHaveCount(1);
  await thumb.evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
  await expect(thumb).toHaveCount(0);
  await expect(root.locator('.ant-segmented-item-selected')).toContainText('Weekly');
  await expect(root.getByRole('radio', { name: 'Weekly' })).toBeChecked();
});

test('Segmented cancels motion on resize, removal and reduced motion changes', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  await page.getByLabel('Block Segmented').check();
  await root.evaluate(node => (node as HTMLElement).style.setProperty('--ant-motion-duration-slow', '2s'));
  await root.getByText('Monthly', { exact: true }).click();
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(1);
  await page.setViewportSize({ width: 800, height: 800 });
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(0);
  await root.getByText('Weekly', { exact: true }).click();
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(0);
  await root.getByText('Zero', { exact: true }).click();
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await root.getByText('Monthly', { exact: true }).click();
  await page.getByLabel('Remove monthly option').check();
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(0);
  await root.getByText('Weekly', { exact: true }).click();
  await root.getByText('Zero', { exact: true }).click();
  await expect(root.locator('.ant-segmented-thumb')).toHaveCount(1);
  const animation = await root.locator('.ant-segmented-thumb').evaluateHandle(node => node.getAnimations()[0]);
  await page.getByLabel('Mount Segmented').uncheck();
  await expect(root).toHaveCount(0);
  expect(await animation.evaluate(value => value.playState)).toBe('idle');
});

test('Segmented thumb ends on the selected option in RTL and vertical layouts', async ({ page }) => {
  const root = page.locator('#fixture-segmented');
  for (const vertical of [false, true]) {
    await page.getByLabel('Vertical Segmented alias').setChecked(vertical);
    await page.getByLabel('Right to left', { exact: true }).setChecked(true);
    await root.evaluate(node => (node as HTMLElement).style.setProperty('--ant-motion-duration-slow', '2s'));
    await root.getByText('Zero', { exact: true }).click();
    await root.getByText('Monthly', { exact: true }).click();
    const thumb = root.locator('.ant-segmented-thumb');
    await expect(thumb).toHaveCount(1);
    await thumb.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));
    await thumb.evaluate(node => { const animation = node.getAnimations()[0]; animation.currentTime = Number(animation.effect!.getTiming().duration) - 1; });
    const overlay = (await thumb.boundingBox())!;
    const target = (await root.locator('label').filter({ hasText: 'Monthly' }).boundingBox())!;
    expect(Math.abs(overlay.x - target.x)).toBeLessThan(1);
    expect(Math.abs(overlay.y - target.y)).toBeLessThan(1);
    expect(Math.abs(overlay.width - target.width)).toBeLessThan(1);
    await thumb.evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
    await expect(thumb).toHaveCount(0);
  }
});
