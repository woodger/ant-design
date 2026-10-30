import { describe, it, expect } from 'vitest';
import { getImagePreviewItems, getImagePreviewIndex } from './image-preview-group.engine';
import type { ImageGroupEntry } from './image-group-context';
const registered = new Map<string, ImageGroupEntry>(
  [
    ['a', { data: { src: 'same.svg', alt: 'First' }, canPreview: true }],
    ['b', { data: { src: 'same.svg', alt: 'Second' }, canPreview: true }],
    ['off', { data: { src: 'off.svg' }, canPreview: false }]
  ]
);
describe('ImagePreviewGroup source items', () => {
  it(
    'collects enabled images in stable registration order and distinguishes duplicate sources by id',
    () => {
      const items = getImagePreviewItems(undefined, registered);

      expect(items.map(item => item.id)).toEqual(['a', 'b']);
      expect(getImagePreviewIndex(items, 'b', 'same.svg', false)).toBe(1);
    }
  );
  it('gives explicit empty items priority and keeps only native shared image fields', () => {
    expect(getImagePreviewItems([], registered)).toEqual([]);
    expect(
      getImagePreviewItems(
        ['one.svg', { src: 'two.svg', alt: 'Two', loading: 'lazy' }],
        registered
      )
    ).toEqual(
      [{ data: { src: 'one.svg' } }, { data: { src: 'two.svg', alt: 'Two', loading: 'lazy' } }]
    );
  });
  it('matches explicit item sources instead of ids and falls back to index zero', () => {
    const items = getImagePreviewItems(['one.svg', 'same.svg'], registered);

    expect(getImagePreviewIndex(items, 'b', 'same.svg', true)).toBe(1);
    expect(getImagePreviewIndex(items, 'missing', 'none.svg', true)).toBe(0);
  });
});
