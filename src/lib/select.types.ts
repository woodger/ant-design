import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize, SelectOption } from './types';

export interface SelectSearchConfig<Value extends string | number = string> {
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterOption?: boolean | ((search: string, option: SelectOption<Value>) => boolean);
}

export interface SelectProps<Value extends string | number = string, Mode extends 'multiple' | undefined = undefined> extends Omit<HTMLInputAttributes, 'value' | 'size' | 'class' | 'onchange' | 'oninput' | 'type' | 'children'> {
  options: readonly SelectOption<Value>[];
  mode?: Mode;
  value?: (Mode extends 'multiple' ? Value[] : Value) | undefined;
  defaultValue?: Mode extends 'multiple' ? readonly Value[] : Value;
  size?: ComponentSize;
  showSearch?: boolean | SelectSearchConfig<Value>;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterOption?: SelectSearchConfig<Value>['filterOption'];
  loading?: boolean;
  notFoundContent?: string | number | Snippet | null;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  allowClear?: boolean;
  status?: 'error' | 'warning';
  onValueChange?: (value: Mode extends 'multiple' ? Value[] : Value | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  class?: string;
}
