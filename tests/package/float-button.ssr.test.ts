import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { FloatButton } from 'antd-svelte';
import { FloatButtonBackTop } from 'antd-svelte';
import FloatButtonFixtures from '../browser/fixtures/FloatButtonFixtures.svelte';

describe('FloatButton SSR', () => {
  it(
    'reuses native Button without an extra empty content span and retains the default icon',
    () => {
      const body = render(FloatButton, { props: { 'aria-label': 'Action' } }).body;

      expect(body).toContain('<button');
      expect(body).toContain('ant-float-btn-individual');
      expect(body).toContain('ant-float-btn-circle');
      expect(body).toContain('anticon-file-text');
      expect(body).not.toContain('ant-btn-icon-only');
      expect(body.match(/class="ant-btn-icon ant-float-btn-icon"/g)).toHaveLength(1);
      expect(body).not.toContain('class="ant-float-btn-content"');
    }
  );
  it(
    'renders zero content directly without inventing a fallback icon and keeps legacy description fallback',
    () => {
      const body = render(FloatButton, { props: { content: 0, shape: 'square' } }).body;

      expect(body).not.toContain('anticon-file-text');
      expect(body).not.toContain('ant-float-btn-icon-only');
      expect(body.replace(/<!--.*?-->/g, '')).toMatch(/>\s*0\s*<\/button>/);
      expect(render(FloatButton, { props: { description: 'Legacy' } }).body).toContain('Legacy');
      expect(render(FloatButton, { props: { content: false, description: 'Ignored' } }).body).not
        .toContain('Ignored');
    }
  );
  it('uses native href and badge composition with semantic style priority', () => {
    const body = render(
      FloatButton,
      {
        props: {
          href: '#target',
          badge: { count: 5 },
          classNames: { content: 'owner-content' },
          styles: { root: 'color:red', content: 'color:green' },
          style: 'color:blue'
        }
      }
    ).body;

    expect(body).toContain('<a');
    expect(body).toContain('href="#target"');
    expect(body).toContain('ant-float-btn-badge');
    expect(body).toContain('owner-content');
    expect(body).toContain('color:red;color:blue');
    expect(body).toContain('color:green');
  });
  it(
    'renders hidden tooltip content for scalar zero and accepts omitted semantic callback values',
    () => {
      const body = render(
        FloatButton,
        { props: { tooltip: 0, classNames: () => undefined, styles: () => undefined } }
      ).body;

      expect(body).toContain('role="tooltip"');
      expect(body.replace(/<!--.*?-->/g, '')).toMatch(/tabindex="-1">0<\/span>/);
      expect(body).toMatch(/role="tooltip"[^>]*\shidden/);
    }
  );
  it('defers BackTop targets and timers on SSR and shows only threshold zero initially', () => {
    vi.useFakeTimers();
    try {
      const target = () => { throw new Error('DOM on SSR'); };
      expect(render(FloatButtonBackTop, { props: { target } }).body).not.toContain('<button');
      const zero = render(
        FloatButtonBackTop,
        { props: { target, visibilityHeight: 0, showProgress: true } }
      ).body;
      expect(zero).toContain('<button');
      expect(zero).toContain('anticon-vertical-align-top');
      expect(zero).toContain('--ant-float-btn-progress:0turn');
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it(
    'renders a controlled open group with source shape and distinct trigger/list semantic contexts',
    () => {
      const body = render(FloatButtonFixtures, { props: { startOpen: true } }).body;

      expect(body).toContain('ant-float-btn-group-menu-mode');
      expect(body).toContain('aria-expanded="true"');
      expect(body).toContain('First floating child');
      expect(body).toContain('Second floating child');
      expect(body).toContain('Group back to top');
      expect(body).toContain('anticon-close');
    }
  );
});
