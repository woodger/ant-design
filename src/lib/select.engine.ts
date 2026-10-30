import type { SelectOption } from './types';

export function getSelectValues<Value extends string | number>(
  value: Value | readonly Value[] | undefined
): Value[] {
  return Array.isArray(value) ? [...new Set<Value>(value)] : [];
}

export function filterOptions<Value extends string | number>(
  options: readonly SelectOption<Value>[],
  search: string,
  filter: boolean | ((search: string, option: SelectOption<Value>) => boolean) = true
): readonly SelectOption<Value>[] {
  if (filter === false) return options;
  if (typeof filter === 'function') return search
    ? options.filter(option => filter(search, option))
    : options;
  const query = search.trim().normalize('NFKD').toLowerCase();

  return query
    ? options.filter((option) => option.label.normalize('NFKD').toLowerCase().includes(query))
    : options;
}

// Храним только выбранные options с последними известными label и disabled.
export function resolveSelectedOptions<Value extends string | number>(
  values: readonly Value[],
  options: ReadonlyMap<Value, SelectOption<Value>>,
  previous: ReadonlyMap<Value, SelectOption<Value>>
): ReadonlyMap<Value, SelectOption<Value>> {
  const next = new Map(
    values.map(
      value => [
        value,
        options.get(value) ?? previous.get(value) ?? { value, label: String(value) }
      ]
    )
  );
  return next.size === previous.size
    && [...next].every(
      ([key, option]) => previous.get(key) === option
    )
    ? previous
    : next;
}

export function getEnabledIndex<Value extends string | number>(
  options: readonly SelectOption<Value>[],
  current: number,
  direction: 'next' | 'previous' | 'first' | 'last'
): number {
  const step = direction === 'previous' || direction === 'last' ? -1 : 1;
  const hasCurrent = current >= 0 && current < options.length;
  const start = direction === 'first'
    ? -1
    : direction === 'last' ? options.length : hasCurrent ? current : step > 0 ? -1 : options.length;

  for (let offset = 1; offset <= options.length; offset++) {
    const index = ((start + offset * step) % options.length + options.length) % options.length;

    if (!options[index].disabled) {
      return index;
    }
  }

  return -1;
}
