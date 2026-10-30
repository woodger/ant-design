import type { Snippet } from 'svelte';
import type { ComponentSize } from './types';

export type CollapseTrigger = 'header' | 'icon' | 'disabled';
export type CollapseActiveKey = string | readonly string[];

export interface CollapseItem {
  key: string;
  label: string | Snippet;
  children?: Snippet;
  extra?: Snippet;
  collapsible?: CollapseTrigger;
  showArrow?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
}

export interface CollapseProps {
  items: readonly CollapseItem[];
  activeKey?: CollapseActiveKey | undefined;
  defaultActiveKey?: CollapseActiveKey;
  onChange?: (activeKey: string[]) => void;
  accordion?: boolean;
  collapsible?: CollapseTrigger;
  expandIconPlacement?: 'start' | 'end';
  size?: ComponentSize;
  bordered?: boolean;
  ghost?: boolean;
  destroyOnHidden?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  style?: string;
}
