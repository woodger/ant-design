import { test, expect } from './test';
import type { Locator } from '@playwright/test';

const ownMark = (root: Locator) => root.locator(':scope > div[style*="background-image"]');

async function frame(root: Locator) {
  await root.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function tile(mark: Locator, background?: string) {
  return mark.evaluate(async (element, background) => {
    const url = /url\(["']?(.*?)["']?\)/.exec(background ?? getComputedStyle(element).backgroundImage)![1];
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    let painted = 0; let red = 0; let blue = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3]) painted++;
      if (pixels[index + 3] && pixels[index] > 200 && pixels[index + 1] < 30 && pixels[index + 2] < 30) red++;
      if (pixels[index + 3] && pixels[index + 2] > 200 && pixels[index] < 30 && pixels[index + 1] < 30) blue++;
    }
    return { url, width: image.width, height: image.height, painted, red, blue };
  }, background);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const state = { serializations: 0, text: [] as { text: string; font: string; color: string; align: string; x: number; y: number }[], invalidDraws: 0 };
    Object.assign(window, { watermarkTrace: state });
    const encode = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) { state.serializations++; return encode.apply(this, args); };
    const write = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
      state.text.push({ text, font: this.font, color: String(this.fillStyle), align: this.textAlign, x, y });
      if (maxWidth === undefined) write.call(this, text, x, y); else write.call(this, text, x, y, maxWidth);
    };
  });
  await page.goto('http://127.0.0.1:4174?fixture=watermark');
  await expect(ownMark(page.locator('.fixture-watermark'))).toBeAttached();
  await frame(page.locator('.fixture-watermark'));
});

test('Watermark renders a real repeated PNG without blocking child actions or changing focus', async ({ page }) => {
  const root = page.locator('.fixture-watermark'); const mark = ownMark(root);
  const pixels = await tile(mark);
  expect(pixels.url).toMatch(/^data:image\/png;base64,/); expect(pixels.painted).toBeGreaterThan(100);
  await expect(mark).toHaveCSS('pointer-events', 'none'); await expect(mark).toHaveCSS('z-index', '999');
  await expect(mark).toHaveCSS('background-repeat', 'repeat'); await expect(mark).toHaveAttribute('aria-hidden', 'true');
  await root.getByRole('button', { name: 'Watermark child action', exact: true }).click();
  await expect(page.getByLabel('Watermark actions', { exact: true })).toHaveText('1');
  await expect(root.getByRole('button', { name: 'Watermark child action', exact: true })).toBeFocused();
  await expect(page.getByLabel('Watermark native element', { exact: true })).toHaveText('DIV');
  await expect(root.locator(':scope > canvas')).toHaveCount(0);
});

test('Watermark retains source clip width and physical offset rules in RTL', async ({ page }) => {
  const root = page.locator('.fixture-watermark'); const mark = ownMark(root);
  await page.getByLabel('Fixed Watermark dimensions', { exact: true }).check();
  await expect(mark).toHaveCSS('background-size', '720px auto');
  await frame(root);
  await page.getByRole('combobox', { name: 'Watermark offset', exact: true }).selectOption('positive');
  await expect(mark).toHaveCSS('left', '150px'); await expect(mark).toHaveCSS('top', '150px');
  await frame(root);
  expect(await mark.evaluate(element => (element as HTMLElement).style.width)).toBe('calc(100% - 150px)');
  await page.getByLabel('Right to left', { exact: true }).check();
  await expect(mark).toHaveCSS('left', '150px');
  await page.getByRole('combobox', { name: 'Watermark offset', exact: true }).selectOption('negative');
  await expect(mark).toHaveCSS('left', '0px'); await expect(mark).toHaveCSS('background-position', '-250px -250px');
  await frame(root);
  await page.getByRole('combobox', { name: 'Watermark offset', exact: true }).selectOption('zero');
  await expect(mark).toHaveCSS('background-position', '-50px -50px');
});

test('Watermark restores a removed node with its cached tile and calls onRemove once', async ({ page }) => {
  const root = page.locator('.fixture-watermark'); const mark = ownMark(root); const previous = await mark.elementHandle();
  const before = await page.evaluate(() => (window as unknown as { watermarkTrace: { serializations: number } }).watermarkTrace.serializations);
  const url = (await tile(mark)).url;
  await mark.evaluate(element => element.remove());
  await expect(mark).toBeAttached();
  expect(await mark.evaluate((element, previous) => element === previous, previous)).toBe(true);
  expect((await tile(mark)).url).toBe(url);
  expect(await page.evaluate(() => (window as unknown as { watermarkTrace: { serializations: number } }).watermarkTrace.serializations)).toBe(before);
  await expect(page.getByLabel('Watermark removals', { exact: true })).toHaveText('1');
});

test('Watermark repairs style and class mutations without reporting a removal', async ({ page }) => {
  const root = page.locator('.fixture-watermark'); const mark = ownMark(root);
  await mark.evaluate(element => { element.setAttribute('style', 'display:none;visibility:hidden'); element.setAttribute('class', 'tampered'); });
  await expect(mark).toHaveCSS('visibility', 'visible'); await expect(mark).toHaveCSS('display', 'block');
  await expect(mark).not.toHaveAttribute('class');
  expect(await mark.evaluate(element => (element as HTMLElement).style.getPropertyPriority('visibility'))).toBe('important');
  await expect(page.getByLabel('Watermark removals', { exact: true })).toHaveText('0');
});

test('Watermark preserves the source hidden-attribute observation boundary', async ({ page }) => {
  const mark = ownMark(page.locator('.fixture-watermark'));
  await mark.evaluate(element => element.setAttribute('hidden', ''));
  await frame(page.locator('.fixture-watermark'));
  await expect(mark).toHaveAttribute('hidden', '');
  await mark.evaluate(element => element.setAttribute('class', 'force-observed-change'));
  await expect(mark).not.toHaveAttribute('hidden');
  await expect(mark).toBeVisible();
});

test('Watermark repairs only the intended root position and overflow while preserving explicit overrides', async ({ page }) => {
  const root = page.locator('.fixture-watermark');
  await root.evaluate(element => { (element as HTMLElement).style.cssText = 'width:250px;position:static;overflow:visible'; });
  await expect(root).toHaveCSS('position', 'relative'); await expect(root).toHaveCSS('overflow', 'hidden');
  expect(await root.evaluate(element => (element as HTMLElement).style.height)).toBe('');
  await page.getByLabel('Custom Watermark root styles', { exact: true }).check();
  await expect(root).toHaveCSS('position', 'absolute'); await expect(root).toHaveCSS('overflow', 'visible');
  await root.evaluate(element => { (element as HTMLElement).style.position = 'fixed'; (element as HTMLElement).style.overflow = 'clip'; });
  await expect(root).toHaveCSS('position', 'absolute'); await expect(root).toHaveCSS('overflow', 'visible');
});

test('Watermark keeps wrapper config priority and replacement in nested providers', async ({ page }) => {
  const root = page.locator('.fixture-watermark');
  await expect(root).toHaveClass('fixture-watermark watermark-context watermark-owner');
  await expect(root).toHaveCSS('opacity', '1');
  await expect(page.locator('.isolated-watermark')).toHaveCSS('opacity', '0.5');
  await expect(page.locator('.isolated-watermark')).not.toHaveClass(/watermark-context/);
  await page.getByLabel('Custom Watermark zIndex', { exact: true }).check();
  await expect(ownMark(root)).toHaveCSS('z-index', '5');
});

test('Watermark draws rich per-line fonts and keeps undefined overrides inherited', async ({ page }) => {
  await page.getByLabel('Rich Watermark font', { exact: true }).check();
  await frame(page.locator('.fixture-watermark'));
  await page.getByRole('combobox', { name: 'Watermark content', exact: true }).selectOption('multi');
  const calls = await page.evaluate(() => (window as unknown as { watermarkTrace: { text: { text: string; font: string; color: string; align: string; x: number; y: number }[] } }).watermarkTrace.text.filter(call => ['First line', 'Second line', 'Inherited font'].includes(call.text)).slice(-3));
  expect(calls.map(call => call.text)).toEqual(['First line', 'Second line', 'Inherited font']);
  expect(calls.map(call => call.y)).toEqual([0, 23, 38]);
  expect(calls[0].font).toContain('20px'); expect(calls[0].font).toContain('serif'); expect(calls[0].align).toBe('left');
  expect(calls[1].font).toContain('12px'); expect(calls[1].font).toContain('italic');
  expect(calls[2].font).toContain('20px');
});

test('Watermark reacts to theme and compact tokens and ignores global control disabled', async ({ page }) => {
  await page.getByLabel('Dark Watermark theme', { exact: true }).check();
  await frame(page.locator('.fixture-watermark'));
  await page.getByLabel('Compact Watermark theme', { exact: true }).check();
  const call = await page.evaluate(() => (window as unknown as { watermarkTrace: { text: { text: string; font: string; color: string }[] } }).watermarkTrace.text.filter(call => call.text === 'Ant Design').at(-1)!);
  expect(call.font).toContain('14px'); expect(call.color.replace(/\s/g, '')).toBe('rgba(255,255,255,0.18)');
  const url = (await tile(ownMark(page.locator('.fixture-watermark')))).url;
  await page.getByLabel('Disable all components', { exact: true }).check();
  expect((await tile(ownMark(page.locator('.fixture-watermark')))).url).toBe(url);
});

test('Watermark supports object content and distinguishes missing and empty text without zero-size copies', async ({ page }) => {
  const mark = ownMark(page.locator('.fixture-watermark'));
  await page.getByRole('combobox', { name: 'Watermark content', exact: true }).selectOption('object');
  await expect.poll(async () => (await tile(mark)).painted).toBeGreaterThan(100);
  await frame(page.locator('.fixture-watermark'));
  await page.getByRole('combobox', { name: 'Watermark content', exact: true }).selectOption('empty');
  await expect.poll(async () => (await tile(mark)).painted).toBe(0);
  await frame(page.locator('.fixture-watermark'));
  await page.getByRole('combobox', { name: 'Watermark content', exact: true }).selectOption('none');
  const pixels = await tile(mark);
  expect([pixels.width, pixels.height, pixels.painted]).toEqual([200, 100, 0]);
});

test('Watermark gives images priority and retains the source cache when only their URL changes', async ({ page }) => {
  const root = page.locator('.fixture-watermark'); const mark = ownMark(root);
  await page.getByRole('combobox', { name: 'Watermark image', exact: true }).selectOption('red');
  await expect.poll(async () => (await tile(mark)).red).toBeGreaterThan(100);
  const red = await tile(mark);
  await frame(root);
  await page.getByRole('combobox', { name: 'Watermark image', exact: true }).selectOption('blue');
  await frame(root);
  expect((await tile(mark)).url).toBe(red.url);
  await page.getByLabel('Watermark rotation', { exact: true }).fill('0');
  await expect.poll(async () => (await tile(mark)).blue).toBeGreaterThan(100);
  expect((await tile(mark)).red).toBe(0);
});

test('Watermark falls back to text using the image default dimensions', async ({ page }) => {
  const mark = ownMark(page.locator('.fixture-watermark'));
  await page.getByRole('combobox', { name: 'Watermark image', exact: true }).selectOption('invalid');
  await expect(mark).toHaveCSS('background-size', '470px auto');
  expect((await tile(mark)).painted).toBeGreaterThan(0);
});

test('Watermark preserves source completion order for overlapping image requests with different dimensions', async ({ page }) => {
  let release!: () => void; let arrived!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; }); const request = new Promise<void>(resolve => { arrived = resolve; });
  const svg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><path fill="${color}" d="M0 0h40v20H0z"/></svg>`;
  await page.route('**/watermark-old.svg', async route => { arrived(); await pending; await route.fulfill({ contentType: 'image/svg+xml', body: svg('red') }); });
  await page.route('**/watermark-new.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: svg('blue') }));
  try {
    await page.getByRole('button', { name: 'Request old Watermark image', exact: true }).click(); await request;
    await page.getByRole('button', { name: 'Request new Watermark image', exact: true }).click();
    const mark = ownMark(page.locator('.fixture-watermark'));
    await expect.poll(async () => (await tile(mark)).blue).toBeGreaterThan(100);
    await mark.evaluate(element => {
      const history: string[] = [];
      const observer = new MutationObserver(() => history.push((element as HTMLElement).style.backgroundImage));
      observer.observe(element, { attributes: true, attributeFilter: ['style'] });
      Object.assign(window, { watermarkHistory: history, watermarkHistoryObserver: observer });
    });
    release();
    await expect.poll(async () => {
      const history = await page.evaluate(() => (window as unknown as { watermarkHistory: string[] }).watermarkHistory);
      const pictures = await Promise.all(history.map(background => tile(mark, background)));
      return pictures.some(picture => picture.red > 100);
    }).toBe(true);
  } finally {
    release();
    await page.evaluate(() => (window as unknown as { watermarkHistoryObserver?: MutationObserver }).watermarkHistoryObserver?.disconnect());
  }
});

test('Watermark inherits into Modal and Drawer panels without blocking their native focus', async ({ page }) => {
  const root = page.locator('.fixture-watermark'); const url = (await tile(ownMark(root))).url;
  await page.getByRole('button', { name: 'Open Watermark Modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Watermark Modal', exact: true });
  expect((await tile(ownMark(modal.locator('.ant-modal-container')))).url).toBe(url);
  await modal.getByRole('button', { name: 'Modal focus target', exact: true }).click();
  await expect(modal.getByRole('button', { name: 'Modal focus target', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(modal).not.toBeVisible();
  await page.getByRole('button', { name: 'Open Watermark Drawer', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Watermark Drawer', exact: true });
  await expect(ownMark(drawer.locator('.ant-drawer-section'))).toBeAttached();
  expect((await tile(ownMark(drawer.locator('.ant-drawer-section')))).url).toBe(url);
  await page.keyboard.press('Escape'); await expect(drawer).not.toBeVisible();
  await expect(drawer.locator('.ant-drawer-section')).toHaveCount(0);
  await expect(page.getByLabel('Watermark removals', { exact: true })).toHaveText('0');
});

test('Watermark inherit false excludes popup panels and nested false falls through to the parent context', async ({ page }) => {
  await page.getByLabel('Inherit Watermark', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Open Watermark Modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Watermark Modal', exact: true });
  await expect(ownMark(modal.locator('.ant-modal-container'))).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByLabel('Nested inherit Watermark', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Open nested Watermark Modal', exact: true }).click();
  const nested = page.getByRole('dialog', { name: 'Nested Watermark Modal', exact: true });
  const own = (await tile(ownMark(page.locator('.outer-watermark')))).url;
  expect((await tile(ownMark(nested.locator('.ant-modal-container')))).url).toBe(own);
  expect((await tile(ownMark(page.locator('.inner-watermark')))).url).not.toBe(own);
});

test('Watermark forwards the nearest context when nested inheritance is enabled', async ({ page }) => {
  await page.getByRole('button', { name: 'Open nested Watermark Modal', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Nested Watermark Modal', exact: true });
  expect((await tile(ownMark(modal.locator('.ant-modal-container')))).url).toBe((await tile(ownMark(page.locator('.inner-watermark')))).url);
});

test('Watermark unmount removes registered overlays without onRemove and permits a fresh instance', async ({ page }) => {
  const root = page.locator('.fixture-watermark');
  await page.getByLabel('Mount Watermark panels', { exact: true }).uncheck();
  await frame(root);
  await expect(page.getByLabel('Watermark removals', { exact: true })).toHaveText('0');
  await page.getByLabel('Mount Watermark', { exact: true }).uncheck();
  await expect(root).toHaveCount(0);
  await page.getByLabel('Mount Watermark', { exact: true }).check();
  await expect(ownMark(root)).toBeAttached();
  await expect(page.getByLabel('Watermark removals', { exact: true })).toHaveText('0');
});

test('Watermark renders DPR two PNG tiles at the same logical background size', async ({ page, browser }) => {
  const other = await browser.newContext({ deviceScaleFactor: 2 });
  const errors: string[] = [];
  try {
    const retina = await other.newPage();
    retina.on('pageerror', error => errors.push(error.message));
    retina.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text()); });
    await retina.goto('http://127.0.0.1:4174?fixture=watermark');
    const regular = await tile(ownMark(page.locator('.fixture-watermark')));
    const mark = ownMark(retina.locator('.fixture-watermark')); await expect(mark).toBeAttached();
    const doubled = await tile(mark);
    expect(doubled.width).toBeGreaterThanOrEqual(regular.width * 2);
    expect(doubled.width).toBeLessThanOrEqual(regular.width * 2 + 1);
    await expect(mark).toHaveCSS('background-size', await ownMark(page.locator('.fixture-watermark')).evaluate(element => getComputedStyle(element).backgroundSize));
  } finally { await other.close(); }
  expect(errors).toEqual([]);
});

test('Watermark gallery hydrates with inherited Modal content and fits a narrow viewport', async ({ page, request }) => {
  expect(await (await request.get('/ant-design')).text()).toContain('id="watermark"');
  await page.goto('/ant-design#watermark');
  const section = page.locator('#watermark'); await expect(section.locator('[style*="background-image"]')).toHaveCount(2);
  await section.getByRole('button', { name: 'Открыть защищённое окно', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Watermark в Modal', exact: true });
  await expect(ownMark(modal.locator('.ant-modal-container'))).toBeVisible();
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 }); await section.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Watermark keeps child controls available when the browser cannot provide a 2D context', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null }); });
  await page.reload();
  const root = page.locator('.fixture-watermark'); await expect(root).toBeVisible();
  await expect(ownMark(root)).toHaveCount(0);
  await root.getByRole('button', { name: 'Watermark child action', exact: true }).click();
  await expect(page.getByLabel('Watermark actions', { exact: true })).toHaveText('1');
});

for (const kind of ['gradient', 'pattern'] as const) test(`Watermark renders a native Canvas ${kind} as font color`, async ({ page }) => {
  await page.getByRole('button', { name: `Use Watermark ${kind}`, exact: true }).click();
  const mark = ownMark(page.locator('.fixture-watermark'));
  await expect.poll(async () => (await tile(mark)).red).toBeGreaterThan(10);
  expect((await tile(mark)).blue).toBeGreaterThan(10);
});

test('Watermark draws without mutation repair when MutationObserver is unavailable at mount', async ({ page }) => {
  const toggle = page.getByLabel('Mount Watermark', { exact: true });
  await toggle.uncheck();
  await toggle.evaluate(async element => {
    const original = window.MutationObserver;
    try {
      Reflect.deleteProperty(window, 'MutationObserver');
      (element as HTMLInputElement).click();
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    } finally { Reflect.set(window, 'MutationObserver', original); }
  });
  const root = page.locator('.fixture-watermark'); const mark = ownMark(root);
  await expect(mark).toBeAttached();
  expect((await tile(mark)).painted).toBeGreaterThan(100);
  await mark.evaluate(element => element.remove()); await frame(root);
  await expect(mark).toHaveCount(0);
});

test('Watermark clears pending image callbacks after unmount without serializing another tile', async ({ page }) => {
  let release!: () => void; let arrived!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; }); const requested = new Promise<void>(resolve => { arrived = resolve; });
  await page.route('**/watermark-old.svg', async route => { arrived(); await pending; await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path fill="red" d="M0 0h10v10H0z"/></svg>' }); });
  try {
    await page.getByRole('button', { name: 'Request old Watermark image', exact: true }).click(); await requested;
    await page.getByLabel('Mount Watermark', { exact: true }).uncheck();
    await expect(page.locator('.fixture-watermark')).toHaveCount(0);
    const before = await page.evaluate(() => (window as unknown as { watermarkTrace: { serializations: number } }).watermarkTrace.serializations);
    const loaded = page.waitForResponse('**/watermark-old.svg'); release(); await loaded;
    await frame(page.locator('#watermark-fixture'));
    expect(await page.evaluate(() => (window as unknown as { watermarkTrace: { serializations: number } }).watermarkTrace.serializations)).toBe(before);
    await expect(page.getByLabel('Watermark removals', { exact: true })).toHaveText('0');
  } finally { release(); }
});
