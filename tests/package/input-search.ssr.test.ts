import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { InputSearch } from 'antd-svelte';
import InputSearchFixtures from '../browser/fixtures/InputSearchFixtures.svelte';

describe('InputSearch public package SSR', () => {
  it('exports a search control with a text enter button', () => {
    const body = render(InputSearch, {
      props: { defaultValue: 'query', enterButton: 'Find' }
    }).body;

    expect(body).toContain('type="search"');
    expect(body).toContain('Find');
    expect(body).toContain('ant-input-search-with-button');
  });

  it('renders inherited and replaced config through the owned browser fixture', () => {
    const body = render(InputSearchFixtures).body;

    expect(body).toContain('search-context');
    expect(body).toContain('base-search-input');
    expect(body).toContain('autocomplete="off"');
    expect(body).toContain('Replaced search icon');
    expect(body).toContain('ant-input-search-small');
  });
});
