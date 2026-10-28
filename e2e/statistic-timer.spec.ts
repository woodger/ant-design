import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto('http://127.0.0.1:4174?fixture=statistic-timer');
  await expect(page.locator('#fixture-timer .ant-statistic-content-value')).toHaveText('00:00:10');
});

test('StatisticTimer counts down, reports signed differences and finishes once after the target', async ({ page }) => {
  const value = page.locator('#fixture-timer .ant-statistic-content-value');
  await page.clock.runFor(1100);
  await expect(value).toHaveText('00:00:08');
  await expect(page.getByRole('status', { name: 'Timer finishes', exact: true })).toHaveText('0');
  await page.clock.runFor(10000);
  await expect(value).toHaveText('00:00:00');
  await expect(page.getByRole('status', { name: 'Timer finishes', exact: true })).toHaveText('1');
  expect(Number(await page.getByRole('status', { name: 'Timer latest', exact: true }).textContent())).toBeLessThan(0);
  const count = await page.getByRole('status', { name: 'Timer changes', exact: true }).textContent();
  await page.clock.runFor(2000);
  await expect(page.getByRole('status', { name: 'Timer changes', exact: true })).toHaveText(count!);
});

test('StatisticTimer restarts on target and direction changes, updates format and keeps native focus', async ({ page }) => {
  const value = page.locator('#fixture-timer .ant-statistic-content-value');
  await page.getByRole('spinbutton', { name: 'Timer target' }).fill(String(Date.UTC(2025, 11, 31, 23, 59, 1)));
  await page.getByRole('combobox', { name: 'Timer direction' }).selectOption('countup');
  await expect(value).toHaveText('00:01:00');
  await page.clock.runFor(1100);
  await expect(value).toHaveText('00:01:01');
  await page.getByRole('textbox', { name: 'Timer format' }).fill('m [Minutes] s [Seconds]');
  await expect(value).toHaveText('1 Minutes 1 Seconds');
  await page.getByRole('button', { name: 'Before timer', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After timer', exact: true })).toBeFocused();
  await expect(page.getByRole('status', { name: 'Timer native element', exact: true })).toHaveText('fixture-timer');
  await expect(page.getByRole('status', { name: 'Timer finishes', exact: true })).toHaveText('0');
});

test('StatisticCountdown shares the timer lifecycle and unmount cancels all later callbacks', async ({ page }) => {
  await page.getByLabel('Countdown alias').check();
  await page.clock.runFor(100);
  await expect(page.locator('#fixture-timer .ant-statistic-content-value')).toHaveText('00:00:09');
  await page.getByLabel('Mount timer').uncheck();
  const count = await page.getByRole('status', { name: 'Timer changes', exact: true }).textContent();
  await page.clock.runFor(20000);
  await expect(page.getByRole('status', { name: 'Timer changes', exact: true })).toHaveText(count!);
  await expect(page.getByRole('status', { name: 'Timer finishes', exact: true })).toHaveText('0');
  await page.getByRole('button', { name: 'Restart timer', exact: true }).click();
  await page.getByLabel('Mount timer').check();
  await expect(page.locator('#fixture-timer .ant-statistic-content-value')).toHaveText('00:00:10');
});

test('StatisticTimer gallery starts and completes a user-triggered countdown', async ({ page }) => {
  await page.goto('/ant-design#statistic');
  const section = page.locator('#statistic');
  await section.getByRole('button', { name: 'Запустить отсчёт', exact: true }).click();
  await expect(section.locator('.ant-statistic').last().locator('.ant-statistic-content-value')).toHaveText('00:00:10');
  await page.clock.runFor(11000);
  await expect(section.getByRole('status')).toHaveText('Отсчёт завершён');
});
