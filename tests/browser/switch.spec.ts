import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=switch');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'Switch toggles once through Space, Enter, labels and clicks without submitting its form',
  async ({ page }) => {
    const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });

    await widget.focus();
    await widget.press('Space');

    await expect(widget).toHaveAttribute('aria-checked', 'true');
    await expect(widget).toBeFocused();
    await expect(widget).toHaveCSS('outline-style', 'solid');

    await widget.press('Enter');

    await expect(widget).toHaveAttribute('aria-checked', 'false');

    await page.getByText('Bound Switch', { exact: true }).click();

    await expect(widget).toHaveAttribute('aria-checked', 'true');

    await widget.click();

    await expect(widget).toHaveAccessibleName('Bound Switch');
    await expect(widget).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true }))
      .toHaveText('[true,false,true,false]');
    await expect(page.getByRole('status', { name: 'Switch clicks', exact: true })).toHaveText('4');
    await expect(page.getByRole('status', { name: 'Switch native submissions', exact: true }))
      .toHaveText('0');
  }
);

test(
  'Switch accepts owner changes without callbacks and lets a native click handler cancel a toggle',
  async ({ page }) => {
    const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });

    await page.getByRole('button', { name: 'Set Switch externally', exact: true }).click();

    await expect(widget).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true })).toHaveText('[]');

    await page.getByLabel('Cancel Switch click', { exact: true }).check();
    await widget.click();

    await expect(widget).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true })).toHaveText('[]');

    await page.getByLabel('Cancel Switch click', { exact: true }).uncheck();
    await widget.click();

    await expect(page.getByRole('status', { name: 'Switch owner', exact: true }))
      .toHaveText('false');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true }))
      .toHaveText('[false]');
  }
);

test(
  'Switch loading blocks repeated interactions and native submission without losing its checked state',
  async ({ page }, testInfo) => {
    const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });

    await widget.click();
    await page.getByLabel('Loading bound Switch', { exact: true }).check();

    await expect(widget).toBeDisabled();
    await expect(widget).toHaveAttribute('aria-busy', 'true');
    await expect(widget.locator('.ant-switch-loading-icon')).toBeVisible();

    await widget.screenshot({ path: testInfo.outputPath('switch-loading.png') });
    await widget.dispatchEvent('click');

    await expect(widget).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true }))
      .toHaveText('[true]');
    expect(
      await page.locator('#switch-native-form').evaluate(
        (element) => new FormData(element as HTMLFormElement).get('enabled')
      )
    )
      .toBeNull();

    await page.getByLabel('Loading bound Switch', { exact: true }).uncheck();

    await expect(widget).toBeEnabled();
    await expect(widget).not.toHaveAttribute('aria-busy');

    await widget.focus();
    await widget.press('Enter');

    await expect(page.getByRole('status', { name: 'Switch changes', exact: true }))
      .toHaveText('[true,false]');
  }
);

test(
  'Switch inherits disabled context and retains explicit enabled overrides',
  async ({ page }) => {
    const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });

    await page.getByRole('button', { name: 'Set Switch externally', exact: true }).click();
    await page.getByLabel('Disable bound Switch', { exact: true }).check();

    await expect(widget).toBeDisabled();
    await expect(widget).toHaveAttribute('aria-checked', 'true');

    await page.getByLabel('Disable bound Switch', { exact: true }).uncheck();
    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(widget).toBeDisabled();
    await expect(page.getByRole('switch', { name: 'Enabled Switch override', exact: true }))
      .toBeEnabled();
    expect(
      await page.locator('#switch-native-form').evaluate(
        (element) => new FormData(element as HTMLFormElement).get('enabled')
      )
    )
      .toBeNull();

    await page.getByLabel('Disable all components', { exact: true }).uncheck();

    await expect(widget).toBeEnabled();
    await expect(widget).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true })).toHaveText('[]');
  }
);

test(
  'Switch serializes checked values once and restores initial defaults while respecting canceled reset',
  async ({ page }) => {
    const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });
    const defaults = page.getByRole('switch', { name: 'Default Switch', exact: true });

    await widget.click();
    await defaults.click();
    await page.getByRole('button', { name: 'Replace Switch default', exact: true }).click();
    await page.getByRole('button', { name: 'Read Switch FormData', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Switch FormData', exact: true }))
      .toHaveText('{"enabled":"on","defaults":null}');
    expect(
      await page.locator('#switch-native-form').evaluate(
        (element) => new FormData(element as HTMLFormElement).getAll('enabled')
      )
    )
      .toEqual(['on']);

    await page.getByLabel('Cancel Switch reset', { exact: true }).check();
    await page.getByRole('button', { name: 'Reset native Switches', exact: true }).click();

    await expect(widget).toHaveAttribute('aria-checked', 'true');
    await expect(defaults).toHaveAttribute('aria-checked', 'false');

    await page.getByLabel('Cancel Switch reset', { exact: true }).uncheck();
    await page.evaluate(
      () =>
        window.addEventListener(
          'reset',
          (event) => event.preventDefault(),
          { once: true }
        )
    );
    await page.getByRole('button', { name: 'Reset native Switches', exact: true }).click();

    await expect(widget).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('button', { name: 'Reset native Switches', exact: true }).click();

    await expect(widget).toHaveAttribute('aria-checked', 'false');
    await expect(defaults).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true }))
      .toHaveText('[true]');
    await expect(page.getByRole('status', { name: 'Switch default changes', exact: true }))
      .toHaveText('1');
  }
);

test(
  'Switch honors external form association and resets only the owning form',
  async ({ page }) => {
    const outside = page.getByRole('switch', { name: 'Outside Switch', exact: true });

    await page.getByRole('button', { name: 'Set Switch externally', exact: true }).click();
    await outside.click();
    await page.getByRole('button', { name: 'Read outside Switch', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Outside Switch FormData', exact: true }))
      .toHaveText('null');

    await page.getByRole('button', { name: 'Reset outside Switch', exact: true }).click();

    await expect(outside).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('button', { name: 'Read outside Switch', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Outside Switch FormData', exact: true }))
      .toHaveText('on');
    await expect(page.getByRole('status', { name: 'Switch owner', exact: true })).toHaveText('true');
  }
);

test(
  'Switch integrates boolean validation, field labels, error focus, submission and Form reset',
  async ({ page }) => {
    const fixture = page.locator('#switch-form-fixture');
    const enabled = fixture.getByRole('switch', { name: 'Switch availability', exact: true });
    const consent = fixture.getByRole('switch', { name: 'Switch consent', exact: true });

    await expect(enabled).toHaveAttribute('aria-required', 'true');

    await fixture.getByRole('button', { name: 'Submit Switch form', exact: true }).click();

    await expect(consent).toBeFocused();
    await expect(consent).toHaveAttribute('aria-invalid', 'true');
    await expect(consent).toHaveAccessibleDescription('Enable switch consent');
    await expect(enabled).not.toHaveAttribute('aria-invalid');

    await fixture.getByText('Switch consent', { exact: true }).click();

    await expect(consent).toHaveAttribute('aria-checked', 'true');

    await fixture.getByRole('button', { name: 'Submit Switch form', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Switch form saved', exact: true }))
      .toHaveText('{"enabled":false,"accepted":true}');
    expect(
      await fixture.locator('form').evaluate(
        (element) => Object.fromEntries(new FormData(element as HTMLFormElement))
      )
    )
      .toEqual({ accepted: 'on' });

    await fixture.getByRole('button', { name: 'Reset Switch form', exact: true }).click();

    await expect(consent).toHaveAttribute('aria-checked', 'false');
    await expect(consent).not.toHaveAttribute('aria-invalid');
    await expect(fixture.getByRole('status', { name: 'Switch form owner', exact: true }))
      .toHaveText('{"enabled":false,"accepted":false}');
  }
);

test('Switch inherits Form disabled state and allows an explicit override', async ({ page }) => {
  await page.getByLabel('Disable Switch form', { exact: true }).check();

  const fixture = page.locator('#switch-form-fixture');

  await expect(fixture.getByRole('switch', { name: 'Switch availability', exact: true }))
    .toBeDisabled();
  await expect(fixture.getByRole('switch', { name: 'Switch consent', exact: true })).toBeDisabled();
  await expect(fixture.getByRole('switch', { name: 'Form enabled Switch override', exact: true }))
    .toBeEnabled();
});

test(
  'Switch preserves an unmounted owner through native reset and reconnects on remount',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Set Switch externally', exact: true }).click();
    await page.getByLabel('Mount bound Switch', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Reset native Switches', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Switch owner', exact: true })).toHaveText('true');

    await page.getByLabel('Mount bound Switch', { exact: true }).check();
    await page.getByRole('button', { name: 'Reset native Switches', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Switch owner', exact: true }))
      .toHaveText('false');
    await expect(page.getByRole('status', { name: 'Switch changes', exact: true })).toHaveText('[]');
  }
);

test(
  'Switch supports inherited sizes, compact and dark themes and RTL handle placement',
  async ({ page }, testInfo) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Small Switch provider', { exact: true }).check();
    await page.getByLabel('Dark Switch theme', { exact: true }).check();
    await page.getByLabel('Compact Switch theme', { exact: true }).check();

    const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });
    const handle = widget.locator('.ant-switch-handle');

    await expect(widget).toHaveCSS('direction', 'rtl');
    await expect(widget).toHaveCSS('height', '16px');
    await expect(widget).toHaveCSS('font-size', '12px');
    await expect(page.getByRole('switch', { name: 'Middle Switch override', exact: true })).toHaveCSS(
      'height',
      '22px'
    );
    await expect(page.getByRole('switch', { name: 'Small Switch override', exact: true })).toHaveCSS(
      'height',
      '16px'
    );

    const offX = (await handle.boundingBox())!.x;

    await page.getByRole('button', { name: 'Set Switch externally', exact: true }).click();
    await page.mouse.move(0, 0);

    await expect(widget).toHaveCSS('background-color', 'rgb(22, 119, 255)');

    await expect.poll(
      async () =>
        Math.abs((await handle.boundingBox())!.x - (await widget.boundingBox())!.x - 2)
    )
      .toBeLessThan(1);

    expect((await handle.boundingBox())!.x).toBeLessThan(offX);

    await widget.screenshot({ path: testInfo.outputPath('switch-rtl-dark.png') });
  }
);

test('Switch respects reduced motion for its track, handle and state content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });

  await expect(widget).toHaveCSS('transition-duration', '0s');
  await expect(widget.locator('.ant-switch-handle')).toHaveCSS('transition-duration', '0s');
  await expect(widget.locator('.ant-switch-inner')).toHaveCSS('transition-duration', '0s');

  await widget.click();

  await expect(widget).toHaveAttribute('aria-checked', 'true');
});

test.describe('mobile Switch', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'keeps text and icon variants usable without widening the viewport',
    async ({ page }, testInfo) => {
      const widget = page.getByRole('switch', { name: 'Bound Switch', exact: true });

      await widget.click();

      await expect(widget).toHaveAttribute('aria-checked', 'true');

      const icon = page.getByRole('switch', { name: 'Icon Switch', exact: true });

      await icon.click();

      await expect(icon).toHaveAccessibleName('Icon Switch');
      await expect(icon).toHaveAttribute('aria-checked', 'true');

      await expect.poll(
        () =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      )
        .toBe(true);
      await page.locator('#switch-native-form')
        .screenshot({ path: testInfo.outputPath('switch-mobile.png') });
    }
  );
});
