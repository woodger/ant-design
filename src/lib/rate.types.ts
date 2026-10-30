import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TooltipProps } from './tooltip.types';

export interface RateCharacterInfo {
  index: number;
  count: number;
  value?: number;
  allowHalf: boolean;
  disabled: boolean;
  focused: boolean;
  prefixCls: string;
  onHover: (event: MouseEvent, index: number) => void;
  onClick: (event: MouseEvent | KeyboardEvent, index: number) => void;
}

/** Стили ConfigProvider.rate; class и style компонента дополняют настройки провайдера. */
export interface RateConfig {
  class?: string;
  style?: string;
}

/** Оценка со звёздами, половинным выбором, hover и управляемым или локальным value. */
export interface RateProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'children' | 'class' | 'style' | 'onchange'
> {
  /** Управляемое значение; владелец принимает новый выбор через onChange. */
  value?: number;
  /** Начальная локальная оценка при отсутствии value; по умолчанию 0. */
  defaultValue?: number;
  /** @defaultValue 5 */
  count?: number;
  /** @defaultValue false */
  allowHalf?: boolean;
  /** @defaultValue true */
  allowClear?: boolean;
  /** @defaultValue true */
  keyboard?: boolean;
  disabled?: boolean;
  size?: ComponentSize | 'medium';
  character?: string | number | Snippet<[RateCharacterInfo]>;
  /** Snippet получает исходный character snippet и контекст текущей звезды. */
  characterRender?: Snippet<[Snippet, RateCharacterInfo]>;
  tooltips?: readonly (string | Omit<TooltipProps, 'children'>)[];
  /** @defaultValue false */
  autoFocus?: boolean;
  tabIndex?: number;
  onChange?: (value: number) => void;
  /** Hover-оценка; undefined означает уход указателя с control. */
  onHoverChange?: (value: number | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLUListElement;
}
