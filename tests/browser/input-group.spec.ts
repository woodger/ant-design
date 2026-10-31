import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=input-group');

  await expect(page.locator('.legacy-group')).toBeVisible();
});

test(
  'InputGroup reuses one Compact root and preserves keyed child boundaries',
  async ({ page }) => {
    const root = page.locator('.legacy-group');
    const input = page.getByLabel('Grouped draft', { exact: true });
    const button = page.getByRole('button', { name: 'Grouped action', exact: true });

    await expect(root).toHaveClass(/ant-space-compact/);
    await expect(root).toHaveClass(/ant-input-group ant-input-css-var/);
    await expect(root).not.toHaveClass(/ant-input-group-compact/);
    await expect(root.locator(':scope > input, :scope > button')).toHaveCount(2);
    await expect(input).toHaveClass(/ant-input-compact-first-item/);
    await expect(button).toHaveClass(/ant-btn-compact-last-item/);
    await expect(root).toHaveCSS('max-width', '400px');
    await expect(page.getByLabel('Group ref', { exact: true })).toHaveText('DIV');
    await expect(page.getByLabel('Snippet group input', { exact: true }))
      .toHaveClass(/ant-input-compact-first-item ant-input-compact-last-item/);
  }
);

test(
  'InputGroup keeps legacy size classes separate from the provider size context',
  async ({ page }) => {
    const root = page.locator('.legacy-group');
    const input = page.getByLabel('Grouped draft', { exact: true });
    const button = page.getByRole('button', { name: 'Grouped action', exact: true });

    await page
      .getByRole('combobox', { name: 'Group legacy size', exact: true })
      .selectOption('large');

    await expect(root).toHaveClass(/ant-input-group-lg/);
    await expect(input).toHaveClass(/reported-small/);
    await expect(input).toHaveCSS('font-size', '16px');
    await expect(button).toHaveClass(/ant-btn-sm/);

    await page
      .getByRole('combobox', { name: 'Group context size', exact: true })
      .selectOption('large');

    await expect(input).toHaveClass(/reported-large/);
    await expect(button).toHaveClass(/ant-btn-lg/);
  }
);

test('InputGroup preserves the source compact display modifier', async ({ page }) => {
  const root = page.locator('.legacy-group');

  await expect(root).toHaveCSS('display', 'inline-flex');

  await page.getByLabel('Legacy compact group', { exact: true }).check();

  await expect(root).toHaveClass(/ant-input-group-compact/);
  await expect(root).toHaveCSS('display', 'block');

  await page.getByLabel('Legacy compact group', { exact: true }).uncheck();

  await expect(root).toHaveCSS('display', 'inline-flex');
});

test(
  'InputGroup retains the native input draft and focus while reordering keyed items',
  async ({ page }) => {
    const input = page.getByLabel('Grouped draft', { exact: true });
    const button = page.getByRole('button', { name: 'Grouped action', exact: true });

    await input.fill('owned draft');
    await page
      .getByLabel('Reverse group items', { exact: true })
      .evaluate((checkbox: HTMLInputElement) => {
      checkbox.click();
    });

    await expect(input).toBeFocused();
    await expect(input).toHaveValue('owned draft');
    await expect(input).toHaveClass(/ant-input-compact-last-item/);
    await expect(button).toHaveClass(/ant-btn-compact-first-item/);
    await expect(page.getByLabel('Group draft', { exact: true })).toHaveText('owned draft');
  }
);

test(
  'InputGroup forwards mouse and bubbling focus events from the Compact div',
  async ({ page }) => {
    const input = page.getByLabel('Grouped draft', { exact: true });

    await input.hover();
    await input.focus();
    await page.getByRole('button', { name: 'Grouped action', exact: true }).focus();
    await page.getByRole('heading', { name: 'InputGroup', exact: true }).hover();

    await expect(page.getByLabel('Group events', { exact: true })).toContainText('enter:DIV');
    await expect(page.getByLabel('Group events', { exact: true })).toContainText('leave:DIV');
    await expect(page.getByLabel('Group events', { exact: true }))
      .toContainText('focus:focusin:DIV');
    await expect(page.getByLabel('Group events', { exact: true }))
      .toContainText('blur:focusout:DIV');
  }
);

test(
  'InputGroup preserves FormItem status and disabled without duplicating its association',
  async ({ page }) => {
    const implicit = page.getByLabel('Group sibling one', { exact: true });
    const explicit = page.getByLabel('Group sibling two', { exact: true });

    await expect(implicit).not.toHaveAttribute('id');
    await expect(implicit).not.toHaveAttribute('name');
    await expect(implicit).not.toHaveAttribute('required');
    await expect(explicit).toHaveAttribute('id', 'explicit-input');
    await expect(explicit).toHaveAttribute('name', 'explicit');
    await expect(explicit).toHaveAttribute('required', '');

    await page.getByRole('button', { name: 'Validate group', exact: true }).click();

    await expect(implicit).toHaveAttribute('aria-invalid', 'true');
    await expect(explicit).toHaveAttribute('aria-invalid', 'true');
    await expect(implicit).toBeFocused();
    await expect(page.getByText('Group error', { exact: true })).toBeVisible();

    await page.getByLabel('Disable group form', { exact: true }).check();

    await expect(implicit).toBeDisabled();
    await expect(explicit).toBeDisabled();
  }
);

test(
  'InputGroup retains RTL and theme context and releases its root ref when emptied',
  async ({ page }) => {
    const root = page.locator('.legacy-group');
    const input = page.getByLabel('Grouped draft', { exact: true });

    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Dark group theme', { exact: true }).check();

    await expect(root).toHaveClass(/ant-input-group-rtl/);
    await expect(root).toHaveAttribute('dir', 'rtl');
    await expect(input).toHaveCSS('direction', 'rtl');
    await expect(input).not.toHaveCSS('color', 'rgb(0, 0, 0)');

    await page.getByLabel('Empty input group', { exact: true }).check();

    await expect(root).toHaveCount(0);
    await expect(page.getByLabel('Group ref', { exact: true })).toHaveText('');
  }
);

test(
  'InputGroup keeps status for mixed controls without creating fields under the parent name',
  async ({ page }) => {
    const select = page.getByRole('combobox', { name: 'Grouped select', exact: true });
    const checkbox = page.getByRole('checkbox', { name: 'Grouped checkbox', exact: true });

    await expect(page.locator('.mixed-form-group [name="outer"]')).toHaveCount(0);
    await expect(checkbox).not.toHaveAttribute('required');

    await page.getByRole('button', { name: 'Validate group', exact: true }).click();

    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel('Disable group form', { exact: true }).check();

    await expect(select).toBeDisabled();
    await expect(checkbox).toBeDisabled();
  }
);
