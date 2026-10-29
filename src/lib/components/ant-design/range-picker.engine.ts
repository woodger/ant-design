import type { Dayjs } from 'dayjs';
import type { RangePickerInputValue, RangePickerValue } from './range-picker.types';
export function rangePair(value: RangePickerInputValue | null | undefined): RangePickerValue { return [value?.[0] ?? null, value?.[1] ?? null]; }
export function rangeFlags(value: boolean | readonly boolean[] | undefined, fallback = false): [boolean, boolean] { return Array.isArray(value) ? [Boolean(value[0]), Boolean(value[1])] : [value ?? fallback, value ?? fallback] as [boolean, boolean]; }
export function sameRange(a: RangePickerValue, b: RangePickerValue): boolean { return a.every((date, index) => date?.valueOf() === b[index]?.valueOf()); }
export function rangeFrom(values: RangePickerValue, triggered: readonly number[], active: number): Dayjs | undefined {
  const first = triggered.find(index => values[index]);
  return first !== undefined && first !== active ? values[first] ?? undefined : undefined;
}
export function orderedRange(value: RangePickerValue, order: boolean, disabled: readonly boolean[]): RangePickerValue {
  return order && !disabled.some(Boolean) && value[0] && value[1] && value[0].isAfter(value[1]) ? [value[1], value[0]] : [...value];
}
export function validRange(value: RangePickerValue, allowEmpty: readonly boolean[], order: boolean, disabled: readonly boolean[], invalid: (date: Dayjs, index: number, from?: Dayjs) => boolean): boolean {
  const [start, end] = value;
  return Boolean((start || allowEmpty[0]) && (end || allowEmpty[1]) && (!order || !start || !end || start.isSame(end, 'day') || end.isAfter(start)) && value.every((date, index) => disabled[index] || !date || !invalid(date, index, index === 1 ? start ?? undefined : undefined)));
}
