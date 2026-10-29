import type { AutoCompleteItem, AutoCompleteOption, AutoCompleteSearchConfig } from './auto-complete.types';

export interface AutoCompleteEntry { key: string; group: boolean; option: AutoCompleteItem; }

export function filterAutoCompleteOptions(options: readonly AutoCompleteItem[], search: string, filter: AutoCompleteSearchConfig['filterOption'] = false): readonly AutoCompleteItem[] {
  if (!search || filter === false) return options;

  const match = typeof filter === 'function' ? filter : (_: string, option: AutoCompleteItem) =>
    String('options' in option ? typeof option.label === 'function' ? '' : option.label ?? '' : option.value).toUpperCase().includes(search.toUpperCase());
  return options.flatMap(item => {
    if (match(search, item)) return [item];
    if ('options' in item) {
      const children = item.options.filter(option => match(search, option));
      return children.length ? [{ ...item, options: children }] : [];
    }
    return [];
  });
}

export function flattenAutoCompleteOptions(options: readonly AutoCompleteItem[]): AutoCompleteEntry[] {
  return options.flatMap((option, index) => 'options' in option
    ? [{ key: String(option.key ?? `group-${index}`), group: true, option }, ...option.options.map(item => ({ key: String(item.key ?? item.value), group: false, option: item }))]
    : [{ key: String(option.key ?? option.value), group: false, option }]);
}

export function autoCompleteNext(entries: readonly AutoCompleteEntry[], current: number, offset: number): number {
  for (let step = 1; step <= entries.length; step++) {
    const index = ((current + offset * step) % entries.length + entries.length) % entries.length;
    const entry = entries[index];
    if (!entry.group && !('disabled' in entry.option && entry.option.disabled)) return index;
  }
  return -1;
}

export function autoCompleteOption(entries: readonly AutoCompleteEntry[], index: number): AutoCompleteOption | undefined {
  const entry = entries[index];
  return entry && !entry.group && 'value' in entry.option ? entry.option : undefined;
}
