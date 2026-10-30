import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type GridBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
export type GridScreenMap = Partial<Record<GridBreakpoint, boolean>>;
export type GridResponsive<Value> = Partial<Record<GridBreakpoint, Value>>;
export type GridGap = number | string | undefined;
export type GridGutter = GridGap | GridResponsive<number>;
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch';
export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';

export interface RowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style' | 'align'> {
  children?: Snippet;
  gutter?: GridGutter | [GridGutter, GridGutter];
  align?: RowAlign | GridResponsive<RowAlign>;
  justify?: RowJustify | GridResponsive<RowJustify>;
  wrap?: boolean;
  class?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}

export interface ColSize {
  span?: number | string;
  order?: number | string;
  offset?: number | string;
  push?: number | string;
  pull?: number | string;
  flex?: number | string;
}
export interface ColProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'>, ColSize {
  children?: Snippet;
  xs?: number | string | ColSize;
  sm?: number | string | ColSize;
  md?: number | string | ColSize;
  lg?: number | string | ColSize;
  xl?: number | string | ColSize;
  xxl?: number | string | ColSize;
  xxxl?: number | string | ColSize;
  class?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}
