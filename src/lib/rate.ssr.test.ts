import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Rate from './Rate.svelte';

describe('Rate SSR', () => {
  it('renders five native non-submitting radio buttons with the source icon and no selected value', () => {
    const body = render(Rate, { props: { 'aria-label': 'Rating', autoFocus: true } }).body;
    expect(body).toContain('role="radiogroup"');
    expect(body).toContain('aria-label="Rating"');
    expect(body.match(/type="button"/g)).toHaveLength(5);
    expect(body.match(/aria-checked="false"/g)).toHaveLength(5);
    expect(body.match(/anticon-star/g)).toHaveLength(10);
    expect(body).not.toContain('<input');
  });

  it('keeps controlled zero above the default and never emits callbacks during SSR', () => {
    const events: unknown[] = [];
    const body = render(Rate, { props: { value: 0, defaultValue: 4, onChange: next => events.push(next), onFocus: () => events.push('focus'), onHoverChange: next => events.push(next) } }).body;
    expect(body.match(/ant-rate-star-zero/g)).toHaveLength(5);
    expect(events).toEqual([]);
  });

  it('shows an external fraction only when half rendering is enabled and supports an empty count', () => {
    const half = render(Rate, { props: { value: 2.5, allowHalf: true, disabled: true, size: 'large' } }).body;
    expect(half.match(/ant-rate-star-full/g)).toHaveLength(2);
    expect(half.match(/ant-rate-star-half/g)).toHaveLength(1);
    expect(half.match(/aria-checked="true"/g)).toHaveLength(3);
    expect(half.match(/\sdisabled(?:[\s=>])/g)).toHaveLength(5);
    expect(half).toContain('ant-rate-large');
    expect(render(Rate, { props: { value: 2.5 } }).body).not.toContain('ant-rate-star-half');
    expect(render(Rate, { props: { count: 0 } }).body).not.toContain('<li');
  });

});
