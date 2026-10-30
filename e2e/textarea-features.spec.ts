import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=textarea-features');
  await expect(page.getByRole('textbox', { name: 'Feature text', exact: true })).toBeVisible();
});

test('TextArea keeps native refs while count and clear use the source affix structure', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true }); const root = page.locator('.feature-textarea');
  await expect(root).toHaveClass(/ant-input-textarea-affix-wrapper/);
  await expect(page.getByLabel('Textarea feature refs', { exact: true })).toHaveText('TEXTAREA:SPAN');
  await expect(root.locator('.ant-input-data-count')).toHaveText('15');
  await page.getByRole('combobox', { name: 'Textarea clear mode', exact: true }).selectOption('false');
  await page.getByLabel('Show textarea count', { exact: true }).uncheck();
  await expect(page.getByLabel('Textarea feature refs', { exact: true })).toHaveText('TEXTAREA:TEXTAREA');
  await expect(input).toHaveValue('Initial 😀\ntext');
});

test('TextArea clear preserves focus and emits value, click change and onClear without a native input', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await input.fill('abc');
  await expect(page.getByLabel('Textarea feature events', { exact: true })).toHaveText(/value:abc\|change:change:abc:input\|input:abc$/);
  await page.locator('.feature-textarea .ant-input-clear-icon').click();
  await expect(input).toBeFocused(); await expect(input).toHaveValue('');
  await expect(page.getByLabel('Textarea feature events', { exact: true })).toHaveText(/value:\|change:click::click\|clear$/);
  await expect(page.getByLabel('Textarea saved event', { exact: true })).toHaveText('click::true');
  await page.getByRole('button', { name: 'Replace feature textarea', exact: true }).click();
  await expect(input).toHaveValue('Parent replacement');
  await expect(page.getByLabel('Textarea saved event', { exact: true })).toHaveText('click::true');
  await page.getByRole('button', { name: 'Use textarea event selection', exact: true }).click();
  await expect(page.getByLabel('Textarea event selection', { exact: true })).toHaveText('0:2');
});

test('TextArea clear merges config fields and hides the mounted button for disabled, readonly and empty values', async ({ page }) => {
  const clear = page.locator('.feature-textarea .ant-input-clear-icon');
  await expect(clear).toHaveText('Context clear');
  await page.getByLabel('Context clear disabled', { exact: true }).check(); await expect(clear).not.toBeVisible();
  await page.getByRole('combobox', { name: 'Textarea clear disabled', exact: true }).selectOption('false'); await expect(clear).toBeVisible();
  await page.getByLabel('Feature textarea readonly', { exact: true }).check(); await expect(clear).not.toBeVisible();
  await page.getByLabel('Feature textarea readonly', { exact: true }).uncheck();
  await page.getByLabel('Feature textarea disabled', { exact: true }).check(); await expect(clear).not.toBeVisible();
  await page.getByLabel('Feature textarea disabled', { exact: true }).uncheck();
  await page.getByRole('combobox', { name: 'Textarea clear icon', exact: true }).selectOption('custom'); await expect(clear.locator('strong')).toHaveText('Custom clear');
  await page.getByRole('combobox', { name: 'Textarea clear icon', exact: true }).selectOption('falsy'); await expect(clear).toHaveText('✖');
});

test('TextArea count.max is soft and zero does not constrain value or mark it out of range', async ({ page }) => {
  await page.getByLabel('Configure textarea count', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true }); const root = page.locator('.feature-textarea');
  await input.fill('123456789'); await expect(input).toHaveValue('123456789');
  await expect(root.locator('.ant-input-data-count')).toHaveText('9 / 6'); await expect(root).toHaveClass(/ant-input-out-of-range/);
  await page.getByLabel('Textarea soft maximum', { exact: true }).fill('0');
  await expect(root.locator('.ant-input-data-count')).toHaveText('9'); await expect(root).not.toHaveClass(/ant-input-out-of-range/);
});

test('TextArea supports custom count strategy, format snippets and clipping while retaining selection', async ({ page }) => {
  await page.getByLabel('Configure textarea count', { exact: true }).check();
  await page.getByLabel('Count textarea codepoints', { exact: true }).check();
  await page.getByLabel('Clip textarea exceed', { exact: true }).check();
  await page.getByLabel('Rich textarea count', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await input.fill('😀abcdefg');
  await expect(input).toHaveValue('😀abcde');
  await expect(page.locator('.feature-textarea .ant-input-data-count strong')).toHaveText('6 of 6');
  expect(await input.evaluate(element => [(element as HTMLTextAreaElement).selectionStart, (element as HTMLTextAreaElement).selectionEnd])).toEqual([7, 7]);
  await page.getByRole('button', { name: 'Replace feature textarea', exact: true }).click();
  await expect(input).toHaveValue('Parent replacement');
});

test('TextArea defers exceedFormatter through composition and emits the final compositionend change', async ({ page }) => {
  await page.getByLabel('Configure textarea count', { exact: true }).check(); await page.getByLabel('Clip textarea exceed', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await input.dispatchEvent('compositionstart'); await input.fill('123456789'); await expect(input).toHaveValue('123456789');
  await input.dispatchEvent('compositionend'); await expect(input).toHaveValue('123456');
  await expect(page.getByLabel('Textarea feature events', { exact: true })).toHaveText(/change:compositionend:123456:compositionend$/);
});

test('TextArea keeps native maxLength separate from the soft counter maximum', async ({ page }) => {
  await page.getByLabel('Configure textarea count', { exact: true }).check(); await page.getByLabel('Native textarea maximum', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await input.fill(''); await input.pressSequentially('1234567890123'); await expect(input).toHaveValue('1234567890');
  await expect(page.locator('.feature-textarea .ant-input-data-count')).toHaveText('10 / 6');
});

test('TextArea autosize clamps row heights, permits scrolling at maximum and restores authored sizing when disabled', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await expect(input).toHaveCSS('resize', 'none');
  await page.getByRole('button', { name: 'Set six textarea rows', exact: true }).click();
  await expect(input).toHaveCSS('height', '96px'); await expect(input).toHaveCSS('max-height', '96px');
  await expect(input).toHaveCSS('overflow-y', 'auto');
  await page.getByRole('button', { name: 'Set short textarea text', exact: true }).click();
  await expect(input).toHaveCSS('height', '52px'); await expect(input).toHaveCSS('min-height', '52px'); await expect(input).toHaveCSS('overflow-y', 'hidden');
  await page.getByRole('combobox', { name: 'Textarea autosize', exact: true }).selectOption('off');
  expect(await input.evaluate(element => [(element as HTMLElement).style.height, (element as HTMLElement).style.maxHeight, (element as HTMLElement).style.minHeight])).toEqual(['', '', '']);
  await expect(input).toHaveCSS('resize', 'vertical');
});

test('TextArea autosize responds to width, fonts, compact density and wrap=off', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await page.getByRole('combobox', { name: 'Textarea autosize', exact: true }).selectOption('auto');
  await input.fill('a '.repeat(120));
  const before = (await input.boundingBox())!.height;
  await page.setViewportSize({ width: 320, height: 844 });
  await expect.poll(async () => (await input.boundingBox())!.height).toBeGreaterThan(before);
  await page.getByRole('combobox', { name: 'Textarea wrap', exact: true }).selectOption('off');
  await expect.poll(async () => (await input.boundingBox())!.height).toBeLessThan(before);
  await page.getByLabel('Compact textarea feature theme', { exact: true }).check();
  await expect(input).toHaveCSS('font-size', '12px');
});

test('TextArea applies variants, legacy bordered and semantic style precedence in both root shapes', async ({ page }) => {
  const root = page.locator('.feature-textarea'); const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await expect(root).toHaveClass(/ant-input-filled/);
  await page.getByLabel('Legacy textarea bordered', { exact: true }).uncheck(); await expect(root).toHaveClass(/ant-input-borderless/);
  await page.getByRole('combobox', { name: 'Textarea variant', exact: true }).selectOption('underlined'); await expect(root).toHaveClass(/ant-input-underlined/);
  await page.getByLabel('Custom textarea semantics', { exact: true }).check();
  await expect(root).toHaveClass(/semantic-root/); await expect(root).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(input).toHaveCSS('color', 'rgb(0, 255, 255)');
  await expect(root.locator('.semantic-count')).toHaveCSS('font-weight', '700');
  await page.getByRole('combobox', { name: 'Textarea clear mode', exact: true }).selectOption('false'); await page.getByLabel('Show textarea count', { exact: true }).uncheck();
  await expect(input).toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('TextArea wrapped FormItem retains native associations, errors, focus and model reset', async ({ page }) => {
  const input = page.getByRole('textbox', { name: '* Counted description', exact: true });
  await page.getByRole('button', { name: 'Validate counted textarea', exact: true }).click();
  await expect(input).toBeFocused(); await expect(input).toHaveAccessibleDescription('Counted text required');
  await input.fill('valid'); await input.blur(); await page.getByRole('button', { name: 'Validate counted textarea', exact: true }).click();
  await expect(input).not.toHaveAttribute('aria-invalid');
  await page.getByRole('button', { name: 'Reset counted textarea', exact: true }).click(); await expect(input).toHaveValue('');
});

test('TextArea focus cursor methods preserve native selection and wrap transitions retain the bound value', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await page.getByRole('button', { name: 'Focus all textarea text', exact: true }).click();
  await expect(input).toBeFocused(); expect(await input.evaluate(element => (element as HTMLTextAreaElement).selectionEnd)).toBe(15);
  await page.getByRole('button', { name: 'Blur feature textarea', exact: true }).click(); await expect(input).not.toBeFocused();
  await input.fill('stable');
  await page.getByRole('combobox', { name: 'Textarea clear mode', exact: true }).selectOption('false'); await page.getByLabel('Show textarea count', { exact: true }).uncheck();
  await expect(input).toHaveValue('stable'); await expect(page.getByLabel('Textarea feature refs', { exact: true })).toHaveText('TEXTAREA:TEXTAREA');
});

test('TextArea manual resize follows the source dirty wrapper and cleans the document mouseup listener', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true });
  await page.getByRole('combobox', { name: 'Textarea autosize', exact: true }).selectOption('off'); await page.getByLabel('Manual textarea resize', { exact: true }).check();
  await expect(input).toHaveCSS('resize', 'both');
  await input.scrollIntoViewIfNeeded(); const box = (await input.boundingBox())!;
  await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3); await page.mouse.down();
  try {
    await page.mouse.move(box.x + box.width + 35, box.y + box.height + 35, { steps: 5 });
    await expect(page.locator('.feature-textarea')).toHaveClass(/resize-dirty/);
    await expect(input).toHaveClass(/ant-input-mouse-active/);
  } finally { await page.mouse.up(); }
  await expect(input).not.toHaveClass(/ant-input-mouse-active/);
  await input.dispatchEvent('mousedown'); await page.getByLabel('Mount feature textarea', { exact: true }).evaluate(element => (element as HTMLInputElement).click());
  await page.dispatchEvent('body', 'mouseup'); await expect(input).toHaveCount(0);
});

test('TextArea releases its shared hidden measurement field after every autosize consumer unmounts', async ({ page }) => {
  await expect(page.locator('textarea[name="hiddenTextarea"]')).toHaveCount(1);
  await page.getByLabel('Mount feature textarea', { exact: true }).uncheck();
  await expect(page.locator('textarea[name="hiddenTextarea"]')).toHaveCount(1);
  await expect(page.getByLabel('Textarea feature refs', { exact: true })).toHaveText(':');
  await page.getByLabel('Autosize counted textarea', { exact: true }).uncheck();
  await expect(page.locator('textarea[name="hiddenTextarea"]')).toHaveCount(0);
  await page.goto('http://127.0.0.1:4174?fixture=input');
  await expect(page.locator('textarea[name="hiddenTextarea"]')).toHaveCount(0);
});

test('TextArea preserves RTL, disabled and reduced motion across new wrappers', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature text', exact: true }); const root = page.locator('.feature-textarea');
  await page.getByLabel('Right to left', { exact: true }).check(); await expect(root).toHaveClass(/ant-input-affix-wrapper-rtl/); await expect(input).toHaveCSS('direction', 'rtl');
  await expect(root.locator('.ant-input-data-count')).toHaveCSS('direction', 'ltr');
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(input).toBeEnabled();
  await page.getByLabel('Feature textarea disabled', { exact: true }).check(); await expect(input).toBeDisabled();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(input).toHaveCSS('transition-duration', '0s');
});

test('TextArea extended gallery hydrates independently of the preserved native example', async ({ page }) => {
  await page.goto('/ant-design#textarea');
  const basic = page.getByRole('textbox', { name: 'Описание задачи', exact: true });
  const previous = await basic.inputValue();
  const rich = page.getByRole('textbox', { name: 'Автоматический размер', exact: true });
  await rich.fill('One\nTwo'); await expect(page.locator('#textarea .ant-input-data-count')).toHaveText('7 / 120');
  await expect(basic).toHaveValue(previous);
  await expect(rich).toHaveCSS('resize', 'none');
});
