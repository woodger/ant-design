import type { CheckboxGroupOption, CheckboxGroupValue } from './checkbox-group.types';

export function getCheckboxGroupOptions<Value extends CheckboxGroupValue>(
  options: readonly (Value | CheckboxGroupOption<Value>)[]
): CheckboxGroupOption<Value>[] {
  const seen = new Set<Value>();

  return options.flatMap((option) => {
    const item = typeof option === 'object' ? option : { value: option, label: String(option) };

    if (seen.has(item.value)) return [];

    seen.add(item.value);
    return [item];
  });
}

export function getCheckboxGroupValue<Value extends CheckboxGroupValue>(
  options: readonly CheckboxGroupOption<Value>[],
  value: readonly Value[]
): Value[] {
  const selected = new Set(value);

  return options.filter((option) => selected.has(option.value)).map((option) => option.value);
}
