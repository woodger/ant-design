import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=radio');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Radio synchronizes peer bindings through native labels, Space, arrows and native radio changes', async ({ page }) => {
  const bound = page.getByRole('radio', { name: 'Bound standalone radio', exact: true });
  const peer = page.getByRole('radio', { name: 'Peer standalone radio', exact: true });
  await bound.focus();
  await bound.press('Space');
  await expect(bound).toBeChecked();
  await expect(bound.locator('..')).toHaveCSS('outline-style', 'solid');
  await bound.press('ArrowRight');
  await expect(peer).toBeChecked();
  await expect(peer).toBeFocused();
  await expect(bound).not.toBeChecked();
  await expect(bound).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[false,true]');
  await page.getByText('Peer standalone radio', { exact: true }).click();
  await page.getByRole('radio', { name: 'Native standalone peer', exact: true }).check();

  await expect(peer).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[false,false]');
  await expect(page.getByRole('status', { name: 'Standalone radio events', exact: true })).toHaveText('["bound:true","peer:true"]');
  await expect(page.getByRole('radio', { name: 'Outside standalone radio', exact: true })).toBeChecked();
});

test('Radio accepts external checked updates and synchronizes its native peers without callbacks', async ({ page }) => {
  await page.getByRole('button', { name: 'Set bound radio externally', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[true,false]');
  await page.getByRole('button', { name: 'Set peer radio externally', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[false,true]');
  await expect(page.getByRole('radio', { name: 'Peer standalone radio', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Bound standalone radio', exact: true })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('status', { name: 'Standalone radio events', exact: true })).toHaveText('[]');
});

test('RadioGroup navigates a single selection natively, skips disabled options and reports one callback per change', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  const zero = group.getByRole('radio', { name: 'Radio zero', exact: true });
  const two = group.getByRole('radio', { name: 'Radio two', exact: true });
  await zero.focus();
  await zero.press('ArrowRight');
  await expect(two).toBeChecked();
  await expect(two).toBeFocused();
  await two.press('ArrowDown');
  await group.getByRole('radio', { name: 'Radio three', exact: true }).press('ArrowRight');
  await expect(zero).toBeChecked();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('0');
  await zero.press('Space');
  await expect(page.getByRole('status', { name: 'Radio events', exact: true })).toHaveText('[2,3,0]');
  await zero.press('Tab');
  await expect(page.getByRole('radiogroup', { name: 'Default numeric radios', exact: true }).getByRole('radio', { name: 'Radio two', exact: true })).toBeFocused();
});

test('RadioGroup assigns distinct automatic names so unnamed groups remain independent', async ({ page }) => {
  const first = page.getByRole('radiogroup', { name: 'First automatic radios', exact: true });
  const second = page.getByRole('radiogroup', { name: 'Second automatic radios', exact: true });
  const firstName = await first.getByRole('radio').first().getAttribute('name');
  const secondName = await second.getByRole('radio').first().getAttribute('name');
  expect(firstName).toBeTruthy();
  expect(secondName).toBeTruthy();
  expect(firstName).not.toBe(secondName);
  await first.getByRole('radio', { name: '2', exact: true }).check();
  await second.getByRole('radio', { name: '0', exact: true }).check();

  await expect(first.getByRole('radio', { name: '2', exact: true })).toBeChecked();
  await expect(second.getByRole('radio', { name: '0', exact: true })).toBeChecked();
  await expect(page.getByRole('status', { name: 'Radio events', exact: true })).toHaveText('[]');
});

test('RadioGroup keeps zero and false distinct from strings while FormData uses native string values', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Mixed radios', exact: true });
  await group.getByRole('radio', { name: 'Radio numeric zero', exact: true }).check();
  await expect(page.getByRole('status', { name: 'Mixed radio owner', exact: true })).toHaveText('0');
  await group.getByRole('radio', { name: 'Radio text zero', exact: true }).check();
  await expect(page.getByRole('status', { name: 'Mixed radio owner', exact: true })).toHaveText('"0"');
  await group.getByRole('radio', { name: 'Radio boolean false', exact: true }).check();
  await expect(page.getByRole('status', { name: 'Mixed radio owner', exact: true })).toHaveText('false');
  expect(await page.locator('#radio-native-form').evaluate((element) => new FormData(element as HTMLFormElement).get('mixed'))).toBe('false');
  await group.getByRole('radio', { name: 'Radio text false', exact: true }).check();
  await expect(page.getByRole('status', { name: 'Mixed radio owner', exact: true })).toHaveText('"false"');
  await expect(group.getByRole('radio', { name: 'Radio boolean false', exact: true })).not.toBeChecked();
});

test('RadioGroup updates labels and missing options without changing owner values or emitting callbacks', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  await page.getByLabel('Rename radio zero', { exact: true }).check();
  await expect(group.getByRole('radio', { name: 'Renamed radio zero', exact: true })).toBeChecked();
  await page.getByLabel('Hide radio zero', { exact: true }).check();
  await expect(group.locator('input:checked')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('0');
  await page.getByLabel('Hide radio zero', { exact: true }).uncheck();
  await page.getByLabel('Reverse radio options', { exact: true }).check();
  await expect(group.getByRole('radio', { name: 'Renamed radio zero', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Set radio value externally', exact: true }).click();
  await expect(group.getByRole('radio', { name: 'Radio three', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Set missing radio value', exact: true }).click();
  await expect(group.locator('input:checked')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('99');
  await page.getByRole('button', { name: 'Clear radio value externally', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('undefined');
  await expect(page.getByRole('status', { name: 'Radio events', exact: true })).toHaveText('[]');
});

test('RadioGroup and Radio inherit disabled context, retain selected values and allow explicit overrides', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  const two = group.getByRole('radio', { name: 'Radio two', exact: true });
  await two.check();
  await page.getByLabel('Lock radio two', { exact: true }).check();
  await expect(two).toBeChecked();
  await expect(two).toBeDisabled();
  expect(await page.locator('#radio-native-form').evaluate((element) => new FormData(element as HTMLFormElement).get('numberChoice'))).toBeNull();
  await group.getByRole('radio', { name: 'Radio zero', exact: true }).check();
  await expect(two).not.toBeChecked();
  await page.getByLabel('Disable radio group', { exact: true }).check();
  for (const input of await group.getByRole('radio').all()) await expect(input).toBeDisabled();
  await page.getByLabel('Disable radio group', { exact: true }).uncheck();
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(group.getByRole('radio', { name: 'Radio zero', exact: true })).toBeDisabled();
  await expect(page.getByRole('radio', { name: 'Bound standalone radio', exact: true })).toBeDisabled();
  await expect(page.getByRole('radio', { name: 'Enabled standalone radio', exact: true })).toBeEnabled();
  await expect(page.getByRole('radiogroup', { name: 'Enabled radio override', exact: true }).getByRole('radio')).toBeEnabled();
  await expect(page.getByRole('status', { name: 'Radio events', exact: true })).toHaveText('[2,0]');
});

test('RadioGroup keeps empty and entirely disabled choices named and safe without synthetic selection', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  await page.getByLabel('Lock every radio option', { exact: true }).check();
  await group.focus();
  await expect(group).toBeFocused();
  await page.getByLabel('Empty radio options', { exact: true }).check();
  await expect(group.getByRole('radio')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('0');
  await expect(page.getByRole('status', { name: 'Radio events', exact: true })).toHaveText('[]');
});

test('RadioGroup required uses native group validity and accepts numeric zero', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear radio value externally', exact: true }).click();
  await page.getByLabel('Native radio required', { exact: true }).check();
  await page.getByRole('button', { name: 'Read radio FormData', exact: true }).click();
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  const zero = group.getByRole('radio', { name: 'Radio zero', exact: true });
  await expect(zero).toBeFocused();
  await expect(group).toHaveAttribute('aria-required', 'true');
  await expect(page.getByRole('status', { name: 'Radio FormData', exact: true })).toBeEmpty();
  await zero.check();
  await page.getByRole('button', { name: 'Read radio FormData', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Radio FormData', exact: true })).toHaveText('{"number":"0","single":null,"defaults":"yes","defaultGroup":"2"}');
});

test('Radio and RadioGroup restore initial native defaults without callbacks and respect canceled reset', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  const defaults = page.getByRole('radiogroup', { name: 'Default numeric radios', exact: true });
  await group.getByRole('radio', { name: 'Radio three', exact: true }).check();
  await defaults.getByRole('radio', { name: 'Radio zero', exact: true }).check();
  await page.getByRole('button', { name: 'Replace radio default', exact: true }).click();
  await page.getByRole('radio', { name: 'Bound standalone radio', exact: true }).check();
  await page.getByRole('radio', { name: 'Default standalone peer', exact: true }).check();
  await page.getByLabel('Cancel radio reset', { exact: true }).check();
  await page.getByRole('button', { name: 'Reset native radios', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('3');
  await expect(page.getByRole('radio', { name: 'Default standalone radio', exact: true })).not.toBeChecked();
  await page.getByLabel('Cancel radio reset', { exact: true }).uncheck();
  await page.evaluate(() => window.addEventListener('reset', (event) => event.preventDefault(), { once: true }));
  await page.getByRole('button', { name: 'Reset native radios', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('3');
  await page.getByRole('button', { name: 'Reset native radios', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('undefined');
  await expect(defaults.getByRole('radio', { name: 'Radio two', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Default standalone radio', exact: true })).toBeChecked();
  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[false,false]');
  await expect(page.getByRole('status', { name: 'Standalone radio events', exact: true })).toHaveText('["bound:true"]');
  await expect(page.getByRole('status', { name: 'Radio events', exact: true })).toHaveText('[3]');
  await expect(page.getByRole('status', { name: 'Radio default events', exact: true })).toHaveText('1');
});

test('RadioGroup keeps equal names independent across native form owners and honors external association', async ({ page }) => {
  const bound = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  const outside = page.getByRole('radiogroup', { name: 'Outside numeric radios', exact: true });
  await bound.getByRole('radio', { name: 'Radio two', exact: true }).check();
  await outside.getByRole('radio', { name: 'Radio three', exact: true }).check();
  await page.getByRole('button', { name: 'Read outside radios', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Outside radio FormData', exact: true })).toHaveText('3');
  await expect(bound.getByRole('radio', { name: 'Radio two', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Reset outside radios', exact: true }).click();
  await expect(outside.getByRole('radio', { name: 'Radio zero', exact: true })).toBeChecked();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('2');
});

test('RadioGroup and standalone Radio integrate field labels, required, false values, submission and Form reset', async ({ page }) => {
  const fixture = page.locator('#radio-form-fixture');
  const group = fixture.getByRole('radiogroup', { name: 'Radio roles', exact: true });
  const zero = group.getByRole('radio', { name: 'Radio zero', exact: true });
  await fixture.getByText('Radio roles', { exact: true }).click();
  await expect(zero).toBeFocused();
  await expect(zero).not.toBeChecked();
  await fixture.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  await expect(zero).toBeFocused();
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await expect(group).toHaveAccessibleDescription('Choose a radio role');
  await zero.check();
  await fixture.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  const consent = fixture.getByLabel('Radio consent', { exact: true });
  await expect(consent).toBeFocused();
  await expect(consent).toHaveAccessibleDescription('Accept radio consent');
  await fixture.getByText('Radio consent', { exact: true }).click();
  await fixture.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Radio form saved', exact: true })).toHaveText('{"choice":0,"decision":false,"accepted":true}');
  expect(await fixture.locator('form').evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toMatchObject({ choice: '0', decision: 'false', accepted: 'on' });
  await fixture.getByRole('button', { name: 'Reset radio form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Radio form owner', exact: true })).toHaveText('{"decision":false,"accepted":false}');
  await expect(group).not.toHaveAttribute('aria-invalid');
  await expect(consent).not.toBeChecked();
  await expect(fixture.getByRole('radio', { name: 'Radio decision false', exact: true })).toBeChecked();
});

test('RadioGroup focuses its selected invalid choice and revalidates an externally cleared boolean field', async ({ page }) => {
  const fixture = page.locator('#radio-form-fixture');
  const three = fixture.getByRole('radio', { name: 'Radio three', exact: true });
  await three.check();
  await fixture.getByLabel('Radio consent', { exact: true }).check();
  await fixture.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  await expect(three).toBeFocused();
  await expect(three).toHaveAccessibleDescription('Choose zero or two');
  await fixture.getByRole('radio', { name: 'Radio two', exact: true }).check();
  await fixture.getByRole('button', { name: 'Clear radio decision', exact: true }).click();
  await fixture.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  const decision = fixture.getByRole('radio', { name: 'Radio decision false', exact: true });
  await expect(decision).toBeFocused();
  await expect(decision).not.toBeChecked();
  await decision.check();
  await fixture.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  await expect(fixture.getByRole('status', { name: 'Radio form saved', exact: true })).toHaveText('{"choice":2,"decision":false,"accepted":true}');
});

test('Radio and RadioGroup inherit Form disabled state and preserve a group override', async ({ page }) => {
  await page.getByLabel('Disable radio form', { exact: true }).check();
  const fixture = page.locator('#radio-form-fixture');
  for (const input of await fixture.getByRole('radiogroup', { name: 'Radio roles', exact: true }).getByRole('radio').all()) await expect(input).toBeDisabled();
  await expect(fixture.getByLabel('Radio consent', { exact: true })).toBeDisabled();
  await expect(fixture.getByRole('radiogroup', { name: 'Form radio inherited', exact: true }).getByRole('radio')).toBeDisabled();
  await expect(fixture.getByRole('radiogroup', { name: 'Form radio enabled override', exact: true }).getByRole('radio')).toBeEnabled();
});

test('RadioGroup focuses an empty invalid group and preserves owners while controls are unmounted', async ({ page }) => {
  await page.getByLabel('Empty radio form options', { exact: true }).check();
  await page.getByRole('button', { name: 'Submit radio form', exact: true }).click();
  await expect(page.getByRole('radiogroup', { name: 'Radio roles', exact: true })).toBeFocused();
  await page.getByRole('radio', { name: 'Bound standalone radio', exact: true }).check();
  await page.getByLabel('Mount standalone radios', { exact: true }).uncheck();
  await page.getByRole('radio', { name: 'Native standalone peer', exact: true }).check();
  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[true,false]');
  await page.getByLabel('Mount standalone radios', { exact: true }).check();
  await page.getByRole('button', { name: 'Set peer radio externally', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Standalone radio owner', exact: true })).toHaveText('[false,true]');
  await page.getByRole('button', { name: 'Set radio value externally', exact: true }).click();
  await page.getByLabel('Mount numeric radios', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Reset native radios', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('3');
  await page.getByLabel('Mount numeric radios', { exact: true }).check();
  await page.getByRole('button', { name: 'Reset native radios', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Radio owner', exact: true })).toHaveText('undefined');
});

test('RadioGroup follows RTL, dark and compact themes and vertical orientation', async ({ page }, testInfo) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Dark radio theme', { exact: true }).check();
  await page.getByLabel('Compact radio theme', { exact: true }).check();
  const group = page.getByRole('radiogroup', { name: 'Bound numeric radios', exact: true });
  const zero = group.getByRole('radio', { name: 'Radio zero', exact: true });
  const two = group.getByRole('radio', { name: 'Radio two', exact: true });
  await expect(group).toHaveCSS('direction', 'rtl');
  await expect(zero.locator('..')).toHaveCSS('font-size', '12px');
  expect((await zero.boundingBox())!.x).toBeGreaterThan((await two.boundingBox())!.x);
  await page.mouse.move(0, 0);
  await expect(zero.locator('..')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(two.locator('..')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await page.getByLabel('Vertical radio options', { exact: true }).check();
  await expect(group).toHaveAttribute('aria-orientation', 'vertical');
  expect((await two.boundingBox())!.y).toBeGreaterThan((await zero.boundingBox())!.y);
  await group.screenshot({ path: testInfo.outputPath('radio-rtl-dark.png') });
});

test.describe('mobile RadioGroup', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('wraps long radio labels within the viewport and retains native selection', async ({ page }, testInfo) => {
    const group = page.getByRole('radiogroup', { name: 'Long radio labels', exact: true });
    const input = group.getByRole('radio', { name: /^Long radio choice/ });
    await input.check();
    await expect(input).toBeChecked();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await group.screenshot({ path: testInfo.outputPath('radio-mobile.png') });
  });
});
