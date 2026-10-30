import type { HTMLFieldsetAttributes } from 'svelte/elements';

export type CheckboxGroupValue = string | number | boolean;

export interface CheckboxGroupOption<Value extends CheckboxGroupValue = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps<Value extends CheckboxGroupValue = string> extends Omit<HTMLFieldsetAttributes, 'children' | 'class' | 'onchange'> {
  options: readonly (Value | CheckboxGroupOption<Value>)[];
  value?: Value[] | undefined;
  defaultValue?: readonly Value[];
  onValueChange?: (value: Value[]) => void;
  class?: string;
}
