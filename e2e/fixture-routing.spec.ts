import { test, expect } from './test';
import catalog from './fixtures/catalog.json' with { type: 'json' };

for (const entry of catalog) test(`isolated fixture mounts ${entry.id}`, async ({ page }) => {
  await page.goto(`http://127.0.0.1:4174?fixture=${entry.id}`);
  await expect(page.getByRole('heading', { name: 'Component browser fixtures', exact: true })).toBeVisible();
  await expect(page.locator(`[id="${entry.root}"]`)).toBeVisible();
  for (const unrelated of catalog.filter(item => item.id !== entry.id)) await expect(page.locator(`[id="${unrelated.root}"]`)).toHaveCount(0);
});

test('isolated fixtures do not request unrelated fixture modules and retain shared context controls', async ({ page }) => {
  const fixtureRequests: string[] = [];
  page.on('request', request => { if (/\/(?:Components|.*Fixtures)\.svelte(?:\?|$)/.test(request.url())) fixtureRequests.push(request.url()); });
  await page.goto('http://127.0.0.1:4174?fixture=avatar-group'); await expect(page.locator('#fixture-avatar-group')).toBeVisible();
  expect(fixtureRequests.some(url => /\/Components\.svelte/.test(url))).toBe(false); expect(fixtureRequests.some(url => /\/AvatarFixtures\.svelte/.test(url))).toBe(false); expect(fixtureRequests.some(url => /\/AvatarGroupFixtures\.svelte/.test(url))).toBe(true);
  await page.getByRole('checkbox', { name: 'English locale', exact: true }).check(); await expect(page.locator('#fixture-avatar-group')).toHaveAccessibleName('Members'); await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check(); await expect(page.locator('#fixture-avatar-group')).toHaveAttribute('dir', 'rtl');
});

test('the original fixture address retains the complete integration page', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174'); await expect(page.locator('#input-fixture')).toBeVisible(); await expect(page.locator('#avatar-group-fixture')).toBeVisible(); await expect(page.locator('#form-fixture')).toBeVisible();
});

test('unknown and duplicate fixture selectors show a clear error without mounting the full page', async ({ page }) => {
  for (const query of ['unknown', 'avatar&fixture=badge']) { await page.goto(`http://127.0.0.1:4174?fixture=${query}`); await expect(page.getByRole('alert')).toContainText('Unknown fixture'); await expect(page.locator('#input-fixture')).toHaveCount(0); await expect(page.getByRole('link', { name: 'avatar', exact: true })).toHaveAttribute('href', '?fixture=avatar'); }
});
