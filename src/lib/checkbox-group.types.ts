import type { HTMLFieldsetAttributes } from 'svelte/elements';

export type CheckboxGroupValue = string | number | boolean;

export interface CheckboxGroupOption<Value extends CheckboxGroupValue = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

/** Типизированный массив значений и независимые нативные checkbox для FormData. */
export interface CheckboxGroupProps<Value extends CheckboxGroupValue = string> extends Omit<
  HTMLFieldsetAttributes,
  'children' | 'class' | 'onchange'
> {
  options: readonly (Value | CheckboxGroupOption<Value>)[];
  /** Поддерживает bind:value. */
  value?: Value[] | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: readonly Value[];
  onValueChange?: (value: Value[]) => void;
  class?: string;
}
