import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Drawer from './Drawer.svelte';

const content = (text: string) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }));

describe('Drawer server rendering', () => {
  it(
    'renders a closed native modal without mounting lazy content or opening a nonmodal dialog',
    () => {
      const { body } = render(
        Drawer,
        { props: { title: 'Account editor', children: content('Lazy fields') } }
      );

      expect(body).toContain('<dialog');
      expect(body).toContain('aria-modal="true"');
      expect(body).toContain('ant-drawer-right');
      expect(body).not.toContain('Lazy fields');
      expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
    }
  );

  it('prepares initially open content for hydration without emitting callbacks', () => {
    const { body } = render(Drawer, {
      props: {
        open: true,
        title: 'Account editor',
        children: content('Editor fields'),
        onClose: () => {
          throw Error('Unexpected close');
        }
      }
    });

    expect(body).toContain('Editor fields');
    expect(body).toContain('<h2');
    const title = body.match(/<h2 id="([^"]+)"/)?.[1];

    expect(title).toBeTruthy();
    expect(body).toContain(`aria-labelledby="${title}"`);
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
  });

  it('force renders a hidden body even with destruction enabled', () => {
    const { body } = render(
      Drawer,
      {
        props: {
          title: 'Forced drawer',
          children: content('Forced content'),
          forceRender: true,
          destroyOnHidden: true
        }
      }
    );

    expect(body).toContain('Forced content');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
  });

  it(
    'renders title, extra and footer snippets with a native non-submitting close button',
    () => {
      const { body } = render(
        Drawer,
        {
          props: {
            open: true,
            title: content('Rich title'),
            children: content('Body'),
            extra: content('Extra action'),
            footer: content('Footer action')
          }
        }
      );

      for (const value of ['Rich title', 'Body', 'Extra action', 'Footer action'])
        expect(body).toContain(value);

      expect(body).toContain('type="button"');
      expect(body).toContain('aria-label="Закрыть"');
      expect(body).not.toContain('type="submit"');
    }
  );

  it('supports named headerless content and external descriptions', () => {
    const { body } = render(
      Drawer,
      {
        props: {
          open: true,
          closable: false,
          'aria-label': 'Preview',
          'aria-describedby': 'preview-help',
          children: content('Details')
        }
      }
    );

    expect(body).toContain('aria-label="Preview"');
    expect(body).toContain('aria-describedby="preview-help"');
    expect(body).not.toContain('ant-drawer-header');
    expect(body).not.toContain('aria-labelledby=');
    expect(body).not.toContain('<button');
  });

  it('lets an explicit accessible name override the visual title', () => {
    const labelled = render(
      Drawer,
      { props: { open: true, title: 'Visual title', 'aria-labelledby': 'external-title' } }
    ).body;
    const named = render(
      Drawer,
      { props: { open: true, title: 'Visual title', 'aria-label': 'Accessible title' } }
    ).body;

    expect(labelled).toContain('aria-labelledby="external-title"');
    expect(named).toContain('aria-label="Accessible title"');
    expect(named).not.toContain('aria-labelledby=');
  });

  it('escapes string titles and applies placement, size, mask and root attributes', () => {
    const { body } = render(
      Drawer,
      {
        props: {
          open: true,
          title: '<script>Title</script>',
          placement: 'bottom',
          size: '50%',
          mask: { blur: true, closable: false },
          id: 'preview-drawer',
          class: 'custom',
          style: 'color: red'
        }
      }
    );

    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).toContain('ant-drawer-bottom');
    expect(body).toContain('--ant-svelte-drawer-size: 50%');
    expect(body).toContain('ant-drawer-mask-blur');
    expect(body).toContain('id="preview-drawer"');
    expect(body).toContain('custom');
    expect(body).toContain('color: red');
  });
});
