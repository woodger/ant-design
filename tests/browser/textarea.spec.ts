import { test, expect } from './test';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=textarea'); });

test(
  'TextArea preserves multiline editing, bindings, parent replacements and native FormData',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Description', exact: true });

    await expect(input).toHaveValue('Initial\ntext');
    await expect(input).toHaveAttribute('rows', '4');

    await input.evaluate(
      node => {
        node.dataset.inputEvents = '0';
        node.addEventListener(
          'input',
          () => { node.dataset.inputEvents = String(Number(node.dataset.inputEvents) + 1); }
        );
      }
    );
    await input.fill('Hello\nworld');

    await expect(page.getByLabel('Textarea value', { exact: true })).toHaveText('Hello\nworld');

    const events = Number(await input.getAttribute('data-input-events'));

    expect(events).toBeGreaterThan(0);
    await expect(page.getByLabel('Textarea changes', { exact: true }))
      .toHaveText(`${events}:${events}`);

    await page.getByRole('button', { name: 'Read textarea data' }).click();

    await expect(page.getByLabel('Textarea data', { exact: true })).toHaveText('Hello\nworld');

    await page.getByRole('button', { name: 'Replace textarea' }).click();

    await expect(input).toHaveValue('Parent\nreplacement');

    await page.getByRole('button', { name: 'Clear textarea' }).click();

    await expect(input).toHaveValue('');
  }
);

test(
  'TextArea respects maxlength for native typing and retains an oversized controlled value like upstream',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Description', exact: true });

    await input.fill('');
    await input.pressSequentially('a'.repeat(45));

    await expect(input).toHaveValue('a'.repeat(40));

    await page.getByRole('button', { name: 'Exceed textarea maximum' }).click();

    await expect(input).toHaveValue('x'.repeat(50));

    await page.getByLabel('Readonly textarea', { exact: true }).check();

    await expect(input).toHaveAttribute('readonly', '');

    await input.focus();
    await input.press('z');

    await expect(input).toHaveValue('x'.repeat(50));
  }
);

test(
  'TextArea retains native selection and skips Enter callbacks during IME composition',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Description', exact: true });

    await page.getByRole('button', { name: 'Select textarea text' }).click();

    await expect(input).toBeFocused();
    await expect(page.getByLabel('Textarea selection', { exact: true }))
      .toHaveText('Initial');

    await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });

    await expect(page.getByLabel('Textarea enters', { exact: true })).toHaveText('0');

    await input.press('End');
    await input.press('Enter');

    await expect(page.getByLabel('Textarea enters', { exact: true })).toHaveText('1');
    await expect(input).toHaveValue(/\n/);
  }
);

test(
  'TextArea inherits disabled and RTL while preserving explicit disabled false and status styling',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Description', exact: true });

    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(input).toBeDisabled();
    await expect(page.getByRole('textbox', { name: 'Enabled textarea', exact: true })).toBeEnabled();

    await page.getByLabel('Right to left', { exact: true }).check();

    await expect(input).toHaveCSS('direction', 'rtl');

    await page.getByRole('button', { name: 'Toggle textarea status' }).click();

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveClass(/ant-input-status-error/);

    await page.getByRole('button', { name: 'Toggle textarea status' }).click();

    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveClass(/ant-input-status-warning/);
  }
);

test(
  'TextArea integrates FormItem validation, descriptions, focus, blur and reset',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: '* Task description', exact: true });

    await expect(input).toHaveAttribute('required', '');

    await page.getByRole('button', { name: 'Validate textarea' }).click();

    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter description');

    await input.fill('Task\nnotes');
    await input.blur();
    await page.getByRole('button', { name: 'Validate textarea' }).click();

    await expect(input).not.toHaveAttribute('aria-invalid');

    await page.getByRole('button', { name: 'Reset textarea form' }).click();

    await expect(input).toHaveValue('');
  }
);

test(
  'TextArea default value edits remain local',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Default textarea', exact: true });

    await expect(input).toHaveValue('Default text');

    await input.fill('Local\nedit');

    await expect(input).toHaveValue('Local\nedit');
  }
);
