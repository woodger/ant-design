import type { TableFixed } from './table.types';

export function getTableFixedOffsets(
  fixed: readonly (TableFixed | undefined)[],
  widths: readonly number[]
): (number | undefined)[] {
  const offsets: (number | undefined)[] = Array.from({ length: fixed.length }, () => undefined);
  let start = 0;
  let end = 0;

  for (let index = 0; index < fixed.length; index++) {
    const width = Number.isFinite(widths[index]) ? Math.max(0, widths[index]) : 0;

    if (fixed[index] === true || fixed[index] === 'start') {
      offsets[index] = start;
      start += width;
    }

    const reverse = fixed.length - index - 1;

    if (fixed[reverse] === 'end') {
      offsets[reverse] = end;
      end += Number.isFinite(widths[reverse]) ? Math.max(0, widths[reverse]) : 0;
    }
  }

  return offsets;
}
