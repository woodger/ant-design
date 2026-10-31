import type { Locator } from '@playwright/test';
import { test, expect } from './test';

const layers = (host: Locator) => host.locator(':scope > .ant-border-beam');
const variable = (layer: Locator, name: string) => layer.evaluate(
  (element, property) => (element as HTMLElement).style.getPropertyValue(property),
  `--ant-border-beam-${name}`
);
const pseudo = (layer: Locator, name: string) => layer.evaluate(
  (element, property) => getComputedStyle(element, '::before').getPropertyValue(property),
  name
);

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=border-beam');

  await expect(layers(page.locator('#border-beam-host'))).toHaveCount(1);
});

test(
  'BorderBeam decorates native and component roots without a wrapper or SVG layers',
  async ({ page }) => {
    const host = page.locator('#border-beam-host');
    const beam = layers(host);
    const card = page.locator('.beam-card');

    await expect(host.locator(':scope > form')).toHaveCount(1);
    await expect(beam).toHaveAttribute('aria-hidden', 'true');
    await expect(beam).toHaveCSS('pointer-events', 'none');
    await expect(beam).not.toHaveAttribute('tabindex');
    await expect(layers(card)).toHaveClass(/card-beam/);
    await expect(page.getByLabel('Beam host ref', { exact: true })).toHaveText('DIV');
    await expect(page.locator('.svg-beam, .unresolved-beam')).toHaveCount(0);
    await expect(page.getByLabel('Beam SVG', { exact: true })).toContainText('SVG content');
    await expect(page.locator('#unresolved-host')).toHaveText('Content without a target');

    const draft = page.getByLabel('Beam draft', { exact: true });
    await draft.fill('Preserved draft');
    await draft.press('Tab');

    await expect(page.getByRole('button', { name: 'Beam action', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Beam action', exact: true }).click();
    await page.getByRole('button', { name: 'Submit beam draft', exact: true }).click();

    await expect(page.getByLabel('Beam clicks', { exact: true })).toHaveText('1');
    await expect(page.getByLabel('Beam submission', { exact: true })).toHaveText('Preserved draft');
  }
);

test(
  'BorderBeam uses the pinned CSS mask, motion path and theme defaults',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));

    expect(await page.evaluate(() => CSS.supports('mask-composite', 'exclude'))).toBe(true);
    expect(await page.evaluate(() => CSS.supports('offset-path', 'rect(0 auto auto 0 round 1px)')))
      .toBe(true);
    await expect(beam).toHaveCSS('display', 'block');
    await expect(beam).toHaveCSS('position', 'absolute');
    await expect(beam).toHaveCSS('mask-composite', 'exclude, exclude');
    await expect(beam).toHaveCSS('padding-top', '1px');
    await expect(beam).toHaveCSS('border-top-left-radius', '8px');
    await expect.poll(() => variable(beam, 'inset-offset')).toBe('-1px -2px -3px -4px');
    expect(await pseudo(beam, 'width')).toBe('100px');
    expect(await pseudo(beam, 'animation-name')).toBe('antBorderBeamMove');
    expect(await pseudo(beam, 'animation-duration')).toBe('6s');
    expect(await pseudo(beam, 'animation-iteration-count')).toBe('infinite');
    // Chromium сериализует rect с auto-границами как эквивалентный inset.
    expect(await pseudo(beam, 'offset-path')).toBe('inset(0px 0% 0% 0px round 100px)');
    expect(await pseudo(beam, 'background-image')).toContain('rgb(82, 196, 26)');

    const animation = await beam.evaluate(
      element => element.getAnimations({ subtree: true })[0]?.playState
    );

    expect(animation).toBe('running');
  }
);

test(
  'BorderBeam floors valid counts and falls back for non-finite and non-positive counts',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    const count = page.getByLabel('Beam count', { exact: true });

    const cases = [
      ['2.9', 2],
      ['0', 1],
      ['-2', 1],
      ['Infinity', 1],
      ['NaN', 1]
    ] as const;

    for (const [value, expected] of cases) {
      await count.fill(value);

      await expect(beam).toHaveCount(expected);
    }
  }
);

test(
  'BorderBeam distributes duration phases and restores default duration for invalid input',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    await page.getByLabel('Beam count', { exact: true }).fill('3');
    await page.getByLabel('Customize beam', { exact: true }).check();

    await expect(beam).toHaveCount(3);
    await expect.poll(() => variable(beam.nth(1), 'delay')).toBe('-4s');
    expect(await variable(beam.nth(0), 'delay')).toBe('');
    expect(await variable(beam.nth(2), 'delay')).toBe('-8s');
    expect(await pseudo(beam.nth(2), 'animation-duration')).toBe('12s');
    expect(await pseudo(beam.nth(2), 'animation-delay')).toBe('-8s');

    for (const duration of ['0', '-1', 'NaN']) {
      await page.getByLabel('Beam duration', { exact: true }).fill(duration);

      await expect.poll(() => variable(beam.first(), 'duration')).toBe('');
      await expect.poll(() => variable(beam.nth(1), 'delay')).toBe('-2s');
      expect(await pseudo(beam.first(), 'animation-duration')).toBe('6s');
    }
  }
);

test(
  'BorderBeam accepts pixel and CSS dimensions and removes props when reset',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    await page.getByLabel('Customize beam', { exact: true }).check();

    await expect.poll(() => variable(beam, 'size')).toBe('160px');
    expect(await variable(beam, 'line-width')).toBe('5px');
    expect(await variable(beam, 'inset-offset')).toBe('-4px');
    await expect(beam).toHaveCSS('padding-top', '5px');
    expect(await pseudo(beam, 'width')).toBe('160px');

    await page.getByLabel('CSS beam units', { exact: true }).check();

    await expect.poll(() => variable(beam, 'size')).toBe('12em');
    expect(await variable(beam, 'line-width')).toBe('0.25rem');
    expect(await variable(beam, 'inset-offset')).toBe('calc(-1 * 2em)');
    await expect(beam).toHaveCSS('padding-top', '4px');
    expect(await pseudo(beam, 'width')).toBe('168px');

    await page.getByLabel('Customize beam', { exact: true }).uncheck();

    await expect.poll(() => variable(beam, 'size')).toBe('');
    expect(await variable(beam, 'line-width')).toBe('');
    expect(await variable(beam, 'inset-offset')).toBe('-1px -2px -3px -4px');
    expect(await pseudo(beam, 'width')).toBe('100px');
  }
);

test(
  'BorderBeam maps solid and gradient colors and tracks in-place stop changes',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    const color = page.getByRole('combobox', { name: 'Beam color', exact: true });
    await color.selectOption('solid');

    await expect.poll(() => variable(beam, 'beam-gradient')).toBe(
      'linear-gradient(to left, #36cfc9 0%, #36cfc9 70%, transparent)'
    );

    await color.selectOption('gradient');

    await expect.poll(() => variable(beam, 'beam-gradient')).toBe(
      'linear-gradient(to left, #1677ff 0%, #36cfc9 38.5%, #95de64 70%, transparent)'
    );

    await page.getByRole('button', { name: 'Change gradient stop', exact: true }).click();

    await expect.poll(() => variable(beam, 'beam-gradient')).toBe(
      'linear-gradient(to left, #1677ff 0%, #36cfc9 21%, #95de64 70%, transparent)'
    );

    await color.selectOption('empty');

    await expect.poll(() => variable(beam, 'beam-gradient')).toBe('');
    expect(await pseudo(beam, 'background-image')).toContain('rgb(82, 196, 26)');
  }
);

test(
  'BorderBeam snapshots border widths per host while inheriting live corner radii',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    await page.getByLabel('Wider host border', { exact: true }).check();
    await page.getByLabel('Change host radius', { exact: true }).check();

    await expect(page.locator('#border-beam-host')).toHaveCSS('border-top-width', '5px');
    await expect(beam).toHaveCSS('border-top-left-radius', '12px');
    await expect(beam).toHaveCSS('border-top-right-radius', '24px');
    await expect(beam).toHaveCSS('border-bottom-right-radius', '36px');
    await expect(beam).toHaveCSS('border-bottom-left-radius', '48px');
    expect(await variable(beam, 'inset-offset')).toBe('-1px -2px -3px -4px');

    await page.getByRole('button', { name: 'Replace beam host', exact: true }).click();

    await expect(beam).toHaveCount(1);
    await expect.poll(() => variable(beam, 'inset-offset')).toBe('-5px -6px -7px -8px');
    await expect(beam).toHaveCSS('border-top-left-radius', '12px');
  }
);

test(
  'BorderBeam preserves static positioning without inspecting or patching the host',
  async ({ page }) => {
    await page.getByLabel('Static beam host', { exact: true }).check();

    await expect(page.locator('#border-beam-host')).toHaveCSS('position', 'static');
    await expect(layers(page.locator('#border-beam-host'))).toHaveCount(1);
  }
);

test(
  'BorderBeam removes old layers on target changes, missing targets and unmount',
  async ({ page }) => {
    const first = layers(page.locator('#moving-host-a'));
    const second = layers(page.locator('#moving-host-b'));
    await expect(first).toHaveCount(1);
    await page.getByLabel('Second beam target', { exact: true }).check();

    await expect(first).toHaveCount(0);
    await expect(second).toHaveCount(1);
    expect(await variable(second, 'inset-offset')).toBe('-4px -4px -4px -4px');

    await page.getByLabel('Available beam target', { exact: true }).uncheck();

    await expect(second).toHaveCount(0);

    await page.getByLabel('Available beam target', { exact: true }).check();
    await page.getByLabel('Mount moving beam', { exact: true }).uncheck();

    await expect(first).toHaveCount(0);
    await expect(second).toHaveCount(0);

    await page.getByLabel('Mount moving beam', { exact: true }).check();

    await expect(second).toHaveCount(1);
  }
);

test(
  'BorderBeam merges common config and replaces nested config as a whole',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    const card = layers(page.locator('.beam-card'));

    await expect(beam).toHaveClass(/beam-context primary-beam/);
    await expect(beam).toHaveCSS('opacity', '0.8');
    await expect(beam).toHaveCSS('outline-offset', '6px');
    await expect(card).toHaveClass(/beam-context card-beam/);
    await expect(card).toHaveCSS('opacity', '0.5');

    await page.getByLabel('Replace beam config', { exact: true }).check();

    await expect(card).toHaveClass(/nested-beam-context/);
    await expect(card).not.toHaveClass(/(?:^| )beam-context(?: |$)/);
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('outline-offset', '0px');
  }
);

test(
  'BorderBeam keeps style defaults but gives props priority and phases from the prop duration',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    await page.getByLabel('Beam count', { exact: true }).fill('3');
    await page.getByLabel('Custom beam variables', { exact: true }).check();

    await expect(beam).toHaveCount(3);
    await expect.poll(() => variable(beam.first(), 'size')).toBe('84px');
    expect(await variable(beam.first(), 'inset-offset')).toBe('-1px -2px -3px -4px');
    expect(await pseudo(beam.first(), 'animation-duration')).toBe('9s');
    expect(await variable(beam.first(), 'delay')).toBe('1s');
    expect(await variable(beam.nth(1), 'delay')).toBe('-2s');

    await page.getByLabel('Customize beam', { exact: true }).check();

    await expect.poll(() => variable(beam.first(), 'size')).toBe('160px');
    expect(await pseudo(beam.first(), 'animation-duration')).toBe('12s');
    expect(await variable(beam.nth(1), 'delay')).toBe('-4s');
    expect(await variable(beam.first(), 'inset-offset')).toBe('-4px');
  }
);

test(
  'BorderBeam preserves existing layers when updating count and props',
  async ({ page }) => {
    const host = page.locator('#border-beam-host');
    await layers(host).evaluate(element => { element.setAttribute('data-original-layer', 'true'); });
    await page.getByLabel('Beam count', { exact: true }).fill('3');
    await page.getByLabel('Customize beam', { exact: true }).check();

    await expect(layers(host)).toHaveCount(3);
    await expect(layers(host).first()).toHaveAttribute('data-original-layer', 'true');

    await page.getByLabel('Beam count', { exact: true }).fill('1');

    await expect(layers(host)).toHaveCount(1);
    await expect(layers(host)).toHaveAttribute('data-original-layer', 'true');
  }
);

test(
  'BorderBeam disables decorative animation for reduced motion and restores it afterward',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect.poll(() => pseudo(beam, 'display')).toBe('none');
    expect(await pseudo(beam, 'animation-name')).toBe('none');
    expect(await beam.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);

    await page.emulateMedia({ reducedMotion: 'no-preference' });

    await expect.poll(() => pseudo(beam, 'animation-name')).toBe('antBorderBeamMove');
    expect(await pseudo(beam, 'display')).not.toBe('none');
  }
);

test(
  'BorderBeam supports CSS hover visibility and pause without a JavaScript listener',
  async ({ page }) => {
    const host = page.locator('.beam-hover-host');
    const beam = layers(host);

    await expect(beam).toHaveCSS('opacity', '0');
    expect(await pseudo(beam, 'animation-play-state')).toBe('paused');

    await host.hover();

    await expect(beam).toHaveCSS('opacity', '1');
    expect(await pseudo(beam, 'animation-play-state')).toBe('running');
  }
);

test(
  'BorderBeam follows theme changes while remaining independent of disabled, locale and RTL',
  async ({ page }) => {
    const beam = layers(page.locator('#border-beam-host'));
    const background = await pseudo(beam, 'background-image');
    await page.getByLabel('Dark beam theme', { exact: true }).check();

    await expect(beam).toHaveCSS('color-scheme', 'dark');

    await page.getByLabel('Purple beam primary', { exact: true }).check();

    await expect.poll(() => pseudo(beam, 'background-image')).not.toBe(background);

    await page.getByLabel('Disable all components', { exact: true }).check();
    await page.getByLabel('Right to left', { exact: true }).check();
    await page.getByLabel('English locale', { exact: true }).check();

    await expect(beam).toHaveCSS('direction', 'rtl');
    await expect(beam).toHaveCSS('pointer-events', 'none');
    expect(await variable(beam, 'inset-offset')).toBe('-1px -2px -3px -4px');
    expect(await pseudo(beam, 'animation-name')).toBe('antBorderBeamMove');
  }
);
