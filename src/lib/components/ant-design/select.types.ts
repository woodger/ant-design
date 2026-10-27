import type { HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize, SelectOption } from './types';

export interface SelectProps<Value extends string | number = string, Mode extends 'multiple' | undefined = undefined> extends Omit<HTMLInputAttributes, 'value' | 'size' | 'class' | 'onchange' | 'oninput' | 'type' | 'children'> {
  options: readonly SelectOption<Value>[];
  mode?: Mode;
  value?: (Mode extends 'multiple' ? Value[] : Value) | undefined;
  defaultValue?: Mode extends 'multiple' ? readonly Value[] : Value;
  size?: ComponentSize;
  showSearch?: boolean;
  allowClear?: boolean;
  status?: 'error' | 'warning';
  onValueChange?: (value: Mode extends 'multiple' ? Value[] : Value | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  class?: string;
}
