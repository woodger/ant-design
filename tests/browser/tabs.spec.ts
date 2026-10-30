import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('#tabs-fixture .stage > .ant-tabs');
const list = (page: Page) => page.getByRole('tablist', { name: 'Bound sections', exact: true });
const tab = (page: Page, name: string) => list(page).getByRole('tab', { name, exact: true });
const panel = (page: Page, name: string) => root(page).getByRole('tabpanel', { name, exact: true });
const draft = (page: Page, name: string) =>
  root(page).getByRole(
    'textbox',
    { name: `${name} draft`, exact: true, includeHidden: true }
  );
const status = (page: Page, name: string) =>
  page.getByRole('status', { name: `Tabs ${name}`, exact: true });

async function setting(page: Page, name: string, value: string) {
  await page.getByRole('combobox', { name: `Tabs ${name}`, exact: true })
    .selectOption(value);
}

async function linkedPanel(page: Page, name: string) {
  const id = await tab(page, name).getAttribute('aria-controls');

  return root(page).locator(`[id="${id}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tabs');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'Tabs exposes one selected native tab, disabled items and associated lazy panels',
  async ({ page }, testInfo) => {
    await tab(page, 'Alpha').scrollIntoViewIfNeeded();

    await expect(list(page)).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Locked')).toBeDisabled();
    await expect(list(page).locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(panel(page, 'Alpha')).toBeVisible();
    await expect(await linkedPanel(page, 'Beta')).toBeHidden();
    await expect(draft(page, 'Beta')).toHaveCount(0);
    await expect(tab(page, 'Beta').locator('strong')).toHaveText('Beta');
    await expect(list(page).getByTestId('tabs-icon')).toBeVisible();
    await expect(list(page).getByTestId('tabs-icon').locator('..')).toHaveCSS(
      'margin-inline-end',
      '12px'
    );

    const associations = await list(page).getByRole('tab')
      .evaluateAll((tabs) =>
        tabs
          .map((
            element
          ) => {
            const target = element.ownerDocument
              .getElementById(element
                .getAttribute('aria-controls')!);

            return target?.getAttribute('role') === 'tabpanel'
              && target.getAttribute('aria-labelledby') === element.id;
          }));

    expect(associations).toEqual([true, true, true, true]);
    await expect(status(page, 'owner')).toHaveText('undefined');
    await expect(status(page, 'changes')).toHaveText('[]');

    await root(page).screenshot({ path: testInfo.outputPath('tabs-line.png') });
  }
);

test(
  'Tabs moves focus with wrapping arrows, Home and End without activating a panel',
  async ({ page }) => {
    await tab(page, 'Alpha').focus();
    await page.keyboard.press('ArrowRight');

    await expect(tab(page, 'Beta')).toBeFocused();
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(draft(page, 'Beta')).toHaveCount(0);

    await page.keyboard.press('End');

    await expect(tab(page, 'Gamma')).toBeFocused();

    await page.keyboard.press('ArrowRight');

    await expect(tab(page, 'Alpha')).toBeFocused();

    await page.keyboard.press('ArrowLeft');

    await expect(tab(page, 'Gamma')).toBeFocused();

    await page.keyboard.press('Home');

    await expect(tab(page, 'Alpha')).toBeFocused();
    await expect(status(page, 'changes')).toHaveText('[]');
    await expect(status(page, 'clicks')).toHaveText('[]');
  }
);

for (const key of ['Enter', 'Space']) {
  test(
    `Tabs activates through ${key} once and keeps tab buttons from submitting the form`,
    async ({ page }) => {
      await tab(page, 'Alpha').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press(key);

      await expect(tab(page, 'Beta')).toHaveAttribute('aria-selected', 'true');
      await expect(panel(page, 'Beta')).toBeVisible();
      await expect(tab(page, 'Beta')).toBeFocused();
      await expect(status(page, 'owner')).toHaveText('"beta"');
      await expect(status(page, 'changes')).toHaveText('["beta"]');

      await page.keyboard.press(key);

      await expect(status(page, 'changes')).toHaveText('["beta"]');
      await expect(status(page, 'clicks')).toHaveText('["beta","beta"]');
      await expect(status(page, 'events')).toHaveText(
        JSON.stringify(
          [
            { kind: 'click', key: 'beta', owner: null },
            { kind: 'change', key: 'beta', owner: 'beta' },
            { kind: 'click', key: 'beta', owner: 'beta' }
          ]
        )
      );
      await expect(status(page, 'submissions')).toHaveText('0');
    }
  );
}

test(
  'Tabs treats its header as one Tab stop and resumes at the selected tab after leaving',
  async ({ page }) => {
    const before = page.getByRole('button', { name: 'Before Tabs', exact: true });

    await before.focus();
    await page.keyboard.press('Tab');

    await expect(tab(page, 'Alpha')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Tab');

    await expect(panel(page, 'Alpha')).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(draft(page, 'Alpha')).toBeFocused();

    await tab(page, 'Gamma').focus();
    await page.keyboard.press('Shift+Tab');

    await expect(before).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(tab(page, 'Alpha')).toBeFocused();
  }
);

test('Tabs preserves local input and component state in visited panels', async ({ page }) => {
  await draft(page, 'Alpha').fill('Preserved Alpha');
  await panel(page, 'Alpha').getByRole('button', { name: 'Increment Alpha' }).click();
  await tab(page, 'Beta').click();
  await draft(page, 'Beta').fill('Preserved Beta');
  await panel(page, 'Beta').getByRole('button', { name: 'Increment Beta' }).click();
  await tab(page, 'Alpha').click();

  await expect(draft(page, 'Alpha')).toHaveValue('Preserved Alpha');
  await expect(panel(page, 'Alpha').getByRole('status')).toHaveText('1');
  await expect(draft(page, 'Beta')).toHaveValue('Preserved Beta');

  await tab(page, 'Beta').click();

  await expect(panel(page, 'Beta').getByRole('status')).toHaveText('1');
  await expect(status(page, 'lifecycle')).toHaveText('["mount:Alpha","mount:Beta"]');
});

test(
  'Tabs destroys hidden content and creates a fresh panel on the next visit',
  async ({ page }) => {
    await page.getByLabel('Destroy hidden Tabs', { exact: true }).check();
    await draft(page, 'Alpha').fill('Discarded Alpha');
    await panel(page, 'Alpha').getByRole('button', { name: 'Increment Alpha' }).click();
    await tab(page, 'Beta').click();

    await expect(draft(page, 'Alpha')).toHaveCount(0);
    await expect(status(page, 'lifecycle')).toContainText('destroy:Alpha');

    await tab(page, 'Alpha').click();

    await expect(draft(page, 'Alpha')).toHaveValue('Alpha initial');
    await expect(panel(page, 'Alpha').getByRole('status')).toHaveText('0');
  }
);

test(
  'Tabs includes retained fields in FormData and removes destroyed or unvisited fields',
  async ({ page }) => {
    const data = () =>
      root(page).locator('xpath=ancestor::form').evaluate(
        (element) => Array.from(new FormData(element as HTMLFormElement).entries())
      );

    await expect.poll(data).toEqual([['Alpha', 'Alpha initial']]);
    await tab(page, 'Beta').click();
    await expect.poll(data).toEqual([['Alpha', 'Alpha initial'], ['Beta', 'Beta initial']]);
    await page.getByLabel('Destroy hidden Tabs', { exact: true }).check();
    await expect.poll(data).toEqual([['Beta', 'Beta initial']]);
  }
);

test('Tabs keeps destroyed panels lazy after destroyOnHidden is turned off', async ({ page }) => {
  await tab(page, 'Beta').click();
  await draft(page, 'Beta').fill('Discarded Beta');
  await tab(page, 'Alpha').click();
  await page.getByLabel('Destroy hidden Tabs', { exact: true }).check();

  await expect(draft(page, 'Beta')).toHaveCount(0);

  await page.getByLabel('Destroy hidden Tabs', { exact: true }).uncheck();

  await expect(draft(page, 'Beta')).toHaveCount(0);

  await tab(page, 'Beta').click();

  await expect(draft(page, 'Beta')).toHaveValue('Beta initial');
});

test('Tabs supports per-item retention and destruction overrides', async ({ page }) => {
  await page.getByLabel('Destroy hidden Tabs', { exact: true }).check();
  await page.getByLabel('Keep Beta panel', { exact: true }).check();
  await tab(page, 'Beta').click();
  await draft(page, 'Beta').fill('Kept Beta');
  await tab(page, 'Alpha').click();

  await expect(draft(page, 'Beta')).toHaveValue('Kept Beta');

  await page.getByLabel('Destroy hidden Tabs', { exact: true }).uncheck();
  await page.getByLabel('Destroy Gamma panel', { exact: true }).check();
  await tab(page, 'Gamma').click();
  await draft(page, 'Gamma').fill('Discarded Gamma');
  await tab(page, 'Alpha').click();

  await expect(draft(page, 'Gamma')).toHaveCount(0);

  await tab(page, 'Gamma').click();

  await expect(draft(page, 'Gamma')).toHaveValue('Gamma initial');
});

test(
  'Tabs forceRender mounts hidden content without making it visible or selectable',
  async ({ page }) => {
    await page.getByLabel('Force render Tabs', { exact: true }).check();

    await expect(draft(page, 'Beta')).toHaveCount(1);
    await expect(draft(page, 'Beta')).toBeHidden();
    await expect(
      root(page).getByRole(
        'textbox',
        { name: 'Locked draft', exact: true, includeHidden: true }
      )
    )
      .toHaveCount(1);
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');

    await page.getByLabel('Destroy hidden Tabs', { exact: true }).check();

    await expect(draft(page, 'Beta')).toHaveCount(1);
    await expect(status(page, 'changes')).toHaveText('[]');
  }
);

test(
  'Tabs accepts external keys and invalid-key fallbacks without owner feedback',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Select Gamma externally', exact: true }).click();

    await expect(tab(page, 'Gamma')).toHaveAttribute('aria-selected', 'true');
    await expect(status(page, 'changes')).toHaveText('[]');

    await page.getByRole('button', { name: 'Select missing Tabs key', exact: true }).click();

    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(status(page, 'owner')).toHaveText('"missing"');
    await expect(status(page, 'changes')).toHaveText('[]');

    await page.getByRole('button', { name: 'Clear Tabs owner', exact: true }).click();

    await expect(status(page, 'owner')).toHaveText('undefined');
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
  }
);

test('Tabs reads defaultActiveKey once and keeps instance IDs independent', async ({ page }) => {
  await page.getByLabel('Mount default Tabs', { exact: true }).check();

  const defaults = page.getByRole('tablist', { name: 'Default sections', exact: true });

  await expect(defaults.getByRole('tab', { name: 'Default Beta', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  );

  await page.getByRole('button', { name: 'Replace Tabs default', exact: true }).click();

  await expect(defaults.getByRole('tab', { name: 'Default Beta', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(page.getByRole('status', { name: 'Default Tabs changes', exact: true }))
    .toHaveText('[]');

  const ids = await page.locator('#tabs-fixture [id^="ant-tabs-"]')
    .evaluateAll((elements) => elements.map((element) => element.id));

  expect(new Set(ids).size).toBe(ids.length);
});

test(
  'Tabs honors click cancellation and ignores a tab removed by its click handler',
  async ({ page }) => {
    await page.getByLabel('Cancel Tabs click', { exact: true }).check();
    await tab(page, 'Beta').click();

    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(status(page, 'clicks')).toHaveText('["beta"]');
    await expect(status(page, 'changes')).toHaveText('[]');

    await page.getByLabel('Cancel Tabs click', { exact: true }).uncheck();
    await page.getByLabel('Remove Beta on tab click', { exact: true }).check();
    await tab(page, 'Beta').click();

    await expect(tab(page, 'Beta')).toHaveCount(0);
    await expect(tab(page, 'Alpha')).toBeFocused();
    await expect(status(page, 'owner')).toHaveText('undefined');
    await expect(status(page, 'changes')).toHaveText('[]');
  }
);

test(
  'Tabs repairs focus and falls back without mutating owner selection after disabling or removing a tab',
  async ({ page }) => {
    await tab(page, 'Beta').click();
    await page.keyboard.press('F3');

    await expect(tab(page, 'Beta')).toBeDisabled();
    await expect(tab(page, 'Alpha')).toBeFocused();
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(status(page, 'owner')).toHaveText('"beta"');

    await page.keyboard.press('F3');

    await expect(tab(page, 'Beta')).toHaveAttribute('aria-selected', 'true');

    await tab(page, 'Beta').focus();
    await page.keyboard.press('F7');

    await expect(tab(page, 'Beta')).toHaveCount(0);
    await expect(tab(page, 'Alpha')).toBeFocused();
    await expect(status(page, 'changes')).toHaveText('["beta"]');
  }
);

test('Tabs moves focus out of content hidden by an external selection', async ({ page }) => {
  await draft(page, 'Alpha').fill('Still retained');
  await page.keyboard.press('F4');

  await expect(tab(page, 'Gamma')).toBeFocused();
  await expect(await linkedPanel(page, 'Alpha')).toBeHidden();
  await expect(draft(page, 'Alpha')).toHaveValue('Still retained');
  await expect(status(page, 'changes')).toHaveText('[]');
});

test(
  'Tabs provides a focusable fallback when emptied or entirely disabled and recovers on restoration',
  async ({ page }) => {
    await tab(page, 'Beta').click();
    await page.keyboard.press('F8');

    await expect(list(page)).toBeFocused();
    await expect(list(page).getByRole('tab')).toHaveCount(0);
    await expect(root(page)).toContainText('Ничего не найдено');

    await page.keyboard.press('F8');

    await expect(tab(page, 'Beta')).toBeFocused();

    await page.keyboard.press('F9');

    await expect(list(page)).toBeFocused();
    await expect(list(page).locator('[aria-selected="true"]')).toHaveCount(0);

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    await expect(status(page, 'changes')).toHaveText('["beta"]');

    await page.keyboard.press('Tab');

    await expect(page.getByRole('button', { name: 'After Tabs', exact: true })).toBeFocused();
  }
);

test(
  'Tabs preserves keyed panel state and valid IDs across reordering and label changes',
  async ({ page }) => {
    await page.getByLabel('Special Tabs key', { exact: true }).check();
    await page.getByLabel('Duplicate Tabs key', { exact: true }).check();

    await expect(list(page).getByRole('tab')).toHaveCount(4);
    await expect(list(page).getByRole('tab', { name: 'Duplicate Alpha', exact: true }))
      .toHaveCount(0);

    await page.getByLabel('Duplicate Tabs key', { exact: true }).uncheck();
    await tab(page, 'Gamma').click();
    await draft(page, 'Gamma').fill('Special draft');

    await expect(status(page, 'owner')).toHaveText(JSON.stringify('"# ][🙂'));

    const id = await tab(page, 'Gamma').getAttribute('id');

    await draft(page, 'Gamma').evaluate(
      (element) => (element as HTMLInputElement).setSelectionRange(2, 5)
    );
    await page.keyboard.press('F6');

    await expect(draft(page, 'Gamma')).toBeFocused();
    await expect(tab(page, 'Gamma')).toHaveAttribute('id', id!);
    await expect(draft(page, 'Gamma')).toHaveValue('Special draft');
    expect(
      await draft(page, 'Gamma').evaluate(
        (element) =>
          [
            (element as HTMLInputElement).selectionStart,
            (element as HTMLInputElement).selectionEnd
          ]
      )
    )
      .toEqual([2, 5]);

    await tab(page, 'Gamma').focus();
    await page.keyboard.press('F6');

    await expect(tab(page, 'Gamma')).toBeFocused();

    await page.keyboard.press('F10');

    await expect(tab(page, 'Renamed Alpha')).toBeVisible();

    await tab(page, 'Renamed Alpha').click();

    await expect(status(page, 'owner')).toHaveText('""');
  }
);

test(
  'Tabs releases panel instances on unmount and preserves only the external key on remount',
  async ({ page }) => {
    await tab(page, 'Beta').click();
    await draft(page, 'Beta').fill('Unmounted draft');
    await page.keyboard.press('F5');

    await expect(list(page)).toHaveCount(0);
    await expect(status(page, 'lifecycle')).toContainText('destroy:Beta');

    await page.keyboard.press('F5');

    await expect(tab(page, 'Beta')).toHaveAttribute('aria-selected', 'true');
    await expect(draft(page, 'Beta')).toHaveValue('Beta initial');
    await expect(status(page, 'changes')).toHaveText('["beta"]');
  }
);

test(
  'Tabs ignores composing, modified and cancelled navigation and leaves orthogonal arrows to the browser',
  async ({ page }) => {
    await tab(page, 'Alpha').focus();

    const prevented = await tab(page, 'Alpha').evaluate((element) => {
      return [
        { key: 'ArrowRight', isComposing: true },
        { key: 'ArrowRight', ctrlKey: true },
        { key: 'ArrowDown' }
      ]
        .map((options) => {
          const event = new KeyboardEvent(
            'keydown',
            { bubbles: true, cancelable: true, ...options }
          );
          element.dispatchEvent(event);

          return event.defaultPrevented;
        });
    });

    expect(prevented).toEqual([false, false, false]);

    await tab(page, 'Alpha').evaluate(
      (element) =>
        element.addEventListener(
          'keydown',
          (event) => event.preventDefault(),
          { once: true }
        )
    );
    await page.keyboard.press('ArrowRight');

    await expect(tab(page, 'Alpha')).toBeFocused();
    await expect(status(page, 'changes')).toHaveText('[]');
  }
);

for (const placement of ['top', 'bottom', 'start', 'end']) {
  for (const type of ['line', 'card']) {
    test(
      `Tabs renders ${type} at ${placement} with matching geometry and keyboard orientation`,
      async ({ page }) => {
        await setting(page, 'placement', placement);
        await setting(page, 'type', type);

        const vertical = placement === 'start' || placement === 'end';

        await expect(list(page)).toHaveAttribute(
          'aria-orientation',
          vertical ? 'vertical' : 'horizontal'
        );

        await tab(page, 'Alpha').focus();
        await page.keyboard.press(vertical ? 'ArrowDown' : 'ArrowRight');

        await expect(tab(page, 'Beta')).toBeFocused();

        await page.keyboard.press('Enter');
        // Card меняет padding через CSS transition; сравниваем завершённый layout.
        await expect(async () => {
          const nav = (await root(page).locator('.ant-tabs-nav').boundingBox())!;
          const content = (await panel(page, 'Beta').boundingBox())!;
          const alpha = (await tab(page, 'Alpha').boundingBox())!;
          const beta = (await tab(page, 'Beta').boundingBox())!;
          if (vertical) expect(beta.y).toBeGreaterThanOrEqual(alpha.y + alpha.height - 1);
          else
            expect(beta.x).toBeGreaterThanOrEqual(alpha.x + alpha.width - 1);
          if (placement === 'top') expect(nav.y + nav.height).toBeLessThanOrEqual(content.y + 1);
          if (placement === 'bottom')
            expect(nav.y).toBeGreaterThanOrEqual(content.y + content.height - 1);
          if (placement === 'start') expect(nav.x + nav.width).toBeLessThanOrEqual(content.x + 1);
          if (placement === 'end')
            expect(nav.x).toBeGreaterThanOrEqual(content.x + content.width - 1);
        }).toPass({ timeout: 5000 });

        const ink = root(page).locator('.ant-tabs-ink-bar');

        if (type === 'card') await expect(ink).toBeHidden();
        else
          await expect.poll(async () => {
            const line = (await ink.boundingBox())!;
            const button = (await tab(page, 'Beta').boundingBox())!;

            return vertical
              ? Math.abs(line.y - button.y) < 1 && Math.abs(line.height - button.height) < 1
              : Math.abs(line.x - button.x) < 1 && Math.abs(line.width - button.width) < 1;
          }).toBe(true);
      }
    );
  }
}

test(
  'Tabs uses RTL arrows and logical placements and keeps the indicator aligned after resizing',
  async ({ page }) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    await tab(page, 'Alpha').focus();
    await page.keyboard.press('ArrowLeft');

    await expect(tab(page, 'Beta')).toBeFocused();

    await page.keyboard.press('Enter');
    await page.setViewportSize({ width: 900, height: 800 });
    await expect.poll(async () => {
      const ink = (await root(page).locator('.ant-tabs-ink-bar').boundingBox())!;
      const bounds = (await tab(page, 'Beta').boundingBox())!;

      return Math.abs(ink.x - bounds.x) < 1 && Math.abs(ink.width - bounds.width) < 1;
    }).toBe(true);
    await setting(page, 'placement', 'start');

    await expect(root(page)).toHaveClass(/ant-tabs-right/);

    const nav = (await root(page).locator('.ant-tabs-nav').boundingBox())!;
    const content = (await panel(page, 'Beta').boundingBox())!;

    expect(nav.x).toBeGreaterThanOrEqual(content.x + content.width - 1);

    await tab(page, 'Beta').focus();
    await page.keyboard.press('ArrowUp');

    await expect(tab(page, 'Alpha')).toBeFocused();
  }
);

test(
  'Tabs scrolls focused tabs into view without activating them or widening the document',
  async ({ page }) => {
    await page.getByLabel('Many Tabs items', { exact: true }).check();
    await tab(page, 'Section 1').focus();
    await page.keyboard.press('End');

    await expect(tab(page, 'Section 30')).toBeFocused();
    await expect(tab(page, 'Section 1')).toHaveAttribute('aria-selected', 'true');

    const view = (await root(page).locator('.ant-tabs-nav-wrap').boundingBox())!;
    const last = (await tab(page, 'Section 30').boundingBox())!;

    expect(last.x + last.width).toBeLessThanOrEqual(view.x + view.width + 1);
    expect(last.x).toBeGreaterThanOrEqual(view.x - 1);

    await expect.poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
      .toBe(true);
    await page.keyboard.press('Enter');

    await expect(status(page, 'owner')).toHaveText('"section-29"');

    await setting(page, 'placement', 'start');
    await tab(page, 'Section 30').focus();
    await page.keyboard.press('Home');

    await expect(tab(page, 'Section 1')).toBeFocused();

    await expect.poll(
      () =>
        root(page).locator('.ant-tabs-nav-wrap')
          .evaluate((element) => element.scrollTop < 1)
    )
      .toBe(true);
    await setting(page, 'placement', 'top');
    await page.getByLabel('Right to left', { exact: true }).check();
    await tab(page, 'Section 1').focus();
    await page.keyboard.press('End');

    await expect(tab(page, 'Section 30')).toBeFocused();

    await expect.poll(
      () =>
        root(page).locator('.ant-tabs-nav-wrap')
          .evaluate((element) => element.scrollLeft < 0)
    )
      .toBe(true);

    const rtlView = (await root(page).locator('.ant-tabs-nav-wrap').boundingBox())!;
    const rtlLast = (await tab(page, 'Section 30').boundingBox())!;

    expect(rtlLast.x).toBeGreaterThanOrEqual(rtlView.x - 1);
    expect(rtlLast.x + rtlLast.width).toBeLessThanOrEqual(rtlView.x + rtlView.width + 1);
  }
);

test(
  'Tabs preserves panel state across layout changes and inherits dark compact styling and reduced motion',
  async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await draft(page, 'Alpha').fill('Layout draft');
    await page.getByLabel('Dark Tabs theme', { exact: true }).check();
    await page.getByLabel('Compact Tabs theme', { exact: true }).check();
    await setting(page, 'size', 'small');
    await setting(page, 'type', 'card');
    await setting(page, 'placement', 'end');

    await expect(draft(page, 'Alpha')).toHaveValue('Layout draft');
    await expect(root(page)).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '12px');
    await expect(tab(page, 'Locked')).toHaveCSS('color', 'rgba(255, 255, 255, 0.25)');
    await expect(tab(page, 'Alpha').locator('.ant-tabs-tab-btn')).toHaveCSS(
      'transition-duration',
      '0s'
    );
    await expect(root(page).locator('.ant-tabs-ink-bar')).toHaveCSS('transition-duration', '0s');

    await root(page).screenshot({ path: testInfo.outputPath('tabs-dark-card.png') });
  }
);

test(
  'Tabs navigation remains available when ConfigProvider disables form controls',
  async ({ page }) => {
    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(tab(page, 'Alpha')).toBeEnabled();

    await tab(page, 'Beta').click();

    await expect(tab(page, 'Beta')).toHaveAttribute('aria-selected', 'true');
    await expect(draft(page, 'Beta')).toBeDisabled();
  }
);

test(
  'Tabs works inside Modal, preserves draft panels and leaves Escape to the dialog',
  async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Open Tabs modal', exact: true });

    await opener.click();

    const dialog = page.getByRole('dialog', { name: 'Tabs modal', exact: true });
    const sections = dialog.getByRole('tablist', { name: 'Modal sections', exact: true });

    await dialog.getByLabel('Modal tab draft', { exact: true }).fill('Modal draft');
    await sections.getByRole('tab', { name: 'Modal History', exact: true }).click();

    await expect(dialog.getByRole('tabpanel', { name: 'Modal History', exact: true }))
      .toHaveText('Modal history content');

    await sections.getByRole('tab', { name: 'Modal Details', exact: true }).click();

    await expect(dialog.getByLabel('Modal tab draft', { exact: true })).toHaveValue('Modal draft');
    await expect(sections.getByRole('tab', { name: 'Modal Details', exact: true })).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(dialog.getByRole('tabpanel', { name: 'Modal Details', exact: true })).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  }
);

test.describe('mobile Tabs', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'uses horizontal scrolling on narrow screens and retains drafts after touch selection',
    async ({ page }, testInfo) => {
      await setting(page, 'placement', 'start');
      await page.getByLabel('Long Tabs labels', { exact: true }).check();

      await expect(list(page)).toHaveAttribute('aria-orientation', 'horizontal');
      await expect(root(page)).toHaveClass(/ant-tabs-top/);

      await draft(page, 'Alpha').fill('Touch draft');
      await tab(page, 'Gamma').tap();

      await expect(panel(page, 'Gamma')).toBeVisible();

      await tab(page, 'Alpha with a very long section name for the selected account').tap();

      await expect(
        panel(page, 'Alpha with a very long section name for the selected account').getByLabel(
          'Alpha draft',
          { exact: true }
        )
      )
        .toHaveValue('Touch draft');

      await expect.poll(async () => {
        const bounds = (await tab(
          page,
          'Alpha with a very long section name for the selected account'
        )
          .boundingBox())!;
        const view = (await root(page).locator('.ant-tabs-nav-wrap').boundingBox())!;

        return Math.abs(bounds.x - view.x) < 1;
      }).toBe(true);
      await expect.poll(
        () =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      )
        .toBe(true);
      await root(page).screenshot({ path: testInfo.outputPath('tabs-mobile.png') });
    }
  );
});
