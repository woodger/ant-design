import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Component browser fixtures' })).toBeVisible();
});

test('Form applies vertical and horizontal label layout to its fields', async ({ page }) => {
  const label = page.locator('#form-fixture').getByText('Name', { exact: true });
  const input = page.getByLabel('Name', { exact: true });
  const verticalLabel = (await label.boundingBox())!;
  const verticalInput = (await input.boundingBox())!;

  expect(verticalLabel.x).toBeCloseTo(verticalInput.x, 0);
  expect(verticalLabel.y + verticalLabel.height).toBeLessThanOrEqual(verticalInput.y);

  await page.getByLabel('Horizontal form').check();

  await expect.poll(async () => {
    const labelBounds = (await label.boundingBox())!;
    const inputBounds = (await input.boundingBox())!;

    return labelBounds.x + labelBounds.width <= inputBounds.x && Math.abs(labelBounds.y - inputBounds.y) <= inputBounds.height;
  }).toBe(true);
});

test('Form focuses the first invalid control and connects errors to its accessible description', async ({ page }) => {
  const name = page.getByLabel('Name', { exact: true });
  await name.fill('');
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();

  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Name is required');
  await expect(page.getByRole('status', { name: 'Finished submissions' })).toHaveText('0');

  await name.fill('Alice');

  await expect(name).not.toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Enter your name');
});

test('Form revalidates dependent fields and resets rendered values and errors', async ({ page }) => {
  const password = page.getByLabel('Password', { exact: true });
  const confirmation = page.getByLabel('Confirm password', { exact: true });
  await password.fill('first');
  await confirmation.fill('first');
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Saved name' })).toHaveText('Anna');

  await password.fill('second');

  await expect(confirmation).toHaveAccessibleDescription('Passwords differ');
  await confirmation.fill('second');
  await expect(confirmation).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Reset form', exact: true }).click();

  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Anna');
  await expect(password).toHaveValue('');
  await expect(confirmation).toHaveValue('');
  await expect(page.locator('#form-fixture').getByRole('alert')).toHaveCount(0);
});

test('Form preserves the latest async validation result when responses arrive out of order', async ({ page }) => {
  const asyncValidation = page.getByLabel('Async validation');
  const name = page.getByLabel('Name', { exact: true });
  await asyncValidation.check();
  await name.fill('old');
  await asyncValidation.focus();
  await expect(page.getByRole('status', { name: 'Pending validations' })).toHaveText('1');
  await name.fill('new');
  await expect(page.getByRole('status', { name: 'Pending validations' })).toHaveText('2');

  await page.getByRole('button', { name: 'Accept validation 2', exact: true }).click();
  await page.getByRole('button', { name: 'Reject validation 1', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Pending validations' })).toHaveText('0');
  await expect(name).toHaveValue('new');
  await expect(name).not.toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Enter your name');
});

test('Form ignores pending validation errors after reset', async ({ page }) => {
  await page.getByLabel('Async validation').check();
  const name = page.getByLabel('Name', { exact: true });
  await name.fill('temporary');
  await page.getByLabel('Async validation').focus();
  await expect(page.getByRole('status', { name: 'Pending validations' })).toHaveText('1');

  await page.getByRole('button', { name: 'Reset form', exact: true }).click();
  await page.getByRole('button', { name: 'Reject all validations', exact: true }).click();

  await expect(name).toHaveValue('Anna');
  await expect(name).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#form-fixture').getByRole('alert')).toHaveCount(0);
});

test('Form prevents duplicate submission while onFinish is pending', async ({ page }) => {
  await page.getByLabel('Hold submission').check();
  const submit = page.getByRole('button', { name: 'Submit form', exact: true });
  await submit.dblclick();

  await expect(submit).toBeDisabled();
  await expect(page.getByRole('status', { name: 'Finished submissions' })).toHaveText('1');
  await expect(page.getByLabel('Name', { exact: true })).toBeDisabled();
  await page.locator('#form-fixture form').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await page.getByRole('button', { name: 'Complete submission', exact: true }).click();

  await expect(submit).toBeEnabled();
  await expect(page.getByRole('status', { name: 'Finished submissions' })).toHaveText('1');
  await expect(page.getByRole('status', { name: 'Saved name' })).toHaveText('Anna');
});

test('Form reports a failed submission and permits a successful retry', async ({ page }) => {
  await page.getByLabel('Hold submission').check();
  const submit = page.getByRole('button', { name: 'Submit form', exact: true });
  await submit.click();
  await page.getByRole('button', { name: 'Fail submission', exact: true }).click();

  await expect(page.locator('#form-fixture').getByRole('alert')).toHaveText('Не удалось отправить форму. Попробуйте ещё раз.');
  await expect(page.getByRole('status', { name: 'Submit errors' })).toHaveText('1');
  await expect(submit).toBeEnabled();

  await page.getByLabel('Hold submission').uncheck();
  await submit.click();

  await expect(page.getByRole('status', { name: 'Saved name' })).toHaveText('Anna');
  await expect(page.locator('#form-fixture').getByRole('alert')).toHaveCount(0);
});
