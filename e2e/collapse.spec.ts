import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.getByRole('group', { name: 'Bound collapse', exact: true });
const header = (page: Page, name: string) => root(page).getByRole('button', { name, exact: true });
const profile = (page: Page) => header(page, 'Profile section');
const preferences = (page: Page) => header(page, 'Preferences section');
const draft = (page: Page, name: string) => root(page).getByRole('textbox', { name: `${name} draft`, exact: true, includeHidden: true });
const status = (page: Page, name: string) => page.getByRole('status', { name: `Collapse ${name}`, exact: true });
async function setting(page: Page, name: string, value: string) { await page.getByRole('combobox', { name: `Collapse ${name}`, exact: true }).selectOption(value); }
async function panel(page: Page, name: string) {
  const id = await header(page, name).getAttribute('aria-controls');
  return root(page).locator(`[id="${id}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=collapse');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Collapse starts closed with native heading buttons and associated lazy panels', async ({ page }, testInfo) => {
  await profile(page).scrollIntoViewIfNeeded();
  await expect(root(page).getByRole('heading', { level: 2 })).toHaveCount(4);
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(header(page, 'Locked section')).toBeDisabled();
  await expect(draft(page, 'Profile')).toHaveCount(0);
  await expect(await panel(page, 'Profile section')).toBeHidden();
  const controls = await root(page).locator('[data-collapse-trigger]').evaluateAll((elements) => elements.map((element) => {
    const panel = element.ownerDocument.getElementById(element.getAttribute('aria-controls')!);
    return panel?.getAttribute('aria-labelledby') === element.id;
  }));
  expect(controls).toEqual([true, true, true, true]);
  await expect(status(page, 'owner')).toHaveText('undefined');
  await expect(status(page, 'changes')).toHaveText('[]');
  await root(page).screenshot({ path: testInfo.outputPath('collapse-closed.png') });
});

test('Collapse expands independent panels, updates binding before callbacks and never submits its form', async ({ page }, testInfo) => {
  await profile(page).click();
  await preferences(page).click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(preferences(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(draft(page, 'Profile')).toBeVisible();
  await expect(draft(page, 'Preferences')).toBeVisible();
  await expect(status(page, 'owner')).toHaveText('["","preferences"]');
  await expect(status(page, 'changes')).toHaveText('[[""],["","preferences"]]');
  await expect(status(page, 'callback owners')).toHaveText('[[""],["","preferences"]]');
  await profile(page).click();
  await expect(status(page, 'owner')).toHaveText('["preferences"]');
  await expect(status(page, 'submissions')).toHaveText('0');
  await root(page).screenshot({ path: testInfo.outputPath('collapse-open.png') });
});

test('Collapse keyboard buttons use Enter and Space while every enabled header remains in Tab order', async ({ page }) => {
  await page.getByRole('button', { name: 'Before Collapse', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(profile(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(header(page, 'Profile action')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(draft(page, 'Profile')).toBeFocused();
  await preferences(page).focus();
  await page.keyboard.press('Space');
  await expect(preferences(page)).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(preferences(page)).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Tab');
  await expect(header(page, 'Advanced section')).toBeFocused();
  await expect(status(page, 'submissions')).toHaveText('0');
});

test('Collapse accordion keeps at most one panel open and permits closing all panels', async ({ page }) => {
  await page.getByLabel('Accordion mode', { exact: true }).check();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
  await profile(page).click();
  await preferences(page).click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(preferences(page)).toHaveAttribute('aria-expanded', 'true');
  await preferences(page).click();
  await expect(status(page, 'owner')).toHaveText('[]');
  await expect(status(page, 'changes')).toHaveText('[[""],["preferences"],[]]');
});

test('Collapse changes accordion presentation without changing the external array or emitting feedback', async ({ page }) => {
  await page.getByRole('button', { name: 'Set multiple Collapse keys', exact: true }).click();
  await page.getByLabel('Accordion mode', { exact: true }).check();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(preferences(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(status(page, 'owner')).toHaveText('["","preferences","missing"]');
  await page.getByLabel('Accordion mode', { exact: true }).uncheck();
  await expect(preferences(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(status(page, 'changes')).toHaveText('[]');
});

test('Collapse icon-only mode ignores the label but supports arrow clicks and keyboard activation', async ({ page }) => {
  await setting(page, 'mode', 'icon');
  await profile(page).scrollIntoViewIfNeeded();
  const label = profile(page).locator('.ant-collapse-title');
  const bounds = (await label.boundingBox())!;
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
  await profile(page).locator('.ant-collapse-expand-icon').click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await profile(page).focus();
  await page.keyboard.press('Space');
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(status(page, 'changes')).toHaveText('[[""],[]]');
});

test('Collapse preserves a full header trigger when icon mode hides its arrow', async ({ page }) => {
  await setting(page, 'mode', 'icon');
  await page.getByLabel('Show Collapse arrows', { exact: true }).uncheck();
  await expect(profile(page).locator('.ant-collapse-expand-icon')).toHaveCount(0);
  await profile(page).click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
});

test('Collapse extra actions operate independently in header, icon and disabled modes', async ({ page }) => {
  const extra = header(page, 'Profile action');
  await extra.click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
  await setting(page, 'mode', 'icon');
  await extra.press('Enter');
  await setting(page, 'mode', 'disabled');
  await extra.click();
  await expect(profile(page)).toBeDisabled();
  await expect(status(page, 'actions')).toHaveText('3');
  await expect(status(page, 'changes')).toHaveText('[]');
});

test('Collapse lets explicit item modes override the disabled default while disabled panels remain owner-controlled', async ({ page }) => {
  await setting(page, 'mode', 'disabled');
  await page.getByLabel('Enable Profile override', { exact: true }).check();
  await profile(page).click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(preferences(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Open disabled Collapse externally', exact: true }).click();
  await expect(header(page, 'Locked section')).toHaveAttribute('aria-expanded', 'true');
  await expect(draft(page, 'Locked collapse')).toBeVisible();
  await expect(status(page, 'changes')).toHaveText('[[""]]');
});

test('Collapse retains local input and component state in visited panels', async ({ page }) => {
  await profile(page).click();
  await draft(page, 'Profile').fill('Retained draft');
  await root(page).getByRole('button', { name: 'Increment Profile', exact: true }).click();
  await profile(page).click();
  await expect(draft(page, 'Profile')).toBeHidden();
  await expect(draft(page, 'Profile')).toHaveValue('Retained draft');
  await profile(page).click();
  await expect(root(page).getByRole('status', { name: 'Profile count', exact: true })).toHaveText('1');
  await expect(status(page, 'lifecycle')).toHaveText('["mount:Profile"]');
});

test('Collapse destroys hidden content and keeps it lazy when destruction is subsequently disabled', async ({ page }) => {
  await profile(page).click();
  await draft(page, 'Profile').fill('Discarded draft');
  await profile(page).click();
  await page.getByLabel('Destroy hidden Collapse', { exact: true }).check();
  await expect(draft(page, 'Profile')).toHaveCount(0);
  await page.getByLabel('Destroy hidden Collapse', { exact: true }).uncheck();
  await expect(draft(page, 'Profile')).toHaveCount(0);
  await profile(page).click();
  await expect(draft(page, 'Profile')).toHaveValue('Profile initial');
  await expect(status(page, 'lifecycle')).toHaveText('["mount:Profile","destroy:Profile","mount:Profile"]');
});

test('Collapse respects per-item retention overrides and forceRender takes priority over destruction', async ({ page }) => {
  await page.getByLabel('Destroy hidden Collapse', { exact: true }).check();
  await page.getByLabel('Keep Preferences panel', { exact: true }).check();
  await preferences(page).click();
  await draft(page, 'Preferences').fill('Kept preferences');
  await preferences(page).click();
  await expect(draft(page, 'Preferences')).toHaveValue('Kept preferences');
  await page.getByLabel('Force render Collapse', { exact: true }).check();
  await expect(draft(page, 'Profile')).toHaveCount(1);
  await expect(draft(page, 'Profile')).toBeHidden();
  await expect(draft(page, 'Locked collapse')).toHaveCount(1);
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
});

test('Collapse preserves native FormData for retained fields and excludes unvisited or destroyed fields', async ({ page }) => {
  const data = () => root(page).locator('xpath=ancestor::form').evaluate((element) => Array.from(new FormData(element as HTMLFormElement).entries()));
  await expect.poll(data).toEqual([]);
  await profile(page).click();
  await preferences(page).click();
  await profile(page).click();
  await expect.poll(data).toEqual([['Profile', 'Profile initial'], ['Preferences', 'Preferences initial']]);
  await page.getByLabel('Destroy hidden Collapse', { exact: true }).check();
  await expect.poll(data).toEqual([['Preferences', 'Preferences initial']]);
});

test('Collapse accepts scalar and external values, keeps hidden keys and reads defaults once without callbacks', async ({ page }) => {
  await page.getByRole('button', { name: 'Set scalar Profile key', exact: true }).click();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Set multiple Collapse keys', exact: true }).click();
  await profile(page).click();
  await expect(status(page, 'owner')).toHaveText('["preferences","missing"]');
  await expect(status(page, 'changes')).toHaveText('[["preferences","missing"]]');
  await page.getByLabel('Mount default Collapse', { exact: true }).check();
  const defaults = page.getByRole('group', { name: 'Default collapse', exact: true });
  await expect(defaults.getByRole('button', { name: 'Default Preferences', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Replace Collapse default', exact: true }).click();
  await expect(defaults.getByRole('button', { name: 'Default Preferences', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('status', { name: 'Default Collapse changes', exact: true })).toHaveText('[]');
});

test('Collapse callback arrays cannot mutate the bound owner', async ({ page }) => {
  await page.getByLabel('Mutate Collapse callback', { exact: true }).check();
  await profile(page).click();
  await expect(status(page, 'owner')).toHaveText('[""]');
  await preferences(page).click();
  await expect(status(page, 'owner')).toHaveText('["","preferences"]');
});

test('Collapse returns focus to the same header when the owner hides its focused panel', async ({ page }) => {
  await profile(page).click();
  await draft(page, 'Profile').fill('Saved focus draft');
  await page.keyboard.press('F4');
  await expect(profile(page)).toBeFocused();
  await expect(draft(page, 'Profile')).toBeHidden();
  await expect(status(page, 'changes')).toHaveText('[[""]]');
  await profile(page).click();
  await root(page).getByRole('button', { name: 'Close Profile externally', exact: true }).click();
  await expect(profile(page)).toBeFocused();
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'false');
});

test('Collapse repairs focus after header disabling, extra removal and item removal', async ({ page }) => {
  await preferences(page).focus();
  await page.keyboard.press('F3');
  await expect(preferences(page)).toBeDisabled();
  await expect(profile(page)).toBeFocused();
  await header(page, 'Profile action').focus();
  await page.keyboard.press('F10');
  await expect(header(page, 'Profile action')).toHaveCount(0);
  await expect(profile(page)).toBeFocused();
  await page.keyboard.press('F7');
  await expect(profile(page)).toHaveCount(0);
  await expect(header(page, 'Advanced section')).toBeFocused();
  await expect(status(page, 'changes')).toHaveText('[]');
});

test('Collapse uses a focusable fallback when every header is disabled or removed and recovers on restoration', async ({ page }) => {
  await profile(page).focus();
  await page.keyboard.press('F9');
  await expect(root(page)).toBeFocused();
  await page.keyboard.press('F9');
  await expect(profile(page)).toBeFocused();
  await page.keyboard.press('F8');
  await expect(root(page)).toBeFocused();
  await expect(root(page)).toHaveText('Ничего не найдено');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After Collapse', exact: true })).toBeFocused();
});

test('Collapse keeps keyed panel instances, focus, text selection and IDs across reordering', async ({ page }) => {
  await page.getByLabel('Duplicate Collapse key', { exact: true }).check();
  await expect(header(page, 'Duplicate profile')).toHaveCount(0);
  await page.getByLabel('Duplicate Collapse key', { exact: true }).uncheck();
  await page.getByLabel('Special Collapse key', { exact: true }).check();
  await preferences(page).click();
  await draft(page, 'Preferences').fill('Special preferences');
  await draft(page, 'Preferences').evaluate((element) => (element as HTMLInputElement).setSelectionRange(1, 4));
  const id = await preferences(page).getAttribute('id');
  await page.keyboard.press('F6');
  await expect(draft(page, 'Preferences')).toBeFocused();
  await expect(draft(page, 'Preferences')).toHaveValue('Special preferences');
  expect(await draft(page, 'Preferences').evaluate((element) => [(element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd])).toEqual([1, 4]);
  await expect(preferences(page)).toHaveAttribute('id', id!);
  await preferences(page).focus();
  await page.keyboard.press('F6');
  await expect(preferences(page)).toBeFocused();
  await expect(status(page, 'owner')).toHaveText(JSON.stringify(['" ][🙂']));
});

test('Collapse releases panel state on removal or unmount while keeping the external selection', async ({ page }) => {
  await profile(page).click();
  await draft(page, 'Profile').fill('Removed draft');
  await page.keyboard.press('F7');
  await expect(draft(page, 'Profile')).toHaveCount(0);
  await page.keyboard.press('F7');
  await expect(profile(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(draft(page, 'Profile')).toHaveValue('Profile initial');
  await page.keyboard.press('F5');
  await expect(root(page)).toHaveCount(0);
  await page.keyboard.press('F5');
  await expect(draft(page, 'Profile')).toHaveValue('Profile initial');
  await expect(status(page, 'changes')).toHaveText('[[""]]');
});

test('Collapse keeps nested state independent and returns to the outer header when nested content is hidden', async ({ page }) => {
  await header(page, 'Advanced section').click();
  const nested = page.getByRole('group', { name: 'Nested collapse', exact: true });
  await nested.getByRole('button', { name: 'Nested section', exact: true }).click();
  await draft(page, 'Nested').fill('Nested draft');
  await header(page, 'Advanced section').click();
  await header(page, 'Advanced section').click();
  await expect(draft(page, 'Nested')).toHaveValue('Nested draft');
  await expect(page.getByRole('status', { name: 'Nested Collapse changes', exact: true })).toHaveText('[["nested"]]');
  await expect(status(page, 'changes')).toHaveText('[["advanced"],[],["advanced"]]');
  await draft(page, 'Nested').focus();
  await page.keyboard.press('F4');
  await expect(header(page, 'Advanced section')).toBeFocused();
  await expect(draft(page, 'Nested')).toBeHidden();
  await header(page, 'Advanced section').click();
  await expect(draft(page, 'Nested')).toHaveValue('Nested draft');
  await page.getByLabel('Destroy Advanced panel', { exact: true }).check();
  await header(page, 'Advanced section').click();
  await expect(draft(page, 'Nested')).toHaveCount(0);
  await header(page, 'Advanced section').click();
  await expect(nested.getByRole('button', { name: 'Nested section', exact: true })).toHaveAttribute('aria-expanded', 'false');
});

test('Collapse does not create excessive region landmarks for large independently expandable lists', async ({ page }) => {
  await page.getByLabel('Many Collapse items', { exact: true }).check();
  await header(page, 'Collapse section 1').click();
  await expect(root(page).getByRole('region')).toHaveCount(0);
  await expect(root(page)).toContainText('Plain Collapse content');
  await page.getByLabel('Accordion mode', { exact: true }).check();
  await expect(root(page).getByRole('region', { name: 'Collapse section 1', exact: true })).toBeVisible();
});

test('Collapse inherits all three sizes and keeps header controls comfortably inside their padding', async ({ page }) => {
  const heights: number[] = [];
  for (const size of ['small', 'middle', 'large']) {
    await setting(page, 'size', size);
    heights.push((await profile(page).boundingBox())!.height);
  }
  expect(heights[0]).toBeLessThan(heights[1]);
  expect(heights[1]).toBeLessThan(heights[2]);
  await expect(profile(page)).toHaveCSS('font-size', '16px');
});

test('Collapse supports bordered, borderless and ghost appearance without losing panel state', async ({ page }) => {
  await profile(page).click();
  await draft(page, 'Profile').fill('Appearance draft');
  await expect(root(page)).toHaveCSS('border-top-width', '1px');
  await page.getByLabel('Bordered Collapse', { exact: true }).uncheck();
  await expect(root(page)).toHaveCSS('border-top-width', '0px');
  await page.getByLabel('Ghost Collapse', { exact: true }).check();
  await expect(root(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(draft(page, 'Profile')).toHaveValue('Appearance draft');
});

test('Collapse positions its arrow logically in RTL and adapts dark compact styles and reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark Collapse theme', { exact: true }).check();
  await page.getByLabel('Compact Collapse theme', { exact: true }).check();
  await expect(profile(page)).toHaveCSS('direction', 'rtl');
  await expect(profile(page).locator('.ant-collapse-arrow')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  await setting(page, 'icon placement', 'end');
  const arrow = (await profile(page).locator('.ant-collapse-expand-icon').boundingBox())!;
  const label = (await profile(page).locator('.ant-collapse-title').boundingBox())!;
  expect(arrow.x + arrow.width).toBeLessThanOrEqual(label.x + 1);
  await profile(page).click();
  await expect(profile(page).locator('.ant-collapse-arrow')).toHaveCSS('transform', 'matrix(0, 1, -1, 0, 0, 0)');
  await expect(profile(page).locator('.ant-collapse-arrow')).toHaveCSS('transition-duration', '0s');
  await expect(profile(page)).toHaveCSS('font-size', '12px');
  await expect(header(page, 'Locked section')).toHaveCSS('color', 'rgba(255, 255, 255, 0.25)');
  await expect(await panel(page, 'Profile section')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await root(page).screenshot({ path: testInfo.outputPath('collapse-dark-rtl.png') });
});

test('Collapse navigation remains available when form controls are disabled by ConfigProvider', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(profile(page)).toBeEnabled();
  await profile(page).click();
  await expect(draft(page, 'Profile')).toBeDisabled();
});

test('Collapse works inside Modal and preserves native Tab and Escape behavior', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Open Collapse modal', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Collapse modal', exact: true });
  const button = dialog.getByRole('button', { name: 'Modal collapse details', exact: true });
  await dialog.getByLabel('Modal collapse note', { exact: true }).fill('Modal retained');
  await button.click();
  await button.press('Enter');
  await expect(dialog.getByLabel('Modal collapse note', { exact: true })).toHaveValue('Modal retained');
  await page.keyboard.press('Tab');
  await expect(dialog.getByLabel('Modal collapse note', { exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test.describe('mobile Collapse', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('wraps long headings, supports touch toggles and keeps extra actions independent', async ({ page }, testInfo) => {
    await page.getByLabel('Long Collapse label', { exact: true }).check();
    const title = header(page, 'Profile section with a very long descriptive title for the selected account');
    await title.tap();
    await expect(draft(page, 'Profile')).toBeVisible();
    await header(page, 'Profile action').tap();
    await expect(title).toHaveAttribute('aria-expanded', 'true');
    await expect(status(page, 'actions')).toHaveText('1');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await root(page).screenshot({ path: testInfo.outputPath('collapse-mobile.png') });
  });
});
