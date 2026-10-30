import type { Page } from '@playwright/test';
import { test, expect } from './test';

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Fixture drawer', exact: true });
const opener = (page: Page) => page.getByRole('button', { name: 'Open Drawer', exact: true });
const draft = (page: Page) =>
  page.locator('#drawer-fixture').getByRole(
    'textbox',
    { name: 'Drawer draft', exact: true, includeHidden: true }
  );
const status = (page: Page, name: string) => page.locator(`output[aria-label="Drawer ${name}"]`);

async function open(page: Page) {
  await opener(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect.poll(
    () =>
      dialog(page)
        .evaluate((element) => element.getAnimations({ subtree: true }).length)
  )
    .toBe(0);
}

async function setting(page: Page, name: string, value: string) {
  await page.getByRole('combobox', { name: `Drawer ${name}`, exact: true })
    .selectOption(value);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=drawer');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true }))
    .toBeVisible();
});

test(
  'Drawer starts closed, leaves lazy fields unmounted and names its native modal on opening',
  async ({ page }, testInfo) => {
    await expect(draft(page)).toHaveCount(0);
    await expect(status(page, 'lifecycle')).toHaveText('[]');

    await open(page);

    await expect(dialog(page)).toHaveAttribute('aria-modal', 'true');
    await expect(dialog(page).getByRole('heading', { name: 'Fixture drawer', level: 2 }))
      .toBeVisible();
    await expect(dialog(page).getByRole('button', { name: 'Закрыть', exact: true })).toBeFocused();
    await expect(status(page, 'lifecycle')).toHaveText('["mount:Drawer"]');

    await page.screenshot({ path: testInfo.outputPath('drawer-right.png') });
  }
);

test(
  'Drawer close buttons update the binding before notifying once and restore opener focus',
  async ({ page }) => {
    await open(page);
    await dialog(page).getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(dialog(page)).toBeHidden();
    await expect(status(page, 'owner')).toHaveText('false');
    await expect(status(page, 'events')).toHaveText('["click:false"]');
    await expect(opener(page)).toBeFocused();
  }
);

test(
  'Drawer keeps background controls inert, contains keyboard navigation and releases page scrolling',
  async ({ page }) => {
    await open(page);

    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

    for (const key of ['Shift+Tab', 'Tab', 'Tab']) {
      await page.keyboard.press(key);
      await expect.poll(
        () =>
          dialog(page).evaluate(
            (element) =>
              !element.ownerDocument.hasFocus()
              || element.contains(element.ownerDocument.activeElement)
          )
      )
        .toBe(true);
    }
    await dialog(page).getByRole('button', { name: 'Закрыть', exact: true }).focus();
    await page.locator('#drawer-outside-input')
      .evaluate((element) => (element as HTMLInputElement).focus());

    await expect(dialog(page).getByRole('button', { name: 'Закрыть', exact: true })).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(dialog(page)).toBeHidden();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await expect(status(page, 'events')).toHaveText('["cancel:false"]');
  }
);

test(
  'Drawer ignores pointer drags across the panel edge and closes only on a complete backdrop click',
  async ({ page }) => {
    await open(page);

    const panel = (await dialog(page).locator(':scope > .ant-drawer-content-wrapper').boundingBox())!;

    await page.mouse.move(panel.x + 80, panel.y + 25);
    await page.mouse.down();
    await page.mouse.move(5, 5);
    await page.mouse.up();

    await expect(dialog(page)).toBeVisible();

    await page.mouse.down();
    await page.mouse.move(panel.x + 80, panel.y + 25);
    await page.mouse.up();

    await expect(dialog(page)).toBeVisible();

    await page.mouse.click(5, 5);

    await expect(dialog(page)).toBeHidden();
    await expect(status(page, 'events')).toHaveText('["pointerup:false"]');
  }
);

test(
  'Drawer respects disabled Escape, backdrop dismissal and a hidden close button',
  async ({ page }) => {
    for (const label of [
      'Escape closes Drawer',
      'Backdrop closes Drawer',
      'Show Drawer close button'
    ])
      await page.getByLabel(label, { exact: true }).uncheck();
    await open(page);

    await expect(dialog(page).getByRole('button', { name: 'Закрыть', exact: true })).toHaveCount(0);

    await page.keyboard.press('Escape');
    await page.mouse.click(5, 5);

    await expect(dialog(page)).toBeVisible();

    await dialog(page).getByRole('button', { name: 'Close Drawer externally', exact: true }).click();

    await expect(dialog(page)).toBeHidden();
    await expect(status(page, 'events')).toHaveText('[]');
  }
);

test(
  'Drawer retains input drafts, local state and native form values across reopening',
  async ({ page }) => {
    await open(page);
    await draft(page).fill('Retained drawer draft');
    await dialog(page).getByRole('button', { name: 'Increment Drawer', exact: true }).click();
    await page.keyboard.press('Escape');

    await expect(dialog(page)).toBeHidden();
    await expect(draft(page)).toHaveValue('Retained drawer draft');
    expect(
      await draft(page).evaluate(
        (element) => new FormData((element as HTMLInputElement).form!).get('Drawer')
      )
    )
      .toBe('Retained drawer draft');

    await open(page);

    await expect(dialog(page).getByRole('status', { name: 'Drawer count', exact: true }))
      .toHaveText('1');
    await expect(status(page, 'lifecycle')).toHaveText('["mount:Drawer"]');
  }
);

test(
  'Drawer destroys content after the exit animation and keeps a destroyed body lazy',
  async ({ page }) => {
    await page.getByLabel('Destroy hidden Drawer', { exact: true }).check();
    await open(page);
    await draft(page).fill('Discarded drawer draft');
    await page.keyboard.press('Control+Alt+o');

    const count = await dialog(page).evaluate(
      (element) => {
        const animations = element.getAnimations({ subtree: true });
        for (const animation of animations) animation.pause();

        return animations.length;
      }
    );

    expect(count).toBeGreaterThan(0);
    await expect(draft(page)).toHaveValue('Discarded drawer draft');

    await dialog(page).evaluate(
      (element) => {
        for (const animation of element.getAnimations({ subtree: true }))
          animation.finish();
      }
    );

    await expect(dialog(page)).toBeHidden();
    await expect(draft(page)).toHaveCount(0);

    await page.getByLabel('Destroy hidden Drawer', { exact: true }).uncheck();

    await expect(draft(page)).toHaveCount(0);

    await open(page);

    await expect(draft(page)).toHaveValue('Drawer initial');
    await expect(status(page, 'lifecycle'))
      .toHaveText('["mount:Drawer","destroy:Drawer","mount:Drawer"]');
  }
);

test(
  'Drawer force renders hidden content and gives retention priority over destruction',
  async ({ page }) => {
    await page.getByLabel('Destroy hidden Drawer', { exact: true }).check();
    await page.getByLabel('Force render Drawer', { exact: true }).check();

    await expect(draft(page)).toHaveCount(1);
    await expect(draft(page)).toBeHidden();

    await open(page);
    await draft(page).fill('Forced draft');
    await page.keyboard.press('Escape');

    await expect(dialog(page)).toBeHidden();
    await expect(draft(page)).toHaveValue('Forced draft');

    await page.getByLabel('Force render Drawer', { exact: true }).uncheck();

    await expect(draft(page)).toHaveCount(0);
  }
);

test(
  'Drawer cancels a pending exit when reopened without losing content or closing later',
  async ({ page }) => {
    await page.getByLabel('Destroy hidden Drawer', { exact: true }).check();
    await open(page);
    await draft(page).fill('Reopened draft');
    await page.keyboard.press('Control+Alt+o');
    await dialog(page).evaluate((element) => {
      // Переходы фокуса дочерних полей продолжаются независимо от движения Drawer.
      for (const surface of element.querySelectorAll(
        ':scope > .ant-drawer-content-wrapper, :scope > .ant-drawer-mask'
      )) {
        for (const animation of surface.getAnimations()) animation.pause();
      }
    });
    await page.keyboard.press('Control+Alt+o');
    await expect.poll(
      () =>
        dialog(page)
          .evaluate((element) => element.getAnimations({ subtree: true }).length)
    )
      .toBe(0);

    await expect(dialog(page)).toBeVisible();
    await expect(draft(page)).toHaveValue('Reopened draft');
    await expect(status(page, 'lifecycle')).toHaveText('["mount:Drawer"]');
    await expect(status(page, 'events')).toHaveText('[]');
  }
);

test(
  'Drawer follows external state and native close events without feedback notifications',
  async ({ page }) => {
    await open(page);
    await page.keyboard.press('Control+Alt+o');

    await expect(dialog(page)).toBeHidden();
    await expect(status(page, 'events')).toHaveText('[]');

    await open(page);
    await dialog(page).evaluate((element) => new Promise<void>((resolve) => {
      element.addEventListener('close', () => queueMicrotask(resolve), { once: true });
      const native = element as HTMLDialogElement;
      native.close();
      native.showModal();
    }));

    await expect(status(page, 'owner')).toHaveText('true');
    await expect(dialog(page)).toBeVisible();

    await dialog(page).evaluate((element) => (element as HTMLDialogElement).close());

    await expect(status(page, 'owner')).toHaveText('false');
    await expect(status(page, 'events')).toHaveText('[]');

    await open(page);

    await expect(dialog(page)).toBeVisible();
  }
);

test(
  'Drawer supports an initially open instance and internally closes without a binding',
  async ({ page }) => {
    await page.getByLabel('Mount initially open Drawer', { exact: true }).check();

    const initial = page.getByRole('dialog', { name: 'Initially open drawer', exact: true });

    await expect(initial.getByRole('textbox', { name: 'Initial Drawer note', exact: true }))
      .toHaveValue('Initial drawer value');

    await page.keyboard.press('Escape');

    await expect(initial).toBeHidden();
  }
);

test(
  'Drawer releases native modality, animation resources and scrolling on unmount',
  async ({ page }) => {
    await open(page);
    await page.keyboard.press('Control+Alt+o');
    await page.keyboard.press('Control+Alt+u');

    await expect(page.locator('#bound-drawer')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

    await opener(page).click();

    await expect(dialog(page)).toBeVisible();
    await expect(draft(page)).toHaveValue('Drawer initial');
  }
);

for (const placement of ['left', 'right', 'top', 'bottom']) {
  test(
    `Drawer uses the physical ${placement} edge with viewport-bounded dimensions`,
    async ({ page }) => {
      await setting(page, 'placement', placement);
      await open(page);

      const bounds = (await dialog(page).locator(':scope > .ant-drawer-content-wrapper')
        .boundingBox())!;
      const viewport = page.viewportSize()!;

      if (placement === 'left' || placement === 'right') {
        expect(bounds.width).toBeCloseTo(378, 0);
        expect(bounds.height).toBeCloseTo(viewport.height, 0);
        expect(bounds.x).toBeCloseTo(placement === 'left' ? 0 : viewport.width - bounds.width, 0);
      } else {
        expect(bounds.height).toBeCloseTo(378, 0);
        expect(bounds.width).toBeCloseTo(viewport.width, 0);
        expect(bounds.y).toBeCloseTo(placement === 'top' ? 0 : viewport.height - bounds.height, 0);
      }
    }
  );
}

test(
  'Drawer resolves large and custom sizes and preserves drafts through live placement changes',
  async ({ page }) => {
    for (const [size, width] of [['large', 736], ['480px', 480], ['50%', 640]] as const) {
      await setting(page, 'size', size);
      await open(page);
      expect(
        (await dialog(page).locator(':scope > .ant-drawer-content-wrapper').boundingBox())!.width
      ).toBeCloseTo(
        width,
        0
      );
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();
    }
    await open(page);
    await draft(page).fill('Moved draft');
    await page.keyboard.press('Control+Alt+p');

    await expect(dialog(page)).toHaveClass(/ant-drawer-left/);
    await expect(draft(page)).toBeFocused();
    await expect(draft(page)).toHaveValue('Moved draft');
  }
);

test(
  'Drawer respects RTL while retaining physical placement and localized close labels',
  async ({ page }) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('English locale', { exact: true }).check();
    await open(page);

    await expect(dialog(page)).toHaveCSS('direction', 'rtl');
    await expect(dialog(page).getByRole('button', { name: 'Close', exact: true })).toBeVisible();

    const bounds = (await dialog(page).locator(':scope > .ant-drawer-content-wrapper').boundingBox())!;

    expect(bounds.x + bounds.width).toBeCloseTo(page.viewportSize()!.width, 0);
  }
);

test('Drawer adapts dark compact themes and blurred masks', async ({ page }, testInfo) => {
  for (const label of ['Dark Drawer theme', 'Compact Drawer theme', 'Blur Drawer mask'])
    await page.getByLabel(label, { exact: true }).check();
  await open(page);

  await expect(dialog(page).locator('.ant-drawer-section').first()).toHaveCSS(
    'background-color',
    'rgb(31, 31, 31)'
  );
  await expect(dialog(page)).toHaveCSS('font-size', '12px');
  await expect(dialog(page).locator('.ant-drawer-mask').first()).toHaveCSS(
    'backdrop-filter',
    'blur(4px)'
  );

  await page.screenshot({ path: testInfo.outputPath('drawer-dark.png') });
});

test('Drawer skips slide and mask motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);

  expect(await dialog(page).evaluate((element) => element.getAnimations({ subtree: true }).length))
    .toBe(0);

  await page.keyboard.press('Escape');

  await expect(dialog(page)).toBeHidden();

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  await page.keyboard.press('Control+Alt+o');
  await dialog(page).evaluate(
    (element) => {
      for (const animation of element.getAnimations({ subtree: true }))
        animation.pause();
    }
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(dialog(page)).toBeHidden();
});

test(
  'Drawer extra and footer actions remain independent and never submit the body form',
  async ({ page }) => {
    await open(page);
    await dialog(page).getByRole('button', { name: 'Drawer extra action', exact: true }).click();
    await dialog(page).getByRole('button', { name: 'Drawer footer action', exact: true }).click();

    await expect(status(page, 'actions')).toHaveText('2');
    await expect(status(page, 'submissions')).toHaveText('0');
    await expect(dialog(page)).toBeVisible();

    await dialog(page).getByRole('button', { name: 'Submit Drawer form', exact: true }).click();

    await expect(status(page, 'submissions')).toHaveText('1');
    await expect(status(page, 'events')).toHaveText('[]');
  }
);

test('Drawer lets Select consume Escape before closing the containing panel', async ({ page }) => {
  await open(page);

  const select = dialog(page).getByRole('combobox', { name: 'Drawer choice', exact: true });

  await select.click();
  await page.keyboard.press('Escape');

  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog(page)).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog(page)).toBeHidden();
});

test(
  'Drawer keeps interactive popovers and tooltips above its native modal and handles Escape in order',
  async ({ page }) => {
    await open(page);
    await dialog(page).getByRole('button', { name: 'Open Drawer popover', exact: true }).click();

    const popup = page.getByRole('dialog', { name: 'Drawer popover', exact: true });

    await popup.getByRole('textbox', { name: 'Drawer popover note', exact: true })
      .fill('Popover draft');
    await page.keyboard.press('Escape');

    await expect(popup).toBeHidden();
    await expect(dialog(page)).toBeVisible();

    await dialog(page).getByRole('button', { name: 'Drawer tooltip trigger', exact: true }).focus();

    await expect(page.getByRole('tooltip', { name: 'Drawer explanation', exact: true }))
      .toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('tooltip', { name: 'Drawer explanation', exact: true }))
      .toBeHidden();
    await expect(dialog(page)).toBeVisible();
  }
);

test(
  'Drawer retains Tabs and Collapse navigation state with their local drafts',
  async ({ page }) => {
    await open(page);
    await dialog(page).getByRole('textbox', { name: 'Drawer tab note', exact: true })
      .fill('Tab retained');
    await dialog(page).getByRole('tab', { name: 'Drawer settings', exact: true }).click();
    await dialog(page).getByRole('button', { name: 'Drawer details', exact: true }).click();
    await dialog(page).getByRole('textbox', { name: 'Drawer collapse note', exact: true })
      .fill('Collapse retained');
    await page.keyboard.press('Escape');

    await expect(dialog(page)).toBeHidden();

    await open(page);

    await expect(dialog(page).getByRole('tab', { name: 'Drawer settings', exact: true })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(dialog(page).getByRole('textbox', { name: 'Drawer collapse note', exact: true }))
      .toHaveValue('Collapse retained');

    await dialog(page).getByRole('tab', { name: 'Drawer profile', exact: true }).click();

    await expect(dialog(page).getByRole('textbox', { name: 'Drawer tab note', exact: true }))
      .toHaveValue('Tab retained');
  }
);

test(
  'Drawer stacks a child modal without push and returns focus and scrolling to its parent',
  async ({ page }) => {
    await open(page);

    const trigger = dialog(page).getByRole('button', { name: 'Open nested Drawer', exact: true });

    await trigger.click();

    const child = page.getByRole('dialog', { name: 'Nested drawer', exact: true });

    await expect(child).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(child).toBeHidden();
    await expect(dialog(page)).toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

    await page.keyboard.press('Escape');

    await expect(dialog(page)).toBeHidden();
    await expect(opener(page)).toBeFocused();
  }
);

test(
  'Drawer stacks above Modal and returns Escape, focus and scrolling to the host',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Open Drawer host Modal', exact: true }).click();

    const host = page.getByRole('dialog', { name: 'Drawer host modal', exact: true });
    const trigger = host.getByRole('button', { name: 'Open Drawer in Modal', exact: true });

    await trigger.click();

    const inside = page.getByRole('dialog', { name: 'Drawer inside modal', exact: true });

    await expect(inside).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(inside).toBeHidden();
    await expect(host).toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

    await page.keyboard.press('Escape');

    await expect(host).toBeHidden();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  }
);

test(
  'Drawer remains dismissible when ConfigProvider disables its form controls',
  async ({ page }) => {
    await page.getByLabel('Disable all components', { exact: true }).check();
    await open(page);

    await expect(draft(page)).toBeDisabled();
    await expect(dialog(page).getByRole('button', { name: 'Закрыть', exact: true })).toBeEnabled();

    await page.keyboard.press('Escape');

    await expect(dialog(page)).toBeHidden();
  }
);

test('Drawer supports an explicit accessible name without a visible header', async ({ page }) => {
  for (const label of ['Show Drawer close button', 'Show Drawer extra', 'Show Drawer footer'])
    await page.getByLabel(label, { exact: true }).uncheck();
  await page.getByLabel('Headerless Drawer', { exact: true }).check();
  await open(page);

  await expect(dialog(page).locator('.ant-drawer-header')).toHaveCount(0);
  await expect(draft(page)).toBeFocused();

  await page.keyboard.press('Escape');

  await expect(dialog(page)).toBeHidden();
});

test.describe('mobile Drawer', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test(
    'keeps long content scrollable and footer controls visible within the viewport',
    async ({ page }, testInfo) => {
      await page.getByLabel('Long Drawer content', { exact: true }).check();
      await setting(page, 'size', 'large');
      await opener(page).tap();

      const drawer = page.getByRole('dialog', { name: /^Fixture drawer with a very long/ });

      await expect.poll(
        () =>
          drawer.evaluate((element) => element.getAnimations({ subtree: true }).length)
      )
        .toBe(0);

      const wrapper = (await drawer.locator(':scope > .ant-drawer-content-wrapper').boundingBox())!;

      expect(wrapper.width).toBeLessThanOrEqual(375);

      await expect.poll(
        () =>
          drawer.locator('.ant-drawer-section').first()
            .evaluate((element) => element.scrollWidth <= element.clientWidth)
      )
        .toBe(true);
      await drawer.getByRole('button', { name: 'Drawer last control', exact: true })
        .scrollIntoViewIfNeeded();

      await expect(drawer.getByRole('button', { name: 'Drawer last control', exact: true }))
        .toBeInViewport();
      await expect(drawer.getByRole('button', { name: 'Close Drawer externally', exact: true }))
        .toBeInViewport();

      await page.screenshot({ path: testInfo.outputPath('drawer-mobile.png') });
      await drawer.getByRole('button', { name: 'Close Drawer externally', exact: true }).tap();

      await expect(drawer).toBeHidden();
    }
  );
});
