import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Card from './Card.svelte';
import CardGrid from './CardGrid.svelte';
import CardMeta from './CardMeta.svelte';
import Tabs from './Tabs.svelte';
import { cardTabItems } from './card.engine';

describe('Card SSR', () => {
  it(
    'renders zero and true wrappers, but omits the body when no children or loading were supplied',
    () => {
      const body = render(Card, { props: { title: 0, extra: 0, cover: 0, actions: [0, true] } })
        .body;

      expect(body).toContain('ant-card-head-title');
      expect(body).toContain('ant-card-extra');
      expect(body).toContain('ant-card-cover');
      expect(body).toContain('width:50%');
      expect(body).not.toContain('ant-card-body');
      expect(body).not.toContain('>true<');
      expect(render(Card, { props: { title: true } }).body).toContain('ant-card-head-title');
      expect(render(Card).body).not.toContain('ant-card-head');
    }
  );
  it(
    'uses explicit variant before legacy bordered and passes merged values to semantic callbacks',
    () => {
      const body = render(
        Card,
        {
          props: {
            bordered: false,
            variant: 'outlined',
            size: 'small',
            classNames: ({ props }) => ({ root: `variant-${props.variant}-size-${props.size}` })
          }
        }
      ).body;

      expect(body).toContain('ant-card-bordered');
      expect(body).toContain('variant-outlined-size-small');
      expect(render(Card, { props: { bordered: false } }).body).not.toContain(
        'ant-card-bordered'
      );
    }
  );
  it(
    'applies hoverable and inner appearance without making the container an interactive button',
    () => {
      const body = render(Card, { props: { hoverable: true, type: 'inner' } }).body;

      expect(body).toContain('ant-card-hoverable');
      expect(body).toContain('ant-card-type-inner');
      expect(body).not.toContain('role="button"');
    }
  );
  it(
    'merges root styles after semantic root and semantic body/header after legacy styles',
    () => {
      const children = createRawSnippet(() => ({ render: () => '<p>Content</p>' }));
      const body = render(
        Card,
        {
          props: {
            title: 'Title',
            children,
            style: 'color:blue',
            headStyle: 'padding:2px',
            bodyStyle: 'padding:3px',
            styles: { root: 'color:red', header: 'padding:4px', body: 'padding:5px' }
          }
        }
      ).body;

      expect(body).toContain('color:red;color:blue');
      expect(body).toContain('padding:2px;padding:4px');
      expect(body).toContain('padding:3px;padding:5px');
    }
  );
  it(
    'replaces only the body with a four-row active skeleton while retaining cover and actions',
    () => {
      const children = createRawSnippet(() => ({ render: () => '<p>Secret draft</p>' }));
      const body = render(
        Card,
        {
          props: { children, loading: true, title: 'Title', cover: 'Cover', actions: ['Action'] }
        }
      ).body;

      expect(body).toContain('ant-card-loading');
      expect(body).toContain('ant-skeleton-active');
      expect(body).toContain('Cover');
      expect(body).toContain('Action');
      expect(body).not.toContain('Secret draft');
      expect(body).not.toContain('ant-skeleton-title');
      expect(body.match(/<li/g)).toHaveLength(5);
    }
  );
  it(
    'renders tabs with large default size and preserves empty-string default keys over tab props',
    () => {
      const body = render(
        Card,
        {
          props: {
            tabList: [{ key: '', tab: 'First' }, { key: 'b', label: 'Second' }],
            defaultActiveTabKey: '',
            tabProps: { defaultActiveKey: 'b' }
          }
        }
      ).body;

      expect(body).toContain('ant-tabs-large');
      expect(body).toMatch(/data-tabs-key=""[^>]*aria-selected="true"/);
      expect(render(Card, { props: { tabList: [], title: 'Empty tabs' } }).body).toContain(
        'ant-tabs-nav'
      );
    }
  );
  it('allows an explicit grid class during SSR and preserves Grid hover defaults', () => {
    expect(render(Card, { props: { containGrid: true } }).body).toContain(
      'ant-card-contain-grid'
    );
    expect(render(Card, { props: { containGrid: false } }).body).toContain(
      'data-ant-contain-grid="false"'
    );
    expect(render(CardGrid).body).toContain('ant-card-grid-hoverable');
    expect(render(CardGrid, { props: { hoverable: false } }).body).not.toContain(
      'ant-card-grid-hoverable'
    );
  });
  it('renders all Meta zero slots and omits empty Meta sections', () => {
    const body = render(
      CardMeta,
      {
        props: {
          avatar: 0,
          title: 0,
          description: 0,
          styles: { root: 'color:red' },
          style: 'color:blue'
        }
      }
    ).body;

    expect(body).toContain('ant-card-meta-avatar');
    expect(body).toContain('ant-card-meta-title');
    expect(body).toContain('ant-card-meta-description');
    expect(body).toContain('color:red;color:blue');
    expect(render(CardMeta).body).not.toContain('ant-card-meta-section');
  });
});

describe('Card tab adaptation', () => {
  it(
    'prioritizes explicit label, including null and undefined, over the legacy tab property',
    () => {
      expect(
        cardTabItems(
          [
            { key: 'a', tab: 'Legacy' },
            { key: 'b', tab: 'Old', label: 'New' },
            { key: 'c', tab: 'Old', label: null },
            { key: 'd', tab: 'Old', label: undefined }
          ]
        ).map(
          item => item.label
        )
      ).toEqual(
        ['Legacy', 'New', null, null]
      );
    }
  );
  it(
    'keeps zero labels but omits zero tab extras, matching delegated rc Tabs truthiness',
    () => {
      const body = render(
        Tabs,
        {
          props: {
            items: [{ key: '0', label: 0 }],
            tabBarExtraContent: { left: 0, right: 'Extra' }
          }
        }
      ).body;

      expect(body).toContain('ant-tabs-tab-label');
      expect(body).toContain('Extra');
      expect(body.match(/class="ant-tabs-extra-content"/g)).toHaveLength(1);
    }
  );
});
