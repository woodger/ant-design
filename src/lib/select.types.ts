import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize, SelectOption } from './types';

/** Настройки controlled search и локальной фильтрации Select без сетевого транспорта. */
export interface SelectSearchConfig<Value extends string | number = string> {
  searchValue?: string;
  /**
   * Уведомляет о пользовательском поиске; запросы и защиту от старых ответов делает потребитель.
   */
  onSearch?: (value: string) => void;
  /** false отключает локальную фильтрацию; predicate получает исходный option. */
  filterOption?: boolean | ((search: string, option: SelectOption<Value>) => boolean);
}

/** Single/multiple выбор строковых или числовых значений с нативным FormData. */
export interface SelectProps<
  Value extends string | number = string,
  Mode extends 'multiple' | undefined = undefined
> extends Omit<
  HTMLInputAttributes,
  'value' | 'size' | 'class' | 'onchange' | 'oninput' | 'type' | 'children'
> {
  options: readonly SelectOption<Value>[];
  mode?: Mode;
  /** Поддерживает bind:value; multiple использует массив того же типа Value. */
  value?: (Mode extends 'multiple' ? Value[] : Value) | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: Mode extends 'multiple' ? readonly Value[] : Value;
  size?: ComponentSize;
  /** Объект объединяет настройки поиска с top-level props. */
  showSearch?: boolean | SelectSearchConfig<Value>;
  /** Управляемая строка поиска; options и выбранные значения обновляются независимо. */
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterOption?: SelectSearchConfig<Value>['filterOption'];
  /** @defaultValue false */
  loading?: boolean;
  notFoundContent?: string | number | Snippet | null;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  /** @defaultValue false */
  allowClear?: boolean;
  status?: 'error' | 'warning';
  onValueChange?: (value: Mode extends 'multiple' ? Value[] : Value | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  class?: string;
}
