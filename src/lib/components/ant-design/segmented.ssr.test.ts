import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Segmented from './Segmented.svelte';

describe('Segmented SSR', () => {
  it('selects the first option by default including a disabled numeric zero', () => {
    const body = render(Segmented, { props: { options: [{ value: 0, label: 'Zero', disabled: true }, 1], name: 'period' } }).body;
    expect(body).toContain('role="radiogroup"');
    expect(body).toContain('aria-orientation="horizontal"');
    expect(body).toMatch(/name="period" checked(?:="")? disabled/);
    expect(body).toContain('ant-segmented-item-selected');
    expect(body).not.toContain('ant-segmented-thumb');
  });
  it('gives value priority over defaultValue without correcting a missing value or calling onChange', () => {
    const onChange = vi.fn();
    const body = render(Segmented, { props: { options: ['Daily', 'Weekly'], value: 'Missing', defaultValue: 'Weekly', onChange } }).body;
    expect(body).not.toContain(' checked');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('renders rich labels and icons, exposes semantic slots and supports native names and disabled', () => {
    const label = createRawSnippet(() => ({ render: () => '<strong>Week</strong>' }));
    const icon = createRawSnippet(() => ({ render: () => '<svg viewBox="0 0 10 10"><path d="M0 0h10v10H0z" /></svg>' }));
    const body = render(Segmented, { props: { options: [{ value: 'week', label, icon }], disabled: true, orientation: 'vertical', vertical: false, shape: 'round', block: true,
      classNames: () => ({ root: 'custom-root', label: 'custom-label', icon: 'custom-icon' }), styles: { item: 'color:red' }, 'aria-label': 'Period'
    } }).body;
    expect(body).toContain('<strong>Week</strong>');
    expect(body).toContain('<svg');
    expect(body).toContain('custom-root');
    expect(body).toContain('custom-label');
    expect(body).toContain('custom-icon');
    expect(body).toContain('color:red');
    expect(body).toContain('ant-segmented-vertical');
    expect(body).toContain('ant-segmented-shape-round');
    expect(body).toContain('ant-segmented-block');
    expect(body).not.toContain('tabindex="0"');
  });
});
