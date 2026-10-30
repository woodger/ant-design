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

/** Независимые раскрываемые панели или accordion с управлением activeKey. */
export interface CollapseProps {
  items: readonly CollapseItem[];
  /** Поддерживает bind:activeKey. */
  activeKey?: CollapseActiveKey | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveKey?: CollapseActiveKey;
  onChange?: (activeKey: string[]) => void;
  /** @defaultValue false */
  accordion?: boolean;
  /** @defaultValue 'header' */
  collapsible?: CollapseTrigger;
  /** @defaultValue 'start' */
  expandIconPlacement?: 'start' | 'end';
  size?: ComponentSize;
  /** @defaultValue true */
  bordered?: boolean;
  /** @defaultValue false */
  ghost?: boolean;
  /** @defaultValue false */
  destroyOnHidden?: boolean;
  /** @defaultValue 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  style?: string;
}
