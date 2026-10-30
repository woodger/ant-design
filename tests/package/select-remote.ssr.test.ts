import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Select } from 'antd-svelte';

describe('remote Select SSR', () => {
  it(
    'preserves a selected value outside the current results and omits behavioral props from native HTML',
    () => {
      const body = render(
        Select<number>,
        {
          props: {
            options: [],
            value: 0,
            name: 'person',
            searchValue: 'query',
            showSearch: true,
            filterOption: false,
            loading: true,
            notFoundContent: 'Retry later'
          }
        }
      ).body;

      expect(body).toContain('value="0"');
      expect(body).toContain('aria-busy="true"');
      expect(body).toContain('ant-select-loading');
      expect(body).not.toContain('searchValue=');
      expect(body).not.toContain('filterOption=');
      expect(body).not.toContain('notFoundContent=');
    }
  );
  it(
    'uses object search configuration in multiple mode without leaking the query into form values',
    () => {
      const body = render(
        Select<number, 'multiple'>,
        {
          props: {
            options: [{ value: 0, label: 'Zero' }],
            mode: 'multiple',
            value: [0],
            name: 'people',
            showSearch: { searchValue: 'server query', filterOption: false }
          }
        }
      ).body;

      expect(body).toContain('value="server query"');
      expect(body).toContain('Zero');
      expect(body).toContain('type="hidden" name="people" value="0"');
    }
  );

});
