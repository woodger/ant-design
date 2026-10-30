import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Alert from './Alert.svelte';
import Icon from './Icon.svelte';

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('Alert server rendering', () => {
  it('renders the official info and outlined defaults without an icon or close button', () => {
    const { body } = render(Alert, { props: { title: 'Saved changes' } });

    expect(body).toContain('role="alert"');
    expect(body).toContain('aria-atomic="true"');
    expect(body).toContain('ant-alert-info');
    expect(body).toContain('ant-alert-outlined');
    expect(body).toContain('Saved changes');
    expect(body).not.toContain('<svg');
    expect(body).not.toContain('<button');
  });

  it('uses warning and an icon for banners while respecting explicit overrides', () => {
    const banner = render(Alert, { props: { banner: true, title: 'Maintenance' } }).body;
    const overridden = render(Alert, { props: { banner: true, type: 'success', showIcon: false } }).body;

    expect(banner).toContain('ant-alert-warning');
    expect(banner).toContain('ant-alert-banner');
    expect(banner).toContain('viewBox="0 0 1024 1024"');
    expect(overridden).toContain('ant-alert-success');
    expect(overridden).not.toContain('<svg');
  });

  it('renders all four status icons decoratively without adding accessible controls', () => {
    for (const type of ['success', 'info', 'warning', 'error'] as const) {
      const { body } = render(Alert, { props: { type, showIcon: true, title: type } });

      expect(body).toContain(`ant-alert-${type}`);
      expect(body).toContain('fill="currentColor"');
      expect(body).toContain('aria-hidden="true"');
      expect(body).not.toContain('<button');
    }
  });

  it('renders title, description, icon and independent action snippets', () => {
    const { body } = render(Alert, { props: { title: snippet('<strong>Upload failed</strong>'), description: snippet('<p>Try another file.</p>'), showIcon: true, icon: snippet('<span>Custom icon</span>'), action: snippet('<button type="button">Retry</button>'), variant: 'filled' } });

    for (const value of ['Upload failed', 'Try another file.', 'Custom icon', 'Retry', 'ant-alert-filled', 'ant-alert-with-description']) expect(body).toContain(value);
    expect(body).not.toContain('<svg');
    expect(body.match(/<button\b/g)).toHaveLength(1);
    expect(body.indexOf('Retry')).toBeGreaterThan(body.indexOf('Try another file.'));
  });

  it('keeps custom icons hidden when showIcon is false and ignores empty string content', () => {
    const { body } = render(Alert, { props: { title: '', description: '', icon: snippet('<span>Unused icon</span>') } });

    expect(body).not.toContain('Unused icon');
    expect(body).not.toContain('ant-alert-with-description');
    expect(body).not.toContain('class="ant-alert-title');
    expect(body).not.toContain('class="ant-alert-description');
  });

  it('escapes string content and creates a non-submitting localized close button', () => {
    const { body } = render(Alert, { props: { title: '<script>Title</script>', description: '<b>Details</b>', closable: true } });

    expect(body).toContain('&lt;script>');
    expect(body).toContain('&lt;b>');
    expect(body).not.toContain('<script>');
    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Закрыть"');
    expect(body).not.toContain('type="submit"');
  });

  it('supports disabled custom closing controls and never calls callbacks in SSR', () => {
    const fail = () => { throw new Error('Unexpected callback'); };
    const { body } = render(Alert, { props: { title: 'Notice', closable: { disabled: true, closeIcon: 'Dismiss', 'aria-label': 'Hide notice', 'aria-describedby': 'close-help', onClose: fail, afterClose: fail } } });

    expect(body).toContain('Dismiss');
    expect(body).toContain('aria-label="Hide notice"');
    expect(body).toContain('aria-describedby="close-help"');
    expect(body).toMatch(/<button[^>]*\sdisabled(?:[\s=>])/);
  });

  it('supports a polite named status and root attributes', () => {
    const { body } = render(Alert, { props: { role: 'status', title: 'Saved', id: 'saved-alert', 'aria-label': 'Save result', 'aria-live': 'polite', 'aria-atomic': false, 'aria-describedby': 'save-help', class: 'custom', style: 'margin-bottom: 16px' } });

    expect(body).toContain('role="status"');
    expect(body).toContain('aria-label="Save result"');
    expect(body).toContain('aria-live="polite"');
    expect(body).toContain('aria-atomic="false"');
    expect(body).toContain('aria-describedby="save-help"');
    expect(body).toContain('id="saved-alert"');
    expect(body).toContain('custom');
    expect(body).toContain('margin-bottom: 16px');
  });

  it('retains the existing outline icon rendering alongside the new filled icons', () => {
    const outline = render(Icon, { props: { name: 'warning' } }).body;
    const filled = render(Icon, { props: { name: 'close-circle-filled' } }).body;

    expect(outline).toContain('viewBox="0 0 24 24"');
    expect(outline).toContain('fill="none"');
    expect(outline).toContain('stroke="currentColor"');
    expect(outline).toContain('<circle');
    expect(filled).toContain('viewBox="0 0 1024 1024"');
    expect(filled).toContain('fill-rule="evenodd"');
    expect(filled).toContain('stroke="none"');
  });
});
