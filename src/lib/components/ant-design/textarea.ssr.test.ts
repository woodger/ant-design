import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TextArea from './TextArea.svelte';
import TextAreaFixtures from '../../../../e2e/fixtures/TextAreaFixtures.svelte';
import TextAreaFeaturesFixtures from '../../../../e2e/fixtures/TextAreaFeaturesFixtures.svelte';

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
  it('keeps the default and autosize-only shape native and adds source affixes for clear or count', () => {
    const plain = render(TextArea, { props: { value: 'abc', autoSize: true } }).body;
    expect(plain).not.toContain('<span'); expect(plain).toContain('abc');
    const wrapped = render(TextArea, { props: { value: '😀x', showCount: true, maxLength: 2, allowClear: true } }).body;
    expect(wrapped).toContain('ant-input-textarea-affix-wrapper'); expect(wrapped).toContain('ant-input-out-of-range');
    expect(wrapped).toContain('data-count="3 / 2"'); expect(wrapped).toContain('ant-input-clear-icon'); expect(wrapped).toContain('<svg');
  });
  it('renders config priority, semantic callbacks and native constraints on the actual control', () => {
    const body = render(TextAreaFeaturesFixtures).body;
    expect(body).toContain('ant-input-filled'); expect(body).toContain('context-textarea'); expect(body).toContain('owner-textarea');
    expect(body).toContain('Context clear'); expect(body).toContain('autocomplete="off"');
    expect(body).not.toContain('hiddenTextarea');
    const semantics = render(TextArea, { props: { classNames: ({ props }) => ({ textarea: props.disabled ? 'disabled-leaf' : 'enabled-leaf' }), disabled: true, bordered: false, style: 'resize:both', showCount: true } }).body;
    expect(semantics).toContain('disabled-leaf'); expect(semantics).toContain('ant-input-borderless'); expect(semantics).toContain('resize:both');
  });
});
