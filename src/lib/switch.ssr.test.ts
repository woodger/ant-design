import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Switch, { type SwitchProps } from './Switch.svelte';

describe('Switch server rendering', () => {
  it(
    'renders a labelled unchecked native button without submitting or serializing a value',
    () => {
      const { body } = render(
        Switch,
        { props: { name: 'notifications', 'aria-label': 'Notifications' } }
      );

      expect(body).toContain('type="button"');
      expect(body).toContain('role="switch"');
      expect(body).toContain('aria-checked="false"');
      expect(body).toContain('aria-label="Notifications"');
      expect(body).not.toContain('type="hidden"');
      expectTypeOf<NonNullable<SwitchProps['onCheckedChange']>>().parameter(0).toEqualTypeOf<
        boolean
      >();
    }
  );

  it('renders checked defaults and their native field with an external form owner', () => {
    const { body } = render(
      Switch,
      {
        props: {
          defaultChecked: true,
          name: 'notifications',
          form: 'preferences',
          'aria-label': 'Notifications'
        }
      }
    );

    expect(body).toContain('aria-checked="true"');
    expect(body).toMatch(
      /<input[^>]*type="hidden"[^>]*name="notifications"[^>]*value="on"[^>]*form="preferences"/
    );
    expect(body).toContain('ant-switch-checked');
  });

  it(
    'uses an explicit false checked value instead of defaults without notifying the owner',
    () => {
      const { body } = render(Switch, {
        props: {
          checked: false,
          defaultChecked: true,
          name: 'notifications',
          onCheckedChange: () => {
            throw new Error('Unexpected change callback');
          }
        }
      });

      expect(body).toContain('aria-checked="false"');
      expect(body).not.toContain('type="hidden"');
    }
  );

  it(
    'disables both interaction and native submission while loading even with an explicit enabled prop',
    () => {
      const { body } = render(
        Switch,
        {
          props: {
            checked: true,
            loading: true,
            disabled: false,
            name: 'notifications',
            'aria-label': 'Notifications'
          }
        }
      );

      expect(body).toContain('aria-busy="true"');
      expect(body).toContain('ant-switch-loading');
      expect(body).toContain('ant-switch-loading-icon');
      expect(body).toMatch(/<button[^>]*\sdisabled(?:[\s=>])/);
      expect(body).toMatch(/<input[^>]*\sdisabled(?:[\s=>])/);
    }
  );

  it('renders both state snippets as decorative content under a stable accessible name', () => {
    const checkedChildren = createRawSnippet(() => ({ render: () => '<span>Enabled</span>' }));
    const unCheckedChildren = createRawSnippet(() => ({ render: () => '<span>Disabled</span>' }));
    const { body } = render(
      Switch,
      {
        props: {
          checkedChildren,
          unCheckedChildren,
          size: 'small',
          'aria-label': 'Notifications'
        }
      }
    );

    expect(body).toContain('ant-switch-small');
    expect(body).toContain('<span>Enabled</span>');
    expect(body).toContain('<span>Disabled</span>');
    expect(body).toMatch(/class="ant-switch-inner"[^>]*aria-hidden="true"/);
    expect(body).toContain('aria-label="Notifications"');
  });

  it('escapes a caller-provided accessible label before hydration', () => {
    const { body } = render(
      Switch,
      { props: { 'aria-label': '"><script>alert(1)</script>', disabled: true } }
    );

    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&quot;');
    expect(body).toContain('ant-switch-disabled');
  });
});
