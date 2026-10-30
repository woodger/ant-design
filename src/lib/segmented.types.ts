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
export interface SegmentedProps<Value extends SegmentedValue = SegmentedValue> extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style' | 'onchange'> {
  options: readonly (Value | SegmentedOption<Value>)[];
  value?: Value;
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  disabled?: boolean;
  name?: string;
  block?: boolean;
  size?: ComponentSize | 'medium';
  orientation?: 'horizontal' | 'vertical';
  vertical?: boolean;
  shape?: 'default' | 'round';
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: SegmentedSemanticSlots | ((info: { props: SegmentedProps<Value> }) => SegmentedSemanticSlots);
  styles?: SegmentedSemanticSlots | ((info: { props: SegmentedProps<Value> }) => SegmentedSemanticSlots);
  nativeElement?: HTMLDivElement;
}
