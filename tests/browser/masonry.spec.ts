import type { Locator } from '@playwright/test';
import { test, expect } from './test';

const item = (root: Locator, key: string) => root.locator(`.ant-masonry-item:has(> [data-key="${key}"])`);
const columns = (root: Locator) => root.locator('.tile').evaluateAll(
  elements => elements.map(element => Number((element as HTMLElement).dataset.column))
);

async function expectPixels(element: Locator, property: string, value: number) {
  // CSS calc делит ширину с квантованием layout units до 1/64 px.
  await expect.poll(() => element.evaluate(
    (node, name) => parseFloat(getComputedStyle(node).getPropertyValue(name)),
    property
  )).toBeCloseTo(value, 1);
}

async function frames(root: Locator) {
  await root.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    }));
  }));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=masonry');

  await expect(page.locator('.fixture-masonry > .ant-masonry-item')).toHaveCount(5);
  await expect(page.locator('.fixture-masonry')).toHaveCSS('height', '200px');
});

test(
  'Masonry lays out measured content in the shortest columns with one root per item',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');

    await expect(root).toHaveCSS('position', 'relative');
    await expect(root).toHaveCSS('width', '600px');
    await expect(root.locator(':scope > .ant-masonry-item')).toHaveCount(5);
    await expect.poll(() => columns(root)).toEqual([0, 1, 2, 1, 0]);
    await expect(item(root, 'd')).toHaveCSS('top', '60px');
    await expect(item(root, 'e')).toHaveCSS('top', '100px');
    await expect(item(root, 'a')).toHaveCSS('height', '100px');
    await expectPixels(item(root, 'a'), 'width', 200);
    await expect(page.getByLabel('Masonry ref', { exact: true })).toHaveText('DIV');
    await expect(page.getByLabel('Masonry layout', { exact: true })).toContainText('"label":"Alpha"');

    await page.getByRole('button', { name: 'Masonry action', exact: true }).click();

    await expect(page.getByLabel('Masonry events', { exact: true })).toHaveText('action');
  }
);

test(
  'Masonry keeps horizontal and vertical gutters independent',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    const gutter = page.getByRole('combobox', { name: 'Masonry gutter', exact: true });
    await gutter.selectOption('pair');

    await expect(root).toHaveCSS('height', '224px');
    await expectPixels(item(root, 'a'), 'width', 192);
    await expectPixels(item(root, 'b'), 'inset-inline-start', 204);
    await expect(item(root, 'd')).toHaveCSS('top', '84px');
    await expect(item(root, 'e')).toHaveCSS('top', '124px');

    await gutter.selectOption('single');

    await expect(root).toHaveCSS('height', '212px');
    await expect(item(root, 'd')).toHaveCSS('top', '72px');
    await expect(item(root, 'e')).toHaveCSS('top', '112px');

    await gutter.selectOption('mixed');

    await expect(root).toHaveCSS('height', '224px');
    await expectPixels(item(root, 'a'), 'width', 192);
  }
);

test(
  'Masonry resolves columns and gutters at the pinned responsive breakpoints',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    await page.getByLabel('Responsive Masonry columns', { exact: true }).check();
    await page.getByRole('combobox', { name: 'Masonry gutter', exact: true }).selectOption('responsive');
    const cases = [
      { width: 575, count: 1, height: 476 },
      { width: 576, count: 2, height: 296 },
      { width: 768, count: 3, height: 212 },
      { width: 992, count: 4, height: 172 },
      { width: 1600, count: 5, height: 120 },
      { width: 1920, count: 6, height: 120 }
    ];

    for (const scenario of cases) {
      await page.setViewportSize({ width: scenario.width, height: 900 });

      await expect(root).toHaveClass(new RegExp(`context-columns-${scenario.count} local-columns-${scenario.count}`));
      await expect(root).toHaveCSS('height', `${scenario.height}px`);
    }
  }
);

test(
  'Masonry retains a stale size without fresh until a captured load or error remeasures it',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    await page.getByLabel('Taller Masonry child', { exact: true }).check();

    await expect(item(root, 'b')).toHaveCSS('height', '180px');
    await frames(root);
    await expect(root).toHaveCSS('height', '200px');
    await expect(item(root, 'd')).toHaveCSS('top', '60px');

    await page.getByRole('button', { name: 'Masonry image load', exact: true }).click();

    await expect(root).toHaveCSS('height', '220px');
    await expect.poll(() => columns(root)).toEqual([0, 1, 2, 0, 2]);
    await expect(item(root, 'd')).toHaveCSS('top', '100px');

    await page.getByLabel('Taller Masonry child', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Masonry image error', exact: true }).click();

    await expect(root).toHaveCSS('height', '200px');
    await expect.poll(() => columns(root)).toEqual([0, 1, 2, 1, 0]);
  }
);

test(
  'Masonry observes child changes with fresh and always observes the root',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    await page.getByLabel('Fresh Masonry sizes', { exact: true }).check();
    await page.getByLabel('Taller Masonry child', { exact: true }).check();

    await expect(root).toHaveCSS('height', '220px');
    await expect.poll(() => columns(root)).toEqual([0, 1, 2, 0, 2]);

    await page.getByLabel('Fresh Masonry sizes', { exact: true }).uncheck();
    await page.getByLabel('Taller Masonry child', { exact: true }).uncheck();
    await frames(root);

    await expect(root).toHaveCSS('height', '220px');

    await page.getByRole('button', { name: 'Resize Masonry root', exact: true }).click();

    await expect(root).toHaveCSS('width', '480px');
    await expect(root).toHaveCSS('height', '200px');
  }
);

test(
  'Masonry remeasures replaced items and reports their original payload and new columns',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    await page.getByRole('button', { name: 'Replace Masonry item data', exact: true }).click();

    await expect(root).toHaveCSS('height', '220px');
    await expect.poll(() => columns(root)).toEqual([0, 1, 2, 0, 2]);
    await expect(page.getByLabel('Masonry layout', { exact: true }))
      .toContainText('"key":"b","column":1,"label":"Changed Beta"');

    await page.getByLabel('Pin Masonry item', { exact: true }).check();

    await expect(item(root, 'e').locator('.tile')).toHaveAttribute('data-column', '1');
    await expect(item(root, 'e')).toHaveCSS('top', '180px');
    await expect(root).toHaveCSS('height', '280px');
  }
);

test(
  'Masonry preserves keyed drafts and focus while reversing data',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    const draft = page.getByLabel('Masonry draft a', { exact: true });
    await draft.fill('Retained draft');
    await draft.focus();
    await draft.evaluate((element: HTMLInputElement) => element.setSelectionRange(2, 6, 'backward'));
    await expect(draft).toBeFocused();
    await page.getByRole('button', { name: 'Reverse Masonry items', exact: true }).dispatchEvent('click');

    await expect(root.locator('.tile').first()).toHaveAttribute('data-key', 'e');
    await expect(draft).toHaveValue('Retained draft');
    const active = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      label: document.activeElement?.getAttribute('aria-label')
    }));
    await expect(draft, JSON.stringify(active)).toBeFocused();
    expect(await draft.evaluate((element: HTMLInputElement) => [
      element.selectionStart, element.selectionEnd, element.selectionDirection
    ])).toEqual([2, 6, 'backward']);
    await expect(item(root, 'a').locator('.tile')).toHaveAttribute('data-index', '4');
  }
);

test(
  'Masonry keeps focus on an outside action after a native click reorders its items',
  async ({ page }) => {
    const draft = page.getByLabel('Masonry draft a', { exact: true });
    const action = page.getByRole('button', { name: 'Reverse Masonry items', exact: true });
    await draft.fill('Retained draft');
    await action.click();

    await expect(page.locator('.fixture-masonry .tile').first()).toHaveAttribute('data-key', 'e');
    await expect(draft).toHaveValue('Retained draft');
    await expect(action).toBeFocused();

    await page.getByLabel('Mount Masonry', { exact: true }).uncheck();

    await expect(page.getByLabel('Masonry ref', { exact: true })).toHaveText('none');
    await expect(page.getByLabel('Mount Masonry', { exact: true })).toBeFocused();
  }
);

test(
  'Masonry retains a contenteditable selection while moving its keyed container',
  async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Masonry editable', exact: true });
    await editor.focus();
    await editor.evaluate(element => {
      const text = element.firstChild!;
      window.getSelection()!.setBaseAndExtent(text, 8, text, 2);
    });
    await page.getByRole('button', { name: 'Reverse Masonry items', exact: true }).dispatchEvent('click');

    await expect(editor).toBeFocused();
    expect(await editor.evaluate(() => {
      const selection = window.getSelection()!;

      return [selection.anchorOffset, selection.focusOffset, selection.toString()];
    })).toEqual([8, 2, 'itable']);
  }
);

test(
  'Masonry gives scalar and snippet children priority over the item renderer',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    const children = page.getByRole('combobox', { name: 'Masonry children', exact: true });
    await children.selectOption('snippet');

    await expect(root.getByText('Own item content', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Masonry draft b', { exact: true })).toHaveCount(0);

    await children.selectOption('zero');

    await expect(root.locator(':scope > .ant-masonry-item').nth(1)).toHaveText('0');

    for (const value of ['false', 'empty']) {
      await children.selectOption(value);

      await expect(root.locator(':scope > .ant-masonry-item').nth(1)).toHaveText('');
      await expect(page.getByLabel('Masonry draft b', { exact: true })).toHaveCount(0);
    }
  }
);

test(
  'Masonry merges semantic styles but retains geometry priority and replaces nested config',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');

    await expect(root)
      .toHaveClass(/masonry-context context-columns-3 local-columns-3 masonry-owner/);
    await expect(item(root, 'a')).toHaveClass(/context-item local-item/);
    await expect(root).toHaveCSS('outline-offset', '6px');
    await expect(item(root, 'a')).toHaveCSS('outline-offset', '4px');

    await page.getByLabel('Styled Masonry', { exact: true }).check();

    await expect(root).toHaveCSS('outline-offset', '10px');
    await expect(item(root, 'a')).toHaveCSS('outline-offset', '8px');
    await expectPixels(item(root, 'a'), 'width', 200);
    await expect(item(root, 'a')).toHaveCSS('top', '0px');
    await expect(item(root, 'a')).toHaveCSS('position', 'absolute');

    await page.getByLabel('Styled Masonry', { exact: true }).uncheck();
    await page.getByLabel('Replace Masonry config', { exact: true }).check();

    await expect(root).toHaveClass(/nested-masonry-context local-columns-3/);
    await expect(root).not.toHaveClass(/(?:^| )masonry-context(?: |$)/);
    await expect(root).not.toHaveClass(/context-columns-3/);
    await expect(root).toHaveCSS('outline-offset', '0px');
    await expect(item(root, 'a')).not.toHaveClass(/context-item/);
  }
);

test(
  'Masonry accepts layout feedback without repeated equal notifications',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    const count = page.getByLabel('Masonry layout count', { exact: true });
    const before = await count.textContent();
    await page.getByLabel('Dark Masonry', { exact: true }).check();
    await frames(root);

    await expect(count).toHaveText(before!);

    await page.getByLabel('Persist Masonry columns', { exact: true }).check();
    await page.getByLabel('Pin Masonry item', { exact: true }).check();

    await expect(item(root, 'e').locator('.tile')).toHaveAttribute('data-column', '1');
    await frames(root);
    const settled = await count.textContent();
    await frames(root);

    await expect(count).toHaveText(settled!);
    expect(Number(settled)).toBeLessThan(8);
  }
);

test(
  'Masonry keeps leaving nodes until their own CSS transition ends',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    const beta = item(root, 'b');
    await expect(beta).not.toHaveClass(/ant-masonry-item-fade/);
    await page.getByLabel('Slow Masonry leave', { exact: true }).check();
    await page.getByRole('button', { name: 'Remove Masonry item', exact: true }).click();

    await expect(beta).toHaveClass(/ant-masonry-item-fade-leave-active/);
    await expect(root.locator(':scope > .ant-masonry-item')).toHaveCount(5);
    await beta.locator('.tile').dispatchEvent('transitionend');

    await expect(beta).toHaveCount(1);
    await expect(beta).toHaveCount(0);
    await expect(root.locator(':scope > .ant-masonry-item')).toHaveCount(4);
  }
);

test(
  'Masonry revives a leaving key without losing its draft or removing it on an old end',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    const beta = item(root, 'b');
    const draft = page.getByLabel('Masonry draft b', { exact: true });
    await expect(beta).not.toHaveClass(/ant-masonry-item-fade/);
    await draft.fill('Restored draft');
    await page.getByLabel('Slow Masonry leave', { exact: true }).check();
    await page.getByRole('button', { name: 'Remove Masonry item', exact: true }).click();
    await expect(beta).toHaveClass(/ant-masonry-item-fade-leave-active/);
    await page.getByRole('button', { name: 'Restore Masonry item', exact: true }).click();

    await expect(beta).toHaveCount(1);
    await expect(draft).toHaveValue('Restored draft');
    await beta.dispatchEvent('transitionend');

    await expect(root.locator(':scope > .ant-masonry-item')).toHaveCount(5);
    await expect(draft).toHaveValue('Restored draft');
  }
);

test(
  'Masonry clears the root height when emptied and releases its ref on unmount',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    await page.getByRole('button', { name: 'Empty Masonry items', exact: true }).click();

    await expect(root).toHaveCSS('height', '0px');
    await expect(root.locator(':scope > .ant-masonry-item')).toHaveCount(0);
    await expect(page.getByLabel('Masonry layout', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount Masonry', { exact: true }).uncheck();

    await expect(root).toHaveCount(0);
    await expect(page.getByLabel('Masonry ref', { exact: true })).toHaveText('none');
  }
);

test(
  'Masonry inherits RTL and theme while preserving physical data order and native controls',
  async ({ page }) => {
    const root = page.locator('.fixture-masonry');
    await page.getByLabel('Dark Masonry', { exact: true }).check();
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Disable all components', { exact: true }).check();
    await page.getByLabel('English locale', { exact: true }).check();

    await expect(root).toHaveClass(/ant-masonry-rtl/);
    await expect(root).toHaveCSS('direction', 'rtl');
    await expect(root).toHaveCSS('color-scheme', 'dark');
    await expect.poll(() => columns(root)).toEqual([0, 1, 2, 1, 0]);
    await expect(page.getByLabel('Masonry draft a', { exact: true })).toBeEnabled();
    const first = (await item(root, 'a').boundingBox())!;
    const last = (await item(root, 'c').boundingBox())!;

    expect(first.x).toBeGreaterThan(last.x);
  }
);
