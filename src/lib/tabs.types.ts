import type { Snippet } from 'svelte';
import type { ComponentSize } from './types';

export type TabsType = 'line' | 'card';
export type TabsPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TabsContent = string | number | boolean | null | Snippet;
export type TabsExtraContent = TabsContent | { left?: TabsContent; right?: TabsContent };

export interface TabsItem {
  key: string;
  label: TabsContent;
  children?: Snippet;
  icon?: Snippet;
  disabled?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
}

export interface TabsProps {
  items: readonly TabsItem[];
  activeKey?: string | undefined;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string, event: MouseEvent) => void;
  type?: TabsType;
  tabPlacement?: TabsPlacement;
  size?: ComponentSize;
  destroyOnHidden?: boolean;
  tabBarExtraContent?: TabsExtraContent;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  style?: string;
}
