import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174?fixture=input-features');
  await expect(page.getByRole('textbox', { name: 'Feature input', exact: true })).toBeVisible();
});

test('Input renders source prefix input clear count suffix order and keeps root and input refs separate', async ({ page }) => {
  const root = page.locator('.feature-input');
  await expect(root).toHaveClass(/ant-input-affix-wrapper/);
  await expect(page.getByLabel('Input feature refs', { exact: true })).toHaveText('INPUT:SPAN');
  expect(await root.locator(':scope > *').evaluateAll(elements => elements.map(element => [...element.classList].filter(name => name.startsWith('ant-input')).join(' ')))).toEqual(['ant-input-prefix', 'ant-input', 'ant-input-suffix']);
  await expect(root.locator('.ant-input-suffix')).toHaveText(/6\s*Suffix/);
  await expect(root.locator('.ant-input-clear-icon svg')).toHaveCount(1);
  await expect(root.locator('input')).toHaveAttribute('size', '12');
  await expect(root.locator('input')).toHaveAttribute('data-input-feature', 'field-data');
  await expect(root.locator('input')).not.toHaveClass(/owner-input/);
});

test('Input preserves old value input and native change callbacks while new change uses a stable clone', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true });
  await input.fill('abc');
  await expect(page.getByLabel('Input feature events', { exact: true })).toHaveText('value:abc|change:change:abc:input|input:abc');
  await page.getByRole('button', { name: 'Replace feature input', exact: true }).click();
  await expect(input).toHaveValue('Parent replacement');
  await expect(page.getByLabel('Input saved event', { exact: true })).toHaveText('change:abc:INPUT');
  await expect(page.getByLabel('Input feature events', { exact: true })).toHaveText(/native-change$/);
  await page.getByRole('button', { name: 'Use input event selection', exact: true }).click();
  await expect(page.getByLabel('Input feature selection', { exact: true })).toHaveText('0:2');
});

test('Input clear preserves focus and emits click change before onClear without a native input', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true });
  await input.fill('abc');
  await page.locator('.feature-input .ant-input-clear-icon').click();
  await expect(input).toHaveValue(''); await expect(input).toBeFocused();
  await expect(page.getByLabel('Input feature events', { exact: true })).toHaveText(/value:\|change:click::click\|clear$/);
  await expect(page.locator('.feature-input .ant-input-clear-icon')).not.toBeVisible();
});

test('Input inherits clear fields and explicit false or local disabled overrides the context', async ({ page }) => {
  const clear = page.locator('.feature-input .ant-input-clear-icon');
  await page.getByRole('combobox', { name: 'Input clear icon', exact: true }).selectOption('context');
  await expect(clear).toHaveText('Context input clear');
  await page.getByLabel('Context input clear disabled', { exact: true }).check(); await expect(clear).not.toBeVisible();
  await page.getByRole('combobox', { name: 'Input clear disabled', exact: true }).selectOption('false'); await expect(clear).toBeVisible();
  await page.getByRole('combobox', { name: 'Input clear icon', exact: true }).selectOption('custom'); await expect(clear.locator('strong')).toHaveText('Custom input clear');
  await page.getByRole('combobox', { name: 'Input clear icon', exact: true }).selectOption('falsy'); await expect(clear).toHaveText('✖');
  await page.getByRole('combobox', { name: 'Input clear mode', exact: true }).selectOption('false'); await expect(clear).toHaveCount(0);
});

test('Input hides the mounted clear control for readonly disabled and empty content', async ({ page }) => {
  const clear = page.locator('.feature-input .ant-input-clear-icon');
  await page.getByLabel('Feature input readonly', { exact: true }).check(); await expect(clear).not.toBeVisible();
  await page.getByLabel('Feature input readonly', { exact: true }).uncheck();
  await page.getByRole('combobox', { name: 'Input disabled override', exact: true }).selectOption('true'); await expect(clear).not.toBeVisible();
  await page.getByRole('combobox', { name: 'Input disabled override', exact: true }).selectOption('false');
  await page.getByRole('textbox', { name: 'Feature input', exact: true }).fill(''); await expect(clear).not.toBeVisible(); await expect(clear).toHaveCount(1);
});

test('Input wrapper clicks focus the native input and disabling resets its focused class', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const root = page.locator('.feature-input');
  await root.locator('.ant-input-prefix').click(); await expect(input).toBeFocused(); await expect(root).toHaveClass(/affix-wrapper-focused/);
  await page.getByRole('combobox', { name: 'Input disabled override', exact: true }).selectOption('true');
  await expect(root).not.toHaveClass(/affix-wrapper-focused/); await expect(input).toBeDisabled();
});

test('Input count is soft and supports codepoints rich formatting and opt-in exceed clipping', async ({ page }) => {
  await page.getByLabel('Configure input count', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const root = page.locator('.feature-input');
  await input.fill('123456'); await expect(input).toHaveValue('123456'); await expect(root).toHaveClass(/ant-input-out-of-range/);
  await page.getByLabel('Count input codepoints', { exact: true }).check(); await page.getByLabel('Clip input exceed', { exact: true }).check(); await page.getByLabel('Rich input count', { exact: true }).check();
  await input.fill('😀abcdef'); await expect(input).toHaveValue('😀abc'); await expect(root.locator('.ant-input-show-count-suffix strong')).toHaveText('4 of 4');
  expect(await input.evaluate(element => (element as HTMLInputElement).selectionEnd)).toBe(5);
  await page.getByRole('button', { name: 'Replace feature input', exact: true }).click(); await expect(input).toHaveValue('Parent replacement');
});

test('Input keeps native maxLength separate and treats count.max zero as unlimited', async ({ page }) => {
  await page.getByLabel('Configure input count', { exact: true }).check(); await page.getByLabel('Native input maximum', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const count = page.locator('.feature-input .ant-input-show-count-suffix');
  await input.fill(''); await input.pressSequentially('123456789012'); await expect(input).toHaveValue('1234567890'); await expect(count).toHaveText('10 / 4');
  await page.getByLabel('Input soft maximum', { exact: true }).fill('0'); await expect(count).toHaveText('10'); await expect(page.locator('.feature-input')).not.toHaveClass(/out-of-range/);
});

test('Input skips unchanged compositionend and delays clipping until composition finishes', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const events = page.getByLabel('Input feature events', { exact: true });
  await input.dispatchEvent('compositionstart'); await input.fill('plain'); await input.dispatchEvent('compositionend');
  await expect(events).toHaveText('value:plain|change:change:plain:input|input:plain|composition-end');
  await page.getByLabel('Configure input count', { exact: true }).check(); await page.getByLabel('Clip input exceed', { exact: true }).check();
  await input.dispatchEvent('compositionstart'); await input.fill('123456'); await expect(input).toHaveValue('123456');
  await input.dispatchEvent('compositionend'); await expect(input).toHaveValue('1234');
  await expect(events).toHaveText(/value:1234\|change:compositionend:1234:compositionend\|composition-end$/);
});

test('Input locks Enter until keyup blur or disabled and ignores composing Enter', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const entered = page.getByLabel('Input feature enter', { exact: true });
  await input.focus(); await input.dispatchEvent('keydown', { key: 'Enter' }); await input.dispatchEvent('keydown', { key: 'Enter', repeat: true }); await expect(entered).toHaveText('1');
  await input.dispatchEvent('keyup', { key: 'Enter' }); await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true }); await expect(entered).toHaveText('1');
  await input.dispatchEvent('keydown', { key: 'Enter' }); await expect(entered).toHaveText('2');
  await input.blur(); await input.dispatchEvent('keydown', { key: 'Enter' }); await expect(entered).toHaveText('3');
  await page.getByRole('combobox', { name: 'Input disabled override', exact: true }).selectOption('true');
  await page.getByRole('combobox', { name: 'Input disabled override', exact: true }).selectOption('false');
  await input.dispatchEvent('keydown', { key: 'Enter' }); await expect(entered).toHaveText('4');
});

test('Input email changes do not invoke unsupported selection setters', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Input feature type', exact: true }).selectOption('email');
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true });
  await input.fill('user@example.org'); await expect(page.getByLabel('Input saved event', { exact: true })).toHaveText('change:user@example.org:INPUT');
  await page.locator('.feature-input .ant-input-clear-icon').click(); await expect(input).toHaveValue('');
});

test('Input password removes its value attribute after mount input focus and blur while retaining its value', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Input feature type', exact: true }).selectOption('password');
  const input = page.getByLabel('Feature input', { exact: true });
  await input.fill('secret'); await expect(input).toHaveValue('secret'); await expect(input).not.toHaveAttribute('value');
  await input.evaluate(element => element.setAttribute('value', 'attribute-only')); await input.focus(); await input.blur();
  await expect(input).not.toHaveAttribute('value'); await expect(input).toHaveValue('secret');
});

test('Input focus cursor selection and native refs survive root shapes and release on unmount', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const selection = page.getByLabel('Input feature selection', { exact: true });
  for (const [name, value] of [['Focus all input text', '0:6'], ['Focus input start', '0:0'], ['Focus input end', '6:6'], ['Select input text', '0:6'], ['Set input selection', '1:3']]) {
    await page.getByRole('button', { name, exact: true }).click(); await expect(selection).toHaveText(value);
  }
  await input.fill('stable'); await page.getByRole('combobox', { name: 'Input clear mode', exact: true }).selectOption('false');
  await page.getByLabel('Input prefix', { exact: true }).uncheck(); await page.getByLabel('Input suffix', { exact: true }).uncheck(); await page.getByLabel('Show input count', { exact: true }).uncheck();
  await expect(page.getByLabel('Input feature refs', { exact: true })).toHaveText('INPUT:INPUT'); await expect(input).toHaveValue('stable');
  await page.getByLabel('Input addon before', { exact: true }).check(); await expect(page.locator('.feature-input')).toHaveClass(/ant-input-group-wrapper/); await expect(input).toHaveValue('stable');
  await page.getByLabel('Mount feature input', { exact: true }).uncheck(); await expect(page.getByLabel('Input feature refs', { exact: true })).toHaveText(':');
});

test('Input supports addons without moving native form data or field attributes onto wrappers', async ({ page }) => {
  await page.getByLabel('Input addon before', { exact: true }).check(); await page.getByLabel('Input addon after', { exact: true }).check();
  const root = page.locator('.feature-input'); const input = page.getByRole('textbox', { name: 'Feature input', exact: true });
  await expect(root).toHaveClass(/ant-input-group-wrapper-filled/); await expect(root.locator('.ant-input-group-addon')).toHaveText(['https://', '.org']);
  await input.fill('domain'); await page.getByRole('button', { name: 'Read feature input FormData', exact: true }).click(); await expect(page.getByLabel('Input feature FormData', { exact: true })).toHaveText('domain');
  await expect(input).toHaveAttribute('name', 'feature'); await expect(root).not.toHaveAttribute('name');
});

test('Input addons isolate FormItem and Compact while retaining form disabled and error focus reset', async ({ page }) => {
  const field = page.getByRole('textbox', { name: '* Counted input', exact: true }); const addon = page.getByRole('textbox', { name: 'Isolated input addon', exact: true });
  await page.getByRole('button', { name: 'Validate counted input', exact: true }).click(); await expect(field).toBeFocused(); await expect(field).toHaveAccessibleDescription('Counted input required');
  await expect(field).toHaveClass(/ant-input-sm/); await expect(addon).not.toHaveClass(/ant-input-sm|compact|status-error/); await expect(addon).not.toHaveAttribute('name'); await expect(addon).not.toHaveAttribute('required'); await expect(addon).not.toHaveAttribute('aria-invalid');
  await field.fill('valid'); await field.blur(); await page.getByRole('button', { name: 'Validate counted input', exact: true }).click(); await expect(field).not.toHaveAttribute('aria-invalid');
  await page.getByRole('button', { name: 'Reset counted input', exact: true }).click(); await expect(field).toHaveValue('');
  await page.getByLabel('Disable counted input form', { exact: true }).check(); await expect(field).toBeDisabled(); await expect(addon).toBeDisabled();
});

test('Input variants and semantic styles preserve root priority for plain affix and addon shapes', async ({ page }) => {
  const root = page.locator('.feature-input'); const input = page.getByRole('textbox', { name: 'Feature input', exact: true });
  await expect(root).toHaveClass(/ant-input-filled/); await page.getByLabel('Legacy input bordered', { exact: true }).uncheck(); await expect(root).toHaveClass(/ant-input-borderless/);
  await page.getByRole('combobox', { name: 'Input variant', exact: true }).selectOption('underlined'); await expect(root).toHaveClass(/ant-input-underlined/);
  await page.getByLabel('Custom input semantics', { exact: true }).check(); await expect(root).toHaveCSS('color', 'rgb(0, 0, 255)'); await expect(input).toHaveCSS('color', 'rgb(0, 255, 255)');
  await expect(root.locator('.semantic-count')).toHaveCSS('font-weight', '700');
  await page.getByLabel('Input addon before', { exact: true }).check(); await expect(root).toHaveCSS('color', 'rgb(0, 0, 255)'); await expect(input).toHaveCSS('color', 'rgb(0, 255, 255)');
  await page.getByLabel('Input addon before', { exact: true }).uncheck(); await page.getByRole('combobox', { name: 'Input clear mode', exact: true }).selectOption('false'); await page.getByLabel('Input prefix', { exact: true }).uncheck(); await page.getByLabel('Input suffix', { exact: true }).uncheck(); await page.getByLabel('Show input count', { exact: true }).uncheck();
  await expect(input).toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('Input forwards hidden to its outer root with the source CSS display behavior', async ({ page }) => {
  await page.getByLabel('Feature input hidden', { exact: true }).check(); await expect(page.locator('.feature-input')).toHaveAttribute('hidden');
  await expect(page.locator('.feature-input')).toHaveCSS('display', 'inline-flex');
  await page.getByLabel('Input addon before', { exact: true }).check(); await expect(page.locator('.feature-input')).toHaveAttribute('hidden'); await expect(page.locator('.feature-input')).toHaveCSS('display', 'inline-block');
  await page.getByLabel('Input addon before', { exact: true }).uncheck(); await page.getByRole('combobox', { name: 'Input clear mode', exact: true }).selectOption('false'); await page.getByLabel('Input prefix', { exact: true }).uncheck(); await page.getByLabel('Input suffix', { exact: true }).uncheck(); await page.getByLabel('Show input count', { exact: true }).uncheck(); await expect(page.locator('.feature-input')).toHaveAttribute('hidden');
});

test('Input config inherits through unspecified providers and explicitly replaced config resets fields', async ({ page }) => {
  await expect(page.getByRole('textbox', { name: 'Inherited input config', exact: true })).toHaveAttribute('autocomplete', 'off');
  await expect(page.getByRole('textbox', { name: 'Inherited input config', exact: true }).locator('..')).toHaveClass(/ant-input-filled/);
  await expect(page.getByRole('textbox', { name: 'Replaced input config', exact: true })).toHaveClass(/ant-input-underlined/);
  await expect(page.getByRole('textbox', { name: 'Replaced input config', exact: true })).not.toHaveAttribute('autocomplete');
});

test('Input retains RTL count direction disabled overrides theme density and reduced motion', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const root = page.locator('.feature-input');
  await page.getByLabel('Right to left', { exact: true }).check(); await expect(root).toHaveClass(/affix-wrapper-rtl/); await expect(input).toHaveCSS('direction', 'rtl'); await expect(root.locator('.ant-input-show-count-suffix')).toHaveCSS('direction', 'ltr');
  await page.getByLabel('Disable all components', { exact: true }).check(); await expect(input).toBeDisabled(); await page.getByRole('combobox', { name: 'Input disabled override', exact: true }).selectOption('false'); await expect(input).toBeEnabled();
  await page.getByLabel('Compact input feature theme', { exact: true }).check(); await expect(input).toHaveCSS('font-size', '12px');
  await page.getByLabel('Dark input feature theme', { exact: true }).check(); await expect(input).not.toHaveCSS('color', 'rgb(0, 0, 0)');
  await page.getByLabel('Input addon before', { exact: true }).check(); await expect(root.locator('.ant-input-group-addon')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.08)');
  await page.getByRole('combobox', { name: 'Input variant', exact: true }).selectOption('outlined'); await expect(root.locator('.ant-input-group-addon')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.04)');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(root).toHaveCSS('transition-duration', '0s');
});

test('Input extended gallery hydrates independently of its existing bound example', async ({ page }) => {
  await page.goto('/ant-design#inputs');
  const old = page.getByRole('textbox', { name: 'Редактируемое значение', exact: true }); const before = await old.inputValue();
  const input = page.getByRole('textbox', { name: 'Адрес со счётчиком', exact: true }); await input.fill('hello');
  await expect(page.locator('#inputs .ant-input-show-count-suffix')).toHaveText('5 / 24'); await expect(old).toHaveValue(before);
  await page.locator('#inputs .ant-input-clear-icon').click(); await expect(input).toBeFocused(); await expect(input).toHaveValue('');
});


test('Input affix size geometry and focused primary border follow the source tokens', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Feature input', exact: true }); const root = page.locator('.feature-input');
  await expect(root).toHaveCSS('height', '32px');
  await page.getByRole('combobox', { name: 'Input feature size', exact: true }).selectOption('large'); await expect(root).toHaveCSS('height', '40px'); await expect(input).toHaveCSS('font-size', '16px');
  await page.getByRole('combobox', { name: 'Input feature size', exact: true }).selectOption('small'); await expect(root).toHaveCSS('height', '24px');
  await page.getByRole('combobox', { name: 'Input variant', exact: true }).selectOption('outlined'); await input.focus(); await expect(root).toHaveCSS('border-top-color', 'rgb(82, 196, 26)');
});
