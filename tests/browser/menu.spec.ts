import { test, expect } from './test';
import type { Page } from '@playwright/test';

const menu = (page: Page) => page.getByRole('menu', { name: 'Controlled menu', exact: true });
const item = (page: Page, name: string) => menu(page).getByRole('menuitem', { name, exact: true });
const selected = (page: Page) => page.getByLabel('Menu selected', { exact: true });
const opened = (page: Page) => page.getByLabel('Menu opened', { exact: true });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=menu'); });

test(
  'Menu inline groups dividers and selection callbacks preserve leaf-to-root key paths',
  async ({ page }) => {
    await expect(menu(page).getByText('Workspace', { exact: true })).toBeVisible();
    await expect(menu(page).getByRole('separator')).toHaveCount(1);

    await item(page, 'Delete 0').click();

    await expect(selected(page)).toHaveText('["delete"]');
    await expect(page.getByLabel('Menu events', { exact: true }))
      .toContainText('click:delete:delete/projects');
    await expect(opened(page)).toHaveText('["projects"]');
  }
);

test(
  'Menu preserves source repeated single deselect semantics and multiple toggling',
  async ({ page }) => {
    await item(page, 'Home').click();

    await expect(selected(page)).toHaveText('["home"]');
    await expect(page.getByLabel('Menu events', { exact: true }))
      .toContainText('deselect:home');

    await page.getByLabel('Multiple menu selection', { exact: true }).check();
    await item(page, 'Last').click();

    await expect(selected(page)).toHaveText('["home","last"]');

    await item(page, 'Home').click();

    await expect(selected(page)).toHaveText('["last"]');
  }
);

test(
  'Menu native links navigate and Enter activates callbacks once in item parent root order',
  async ({ page }) => {
    const link = menu(page).getByRole('link', { name: 'Alpha link', exact: true });

    await link.focus();
    await link.press('Enter');

    await expect(page).toHaveURL(/#menu-destination$/);
    await expect(page.getByLabel('Menu link clicks', { exact: true })).toHaveText('1');
    await expect(selected(page)).toHaveText('["alpha"]');

    const events = JSON.parse(await page.getByLabel('Menu events', { exact: true }).innerText()) as string[];

    expect(events.filter(event => event === 'click:alpha:alpha/projects'))
      .toHaveLength(1);
    expect(events.indexOf('parent:alpha'))
      .toBeLessThan(events.indexOf('click:alpha:alpha/projects'));
  }
);

test(
  'Menu controlled rejection and selectable false keep owner selection unchanged',
  async ({ page }) => {
    await page.getByLabel('Accept menu changes', { exact: true }).uncheck();
    await item(page, 'Last').click();

    await expect(selected(page)).toHaveText('["home"]');

    await item(page, 'Projects').click();

    await expect(opened(page)).toHaveText('["projects"]');

    await page.getByLabel('Accept menu changes', { exact: true }).check();
    await page.getByLabel('Selectable menu', { exact: true }).uncheck();
    await item(page, 'Last').click();

    await expect(selected(page)).toHaveText('["home"]');
    await expect(page.getByLabel('Menu events', { exact: true }))
      .toContainText('click:last:last');
  }
);

test(
  'Menu inline close retains descendant open keys and restores nested content',
  async ({ page }) => {
    await item(page, 'Nested').click();

    await expect(item(page, 'Leaf')).toBeVisible();

    await item(page, 'Projects').click();

    await expect(item(page, 'Leaf')).toHaveCount(0);
    await expect(opened(page)).toHaveText('["nested"]');

    await item(page, 'Projects').click();

    await expect(item(page, 'Leaf')).toBeVisible();
  }
);

test(
  'Menu inline keyboard walks all visible enabled items and toggles submenus with Enter',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Focus menu', exact: true }).click();

    await expect(item(page, 'Home')).toBeFocused();

    await item(page, 'Home').press('ArrowDown');

    await expect(item(page, 'Projects')).toBeFocused();

    await item(page, 'Projects').press('Enter');

    await expect(menu(page).getByRole('link', { name: 'Alpha link', exact: true }))
      .toHaveCount(0);

    await item(page, 'Projects').press('Enter');
    await item(page, 'Projects').press('ArrowDown');

    await expect(menu(page).getByRole('link', { name: 'Alpha link', exact: true }))
      .toBeFocused();

    await menu(page).getByRole('link', { name: 'Alpha link', exact: true }).press('ArrowDown');

    await expect(item(page, 'Nested')).toBeFocused();

    await item(page, 'Nested').press('End');

    await expect(item(page, 'Last')).toBeFocused();
  }
);

test(
  'Menu vertical popup supports nested keyboard opening Escape and single-selection close',
  async ({ page }) => {
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await item(page, 'Projects').click();
    await expect.poll(async () => {
      const title = await item(page, 'Projects').boundingBox();
      const popup = await page.locator('[popover]:popover-open').boundingBox();

      return title && popup ? Math.abs(title.y - popup.y) : Infinity;
    }).toBeLessThan(1);
    await item(page, 'Projects').click();
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await item(page, 'Projects').click();

    await expect(menu(page).getByRole('link', { name: 'Alpha link', exact: true }))
      .toBeVisible();

    await item(page, 'Projects').focus();
    await item(page, 'Projects').press('ArrowRight');

    await expect(menu(page).getByRole('link', { name: 'Alpha link', exact: true }))
      .toBeFocused();

    await menu(page).getByRole('link', { name: 'Alpha link', exact: true }).press('ArrowDown');

    await expect(item(page, 'Nested')).toBeFocused();

    await item(page, 'Nested').press('ArrowRight');

    await expect(item(page, 'Leaf')).toBeFocused();

    await item(page, 'Leaf').press('Escape');

    await expect(item(page, 'Nested')).toBeFocused();
    await expect(item(page, 'Leaf')).toHaveCount(0);

    await item(page, 'Delete 0').click();

    await expect(opened(page)).toHaveText('[]');
  }
);

test(
  'Menu nested popup clicks remain inside parent popovers and select the child',
  async ({ page }) => {
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await item(page, 'Projects').click();
    await item(page, 'Nested').click();
    await item(page, 'Leaf').click();

    await expect(selected(page)).toHaveText('["leaf"]');
    await expect(opened(page)).toHaveText('[]');
  }
);

test(
  'Menu keyboard reopening preserves upstream open-key order and skips identical callbacks',
  async ({ page }) => {
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await page.getByRole('button', { name: 'Open nested owner', exact: true }).click();

    await expect(opened(page)).toHaveText('["projects","nested"]');

    await item(page, 'Projects').focus();
    await item(page, 'Projects').press('ArrowRight');

    await expect(opened(page)).toHaveText('["nested","projects"]');

    await item(page, 'Projects').focus();
    await item(page, 'Projects').press('ArrowRight');

    const events = JSON.parse(await page.getByLabel('Menu events', { exact: true }).innerText()) as string[];

    expect(events.filter(event => event === 'open:nested,projects')).toHaveLength(1);
  }
);

test(
  'Menu horizontal root arrows reverse in RTL while submenu arrows use vertical semantics',
  async ({ page }) => {
    await page.getByLabel('Menu mode', { exact: true }).selectOption('horizontal');
    await page.getByRole('button', { name: 'Focus menu', exact: true }).click();
    await item(page, 'Home').press('ArrowRight');

    await expect(item(page, 'Projects')).toBeFocused();

    await page.getByLabel('Right to left', { exact: true }).check();
    await item(page, 'Projects').focus();
    await item(page, 'Projects').press('ArrowRight');

    await expect(item(page, 'Home')).toBeFocused();

    await item(page, 'Home').press('ArrowLeft');
    await item(page, 'Projects').press('ArrowDown');

    await expect(menu(page).getByRole('link', { name: 'Alpha link', exact: true }))
      .toBeFocused();
  }
);

test(
  'Menu hover opens and closes popups with delays and survives movement into child content',
  async ({ page }) => {
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await page.getByLabel('Click submenu trigger', { exact: true }).uncheck();
    await item(page, 'Projects').hover();

    const link = menu(page).getByRole('link', { name: 'Alpha link', exact: true });

    await expect(link).toBeVisible();

    await link.hover();

    await expect(link).toBeVisible();

    await page.getByRole('button', { name: 'Replace selected owner', exact: true }).hover();

    await expect(link).toHaveCount(0);
  }
);

test(
  'Menu explicit disabled blocks selection and links while global form-control disabled does not disable navigation',
  async ({ page }) => {
    await page.getByLabel('Disable all components', { exact: true }).check();
    await item(page, 'Last').click();

    await expect(selected(page)).toHaveText('["last"]');

    await page.getByLabel('Disable menu', { exact: true }).check();

    const target = item(page, 'Home');

    await target.dispatchEvent('click');

    await expect(selected(page)).toHaveText('["last"]');

    await target.dispatchEvent('keydown', { key: 'Enter', bubbles: true });

    await expect(selected(page)).toHaveText('["last"]');
  }
);

test('Menu collapse caches inline expanded keys and switches to popup mode', async ({ page }) => {
  await page.getByLabel('Collapse menu', { exact: true }).check();

  await expect(menu(page)).toHaveClass(/ant-menu-inline-collapsed/);
  await expect(opened(page)).toHaveText('[]');

  await page.getByLabel('Collapse menu', { exact: true }).uncheck();

  await expect(opened(page)).toHaveText('[]');
  await expect(
    page.getByRole('menu', { name: 'Collapsed defaults', exact: true }).getByRole(
      'menuitem',
      { name: 'Default child', exact: true }
    )
  )
    .toBeVisible();
});

test(
  'Menu popup outside click closes without changing selection and unmount clears pending hover',
  async ({ page }) => {
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await item(page, 'Projects').click();
    await page.getByRole('button', { name: 'Replace selected owner', exact: true }).click();

    await expect(opened(page)).toHaveText('[]');
    await expect(selected(page)).toHaveText('["last"]');

    await page.getByLabel('Click submenu trigger', { exact: true }).uncheck();
    await item(page, 'Settings').hover();
    await page.getByRole('button', { name: 'Toggle menu mount', exact: true }).click();

    await expect(menu(page)).toHaveCount(0);
    await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
  }
);

test(
  'Menu defaults stay uncontrolled and owner replacement updates active selection classes',
  async ({ page }) => {
    const target = page.getByRole('menu', { name: 'Default menu', exact: true });

    await expect(target.getByRole('menuitem', { name: 'Default item', exact: true }))
      .toHaveClass(/ant-menu-item-selected/);

    await target.getByRole('menuitem', { name: 'Zero', exact: true }).click();

    await expect(target.getByRole('menuitem', { name: 'Zero', exact: true }))
      .toHaveClass(/ant-menu-item-selected/);

    await page.getByRole('button', { name: 'Replace selected owner', exact: true }).click();

    await expect(item(page, 'Last')).toHaveClass(/ant-menu-item-selected/);
  }
);

test(
  'Menu geometry and item colors inherit its menu theme',
  async ({ page }) => {
    await expect(item(page, 'Home')).toHaveCSS('height', '40px');

    await expect(item(page, 'Delete 0')).toHaveCSS('padding-left', '48px');

    await page.getByLabel('Menu theme', { exact: true }).selectOption('dark');

    await expect(menu(page)).toHaveCSS('background-color', 'rgb(0, 21, 41)');

    await expect(item(page, 'Home')).toHaveCSS('color', 'rgb(255, 255, 255)');
  }
);

test(
  'Menu RTL inline indent uses the physical right side and small viewports preserve popup bounds',
  async ({ page }) => {
    await page.getByLabel('Right to left', { exact: true }).check();

    await expect(item(page, 'Delete 0')).toHaveCSS('padding-right', '48px');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel('Menu mode', { exact: true }).selectOption('vertical');
    await item(page, 'Projects').click();

    const box = await page.locator('[popover]:popover-open').boundingBox();

    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  }
);
