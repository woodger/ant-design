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
export interface AutoCompleteSearchConfig {
  filterOption?: boolean | ((text: string, option: AutoCompleteItem) => boolean);
  onSearch?: (text: string) => void;
}
export interface AutoCompleteInput {
  attributes: Pick<HTMLInputAttributes, 'id' | 'value' | 'name' | 'placeholder' | 'disabled' | 'required' | 'readonly' | 'dir' | 'autocomplete' | 'role' | 'aria-expanded' | 'aria-controls' | 'aria-activedescendant' | 'aria-autocomplete' | 'aria-invalid' | 'aria-describedby' | 'aria-label'> & {
    oninput: (event: Event) => void;
    onkeydown: (event: KeyboardEvent) => void;
    onkeyup: (event: KeyboardEvent) => void;
    onclick: (event: MouseEvent) => void;
    onfocus: (event: FocusEvent) => void;
    onblur: (event: FocusEvent) => void;
  };
  register: (element: HTMLInputElement | HTMLTextAreaElement) => { destroy: () => void };
}
export interface AutoCompleteProps extends Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'size' | 'children' | 'onchange' | 'onselect' | 'oninput' | 'onfocus' | 'onblur' | 'onkeydown' | 'onkeyup' | 'onclick'> {
  options?: readonly AutoCompleteItem[];
  value?: string;
  defaultValue?: string;
  open?: boolean;
  defaultOpen?: boolean;
  showSearch?: boolean | AutoCompleteSearchConfig;
  filterOption?: AutoCompleteSearchConfig['filterOption'];
  onSearch?: (text: string) => void;
  onChange?: (value: string | undefined, option: Partial<AutoCompleteOption> | undefined) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  onOpenChange?: (open: boolean) => void;
  onClear?: () => void;
  onInputKeyDown?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  backfill?: boolean;
  defaultActiveFirstOption?: boolean;
  allowClear?: boolean | { clearIcon?: Snippet };
  notFoundContent?: string | number | Snippet | null;
  popupMatchSelectWidth?: boolean | number;
  listHeight?: number;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  children?: Snippet<[AutoCompleteInput]>;
  class?: string;
  rootClassName?: string;
  popupClassName?: string;
  nativeElement?: HTMLDivElement;
  inputElement?: HTMLInputElement | HTMLTextAreaElement;
}
