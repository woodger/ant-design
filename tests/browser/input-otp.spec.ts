import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=input-otp');

  await expect(page.getByRole('group', { name: 'Verification code', exact: true })).toBeVisible();
});

test(
  'InputOTP renders source cells and keeps root attributes outside the inputs',
  async ({ page }) => {
    const root = page.locator('.otp-field');
    const inputs = root.locator('input');

    await expect(inputs).toHaveCount(6);
    await expect(inputs.first()).toHaveAccessibleName('OTP Input 1');
    await expect(inputs.last()).toHaveAccessibleName('OTP Input 6');
    await expect(inputs.first()).toHaveAttribute('size', '1');
    await expect(inputs.first()).not.toHaveAttribute('maxlength');
    await expect(inputs.first()).not.toHaveAttribute('name');
    await expect(inputs.first()).not.toHaveAttribute('data-identity');
    await expect(inputs.first()).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(inputs.first()).toHaveAttribute('inputmode', 'numeric');
    await expect(inputs.first()).toHaveClass(/ant-input-underlined/);
    await expect(root).toHaveAttribute('data-identity', 'otp-root');
    await expect(root).toHaveClass(/otp-owner.*otp-context.*context-root/);
    await expect(page.getByLabel('OTP ref', { exact: true })).toHaveText('DIV');
  }
);

test(
  'InputOTP fills sequentially and reports input before the completed code',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await inputs.first().focus();
    await page.keyboard.type('123456');

    await expect(inputs.last()).toBeFocused();
    expect(await inputs.evaluateAll((elements: HTMLInputElement[]) => elements.map(e => e.value)))
      .toEqual(['1', '2', '3', '4', '5', '6']);
    await expect(page.getByLabel('OTP events', { exact: true })).toHaveText(
      'input:["1"]|input:["1","2"]|input:["1","2","3"]|input:["1","2","3","4"]|input:["1","2","3","4","5"]|input:["1","2","3","4","5","6"]|change:123456'
    );
    await expect(page.getByLabel('OTP native input events', { exact: true })).toHaveText('6');

    await inputs.last().dispatchEvent('input');

    await expect(page.getByLabel('OTP events', { exact: true }))
      .toHaveText(/change:123456\|input:\["1","2","3","4","5","6"\]$/);
  }
);

for (const text of ['123 456', '123-456', '1 2 3 4 5 6']) {
  test(
    `InputOTP formats multi-character native input before clipping: ${text}`,
    async ({ page }) => {
      await page
        .getByRole('combobox', { name: 'OTP formatter', exact: true })
        .selectOption('digits');
      await page.getByLabel('OTP length', { exact: true }).fill('4');
      const inputs = page.locator('.otp-field input');

      await inputs.first().fill(text);

      expect(await inputs.evaluateAll((elements: HTMLInputElement[]) => elements.map(e => e.value)))
        .toEqual(['1', '2', '3', '4']);
      await expect(inputs.last()).toBeFocused();
      await expect(page.getByLabel('OTP events', { exact: true }))
        .toHaveText('input:["1","2","3","4"]|change:1234');
    }
  );
}

test(
  'InputOTP preserves a prefix and focuses the first empty cell after filtered input',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await page.getByRole('combobox', { name: 'OTP formatter', exact: true }).selectOption('digits');
    await inputs.first().fill('12');

    await expect(inputs.nth(2)).toBeFocused();

    await inputs.nth(2).fill('3a4');

    await expect(inputs.nth(4)).toBeFocused();
    expect(await inputs.evaluateAll((elements: HTMLInputElement[]) => elements.map(e => e.value)))
      .toEqual(['1', '2', '3', '4', '', '']);

    await inputs.nth(4).fill('56');

    await expect(page.getByLabel('OTP events', { exact: true })).toHaveText(
      'input:["1","2"]|input:["1","2","3","4"]|input:["1","2","3","4","5","6"]|change:123456'
    );
  }
);

test(
  'InputOTP restores a rejected character and a replacement with an unchanged prefix',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await page.getByRole('combobox', { name: 'OTP formatter', exact: true }).selectOption('digits');
    await inputs.first().fill('abc');

    await expect(inputs.first()).toHaveValue('');
    await expect(inputs.first()).toBeFocused();

    await inputs.first().fill('12');
    await inputs.first().fill('1234');

    expect(await inputs.evaluateAll((elements: HTMLInputElement[]) => elements.map(e => e.value)))
      .toEqual(['1', '2', '3', '4', '', '']);
    await expect(inputs.nth(4)).toBeFocused();
  }
);

test(
  'InputOTP prevents skipping empty cells and uses physical arrow indices in RTL',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await inputs.nth(3).focus();

    await expect(inputs.first()).toBeFocused();

    await inputs.first().press('ArrowRight');

    await expect(inputs.first()).toBeFocused();

    await inputs.first().fill('12');
    await page.getByLabel('Right to left', { exact: true }).check();
    await inputs.first().focus();
    await inputs.first().press('ArrowRight');

    await expect(inputs.nth(1)).toBeFocused();

    await inputs.nth(1).press('ArrowLeft');

    await expect(inputs.first()).toBeFocused();
  }
);

test(
  'InputOTP selects a focused cell for replacement and deletes backwards through empty cells',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await inputs.first().fill('123456');
    await inputs.nth(1).focus();

    await expect.poll(() => inputs.nth(1).evaluate((e: HTMLInputElement) =>
      [e.selectionStart, e.selectionEnd]
    )).toEqual([0, 1]);

    await page.keyboard.type('8');

    await expect(inputs.nth(1)).toHaveValue('8');
    await expect(inputs.nth(2)).toBeFocused();

    await inputs.last().fill('');
    await inputs.last().press('Backspace');

    await expect(inputs.nth(4)).toBeFocused();
    await expect(inputs.nth(4)).toHaveValue('');
    expect(await page.getByLabel('OTP events', { exact: true }).evaluate(output =>
      output.textContent?.split('|').filter(event => event.startsWith('change:'))
    )).toEqual(['change:123456', 'change:183456']);
  }
);

test(
  'InputOTP reports sparse cells and does not delay input until compositionend',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await inputs.nth(5).dispatchEvent('compositionstart');
    await inputs.nth(5).evaluate((input: HTMLInputElement) => {
      input.value = 'A';
      input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    });

    await expect(page.getByLabel('OTP events', { exact: true }))
      .toHaveText('input:["","","","","","A"]');

    await inputs.nth(5).dispatchEvent('compositionend');

    await expect(page.getByLabel('OTP events', { exact: true }))
      .toHaveText('input:["","","","","","A"]');
  }
);

test(
  'InputOTP blocks lowercase Ctrl and Meta undo but leaves other shortcuts native',
  async ({ page }) => {
    const first = page.locator('.otp-field input').first();
    const outcomes = await first.evaluate(input => {
      const checks = [
        { key: 'z', ctrlKey: true },
        { key: 'z', metaKey: true },
        { key: 'a', ctrlKey: true }
      ];
      return checks.map(options => {
        const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...options });
        input.dispatchEvent(event);
        return event.defaultPrevented;
      });
    });

    expect(outcomes).toEqual([true, true, false]);
  }
);

test(
  'InputOTP freezes defaultValue and synchronizes external value without formatting it',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await page.getByLabel('OTP default value', { exact: true }).fill('ab');

    await expect(inputs.first()).toHaveValue('');

    await page.getByRole('combobox', { name: 'OTP formatter', exact: true }).selectOption('upper');
    await page.getByLabel('Mount OTP', { exact: true }).uncheck();
    await page.getByLabel('Mount OTP', { exact: true }).check();

    await expect(inputs.first()).toHaveValue('A');
    await expect(inputs.nth(1)).toHaveValue('B');

    await page.getByRole('combobox', { name: 'OTP mode', exact: true }).selectOption('external');
    await page.getByLabel('OTP external value', { exact: true }).fill('xy');

    await expect(inputs.first()).toHaveValue('x');
    await expect(inputs.nth(1)).toHaveValue('y');
    await expect(page.getByLabel('OTP events', { exact: true })).toHaveText('');

    await inputs.first().fill('z');

    await expect(inputs.first()).toHaveValue('Z');
    await expect(inputs.nth(1)).toHaveValue('Y');
    await expect(page.getByLabel('OTP external value', { exact: true })).toHaveValue('xy');

    await page.getByLabel('OTP external value', { exact: true }).fill('12345678');
    await page.getByLabel('OTP length', { exact: true }).fill('8');

    await expect(inputs.last()).toHaveValue('8');
  }
);

test(
  'InputOTP links completion and retains local cells when external control is removed',
  async ({ page }) => {
    const inputs = page.locator('.otp-field input');

    await page.getByRole('combobox', { name: 'OTP mode', exact: true }).selectOption('linked');
    await inputs.first().fill('654321');

    await expect(page.getByLabel('OTP external value', { exact: true })).toHaveValue('654321');

    await page.getByRole('combobox', { name: 'OTP mode', exact: true }).selectOption('local');

    await expect(inputs.first()).toHaveValue('6');
    await expect(inputs.last()).toHaveValue('1');
  }
);

test(
  'InputOTP overlays mask characters and preserves actual values and explicit types',
  async ({ page }) => {
    const root = page.locator('.otp-field');
    const first = root.locator('input').first();

    await first.fill('12');
    await page.getByRole('combobox', { name: 'OTP mask', exact: true }).selectOption('bullet');

    await expect(root.locator('.ant-otp-mask-icon')).toHaveText(['•', '•']);
    await expect(first).toHaveValue('1');
    await expect(first).toHaveAttribute('type', 'password');
    await expect(first).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await expect(root.locator('.ant-otp-mask-icon').first()).toHaveAttribute('aria-hidden', 'true');

    await page.getByRole('combobox', { name: 'OTP mask', exact: true }).selectOption('emoji');

    await expect(root.locator('.ant-otp-mask-icon')).toHaveText(['🔒', '🔒']);

    await page.getByRole('combobox', { name: 'OTP type', exact: true }).selectOption('number');
    await first.focus();

    await expect(first).toHaveAttribute('type', 'number');
    await expect(first).toHaveValue('1');
  }
);

test(
  'InputOTP renders numeric and rich separators and removes them for empty content',
  async ({ page }) => {
    const root = page.locator('.otp-field');

    await page.getByRole('combobox', { name: 'OTP separator', exact: true }).selectOption('zero');

    await expect(root.locator('.ant-otp-separator')).toHaveText(['0', '0', '0', '0', '0']);

    await page
      .getByRole('combobox', { name: 'OTP separator', exact: true })
      .selectOption('indexed');

    await expect(root.locator('.ant-otp-separator')).toHaveText(['0', '1', '2', '3', '4']);

    await page.getByRole('combobox', { name: 'OTP separator', exact: true }).selectOption('rich');

    await expect(root.locator('.ant-otp-separator strong'))
      .toHaveText(['/0/', '/1/', '/2/', '/3/', '/4/']);

    await page.getByRole('combobox', { name: 'OTP separator', exact: true }).selectOption('empty');

    await expect(root.locator('.ant-otp-separator')).toHaveCount(0);
  }
);

test(
  'InputOTP resolves variants and semantic classes and styles without replacing Input config',
  async ({ page }) => {
    const root = page.locator('.otp-field');
    const first = root.locator('input').first();

    await page
      .getByRole('combobox', { name: 'Context OTP variant', exact: true })
      .selectOption('filled');
    await page.getByRole('combobox', { name: 'OTP variant', exact: true }).selectOption('outlined');
    await page.getByRole('combobox', { name: 'OTP separator', exact: true }).selectOption('dash');
    await page.getByLabel('OTP semantics', { exact: true }).check();

    await expect(root).toHaveClass(/local-outlined-6/);
    await expect(first).toHaveClass(/input-context/);
    await expect(first).toHaveClass(/context-cell/);
    await expect(first).toHaveClass(/local-cell/);
    await expect(first).toHaveClass(/ant-input-outlined/);
    await expect(root).toHaveCSS('color', 'rgb(128, 0, 128)');
    await expect(first).toHaveCSS('color', 'rgb(0, 255, 255)');
    await expect(root.locator('.ant-otp-separator').first()).toHaveCSS('color', 'rgb(0, 0, 255)');

    await page.getByLabel('OTP autocomplete', { exact: true }).uncheck();

    await expect(first).toHaveAttribute('autocomplete', 'off');

    await expect(page.getByRole('group', { name: 'Inherited OTP config', exact: true }))
      .toHaveClass(/otp-context/);
    await expect(page.getByRole('group', { name: 'Replaced OTP config', exact: true }))
      .not.toHaveClass(/otp-context/);
  }
);

test('InputOTP inherits disabled and allows an explicit false override', async ({ page }) => {
  const first = page.locator('.otp-field input').first();

  await page.getByLabel('Disable all components', { exact: true }).check();

  await expect(first).toBeDisabled();

  await page
    .getByRole('combobox', { name: 'OTP disabled override', exact: true })
    .selectOption('false');

  await expect(first).toBeEnabled();

  await first.fill('1');

  await expect(first).toHaveValue('1');
});

test(
  'InputOTP keeps a cell value when a clear control is inherited from Input config',
  async ({ page }) => {
    const root = page.locator('.otp-field');

    await root.locator('input').first().fill('12');
    await page.getByLabel('Inherit OTP clear controls', { exact: true }).check();
    await page.getByRole('button', { name: 'Clear OTP events', exact: true }).click();
    await root.locator('.ant-input-clear-icon').first().click();

    await expect(root.locator('input').first()).toHaveValue('1');
    await expect(page.getByLabel('OTP events', { exact: true })).toHaveText('');
  }
);

test(
  'InputOTP forwards focus and blur refs and cancels selection frames after unmount',
  async ({ page }) => {
    const first = page.locator('.otp-field input').first();

    await page.getByRole('button', { name: 'Focus OTP', exact: true }).click();

    await expect(first).toBeFocused();

    await page.getByRole('button', { name: 'Blur OTP', exact: true }).click();

    await expect(first).not.toBeFocused();

    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    await page.getByRole('button', { name: 'Clear OTP selections', exact: true }).click();
    await first.focus();
    await page.getByLabel('Mount OTP', { exact: true }).uncheck();
    await page.clock.runFor(100);

    await expect(first).toHaveCount(0);
    await expect(page.getByLabel('OTP ref', { exact: true })).toHaveText('');
    await expect(page.getByLabel('OTP select events', { exact: true })).toHaveText('0');
  }
);

test('InputOTP autofocuses its first cell on mount', async ({ page }) => {
  await page.getByLabel('Autofocus OTP', { exact: true }).check();
  await page.getByLabel('Mount OTP', { exact: true }).uncheck();
  await page.getByLabel('Mount OTP', { exact: true }).check();

  await expect(page.locator('.otp-field input').first()).toBeFocused();
});

test(
  'InputOTP keeps FormItem association on the group and clears partial input on reset',
  async ({ page }) => {
    const group = page.getByRole('group', { name: 'Form code', exact: true });
    const inputs = group.locator('input');

    await expect(inputs.first()).not.toHaveAttribute('id');
    await expect(inputs.first()).not.toHaveAttribute('name');
    await expect(inputs.first()).not.toHaveAttribute('required');

    await page.getByRole('button', { name: 'Validate OTP', exact: true }).click();

    await expect(page.getByText('OTP required', { exact: true })).toBeVisible();
    await expect(inputs.first()).toBeFocused();
    await expect(group).toHaveAttribute('aria-describedby');

    await inputs.first().fill('1');
    await page.getByRole('button', { name: 'Reset OTP', exact: true }).click();

    await expect(inputs.first()).toHaveValue('');
    await expect(page.getByLabel('OTP form value', { exact: true })).toHaveText('');

    await inputs.first().fill('123456');

    await expect(page.getByLabel('OTP form value', { exact: true })).toHaveText('123456');

    await page.getByLabel('Disable OTP form', { exact: true }).check();

    await expect(inputs.first()).toBeDisabled();
  }
);

test(
  'InputOTP preserves source padding sizes and independent Compact inheritance in themes',
  async ({ page }) => {
    const root = page.locator('.otp-field');
    const first = root.locator('input').first();
    const compactGroup = page.getByRole('group', { name: 'Compact OTP', exact: true });

    await expect(compactGroup).not.toHaveClass(/ant-otp-sm/);
    await expect(compactGroup.locator('input').first()).toHaveClass(/ant-input-sm/);

    for (const [size, padding] of [['small', '2px'], ['medium', '4px'], ['large', '8px']]) {
      await page.getByRole('combobox', { name: 'OTP size', exact: true }).selectOption(size);

      await expect(first).toHaveCSS('padding-inline-start', padding);
    }

    await page
      .getByRole('combobox', { name: 'Context OTP size', exact: true })
      .selectOption('large');

    await expect(compactGroup).toHaveClass(/ant-otp-lg/);
    await expect(compactGroup.locator('input').first()).toHaveClass(/ant-input-lg/);

    await page.getByLabel('Dark OTP theme', { exact: true }).check();
    await page.getByLabel('Compact OTP theme', { exact: true }).check();
    await page.getByLabel('Right to left', { exact: true }).check();

    await expect(root).toHaveClass(/ant-otp-rtl/);
    await expect(root).toHaveCSS('direction', 'rtl');
    await expect(first).toHaveCSS('font-size', '14px');
    await expect(first).not.toHaveCSS('color', 'rgb(0, 0, 0)');
  }
);
