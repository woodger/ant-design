import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=breadcrumb');

  await expect(page.getByRole('navigation', { name: 'Project breadcrumb', exact: true }))
    .toBeVisible();
});

test(
  'Breadcrumb updates cumulative paths and titles and retains native navigation cancellation',
  async ({ page }) => {
    const root = page.locator('#fixture-breadcrumb');

    await expect(root.getByRole('link', { name: 'Home 42', exact: true })).toHaveAttribute(
      'href',
      '#/home'
    );
    await expect(root.getByRole('link', { name: 'Project 42', exact: true })).toHaveAttribute(
      'href',
      '#/home/42'
    );

    await page.getByLabel('Breadcrumb parameter', { exact: true }).fill('alpha/beta');

    await expect(root.getByRole('link', { name: 'Project alpha/beta', exact: true })).toHaveAttribute(
      'href',
      '#/home/alpha/beta'
    );

    await page.getByLabel('Cancel Breadcrumb navigation', { exact: true }).check();

    const url = page.url();

    await root.getByRole('link', { name: 'Home alpha/beta', exact: true }).click();

    expect(page.url()).toBe(url);
    await expect(page.getByLabel('Breadcrumb events', { exact: true })).toHaveText('["home"]');
  }
);

test(
  'Breadcrumb native action supports Enter and Space without submitting its form',
  async ({ page }) => {
    const action = page.locator('#fixture-breadcrumb').getByRole(
      'button',
      { name: 'Current', exact: true }
    );

    await action.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');

    await expect(page.getByLabel('Breadcrumb actions', { exact: true })).toHaveText('2');
    await expect(page.getByLabel('Breadcrumb submissions', { exact: true })).toHaveText('0');
  }
);

test(
  'Breadcrumb menu uses native path links, skips disabled entries and activates with Space',
  async ({ page }) => {
    const trigger = page.locator('#fixture-breadcrumb').getByRole(
      'link',
      { name: 'Project 42', exact: true }
    );

    await trigger.focus();
    await page.keyboard.press('ArrowDown');

    const menu = page.getByRole('menu', { name: 'Breadcrumb sections', exact: true });
    const layout = menu.getByRole('menuitem', { name: 'Layout', exact: true });

    await expect(layout).toHaveAttribute('href', '#/home/42/layout');
    expect(await layout.evaluate(node => node.tagName)).toBe('A');
    await expect(layout).toBeFocused();

    await page.keyboard.press('ArrowDown');

    await expect(menu.getByRole('menuitem', { name: 'General', exact: true })).toBeFocused();

    await page.keyboard.press('Space');

    await expect(page).toHaveURL(/#\/home\/42\/general$/);
    await expect(menu).toBeHidden();
    await expect(page.getByLabel('Breadcrumb events', { exact: true }))
      .toHaveText('["menu:general"]');
  }
);

test(
  'Breadcrumb custom snippets receive original items and path snapshots while explicit separators stay hidden from accessibility',
  async ({ page }) => {
    await page.getByLabel('Custom Breadcrumb renderer', { exact: true }).check();

    const root = page.locator('#fixture-breadcrumb');
    const home = root.getByRole('link', { name: 'Custom Home :id', exact: true });

    await expect(home).toHaveAttribute('href', '#/home');
    await expect(home).toHaveAttribute('data-route-count', '3');
    await expect(home).toHaveAttribute('data-param-id', '42');

    await page.getByLabel('Automatic Breadcrumb separators', { exact: true }).uncheck();

    await expect(root.locator('.ant-breadcrumb-separator')).toHaveCount(1);
    await expect(root.locator('.ant-breadcrumb-separator')).toHaveAttribute('aria-hidden', 'true');
    await expect(root.locator('.ant-breadcrumb-separator')).toHaveText(':');
  }
);

test(
  'Breadcrumb inherits dark RTL and compact values and applies semantic styles at their documented elements',
  async ({ page }) => {
    await page.getByLabel('Dark Breadcrumb', { exact: true }).check();
    await page.getByLabel('Compact Breadcrumb', { exact: true }).check();
    await page.getByLabel('Right to left', { exact: true }).check();

    const root = page.locator('#fixture-breadcrumb');

    await expect(root).toHaveCSS('direction', 'rtl');
    await expect(root).toHaveCSS('padding', '4px');
    await expect(root.locator('.ant-breadcrumb-item').first()).toHaveCSS('padding', '2px');
    await expect(root.locator('.ant-breadcrumb-separator').first()).toHaveCSS('padding', '3px');
    await expect(root.getByRole('link', { name: 'Home 42', exact: true })).toHaveCSS(
      'color',
      'rgba(255, 255, 255, 0.45)'
    );
  }
);

test(
  'Breadcrumb menu cancellation prevents native Enter navigation and keeps the menu open',
  async ({ page }) => {
    await page.getByLabel('Cancel Breadcrumb navigation', { exact: true }).check();
    await page.locator('#fixture-breadcrumb').getByRole('link', { name: 'Project 42', exact: true })
      .focus();
    await page.keyboard.press('ArrowDown');

    const menu = page.getByRole('menu', { name: 'Breadcrumb sections', exact: true });

    await expect(menu.getByRole('menuitem', { name: 'Layout', exact: true })).toBeFocused();

    const url = page.url();

    await page.keyboard.press('Enter');

    expect(page.url()).toBe(url);
    await expect(menu).toBeVisible();
    await expect(page.getByLabel('Breadcrumb events', { exact: true }))
      .toHaveText('["menu:layout"]');
    await expect(menu.getByRole('menuitem', { name: 'Locked', exact: true })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(menu.getByRole('menuitem', { name: 'Locked', exact: true })).not
      .toHaveAttribute('href');
  }
);
