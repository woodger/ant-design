import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import InputPassword from './InputPassword.svelte';

describe('InputPassword SSR', () => {
  it('renders a masked input and a named native toggle before the custom suffix', () => {
    const body = render(InputPassword, {
      props: { defaultValue: '<secret>', name: 'password', suffix: 'AFTER', required: true }
    }).body;

    expect(body).toContain('type="password"');
    expect(body).toContain('name="password"');
    expect(body).toContain('&lt;secret>');
    expect(body).toContain('ant-input-affix-wrapper');
    expect(body).toMatch(/<button[^>]*type="button"[^>]*ant-input-password-icon/);
    expect(body).toContain('aria-label="Показать"');
    expect(body).toContain('aria-pressed="false"');
    expect(body.indexOf('ant-input-password-icon')).toBeLessThan(body.indexOf('AFTER'));
    expect(body).toContain('anticon-eye-invisible');
  });

  it('initializes controlled visibility without calling user callbacks on the server', () => {
    const body = render(InputPassword, {
      props: {
        value: 'visible',
        visibilityToggle: {
          visible: true,
          tabIndex: -1,
          onVisibleChange: () => {
            throw new Error('visibility callback on SSR');
          }
        },
        onValueChange: () => {
          throw new Error('value callback on SSR');
        }
      }
    }).body;

    expect(body).toContain('type="text"');
    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('aria-label="Скрыть"');
    expect(body).toContain('tabindex="-1"');
    expect(body).toContain('anticon-eye');
  });

  it('retains the source suffix wrapper when the toggle is hidden', () => {
    const body = render(InputPassword, { props: { visibilityToggle: false } }).body;

    expect(body).toContain('ant-input-affix-wrapper');
    expect(body).toContain('ant-input-suffix');
    expect(body).toContain('type="password"');
    expect(body).not.toContain('<button');
  });

  it('keeps a disabled toggle out of the tab order and preserves native field constraints', () => {
    const body = render(InputPassword, {
      props: {
        disabled: true,
        visibilityToggle: { tabIndex: 5 },
        readOnly: true,
        maxLength: 12,
        size: 'large',
        autoComplete: 'new-password'
      }
    }).body;

    expect(body).toContain('tabindex="-1"');
    expect(body).toContain('aria-disabled="true"');
    expect(body).toContain('ant-input-password-large');
    expect(body).toContain('ant-input-affix-wrapper-lg');
    expect(body).toContain('maxlength="12"');
    expect(body).toContain('autocomplete="new-password"');
    expect(body).toMatch(/<input[^>]*\sreadonly(?:="")?(?:\s|>)/);
  });

  it('resolves password variant and disabled before evaluating semantic callbacks', () => {
    const body = render(InputPassword, {
      props: {
        disabled: true,
        bordered: false,
        classNames: ({ props }) => ({
          root: props.disabled && props.variant === 'borderless' ? 'resolved' : 'incorrect'
        }),
        styles: { root: 'color:red', suffix: 'font-weight:700' },
        style: 'color:blue'
      }
    }).body;

    expect(body).toContain('resolved');
    expect(body).not.toContain('incorrect');
    expect(body).toContain('ant-input-borderless');
    expect(body).toContain('color:red;color:blue');
    expect(body).toContain('font-weight:700');
  });

  it('keeps an accessible button when a custom icon renderer returns nothing', () => {
    const body = render(InputPassword, { props: { iconRender: () => null } }).body;

    expect(body).toContain('ant-input-password-icon');
    expect(body).toContain('aria-label="Показать"');
    expect(body).not.toContain('<svg');
  });
});
