import { describe, expect, it } from 'vitest';
import {
  breadcrumbAttributes,
  breadcrumbEntries,
  breadcrumbItems,
  breadcrumbName
} from './breadcrumb.engine';

describe('Breadcrumb routing', () => {
  it(
    'accumulates paths including empty segments and overrides href only on path entries',
    () => {
      const entries = breadcrumbEntries(
        [
          { path: '/', title: 'Home' },
          { path: '/apps', href: '/ignored' },
          { href: '/direct' },
          { path: ':id/detail', title: 'Item :id' }
        ],
        { id: 7 }
      );

      expect(entries.map(entry => entry.href)).toEqual(
        ['#/', '#//apps', '/direct', '#//apps/7/detail']
      );
      expect(entries.map(entry => entry.paths)).toEqual(
        [[''], ['', 'apps'], ['', 'apps'], ['', 'apps', '7/detail']]
      );
      expect(entries[3].title).toBe('Item 7');
    }
  );
  it(
    'replaces each path parameter once without URL encoding and all title matches except falsy values',
    () => {
      expect(breadcrumbEntries([{ path: '/:id/:id', title: ':id/:id' }], { id: 'a/b c' })[0])
        .toMatchObject(
          { href: '#/a/b c/:id', title: 'a/b c/a/b c' }
        );
      expect(breadcrumbEntries([{ path: ':id', title: ':id' }], { id: 0 })[0]).toMatchObject(
        { href: '#/0', title: ':id' }
      );
      expect(breadcrumbName(0, {})).toBe('0');
      expect(breadcrumbName(true, {})).toBe('true');
      expect(breadcrumbName(false, {})).toBeNull();
    }
  );
  it(
    'uses items before routes and converts legacy names and children without changing source arrays',
    () => {
      const routes = [
        { breadcrumbName: 'Parent', children: [{ breadcrumbName: 'Child', path: '/child' }] }
      ];

      expect(breadcrumbItems([], routes)).toEqual([]);
      expect(breadcrumbItems(undefined, routes)).toEqual(
        [{ title: 'Parent', menu: { items: [{ title: 'Child', path: '/child' }] } }]
      );
      expect(routes[0].children[0].breadcrumbName).toBe('Child');
    }
  );
  it(
    'includes separator paths in subsequent routes and forwards only data and aria attributes',
    () => {
      expect(
        breadcrumbEntries([{ path: 'a' }, { type: 'separator', path: 'b' }, { path: 'c' }], {})[2]
          .href
      ).toBe(
        '#/a/b/c'
      );
      expect(
        breadcrumbAttributes(
          { title: 'Title', class: 'custom', 'data-example': 'id', 'aria-current': 'page' }
        )
      ).toEqual(
        { 'data-example': 'id', 'aria-current': 'page' }
      );
    }
  );
});
