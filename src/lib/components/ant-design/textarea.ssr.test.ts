import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TextArea from './TextArea.svelte';
import TextAreaFixtures from '../../../../e2e/fixtures/TextAreaFixtures.svelte';

describe('TextArea SSR', () => {
  it('escapes multiline content and forwards native constraints without truncating controlled values', () => {
    const body = render(TextArea, { props: { value: 'one\n</textarea><script>bad()</script>', name: 'body', rows: 4, maxlength: 5, required: true, readonly: true } }).body;
    expect(body).toContain('one\n&lt;/textarea>'); expect(body).not.toContain('<script>bad()');
    expect(body).toContain('name="body"'); expect(body).toContain('rows="4"'); expect(body).toContain('maxlength="5"'); expect(body).toMatch(/\srequired(?:="")?(?:\s|>)/); expect(body).toMatch(/\sreadonly(?:="")?(?:\s|>)/);
  });
  it('gives explicit value priority over default and renders status and size', () => {
    const body = render(TextArea, { props: { value: '', defaultValue: 'ignored', status: 'error', size: 'small' } }).body;
    expect(body).not.toContain('ignored'); expect(body).toContain('ant-input-sm'); expect(body).toContain('ant-input-status-error'); expect(body).toContain('aria-invalid="true"');
    expect(render(TextArea, { props: { defaultValue: 'Default\ntext' } }).body).toContain('Default\ntext');
  });
  it('renders FormItem associations and required state without accessing native refs on SSR', () => {
    const body = render(TextAreaFixtures).body;
    expect(body).toContain('Task description'); expect(body).toContain('name="description"'); expect(body).toContain('rows="3"');
    const label = body.match(/<label[^>]*for="([^"]+)"[^>]*>[^<]*Task description/);
    expect(label).not.toBeNull(); expect(body).toContain(`id="${label![1]}"`);
  });
});
