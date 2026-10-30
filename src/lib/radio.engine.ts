import type { RadioOption, RadioValue } from './radio.types';

export function getRadioOptions<Value extends RadioValue>(
  options: readonly (Value | RadioOption<Value>)[]
): RadioOption<Value>[] {
  const seen = new Set<Value>();

  return options.flatMap((option) => {
    const item = typeof option === 'object' ? option : { value: option, label: String(option) };

    if (seen.has(item.value)) return [];

    seen.add(item.value);
    return [item];
  });
}
