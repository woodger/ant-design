import type { ImageElementData } from './image.types';
import type { ImageGroupEntry } from './image-group-context';
import type { ImagePreviewGroupItem } from './image-preview-group.types';
const common = [
  'src',
  'alt',
  'crossorigin',
  'decoding',
  'draggable',
  'loading',
  'referrerpolicy',
  'sizes',
  'srcset',
  'usemap',
  'fetchpriority'
] as const;
export interface ImagePreviewEntry {
  id?: string;
  data: ImageElementData;
}
export function getImagePreviewItems(
  items: readonly ImagePreviewGroupItem[] | undefined,
  registered: ReadonlyMap<string, ImageGroupEntry>
): ImagePreviewEntry[] {
  if (items) return items.map(item => {
    if (typeof item === 'string') return { data: { src: item } };
    return {
      data: Object.fromEntries(
        common.filter(key => item[key] !== undefined).map(key => [key, item[key]])
      )
    };
  });
  return [...registered].flatMap(
    ([id, item]) => item.canPreview ? [{ id, data: { ...item.data } }] : []
  );
}
export function getImagePreviewIndex(
  items: readonly ImagePreviewEntry[],
  id: string,
  source: string | undefined,
  explicit: boolean
) {
  const index = items.findIndex(item => explicit ? item.data.src === source : item.id === id);
  return index < 0 ? 0 : index;
}
