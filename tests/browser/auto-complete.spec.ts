import { test, expect } from './test';
import type { Page } from '@playwright/test';

const input = (page: Page) => page.getByRole('combobox', { name: 'Completion', exact: true });
const popup = (page: Page) => page.getByRole('listbox', { name: 'Completion', exact: true });
test.beforeEach(
  async ({ page }) => { await page.goto('/?fixture=auto-complete'); }
);

test(
  'AutoComplete accepts free input without local filtering and selects the option value rather than its label',
  async ({ page }) => {
    await input(page).fill('unmatched');
    await expect.poll(
      async () => {
        const bottom = await input(page).evaluate(
          el => el.closest('.auto-complete')!.getBoundingClientRect().bottom
        );

        return Math.abs((await popup(page).boundingBox())!.y - bottom - 4);
      }
    )
      .toBeLessThan(1);

    await expect(page.getByLabel('Completion value', { exact: true })).toHaveText('"unmatched"');

    await popup(page).getByRole('option', { name: 'Alpha label', exact: true }).click();

    await expect(input(page)).toHaveValue('alpha');
    await expect(page.getByLabel('Completion searches', { exact: true }))
      .toHaveText('["unmatched"]');
    await expect(page.getByLabel('Completion events', { exact: true }))
      .toHaveText('["change:unmatched","change:alpha","select:alpha:alpha"]');
    await expect(input(page)).toBeFocused();
  }
);

test(
  'AutoComplete filters groups by value, supports rich options and suppresses empty popups even when forced open',
  async ({ page }) => {
    await page.getByLabel('Filter completions', { exact: true }).check();
    await input(page).fill('alp');

    await expect(popup(page).getByRole('option')).toHaveCount(2);

    await input(page).fill('beta');

    await expect(popup(page).locator('strong')).toHaveText('Beta rich');

    await page.getByLabel('Force completion open', { exact: true }).check();
    await page.getByRole('button', { name: 'Empty completion options', exact: true })
      .click();

    await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(popup(page)).toHaveCount(0);
    await expect(input(page)).toHaveValue('beta');
  }
);

test(
  'AutoComplete backfill previews keyboard values without change or search until selection and skips disabled rows',
  async ({ page }) => {
    await page.getByLabel('Completion backfill', { exact: true }).check();
    await input(page).fill('a');
    await input(page).press('ArrowDown');

    await expect(input(page)).toHaveValue('alpine');
    await expect(page.getByLabel('Completion value', { exact: true })).toHaveText('"a"');

    await input(page).press('ArrowDown');

    await expect(input(page)).toHaveValue('beta');

    await input(page).press('Enter');

    await expect(page.getByLabel('Completion value', { exact: true })).toHaveText('"beta"');
    await expect(page.getByLabel('Completion searches', { exact: true }))
      .toHaveText('["a"]');
  }
);

test(
  'AutoComplete controlled rejection restores input text and owner replacement does not emit callbacks',
  async ({ page }) => {
    await page.getByLabel('Accept completion changes', { exact: true }).uncheck();
    await input(page).fill('rejected');

    await expect(input(page)).toHaveValue('');

    await page.getByRole('button', { name: 'Replace completion owner', exact: true }).click();

    await expect(input(page)).toHaveValue('owner');
    await expect(page.getByLabel('Completion events', { exact: true }))
      .toHaveText('["change:rejected"]');
  }
);

test(
  'AutoComplete clear preserves source clear display/search callback order and keyboard activation',
  async ({ page }) => {
    await input(page).fill('typed');
    await input(page).press('Escape');
    await page.getByRole('button', { name: 'Очистить', exact: true }).press('Enter');

    await expect(input(page)).toHaveValue('');
    await expect(page.getByLabel('Completion events', { exact: true }))
      .toHaveText('["change:typed","clear","change:undefined","change:"]');
    await expect(page.getByLabel('Completion searches', { exact: true })).toHaveText('["typed",""]');
  }
);

test(
  'AutoComplete preserves custom textarea focus and native cursor movement with closed suggestions',
  async ({ page }) => {
    const custom = page.getByRole('combobox', { name: 'Custom completion', exact: true });

    await custom.focus();
    await custom.press('ArrowDown');

    await expect(custom).toHaveAttribute('aria-expanded', 'false');

    await custom.fill('beta');
    await page.getByRole('listbox', { name: 'Custom completion', exact: true }).getByRole(
      'option',
      { name: 'Beta rich', exact: true }
    )
      .click();

    await expect(custom).toHaveValue('beta');
    await expect(custom).toBeFocused();
    await expect(custom).toHaveAttribute('rows', '3');
  }
);

test(
  'AutoComplete composition input updates text while composing Enter never selects a suggestion',
  async ({ page }) => {
    await input(page).fill('a');
    await input(page).dispatchEvent('compositionstart');
    await input(page).dispatchEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true });

    await expect(input(page)).toHaveValue('a');
    await expect(popup(page)).toBeVisible();

    await input(page).dispatchEvent('compositionend');
    await input(page).press('Escape');

    await expect(popup(page)).toHaveCount(0);
  }
);

test(
  'AutoComplete integrates validation submission reset disabled and native FormData',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Submit completion', exact: true }).click();

    await expect(page.getByText('Query required', { exact: true })).toBeVisible();

    const field = page.getByRole('combobox', { name: 'Form completion', exact: true });

    await expect(field).toBeFocused();

    await field.fill('free value');
    await field.press('Escape');

    expect(await field.evaluate(el => new FormData((el as HTMLInputElement).form!).get('query')))
      .toBe('free value');

    await page.getByRole('button', { name: 'Submit completion', exact: true }).click();

    await expect(page.getByLabel('Completion submitted', { exact: true }))
      .toHaveText('free value');

    await page.getByRole('button', { name: 'Reset completion', exact: true }).click();

    await expect(field).toHaveValue('');

    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(input(page)).toBeDisabled();
  }
);

test(
  'AutoComplete releases popup resources on unmount and its public ref focuses the native input',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Focus completion', exact: true }).click();

    await expect(input(page)).toBeFocused();

    await input(page).fill('a');
    await page.getByRole('button', { name: 'Toggle completion mount', exact: true }).click();

    await expect(input(page)).toHaveCount(0);
    await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
  }
);

test(
  'AutoComplete uncontrolled defaults accept edits and Tab selects an active option before leaving',
  async ({ page }) => {
    const control = page.getByRole('combobox', { name: 'Default completion', exact: true });

    await expect(control).toHaveValue('seed');

    await control.fill('oth');
    await control.press('Tab');

    await expect(control).toHaveValue('other');
    await expect(control).toBeFocused();
    await expect(control).toHaveAttribute('aria-expanded', 'false');
  }
);

test(
  'AutoComplete controlled closed state rejects popup requests and RTL popups stay within narrow viewports',
  async ({ page }) => {
    await page.getByLabel('Lock completion closed', { exact: true }).check();
    await input(page).fill('alpha');

    await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(popup(page)).toHaveCount(0);

    await page.getByLabel('Lock completion closed', { exact: true }).uncheck();
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.setViewportSize({ width: 375, height: 812 });
    await input(page).click();

    await expect(popup(page)).toBeVisible();
    await expect(input(page)).toHaveAttribute('dir', 'rtl');

    const box = await popup(page).boundingBox();

    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  }
);
