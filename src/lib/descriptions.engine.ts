import { gridResponsiveValue } from './grid.engine';
import type { GridScreenMap } from './grid.types';
import type { DescriptionsItem, DescriptionsProps } from './descriptions.types';

export interface ResolvedDescriptionsItem extends Omit<DescriptionsItem, 'span'> {
  span?: number;
  filled?: boolean;
}
const defaultColumns = { xxxl: 4, xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 };

export function descriptionsColumn(
  column: DescriptionsProps['column'],
  screens: GridScreenMap
): number {
  if (typeof column === 'number' && !Number.isNaN(column)) return column;

  return gridResponsiveValue(typeof column === 'object'
    ? column
    : undefined, screens)
    ?? gridResponsiveValue(
      defaultColumns,
      screens
    )
    ?? 3;
}

export function descriptionsItems(
  items: readonly DescriptionsItem[],
  screens: GridScreenMap
): ResolvedDescriptionsItem[] {
  return items.map(({ span, ...item }) => {
    if (span === 'filled') return { ...item, filled: true };

    const resolved = gridResponsiveValue(span, screens);
    return {
      ...item,
      span: typeof resolved === 'number' && !Number.isNaN(resolved) ? resolved : undefined
    };
  });
}

export function descriptionsRows(
  items: readonly DescriptionsItem[],
  column: number,
  screens: GridScreenMap
): ResolvedDescriptionsItem[][] {
  const rows: ResolvedDescriptionsItem[][] = [];
  let row: ResolvedDescriptionsItem[] = [];
  let count = 0;
  for (const item of descriptionsItems(items, screens)) {
    const { filled, ...next } = item;
    const remaining = column - count;
    count += next.span || 1;
    if (filled || count >= column) {
      if (!filled && count > column)
        next.span = remaining;
      row.push(next);
      rows.push(row);
      row = [];
      count = 0;
    } else row.push(next);
  }
  if (row.length)
    rows.push(row);
  for (const current of rows) {
    const used = current.reduce((total, item) => total + (item.span || 1), 0);
    if (used < column) {
      const last = current[current.length - 1];
      last.span = column - (used - (last.span || 1));
    }
  }
  return rows;
}
