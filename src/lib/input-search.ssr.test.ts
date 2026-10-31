import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import InputSearch from './InputSearch.svelte';

describe('InputSearch SSR', () => {
  it('composes a search input and icon button as adjacent Compact items', () => {
    const body = render(InputSearch, { props: { defaultValue: '<query>', name: 'query' } }).body;

    expect(body).toContain('ant-input-search');
    expect(body).toContain('ant-space-compact');
    expect(body).toContain('ant-input-compact-first-item');
    expect(body).toContain('ant-btn-compact-last-item');
    expect(body).toContain('type="search"');
    expect(body).toContain('name="query"');
    expect(body).toContain('&lt;query>');
    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Поиск"');
    expect(body).toContain('<svg');
    expect(body.indexOf('<input')).toBeLessThan(body.indexOf('<button'));
  });

  it('places data hidden class and styles on Compact while leaving native attrs on Input', () => {
    const body = render(InputSearch, {
      props: {
        hidden: true,
        class: 'outer-search',
        style: 'width:240px',
        'data-identity': 'root-data',
        'aria-label': 'Query',
        id: 'query',
        type: 'email'
      }
    }).body;
    const root = body.match(/<div[^>]*>/)![0];
    const input = body.match(/<input[^>]*>/)![0];

    expect(root).toContain('hidden');
    expect(root).toContain('outer-search');
    expect(root).toContain('width:240px');
    expect(root).toContain('data-identity="root-data"');
    expect(input).toContain('id="query"');
    expect(input).toContain('aria-label="Query"');
    expect(input).toContain('type="search"');
    expect(input).not.toMatch(/outer-search|data-identity|hidden/);
  });

  it('supports primary boolean and text enter buttons without adding a second text icon', () => {
    const primary = render(InputSearch, { props: { enterButton: true } }).body;
    const text = render(InputSearch, { props: { enterButton: 'Find' } }).body;
    const empty = render(InputSearch, { props: { enterButton: null } }).body;

    expect(primary).toContain('ant-input-search-with-button');
    expect(primary).toContain('ant-btn-color-primary');
    expect(primary).toContain('ant-btn-icon-only');
    expect(primary).toContain('<svg');
    expect(text).toContain('Find');
    expect(text).toContain('ant-btn-color-primary');
    expect(text).not.toContain('<svg');
    expect(empty).toContain('ant-input-search-btn');
  });

  it('renders nested button semantics separately from input slots and root styles', () => {
    const body = render(InputSearch, {
      props: {
        variant: 'filled',
        classNames: ({ props }) => ({
          root: props.enterButton === false ? 'default-button' : 'incorrect',
          input: 'search-input',
          button: { root: 'search-action', icon: 'search-symbol' }
        }),
        styles: { root: 'color:red', button: { root: 'color:blue' } }
      }
    }).body;

    expect(body).toContain('default-button');
    expect(body).toContain('search-input');
    expect(body).toContain('search-action');
    expect(body).toContain('search-symbol');
    expect(body).toContain('ant-input-filled');
    expect(body).toContain('ant-input-search-btn-filled');
    expect(body).toContain('ant-btn-variant-text');
    expect(body).toContain('color:red');
    expect(body).toContain('color:blue');
  });

  it('keeps clear count suffix and a trailing addon without invoking callbacks on SSR', () => {
    const body = render(InputSearch, {
      props: {
        defaultValue: 'query',
        allowClear: true,
        showCount: true,
        suffix: 'SUFFIX',
        addonAfter: 'AFTER',
        onSearch: () => {
          throw new Error('search callback on SSR');
        },
        onChange: () => {
          throw new Error('change callback on SSR');
        }
      }
    }).body;

    expect(body).toContain('ant-input-clear-icon');
    expect(body).toContain('ant-input-show-count-suffix');
    expect(body).toContain('SUFFIX');
    expect(body.indexOf('ant-input-search-btn')).toBeLessThan(body.indexOf('AFTER'));
    expect(body).not.toContain('ant-input-group-addon');
  });
});
