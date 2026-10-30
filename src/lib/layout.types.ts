import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { GridBreakpoint } from './grid.types';

/** Нативная секция Layout с дополнительными HTML-атрибутами. */
export interface LayoutSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'class' | 'style'
> {
  children?: Snippet;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLElement;
}
/** Контейнер Layout; hasSider позволяет явно задать структуру при SSR. */
export interface LayoutProps extends LayoutSectionProps {
  hasSider?: boolean;
}
export type LayoutCollapseType = 'clickTrigger' | 'responsive';
export type LayoutSiderSemanticSlots = Partial<Record<'root' | 'body', string>>;
/** Боковая секция Layout с collapse, responsive breakpoint и trigger. */
export interface LayoutSiderProps extends LayoutSectionProps {
  /** Поддерживает bind:collapsed. */
  collapsed?: boolean;
  /** @defaultValue false */
  defaultCollapsed?: boolean;
  /** @defaultValue false */
  collapsible?: boolean;
  /** @defaultValue false */
  reverseArrow?: boolean;
  /** @defaultValue 200 */
  width?: number | string;
  /** @defaultValue 80 */
  collapsedWidth?: number | string;
  breakpoint?: GridBreakpoint;
  /** @defaultValue 'dark' */
  theme?: 'light' | 'dark';
  trigger?: Snippet | string | number | null | false;
  zeroWidthTriggerStyle?: string;
  expandLabel?: string;
  collapseLabel?: string;
  onCollapse?: (collapsed: boolean, type: LayoutCollapseType) => void;
  onBreakpoint?: (broken: boolean) => void;
  classNames?:
  LayoutSiderSemanticSlots
  | ((info: { props: LayoutSiderProps; }) => LayoutSiderSemanticSlots);
  styles?:
  LayoutSiderSemanticSlots
  | ((info: { props: LayoutSiderProps; }) => LayoutSiderSemanticSlots);
}
