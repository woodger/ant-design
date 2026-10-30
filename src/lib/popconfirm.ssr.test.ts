import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Popconfirm from './Popconfirm.svelte';
import type { PopconfirmProps } from './popconfirm.types';

const children = createRawSnippet(
  () => ({ render: () => '<button type="button">Delete record</button>' })
);

describe('Popconfirm server rendering', () => {
  it(
    'renders a named hidden dialog with a description, warning icon and native action buttons',
    () => {
      const { body } = render(
        Popconfirm,
        {
          props: { children, title: 'Delete record?', description: 'The record will be removed.' }
        }
      );

      expect(body).toContain('role="dialog"');
      expect(body).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
      expect(body).toContain('ant-popconfirm');
      expect(body).toContain('aria-labelledby="ant-popconfirm-');
      expect(body).toContain('aria-describedby="ant-popconfirm-');
      expect(body).toContain('Delete record?');
      expect(body).toContain('The record will be removed.');
      expect(body).toContain('Подтвердить');
      expect(body).toContain('Отмена');
      expect(body).toContain('ant-popconfirm-message-icon');
      expect(body.match(/type="button"/g)).toHaveLength(3);
      expect(body).not.toContain('type="submit"');
      expectTypeOf<NonNullable<PopconfirmProps['onError']>>().parameter(0).toEqualTypeOf<unknown>();
    }
  );

  it('renders title, description and icon snippets and explicit button labels', () => {
    const title = createRawSnippet(() => ({ render: () => '<strong>Confirm action</strong>' }));
    const description = createRawSnippet(() => ({ render: () => '<span>Details</span>' }));
    const icon = createRawSnippet(() => ({ render: () => '<span>!</span>' }));
    const { body } = render(
      Popconfirm,
      {
        props: {
          children,
          title,
          description,
          icon,
          okText: 'Delete',
          cancelText: 'Keep',
          okButtonProps: { danger: true }
        }
      }
    );

    expect(body).toContain('<strong>Confirm action</strong>');
    expect(body).toContain('<span>Details</span>');
    expect(body).toContain('<span>!</span>');
    expect(body).toContain('Delete');
    expect(body).toContain('Keep');
    expect(body).toContain('ant-btn-dangerous');
  });

  it('supports hiding the cancel button, description, arrow and icon', () => {
    const { body } = render(
      Popconfirm,
      { props: { children, title: 'Confirm?', showCancel: false, icon: null, arrow: false } }
    );

    expect(body).not.toContain('Отмена');
    expect(body).not.toContain('ant-popconfirm-message-icon');
    expect(body).not.toContain('class="ant-popover-arrow');
    expect(body).not.toContain('aria-describedby=');
  });

  it('renders zero as title and description and escapes string content', () => {
    const zero = render(Popconfirm, { props: { children, title: 0, description: 0 } }).body;
    const escaped = render(
      Popconfirm,
      {
        props: {
          children,
          title: '<script>title</script>',
          description: '<script>description</script>'
        }
      }
    ).body;

    expect(zero.replace(/<!--[\s\S]*?-->/g, '').match(/>0<\/div>/g)).toHaveLength(2);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script>');
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('supports %s placement', (placement) => {
    const { body } = render(Popconfirm, { props: { children, title: 'Confirm?', placement } });

    expect(body).toContain(`ant-popover-placement-${placement}`);
  });

  it('keeps defaultOpen safe before hydration and invokes no owner callback', () => {
    const fail = () => {
      throw new Error('Unexpected callback');
    };
    const { body } = render(
      Popconfirm,
      {
        props: {
          children,
          title: 'Confirm?',
          defaultOpen: true,
          onConfirm: fail,
          onCancel: fail,
          onOpenChange: fail,
          onError: fail
        }
      }
    );

    expect(body).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
    expect(body).not.toContain('role="alert"');
  });

  it('disables action buttons without disabling or replacing the caller trigger', () => {
    const { body } = render(
      Popconfirm,
      { props: { children, title: 'Confirm?', disabled: true, defaultOpen: true } }
    );

    expect(body).toContain('<button type="button">Delete record</button>');
    expect(body.match(/<button[^>]*\sdisabled(?:[\s=>])/g)).toHaveLength(2);
  });
});
