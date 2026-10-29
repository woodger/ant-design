import type { Snippet } from 'svelte';
import type { HTMLTextareaAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export interface MentionsOption {
  value: string;
  label?: string | number | Snippet;
  key?: string | number;
  disabled?: boolean;
  class?: string;
  style?: string;
}
export interface MentionsConfig { prefix?: string | readonly string[]; split?: string; }
export interface MentionsEntity { prefix: string; value: string; }
export interface MentionsProps extends Omit<HTMLTextareaAttributes, 'value' | 'defaultValue' | 'children' | 'prefix' | 'onchange' | 'onselect' | 'onfocus' | 'onblur' | 'onresize'>, MentionsConfig {
  value?: string;
  defaultValue?: string;
  options?: readonly MentionsOption[];
  filterOption?: false | ((text: string, option: MentionsOption) => boolean);
  validateSearch?: (text: string, split?: string) => boolean;
  loading?: boolean;
  notFoundContent?: string | number | Snippet | null;
  placement?: 'top' | 'bottom';
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  allowClear?: boolean | { clearIcon?: Snippet; disabled?: boolean };
  size?: ComponentSize;
  status?: 'error' | 'warning' | 'success' | 'validating';
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  onChange?: (text: string) => void;
  onSearch?: (text: string, prefix: string) => void;
  onSelect?: (option: MentionsOption, prefix: string) => void;
  onClear?: () => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onPressEnter?: (event: KeyboardEvent) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  class?: string;
  rootClassName?: string;
  popupClassName?: string;
  nativeElement?: HTMLDivElement;
  textarea?: HTMLTextAreaElement;
}
