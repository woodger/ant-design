import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export interface AutoCompleteOption {
  value: string;
  label?: string | number | Snippet;
  key?: string | number;
  disabled?: boolean;
  title?: string;
  class?: string;
  style?: string;
}
export interface AutoCompleteGroup {
  label?: string | number | Snippet;
  key?: string | number;
  options: readonly AutoCompleteOption[];
}
export type AutoCompleteItem = AutoCompleteOption | AutoCompleteGroup;
/** Управление поисковой строкой и фильтрацией подсказок AutoComplete. */
export interface AutoCompleteSearchConfig {
  filterOption?: boolean | ((text: string, option: AutoCompleteItem) => boolean);
  onSearch?: (text: string) => void;
}
export interface AutoCompleteInput {
  attributes: Pick<
    HTMLInputAttributes,
    'id'
    | 'value'
    | 'name'
    | 'placeholder'
    | 'disabled'
    | 'required'
    | 'readonly'
    | 'dir'
    | 'autocomplete'
    | 'role'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'aria-autocomplete'
    | 'aria-invalid'
    | 'aria-describedby'
    | 'aria-label'
  > & {
    oninput: (event: Event) => void;
    onkeydown: (event: KeyboardEvent) => void;
    onkeyup: (event: KeyboardEvent) => void;
    onclick: (event: MouseEvent) => void;
    onfocus: (event: FocusEvent) => void;
    onblur: (event: FocusEvent) => void;
  };
  register: (element: HTMLInputElement | HTMLTextAreaElement) => { destroy: () => void; };
}
/** Свободный текст с options, выбором подсказки и собственным input snippet. */
export interface AutoCompleteProps extends Omit<
  HTMLInputAttributes,
  'value'
  | 'defaultValue'
  | 'size'
  | 'children'
  | 'onchange'
  | 'onselect'
  | 'oninput'
  | 'onfocus'
  | 'onblur'
  | 'onkeydown'
  | 'onkeyup'
  | 'onclick'
> {
  options?: readonly AutoCompleteItem[];
  /** Произвольная строка; соответствие options не требуется. */
  value?: string;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: string;
  open?: boolean;
  /** @defaultValue false */
  defaultOpen?: boolean;
  /** @defaultValue true */
  showSearch?: boolean | AutoCompleteSearchConfig;
  filterOption?: AutoCompleteSearchConfig['filterOption'];
  onSearch?: (text: string) => void;
  /** Свободный ввод и выбор; очистка может передать undefined, затем пустую строку. */
  onChange?: (value: string | undefined, option: Partial<AutoCompleteOption> | undefined) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  onOpenChange?: (open: boolean) => void;
  onClear?: () => void;
  onInputKeyDown?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  /** @defaultValue false */
  backfill?: boolean;
  /** @defaultValue false */
  defaultActiveFirstOption?: boolean;
  /** @defaultValue false */
  allowClear?: boolean | { clearIcon?: Snippet; };
  notFoundContent?: string | number | Snippet | null;
  /** @defaultValue true */
  popupMatchSelectWidth?: boolean | number;
  /** @defaultValue 256 */
  listHeight?: number;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  /** @defaultValue 'outlined' */
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  /** Собственный control: примените attributes и register из контекста snippet. */
  children?: Snippet<[AutoCompleteInput]>;
  class?: string;
  rootClassName?: string;
  /** @defaultValue '' */
  popupClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  /** Нативный ref доступен после mount и очищается при unmount. */
  inputElement?: HTMLInputElement | HTMLTextAreaElement;
}
