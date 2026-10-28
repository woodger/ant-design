import type { Page } from '@playwright/test';
import { test, expect } from './test';

const trigger = (page: Page) => page.getByRole('button', { name: 'Popconfirm trigger', exact: true });
const card = (page: Page, name = 'Delete fixture record?') => page.getByRole('dialog', { name, exact: true });
const status = (page: Page, name: string) => page.getByRole('status', { name: `Popconfirm ${name}`, exact: true });
const ok = (page: Page) => card(page).getByRole('button', { name: 'Подтвердить', exact: true });
const cancel = (page: Page) => card(page).getByRole('button', { name: 'Отмена', exact: true });
async function mode(page: Page, value: string) { await page.getByRole('combobox', { name: 'Popconfirm mode', exact: true }).selectOption(value); }
async function finish(page: Page, id: number, success: boolean) { await page.getByRole('button', { name: `${success ? 'Resolve' : 'Reject'} Popconfirm ${id}`, exact: true }).click(); }

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=popconfirm');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Popconfirm opens a named described dialog and cancellation preserves focus and native form behavior', async ({ page }) => {
  await trigger(page).click();
  await expect(card(page)).toBeVisible();
  await expect(card(page)).toHaveAccessibleDescription('This action removes the fixture record.');
  await expect(cancel(page)).toBeFocused();
  await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger(page)).toHaveAccessibleDescription('Owner confirmation help.');
  await cancel(page).press('Space');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(status(page, 'cancellations')).toHaveText('1');
  await expect(status(page, 'confirms')).toHaveText('0');
  await expect(status(page, 'submissions')).toHaveText('0');
  await expect(status(page, 'clicks')).toHaveText('1');
  await expect(status(page, 'changes')).toHaveText('[true,false]');
});

test('Popconfirm confirms synchronously through the keyboard and closes once without submitting its form', async ({ page }) => {
  await trigger(page).focus();
  await trigger(page).press('Enter');
  await cancel(page).press('Tab');
  await expect(ok(page)).toBeFocused();
  await ok(page).press('Enter');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(status(page, 'confirms')).toHaveText('1');
  await expect(status(page, 'cancellations')).toHaveText('0');
  await expect(status(page, 'submissions')).toHaveText('0');
  await expect(status(page, 'changes')).toHaveText('[true,false]');
});

test('Popconfirm Escape and outside dismissal change visibility without calling the cancel action', async ({ page }) => {
  await trigger(page).click();
  await cancel(page).press('Escape');
  await expect(card(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await trigger(page).click();
  const outside = page.getByRole('button', { name: 'After Popconfirm', exact: true });
  await outside.click();
  await expect(card(page)).toBeHidden();
  await expect(outside).toBeFocused();
  await expect(status(page, 'cancellations')).toHaveText('0');
  await expect(status(page, 'changes')).toHaveText('[true,false,true,false]');
});

test('Popconfirm respects cancellation by child and action button handlers', async ({ page }) => {
  await page.getByLabel('Cancel Popconfirm trigger click', { exact: true }).check();
  await trigger(page).click();
  await expect(card(page)).toBeHidden();
  await expect(status(page, 'clicks')).toHaveText('1');
  await page.getByLabel('Cancel Popconfirm trigger click', { exact: true }).uncheck();
  await page.getByLabel('Cancel Popconfirm action clicks', { exact: true }).check();
  await trigger(page).click();
  await ok(page).click();
  await cancel(page).click();
  await expect(card(page)).toBeVisible();
  await expect(status(page, 'confirms')).toHaveText('0');
  await expect(status(page, 'cancellations')).toHaveText('0');
});

test('Popconfirm suppresses its disabled popup while preserving the caller click handler', async ({ page }) => {
  await page.keyboard.press('F3');
  await trigger(page).click();
  await expect(card(page)).toBeHidden();
  await expect(status(page, 'clicks')).toHaveText('1');
  await expect(status(page, 'changes')).toHaveText('[]');
  await page.keyboard.press('F3');
  await expect(trigger(page)).toBeFocused();
  await trigger(page).click();
  await expect(card(page)).toBeVisible();
});

test('Popconfirm inherits disabled context and supports an explicit enabled override for its action buttons', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(page.getByRole('button', { name: 'Inherited Popconfirm trigger', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Enabled Popconfirm override', exact: true }).click();
  const popup = card(page, 'Enabled confirmation');
  await expect(popup.getByRole('button', { name: 'Отмена', exact: true })).toBeEnabled();
  await popup.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(popup).toBeHidden();
});

test('Popconfirm customizes labels, icon, danger and cancellation visibility', async ({ page }) => {
  await page.getByLabel('Custom Popconfirm labels', { exact: true }).check();
  await page.getByLabel('Custom Popconfirm icon', { exact: true }).check();
  await page.getByLabel('Dangerous Popconfirm button', { exact: true }).check();
  await page.getByLabel('Show Popconfirm cancel', { exact: true }).uncheck();
  await trigger(page).click();
  const button = card(page).getByRole('button', { name: 'Remove fixture', exact: true });
  await expect(button).toBeFocused();
  await expect(button).toHaveClass(/ant-btn-dangerous/);
  await expect(card(page).getByRole('button', { name: 'Keep fixture', exact: true })).toHaveCount(0);
  await expect(card(page).getByTestId('custom-confirm-icon')).toBeVisible();
  await button.press('Escape');
  await page.getByLabel('Hide Popconfirm icon', { exact: true }).check();
  await page.getByLabel('Popconfirm arrow', { exact: true }).uncheck();
  await trigger(page).click();
  await expect(card(page).locator('.ant-popconfirm-message-icon')).toHaveCount(0);
  await expect(card(page).locator('.ant-popover-arrow')).toHaveCount(0);
});

test('Popconfirm renders rich snippets and numeric zero', async ({ page }) => {
  await page.getByRole('button', { name: 'Rich Popconfirm trigger', exact: true }).click();
  const rich = card(page, 'Rich confirmation');
  await expect(rich).toHaveAccessibleDescription('Rich confirmation details');
  await rich.getByRole('button', { name: 'Accept rich', exact: true }).click();
  await expect(rich).toBeHidden();
  await page.getByRole('button', { name: 'Zero Popconfirm trigger', exact: true }).click();
  await expect(card(page, '0')).toBeVisible();
  await expect(card(page, '0')).toHaveAccessibleDescription('0');
});

test('Popconfirm initializes defaultOpen and accepts external changes without feedback', async ({ page }) => {
  const outside = page.getByRole('button', { name: 'Before Popconfirm', exact: true });
  await trigger(page).evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await outside.focus();
  await page.keyboard.press('F4');
  await expect(card(page)).toBeVisible();
  await expect(outside).toBeFocused();
  await page.keyboard.press('F4');
  await expect(card(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[]');
  await page.getByLabel('Mount default Popconfirm', { exact: true }).check();
  await page.getByRole('button', { name: 'Default Popconfirm trigger', exact: true }).scrollIntoViewIfNeeded();
  await expect(card(page, 'Default confirmation')).toBeVisible();
  await expect(page.getByRole('status', { name: 'Default Popconfirm changes', exact: true })).toHaveText('[]');
});

test('Popconfirm blocks repeat confirmations, cancellation, Escape, trigger and outside dismissal while pending', async ({ page }) => {
  await mode(page, 'async');
  await trigger(page).click();
  await ok(page).evaluate((element: HTMLButtonElement) => { element.click(); element.click(); });
  await expect(status(page, 'confirms')).toHaveText('1');
  await expect(card(page)).toHaveAttribute('aria-busy', 'true');
  await expect(ok(page)).toBeDisabled();
  await expect(cancel(page)).toBeDisabled();
  await expect(card(page).locator('.ant-popconfirm-inner-content')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(card(page).locator('.ant-popconfirm-inner-content')).toBeFocused();
  await expect(card(page)).toBeVisible();
  await page.getByRole('button', { name: 'After Popconfirm', exact: true }).click();
  await trigger(page).click();
  await expect(card(page)).toBeVisible();
  await expect(status(page, 'cancellations')).toHaveText('0');
  await expect(status(page, 'changes')).toHaveText('[true]');
  await finish(page, 1, true);
  await expect(card(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[true,false]');
  await expect(status(page, 'errors')).toHaveText('0');
  await expect(status(page, 'submissions')).toHaveText('0');
});

test('Popconfirm handles an asynchronous failure with a safe message and successful retry', async ({ page }) => {
  await mode(page, 'async');
  await trigger(page).click();
  await ok(page).click();
  await page.keyboard.press('Escape');
  await finish(page, 1, false);
  await expect(card(page).getByRole('alert')).toHaveText('Не удалось выполнить действие. Попробуйте ещё раз.');
  await expect(card(page)).not.toContainText('Private backend details');
  await expect(ok(page)).toBeEnabled();
  await expect(cancel(page)).toBeEnabled();
  await expect(status(page, 'errors')).toHaveText('1');
  await ok(page).click();
  await expect(card(page).getByRole('alert')).toHaveCount(0);
  await expect(status(page, 'confirms')).toHaveText('2');
  await finish(page, 2, true);
  await expect(card(page)).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[true,false]');
});

test('Popconfirm handles a synchronous throw and allows a new synchronous attempt', async ({ page }) => {
  await mode(page, 'throw');
  await trigger(page).click();
  await ok(page).click();
  await expect(card(page).getByRole('alert')).toBeVisible();
  await expect(status(page, 'errors')).toHaveText('1');
  await mode(page, 'sync');
  await ok(page).click();
  await expect(card(page)).toBeHidden();
  await expect(status(page, 'confirms')).toHaveText('2');
});

for (const success of [true, false]) {
  test(`Popconfirm ignores a late ${success ? 'success' : 'failure'} after external closing`, async ({ page }) => {
    await mode(page, 'async');
    await trigger(page).click();
    await ok(page).click();
    await page.keyboard.press('F4');
    await expect(card(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    await finish(page, 1, success);
    await expect(status(page, 'changes')).toHaveText('[true]');
    await expect(status(page, 'errors')).toHaveText('0');
    await expect(status(page, 'open')).toHaveText('false');
  });

  test(`Popconfirm keeps a newer confirmation pending after an older ${success ? 'success' : 'failure'}`, async ({ page }) => {
    await mode(page, 'async');
    await trigger(page).click();
    await ok(page).click();
    await page.keyboard.press('F4');
    await expect(card(page)).toBeHidden();
    await trigger(page).click();
    await ok(page).click();
    await finish(page, 1, success);
    await expect(card(page)).toHaveAttribute('aria-busy', 'true');
    await expect(ok(page)).toBeDisabled();
    await expect(status(page, 'errors')).toHaveText('0');
    await expect(status(page, 'changes')).toHaveText('[true,true]');
    await finish(page, 2, true);
    await expect(card(page)).toBeHidden();
    await expect(status(page, 'changes')).toHaveText('[true,true,false]');
  });

  test(`Popconfirm ignores a late ${success ? 'success' : 'failure'} after unmounting and remounts independently`, async ({ page }) => {
    await mode(page, 'async');
    await trigger(page).click();
    await ok(page).click();
    await page.keyboard.press('F5');
    await expect(card(page)).toBeHidden();
    await expect(trigger(page)).toHaveCount(0);
    await finish(page, 1, success);
    await expect(status(page, 'changes')).toHaveText('[true]');
    await expect(status(page, 'errors')).toHaveText('0');
    await page.keyboard.press('F5');
    await trigger(page).scrollIntoViewIfNeeded();
    await expect(card(page)).toBeVisible();
    await expect(ok(page)).toBeEnabled();
    await expect(card(page).getByRole('alert')).toHaveCount(0);
  });
}

test('Popconfirm disabling invalidates pending work and enabling starts with no stale error or loading', async ({ page }) => {
  await mode(page, 'async');
  await trigger(page).click();
  await ok(page).click();
  await page.keyboard.press('F3');
  await expect(card(page)).toBeHidden();
  await finish(page, 1, false);
  await page.keyboard.press('F3');
  await expect(card(page)).toBeVisible();
  await expect(ok(page)).toBeEnabled();
  await expect(card(page).getByRole('alert')).toHaveCount(0);
  await expect(status(page, 'errors')).toHaveText('0');
  await expect(status(page, 'changes')).toHaveText('[true]');
});

test('Popconfirm replacing its trigger keeps pending work and returns focus to the new trigger', async ({ page }) => {
  await mode(page, 'async');
  await trigger(page).click();
  await ok(page).click();
  await page.keyboard.press('F6');
  await expect(card(page)).toHaveAttribute('aria-busy', 'true');
  await finish(page, 1, true);
  await expect(card(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Replacement Popconfirm trigger', exact: true })).toBeFocused();
});

for (const placement of ['top', 'bottom', 'left', 'right']) {
  test(`Popconfirm supports ${placement} placement`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Popconfirm placement', exact: true }).selectOption(placement);
    await trigger(page).click();
    await expect(card(page)).toHaveClass(new RegExp(`ant-popover-placement-${placement}`));
    await expect(card(page).locator('.ant-popover-arrow')).toBeVisible();
  });
}

test('Popconfirm nested Tooltip closes before the confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Nested Popconfirm trigger', exact: true }).click();
  const popup = card(page, 'Nested confirmation');
  const explain = popup.getByRole('button', { name: 'Explain confirmation', exact: true });
  await explain.focus();
  const hint = page.getByRole('tooltip').filter({ hasText: 'Confirmation hint' });
  await expect(hint).toBeVisible();
  await explain.press('Escape');
  await expect(hint).toBeHidden();
  await expect(popup).toBeVisible();
  await explain.press('Escape');
  await expect(popup).toBeHidden();
});

test('Popconfirm blocks pending Escape inside Modal and closes before the containing dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Popconfirm modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Popconfirm modal', exact: true });
  const button = modal.getByRole('button', { name: 'Modal Popconfirm trigger', exact: true });
  await button.click();
  const popup = card(page, 'Modal confirmation');
  await popup.getByRole('button', { name: 'Отмена', exact: true }).press('Escape');
  await expect(popup).toBeHidden();
  await expect(modal).toBeVisible();
  await button.click();
  await popup.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(popup).toBeVisible();
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: 'Resolve modal confirmation', exact: true }).click();
  await expect(popup).toBeHidden();
  await expect(button).toBeFocused();
  await button.press('Escape');
  await expect(modal).toBeHidden();
});

test('Popconfirm inherits English localization, dark compact RTL themes and reduced motion', async ({ page }, testInfo) => {
  await page.getByLabel('English locale', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Popconfirm theme', { exact: true }).check();
  await page.getByLabel('Compact Popconfirm theme', { exact: true }).check();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mode(page, 'throw');
  await trigger(page).click();
  const popup = card(page);
  await expect(popup.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await popup.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(popup.getByRole('alert')).toHaveText('Could not complete the action. Please try again.');
  await expect(popup).toHaveAttribute('dir', 'rtl');
  await expect(popup.locator('.ant-popover-container')).toHaveCSS('background-color', 'rgb(31, 31, 31)');
  await expect(popup).toHaveCSS('font-size', '12px');
  await expect(popup).toHaveCSS('transition-duration', '0s');
  await page.screenshot({ path: testInfo.outputPath('popconfirm-dark-rtl.png') });
});

test.describe('mobile Popconfirm', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test('supports touch and wraps long labels within the viewport', async ({ page }, testInfo) => {
    await page.getByLabel('Long Popconfirm labels', { exact: true }).check();
    await trigger(page).tap();
    const popup = card(page);
    const box = (await popup.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(367);
    expect(box.y).toBeGreaterThanOrEqual(8);
    expect(box.y + box.height).toBeLessThanOrEqual(804);
    for (const button of await popup.getByRole('button').all()) {
      const bounds = (await button.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(box.x);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(box.x + box.width);
    }
    await page.screenshot({ path: testInfo.outputPath('popconfirm-mobile.png') });
    await popup.getByRole('button', { name: 'Confirm removal of the selected fixture record permanently', exact: true }).tap();
    await expect(popup).toBeHidden();
    await expect(status(page, 'confirms')).toHaveText('1');
  });
});
