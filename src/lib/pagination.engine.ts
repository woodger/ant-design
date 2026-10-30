export interface PaginationState {
  total: number;
  current: number;
  pageSize: number;
  pageCount: number;
  range: [number, number];
}

export type PaginationItem = number | 'jump-prev' | 'jump-next';

function normalizeInteger(value: number, fallback: number, minimum: number): number {
  return Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(minimum, Math.floor(value)))
    : fallback;
}

export function getPaginationState(total: number, current = 1, pageSize = 10): PaginationState {
  const normalizedTotal = normalizeInteger(total, 0, 0);
  const normalizedSize = normalizeInteger(pageSize, 10, 1);
  const pageCount = Math.max(1, Math.ceil(normalizedTotal / normalizedSize));
  const page = Math.min(pageCount, normalizeInteger(current, 1, 1));

  return {
    total: normalizedTotal,
    current: page,
    pageSize: normalizedSize,
    pageCount,
    range: normalizedTotal ? [(page - 1) * normalizedSize + 1, Math.min(normalizedTotal, page * normalizedSize)] : [0, 0]
  };
}

export function getPaginationItems({ current, pageCount }: PaginationState): PaginationItem[] {
  if (pageCount <= 9) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  let start = Math.max(1, current - 2);
  let end = Math.min(pageCount, current + 2);

  if (start === 1) {
    end = 5;
  } else if (end === pageCount) {
    start = pageCount - 4;
  }

  const items: PaginationItem[] = [];

  if (start > 1) {
    items.push(1);

    if (start === 3) {
      items.push(2);
    } else if (start > 3) {
      items.push('jump-prev');
    }
  }

  for (let page = start; page <= end; page++) {
    items.push(page);
  }

  if (end < pageCount) {
    if (end === pageCount - 2) {
      items.push(pageCount - 1);
    } else if (end < pageCount - 2) {
      items.push('jump-next');
    }

    items.push(pageCount);
  }

  return items;
}

export function getPageSizeOptions(options: readonly number[], currentSize: number): number[] {
  const valid = options.filter((size) => Number.isSafeInteger(size) && size > 0);

  return [...new Set([...valid, currentSize])].sort((left, right) => left - right);
}
