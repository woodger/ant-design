import type { HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize, SelectOption } from './types';

export interface SelectProps<Value extends string | number = string> extends Omit<HTMLInputAttributes, 'value' | 'size' | 'class' | 'onchange' | 'oninput' | 'type' | 'children'> {
  options: readonly SelectOption<Value>[];
  value?: Value | undefined;
  defaultValue?: Value;
  size?: ComponentSize;
  showSearch?: boolean;
  allowClear?: boolean;
  status?: 'error' | 'warning';
  onValueChange?: (value: Value | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  class?: string;
}
