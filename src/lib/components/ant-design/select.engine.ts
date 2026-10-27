import type { SelectOption } from './types';

export function getSelectValues<Value extends string | number>(value: Value | readonly Value[] | undefined): Value[] {
  return Array.isArray(value) ? [...new Set<Value>(value)] : [];
}

export function filterOptions<Value extends string | number>(
  options: readonly SelectOption<Value>[],
  search: string
): readonly SelectOption<Value>[] {
  const query = search.trim().normalize('NFKD').toLowerCase();

  return query
    ? options.filter((option) => option.label.normalize('NFKD').toLowerCase().includes(query))
    : options;
}

export function getEnabledIndex<Value extends string | number>(
  options: readonly SelectOption<Value>[],
  current: number,
  direction: 'next' | 'previous' | 'first' | 'last'
): number {
  const step = direction === 'previous' || direction === 'last' ? -1 : 1;
  const hasCurrent = current >= 0 && current < options.length;
  const start = direction === 'first' ? -1 : direction === 'last' ? options.length : hasCurrent ? current : step > 0 ? -1 : options.length;

  for (let offset = 1; offset <= options.length; offset++) {
    const index = ((start + offset * step) % options.length + options.length) % options.length;

    if (!options[index].disabled) {
      return index;
    }
  }

  return -1;
}
