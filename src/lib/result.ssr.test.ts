import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Result from './Result.svelte';
import type { ResultStatus } from './result.types';

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('Result server rendering', () => {
  it('defaults to a decorative info icon without text, focus stops or announcements', () => {
    const body = render(Result).body;
    expect(body).toContain('ant-result-info'); expect(body).toContain('viewBox="0 0 1024 1024"'); expect(body).toContain('aria-hidden="true"'); expect(body).toContain(' inert'); expect(body).toContain('focusable="false"');
    expect(body).not.toContain('role='); expect(body).not.toContain('aria-live'); expect(body).not.toContain('tabindex'); expect(body).not.toContain('<title');
    expect(body).not.toContain('ant-result-title'); expect(body).not.toContain('ant-result-extra'); expect(body).not.toContain('ant-result-body');
  });
  it.each(['success', 'error', 'info', 'warning'] as const)('renders %s text with a semantic heading and subtitle', status => {
    const body = render(Result, { props: { status, title: 'Operation result', subTitle: 'Details' } }).body.replace(/<!--[\s\S]*?-->/g, '');
    expect(body).toContain(`ant-result-${status}`); expect(body).toMatch(/<h2\b[^>]*>Operation result<\/h2>/); expect(body).toContain('Details'); expect(body).toContain('<path');
  });
  it.each([403, '403', 404, '404', 500, '500'] satisfies ResultStatus[])('renders exception %s as a decorative built-in illustration even with icon=false', status => {
    const body = render(Result, { props: { status, icon: false } }).body;
    expect(body).toContain(`ant-result-${status}`); expect(body).toContain('ant-result-image'); expect(body).toMatch(/viewBox="0 0 25[124] 294"/); expect(body).toContain('fill="#E4EBF7"');
    expect(body).toContain('aria-hidden="true"'); expect(body).not.toContain('<title'); expect(body).not.toContain('tabindex'); expect(body).not.toContain('aria-live');
  });
  it('uses a custom icon for ordinary statuses while exception illustrations take priority', () => {
    const icon = snippet('<span>Custom visual</span>');
    const ordinary = render(Result, { props: { icon } }).body;
    expect(ordinary).toContain('Custom visual'); expect(ordinary).not.toContain('<svg'); expect(ordinary).toContain(' inert');
    const exception = render(Result, { props: { status: 404, icon } }).body;
    expect(exception).not.toContain('Custom visual'); expect(exception).toContain('ant-result-image');
  });
  it('hides an ordinary icon independently and omits empty text containers', () => {
    const body = render(Result, { props: { status: 'success', icon: false, title: '', subTitle: '', extra: snippet('<button>Continue</button>') } }).body;
    expect(body).not.toContain('ant-result-icon'); expect(body).not.toContain('<svg'); expect(body).not.toContain('ant-result-title'); expect(body).not.toContain('ant-result-subtitle'); expect(body).toContain('<button>Continue</button>');
  });
  it('renders text snippets, native actions, and details in reading order with a configurable heading level', () => {
    const body = render(Result, { props: { title: snippet('<strong>Saved</strong>'), subTitle: snippet('<em>Draft retained</em>'), headingLevel: 3, extra: snippet('<button>Retry</button>'), children: snippet('<p>More details</p>') } }).body;
    expect(body).toMatch(/<h3\b[^>]*>.*<strong>Saved<\/strong>.*<\/h3>/s); expect(body).toContain('<em>Draft retained</em>');
    expect(body.indexOf('Saved')).toBeLessThan(body.indexOf('Draft retained')); expect(body.indexOf('Draft retained')).toBeLessThan(body.indexOf('Retry')); expect(body.indexOf('Retry')).toBeLessThan(body.indexOf('More details'));
    expect(body).not.toContain('role="alert"'); expect(body).not.toContain('aria-live');
  });
  it('escapes strings and forwards owner-provided naming and root attributes', () => {
    const body = render(Result, { props: { title: '<script>Unsafe</script>', subTitle: '<img src=x>', id: 'completion', class: 'custom', style: 'margin: 4px', 'aria-label': 'Order complete', 'aria-describedby': 'hint' } }).body;
    expect(body).toContain('&lt;script>'); expect(body).toContain('&lt;img src=x>'); expect(body).not.toContain('<script>'); expect(body).toContain('id="completion"'); expect(body).toContain('custom'); expect(body).toContain('margin: 4px'); expect(body).toContain('role="group"'); expect(body).toContain('aria-label="Order complete"'); expect(body).toContain('aria-describedby="hint"');
    const labelled = render(Result, { props: { 'aria-labelledby': 'owner-title' } }).body;
    expect(labelled).toContain('aria-labelledby="owner-title"'); expect(labelled).not.toContain('aria-label=');
  });
  it('does not start timers or use the DOM when rendering interactive snippets on the server', () => {
    vi.useFakeTimers();
    try { render(Result, { props: { extra: snippet('<button>Continue</button>') } }); expect(vi.getTimerCount()).toBe(0); }
    finally { vi.useRealTimers(); }
  });
});
