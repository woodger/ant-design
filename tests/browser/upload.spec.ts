import { test, expect } from './test';
import type { Page } from '@playwright/test';

const input = (page: Page) => page.locator('#upload-input');
const payload = (name = 'a.txt', content = 'content') =>
  ({ name, mimeType: 'text/plain', buffer: Buffer.from(content) });
const owner = (page: Page) => page.getByLabel('Upload value', { exact: true });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=upload'); });

test(
  'Upload retains manual selections without a status or transport and allows selecting the same file again',
  async ({ page }) => {
    await input(page).setInputFiles([payload(), payload('b.txt')]);

    await expect(owner(page)).toContainText('b.txt');
    await expect(owner(page)).not.toContainText('uploading');
    await expect(page.getByLabel('Request count', { exact: true })).toHaveText('0');

    await input(page).setInputFiles(payload());

    await expect(
      page.locator('#upload-fixture .ant-upload-list').first().getByText(
        'a.txt',
        { exact: true }
      )
    )
      .toHaveCount(2);
  }
);

test(
  'Upload excludes LIST_IGNORE and keeps rejected files available for manual handling',
  async ({ page }) => {
    await input(page).setInputFiles([payload('ignore.txt'), payload('reject.txt'), payload()]);

    await expect(owner(page)).toContainText('reject.txt');
    await expect(owner(page)).toContainText('a.txt');
    await expect(owner(page)).not.toContainText('ignore.txt');
    await expect(page.getByLabel('Request count', { exact: true })).toHaveText('0');
  }
);

test(
  'Upload publishes progress, success and error statuses with accessible error text',
  async ({ page }) => {
    await page.getByLabel('Upload mode', { exact: true }).selectOption('auto');
    await input(page).setInputFiles(payload());

    await expect(owner(page)).toContainText('uploading');

    await page.getByRole('button', { name: 'Upload progress', exact: true }).click();

    await expect(page.getByRole('progressbar', { name: 'Загрузка... a.txt', exact: true })).toHaveAttribute(
      'aria-valuenow',
      '42'
    );

    await page.getByRole('button', { name: 'Finish upload', exact: true }).click();

    await expect(owner(page)).toContainText('done');

    await input(page).setInputFiles(payload('fail.txt'));
    await page.getByRole('button', { name: 'Fail upload', exact: true }).click();

    await expect(owner(page)).toContainText('error');

    await page.getByText('fail.txt', { exact: true }).hover();

    await expect(page.getByRole('tooltip')).toHaveText('Upload fixture error');
  }
);

test(
  'Upload async removal veto preserves files and approval aborts active transport',
  async ({ page }) => {
    await page.getByLabel('Upload mode', { exact: true }).selectOption('auto');
    await input(page).setInputFiles(payload());

    const item = page.locator('#upload-fixture .ant-upload-list').first()
      .locator('.ant-upload-list-item');

    await page.getByLabel('Veto removal', { exact: true }).check();
    await item.hover();
    await item.getByRole('button', { name: 'Удалить файл', exact: true }).click();

    await expect(owner(page)).toContainText('a.txt');

    await page.getByLabel('Veto removal', { exact: true }).uncheck();
    await item.hover();
    await item.getByRole('button', { name: 'Удалить файл', exact: true }).click();

    await expect(owner(page)).toHaveText('[]');
    await expect(page.getByLabel('Aborted uploads', { exact: true })).toHaveText('1');

    await page.getByRole('button', { name: 'Upload progress', exact: true }).click();

    await expect(owner(page)).toHaveText('[]');
  }
);

test('Upload controlled rejection leaves the owner list unchanged', async ({ page }) => {
  await page.getByLabel('Accept upload changes', { exact: true }).uncheck();
  await input(page).setInputFiles(payload());

  await expect(page.getByLabel('Upload events', { exact: true })).toContainText('a.txt');
  await expect(owner(page)).toHaveText('[]');
});

test(
  'Upload maxCount replaces a single file and retains the first entries for larger limits',
  async ({ page }) => {
    await page.getByLabel('Max files', { exact: true }).fill('1');
    await input(page).setInputFiles([payload(), payload('b.txt')]);

    await expect(owner(page)).toContainText('b.txt');
    await expect(owner(page)).not.toContainText('a.txt');

    await page.getByRole('button', { name: 'Clear upload owner', exact: true }).click();
    await page.getByLabel('Max files', { exact: true }).fill('2');
    await input(page).setInputFiles([payload(), payload('b.txt'), payload('c.txt')]);

    await expect(owner(page)).toContainText('b.txt');
    await expect(owner(page)).not.toContainText('c.txt');
  }
);

for (const mode of ['auto', 'delegate', 'transform'])
  test(
    `Upload ${mode} uses source XHR multipart, async action/data and headers`,
    async ({ page }) => {
      let body = '';
      let method = '';
      let header = '';

      await page.route(
        '**/upload-fixture/a.txt',
        async route => {
          const request = route.request();
          body = request.postDataBuffer()?.toString() ?? '';
          method = request.method();
          header = request.headers()['x-upload-fixture'];
          await route.fulfill(
            { status: 201, contentType: 'application/json', body: '{"uploaded":true}' }
          );
        }
      );
      await page.getByLabel('Upload mode', { exact: true }).selectOption(mode);
      if (mode !== 'delegate')
        await page.getByLabel('Upload transport', { exact: true }).selectOption('xhr');
      await input(page).setInputFiles(payload());

      await expect(owner(page)).toContainText('done');
      expect(method).toBe('PUT');
      expect(header).toBe('yes');
      expect(body).toContain('name="tags[]"');
      expect(body).toContain('name="attachment"; filename="a.txt"');
      expect(body).toContain(mode === 'transform' ? 'transformed' : 'content');
    }
  );

test(
  'Upload Dragger filters multiple dropped files and handles keyboard file chooser',
  async ({ page }) => {
    const target = page.getByRole(
      'button',
      { name: 'Drop or select files Text files', exact: true }
    );
    const transfer = await page.evaluateHandle(
      () => {
        const data = new DataTransfer();
        data.items.add(new File(['text'], 'drop.txt', { type: 'text/plain' }));
        data.items.add(new File(['png'], 'skip.png', { type: 'image/png' }));

        return data;
      }
    );

    await target.dispatchEvent('dragover', { dataTransfer: transfer });

    await expect(page.locator('.ant-upload-drag')).toHaveClass(/ant-upload-drag-hover/);

    await target.dispatchEvent('drop', { dataTransfer: transfer });

    await expect(page.getByLabel('Upload events', { exact: true })).toContainText('drop:drop.txt');
    await expect(page.getByLabel('Upload events', { exact: true })).not
      .toContainText('skip.png');
    await expect(page.getByLabel('Drop count', { exact: true })).toHaveText('1');

    const chooser = page.waitForEvent('filechooser');

    await target.press('Enter');
    await (await chooser).setFiles(payload('keyboard.txt'));

    await expect(page.getByLabel('Upload events', { exact: true }))
      .toContainText('drop:keyboard.txt');

    await transfer.dispose();
  }
);

test(
  'Upload follows locale RTL and disabled context while preserving preview and download actions',
  async ({ page }) => {
    await input(page).setInputFiles(payload());
    await page.getByLabel('English locale', { exact: true }).check();

    await expect(
      page.locator('.ant-upload-list').first().getByRole(
        'button',
        { name: 'Remove file', exact: true }
      )
    )
      .toHaveCount(1);

    await page.getByLabel('Right to left', { exact: true }).check();

    await expect(page.locator('.ant-upload-wrapper').first()).toHaveAttribute('dir', 'rtl');

    await page.getByLabel('Disable all components', { exact: true }).check();

    await expect(page.getByLabel('Upload files', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('Upload files', { exact: true })).not
      .toHaveAttribute('id');
    await expect(page.getByRole('button', { name: 'Choose files', exact: true }))
      .toBeDisabled();

    const picture = page.locator('.ant-upload-picture-card-wrapper');

    await picture.hover();
    await picture.getByRole('link', { name: 'Preview file', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Preview file', exact: true }))
      .toHaveText('pixel.png');

    await picture.getByRole('button', { name: 'Download file', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Download file', exact: true }))
      .toHaveText('pixel.png');
  }
);

test(
  'Upload aborts active requests on unmount and late callbacks do not publish',
  async ({ page }) => {
    await page.getByLabel('Upload mode', { exact: true }).selectOption('auto');
    await input(page).setInputFiles(payload());

    await expect(page.getByLabel('Request count', { exact: true })).toHaveText('1');

    await page.getByRole('button', { name: 'Toggle upload mount', exact: true }).click();

    await expect(page.getByLabel('Aborted uploads', { exact: true })).toHaveText('1');

    await page.getByRole('button', { name: 'Finish upload', exact: true }).click();

    await expect(owner(page)).toContainText('uploading');
    await expect(owner(page)).not.toContainText('done');
  }
);

test(
  'Upload uncontrolled defaults append files and hide-list keeps processing callbacks',
  async ({ page }) => {
    await page.getByLabel('Default upload', { exact: true }).setInputFiles(payload());

    const list = page.locator('.ant-upload-list').nth(2);

    await expect(list.getByText('initial.txt', { exact: true })).toHaveCount(1);
    await expect(list.getByText('a.txt', { exact: true })).toHaveCount(1);

    await page.getByLabel('Hide upload list', { exact: true }).check();
    await input(page).setInputFiles(payload('hidden.txt'));

    await expect(owner(page)).toContainText('hidden.txt');
    await expect(page.locator('.ant-upload-list')).toHaveCount(5);
  }
);

test(
  'Upload source geometry follows theme tokens and remains usable in a narrow viewport',
  async ({ page }) => {
    await expect(page.locator('.ant-upload-drag')).toHaveCSS('height', '120px');
    await expect(page.locator('.ant-upload-picture-card-wrapper .ant-upload-list-item-container')).toHaveCSS(
      'width',
      '102px'
    );
    await expect(page.locator('.ant-upload-list-item-action').first())
      .toHaveClass(/ant-btn-icon-only/);

    await page.setViewportSize({ width: 375, height: 812 });

    const drag = await page.locator('.ant-upload-drag').boundingBox();

    expect(drag).not.toBeNull();
    expect(drag!.x + drag!.width).toBeLessThanOrEqual(375);

    await page.getByLabel('Right to left', { exact: true }).check();

    await expect(page.locator('.ant-upload-drag')).toHaveCSS('direction', 'rtl');
  }
);

test(
  'Upload generates a picture preview from the selected file and keeps preview keyboard accessible',
  async ({ page }) => {
    const png = {
      name: 'local.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4XQAAAAASUVORK5CYII=',
        'base64'
      )
    };

    await page.getByLabel('Picture upload', { exact: true }).setInputFiles(png);

    const item = page.locator('.ant-upload-picture-card-wrapper .ant-upload-list-item-container')
      .last();

    await expect(item.getByRole('img', { name: 'local.png', exact: true })).toBeVisible();

    await item.hover();

    const preview = item.getByRole('link', { name: 'Предпросмотр файла', exact: true });

    await preview.focus();
    await preview.press('Enter');

    await expect(page.getByRole('status', { name: 'Preview file', exact: true }))
      .toHaveText('local.png');
  }
);

test('Upload inherits Form disabled and permits an explicit enabled override', async ({ page }) => {
  await expect(page.getByLabel('Form disabled upload', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Disabled form files', exact: true }))
    .toBeDisabled();
  await expect(page.getByLabel('Form enabled override', { exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Override form files', exact: true })).toBeEnabled();
});
