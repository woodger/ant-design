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
/** Извлечение упоминаний по prefix и буквальному разделителю split. */
export interface MentionsConfig {
  prefix?: string | readonly string[];
  split?: string;
}
export interface MentionsEntity {
  prefix: string;
  value: string;
}
/** Textarea с поиском упоминаний у каретки и вставкой выбранного option. */
export interface MentionsProps extends Omit<
  HTMLTextareaAttributes,
  'value'
  | 'defaultValue'
  | 'children'
  | 'prefix'
  | 'onchange'
  | 'onselect'
  | 'onfocus'
  | 'onblur'
  | 'onresize'
>, MentionsConfig {
  /** Полная строка textarea; offsets выделения измеряются в UTF-16. */
  value?: string;
  /** @defaultValue '' */
  defaultValue?: string;
  options?: readonly MentionsOption[];
  filterOption?: false | ((text: string, option: MentionsOption) => boolean);
  validateSearch?: (text: string, split?: string) => boolean;
  /** @defaultValue false */
  loading?: boolean;
  notFoundContent?: string | number | Snippet | null;
  /** @defaultValue 'bottom' */
  placement?: 'top' | 'bottom';
  /** @defaultValue false */
  autoSize?: boolean | { minRows?: number; maxRows?: number; };
  /** @defaultValue false */
  allowClear?: boolean | { clearIcon?: Snippet; disabled?: boolean; };
  size?: ComponentSize;
  status?: 'error' | 'warning' | 'success' | 'validating';
  /** @defaultValue 'outlined' */
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  onChange?: (text: string) => void;
  /** Поисковый текст и найденный prefix; сетевые запросы остаются у потребителя. */
  onSearch?: (text: string, prefix: string) => void;
  onSelect?: (option: MentionsOption, prefix: string) => void;
  onClear?: () => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onPressEnter?: (event: KeyboardEvent) => void;
  onResize?: (size: { width: number; height: number; }) => void;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  class?: string;
  rootClassName?: string;
  /** @defaultValue '' */
  popupClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  /** Поддерживает bind:textarea. */
  textarea?: HTMLTextAreaElement;
}
