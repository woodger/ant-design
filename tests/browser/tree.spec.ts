import { test, expect } from './test';
import type { Locator, Page } from '@playwright/test';

const tree = (page: Page) => page.getByRole('tree', { name: 'Controlled tree', exact: true });
const row = (page: Page, name: string) => tree(page).getByRole('treeitem', { name, exact: true });
const check = (page: Page, name: string) =>
  row(page, name).getByRole('checkbox', { name, exact: true });
const lazy = (page: Page) => page.getByRole('tree', { name: 'Lazy tree', exact: true });

async function pointerClick(page: Page, target: Locator) {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=tree'); });

test(
  'Tree expands and collapses without selecting nodes and reports the source state',
  async ({ page }) => {
    await expect(row(page, 'Alpha')).toBeVisible();

    await row(page, 'Root').getByRole('button', { name: 'Свернуть', exact: true }).click();

    await expect(row(page, 'Alpha')).toHaveCount(0);
    await expect(page.getByLabel('Tree selected', { exact: true })).toHaveText('[]');

    await row(page, 'Root').getByRole('button', { name: 'Развернуть', exact: true }).click();

    await expect(row(page, 'Alpha')).toBeVisible();
    await expect(page.getByLabel('Tree events', { exact: true }))
      .toContainText('expand:root:false');
  }
);

test(
  'Tree selects independently of checks and toggles multiple selection without ctrl',
  async ({ page }) => {
    await row(page, 'Alpha').getByRole('button', { name: 'Alpha', exact: true }).click();

    await expect(row(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(check(page, 'Alpha')).toHaveAttribute('aria-checked', 'false');

    await page.getByLabel('Multiple tree selection', { exact: true }).check();
    await row(page, 'Beta').getByRole('button', { name: 'Beta', exact: true }).click();

    await expect(page.getByLabel('Tree selected', { exact: true })).toHaveText('["a","b"]');

    await row(page, 'Alpha').getByRole('button', { name: 'Alpha', exact: true }).click();

    await expect(page.getByLabel('Tree selected', { exact: true })).toHaveText('["b"]');
  }
);

test(
  'Tree conducts checks through enabled descendants and retains mixed parents on uncheck',
  async ({ page }) => {
    await check(page, 'Root').click();

    await expect(check(page, 'Alpha')).toHaveAttribute('aria-checked', 'true');
    await expect(check(page, 'Beta')).toHaveAttribute('aria-checked', 'true');
    await expect(check(page, 'Locked')).toHaveAttribute('aria-checked', 'false');
    await expect(check(page, 'No checkbox')).toBeDisabled();

    await check(page, 'Alpha').click();

    await expect(check(page, 'Root')).toHaveAttribute('aria-checked', 'mixed');
    await expect(check(page, 'Beta')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Tree events', { exact: true }))
      .toContainText('check:a:false:root');
  }
);

test('Tree strict checks return independent checked and halfChecked tuples', async ({ page }) => {
  await page.getByLabel('Strict tree checks', { exact: true }).check();
  await check(page, 'Root').click();

  await expect(check(page, 'Alpha')).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByLabel('Tree checked', { exact: true }))
    .toHaveText('{"checked":["root"],"halfChecked":[]}');
});

test(
  'Tree unselectable titles toggle checks and controlled rejection preserves all states',
  async ({ page }) => {
    await page.getByLabel('Selectable tree titles', { exact: true }).uncheck();
    await row(page, 'Alpha').getByRole('button', { name: 'Alpha', exact: true }).click();

    await expect(check(page, 'Alpha')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Tree selected', { exact: true })).toHaveText('[]');

    await page.getByLabel('Accept tree changes', { exact: true }).uncheck();
    await check(page, 'Beta').click();

    await expect(check(page, 'Beta')).toHaveAttribute('aria-checked', 'false');

    await row(page, 'Root').getByRole('button', { name: 'Свернуть', exact: true }).click();

    await expect(row(page, 'Alpha')).toBeVisible();
  }
);

test(
  'Tree keyboard retains one tab stop, moves the active descendant and checks with Space',
  async ({ page }) => {
    await tree(page).focus();

    await expect(tree(page)).toBeFocused();

    const rootId = await row(page, 'Root').getAttribute('id');

    await expect(tree(page)).toHaveAttribute('aria-activedescendant', rootId!);

    await tree(page).press('ArrowDown');
    await tree(page).press(' ');

    await expect(check(page, 'Alpha')).toHaveAttribute('aria-checked', 'true');
    await expect(tree(page)).toBeFocused();

    await tree(page).press('Home');
    await tree(page).press('Enter');

    await expect(row(page, 'Alpha')).toHaveCount(0);

    await tree(page).press('ArrowRight');
    await tree(page).press('ArrowRight');

    await expect(tree(page)).toHaveAttribute(
      'aria-activedescendant',
      (await row(page, 'Alpha').getAttribute('id'))!
    );

    await tree(page).press('ArrowLeft');

    await expect(tree(page)).toHaveAttribute('aria-activedescendant', rootId!);
  }
);

test(
  'Tree disabled nodes stay in keyboard navigation and switchers remain available by pointer',
  async ({ page }) => {
    await pointerClick(
      page,
      row(page, 'Locked').getByRole('button', { name: 'Развернуть', exact: true })
    );

    await expect(row(page, 'Locked child')).toBeVisible();

    await pointerClick(
      page,
      row(page, 'Locked').getByRole('button', { name: 'Locked', exact: true })
    );

    await expect(page.getByLabel('Tree selected', { exact: true })).toHaveText('[]');

    await tree(page).focus();
    await tree(page).press('Home');
    await tree(page).press('End');
    await tree(page).press('ArrowUp');
    await tree(page).press('ArrowUp');

    await expect(tree(page)).toHaveAttribute(
      'aria-activedescendant',
      (await row(page, 'Locked').getAttribute('id'))!
    );

    await tree(page).press(' ');

    await expect(check(page, 'Locked')).toHaveAttribute('aria-checked', 'false');

    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(tree(page)).toHaveAttribute('aria-disabled', 'true');

    await pointerClick(
      page,
      row(page, 'Root').getByRole('button', { name: 'Свернуть', exact: true })
    );

    await expect(row(page, 'Alpha')).toHaveCount(0);
  }
);

test(
  'Tree loads each branch once, displays loading and preserves owner-provided children',
  async ({ page }) => {
    const branch = lazy(page).getByRole('treeitem', { name: 'Lazy', exact: true });

    await branch.getByRole('button', { name: 'Развернуть', exact: true }).click();

    await expect(branch).toHaveAttribute('aria-busy', 'true');

    await branch.getByRole('button', { name: 'Свернуть', exact: true }).click();

    await expect(page.getByLabel('Tree load calls', { exact: true })).toHaveText('1');

    await page.getByRole('button', { name: 'Resolve tree load', exact: true }).click();

    await expect(lazy(page).getByRole('treeitem', { name: 'Loaded child', exact: true }))
      .toBeVisible();
    await expect(page.getByLabel('Tree loaded', { exact: true })).toHaveText('["lazy"]');
    await expect(page.getByLabel('Tree load events', { exact: true }))
      .toHaveText('["load:lazy"]');

    await branch.getByRole('button', { name: 'Свернуть', exact: true }).click();
    await branch.getByRole('button', { name: 'Развернуть', exact: true }).click();

    await expect(page.getByLabel('Tree load calls', { exact: true })).toHaveText('1');
  }
);

test(
  'Tree load rejection clears loading and collapses before an explicit retry',
  async ({ page }) => {
    const branch = lazy(page).getByRole('treeitem', { name: 'Lazy', exact: true });

    await branch.getByRole('button', { name: 'Развернуть', exact: true }).click();
    await page.getByRole('button', { name: 'Reject tree load', exact: true }).click();

    await expect(branch).toHaveAttribute('aria-expanded', 'false');
    await expect(branch).not.toHaveAttribute('aria-busy');
    await expect(page.getByLabel('Tree loaded', { exact: true })).toHaveText('[]');

    await branch.getByRole('button', { name: 'Развернуть', exact: true }).click();

    await expect(page.getByLabel('Tree load calls', { exact: true })).toHaveText('2');

    await page.getByRole('button', { name: 'Resolve tree load', exact: true }).click();

    await expect(branch).toHaveAttribute('aria-expanded', 'true');
  }
);

test('Tree ignores asynchronous completion after unmount', async ({ page }) => {
  await lazy(page).getByRole('treeitem', { name: 'Lazy', exact: true }).getByRole(
    'button',
    { name: 'Развернуть', exact: true }
  )
    .click();
  await page.getByRole('button', { name: 'Toggle lazy tree', exact: true }).click();
  await page.getByRole('button', { name: 'Resolve tree load', exact: true }).click();

  await expect(page.getByLabel('Tree load events', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Tree loaded', { exact: true })).toHaveText('[]');
});

test(
  'Tree keeps selected keys through sibling reorder and safely removes active DOM references',
  async ({ page }) => {
    await row(page, 'Beta').getByRole('button', { name: 'Beta', exact: true }).click();
    await page.getByRole('button', { name: 'Reverse tree siblings', exact: true }).click();

    await expect(row(page, 'Beta')).toHaveAttribute('aria-selected', 'true');

    await tree(page).focus();
    await page.getByRole('button', { name: 'Remove Beta owner', exact: true }).click();

    await expect(row(page, 'Beta')).toHaveCount(0);
    await expect(tree(page)).not.toHaveAttribute('aria-activedescendant');
  }
);

test('Tree default values expand and conduct checks with numeric keys', async ({ page }) => {
  const target = page.getByRole('tree', { name: 'Default tree', exact: true });

  await expect(target.getByRole('treeitem', { name: 'Default child', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(target.getByRole('checkbox', { name: 'Default child', exact: true })).toHaveAttribute(
    'aria-checked',
    'true'
  );

  await target.getByRole('checkbox', { name: 'Zero', exact: true }).click();

  await expect(target.getByRole('checkbox', { name: 'Default child', exact: true })).toHaveAttribute(
    'aria-checked',
    'false'
  );
});

test('Tree honors Form disabled and explicit enabled overrides', async ({ page }) => {
  await expect(page.getByRole('tree', { name: 'Form tree', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await expect(page.getByRole('tree', { name: 'Enabled override tree', exact: true })).not
    .toHaveAttribute('aria-disabled');
});

test('Tree RTL retains source arrow semantics and locale labels update', async ({ page }) => {
  await page.getByLabel('English locale', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();

  await expect(tree(page)).toHaveCSS('direction', 'rtl');

  await row(page, 'Root').getByRole('button', { name: 'Collapse', exact: true }).click();
  await tree(page).focus();
  await tree(page).press('Home');
  await tree(page).press('ArrowRight');

  await expect(row(page, 'Alpha')).toBeVisible();

  await tree(page).press('ArrowLeft');

  await expect(row(page, 'Alpha')).toHaveCount(0);
});

test(
  'Tree autoExpandParent keeps controlled ancestors open until disabled by the owner',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Expand Alpha owner', exact: true }).click();

    await expect(row(page, 'Alpha')).toHaveCount(0);

    await page.getByLabel('Auto expand parents', { exact: true }).check();

    await expect(row(page, 'Alpha')).toBeVisible();

    await row(page, 'Root').getByRole('button', { name: 'Свернуть', exact: true }).click();

    await expect(row(page, 'Alpha')).toBeVisible();

    await page.getByLabel('Auto expand parents', { exact: true }).uncheck();

    await expect(row(page, 'Alpha')).toHaveCount(0);
  }
);

test(
  'Tree geometry follows source title/indent sizes and collapsed icon direction',
  async ({ page }) => {
    await expect(row(page, 'Root').locator('.ant-tree-switcher')).toHaveCSS('width', '24px');
    await expect(row(page, 'Alpha').locator('.ant-tree-indent')).toHaveCSS('width', '24px');
    await expect(row(page, 'Alpha')).toHaveCSS('height', '24px');

    await row(page, 'Root').getByRole('button', { name: 'Свернуть', exact: true }).click();

    await expect(row(page, 'Root').locator('.ant-tree-switcher'))
      .toHaveClass(/ant-tree-switcher_close/);
    await expect(row(page, 'Root').locator('.ant-tree-switcher-icon svg')).toHaveCSS(
      'transform',
      'matrix(0, -1, 1, 0, 0, 0)'
    );
  }
);

test(
  'Tree initially expanded loading inherits checked parent state after new children arrive',
  async ({ page }) => {
    const target = page.getByRole('tree', { name: 'Initially loaded tree', exact: true });

    await expect(target.getByRole('treeitem', { name: 'Initial loaded child', exact: true }))
      .toBeVisible();
    await expect(target.getByRole('checkbox', { name: 'Initial loaded child', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByLabel('Initial load calls', { exact: true })).toHaveText('1');
  }
);

test(
  'Tree keyboard can collapse a pending branch while pointer switcher waits for loading',
  async ({ page }) => {
    const target = lazy(page);
    const branch = target.getByRole('treeitem', { name: 'Lazy', exact: true });

    await branch.getByRole('button', { name: 'Развернуть', exact: true }).click();

    await expect(branch).toHaveAttribute('aria-busy', 'true');

    await target.press('Home');
    await target.press('ArrowLeft');

    await expect(branch).toHaveAttribute('aria-expanded', 'false');
    await expect(branch).toHaveAttribute('aria-busy', 'true');

    await page.getByRole('button', { name: 'Reject tree load', exact: true }).click();

    await expect(branch).not.toHaveAttribute('aria-busy');
    await expect(branch).toHaveAttribute('aria-expanded', 'false');
  }
);
