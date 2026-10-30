import type { Page } from '@playwright/test';
import { test, expect } from './test';

const message = (page: Page) => page.locator('#fixture-alert');
const close = (page: Page) => message(page).getByRole('button', { name: 'Закрыть', exact: true });
const events = (page: Page) => page.getByRole('status', { name: 'Alert events', exact: true });
const after = (page: Page) => page.getByRole('button', { name: 'After Alert', exact: true });

async function setting(page: Page, name: string, value: string) {
  await page.getByRole('combobox', { name: `Alert ${name}`, exact: true })
    .selectOption(value);
}

async function closeAndPauseMotion(page: Page) {
  // Короткая анимация может завершиться до следующего evaluate после click.
  await message(page).evaluate((element) => {
    const animate = element.animate;
    element.animate = (keyframes, options) => {
      element.animate = animate;
      const motion = animate.call(element, keyframes, options);
      motion.pause();

      return motion;
    };
  });
  await close(page).click();
  const count = await message(page).evaluate((element) => element.getAnimations().length);
  expect(count).toBeGreaterThan(0);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=alert');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true }))
    .toBeVisible();
});

test(
  'Alert presents a named atomic status with description and decorative filled icons',
  async ({ page }, testInfo) => {
    await expect(message(page)).toHaveRole('status');
    await expect(message(page)).toHaveAccessibleName('Fixture message');
    await expect(message(page)).toHaveAttribute('aria-atomic', 'true');
    await expect(message(page)).toContainText('Alert title');
    await expect(message(page)).toContainText('Additional alert detail');
    await expect(message(page).locator('.ant-alert-icon')).toHaveAttribute('aria-hidden', 'true');
    await expect(message(page).locator('.ant-alert-icon svg')).toHaveAttribute(
      'viewBox',
      '0 0 1024 1024'
    );

    await message(page).screenshot({ path: testInfo.outputPath('alert-light.png') });
  }
);

test(
  'Alert distinguishes all four types with their colors and status icon shapes',
  async ({ page }) => {
    const backgrounds = new Set<string>();
    const paths = new Set<string | null>();

    for (const type of ['success', 'info', 'warning', 'error']) {
      await setting(page, 'type', type);
      await expect(message(page)).toHaveClass(new RegExp(`ant-alert-${type}`));
      backgrounds.add(
        await message(page).evaluate((element) => getComputedStyle(element).backgroundColor)
      );
      paths.add(await message(page).locator('.ant-alert-icon path').getAttribute('d'));
    }

    expect(backgrounds.size).toBe(4);
    expect(paths.size).toBe(4);
  }
);

test(
  'Alert filled appearance hides the border while retaining its background and actions',
  async ({ page }) => {
    const background = await message(page)
      .evaluate((element) =>
        getComputedStyle(element).backgroundColor);

    await setting(page, 'variant', 'filled');

    await expect(message(page)).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(message(page)).toHaveCSS('background-color', background);
    await expect(message(page).getByRole('button', { name: 'Alert retry', exact: true }))
      .toBeVisible();
  }
);

test(
  'Alert banner defaults to warning with an icon and respects explicit type and icon overrides',
  async ({ page }) => {
    await page.getByLabel('Explicit Alert type', { exact: true }).uncheck();
    await page.getByLabel('Explicit Alert icon visibility', { exact: true }).uncheck();

    await expect(message(page)).toHaveClass(/ant-alert-info/);
    await expect(message(page).locator('.ant-alert-icon')).toHaveCount(0);

    await page.getByLabel('Banner Alert', { exact: true }).check();

    await expect(message(page)).toHaveClass(/ant-alert-warning/);
    await expect(message(page).locator('.ant-alert-icon')).toBeVisible();
    await expect(message(page)).toHaveCSS('border-top-width', '0px');
    await expect(message(page)).toHaveCSS('border-top-left-radius', '0px');

    await page.getByLabel('Explicit Alert type', { exact: true }).check();
    await setting(page, 'type', 'success');
    await page.getByLabel('Explicit Alert icon visibility', { exact: true }).check();
    await page.getByLabel('Show Alert icon', { exact: true }).uncheck();

    await expect(message(page)).toHaveClass(/ant-alert-success/);
    await expect(message(page).locator('.ant-alert-icon')).toHaveCount(0);
  }
);

test(
  'Alert renders rich content and custom icons without losing independent form drafts',
  async ({ page }) => {
    await page.getByLabel('Rich Alert content', { exact: true }).check();

    await expect(message(page).locator('strong')).toHaveText('Rich alert title');

    await message(page).getByRole('textbox', { name: 'Alert note', exact: true })
      .fill('Local alert draft');
    await page.getByLabel('Custom Alert icon', { exact: true }).check();

    await expect(message(page).locator('.ant-alert-icon')).toHaveText('Custom alert icon');

    await page.getByLabel('Show Alert icon', { exact: true }).uncheck();

    await expect(message(page).locator('.ant-alert-icon')).toHaveCount(0);

    await setting(page, 'type', 'error');

    await expect(message(page).getByRole('textbox', { name: 'Alert note', exact: true }))
      .toHaveValue('Local alert draft');
  }
);

test(
  'Alert supports boolean closability and keeps callbacks absent when no config was provided',
  async ({ page }) => {
    await page.getByLabel('Closable Alert', { exact: true }).uncheck();

    await expect(close(page)).toHaveCount(0);

    await page.getByLabel('Boolean Alert closing', { exact: true }).check();
    await page.getByLabel('Closable Alert', { exact: true }).check();
    await close(page).click();

    await expect(message(page)).toHaveCount(0);
    await expect(events(page)).toHaveText('[]');
  }
);

test(
  'Alert closes once, runs afterClose after DOM removal and moves focus to the next control',
  async ({ page }) => {
    await close(page).click();

    await expect(message(page)).toHaveCount(0);
    await expect(events(page)).toHaveText('["close:click","after:removed"]');
    await expect(after(page)).toBeFocused();
    await expect(page.getByRole('status', { name: 'Alert submissions', exact: true }))
      .toHaveText('0');
  }
);

for (const key of ['Enter', 'Space']) {
  test(
    `Alert native close button responds to ${key} without submitting its form`,
    async ({ page }) => {
      await close(page).focus();
      await page.keyboard.press(key);

      await expect(message(page)).toHaveCount(0);
      await expect(events(page)).toHaveText('["close:click","after:removed"]');
      await expect(page.getByRole('status', { name: 'Alert submissions', exact: true }))
        .toHaveText('0');
    }
  );
}

test(
  'Alert leaves ordinary Tab order to its action and close buttons without focusing on updates',
  async ({ page }) => {
    const before = page.getByRole('button', { name: 'Before Alert', exact: true });

    await before.focus();
    await page.keyboard.press('Tab');

    await expect(message(page).getByRole('button', { name: 'Alert retry', exact: true }))
      .toBeFocused();

    await page.keyboard.press('Tab');

    await expect(close(page)).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(after(page)).toBeFocused();

    await setting(page, 'type', 'warning');

    await expect(after(page)).toBeFocused();
  }
);

test('Alert respects disabled closing independently of other actions', async ({ page }) => {
  await page.getByLabel('Disable Alert closing', { exact: true }).check();

  await expect(close(page)).toBeDisabled();

  await message(page).getByRole('button', { name: 'Alert retry', exact: true }).click();

  await expect(message(page)).toBeVisible();
  await expect(events(page)).toHaveText('[]');
  await expect(page.getByRole('status', { name: 'Alert actions', exact: true })).toHaveText('1');
});

test(
  'Alert closing remains available when ConfigProvider disables form controls',
  async ({ page }) => {
    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(message(page).getByRole('button', { name: 'Alert retry', exact: true }))
      .toBeDisabled();
    await expect(close(page)).toBeEnabled();

    await close(page).click();

    await expect(message(page)).toHaveCount(0);
  }
);

test(
  'Alert keeps its DOM during the exit animation while suppressing repeated activation and live announcements',
  async ({ page }) => {
    await closeAndPauseMotion(page);

    await expect(message(page)).toHaveAttribute('inert', '');
    await expect(message(page)).toHaveAttribute('aria-hidden', 'true');
    await expect(events(page)).toHaveText('["close:click"]');

    await message(page).locator('.ant-alert-close-icon').dispatchEvent('click');

    await expect(events(page)).toHaveText('["close:click"]');

    await message(page).evaluate(
      (element) => { for (const motion of element.getAnimations()) motion.finish(); }
    );

    await expect(message(page)).toHaveCount(0);
    await expect(events(page)).toHaveText('["close:click","after:removed"]');
  }
);

test(
  'Alert completes immediately with reduced motion and finishes a paused exit when the preference changes',
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await close(page).click();

    await expect(message(page)).toHaveCount(0);
    await expect(events(page)).toHaveText('["close:click","after:removed"]');

    await page.getByRole('button', { name: 'Restore Alert', exact: true }).click();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await closeAndPauseMotion(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect(message(page)).toHaveCount(0);
    await expect(events(page)).toHaveText(
      '["close:click","after:removed","close:click","after:removed"]'
    );
  }
);

test(
  'Alert cancels its exit and late callbacks when unmounted and can mount a fresh instance',
  async ({ page }) => {
    await closeAndPauseMotion(page);
    await page.keyboard.press('Control+Alt+q');

    await expect(message(page)).toHaveCount(0);

    await page.keyboard.press('Control+Alt+q');

    await expect(message(page)).toBeVisible();
    await expect(events(page)).toHaveText('["close:click"]');
  }
);

test(
  'Alert does not notify afterClose when the close callback removes the component',
  async ({ page }) => {
    await page.getByLabel('Unmount Alert on close request', { exact: true }).check();
    await close(page).click();

    await expect(message(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Restore Alert', exact: true }).click();

    await expect(message(page)).toBeVisible();
    await expect(events(page)).toHaveText('["close:click"]');
  }
);

test('Alert does not let an old closing instance remove its replacement', async ({ page }) => {
  await page.getByLabel('Replace Alert on close request', { exact: true }).check();
  await close(page).click();

  await expect(message(page)).toBeVisible();
  await expect(message(page)).not.toHaveAttribute('inert');
  await expect(events(page)).toHaveText('["close:click"]');
});

test(
  'Alert stays closed after prop changes and resets only when its instance is recreated',
  async ({ page }) => {
    await close(page).click();

    await expect(message(page)).toHaveCount(0);

    await setting(page, 'type', 'error');

    await expect(message(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Restore Alert', exact: true }).click();

    await expect(message(page)).toBeVisible();
    await expect(message(page)).toHaveClass(/ant-alert-error/);
  }
);

test('Alert preserves a focus destination explicitly chosen by its owner', async ({ page }) => {
  await page.getByLabel('Focus Alert owner on close', { exact: true }).check();
  await close(page).click();

  await expect(message(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Before Alert', exact: true })).toBeFocused();
});

test('Alert does not move outside focus during programmatic dismissal', async ({ page }) => {
  const before = page.getByRole('button', { name: 'Before Alert', exact: true });

  await before.focus();
  await close(page).evaluate((element) => (element as HTMLButtonElement).click());

  await expect(message(page)).toHaveCount(0);
  await expect(before).toBeFocused();
});

test(
  'Alert actions operate independently of dismissal and do not submit the surrounding form',
  async ({ page }) => {
    const retry = message(page).getByRole('button', { name: 'Alert retry', exact: true });

    await retry.click();
    await retry.press('Enter');

    await expect(page.getByRole('status', { name: 'Alert actions', exact: true })).toHaveText('2');
    await expect(page.getByRole('status', { name: 'Alert submissions', exact: true }))
      .toHaveText('0');
    await expect(events(page)).toHaveText('[]');
    await expect(message(page)).toBeVisible();
  }
);

test(
  'Alert localizes its close label and supports custom visible close content',
  async ({ page }) => {
    await page.getByLabel('Custom Alert close text', { exact: true }).check();
    await page.getByLabel('Custom Alert close label', { exact: true }).check();

    const custom = message(page).getByRole('button', { name: 'Hide notification', exact: true });

    await expect(custom).toHaveText('Dismiss');

    await custom.click();

    await expect(message(page)).toHaveCount(0);

    await page.getByLabel('Custom Alert close label', { exact: true }).uncheck();
    await page.getByLabel('English locale', { exact: true }).check();
    await page.getByRole('button', { name: 'Restore Alert', exact: true }).click();

    await expect(message(page).getByRole('button', { name: 'Close', exact: true }))
      .toHaveText('Dismiss');
  }
);

test(
  'Alert adapts error colors, compact typography and RTL ordering',
  async ({ page }, testInfo) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Dark Alert theme', { exact: true }).check();
    await page.getByLabel('Compact Alert theme', { exact: true }).check();
    await setting(page, 'type', 'error');

    await expect(message(page)).toHaveCSS('direction', 'rtl');
    await expect(message(page)).toHaveCSS('background-color', 'rgb(44, 22, 24)');
    await expect(message(page)).toHaveCSS('font-size', '12px');

    const icon = (await message(page).locator('.ant-alert-icon').boundingBox())!;
    const section = (await message(page).locator('.ant-alert-section').boundingBox())!;
    const button = (await close(page).boundingBox())!;

    expect(icon.x).toBeGreaterThan(section.x);
    expect(button.x).toBeLessThan(section.x);

    await message(page).screenshot({ path: testInfo.outputPath('alert-dark-rtl.png') });
  }
);

test('Alert switches between polite and assertive roles without taking focus', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Alert role', exact: true }).focus();
  await setting(page, 'role', 'alert');

  await expect(message(page)).toHaveRole('alert');
  await expect(message(page)).toHaveAttribute('aria-atomic', 'true');
  await expect(page.getByRole('combobox', { name: 'Alert role', exact: true })).toBeFocused();

  await setting(page, 'role', 'status');

  await expect(message(page)).toHaveRole('status');
});

test(
  'Alert dismissal inside Modal keeps focus in its host and leaves Escape available',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Open Alert Modal', exact: true }).click();

    const host = page.getByRole('dialog', { name: 'Alert host modal', exact: true });

    await host.locator('#modal-alert').getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(host.locator('#modal-alert')).toHaveCount(0);
    await expect(host.getByRole('button', { name: 'After modal alert', exact: true })).toBeFocused();
    await expect(host).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(host).toBeHidden();
  }
);

test(
  'Alert dismissal inside Drawer keeps focus inside the active native dialog',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Open Alert Drawer', exact: true }).click();

    const host = page.getByRole('dialog', { name: 'Alert host drawer', exact: true });

    await host.locator('#drawer-alert').getByRole('button', { name: 'Закрыть', exact: true })
      .click();

    await expect(host.locator('#drawer-alert')).toHaveCount(0);
    await expect(host.getByRole('button', { name: 'After drawer alert', exact: true }))
      .toBeFocused();
    await expect(host).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(host).toBeHidden();
  }
);

test.describe('mobile Alert', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test(
    'wraps long messages and keeps action and touch dismissal reachable',
    async ({ page }, testInfo) => {
      await page.getByLabel('Long Alert content', { exact: true }).check();
      await message(page).getByRole('button', { name: 'Alert retry', exact: true }).tap();

      await expect(message(page)).toBeVisible();

      await expect.poll(
        () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
        .toBe(true);

      const section = (await message(page).locator('.ant-alert-section').boundingBox())!;
      const actions = (await message(page).locator('.ant-alert-actions').boundingBox())!;

      expect(section.width).toBeGreaterThan(140);
      expect(actions.y).toBeGreaterThanOrEqual(section.y + section.height);
      await expect(close(page)).toBeInViewport();

      await message(page).screenshot({ path: testInfo.outputPath('alert-mobile.png') });
      await close(page).tap();

      await expect(message(page)).toHaveCount(0);
      await expect(events(page)).toHaveText('["close:click","after:removed"]');
    }
  );
});
