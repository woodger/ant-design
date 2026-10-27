import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes, HTMLInputAttributes } from 'svelte/elements';

export type RadioValue = string | number | boolean;

export interface RadioProps extends Omit<HTMLInputAttributes, 'type' | 'value' | 'checked' | 'children' | 'class' | 'size'> {
  value?: RadioValue;
  checked?: boolean | undefined;
  defaultChecked?: boolean;
  children?: Snippet;
  onCheckedChange?: (checked: boolean) => void;
  class?: string;
}

export interface RadioOption<Value extends RadioValue = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<Value extends RadioValue = string> extends Omit<HTMLFieldsetAttributes, 'children' | 'class' | 'onchange'> {
  options: readonly (Value | RadioOption<Value>)[];
  value?: Value | undefined;
  defaultValue?: Value;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onValueChange?: (value: Value) => void;
  class?: string;
}
