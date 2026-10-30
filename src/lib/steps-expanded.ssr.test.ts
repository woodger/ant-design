import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Steps from './Steps.svelte';
import Tooltip from './Tooltip.svelte';
import type { StepsIconInfo } from './steps-expanded.types';
import type { Snippet } from 'svelte';

const snippet = createRawSnippet(() => ({ render: () => '<strong>Rich description</strong>' }));
const items = [{ title: 'First', description: 'Legacy content' }, { title: 0, content: 0 }, { title: 'Last', content: snippet }];

describe('Steps extended rendering', () => {
  it.each(['dot', 'inline', 'navigation', 'panel'] as const)('renders %s deterministically without browser resources', type => {
    const body = render(Steps, { props: { type, variant: 'outlined', items } }).body;
    expect(body).toContain(`ant-steps-${type}`);
    expect(body).toContain('ant-steps-outlined');
    expect(body.match(/<li /g)).toHaveLength(3);
    expect(body).toContain('Legacy content');
    expect(body.replace(/<!--.*?-->/g, '')).toMatch(/ant-steps-item-title[^>]*>0</);
    expect(body).toContain('Rich description');
    expect(body).not.toContain('<button');
  });
  it('keeps panel horizontal and hides decorative arrows from assistive technology', () => {
    const body = render(Steps, { props: { type: 'panel', orientation: 'vertical', items } }).body;
    expect(body).toContain('ant-steps-horizontal');
    expect(body.match(/aria-hidden="true" class="ant-steps-panel-arrow/g)).toHaveLength(3);
  });
  it('renders process percentage as an exposed progressbar and suppresses it for inline and dot', () => {
    const body = render(Steps, { props: { current: 1, percent: 60, items } }).body;
    expect(body).toContain('role="progressbar"');
    expect(body).toContain('aria-valuenow="60"');
    expect(body).toContain('stroke-dasharray="calc(var(--ant-cmp-steps-progress-radius)');
    expect(body).not.toMatch(/aria-hidden="true"[^>]*>\s*<svg class="ant-steps-item-progress/);
    for (const type of ['inline', 'dot'] as const) expect(render(Steps, { props: { type, percent: 60, items } }).body).not.toContain('role="progressbar"');
  });
  it('collapses hidden ranges, preserves original numbers and keeps ellipses disabled', () => {
    const body = render(Steps, { props: { items: Array.from({ length: 10 }, (_, index) => ({ title: `Item ${index}` })), initial: 10, current: 14, maxCount: 3, onChange: () => {} } }).body;
    expect(body.match(/<li /g)).toHaveLength(5);
    expect(body).toContain('ant-steps-max-count');
    expect(body).toContain('Item 0'); expect(body).toContain('Item 4'); expect(body).toContain('Item 9'); expect(body).not.toContain('Item 3');
    expect(body.match(/<button[^>]*disabled/g)).toHaveLength(2);
    expect(body.replace(/<!--.*?-->/g, '')).toMatch(/ant-steps-item-icon-number[^>]*>15</);
  });
  it('merges root and item semantic style layers in source priority', () => {
    const body = render(Steps, { props: { variant: 'outlined', type: 'navigation', items: [{ title: 'Step', class: 'local-item', style: 'color:blue', classNames: { title: 'local-title' }, styles: { root: 'color:green', title: 'font-weight:700' } }], classNames: ({ props }) => ({ root: props.type === 'navigation' ? 'semantic-nav' : '', itemTitle: 'root-title' }), styles: { root: 'color:red', item: 'color:red' }, style: 'color:black' } }).body;
    expect(body).toContain('semantic-nav');
    expect(body).toContain('local-item'); expect(body).toContain('root-title local-title');
    expect(body).toContain('color:red;color:green;color:blue');
    expect(body).toContain('color:red;color:black');
    expect(body).toContain('font-weight:700');
  });
  it('supports legacy layout aliases with explicit orientation and type priority', () => {
    const body = render(Steps, { props: { direction: 'vertical', orientation: 'horizontal', responsive: false, labelPlacement: 'vertical', items } }).body;
    expect(body).toContain('ant-steps-title-vertical'); expect(body).toContain('ant-steps-horizontal');
    expect(render(Steps, { props: { type: 'navigation', progressDot: true, labelPlacement: 'vertical', items } }).body).toContain('ant-steps-title-horizontal');
  });
  it('passes original keys to icon renderers and uses original index fallbacks only when collapsed', () => {
    const iconRender = createRawSnippet<[Snippet, StepsIconInfo]>((_original, info) => ({ render: () => `<span data-source-key="${info().item.key ?? 'absent'}"></span>` }));
    const plain = render(Steps, { props: { items: [{ key: 0 }, {}], iconRender } }).body;
    expect(plain).toContain('data-source-key="0"'); expect(plain).toContain('data-source-key="absent"');
    const collapsed = render(Steps, { props: { items: Array.from({ length: 10 }, () => ({})), current: 4, maxCount: 3, iconRender } }).body;
    expect(collapsed).toContain('data-source-key="4"'); expect(collapsed).toContain('data-source-key="ellipsis-0-4"'); expect(collapsed).not.toContain('data-source-key="absent"');
  });
  it('renders rich Tooltip content without converting its snippet into source text', () => {
    const children = createRawSnippet(() => ({ render: () => '<button type="button">Trigger</button>' }));
    const body = render(Tooltip, { props: { title: snippet, children } }).body;
    expect(body).toContain('<strong>Rich description</strong>');
    expect(body).not.toContain('function');
    expect(body).toContain('role="tooltip"');
  });
});
