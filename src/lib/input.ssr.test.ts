import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Input from './Input.svelte';

describe('Input SSR', () => {
  it('keeps the default native input shape and escapes content without clipping external values', () => {
    const body = render(Input, {
      props: {
        value: '<unsafe>"long',
        defaultValue: 'ignored',
        name: 'text',
        maxLength: 2,
        required: true,
        htmlSize: 8
      }
    }).body;

    expect(body).not.toContain('<span');
    expect(body).not.toContain('ignored');
    expect(body).toContain('&lt;unsafe>');
    expect(body).toContain('maxlength="2"');
    expect(body).toContain('size="8"');
    expect(body).toContain('name="text"');
    expect(body).toContain('ant-input-outlined');
    expect(body).toMatch(/\srequired(?:="")?(?:\s|>)/);
  });

  it('renders source affix order, UTF-16 count, soft range and native clear button', () => {
    const body = render(Input, {
      props: {
        prefix: 'PRE',
        suffix: 'POST',
        allowClear: true,
        showCount: true,
        value: '😀x',
        count: { max: 2 }
      }
    }).body;

    expect(body).toContain('ant-input-affix-wrapper');
    expect(body).toContain('ant-input-out-of-range');
    expect(body).toContain('3 / 2');
    expect(body.indexOf('PRE')).toBeLessThan(body.indexOf('<input'));
    expect(body.indexOf('ant-input-clear-icon')).toBeLessThan(
      body.indexOf('ant-input-show-count-suffix')
    );
    expect(body.indexOf('3 / 2')).toBeLessThan(body.indexOf('POST'));
    expect(body).toContain('type="button"');
    expect(body).toContain('<svg');
  });

  it('places root styles and hidden on the outer addon wrapper while preserving field attrs', () => {
    const body = render(Input, {
      props: {
        value: 'abc',
        addonBefore: 'https://',
        addonAfter: '.org',
        prefix: 'PRE',
        hidden: true,
        style: 'color:blue',
        class: 'root-only',
        'data-identity': 'field',
        variant: 'underlined'
      }
    }).body;

    expect(body).toMatch(/<span[^>]*hidden[^>]*class="[^"]*ant-input-group-wrapper/);
    expect(body).toContain('ant-input-group-wrapper-underlined');
    expect(body).toContain('https://');
    expect(body).toContain('.org');

    const control = body.match(/<input[^>]*>/)![0];
    expect(control).toContain('data-identity="field"');
    expect(control).not.toContain('root-only');
    expect(control).not.toContain('hidden');
  });

  it('exposes resolved size and disabled to semantic callbacks', () => {
    const semantic = render(Input, {
      props: {
        size: 'large',
        disabled: true,
        bordered: false,
        classNames: ({ props }) => ({
          root: props.disabled && props.size === 'large' ? 'resolved-props' : 'invalid-props'
        })
      }
    }).body;

    expect(semantic).toContain('resolved-props');
    expect(semantic).toContain('ant-input-borderless');
    expect(semantic).toContain('ant-input-lg');
  });

  it('keeps native change and input callbacks inert on the server', () => {
    const body = render(Input, {
      props: {
        defaultValue: 'default',
        allowClear: true,
        onValueChange: () => {
          throw new Error('value callback on SSR');
        },
        onChange: () => {
          throw new Error('change callback on SSR');
        },
        onchange: () => {
          throw new Error('native change on SSR');
        }
      }
    }).body;

    expect(body).toContain('default');
    expect(body).toContain('ant-input-clear-icon');
  });
});
