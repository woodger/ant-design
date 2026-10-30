import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=checkbox-group');

  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test(
  'CheckboxGroup uses native labels, Space and Tab and reports values once in option order',
  async ({ page }) => {
    const group = page.getByRole('group', { name: 'Bound group', exact: true });

    await group.getByRole('checkbox', { name: 'Group three', exact: true }).check();
    await group.getByRole('checkbox', { name: 'Group two', exact: true }).check();

    await expect(page.getByRole('status', { name: 'Group owner', exact: true }))
      .toHaveText('[0,2,3]');

    const zero = group.getByRole('checkbox', { name: 'Group zero', exact: true });

    await zero.focus();
    await zero.press('Space');

    await expect(zero).toBeFocused();
    await expect(zero.locator('..')).toHaveCSS('outline-style', 'solid');

    await zero.press('Tab');

    await expect(group.getByRole('checkbox', { name: 'Group two', exact: true })).toBeFocused();

    await group.getByText('Group three', { exact: true }).click();

    await expect(page.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[2]');
    await expect(page.getByRole('status', { name: 'Group changes', exact: true }))
      .toHaveText('[[0,3],[0,2,3],[2,3],[2]]');
  }
);

test(
  'CheckboxGroup keeps primitive value types separate while native FormData serializes strings',
  async ({ page }) => {
    const group = page.getByRole('group', { name: 'Mixed group', exact: true });

    await group.getByRole('checkbox', { name: 'Boolean false', exact: true }).check();
    await group.getByRole('checkbox', { name: 'Numeric zero', exact: true }).check();
    await group.getByRole('checkbox', { name: 'Text zero', exact: true }).check();
    await group.getByRole('checkbox', { name: 'Text false', exact: true }).check();

    await expect(page.getByRole('status', { name: 'Group mixed owner', exact: true }))
      .toHaveText('[0,"0",false,"false"]');
    expect(
      await page.locator('#checkbox-group-native-form').evaluate(
        (element) => new FormData(element as HTMLFormElement).getAll('mixed')
      )
    )
      .toEqual(['0', '0', 'false', 'false']);

    await group.getByRole('checkbox', { name: 'Boolean false', exact: true }).uncheck();

    await expect(group.getByRole('checkbox', { name: 'Text false', exact: true })).toBeChecked();
  }
);

test(
  'CheckboxGroup accepts owner and option changes without callbacks and normalizes only a user change',
  async ({ page }) => {
    const fixture = page.locator('#checkbox-group-fixture');
    const group = fixture.getByRole('group', { name: 'Bound group', exact: true });

    await fixture.getByRole('button', { name: 'Replace group owner', exact: true }).click();
    await fixture.getByLabel('Rename group zero', { exact: true }).check();

    await expect(group.getByRole('checkbox', { name: 'Renamed group zero', exact: true }))
      .toBeChecked();

    await fixture.getByLabel('Hide group zero', { exact: true }).check();

    await expect(group.getByRole('checkbox', { name: 'Renamed group zero', exact: true }))
      .toHaveCount(0);
    await expect(fixture.getByRole('status', { name: 'Group owner', exact: true }))
      .toHaveText('[3,0,3,99]');

    await fixture.getByLabel('Hide group zero', { exact: true }).uncheck();
    await fixture.getByLabel('Reverse group options', { exact: true }).check();
    await fixture.getByRole('button', { name: 'Read group FormData', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group FormData', exact: true }))
      .toHaveText('{"choices":["3","0"],"defaults":["0","2"]}');
    await expect(fixture.getByRole('status', { name: 'Group changes', exact: true }))
      .toHaveText('[]');

    await group.getByRole('checkbox', { name: 'Group two', exact: true }).check();

    await expect(fixture.getByRole('status', { name: 'Group owner', exact: true }))
      .toHaveText('[3,2,0]');
    await expect(fixture.getByRole('status', { name: 'Group changes', exact: true }))
      .toHaveText('[[3,2,0]]');
  }
);

test('CheckboxGroup callback arrays do not alias the bound owner', async ({ page }) => {
  await page.getByLabel('Mutate group callback', { exact: true }).check();
  await page.getByRole('group', { name: 'Bound group', exact: true }).getByRole(
    'checkbox',
    { name: 'Group two', exact: true }
  )
    .check();

  await expect(page.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[0,2]');
  await expect(page.getByRole('status', { name: 'Group changes', exact: true }))
    .toHaveText('[[0,2]]');
});

test(
  'CheckboxGroup retains disabled selections and applies group and ConfigProvider disabled state',
  async ({ page }) => {
    const fixture = page.locator('#checkbox-group-fixture');
    const group = fixture.getByRole('group', { name: 'Bound group', exact: true });
    const two = group.getByRole('checkbox', { name: 'Group two', exact: true });

    await two.check();
    await fixture.getByLabel('Lock group two', { exact: true }).check();

    await expect(two).toBeDisabled();
    await expect(two).toBeChecked();

    await fixture.getByRole('button', { name: 'Read group FormData', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group FormData', exact: true }))
      .toHaveText('{"choices":["0"],"defaults":["0","2"]}');

    await fixture.getByLabel('Disable checkbox group', { exact: true }).check();
    for (const checkbox of await group.getByRole('checkbox').all())
      await expect(checkbox).toBeDisabled();
    await fixture.getByLabel('Disable checkbox group', { exact: true }).uncheck();
    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(group.getByRole('checkbox', { name: 'Group zero', exact: true })).toBeDisabled();
    await expect(
      page.getByRole('group', { name: 'Enabled group override', exact: true })
        .getByRole('checkbox')
    )
      .toBeEnabled();
    expect(
      await page.locator('#checkbox-group-native-form').evaluate(
        (element) => new FormData(element as HTMLFormElement).getAll('groupChoices')
      )
    )
      .toEqual([]);

    await page.getByLabel('Disable all components', { exact: true }).uncheck();
    await fixture.getByLabel('Lock group two', { exact: true }).uncheck();

    await expect(two).toBeChecked();
    await expect(two).toBeEnabled();
    await expect(fixture.getByRole('status', { name: 'Group changes', exact: true }))
      .toHaveText('[[0,2]]');
  }
);

test(
  'CheckboxGroup keeps empty and entirely disabled options safe without changing its owner',
  async ({ page }) => {
    const group = page.getByRole('group', { name: 'Bound group', exact: true });

    await page.getByLabel('Lock all group options', { exact: true }).check();
    await group.focus();

    await expect(group).toBeFocused();

    await page.getByLabel('Empty checkbox group', { exact: true }).check();

    await expect(group.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[0]');
    await expect(page.getByRole('status', { name: 'Group changes', exact: true })).toHaveText('[]');
  }
);

test(
  'CheckboxGroup copies defaults once and resets native values without callbacks while respecting canceled reset',
  async ({ page }) => {
    const fixture = page.locator('#checkbox-group-fixture');
    const bound = fixture.getByRole('group', { name: 'Bound group', exact: true });
    const defaults = fixture.getByRole('group', { name: 'Default group', exact: true });

    await bound.getByRole('checkbox', { name: 'Group two', exact: true }).check();
    await defaults.getByRole('checkbox', { name: 'Group zero', exact: true }).uncheck();
    await fixture.getByRole('button', { name: 'Replace group defaults', exact: true }).click();
    await fixture.getByLabel('Cancel group reset', { exact: true }).check();
    await fixture.getByRole('button', { name: 'Reset native groups', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group owner', exact: true }))
      .toHaveText('[0,2]');
    await expect(defaults.getByRole('checkbox', { name: 'Group zero', exact: true })).not
      .toBeChecked();

    await fixture.getByLabel('Cancel group reset', { exact: true }).uncheck();
    await page.evaluate(
      () =>
        window.addEventListener(
          'reset',
          (event) => event.preventDefault(),
          { once: true }
        )
    );
    await fixture.getByRole('button', { name: 'Reset native groups', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group owner', exact: true }))
      .toHaveText('[0,2]');
    await expect(defaults.getByRole('checkbox', { name: 'Group zero', exact: true })).not
      .toBeChecked();

    await fixture.getByRole('button', { name: 'Reset native groups', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[]');
    await expect(defaults.getByRole('checkbox', { name: 'Group zero', exact: true })).toBeChecked();
    await expect(defaults.getByRole('checkbox', { name: 'Group two', exact: true })).toBeChecked();
    await expect(defaults.getByRole('checkbox', { name: 'Group three', exact: true })).not
      .toBeChecked();
    await expect(fixture.getByRole('status', { name: 'Group changes', exact: true }))
      .toHaveText('[[0,2]]');
    await expect(fixture.getByRole('status', { name: 'Group default changes', exact: true }))
      .toHaveText('1');

    await fixture.getByRole('button', { name: 'Read group FormData', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group FormData', exact: true }))
      .toHaveText('{"choices":[],"defaults":["0","2"]}');
  }
);

test(
  'CheckboxGroup honors external native form association and resets only its owning form',
  async ({ page }) => {
    const group = page.getByRole('group', { name: 'Outside group', exact: true });

    await group.getByRole('checkbox', { name: 'Group two', exact: true }).check();
    await page.getByRole('button', { name: 'Read outside group', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Outside group FormData', exact: true }))
      .toHaveText('["0","2"]');

    await page.getByRole('button', { name: 'Reset outside group', exact: true }).click();
    await page.getByRole('button', { name: 'Read outside group', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Outside group FormData', exact: true }))
      .toHaveText('["0"]');
    await expect(page.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[0]');
  }
);

test(
  'CheckboxGroup integrates group labels, array validation, first-enabled focus, submission and Form reset',
  async ({ page }) => {
    const fixture = page.locator('#checkbox-group-form-fixture');
    const group = fixture.getByRole('group', { name: 'Group roles', exact: true });
    const zero = group.getByRole('checkbox', { name: 'Group zero', exact: true });

    await fixture.getByText('Group roles', { exact: true }).click();

    await expect(zero).toBeFocused();
    await expect(zero).not.toBeChecked();
    await expect(group).toHaveAccessibleDescription('Choose two or three group roles');

    await fixture.getByRole('button', { name: 'Submit group form', exact: true }).click();

    await expect(zero).toBeFocused();
    await expect(zero).toHaveAttribute('aria-invalid', 'true');
    await expect(zero).toHaveJSProperty('required', false);
    await expect(group).toHaveAccessibleDescription('Choose a group role');

    await zero.check();
    await group.getByRole('checkbox', { name: 'Group two', exact: true }).check();
    await group.getByRole('checkbox', { name: 'Group three', exact: true }).check();
    await fixture.getByRole('button', { name: 'Submit group form', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group form saved', exact: true }))
      .toHaveText('[0,2,3]');

    await fixture.getByRole('button', { name: 'Replace group form values', exact: true }).click();
    await fixture.getByRole('button', { name: 'Submit group form', exact: true }).click();

    await expect(group).toHaveAccessibleDescription('Choose two or three group roles');
    await expect(zero).toBeFocused();
    await expect(fixture.getByRole('status', { name: 'Group form finishes', exact: true }))
      .toHaveText('1');

    await fixture.getByRole('button', { name: 'Reset group form', exact: true }).click();

    await expect(fixture.getByRole('status', { name: 'Group form owner', exact: true }))
      .toHaveText('[]');
    await expect(zero).not.toBeChecked();
    await expect(zero).not.toHaveAttribute('aria-invalid');
  }
);

test('CheckboxGroup inherits Form disabled state and allows a group override', async ({ page }) => {
  await page.getByLabel('Disable group form', { exact: true }).check();

  const group = page.getByRole('group', { name: 'Group roles', exact: true });

  for (const checkbox of await group.getByRole('checkbox').all())
    await expect(checkbox).toBeDisabled();

  await expect(
    page.getByRole('group', { name: 'Form inherited group', exact: true })
      .getByRole('checkbox')
  )
    .toBeDisabled();
  await expect(
    page.getByRole('group', { name: 'Form enabled override', exact: true })
      .getByRole('checkbox')
  )
    .toBeEnabled();
});

test(
  'CheckboxGroup focuses a named empty invalid group and removes native reset listeners on unmount',
  async ({ page }) => {
    await page.getByLabel('Empty group form options', { exact: true }).check();
    await page.getByRole('button', { name: 'Submit group form', exact: true }).click();

    const group = page.getByRole('group', { name: 'Group roles', exact: true });

    await expect(group).toBeFocused();
    await expect(group).toHaveAccessibleDescription('Choose a group role');

    await page.getByLabel('Mount checkbox group', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Reset native groups', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[0]');

    await page.getByLabel('Mount checkbox group', { exact: true }).check();
    await page.getByRole('button', { name: 'Reset native groups', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Group owner', exact: true })).toHaveText('[]');
  }
);

test(
  'CheckboxGroup inherits RTL and reactive dark and compact themes',
  async ({ page }, testInfo) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('Dark group theme', { exact: true }).check();
    await page.getByLabel('Compact group theme', { exact: true }).check();

    const group = page.getByRole('group', { name: 'Bound group', exact: true });
    const zero = group.getByRole('checkbox', { name: 'Group zero', exact: true });
    const two = group.getByRole('checkbox', { name: 'Group two', exact: true });

    await expect(group).toHaveCSS('direction', 'rtl');
    await expect(group).toHaveCSS('font-size', '12px');
    expect((await zero.boundingBox())!.x).toBeGreaterThan((await two.boundingBox())!.x);
    await expect(zero.locator('..')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
    await expect(two.locator('..')).toHaveCSS('background-color', 'rgb(20, 20, 20)');

    await group.screenshot({ path: testInfo.outputPath('checkbox-group-rtl-dark.png') });
  }
);

test.describe('mobile CheckboxGroup', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'wraps long labels without widening the viewport and keeps native controls usable',
    async ({ page }, testInfo) => {
      const group = page.getByRole('group', { name: 'Long group', exact: true });
      const checkbox = group.getByRole('checkbox', { name: /^Long group choice/ });

      await checkbox.check();

      await expect(checkbox).toBeChecked();

      await expect.poll(
        () =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      )
        .toBe(true);
      await group.screenshot({ path: testInfo.outputPath('checkbox-group-mobile.png') });
    }
  );
});
