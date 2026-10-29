import { test, expect } from './test';
import type { Page } from '@playwright/test';
const cell = (page: Page, date: string) => page.getByRole('dialog').locator('.ant-picker-cell-in-view').getByRole('button', { name: date, exact: true });
const start = (page: Page) => page.getByRole('combobox', { name: 'Range start', exact: true });
const end = (page: Page) => page.getByRole('combobox', { name: 'Range end', exact: true });
test.beforeEach(async ({ page }) => { await page.goto('http://127.0.0.1:4174?fixture=range-picker'); });

test('RangePicker uses two linked calendar panels and commits only after both boundaries', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear range owner', exact: true }).click(); await start(page).click();
  await expect(page.getByRole('dialog').getByRole('grid')).toHaveCount(2);
  await cell(page, '2026-10-10').click(); await expect(end(page)).toBeFocused();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('null');
  await cell(page, '2026-10-20').click(); await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-10","2026-10-20"]');
  await page.getByRole('button', { name: 'Read range FormData', exact: true }).click();
  await expect(page.getByLabel('Range FormData', { exact: true })).toHaveText('["2026-10-10","2026-10-20"]');
});

test('RangePicker sorts reverse selection on submit while calendar callbacks retain the intermediate order', async ({ page }) => {
  await start(page).click(); await cell(page, '2026-10-20').click(); await cell(page, '2026-10-10').click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-10","2026-10-20"]');
  await expect(page.getByLabel('Range calendars', { exact: true })).toContainText('end:2026-10-20,2026-10-10');
});

test('RangePicker order false preserves the selected boundary positions', async ({ page }) => {
  await page.getByLabel('Order range boundaries', { exact: true }).uncheck();
  await start(page).click(); await cell(page, '2026-10-20').click(); await cell(page, '2026-10-10').click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-20","2026-10-10"]');
});

test('RangePicker excludes disabled endpoints but allows a disabled interior date like upstream', async ({ page }) => {
  await page.getByLabel('Restrict range dates', { exact: true }).check();
  await start(page).click(); await expect(cell(page, '2026-10-13')).toBeDisabled();
  await cell(page, '2026-10-12').click(); await cell(page, '2026-10-14').click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-12","2026-10-14"]');
});

test('RangePicker passes from to endpoint restrictions and preserves locked boundaries on clear', async ({ page }) => {
  await page.getByLabel('Limit range span', { exact: true }).check();
  await start(page).click(); await cell(page, '2026-10-10').click(); await expect(cell(page, '2026-10-18')).toBeDisabled();
  await cell(page, '2026-10-17').click();
  await page.getByLabel('Limit range span', { exact: true }).uncheck(); await page.getByLabel('Lock range start', { exact: true }).check();
  await expect(start(page)).toBeDisabled(); await start(page).locator('xpath=../..').hover(); await start(page).locator('xpath=../..').getByRole('button', { name: 'Очистить', exact: true }).click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-10",null]');
  await end(page).click(); await expect(cell(page, '2026-10-08')).toBeDisabled(); await cell(page, '2026-10-15').click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-10","2026-10-15"]');
});

test('RangePicker datetime confirms each field and preserves Dayjs UTC mode with source time steps', async ({ page }) => {
  const first = page.getByRole('combobox', { name: 'Time range start', exact: true }); const last = page.getByRole('combobox', { name: 'Time range end', exact: true });
  await first.click(); await cell(page, '2026-10-12').click();
  await expect(page.getByLabel('Time range value', { exact: true })).toHaveText('["2026-10-10T10:20:30.123Z","2026-10-20T14:15:16.789Z"]');
  await page.getByRole('button', { name: 'ОК', exact: true }).click(); await expect(last).toBeFocused();
  await expect(page.getByLabel('Range OK count', { exact: true })).toHaveText('1');
  await cell(page, '2026-10-25').click(); await page.getByRole('button', { name: 'minute 45', exact: true }).click();
  await page.getByRole('button', { name: 'ОК', exact: true }).click();
  await expect(page.getByLabel('Time range value', { exact: true })).toHaveText('["2026-10-12T10:20:30.100Z","2026-10-25T14:45:16.700Z"]');
  await expect(page.getByLabel('Range OK count', { exact: true })).toHaveText('2');
});

test('RangePicker locks unconfirmed datetime focus and Escape cancels drafts without onChange', async ({ page }) => {
  const first = page.getByRole('combobox', { name: 'Time range start', exact: true }); const last = page.getByRole('combobox', { name: 'Time range end', exact: true });
  await first.click(); await cell(page, '2026-10-12').click(); await last.focus(); await expect(first).toBeFocused();
  await first.press('Escape'); await expect(first).toHaveValue('2026-10-10 10:20:30');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('RangePicker supports typed boundaries and Tab without submitting search or stale drafts', async ({ page }) => {
  await start(page).fill('2026-10-12'); await start(page).press('Tab'); await expect(end(page)).toBeFocused();
  await end(page).fill('2026-10-14'); await end(page).press('Enter');
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-12","2026-10-14"]');
  await start(page).fill('2025-02-29'); await expect(start(page)).toHaveAttribute('aria-invalid', 'true'); await start(page).press('Escape');
  await expect(start(page)).toHaveValue('2026-10-12');
});

test('RangePicker allowEmpty accepts an open start boundary and clear emits null values and strings', async ({ page }) => {
  await page.getByLabel('Allow empty range start', { exact: true }).check(); await page.getByRole('button', { name: 'Clear range owner', exact: true }).click();
  await end(page).click(); await cell(page, '2026-10-20').click(); await expect(start(page)).toBeFocused(); await start(page).press('Enter');
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('[null,"2026-10-20"]');
  await start(page).locator('xpath=../..').getByRole('button', { name: 'Очистить', exact: true }).click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('null'); await expect(page.getByLabel('Range changes', { exact: true })).toContainText('\\"texts\\":null');
});

test('RangePicker controlled owner rejection restores inputs after completed selection', async ({ page }) => {
  await page.getByLabel('Accept range changes', { exact: true }).uncheck();
  await start(page).click(); await cell(page, '2026-10-12').click(); await cell(page, '2026-10-14').click();
  await expect(start(page)).toHaveValue('2026-10-10'); await expect(end(page)).toHaveValue('2026-10-20');
  await expect(page.getByLabel('Range changes', { exact: true })).toContainText('2026-10-12');
});

test('RangePicker presets commit the pair and global disabled and RTL reach both fields', async ({ page }) => {
  await start(page).click(); await page.getByRole('button', { name: 'October preset', exact: true }).click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-05","2026-10-08"]');
  await page.getByLabel('Right to left', { exact: true }).check(); await expect(start(page)).toHaveCSS('direction', 'rtl');
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(start(page)).toBeDisabled(); await expect(end(page)).toBeDisabled();
});

test('RangePicker Form validates null, stores Dayjs tuples and resets', async ({ page }) => {
  await page.getByRole('button', { name: 'Submit range form', exact: true }).click();
  const first = page.getByRole('combobox', { name: '* Form period', exact: true });
  await expect(first).toBeFocused(); await expect(first).toHaveAccessibleDescription('Choose a period');
  await first.click(); await cell(page, '2026-10-12').click(); await cell(page, '2026-10-14').click();
  await page.getByRole('button', { name: 'Submit range form', exact: true }).click();
  await expect(page.getByLabel('Submitted range objects', { exact: true })).toHaveText('["Dayjs","Dayjs"]');
  await page.getByRole('button', { name: 'Reset range form', exact: true }).click(); await expect(first).toHaveValue('');
});

test('RangePicker uncontrolled defaults retain edits and owner replacement updates both inputs', async ({ page }) => {
  const first = page.getByRole('combobox', { name: 'Default range start', exact: true }); const last = page.getByRole('combobox', { name: 'Default range end', exact: true });
  await first.fill('2026-10-06'); await first.press('Enter'); await last.fill('2026-10-09'); await last.press('Enter');
  await expect(first).toHaveValue('2026-10-06'); await expect(last).toHaveValue('2026-10-09');
  await page.getByRole('button', { name: 'Replace range owner', exact: true }).click();
  await expect(start(page)).toHaveValue('2028-02-29'); await expect(end(page)).toHaveValue('2028-03-05');
});

test('RangePicker preserves invalid text on blur only when requested and readonly retains calendar selection', async ({ page }) => {
  await page.getByLabel('Preserve invalid range text', { exact: true }).check();
  await start(page).fill('invalid'); await page.getByRole('button', { name: 'Read range FormData', exact: true }).click(); await expect(start(page)).toHaveValue('invalid');
  await page.getByLabel('Preserve invalid range text', { exact: true }).uncheck();
  await start(page).fill('2025-02-29'); await page.getByRole('button', { name: 'Read range FormData', exact: true }).click(); await expect(start(page)).toHaveValue('2026-10-10');
  await page.getByLabel('Readonly range inputs', { exact: true }).check(); await expect(start(page)).toHaveAttribute('readonly', '');
  await start(page).click(); await cell(page, '2026-10-12').click(); await cell(page, '2026-10-14').click();
  await expect(page.getByLabel('Range value', { exact: true })).toHaveText('["2026-10-12","2026-10-14"]');
});

for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati']) {
  test.describe(`RangePicker in ${timezoneId}`, () => {
    test.use({ timezoneId });
    test('retains UTC date fields during confirmed calendar edits', async ({ page }) => {
      await page.getByRole('combobox', { name: 'Time range start', exact: true }).click(); await cell(page, '2026-10-12').click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
      await cell(page, '2026-10-25').click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
      await expect(page.getByLabel('Time range value', { exact: true })).toHaveText('["2026-10-12T10:20:30.100Z","2026-10-25T14:15:16.700Z"]');
    });
  });
}

test('RangePicker gallery hydrates and submits both confirmed datetime objects', async ({ page }) => {
  await page.goto('/ant-design#range-picker');
  const section = page.locator('#range-picker');
  await section.getByRole('button', { name: 'Сохранить период', exact: true }).click();
  await expect(section.getByLabel('Сохранённый период', { exact: true })).toHaveText('2026-10-10 09:00:00 — 2026-10-20 18:00:00');
  await section.getByRole('combobox', { name: '* Период события', exact: true }).click();
  await page.getByRole('button', { name: 'ОК', exact: true }).click(); await page.getByRole('button', { name: 'ОК', exact: true }).click();
  await section.getByRole('button', { name: 'Сохранить период', exact: true }).click();
  await expect(section.getByLabel('Сохранённый период', { exact: true })).toHaveText('2026-10-10 09:00:00 — 2026-10-20 18:00:00');
});

test('RangePicker explicitly enabled Today confirms one boundary at a time', async ({ page }) => {
  await page.getByLabel('Show range current date', { exact: true }).check();
  await start(page).click(); await page.getByRole('button', { name: 'Сегодня', exact: true }).click(); await expect(end(page)).toBeFocused();
  await page.getByRole('button', { name: 'Сегодня', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
  const values = JSON.parse(await page.getByLabel('Range value', { exact: true }).innerText()) as string[];
  expect(values).toHaveLength(2); expect(values[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(values[1]).toBe(values[0]);
});
