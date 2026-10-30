import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { InputAllowClear, InputCountConfig, InputShowCount } from './input-count.types';

export type { InputAllowClear, InputCountConfig, InputCountInfo, InputCountFormatter, InputCountContent } from './input-count.types';
export type InputVariant = 'outlined' | 'filled' | 'borderless' | 'underlined';
export type InputContent = string | number | boolean | null | Snippet;
export type InputSemanticSlots = Partial<Record<'root' | 'input' | 'prefix' | 'suffix' | 'clear' | 'count', string>>;
export type InputSemantic = InputSemanticSlots | ((info: { props: InputProps }) => InputSemanticSlots | undefined);
export type InputChangeEvent = Event & { target: HTMLInputElement; currentTarget: HTMLInputElement; readonly nativeEvent: Event };
export interface InputConfig {
  allowClear?: boolean | InputAllowClear;
  autoComplete?: HTMLInputAttributes['autocomplete'];
  variant?: InputVariant;
  class?: string;
  style?: string;
  classNames?: InputSemantic;
  styles?: InputSemantic;
}

export interface InputProps extends Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'children' | 'size' | 'class' | 'prefix'> {
  value?: string;
  defaultValue?: string;
  size?: ComponentSize | 'medium';
  htmlSize?: number;
  status?: 'error' | 'warning' | '';
  variant?: InputVariant;
  bordered?: boolean;
  prefix?: InputContent;
  suffix?: InputContent;
  addonBefore?: InputContent;
  addonAfter?: InputContent;
  allowClear?: boolean | InputAllowClear;
  showCount?: InputShowCount;
  count?: InputCountConfig;
  maxLength?: number;
  readOnly?: boolean;
  autoComplete?: HTMLInputAttributes['autocomplete'];
  autoFocus?: boolean;
  class?: string;
  rootClassName?: string;
  classNames?: InputSemantic;
  styles?: InputSemantic;
  inputElement?: HTMLInputElement;
  nativeElement?: HTMLElement;
  onValueChange?: (value: string) => void;
  onChange?: (event: InputChangeEvent) => void;
  onClear?: () => void;
  onPressEnter?: HTMLInputAttributes['onkeydown'];
  onFocus?: HTMLInputAttributes['onfocus'];
  onBlur?: HTMLInputAttributes['onblur'];
  onKeyDown?: HTMLInputAttributes['onkeydown'];
  onKeyUp?: HTMLInputAttributes['onkeyup'];
  onCompositionStart?: HTMLInputAttributes['oncompositionstart'];
  onCompositionEnd?: HTMLInputAttributes['oncompositionend'];
  [key: `data-${string}`]: string | undefined;
}
