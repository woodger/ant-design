import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Statistic from './Statistic.svelte';

describe('Statistic server rendering', () => {
  it('renders zero by default and preserves zero title prefix and suffix', () => {
    const body = render(Statistic, { props: { title: 0, prefix: 0, suffix: 0 } }).body.replace(/<!--.*?-->/g, '');

    expect(body).toMatch(/class="ant-statistic-title[^"]*">0<\/div>/);
    expect(body).toMatch(/class="ant-statistic-content-prefix[^"]*">0<\/span>/);
    expect(body).toMatch(/class="ant-statistic-content-value-int[^"]*">0<\/span>/);
    expect(body).toMatch(/class="ant-statistic-content-suffix[^"]*">0<\/span>/);
    expect(body).not.toContain('tabindex');
    expect(body).not.toContain('aria-live');
  });

  it('keeps the upstream value structure and escapes unsupported text', () => {
    const number = render(Statistic, { props: { value: '-1234.567', precision: 2 } }).body;
    const text = render(Statistic, { props: { value: '<script>test</script>' } }).body;

    expect(number).toContain('-1,234');
    expect(number).toContain('ant-statistic-content-value-decimal');
    expect(number).toContain('.56');
    expect(text).toContain('&lt;script>test&lt;/script>');
    expect(text).not.toContain('ant-statistic-content-value-int');
  });

  it('supports rich snippets and a formatter receiving the original string value', () => {
    const rich = createRawSnippet(() => ({ render: () => '<strong>Formatted</strong>' }));
    const formatter = vi.fn(() => rich);
    const body = render(Statistic, { props: { value: '12345678901234567890', title: rich, formatter } }).body;

    expect(formatter).toHaveBeenCalledWith('12345678901234567890');
    expect(body).toContain('<strong>Formatted</strong>');
    expect(body).not.toContain('ant-statistic-content-value-int');
  });

  it('replaces the content with Skeleton while loading without evaluating a hidden formatter', () => {
    const formatter = vi.fn(() => 'Hidden');
    const body = render(Statistic, { props: { loading: true, title: 'Users', formatter } }).body;

    expect(body).toContain('Users');
    expect(body).toContain('ant-statistic-skeleton');
    expect(body).toContain('ant-skeleton-active');
    expect(body).not.toMatch(/class="ant-statistic-content(?:\s|")/);
    expect(formatter).not.toHaveBeenCalled();
  });

  it('normalizes semantic callback props and preserves style precedence and native attributes', () => {
    const body = render(Statistic, { props: {
      value: 42, id: 'total', role: 'status', 'aria-label': 'Total', class: 'custom', style: 'color:red', valueStyle: 'color:blue',
      classNames: ({ props }) => ({ root: `value-${props.value}-${props.loading}`, content: 'custom-content' }),
      styles: { root: 'color:green', content: 'color:purple', value: 'font-weight:600' }
    } }).body;

    expect(body).toContain('id="total"');
    expect(body).toContain('role="status"');
    expect(body).toContain('aria-label="Total"');
    expect(body).toContain('value-42-false');
    expect(body).toContain('custom-content');
    expect(body).toContain('color:green;color:red');
    expect(body).toContain('color:blue;color:purple');
    expect(body).toContain('font-weight:600');
  });
});
