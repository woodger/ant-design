import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=input-search');

  await expect(page.getByLabel('Search query', { exact: true })).toBeVisible();
});

test(
  'InputSearch composes Compact items and keeps root props separate from Input',
  async ({ page }) => {
    const root = page.locator('.search-field');
    const input = page.getByLabel('Search query', { exact: true });
    const button = root.locator('.ant-input-search-btn');

    await expect(root).toHaveClass(/ant-space-compact/);
    await expect(root).toHaveClass(/search-context.*context-root/);
    await expect(root).toHaveAttribute('data-identity', 'search-root');
    await expect(input).not.toHaveAttribute('data-identity');
    await expect(input).toHaveAttribute('type', 'search');
    await expect(input).toHaveAttribute('name', 'query');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).toHaveAttribute('maxlength', '24');
    await expect(input).toHaveAttribute('autocomplete', 'off');
    await expect(input.locator('..')).toHaveClass(/ant-input-compact-first-item/);
    await expect(input.locator('..')).toHaveClass(/search-input-owner/);
    await expect(button).toHaveClass(/ant-btn-compact-last-item/);
    await expect(button).toHaveClass(/ant-btn-icon-only/);
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAccessibleName('Поиск');
    await expect(button).toHaveCSS('width', '32px');
    await expect(page.getByLabel('Search refs', { exact: true })).toHaveText('INPUT:SPAN');
  }
);

test(
  'InputSearch preserves focus on pointer search and reads the latest native value',
  async ({ page }) => {
    const input = page.getByLabel('Search query', { exact: true });
    const button = page.locator('.search-field .ant-input-search-btn');

    await input.fill('latest');
    await page.getByRole('button', { name: 'Clear search events', exact: true }).click();
    await input.focus();
    await button.click();

    await expect(input).toBeFocused();
    await expect(page.getByLabel('Search events', { exact: true }))
      .toHaveText('search:input:click:latest');

    await page.getByRole('button', { name: 'Replace search value', exact: true }).click();
    await button.click();

    await expect(page.getByLabel('Search events', { exact: true }))
      .toHaveText('search:input:click:latest|search:input:click:replacement');
  }
);

test(
  'InputSearch emits enter before search and ignores locked or composing Enter',
  async ({ page }) => {
    const input = page.getByLabel('Search query', { exact: true });
    const events = page.getByLabel('Search events', { exact: true });

    await input.focus();
    await input.dispatchEvent('compositionstart');
    await input.dispatchEvent('keydown', { key: 'Enter' });
    await input.dispatchEvent('keyup', { key: 'Enter' });

    await expect(events).toHaveText('');

    await input.dispatchEvent('compositionend');
    await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
    await input.dispatchEvent('keyup', { key: 'Enter' });

    await expect(events).toHaveText('');

    await input.dispatchEvent('keydown', { key: 'Enter' });
    await input.dispatchEvent('keydown', { key: 'Enter', repeat: true });

    await expect(events).toHaveText('enter|search:input:keydown:query');

    await input.dispatchEvent('keyup', { key: 'Enter' });
    await input.press('Enter');

    await expect(events).toHaveText(
      'enter|search:input:keydown:query|enter|search:input:keydown:query'
    );
  }
);

test(
  'InputSearch reports clear before change while preserving Input callbacks',
  async ({ page }) => {
    const input = page.getByLabel('Search query', { exact: true });

    await input.fill('edited');

    await expect(page.getByLabel('Search value', { exact: true })).toHaveText('edited');
    await expect(page.getByLabel('Search events', { exact: true }))
      .toHaveText('value:edited|change:change:edited|input');

    await page.locator('.search-field .ant-input-clear-icon').click();

    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(page.getByLabel('Search events', { exact: true })).toHaveText(
      'value:edited|change:change:edited|input|value:|search:clear:click:|change:click:|clear'
    );
  }
);

test(
  'InputSearch blocks button and Enter during loading but still searches on clear',
  async ({ page }) => {
    const input = page.getByLabel('Search query', { exact: true });
    const button = page.locator('.search-field .ant-input-search-btn');

    await page.getByLabel('Search loading', { exact: true }).check();
    await input.press('Enter');

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByLabel('Search events', { exact: true })).toHaveText('');

    await page.locator('.search-field .ant-input-clear-icon').click();

    await expect(page.getByLabel('Search events', { exact: true }))
      .toHaveText('value:|search:clear:click:|change:click:|clear');

    await page.getByLabel('Search loading', { exact: true }).uncheck();
    await input.press('Enter');

    await expect(page.getByLabel('Search events', { exact: true }))
      .toHaveText('value:|search:clear:click:|change:click:|clear|enter|search:input:keydown:');
  }
);

test('InputSearch supports icon primary and text enter buttons', async ({ page }) => {
  const button = page.locator('.search-field .ant-input-search-btn');

  await expect(button).toHaveClass(/ant-btn-color-default/);
  await expect(page.locator('.search-field')).not.toHaveClass(/ant-input-search-with-button/);

  await page
    .getByRole('combobox', { name: 'Search button mode', exact: true })
    .selectOption('primary');

  await expect(button).toHaveClass(/ant-btn-color-primary/);
  await expect(button).toHaveClass(/ant-btn-variant-solid/);
  await expect(button.locator('svg')).toHaveCount(1);

  await page
    .getByRole('combobox', { name: 'Search button mode', exact: true })
    .selectOption('text');

  await expect(button).toHaveAccessibleName('Find');
  await expect(button).not.toHaveClass(/ant-btn-icon-only/);
  await expect(button.locator('svg')).toHaveCount(0);
  await expect(page.locator('.search-field')).toHaveClass(/ant-input-search-with-button/);
});

for (const mode of ['custom', 'native']) {
  test(
    `InputSearch merges ${mode} button handlers before search and retains input focus`,
    async ({ page }) => {
      const input = page.getByLabel('Search query', { exact: true });

      await page
        .getByRole('combobox', { name: 'Search button mode', exact: true })
        .selectOption(mode);
      await input.focus();
      await page.locator(`.${mode}-search-button`).click();

      await expect(input).toBeFocused();
      await expect(page.getByLabel('Search events', { exact: true }))
        .toHaveText(`${mode}-down:false|${mode}-click|search:input:click:query`);
    }
  );

  test(
    `InputSearch retains ${mode} disabled and combines it with context disabled and loading`,
    async ({ page }) => {
      await page
        .getByRole('combobox', { name: 'Search button mode', exact: true })
        .selectOption(mode);
      const button = page.locator(`.${mode}-search-button`);

      await page.getByLabel('Custom search disabled', { exact: true }).check();

      await expect(button).toBeDisabled();

      await page.getByLabel('Custom search disabled', { exact: true }).uncheck();
      await page.getByLabel('Disable all components', { exact: true }).check();

      await expect(button).toBeDisabled();

      await page
        .getByRole('combobox', { name: 'Search disabled override', exact: true })
        .selectOption('false');

      await expect(button).toBeEnabled();

      await page.getByLabel('Search loading', { exact: true }).check();

      await expect(button).toBeDisabled();

      await page.getByLabel('Search loading', { exact: true }).uncheck();

      await expect(button).toBeEnabled();
    }
  );
}

test('InputSearch retains custom Button loading and its own semantic styles', async ({ page }) => {
  await page
    .getByRole('combobox', { name: 'Search button mode', exact: true })
    .selectOption('custom');
  await page.getByLabel('Search semantics', { exact: true }).check();
  const button = page.locator('.custom-search-button');

  await expect(button).toHaveClass(/ant-input-search-btn/);
  await expect(button).toHaveClass(/own-button-root/);
  await expect(button).not.toHaveClass(/semantic-button|context-button/);

  await page.getByLabel('Custom search loading', { exact: true }).check();

  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-busy', 'true');
});

test(
  'InputSearch resolves local and context search icons and preserves explicit empty content',
  async ({ page }) => {
    const button = page.locator('.search-field .ant-input-search-btn');

    await page.getByLabel('Context search icon', { exact: true }).check();

    await expect(button).toHaveText('Context search icon');

    await page.getByRole('combobox', { name: 'Search icon', exact: true }).selectOption('custom');

    await expect(button).toHaveText('Local search icon');

    await page.getByRole('combobox', { name: 'Search icon', exact: true }).selectOption('empty');

    await expect(button.locator('.ant-btn-icon')).toHaveCount(0);
    await expect(button).toHaveText('');
    await expect(button).toHaveAccessibleName('Поиск');
  }
);

test(
  'InputSearch keeps Input variant fallback separate from the button variant',
  async ({ page }) => {
    const root = page.locator('.search-field');
    const inputRoot = page.getByLabel('Search query', { exact: true }).locator('..');
    const button = root.locator('.ant-input-search-btn');

    await expect(inputRoot).toHaveClass(/ant-input-filled/);
    await expect(button).toHaveClass(/ant-btn-variant-outlined/);
    await expect(button).not.toHaveClass(/ant-input-search-btn-filled/);

    await page
      .getByRole('combobox', { name: 'Context search variant', exact: true })
      .selectOption('filled');

    await expect(button).toHaveClass(/ant-input-search-btn-filled/);
    await expect(button).toHaveClass(/ant-btn-variant-text/);

    await page.getByLabel('Search bordered', { exact: true }).uncheck();

    await expect(inputRoot).toHaveClass(/ant-input-borderless/);
    await expect(button).toHaveClass(/ant-input-search-btn-borderless/);

    await page
      .getByRole('combobox', { name: 'Search variant', exact: true })
      .selectOption('outlined');

    await expect(inputRoot).toHaveClass(/ant-input-outlined/);
    await expect(button).toHaveClass(/ant-input-search-btn-outlined/);
    await expect(button).toHaveClass(/ant-btn-variant-outlined/);
  }
);

test(
  'InputSearch applies root input and nested button semantic styles independently',
  async ({ page }) => {
    const root = page.locator('.search-field');
    const input = page.getByLabel('Search query', { exact: true });
    const button = root.locator('.ant-input-search-btn');

    await page.getByLabel('Search semantics', { exact: true }).check();

    await expect(root).toHaveClass(/local-icon-only/);
    await expect(root).toHaveCSS('color', 'rgb(128, 0, 128)');
    await expect(input).toHaveClass(/semantic-search-input/);
    await expect(input).toHaveCSS('color', 'rgb(0, 255, 255)');
    await expect(button).toHaveClass(/context-button.*semantic-button/);
    await expect(button).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(button.locator('.ant-btn-icon')).toHaveClass(/semantic-button-icon/);

    await page
      .getByRole('combobox', { name: 'Search button mode', exact: true })
      .selectOption('text');

    await expect(root).toHaveClass(/local-with-button/);
  }
);

test(
  'InputSearch inherits and replaces its component config without losing Input config',
  async ({ page }) => {
    const inherited = page.getByLabel('Inherited search config', { exact: true }).locator('..');
    const replaced = page.getByLabel('Replaced search config', { exact: true }).locator('..');

    await expect(inherited).toHaveClass(/search-context/);
    await expect(replaced).not.toHaveClass(/search-context/);
    await expect(replaced.locator('button')).toHaveText('Replaced search icon');
    await expect(replaced.locator('input')).toHaveAttribute('autocomplete', 'off');
  }
);

test(
  'InputSearch forwards Input refs and methods and preserves native form submission values',
  async ({ page }) => {
    const input = page.getByLabel('Search query', { exact: true });

    await page.getByRole('button', { name: 'Focus search all', exact: true }).click();

    await expect(input).toBeFocused();
    await expect(page.getByLabel('Search selection', { exact: true })).toHaveText('0:5');

    await page.getByRole('button', { name: 'Set search selection', exact: true }).click();

    await expect(page.getByLabel('Search selection', { exact: true })).toHaveText('1:3');

    await page.getByRole('button', { name: 'Select search text', exact: true }).click();

    await expect(page.getByLabel('Search selection', { exact: true })).toHaveText('0:5');

    await input.focus();
    await page.getByRole('button', { name: 'Blur search', exact: true }).click();

    await expect(input).not.toBeFocused();

    await input.fill('form-value');
    await page.getByRole('button', { name: 'Read search FormData', exact: true }).click();

    await expect(page.getByLabel('Search FormData', { exact: true })).toHaveText('form-value');

    await page.getByLabel('Mount search', { exact: true }).uncheck();

    await expect(page.getByLabel('Search refs', { exact: true })).toHaveText(':');
  }
);

test(
  'InputSearch places addonAfter after the search button and updates Compact boundaries',
  async ({ page }) => {
    const root = page.locator('.search-field');
    const button = root.locator('.ant-input-search-btn');

    await page.getByLabel('Search trailing addon', { exact: true }).check();

    await expect(button).not.toHaveClass(/ant-btn-compact-last-item/);
    await expect(root.locator('.ant-space-addon')).toHaveText('AFTER');
    expect(await button.evaluate(element => element.nextElementSibling?.textContent)).toBe('AFTER');

    await page.getByLabel('Search trailing addon', { exact: true }).uncheck();

    await expect(button).toHaveClass(/ant-btn-compact-last-item/);
  }
);

test(
  'InputSearch retains FormItem validation reset disabled and Compact size',
  async ({ page }) => {
    const input = page.getByLabel('Form query', { exact: true });
    const search = input.locator('..');

    await expect(search).toHaveClass(/ant-input-search-small/);
    await expect(input).toHaveClass(/ant-input-sm/);

    await page.getByRole('button', { name: 'Validate query', exact: true }).click();

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Query required', { exact: true })).toBeVisible();

    await input.fill('valid');
    await page.getByRole('button', { name: 'Reset query', exact: true }).click();

    await expect(input).toHaveValue('');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel('Disable search form', { exact: true }).check();

    await expect(input).toBeDisabled();
    await expect(search.locator('.ant-input-search-btn')).toBeDisabled();
  }
);

test(
  'InputSearch keeps button and input heights aligned across sizes RTL and themes',
  async ({ page }) => {
    const root = page.locator('.search-field');
    const input = page.getByLabel('Search query', { exact: true });
    const button = root.locator('.ant-input-search-btn');

    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Dark search theme', { exact: true }).check();
    await page.getByLabel('Compact search theme', { exact: true }).check();

    await expect(root).toHaveClass(/ant-input-search-rtl/);
    await expect(input).toHaveCSS('direction', 'rtl');

    for (const size of ['small', 'medium', 'large']) {
      await page.getByRole('combobox', { name: 'Search size', exact: true }).selectOption(size);

      await expect(root).toHaveClass(new RegExp(`ant-input-search-${size}`));
      const fieldBox = await input.locator('..').boundingBox();
      const buttonBox = await button.boundingBox();

      expect(fieldBox).not.toBeNull();
      expect(buttonBox).not.toBeNull();
      expect(Math.abs(fieldBox!.height - buttonBox!.height)).toBeLessThan(1);
    }

    await page.getByLabel('English locale', { exact: true }).check();

    await expect(button).toHaveAccessibleName('Search');

    await page.getByLabel('Hide search root', { exact: true }).check();

    await expect(root).toHaveAttribute('hidden', '');
    await expect(input).not.toHaveAttribute('hidden');
  }
);
