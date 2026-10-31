import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=input-password');

  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
});

test(
  'InputPassword composes Input affixes, refs, constraints and inherited size',
  async ({ page }) => {
    const root = page.locator('.password-field');
    const input = page.getByLabel('Password', { exact: true });
    const toggle = root.locator('.ant-input-password-icon');

    await expect(root).toHaveClass(/ant-input-password/);
    await expect(root).toHaveClass(/ant-input-affix-wrapper-lg/);
    await expect(root).not.toHaveClass(/ant-input-password-large/);
    await expect(root).toHaveClass(/base-input.*base-root.*context-root/);
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveAttribute('name', 'password');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).toHaveAttribute('maxlength', '24');
    await expect(input).toHaveAttribute('autocomplete', 'off');
    await expect(toggle).toHaveAccessibleName('Показать');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('type', 'button');
    await expect(toggle.locator('.anticon-eye-invisible svg path')).toHaveCount(2);
    await expect(page.getByLabel('Password refs', { exact: true })).toHaveText('INPUT:SPAN');
    expect(await root.locator('.ant-input-suffix > *').evaluateAll(elements =>
      elements.map(element =>
        [...element.classList].filter(name => name.startsWith('ant-input')).join(' ')
      )
    )).toEqual([
      'ant-input-clear-icon ant-input-clear-icon-has-suffix',
      'ant-input-show-count-suffix ant-input-show-count-has-suffix',
      'ant-input-password-icon'
    ]);
    await expect(root.locator('.ant-input-suffix')).toHaveText(/6 \/ 24\s*AFTER/);
  }
);

test('InputPassword keeps input focus, caret and value when clicked', async ({ page }) => {
  const input = page.getByLabel('Password', { exact: true });
  const toggle = page.locator('.password-field .ant-input-password-icon');

  await input.focus();
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(2, 2));
  await toggle.click();

  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element: HTMLInputElement) => [
    element.selectionStart,
    element.selectionEnd
  ]))
    .toEqual([2, 2]);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAccessibleName('Скрыть');
  await expect(toggle.locator('.anticon-eye svg path')).toHaveCount(1);
  await expect(input).toHaveValue('secret');

  await toggle.click();

  await expect(input).toHaveAttribute('type', 'password');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true|false');
});

for (const key of ['Enter', 'Space']) {
  test(
    `InputPassword toggles once for ${key} and ignores repeats without submitting`,
    async ({ page }) => {
      const input = page.getByLabel('Password', { exact: true });
      const toggle = page.locator('.password-field .ant-input-password-icon');

      await toggle.focus();
      await toggle.press(key);

      await expect(input).toHaveAttribute('type', 'text');
      await expect(toggle).toBeFocused();
      await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true');
      await expect(page.getByLabel('Password events', { exact: true })).toHaveText('');

      await toggle.dispatchEvent('keydown', { key: key === 'Space' ? ' ' : key, repeat: true });
      await toggle.dispatchEvent('keyup', { key: key === 'Space' ? ' ' : key });

      await expect(input).toHaveAttribute('type', 'text');
      await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true');

      await toggle.press(key);

      await expect(input).toHaveAttribute('type', 'password');
      await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true|false');
    }
  );
}

test(
  'InputPassword accepts controlled requests and does not notify for external updates',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });

    await page
      .getByRole('combobox', { name: 'Password visibility mode', exact: true })
      .selectOption('controlled');
    await page.locator('.password-field .ant-input-password-icon').click();

    await expect(input).toHaveAttribute('type', 'text');
    await expect(page.getByLabel('Parent password visible', { exact: true })).toBeChecked();
    await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true');

    await page.getByLabel('Parent password visible', { exact: true }).uncheck();

    await expect(input).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true');
  }
);

test(
  'InputPassword rejects controlled requests and retains the latest state when released',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const toggle = page.locator('.password-field .ant-input-password-icon');

    await page
      .getByRole('combobox', { name: 'Password visibility mode', exact: true })
      .selectOption('reject');
    await toggle.click();

    await expect(input).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true');

    await page.getByLabel('Parent password visible', { exact: true }).check();
    await page
      .getByRole('combobox', { name: 'Password visibility mode', exact: true })
      .selectOption('uncontrolled');

    await expect(input).toHaveAttribute('type', 'text');

    await toggle.click();

    await expect(input).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true|false');
  }
);

test(
  'InputPassword hides its toggle without resetting visibility or the suffix',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const root = page.locator('.password-field');

    await root.locator('.ant-input-password-icon').click();
    await page.getByLabel('Show password toggle', { exact: true }).uncheck();

    await expect(input).toHaveAttribute('type', 'text');
    await expect(root.locator('.ant-input-password-icon')).toHaveCount(0);
    await expect(root.locator('.ant-input-suffix')).toContainText('AFTER');

    await page.getByLabel('Show password toggle', { exact: true }).check();
    await root.locator('.ant-input-password-icon').click();

    await expect(input).toHaveAttribute('type', 'password');
  }
);

test(
  'InputPassword uses mouseover toggling for hover and keeps keyboard activation',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const toggle = page.locator('.password-field .ant-input-password-icon');

    // Смена SVG под указателем порождает новые mouseover и в React-эталоне.
    // Текстовая иконка изолирует здесь сам контракт hover/keyboard.
    await page.getByRole('combobox', { name: 'Password icon', exact: true }).selectOption('local');
    await page
      .getByRole('combobox', { name: 'Password action', exact: true })
      .selectOption('hover');
    await toggle.hover();

    await expect(input).toHaveAttribute('type', 'text');

    await page.getByRole('heading', { name: 'InputPassword', exact: true }).hover();

    await expect(input).toHaveAttribute('type', 'text');

    await toggle.hover();

    await expect(input).toHaveAttribute('type', 'password');

    await page.getByRole('heading', { name: 'InputPassword', exact: true }).hover();
    await toggle.focus();
    await toggle.press('Enter');

    await expect(input).toHaveAttribute('type', 'text');
    await expect(page.getByLabel('Visibility events', { exact: true }))
      .toHaveText('true|false|true');
  }
);

test('InputPassword toggles on bubbling mouseover from icon content', async ({ page }) => {
  const input = page.getByLabel('Password', { exact: true });
  const toggle = page.locator('.password-field .ant-input-password-icon');

  await page.getByRole('combobox', { name: 'Password action', exact: true }).selectOption('hover');
  await toggle.locator('svg').dispatchEvent('mouseover');

  await expect(input).toHaveAttribute('type', 'text');

  await toggle.locator('svg').dispatchEvent('mouseover');
  await toggle.dispatchEvent('click');

  await expect(input).toHaveAttribute('type', 'password');
  await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('true|false');
});

test(
  'InputPassword inherits disabled, permits a local override and keeps readonly visibility',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const toggle = page.locator('.password-field .ant-input-password-icon');

    await page.getByLabel('Disable all components', { exact: true }).check();
    await toggle.dispatchEvent('click');
    await toggle.dispatchEvent('keydown', { key: 'Enter' });

    await expect(input).toBeDisabled();
    await expect(toggle).toHaveAttribute('aria-disabled', 'true');
    await expect(toggle).toHaveAttribute('tabindex', '-1');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('');

    await page
      .getByRole('combobox', { name: 'Password disabled override', exact: true })
      .selectOption('false');
    await page.getByLabel('Password readonly', { exact: true }).check();
    await toggle.click();

    await expect(input).toBeEnabled();
    await expect(input).toHaveAttribute('readonly', '');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('tabindex', '0');
  }
);

test('InputPassword honors tabIndex without toggling on focus', async ({ page }) => {
  const toggle = page.locator('.password-field .ant-input-password-icon');

  await toggle.focus();

  await expect(toggle).toBeFocused();
  await expect(page.getByLabel('Visibility events', { exact: true })).toHaveText('');

  await page.getByLabel('Password toggle tab index', { exact: true }).fill('-1');
  await page.getByLabel('Password', { exact: true }).focus();
  await page.keyboard.press('Tab');

  await expect(page.locator('.password-field .ant-input-clear-icon')).toBeFocused();

  await page.keyboard.press('Tab');

  await expect(page.getByLabel('Inherited password config', { exact: true })).toBeFocused();
});

test(
  'InputPassword resolves local, context, snippet and empty icons in source order',
  async ({ page }) => {
    const toggle = page.locator('.password-field .ant-input-password-icon');

    await page.getByLabel('Context password icon', { exact: true }).check();

    await expect(toggle).toHaveText('CONTEXT CLOSED');

    await page.getByRole('combobox', { name: 'Password icon', exact: true }).selectOption('local');
    await toggle.click();

    await expect(toggle).toHaveText('LOCAL OPEN');

    await page
      .getByRole('combobox', { name: 'Password icon', exact: true })
      .selectOption('snippet');

    await expect(toggle.locator('strong')).toHaveText('Rich password icon');

    await page.getByRole('combobox', { name: 'Password icon', exact: true }).selectOption('empty');

    await expect(toggle).toHaveText('');
    await expect(toggle).toHaveAccessibleName('Скрыть');

    await toggle.press('Enter');

    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  }
);

test(
  'InputPassword preserves value binding, Input events, clear order and native FormData',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });

    await input.fill('changed');

    await expect(page.getByLabel('Password value', { exact: true })).toHaveText('changed');
    await expect(page.getByLabel('Password events', { exact: true })).toHaveText(
      'value:changed|change:change:changed|input'
    );

    await page.getByRole('button', { name: 'Read password FormData', exact: true }).click();

    await expect(page.getByLabel('Password FormData', { exact: true })).toHaveText('changed');

    await page.getByRole('button', { name: 'Replace password', exact: true }).click();

    await expect(input).toHaveValue('replacement');

    await page.locator('.password-field .ant-input-clear-icon').click();

    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(page.getByLabel('Password events', { exact: true })).toHaveText(
      'value:changed|change:change:changed|input|value:|change:click:|clear'
    );
  }
);

test(
  'InputPassword forwards focus, blur and selection methods through bind:this',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const selection = page.getByLabel('Password selection', { exact: true });

    for (const [cursor, expected] of [['start', '0:0'], ['end', '6:6'], ['all', '0:6']]) {
      await page.getByRole('button', { name: `Focus password ${cursor}`, exact: true }).click();

      await expect(input).toBeFocused();
      await expect(selection).toHaveText(expected);
    }

    await page.getByRole('button', { name: 'Set password selection', exact: true }).click();

    await expect(selection).toHaveText('1:3');

    await page.getByRole('button', { name: 'Select password', exact: true }).click();

    await expect(selection).toHaveText('0:6');
    await expect(page.getByLabel('Password select events', { exact: true })).not.toHaveText('0');

    await input.focus();
    await page.getByRole('button', { name: 'Blur password', exact: true }).click();

    await expect(input).not.toBeFocused();
  }
);

test(
  'InputPassword removes hidden value attributes after mount, input, focus, blur and hiding',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const toggle = page.locator('.password-field .ant-input-password-icon');

    await expect(input).not.toHaveAttribute('value');

    await input.fill('updated');

    await expect(input).not.toHaveAttribute('value');
    await expect(input).toHaveValue('updated');

    await input.evaluate(element => element.setAttribute('value', 'attribute'));
    await page.getByRole('button', { name: 'Blur password', exact: true }).click();

    await expect(input).not.toHaveAttribute('value');

    await input.evaluate(element => element.setAttribute('value', 'attribute'));
    await input.focus();

    await expect(input).not.toHaveAttribute('value');

    await toggle.click();

    await expect(input).toHaveAttribute('value', 'updated');

    await toggle.click();

    await expect(input).not.toHaveAttribute('value');
    await expect(input).toHaveValue('updated');
  }
);

test(
  'InputPassword cancels deferred cleanup after unmount and releases both native refs',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });

    await page.locator('.password-field .ant-input-password-icon').click();
    await expect(input).toHaveAttribute('value', 'secret');
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.locator('.password-field .ant-input-password-icon').click();
    await page.getByLabel('Mount password', { exact: true }).uncheck();
    await page.clock.runFor(100);

    await expect(input).toHaveCount(0);
    await expect(page.getByLabel('Password refs', { exact: true })).toHaveText(':');

    await page.getByLabel('Mount password', { exact: true }).check();
    await page.clock.runFor(100);

    await expect(input).toHaveValue('secret');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).not.toHaveAttribute('value');
    await expect(page.getByLabel('Password refs', { exact: true })).toHaveText('INPUT:SPAN');
  }
);

test(
  'InputPassword merges semantic styles and config variants without losing Input config',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const root = page.locator('.password-field');

    await expect(root).toHaveClass(/ant-input-underlined/);

    await page.getByLabel('Password semantics', { exact: true }).check();

    await expect(root).toHaveClass(/local-underlined/);
    await expect(root).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(input).toHaveClass(/base-field.*context-field.*local-field/);
    await expect(input).toHaveCSS('color', 'rgb(0, 255, 255)');

    await page.getByLabel('Password component config', { exact: true }).uncheck();

    await expect(root).toHaveClass(/ant-input-filled/);

    await page.getByLabel('Password bordered', { exact: true }).uncheck();

    await expect(root).toHaveClass(/ant-input-borderless/);

    await page
      .getByRole('combobox', { name: 'Password variant', exact: true })
      .selectOption('outlined');
    await page.getByRole('combobox', { name: 'Password size', exact: true }).selectOption('small');
    await page.getByLabel('Password addons', { exact: true }).check();

    await expect(root).toHaveClass(/ant-input-group-wrapper-outlined/);
    await expect(root).toHaveClass(/ant-input-password-small/);
    await expect(root.locator('.ant-input-affix-wrapper'))
      .toHaveClass(/ant-input-affix-wrapper-sm/);
    await expect(root).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(input).toHaveAttribute('name', 'password');
    await expect(page.getByLabel('Password refs', { exact: true })).toHaveText('INPUT:SPAN');
  }
);

test(
  'InputPassword inherits nested config and partially merged global locale',
  async ({ page }) => {
    const inherited = page.getByLabel('Inherited password config', { exact: true }).locator('..');
    const replaced = page.getByLabel('Replaced password config', { exact: true }).locator('..');

    await expect(inherited).toHaveClass(/ant-input-underlined.*password-context/);
    await expect(replaced).toHaveClass(/ant-input-borderless/);
    await expect(replaced).not.toHaveClass(/password-context/);
    await expect(replaced.locator('.ant-input-password-icon')).toHaveAccessibleName('Reveal');

    await replaced.locator('.ant-input-password-icon').click();

    await expect(replaced.locator('.ant-input-password-icon')).toHaveAccessibleName('Скрыть');

    await page.getByLabel('English locale', { exact: true }).check();

    await expect(page.locator('.password-field .ant-input-password-icon'))
      .toHaveAccessibleName('Show');
    await expect(replaced.locator('.ant-input-password-icon')).toHaveAccessibleName('Hide');
  }
);

test(
  'InputPassword keeps FormItem errors, Compact size, disabled and reset behavior',
  async ({ page }) => {
    const input = page.getByLabel('Form password', { exact: true });
    const root = input.locator('..');

    await expect(input).toHaveAttribute('name', 'password');
    await expect(root).toHaveClass(/ant-input-affix-wrapper-sm/);
    await expect(root).not.toHaveClass(/ant-input-password-small/);

    await page.getByRole('button', { name: 'Validate password', exact: true }).click();

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Password required', { exact: true })).toBeVisible();

    await input.fill('valid');
    await page.getByRole('button', { name: 'Reset password', exact: true }).click();

    await expect(input).toHaveValue('');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel('Disable password form', { exact: true }).check();

    await expect(input).toBeDisabled();
    await expect(root.locator('.ant-input-password-icon')).toHaveAttribute('tabindex', '-1');
  }
);

test(
  'InputPassword keeps RTL, dark and compact themes with a visible keyboard focus',
  async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true });
    const toggle = page.locator('.password-field .ant-input-password-icon');

    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Dark password theme', { exact: true }).check();
    await page.getByLabel('Compact password theme', { exact: true }).check();
    await page
      .getByRole('combobox', { name: 'Password variant', exact: true })
      .selectOption('outlined');

    await expect(input).toHaveCSS('direction', 'rtl');
    await expect(page.locator('.password-field')).toHaveClass(/ant-input-affix-wrapper-rtl/);
    await expect(page.locator('.password-field .ant-input-show-count-suffix'))
      .toHaveCSS('direction', 'ltr');

    await toggle.focus();
    await toggle.press('Enter');

    await expect(toggle).toBeFocused();
    await expect(toggle).not.toHaveCSS('outline-style', 'none');
    await expect(input).toHaveAttribute('type', 'text');
  }
);
