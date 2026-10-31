import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ButtonProps, ButtonSlots } from './button.types';
import type {
  InputChangeEvent,
  InputContent,
  InputProps,
  InputSemanticSlots,
  InputVariant
} from './input.types';

/**
 * Замена React cloneElement для enterButton snippet. Примените результат к Button или
 * native button: сохраняются собственные callbacks, disabled/loading и порядок обработчиков.
 */
export interface InputSearchButtonContext {
  /** Добавляет search class/size/loading; собственные callbacks вызываются первыми. */
  getButtonProps: (props?: ButtonProps) => ButtonProps;
  /** Сохраняет native class/type; loading дополнительно блокирует native button. */
  getNativeProps: (props?: HTMLButtonAttributes) => HTMLButtonAttributes;
}

export type InputSearchSemanticSlots = InputSemanticSlots & { button?: ButtonSlots | string; };

/**
 * Callback получает исходные Props с default enterButton и variant настроек Search.
 * Как в upstream, disabled здесь не заменяется значением ConfigProvider.
 * String в button служит сокращением для button.root.
 */
export type InputSearchSemantic =
  | InputSearchSemanticSlots
  | ((info: { props: InputSearchProps; }) => InputSearchSemanticSlots | undefined);

/** Настройки ConfigProvider.inputSearch; вложенный объект заменяет родительский целиком. */
export interface InputSearchConfig {
  searchIcon?: InputContent;
  variant?: InputVariant;
  class?: string;
  style?: string;
  classNames?: InputSearchSemantic;
  styles?: InputSearchSemantic;
}

/**
 * Svelte-экспорт Input.Search с bind:value и событиями Input. Class/style/hidden и data-*
 * относятся к Compact root; inputElement/nativeElement и методы bind:this принадлежат Input.
 */
export interface InputSearchProps extends Omit<InputProps, 'classNames' | 'styles'> {
  /**
   * false по умолчанию: обычная icon button; true — primary icon button;
   * scalar — текст primary button. Snippet заменяет кнопку целиком и получает контекст props.
   */
  enterButton?: string | number | boolean | null | Snippet<[InputSearchButtonContext]>;
  /**
   * Локальное значение перекрывает context; null/false скрывают иконку.
   * Применяется только для boolean enterButton.
   */
  searchIcon?: InputContent;
  /** Блокирует кнопку и поиск по Enter; очистка остаётся доступной, как в upstream. */
  loading?: boolean;
  /** Очистка вызывает source=clear перед onChange; Enter/кнопка вызывают source=input. */
  onSearch?: (
    value: string,
    event?: InputChangeEvent | MouseEvent | KeyboardEvent,
    info?: { source?: 'input' | 'clear'; }
  ) => void;
  /** Блокируется при loading/IME и вызывается перед onSearch для Enter. */
  onPressEnter?: InputProps['onPressEnter'];
  classNames?: InputSearchSemantic;
  styles?: InputSearchSemantic;
}
