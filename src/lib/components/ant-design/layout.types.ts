import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { GridBreakpoint } from './grid.types';

export interface LayoutSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'style'> {
  children?: Snippet;
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLElement;
}
export interface LayoutProps extends LayoutSectionProps { hasSider?: boolean; }
export type LayoutCollapseType = 'clickTrigger' | 'responsive';
export type LayoutSiderSemanticSlots = Partial<Record<'root' | 'body', string>>;
export interface LayoutSiderProps extends LayoutSectionProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  reverseArrow?: boolean;
  width?: number | string;
  collapsedWidth?: number | string;
  breakpoint?: GridBreakpoint;
  theme?: 'light' | 'dark';
  trigger?: Snippet | string | number | null | false;
  zeroWidthTriggerStyle?: string;
  expandLabel?: string;
  collapseLabel?: string;
  onCollapse?: (collapsed: boolean, type: LayoutCollapseType) => void;
  onBreakpoint?: (broken: boolean) => void;
  classNames?: LayoutSiderSemanticSlots | ((info: { props: LayoutSiderProps }) => LayoutSiderSemanticSlots);
  styles?: LayoutSiderSemanticSlots | ((info: { props: LayoutSiderProps }) => LayoutSiderSemanticSlots);
}
