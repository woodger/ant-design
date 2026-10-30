import type { Page } from '@playwright/test';
import { test, expect } from './test';

const standalone = (page: Page) => page.locator('#fixture-spin');
const wrapper = (page: Page) => page.locator('#fixture-spin-wrapper');
const container = (page: Page) => wrapper(page).locator('.ant-spin-container');
const input = (page: Page) => page.getByRole('textbox', { name: 'Spin child input', exact: true });
const rawInput = (page: Page) => wrapper(page).locator('input').first();
const indicator = (page: Page) => wrapper(page).locator('.ant-spin-section');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const setting = (page: Page, name: string, value: string) =>
  page.getByRole('combobox', { name: `Spin ${name}`, exact: true })
    .selectOption(value);

test.beforeEach(async ({ page }) => {
  const time = new Date('2026-10-27T12:00:00Z');

  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('/?fixture=spin');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true }))
    .toBeVisible();
});

test(
  'Spin starts inactive with retained available content and exposes a polite loading status',
  async ({ page }, testInfo) => {
    await expect(standalone(page)).toBeHidden();
    await expect(container(page)).toHaveAttribute('aria-busy', 'false');
    await expect(container(page)).not.toHaveAttribute('inert');
    await expect(input(page)).toHaveValue('Initial child draft');

    await button(page, 'Start Spin loading').click();

    await expect(standalone(page)).toHaveRole('status');
    await expect(standalone(page)).toHaveAccessibleName('Loading profile');
    await expect(standalone(page)).toHaveAttribute('aria-live', 'polite');
    await expect(standalone(page).locator('.ant-spin-dot-item')).toHaveCount(4);
    await expect(standalone(page).locator('.ant-spin-dot')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(wrapper(page)).toHaveRole('group');
    await expect(wrapper(page)).not.toHaveAttribute('aria-live');
    await expect(indicator(page)).toHaveRole('status');
    await expect(container(page)).toHaveAttribute('inert', '');

    await wrapper(page).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('spin-light.png') });
  }
);

test(
  'Spin blocks content immediately and skips indicators for a short request within its delay',
  async ({ page }) => {
    await setting(page, 'delay', '500');
    await input(page).fill('Keep this draft');
    await page.keyboard.press('Control+Alt+z');

    await expect(container(page)).toHaveAttribute('aria-busy', 'true');
    await expect(container(page)).toHaveAttribute('inert', '');
    await expect(wrapper(page)).toBeFocused();
    await expect(indicator(page)).toHaveCount(0);
    await expect(standalone(page)).toBeHidden();

    await page.clock.fastForward(100);
    await page.keyboard.press('Control+Alt+z');
    await page.clock.fastForward(1000);

    await expect(indicator(page)).toHaveCount(0);
    await expect(container(page)).toHaveAttribute('aria-busy', 'false');
    await expect(input(page)).toBeFocused();
    await expect(input(page)).toHaveValue('Keep this draft');
  }
);

test(
  'Spin shows delayed indicators and restarts a changed delay without a stale appearance',
  async ({ page }) => {
    await setting(page, 'delay', '200');
    await button(page, 'Start Spin loading').click();
    await page.clock.fastForward(250);

    await expect(indicator(page)).toBeVisible();

    await setting(page, 'delay', '500');

    await expect(indicator(page)).toHaveCount(0);

    await page.clock.fastForward(100);

    await expect(indicator(page)).toHaveCount(0);

    await page.clock.fastForward(500);

    await expect(indicator(page)).toBeVisible();

    await button(page, 'Finish Spin loading').click();

    await expect(indicator(page)).toHaveCount(0);

    await button(page, 'Start Spin loading').click();

    await expect(indicator(page)).toHaveCount(0);
  }
);

test(
  'Spin switches pending requests to immediate display and normalizes invalid delays',
  async ({ page }) => {
    await setting(page, 'delay', '500');
    await button(page, 'Start Spin loading').click();
    await setting(page, 'delay', '0');

    await expect(indicator(page)).toBeVisible();

    await setting(page, 'delay', '-1');

    await expect(indicator(page)).toBeVisible();

    await button(page, 'Finish Spin loading').click();
    await page.clock.fastForward(1000);

    await expect(indicator(page)).toHaveCount(0);
  }
);

test(
  'Spin preserves DOM identity, child state, native drafts and checkbox values across loading',
  async ({ page }) => {
    const original = await input(page).elementHandle();

    await input(page).fill('Unsent draft');
    await page.getByRole('checkbox', { name: 'Spin child checkbox', exact: true }).check();
    await button(page, 'Spin child counter').click();
    await button(page, 'Start Spin loading').click();
    await page.clock.fastForward(1000);
    await button(page, 'Finish Spin loading').click();

    await expect(input(page)).toHaveValue('Unsent draft');
    await expect(page.getByRole('checkbox', { name: 'Spin child checkbox', exact: true }))
      .toBeChecked();
    await expect(page.getByRole('status', { name: 'Spin child count', exact: true }))
      .toHaveText('1');
    expect(await input(page).evaluate((node, old) => node === old, original)).toBe(true);
  }
);

test(
  'Spin parks focused content outside inert and restores the original input without stealing outside focus',
  async ({ page }) => {
    await input(page).fill('Focused draft');
    await page.keyboard.press('Control+Alt+z');

    await expect(wrapper(page)).toBeFocused();

    await rawInput(page).evaluate((node) => (node as HTMLInputElement).focus());

    await expect(wrapper(page)).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(button(page, 'After Spin')).toBeFocused();

    await page.keyboard.press('Control+Alt+z');

    await expect(button(page, 'After Spin')).toBeFocused();

    await input(page).focus();
    await page.keyboard.press('Control+Alt+z');

    await expect(wrapper(page)).toBeFocused();

    await page.keyboard.press('Control+Alt+z');

    await expect(input(page)).toBeFocused();
  }
);

test('Spin recovers focus when the saved field is replaced while loading', async ({ page }) => {
  await input(page).focus();
  await page.keyboard.press('Control+Alt+z');

  await expect(wrapper(page)).toBeFocused();

  await page.keyboard.press('Control+Alt+i');
  await page.keyboard.press('Control+Alt+z');

  await expect(page.getByRole('textbox', { name: 'Replacement Spin input', exact: true }))
    .toBeFocused();
});

test(
  'Spin never focuses an outside field when loading starts from outside its content',
  async ({ page }) => {
    const outside = page.getByRole('textbox', { name: 'Spin outside input', exact: true });

    await outside.fill('Outside focus');
    await page.keyboard.press('Control+Alt+z');

    await expect(outside).toBeFocused();

    await page.keyboard.press('Control+Alt+z');

    await expect(outside).toBeFocused();
  }
);

test(
  'Spin unmount cancels pending appearance and moves parked focus to an available neighbor',
  async ({ page }) => {
    await setting(page, 'delay', '500');
    await input(page).focus();
    await page.keyboard.press('Control+Alt+z');

    await expect(wrapper(page)).toBeFocused();

    await page.keyboard.press('Control+Alt+h');

    await expect(wrapper(page)).toHaveCount(0);
    await expect(button(page, 'After Spin')).toBeFocused();

    await page.clock.fastForward(1000);
    await page.keyboard.press('Control+Alt+z');
    await page.keyboard.press('Control+Alt+h');

    await expect(input(page)).toHaveValue('Initial child draft');
    await expect(indicator(page)).toHaveCount(0);
  }
);

test('Spin content and description changes do not restart an existing delay', async ({ page }) => {
  await setting(page, 'delay', '500');
  await button(page, 'Start Spin loading').click();
  await page.clock.fastForward(300);
  await page.getByRole('textbox', { name: 'Spin description', exact: true })
    .fill('Updated description');
  await page.clock.fastForward(250);

  await expect(indicator(page)).toHaveAccessibleName('Updated description');
});

for (const [size, width] of [['small', 14], ['medium', 20], ['large', 32]] as const) {
  test(`Spin supports ${size} indicators and inherits ConfigProvider size`, async ({ page }) => {
    await setting(page, 'size', size);
    await button(page, 'Start Spin loading').click();

    await expect(standalone(page).locator('.ant-spin-dot')).toHaveCSS(
      'width',
      `${width}px`
    );

    await setting(page, 'size', 'inherit');
    await setting(page, 'provider size', size === 'medium' ? 'middle' : size);

    await expect(standalone(page).locator('.ant-spin-dot')).toHaveCSS('width', `${width}px`);
  });
}

test(
  'Spin supports passive description and indicator snippets and decorative mode',
  async ({ page }) => {
    await page.getByLabel('Rich Spin description', { exact: true }).check();
    await page.getByLabel('Custom Spin indicator', { exact: true }).check();
    await button(page, 'Start Spin loading').click();

    await expect(standalone(page).locator('strong'))
      .toHaveText('Rich loading description');
    await expect(standalone(page).locator('.ant-spin-dot')).toHaveText('★');
    await expect(standalone(page).locator('.ant-spin-dot-item')).toHaveCount(0);

    await page.getByLabel('Decorative Spin', { exact: true }).check();

    await expect(standalone(page)).not.toHaveAttribute('role');
    await expect(standalone(page)).not.toHaveAttribute('aria-live');
  }
);

test('Spin inherits live locale, RTL and dark compact theme tokens', async ({ page }, testInfo) => {
  await page.getByRole('textbox', { name: 'Spin description', exact: true }).fill('');
  await page.getByLabel('English locale', { exact: true }).check();
  await button(page, 'Start Spin loading').click();

  await expect(standalone(page)).toHaveAccessibleName('Loading…');

  await page.getByLabel('Custom Spin locale', { exact: true }).check();

  await expect(standalone(page)).toHaveAccessibleName('Custom loading');

  for (const name of ['Right to left', 'Dark Spin theme', 'Compact Spin theme'])
    await page.getByLabel(name, { exact: true }).check();

  await expect(standalone(page)).toHaveCSS('direction', 'rtl');
  await expect(standalone(page)).toHaveCSS('font-size', '12px');
  await expect(standalone(page)).toHaveCSS('color', 'rgb(114, 46, 209)');

  await wrapper(page).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('spin-dark-rtl.png') });
});

test(
  'Spin obeys reduced motion dynamically for standard and custom indicators',
  async ({ page }) => {
    await button(page, 'Start Spin loading').click();
    await expect.poll(
      () =>
        standalone(page)
          .evaluate((node) => node.getAnimations({ subtree: true }).length)
    )
      .toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(
      () =>
        standalone(page)
          .evaluate((node) => node.getAnimations({ subtree: true }).length)
    )
      .toBe(0);

    await expect(container(page)).toHaveCSS('transition-duration', '0s');

    await page.getByLabel('Custom Spin indicator', { exact: true }).check();

    expect(await standalone(page).evaluate((node) => node.getAnimations({ subtree: true }).length))
      .toBe(0);
  }
);

test('Spin keeps feedback visible when ConfigProvider disables controls', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await button(page, 'Start Spin loading').click();

  await expect(standalone(page)).toBeVisible();

  await button(page, 'Finish Spin loading').click();

  await expect(container(page)).not.toHaveAttribute('inert');
});

for (const kind of ['Modal', 'Drawer']) {
  test(
    `Spin parks and restores focus within ${kind} and leaves Escape to its host`,
    async ({ page }) => {
      await button(page, `Open Spin ${kind}`).click();

      const host = page.getByRole(
        'dialog',
        { name: `Spin host ${kind.toLowerCase()}`, exact: true }
      );
      const field = host.getByRole('textbox', { name: `${kind} Spin input`, exact: true });

      await field.fill('Host draft');

      const shortcut = kind === 'Modal' ? 'Control+Alt+w' : 'Control+Alt+e';
      const spin = page.locator(kind === 'Modal' ? '#modal-spin' : '#drawer-spin');

      await page.keyboard.press(shortcut);

      await expect(spin).toBeFocused();

      await page.keyboard.press(shortcut);

      await expect(field).toBeFocused();
      await expect(field).toHaveValue('Host draft');

      await page.keyboard.press(shortcut);

      await expect(spin).toBeFocused();

      await page.keyboard.press('Escape');

      await expect(host).toBeHidden();
      await expect(button(page, `Open Spin ${kind}`)).toBeFocused();
    }
  );
}

test.describe('mobile Spin', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test(
    'wraps long descriptions and keeps cancellation outside the blocked region reachable',
    async ({ page }, testInfo) => {
      await page.getByRole('textbox', { name: 'Spin description', exact: true })
        .fill('VeryLongLoadingDescriptionWithoutSpaces'.repeat(8));
      await button(page, 'Start Spin loading').tap();

      await expect(indicator(page)).toBeVisible();

      const box = (await indicator(page).boundingBox())!;

      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(375);

      const bounds = (await wrapper(page).boundingBox())!;

      expect(box.y).toBeGreaterThanOrEqual(bounds.y);
      expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height);

      await expect.poll(
        () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
        .toBe(true);
      await wrapper(page).scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath('spin-mobile.png') });
      await button(page, 'Finish Spin loading').tap();

      await expect(container(page)).not.toHaveAttribute('inert');
    }
  );
});
