import { test, expect } from './test';
import type { Page } from '@playwright/test';
import { imageOne, imageTwo } from './fixtures/image-data';
const viewer = (page: Page) => page.locator('dialog.ant-image-preview[open]');
const progress = (page: Page) => viewer(page).locator('.ant-image-preview-progress');
const picture = (page: Page) => viewer(page).locator('img.ant-image-preview-img');
async function check(page: Page, name: string, value: boolean) { await page.getByLabel(name, { exact: true }).evaluate((el, value) => { const node = el as HTMLInputElement; node.checked = value; node.dispatchEvent(new Event('change', { bubbles: true })); }, value); }
test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=image-preview-group'); });

test('ImagePreviewGroup opens the clicked registered image and preserves source open callback snapshot semantics', async ({ page }) => {
  await page.getByRole('button', { name: 'Group two', exact: true }).click(); await expect(progress(page)).toHaveText('2 / 3'); await expect(picture(page)).toHaveAttribute('src', imageTwo);
  await expect(page.getByLabel('Group events', { exact: true })).toHaveText('["open:true:0"]');
  await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click(); await expect(page.getByRole('button', { name: 'Group two', exact: true })).toBeFocused();
  await expect(page.getByLabel('Group events', { exact: true })).toHaveText('["open:true:0","open:false:1"]');
});

test('ImagePreviewGroup navigation resets transformed images, reports previous index and stops at both boundaries', async ({ page }) => {
  await page.getByRole('button', { name: 'Group two', exact: true }).click(); await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
  await expect(page.getByLabel('Group transforms', { exact: true })).toContainText('zoomIn:1.5'); await page.keyboard.press('ArrowRight');
  await expect(progress(page)).toHaveText('3 / 3'); await expect(viewer(page).getByRole('button', { name: 'next', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Group transforms', { exact: true })).toContainText('next:1');
  await viewer(page).getByRole('button', { name: 'prev', exact: true }).click(); await page.keyboard.press('ArrowLeft'); await expect(progress(page)).toHaveText('1 / 3');
  await expect(viewer(page).getByRole('button', { name: 'prev', exact: true })).toBeDisabled(); await expect(page.getByLabel('Group events', { exact: true })).toContainText('change:2:1');
});

test('ImagePreviewGroup controlled current rejects thumbnail and navigation changes while reporting requests', async ({ page }) => {
  await page.getByLabel('Control group current', { exact: true }).check(); await page.getByRole('button', { name: 'Group two', exact: true }).click(); await expect(progress(page)).toHaveText('1 / 3');
  await check(page, 'Accept group changes', false); await viewer(page).getByRole('button', { name: 'next', exact: true }).click(); await expect(progress(page)).toHaveText('1 / 3');
  await expect(page.getByLabel('Group events', { exact: true })).toContainText('change:1:0');
});

test('ImagePreviewGroup explicit items take priority and match thumbnail preview sources instead of registration ids', async ({ page }) => {
  await page.getByLabel('Explicit group items', { exact: true }).check(); await page.getByRole('button', { name: 'Group copy', exact: true }).click();
  await expect(progress(page)).toHaveText('2 / 2'); await expect(picture(page)).toHaveAttribute('alt', 'Explicit one'); await expect(picture(page)).toHaveAttribute('src', imageOne);
  await page.keyboard.press('ArrowLeft'); await expect(picture(page)).toHaveAttribute('src', imageTwo);
});

test('ImagePreviewGroup explicit empty items remain empty with an operable close action', async ({ page }) => {
  await page.getByLabel('Explicit group items', { exact: true }).check(); await page.getByLabel('Empty group items', { exact: true }).check(); await page.getByRole('button', { name: 'Group one', exact: true }).click();
  await expect(viewer(page)).toBeVisible(); await expect(progress(page)).toHaveCount(0); await expect(viewer(page).getByRole('button', { name: 'next', exact: true })).toHaveCount(0);
  await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click(); await expect(viewer(page)).toHaveCount(0);
});

test('ImagePreviewGroup programmatic open honors controlled current without emitting a user open request', async ({ page }) => {
  await page.getByLabel('Control group current', { exact: true }).check(); await page.getByRole('button', { name: 'Set group owner current', exact: true }).click(); await page.getByRole('button', { name: 'Open group owner', exact: true }).click();
  await expect(progress(page)).toHaveText('3 / 3'); await expect(page.getByLabel('Group events', { exact: true })).toHaveText('[]');
});

test('ImagePreviewGroup programmatic current changes keep transforms while explicit navigation resets them', async ({ page }) => {
  await page.getByLabel('Control group current', { exact: true }).check(); await page.getByRole('button', { name: 'Group one', exact: true }).click(); await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
  await expect(page.getByLabel('Group transforms', { exact: true })).toContainText('zoomIn:1.5'); await page.getByRole('button', { name: 'Set group owner current', exact: true }).dispatchEvent('click');
  await expect(progress(page)).toHaveText('3 / 3'); await expect(picture(page)).toHaveAttribute('style', /scale3d\(1\.5/);
  await viewer(page).getByRole('button', { name: 'prev', exact: true }).click(); await expect(picture(page)).toHaveAttribute('style', /scale3d\(1,/);
});

test('ImagePreviewGroup reopens at zero after programmatic open and retains clicked indices for uncontrolled thumbnail opening', async ({ page }) => {
  await page.getByRole('button', { name: 'Group copy', exact: true }).click(); await expect(progress(page)).toHaveText('3 / 3'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open group owner', exact: true }).click(); await expect(progress(page)).toHaveText('1 / 3'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Uncontrolled second', exact: true }).click(); await expect(progress(page)).toHaveText('2 / 2');
});

test('ImagePreviewGroup registration order survives keyed DOM reordering and identical source images remain distinct', async ({ page }) => {
  await page.getByRole('button', { name: 'Reverse group thumbnails', exact: true }).click(); await page.getByRole('button', { name: 'Group copy', exact: true }).click();
  await expect(progress(page)).toHaveText('3 / 3'); await expect(picture(page)).toHaveAttribute('alt', 'Group copy'); await page.keyboard.press('Escape');
  await page.getByRole('img', { name: 'Group disabled', exact: true }).click(); await expect(viewer(page)).toHaveCount(0);
});

test('ImagePreviewGroup removals update registration count and leave out-of-range current under owner control', async ({ page }) => {
  await page.getByRole('button', { name: 'Group copy', exact: true }).click(); await page.getByRole('button', { name: 'Remove group thumbnails', exact: true }).dispatchEvent('click');
  await expect(progress(page)).toHaveText('3 / 1'); await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click(); await expect(viewer(page)).toHaveCount(0);
});

test('ImagePreviewGroup custom count is one based while physical arrow keys keep source semantics in RTL', async ({ page }) => {
  await page.getByLabel('Custom group counter', { exact: true }).check(); await page.getByLabel('Right to left', { exact: true }).check(); await page.getByRole('button', { name: 'Group two', exact: true }).click();
  await expect(progress(page)).toHaveText('2 of 3'); await expect(viewer(page)).toHaveAttribute('dir', 'rtl'); await page.keyboard.press('ArrowLeft'); await expect(progress(page)).toHaveText('1 of 3');
  const close = (await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).boundingBox())!; expect(close.x).toBeLessThan(100);
});

test('ImagePreviewGroup false preview config preserves the source child-triggered group behavior', async ({ page }) => {
  await page.getByLabel('Group false preview config', { exact: true }).check(); await page.getByRole('button', { name: 'Group two', exact: true }).click();
  await expect(progress(page)).toHaveText('2 / 3'); await expect(page.getByLabel('Group events', { exact: true })).toHaveText('[]');
});

test('ImagePreviewGroup unmount clears its viewer and a fresh mount collects only current children', async ({ page }) => {
  await page.getByRole('button', { name: 'Group two', exact: true }).click(); await page.getByRole('button', { name: 'Toggle group mount', exact: true }).dispatchEvent('click'); await expect(viewer(page)).toHaveCount(0); await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Close group owner', exact: true }).click(); await page.getByRole('button', { name: 'Toggle group mount', exact: true }).click(); await page.getByRole('button', { name: 'Group one', exact: true }).click(); await expect(progress(page)).toHaveText('1 / 3');
});

test('ImagePreviewGroup gallery hydrates grouped registration and supports keyboard image switching', async ({ page }) => {
  await page.goto('/ant-design#image'); await page.locator('#image').getByRole('button', { name: 'Изображение галереи 2', exact: true }).click(); await expect(progress(page)).toHaveText('2 / 3');
  await page.keyboard.press('ArrowRight'); await expect(progress(page)).toHaveText('3 / 3'); await expect(picture(page)).toHaveAttribute('alt', 'Изображение галереи 3');
});


test('ImagePreviewGroup render actions use offsets and reset a same-source image without a scale transition', async ({ page }) => {
  await page.getByLabel('Custom group counter', { exact: true }).check(); await page.getByRole('button', { name: 'Group one', exact: true }).click();
  await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click(); await expect(page.getByLabel('Group transforms', { exact: true })).toContainText('zoomIn:1.5');
  await picture(page).evaluate(async el => { await Promise.all(el.getAnimations().map(animation => animation.finished)); });
  await viewer(page).getByRole('button', { name: 'Jump two images', exact: true }).click(); await expect(progress(page)).toHaveText('3 of 3');
  await expect(viewer(page).getByLabel('Group rendered current', { exact: true })).toHaveText('2');
  expect(await picture(page).evaluate(el => el.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
});


test('ImagePreviewGroup navigation captures previous index before transform callbacks change owner props', async ({ page }) => {
  await page.getByLabel('Control group current', { exact: true }).check(); await page.getByLabel('Change current in transform callback', { exact: true }).check();
  await page.getByRole('button', { name: 'Group one', exact: true }).click(); await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
  await expect(page.getByLabel('Group transforms', { exact: true })).toContainText('zoomIn:1.5'); await viewer(page).getByRole('button', { name: 'next', exact: true }).click();
  await expect(page.getByLabel('Group events', { exact: true })).toContainText('change:1:0'); await expect(progress(page)).toHaveText('2 / 3');
});
