import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TooltipProps } from './tooltip.types';

export type SegmentedValue = string | number;
export interface SegmentedOption<Value extends SegmentedValue = SegmentedValue> {
  value: Value;
  label?: string | number | Snippet;
  icon?: Snippet;
  title?: string;
  'aria-label'?: string;
  disabled?: boolean;
  class?: string;
  tooltip?: string | Omit<TooltipProps, 'children'>;
}
export type SegmentedSemanticSlots = Partial<Record<'root' | 'item' | 'label' | 'icon', string>>;
/** Типизированный выбор одного значения через нативные radio в сегментированном control. */
export interface SegmentedProps<Value extends SegmentedValue = SegmentedValue> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style' | 'onchange'
> {
  options: readonly (Value | SegmentedOption<Value>)[];
  /** Поддерживает bind:value. */
  value?: Value;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  /** @defaultValue false */
  disabled?: boolean;
  name?: string;
  /** @defaultValue false */
  block?: boolean;
  size?: ComponentSize | 'medium';
  orientation?: 'horizontal' | 'vertical';
  /** @defaultValue false */
  vertical?: boolean;
  /** @defaultValue 'default' */
  shape?: 'default' | 'round';
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?:
  SegmentedSemanticSlots
  | ((info: { props: SegmentedProps<Value>; }) => SegmentedSemanticSlots);
  styles?:
  SegmentedSemanticSlots
  | ((info: { props: SegmentedProps<Value>; }) => SegmentedSemanticSlots);
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
