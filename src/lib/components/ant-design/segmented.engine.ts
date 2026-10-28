import type { SegmentedOption, SegmentedValue } from './segmented.types';

export function normalizeSegmentedOptions<Value extends SegmentedValue>(options: readonly (Value | SegmentedOption<Value>)[]): SegmentedOption<Value>[] {
  return options.map(option => typeof option === 'object' ? {
    ...option, title: option.title ?? (!option.icon && (typeof option.label === 'string' || typeof option.label === 'number') ? String(option.label) : undefined)
  } : { value: option, label: String(option), title: String(option) });
}

export function offsetSegmentedValue<Value extends SegmentedValue>(options: readonly SegmentedOption<Value>[], value: Value | undefined, offset: number): Value | undefined {
  const valid = options.filter(option => option.value === value || !option.disabled);
  if (!valid.length) return undefined;

  const index = valid.findIndex(option => option.value === value);
  return valid[(index + offset + valid.length) % valid.length]?.value;
}
