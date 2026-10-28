import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Row from './Row.svelte';
import Col from './Col.svelte';

describe('Grid server rendering', () => {
  it('renders responsive gutter fallback without evaluating browser media queries', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Grid content</p>' }));
    const body = render(Row, { props: { gutter: [{ xs: 8, md: 24 }, 16], align: { xs: 'top', md: 'middle' }, children, id: 'grid', 'aria-label': 'Grid', style: 'margin-inline:0' } }).body;
    expect(body).toContain('margin-inline:-12px;row-gap:16px;margin-inline:0');
    expect(body).not.toContain('ant-row-middle');
    expect(body).toContain('Grid content');
    expect(body).toContain('id="grid"');
    expect(body).not.toContain('role=');
  });
  it('preserves native attributes and responsive flex variables without leaking layout props', () => {
    const body = render(Col, { props: { span: 12, offset: 4, md: { span: 8, flex: '100px' }, flex: 0, style: 'flex:1', id: 'column', 'aria-label': 'Column' } }).body;
    expect(body).toContain('ant-col-12');
    expect(body).toContain('ant-col-offset-4');
    expect(body).toContain('ant-col-md-8');
    expect(body).toContain('flex:0 0 auto;flex:1;--ant-col-md-flex:0 0 100px');
    expect(body).not.toMatch(/ (span|offset|md|flex)=/);
    expect(body).not.toContain('tabindex');
  });
});
