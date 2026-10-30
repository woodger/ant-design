import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        errors.push(`${message.type()}: ${message.text()}`);
      }
    });

    await use(page);

    expect(errors, 'Browser errors and warnings').toEqual([]);
  }
});

export { expect };
