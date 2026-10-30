import type { Snippet } from 'svelte';
import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type TextAreaVariant = 'outlined' | 'filled' | 'borderless' | 'underlined';
export interface TextAreaCountInfo { value: string; count: number; maxLength?: number; }
export type TextAreaCountContent = string | number | boolean | null | undefined | Snippet<[TextAreaCountInfo]>;
export type TextAreaCountFormatter = (info: TextAreaCountInfo) => TextAreaCountContent;
export interface TextAreaCountConfig {
  max?: number;
  strategy?: (value: string) => number;
  show?: boolean | TextAreaCountFormatter;
  exceedFormatter?: (value: string, info: { max: number }) => string;
}
export interface TextAreaAllowClear { disabled?: boolean; clearIcon?: string | number | false | null | Snippet; }
export type TextAreaSemanticSlots = Partial<Record<'root' | 'textarea' | 'clear' | 'count', string>>;
export type TextAreaSemantic = TextAreaSemanticSlots | ((info: { props: TextAreaProps }) => TextAreaSemanticSlots | undefined);
export type TextAreaChangeEvent = Event & { target: HTMLTextAreaElement; currentTarget: HTMLTextAreaElement; readonly nativeEvent: Event };
export interface TextAreaConfig {
  allowClear?: boolean | TextAreaAllowClear;
  autoComplete?: HTMLTextareaAttributes['autocomplete'];
  variant?: TextAreaVariant;
  class?: string;
  style?: string;
  classNames?: TextAreaSemantic;
  styles?: TextAreaSemantic;
}

export interface TextAreaProps extends Omit<HTMLTextareaAttributes, 'value' | 'defaultValue' | 'children' | 'class'> {
  value?: string;
  defaultValue?: string;
  size?: ComponentSize | 'medium';
  status?: 'error' | 'warning' | '';
  variant?: TextAreaVariant;
  bordered?: boolean;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  allowClear?: boolean | TextAreaAllowClear;
  showCount?: boolean | { formatter: TextAreaCountFormatter };
  count?: TextAreaCountConfig;
  maxLength?: number;
  readOnly?: boolean;
  autoComplete?: HTMLTextareaAttributes['autocomplete'];
  autoFocus?: boolean;
  classNames?: TextAreaSemantic;
  styles?: TextAreaSemantic;
  rootClassName?: string;
  onValueChange?: (value: string) => void;
  onChange?: (event: TextAreaChangeEvent) => void;
  onClear?: () => void;
  onResize?: (size: { width: number; height: number }) => void;
  onFocus?: HTMLTextareaAttributes['onfocus'];
  onBlur?: HTMLTextareaAttributes['onblur'];
  onKeyDown?: HTMLTextareaAttributes['onkeydown'];
  onMouseDown?: HTMLTextareaAttributes['onmousedown'];
  onCompositionStart?: HTMLTextareaAttributes['oncompositionstart'];
  onCompositionEnd?: HTMLTextareaAttributes['oncompositionend'];
  onPressEnter?: HTMLTextareaAttributes['onkeydown'];
  nativeElement?: HTMLTextAreaElement;
  rootElement?: HTMLElement;
  class?: string;
}
