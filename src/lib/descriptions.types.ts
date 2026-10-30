import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { GridResponsive } from './grid.types';

export type DescriptionsContent = string | number | boolean | null | Snippet;
export type DescriptionsCellSlots = Partial<Record<'label' | 'content', string>>;
export type DescriptionsSlots = Partial<
  Record<'root' | 'header' | 'title' | 'extra' | 'label' | 'content', string>
>;
export interface DescriptionsItem {
  key?: string | number;
  label?: DescriptionsContent;
  children?: DescriptionsContent;
  span?: number | 'filled' | GridResponsive<number>;
  class?: string;
  style?: string;
  labelStyle?: string;
  contentStyle?: string;
  classNames?: DescriptionsCellSlots;
  styles?: DescriptionsCellSlots;
}
/** Таблица описаний с responsive columns, span и semantic styles ячеек. */
export interface DescriptionsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title' | 'class' | 'style'
> {
  items?: readonly DescriptionsItem[];
  title?: DescriptionsContent;
  extra?: DescriptionsContent;
  column?: number | GridResponsive<number>;
  /** @defaultValue 'horizontal' */
  layout?: 'horizontal' | 'vertical';
  /** @defaultValue false */
  bordered?: boolean;
  /** @defaultValue true */
  colon?: boolean;
  size?: ComponentSize | 'medium' | 'default';
  labelStyle?: string;
  contentStyle?: string;
  classNames?: DescriptionsSlots | ((info: { props: DescriptionsProps; }) => DescriptionsSlots);
  styles?: DescriptionsSlots | ((info: { props: DescriptionsProps; }) => DescriptionsSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
