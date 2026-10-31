import { gridResponsiveValue } from './grid.engine';
import type { GridScreenMap } from './grid.types';
import type { MasonryItemType, MasonryKey, MasonryProps } from './masonry.types';

export type MasonryHeight = readonly [key: MasonryKey, height: number, column?: number];
export interface MasonryPosition {
  column: number;
  top: number;
}

export interface MasonryEntry<Data = unknown> {
  key: string;
  itemKey: MasonryKey;
  item: MasonryItemType<Data>;
  index: number;
  position?: MasonryPosition;
  visible: boolean;
}

export function getMasonryColumns(columns: MasonryProps['columns'], screens: GridScreenMap) {
  if (!columns) return 3;
  if (typeof columns === 'number') return columns;

  return gridResponsiveValue(columns, screens) ?? columns.xs ?? 1;
}

export function getMasonryPositions(
  heights: readonly MasonryHeight[],
  columns: number,
  verticalGutter: number
) {
  const columnHeights: number[] = [];
  // length сохраняет RangeError эталона; Array.from незаметно округлил бы columns.
  columnHeights.length = columns;
  columnHeights.fill(0);
  const positions = new Map<MasonryKey, MasonryPosition>();

  for (const [key, height, requestedColumn] of heights) {
    const column = Math.min(
      requestedColumn ?? columnHeights.indexOf(Math.min(...columnHeights)),
      columns - 1
    );
    const top = columnHeights[column];

    positions.set(key, { column, top });
    columnHeights[column] += height + verticalGutter;
  }

  return { positions, height: Math.max(0, Math.max(...columnHeights) - verticalGutter) };
}

/** Порядок и строковые ключи CSSMotionList/diffKeys 1.3.3; см. vendor/LICENSE.rc-motion. */
export function mergeMasonryEntries<Data>(
  previous: readonly MasonryEntry<Data>[],
  current: readonly MasonryEntry<Data>[]
) {
  let result: MasonryEntry<Data>[] = [];
  let currentIndex = 0;

  for (const old of previous) {
    const match = current.findIndex(
      (entry, index) => index >= currentIndex && entry.key === old.key
    );

    if (match === -1) {
      result.push({ ...old, visible: false });
    } else {
      result.push(...current.slice(currentIndex, match), current[match]);
      currentIndex = match + 1;
    }
  }

  result.push(...current.slice(currentIndex));

  const counts = new Map<string, number>();

  for (const entry of result)
    counts.set(entry.key, (counts.get(entry.key) ?? 0) + 1);

  result = result.filter(entry => entry.visible || counts.get(entry.key) === 1);

  return result;
}

/** Сравнение snapshot-данных как @rc-component/util isEqual, без React dev diagnostics. */
export function equalMasonryData(left: unknown, right: unknown) {
  const seen = new Set<unknown>();

  function equal(a: unknown, b: unknown): boolean {
    if (seen.has(a)) return false;
    if (a === b) return true;

    seen.add(a);

    if (Array.isArray(a)) {
      return Array.isArray(b) && a.length === b.length
        && a.every((value, index) => equal(value, b[index]));
    }

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(a);
      const leftRecord = a as Record<string, unknown>;
      const rightRecord = b as Record<string, unknown>;

      return keys.length === Object.keys(b).length
        && keys.every(key => equal(leftRecord[key], rightRecord[key]));
    }

    return false;
  }

  return equal(left, right);
}
