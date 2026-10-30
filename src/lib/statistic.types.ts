import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type StatisticValue = string | number;
export type StatisticContent = string | number | Snippet | null | false;
export type StatisticSemanticSlots = Partial<
  Record<'root' | 'header' | 'title' | 'content' | 'value' | 'prefix' | 'suffix', string>
>;
export interface StatisticSemanticInfo {
  props: StatisticProps & {
    value: StatisticValue;
    loading: boolean;
    decimalSeparator: string;
    groupSeparator: string;
  };
}

/** Точное отображение числового или строкового значения с форматированием и единицами. */
export interface StatisticProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'class' | 'style' | 'children' | 'prefix'
> {
  /** @defaultValue 0 */
  value?: StatisticValue;
  precision?: number;
  /** @defaultValue '.' */
  decimalSeparator?: string;
  /** @defaultValue ',' */
  groupSeparator?: string;
  formatter?: false | 'number' | 'countdown' | ((value: StatisticValue) => StatisticContent);
  title?: StatisticContent;
  prefix?: StatisticContent;
  suffix?: StatisticContent;
  /** @defaultValue false */
  loading?: boolean;
  valueRender?: Snippet<[Snippet]>;
  /** @deprecated Используйте styles.content. */
  valueStyle?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: StatisticSemanticSlots | ((info: StatisticSemanticInfo) => StatisticSemanticSlots);
  styles?: StatisticSemanticSlots | ((info: StatisticSemanticInfo) => StatisticSemanticSlots);
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
