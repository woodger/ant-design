import type { Snippet } from 'svelte';
import type { ComponentSize } from './types';

export type TabsType = 'line' | 'card';
export type TabsPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TabsContent = string | number | boolean | null | Snippet;
export type TabsExtraContent = TabsContent | { left?: TabsContent; right?: TabsContent; };

export interface TabsItem {
  key: string;
  label: TabsContent;
  children?: Snippet;
  icon?: Snippet;
  disabled?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
}

/** Набор keyed панелей с bind:activeKey, ручной клавиатурной активацией и overflow. */
export interface TabsProps {
  items: readonly TabsItem[];
  /** Поддерживает bind:activeKey. */
  activeKey?: string | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string, event: MouseEvent) => void;
  type?: TabsType;
  /** @defaultValue 'top' */
  tabPlacement?: TabsPlacement;
  size?: ComponentSize;
  /** @defaultValue false */
  destroyOnHidden?: boolean;
  tabBarExtraContent?: TabsExtraContent;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  style?: string;
}
