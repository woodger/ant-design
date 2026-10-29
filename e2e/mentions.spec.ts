import { test, expect } from './test';
import type { Page } from '@playwright/test';
const input = (page: Page) => page.getByRole('combobox', { name: 'Mention text', exact: true });
const popup = (page: Page) => page.getByRole('listbox', { name: 'Mention text', exact: true });
test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=mentions'); });

test('Mentions searches by prefix and inserts a selected option before its select callback', async ({ page }) => {
  await input(page).pressSequentially('@al'); await expect(popup(page).getByRole('option')).toHaveCount(1); await input(page).press('Enter');
  await expect(input(page)).toHaveValue('@alice '); await expect(input(page)).toBeFocused();
  await expect(page.getByLabel('Mentions searches', { exact: true })).toHaveText('["@:","@:a","@:al"]');
  await expect(page.getByLabel('Mentions entities', { exact: true })).toHaveText('[{"prefix":"@","value":"alice"}]');
  await expect(page.getByLabel('Mentions events', { exact: true })).toHaveText('["change:@","change:@a","change:@al","change:@alice ","select:alice:@"]');
  expect(await input(page).evaluate(el => (el as HTMLTextAreaElement).selectionStart)).toBe(7);
});

test('Mentions replaces at the caret, removes a matching suffix and preserves following text', async ({ page }) => {
  await input(page).fill('hello@aliCE done');
  await input(page).evaluate(el => (el as HTMLTextAreaElement).setSelectionRange(8, 8));
  await input(page).dispatchEvent('keyup', { key: 'l', bubbles: true }); await input(page).press('Enter');
  await expect(input(page)).toHaveValue('hello @alice done');
  expect(await input(page).evaluate(el => (el as HTMLTextAreaElement).selectionStart)).toBe(13);
});

test('Mentions supports multiple prefixes, filter bypass and disabled-skipping keyboard selection', async ({ page }) => {
  await page.getByLabel('Filter mentions', { exact: true }).uncheck(); await input(page).pressSequentially('#');
  await expect(popup(page).getByRole('option')).toHaveCount(3); await input(page).press('ArrowDown'); await input(page).press('Enter');
  await expect(input(page)).toHaveValue('#bob '); await expect(page.getByLabel('Mentions events', { exact: true })).toContainText('select:bob:#');
});

test('Mentions stops suggestions at split or Escape while preserving native text', async ({ page }) => {
  await input(page).pressSequentially('@a '); await expect(popup(page)).toHaveCount(0);
  await input(page).pressSequentially('@b'); await expect(popup(page).locator('strong')).toHaveText('Bob rich');
  await input(page).press('Escape'); await expect(popup(page)).toHaveCount(0); await expect(input(page)).toHaveValue('@a @b');
});

test('Mentions loading blocks selection and remote option updates replace the empty state without losing focus', async ({ page }) => {
  await page.getByLabel('Loading mentions', { exact: true }).check(); await page.getByRole('button', { name: 'Empty mentions options', exact: true }).click();
  await input(page).pressSequentially('@'); await expect(popup(page)).toHaveAttribute('aria-busy', 'true'); await input(page).press('Enter'); await expect(input(page)).toHaveValue('@');
  await page.getByLabel('Loading mentions', { exact: true }).evaluate(el => { const checkbox = el as HTMLInputElement; checkbox.checked = false; checkbox.dispatchEvent(new Event('change', { bubbles: true })); });
  await expect(popup(page)).toBeVisible(); await expect(popup(page).getByRole('option')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restore mentions options', exact: true }).dispatchEvent('click');
  await expect(popup(page).getByRole('option')).toHaveCount(2); await expect(input(page)).toBeFocused(); await input(page).press('Enter'); await expect(input(page)).toHaveValue('@alice ');
});

test('Mentions owner rejection restores text and programmatic replacement does not start a search', async ({ page }) => {
  await page.getByLabel('Accept mentions changes', { exact: true }).uncheck(); await input(page).fill('@rejected'); await expect(input(page)).toHaveValue('');
  await page.getByRole('button', { name: 'Replace mentions owner', exact: true }).click(); await expect(input(page)).toHaveValue('owner');
  await expect(page.getByLabel('Mentions searches', { exact: true })).toHaveText('[]');
});

test('Mentions clear follows change then clear order and respects disabled clear', async ({ page }) => {
  await input(page).fill('draft'); await page.getByLabel('Disable mentions clear', { exact: true }).check(); await expect(page.getByRole('button', { name: 'Очистить', exact: true })).toBeDisabled();
  await page.getByLabel('Disable mentions clear', { exact: true }).uncheck(); await page.getByRole('button', { name: 'Очистить', exact: true }).press('Enter');
  await expect(input(page)).toHaveValue(''); await expect(page.getByLabel('Mentions events', { exact: true })).toHaveText('["change:draft","change:","clear"]');
});

test('Mentions keeps native default state, readonly and disabled form semantics', async ({ page }) => {
  const control = page.getByRole('combobox', { name: 'Default mentions', exact: true }); await expect(control).toHaveValue('seed'); await control.pressSequentially('@a'); await control.press('Enter'); await expect(control).toHaveValue('seed @alice ');
  await page.getByLabel('Readonly mentions', { exact: true }).check(); await expect(input(page)).toHaveAttribute('readonly', ''); await expect(input(page)).not.toBeDisabled();
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(input(page)).toBeDisabled();
});

test('Mentions does not select during IME composition and blur dismisses a pending suggestion', async ({ page }) => {
  await input(page).pressSequentially('@a'); await input(page).dispatchEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }); await expect(input(page)).toHaveValue('@a');
  await page.getByRole('button', { name: 'Replace mentions owner', exact: true }).focus(); await expect(popup(page)).toHaveCount(0);
});

test('Mentions autosize grows and clamps rows and releases shadow measurement nodes on unmount', async ({ page }) => {
  const control = page.getByRole('combobox', { name: 'Autosize mentions', exact: true });
  const before = (await control.boundingBox())!.height; expect(before).toBeGreaterThanOrEqual(40);
  await control.fill('one\ntwo\nthree\nfour\nfive\nsix');
  await expect.poll(async () => (await control.boundingBox())!.height).toBeGreaterThan(before);
  expect((await control.boundingBox())!.height).toBeLessThanOrEqual(100); await expect(control).toHaveCSS('resize', 'none');
  await page.getByRole('button', { name: 'Toggle autosize mount', exact: true }).click(); await expect(page.locator('textarea[name="mentions-measure"]')).toHaveCount(0);
});

test('Mentions validates and submits the raw text through forms and resets controlled state', async ({ page }) => {
  await page.getByRole('button', { name: 'Submit mentions', exact: true }).click(); await expect(page.getByText('Note required', { exact: true })).toBeVisible();
  const control = page.getByRole('combobox', { name: 'Form mentions', exact: true }); await expect(control).toBeFocused(); await control.pressSequentially('@a'); await control.press('Enter');
  expect(await control.evaluate(el => new FormData((el as HTMLTextAreaElement).form!).get('note'))).toBe('@alice ');
  await page.getByRole('button', { name: 'Submit mentions', exact: true }).click(); await expect(page.getByLabel('Mentions submitted', { exact: true })).toHaveText('@alice ');
  await page.getByRole('button', { name: 'Reset mentions', exact: true }).click(); await expect(control).toHaveValue('');
});

test('Mentions aligns suggestions at the token in wrapped text with RTL and bounded narrow geometry', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await input(page).pressSequentially('Long line of words wraps here and another line @a');
  await expect(popup(page)).toBeVisible(); const bounds = await popup(page).boundingBox(); expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  await page.getByLabel('Right to left', { exact: true }).check(); await input(page).fill(''); await input(page).pressSequentially('@b'); await expect(input(page)).toHaveAttribute('dir', 'rtl'); await expect(popup(page).getByRole('option', { name: 'Bob rich', exact: true })).toBeVisible();
});

test('Mentions public focus and unmount release popup state and deferred blur callbacks', async ({ page }) => {
  await page.getByRole('button', { name: 'Focus mentions', exact: true }).click(); await expect(input(page)).toBeFocused(); await input(page).pressSequentially('@a');
  await page.getByRole('button', { name: 'Toggle mentions mount', exact: true }).click(); await expect(input(page)).toHaveCount(0); await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
});

test('Mentions gallery hydrates selection and inherits compact dark theme tokens', async ({ page }) => {
  await page.goto('/ant-design#mentions'); const section = page.locator('#mentions'); const control = section.getByRole('combobox');
  await control.pressSequentially('@al'); await control.press('Enter'); await expect(section.getByLabel('Выбранные упоминания', { exact: true })).toHaveText('alice');
  const before = await control.evaluate(el => getComputedStyle(el.closest('.ant-mentions')!).backgroundColor);
  await page.getByRole('button', { name: '◐ Тёмная тема', exact: true }).click(); await expect.poll(() => control.evaluate(el => getComputedStyle(el.closest('.ant-mentions')!).backgroundColor)).not.toBe(before);
  await page.locator('#overview').getByRole('button', { name: 'Обычная', exact: true }).click(); await expect(control).toHaveCSS('font-size', '12px');
});


test('Mentions places suggestions after the prefix and follows its line and textarea scroll position', async ({ page }) => {
  await input(page).pressSequentially('hello @a'); await expect(popup(page)).toBeVisible();
  const box = (await input(page).boundingBox())!; expect((await popup(page).boundingBox())!.x).toBeGreaterThan(box.x + 30);
  await input(page).fill('header\nsecond @a'); await input(page).dispatchEvent('keyup', { key: 'a', bubbles: true });
  const lineHeight = await input(page).evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
  await expect.poll(async () => (await popup(page).boundingBox())!.y - box.y).toBeGreaterThan(lineHeight * 2 - 2);
  await input(page).fill('one\ntwo\nthree\nfour\nfive @a'); await input(page).dispatchEvent('keyup', { key: 'a', bubbles: true });
  const bottom = box.y + box.height;
  await expect.poll(async () => (await popup(page).boundingBox())!.y).toBeLessThan(bottom + 25);
});

test('Mentions supports top placement without obscuring the trigger token', async ({ page }) => {
  await page.getByLabel('Mentions placement', { exact: true }).selectOption('top'); await input(page).pressSequentially('@a');
  await expect(popup(page)).toBeVisible(); const popupBox = (await popup(page).boundingBox())!; const fieldBox = (await input(page).boundingBox())!;
  expect(popupBox.y + popupBox.height).toBeLessThanOrEqual(fieldBox.y + 15);
});
