import { test, expect } from './test';
import type { Page } from '@playwright/test';
import { imageOne, imageTwo } from './fixtures/image-data';

const trigger = (page: Page) => page.getByRole('button', { name: 'Photo one', exact: true });
const viewer = (page: Page) => page.getByRole('dialog', { name: 'Photo one', exact: true });
const picture = (page: Page) => viewer(page).getByRole('img', { name: 'Photo one', exact: true });

async function lastTransform(page: Page) {
  const values = JSON.parse(
    await page.getByLabel('Image transforms', { exact: true }).innerText()
  );

  return values.at(-1);
}

async function setCheckbox(page: Page, name: string, checked: boolean) {
  await page.getByLabel(name, { exact: true }).evaluate(
    (el, next) => {
      const input = el as HTMLInputElement;
      input.checked = next;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    checked
  );
}

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=image'); });

test(
  'Image native keyboard trigger opens preview, locks scroll and restores focus after close while retaining DOM',
  async ({ page }) => {
    await trigger(page).focus();
    await trigger(page).press('Enter');

    await expect(viewer(page)).toBeVisible();
    await expect(viewer(page)).toBeFocused();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await expect(page.getByLabel('Image openings', { exact: true })).toHaveText('[true]');

    await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(viewer(page)).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();
    await expect(page.locator('dialog.ant-image-preview')).toHaveCount(1);
    await expect(page.getByLabel('Image after openings', { exact: true }))
      .toHaveText('[true,false]');

    await trigger(page).press('Space');

    await expect(viewer(page)).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(viewer(page)).toHaveCount(0);
  }
);

test(
  'Image controlled rejection preserves owner state for opening and closing requests',
  async ({ page }) => {
    await page.getByLabel('Accept image changes', { exact: true }).uncheck();
    await trigger(page).click();

    await expect(viewer(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Open image owner', exact: true }).click();

    await expect(viewer(page)).toBeVisible();

    await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(viewer(page)).toBeVisible();
    await expect(page.getByLabel('Image openings', { exact: true })).toHaveText('[true,false]');

    await page.getByRole('button', { name: 'Close image owner', exact: true })
      .dispatchEvent('click');

    await expect(viewer(page)).toHaveCount(0);
  }
);

test(
  'Image preview false produces a passive image and global form-control disabled does not disable preview',
  async ({ page }) => {
    await page.getByLabel('Enable image preview', { exact: true }).uncheck();

    await expect(trigger(page)).toHaveCount(0);

    await page.getByRole('img', { name: 'Photo one', exact: true }).click();

    await expect(viewer(page)).toHaveCount(0);

    await page.getByLabel('Enable image preview', { exact: true }).check();
    await page.getByLabel('Disable all components', { exact: true }).check();
    await trigger(page).click();

    await expect(viewer(page)).toBeVisible();
  }
);

test(
  'Image zoom buttons honor scale bounds and transforms rotate and flip the displayed image',
  async ({ page }) => {
    await trigger(page).click();
    await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1.5);
    await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(2.25);

    await expect(viewer(page).getByRole('button', { name: 'zoomIn', exact: true })).toBeDisabled();

    await viewer(page).getByRole('button', { name: 'rotateRight', exact: true }).click();

    await expect(picture(page)).toHaveAttribute('style', /rotate\(90deg\)/);

    await viewer(page).getByRole('button', { name: 'flipX', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.flipX).toBe(true);
    await viewer(page).getByRole('button', { name: 'flipY', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.flipY).toBe(true);

    expect(await picture(page).evaluate(el => (el as HTMLImageElement).style.transform))
      .toContain('scale3d(-2.25, -2.25, 1)');
  }
);

test(
  'Image wheel respects its switch and double-click toggles zoom using source defaults',
  async ({ page }) => {
    await page.getByLabel('Image wheel', { exact: true }).uncheck();
    await trigger(page).click();
    await picture(page).hover();
    await page.mouse.wheel(0, -100);

    await expect(viewer(page).getByRole('button', { name: 'zoomOut', exact: true })).toBeDisabled();

    await setCheckbox(page, 'Image wheel', true);
    await page.mouse.wheel(0, -100);
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1.5);
    await picture(page).dblclick();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1);

    await expect(viewer(page).getByRole('button', { name: 'zoomOut', exact: true })).toBeDisabled();
  }
);

test(
  'Image pointer drag moves enlarged images and rebounds when both coordinates exceed viewport bounds',
  async ({ page }) => {
    await trigger(page).click();
    await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1.5);
    await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(2.25);
    await page.mouse.move(640, 350);
    await page.mouse.down();
    await page.mouse.move(1100, 650, { steps: 5 });
    await expect.poll(async () => (await lastTransform(page))?.action).toBe('move');
    await page.mouse.up();
    await expect.poll(async () => (await lastTransform(page))?.action).toBe('dragRebound');

    const transform = (await lastTransform(page)).transform;

    expect(transform.x).toBeLessThan(460);
    expect(transform.y).toBeLessThan(300);
  }
);

test(
  'Image movable false blocks pointer drag while zoom controls remain active',
  async ({ page }) => {
    await page.getByLabel('Image movable', { exact: true }).uncheck();
    await trigger(page).click();
    await page.mouse.move(640, 350);
    await page.mouse.down();
    await page.mouse.move(700, 400);
    await page.mouse.up();

    await expect(page.getByLabel('Image transforms', { exact: true })).toHaveText('[]');

    await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1.5);
  }
);

test(
  'Image custom actions receive the default toolbar and can reset transforms through source action handlers',
  async ({ page }) => {
    await page.getByLabel('Custom image actions', { exact: true }).check();
    await trigger(page).click();
    await viewer(page).getByRole('button', { name: 'rotateLeft', exact: true }).click();

    await expect(viewer(page).getByLabel('Rendered image transform', { exact: true }))
      .toContainText('"rotate":-90');
    await expect(viewer(page).locator('.custom-image-content')).toHaveAttribute(
      'data-image-width',
      '160'
    );

    await viewer(page).getByRole('button', { name: 'Reset transform', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.action).toBe('reset');

    await expect(picture(page)).toHaveAttribute('style', /rotate\(0deg\)/);
  }
);

test(
  'Image closing resets transformations and reopens the retained preview at its initial scale',
  async ({ page }) => {
    await trigger(page).click();
    await viewer(page).getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1.5);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await lastTransform(page))?.action).toBe('close');
    await trigger(page).click();

    await expect(viewer(page).getByRole('button', { name: 'zoomOut', exact: true }))
      .toBeDisabled();
  }
);

test(
  'Image supports blur and nonclosable masks while Escape remains available',
  async ({ page }) => {
    await page.getByLabel('Image mask closable', { exact: true }).uncheck();
    await page.getByLabel('Image blur', { exact: true }).check();
    await trigger(page).click();

    const mask = viewer(page).locator('.ant-image-preview-mask');

    await expect(mask).toHaveCSS('backdrop-filter', 'blur(4px)');

    await mask.click({ position: { x: 4, y: 4 } });

    await expect(viewer(page)).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(viewer(page)).toHaveCount(0);
  }
);

test(
  'Image focusTrap false permits external focus and closes from Escape without leaving scroll locked',
  async ({ page }) => {
    await page.getByLabel('Image focus trap', { exact: true }).uncheck();
    await trigger(page).click();

    await expect(viewer(page)).toBeVisible();
    await expect(viewer(page)).not.toHaveJSProperty('ariaModal', 'true');

    const outside = page.getByRole('button', { name: 'Restore image source', exact: true });

    await outside.focus();

    await expect(outside).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(viewer(page)).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  }
);

test(
  'Image nested in Modal consumes Escape before its host and restores the thumbnail focus',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Open image modal', exact: true }).click();

    const host = page.getByRole('dialog', { name: 'Image host modal', exact: true });

    await host.getByRole('button', { name: 'Modal photo', exact: true }).click();

    const image = page.getByRole('dialog', { name: 'Modal photo', exact: true });

    await expect(image).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(image).toHaveCount(0);
    await expect(host).toBeVisible();
    await expect(host.getByRole('button', { name: 'Modal photo', exact: true }))
      .toBeFocused();

    await host.getByRole('button', { name: 'Close image host', exact: true }).click();

    await expect(host).toHaveCount(0);
  }
);

test(
  'Image fallback keeps source error state and a new source clears the fallback',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Break image source', exact: true }).click();

    await expect(trigger(page)).toHaveClass(/ant-image-error/);
    await expect(trigger(page).getByRole('img')).toHaveAttribute('src', imageTwo);
    await expect(page.getByLabel('Image errors', { exact: true })).toHaveText('1');

    await page.getByRole('button', { name: 'Restore image source', exact: true }).click();

    await expect(trigger(page)).not.toHaveClass(/ant-image-error/);
    await expect(trigger(page).getByRole('img')).toHaveAttribute('src', imageOne);
  }
);

test(
  'Image custom placeholder stays during loading and is removed after native load',
  async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });

    await page.route(
      '**/fixture-image-slow.svg',
      async route => {
        await gate;
        await route.fulfill(
          {
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="blue"/></svg>'
          }
        );
      }
    );
    await page.getByRole('button', { name: 'Load slow image', exact: true }).click();

    const loading = page.getByRole('button', { name: 'Loading photo', exact: true });

    await expect(loading.getByText('Image loading', { exact: true })).toBeVisible();

    release();

    await expect(loading.getByText('Image loading', { exact: true })).toHaveCount(0);
    expect(
      await loading.getByRole('img').evaluate(el => (el as HTMLImageElement).naturalWidth)
    )
      .toBe(600);
  }
);

test(
  'Image ignores stale source failures and callbacks after its original image node is replaced',
  async ({ page }) => {
    let release!: () => void;
    let requests = 0;
    const gate = new Promise<void>(resolve => { release = resolve; });

    await page.route(
      '**/fixture-image-stale.svg',
      async route => {
        requests++;
        await gate;
        await route.fulfill({ contentType: 'image/svg+xml', body: 'not an image' });
      }
    );
    await page.getByRole('button', { name: 'Set stale image source', exact: true }).click();
    await expect.poll(() => requests).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Restore image source', exact: true }).click();
    release();

    await expect(trigger(page).getByRole('img')).toHaveAttribute('src', imageOne);
    await expect(trigger(page)).not.toHaveClass(/ant-image-error/);
    await expect(page.getByLabel('Image errors', { exact: true })).toHaveText('0');
  }
);

test(
  'Image preview source can differ from its thumbnail and English locale labels its close action',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Use alternate preview', exact: true }).click();
    await page.getByLabel('English locale', { exact: true }).check();
    await trigger(page).click();

    await expect(picture(page)).toHaveAttribute('src', imageTwo);
    await expect(trigger(page).getByRole('img')).toHaveAttribute('src', imageOne);
    await expect(viewer(page).getByRole('button', { name: 'Close', exact: true }))
      .toBeVisible();
  }
);

test('Image unmount releases dialog scroll and queued transform work', async ({ page }) => {
  await trigger(page).click();
  await viewer(page).getByRole('button', { name: 'zoomIn', exact: true })
    .dispatchEvent('click');
  await page.getByRole('button', { name: 'Toggle image mount', exact: true })
    .dispatchEvent('click');

  await expect(viewer(page)).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('dialog.ant-image-preview')).toHaveCount(0);
});

test(
  'Image handles real touch pinch zoom and restores temporary underscale on touch end',
  async ({ page }) => {
    await trigger(page).click();

    const session = await page.context().newCDPSession(page);

    await session.send(
      'Input.dispatchTouchEvent',
      {
        type: 'touchStart',
        touchPoints: [{ x: 600, y: 330, id: 1 }, { x: 680, y: 330, id: 2 }]
      }
    );
    await session.send(
      'Input.dispatchTouchEvent',
      {
        type: 'touchMove',
        touchPoints: [{ x: 560, y: 330, id: 1 }, { x: 720, y: 330, id: 2 }]
      }
    );
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(2);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.send(
      'Input.dispatchTouchEvent',
      {
        type: 'touchStart',
        touchPoints: [{ x: 600, y: 330, id: 1 }, { x: 680, y: 330, id: 2 }]
      }
    );
    await session.send(
      'Input.dispatchTouchEvent',
      {
        type: 'touchMove',
        touchPoints: [{ x: 630, y: 330, id: 1 }, { x: 650, y: 330, id: 2 }]
      }
    );
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(0.5);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await lastTransform(page))?.transform.scale).toBe(1);
    await session.detach();
  }
);

test(
  'Image can switch focus trapping while open and keeps preview available without a mask',
  async ({ page }) => {
    await trigger(page).click();

    await expect(viewer(page)).toBeVisible();

    await setCheckbox(page, 'Image focus trap', false);

    await expect(page.locator('dialog.ant-image-preview:modal')).toHaveCount(0);

    await setCheckbox(page, 'Image mask', false);

    await expect(viewer(page).locator('.ant-image-preview-mask')).not.toBeVisible();

    await setCheckbox(page, 'Image focus trap', true);

    await expect(page.locator('dialog.ant-image-preview:modal')).toHaveCount(1);
    await expect(page.getByLabel('Image after openings', { exact: true })).toHaveText('[true]');
  }
);
