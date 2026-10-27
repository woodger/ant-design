import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Progress from './Progress.svelte';

describe('Progress server rendering', () => {
  it('renders a determinate named line with complete ARIA values and no live region', () => {
    const { body } = render(Progress, { props: { percent: 42.5 } });
    expect(body).toContain('role="progressbar"'); expect(body).toContain('aria-label="Ход выполнения"');
    expect(body).toContain('aria-valuenow="42.5"'); expect(body).toContain('aria-valuemin="0"'); expect(body).toContain('aria-valuemax="100"');
    expect(body).toContain('aria-valuetext="42.5%"'); expect(body).toContain('width: 42.5%');
    expect(body).not.toContain('aria-live'); expect(body).not.toContain('tabindex'); expect(body).not.toContain('<button');
  });
  it('normalizes display, widths and accessibility together', () => {
    const { body } = render(Progress, { props: { percent: 500 } });
    expect(body).toContain('aria-valuenow="100"'); expect(body).toContain('width: 100%');
    expect(body).toContain('ant-progress-status-success'); expect(body).toContain('100%, Завершено');
    const invalid = render(Progress, { props: { percent: NaN } }).body;
    expect(invalid).toContain('aria-valuenow="0"'); expect(invalid).not.toContain('NaN');
  });
  it('preserves explicit statuses and decorative filled icons on lines', () => {
    const body = render(Progress, { props: { percent: 100, status: 'exception' } }).body;
    expect(body).toContain('ant-progress-status-exception'); expect(body).toContain('100%, Ошибка');
    expect(body).toContain('aria-hidden="true"'); expect(body).toContain('fill-rule="evenodd"');
    expect(render(Progress, { props: { percent: 100, status: 'normal' } }).body.replace(/<!--.*?-->/g, '')).toContain('>100%</span>');
  });
  it('renders an SSR-ready circle with safe empty and complete geometry', () => {
    const empty = render(Progress, { props: { type: 'circle', percent: 0 } }).body;
    expect(empty).toContain('viewBox="0 0 100 100"'); expect(empty).toContain('r="47"'); expect(empty).toContain('opacity: 0');
    expect(empty).toContain('focusable="false"');
    const full = render(Progress, { props: { type: 'circle', percent: 100, strokeWidth: 12 } }).body;
    expect(full).toContain('r="44"'); expect(full).toContain('stroke-dashoffset="0"'); expect(full).toContain('opacity: 1');
  });
  it('supports explicit accessible names, descriptions and value text', () => {
    const { body } = render(Progress, { props: { percent: 50, 'aria-labelledby': 'job-title', 'aria-describedby': 'job-help', 'aria-valuetext': 'Two of four files', id: 'export-progress', class: 'custom-progress', style: 'margin: 4px' } });
    expect(body).toContain('aria-labelledby="job-title"'); expect(body).not.toContain('aria-label=');
    expect(body).toContain('aria-describedby="job-help"'); expect(body).toContain('aria-valuetext="Two of four files"');
    expect(body).toContain('id="export-progress"'); expect(body).toContain('custom-progress'); expect(body).toContain('margin: 4px');
  });
  it('formats normalized values once and escapes the resulting text', () => {
    const format = vi.fn((percent: number) => `<strong>${percent}</strong>`);
    const { body } = render(Progress, { props: { percent: 200, format } });
    expect(format).toHaveBeenCalledExactlyOnceWith(100); expect(body).toContain('&lt;strong>100&lt;/strong>');
    expect(body).not.toContain('<strong>'); expect(body).not.toContain('<svg');
  });
  it('keeps semantic values when info is hidden or the circle is tiny', () => {
    const hidden = render(Progress, { props: { percent: 60, showInfo: false } }).body;
    expect(hidden).not.toContain('class="ant-progress-indicator'); expect(hidden).toContain('aria-valuenow="60"');
    const tiny = render(Progress, { props: { type: 'circle', percent: 60, size: 16 } }).body;
    expect(tiny).not.toContain('class="ant-progress-indicator'); expect(tiny).toContain('aria-valuetext="60%"');
  });
  it('supports custom colors, line sizes and cap styles without invalid attributes', () => {
    const body = render(Progress, { props: { percent: 12.5, size: [200, 4], strokeColor: '#722ed1', railColor: '#eee', strokeLinecap: 'butt' } }).body;
    expect(body).toContain('width: 200px'); expect(body).toContain('height: 4px'); expect(body).toContain('border-radius: 0px');
    expect(body).toContain('background: #722ed1'); expect(body).toContain('background: #eee');
    expect(body).not.toContain('undefined'); expect(body).not.toContain('Infinity');
  });
});
