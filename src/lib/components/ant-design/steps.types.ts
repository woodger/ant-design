import type { Snippet } from 'svelte';

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepsOrientation = 'horizontal' | 'vertical';
export type StepsSize = 'medium' | 'small';
export type StepsContent = string | Snippet;

export interface StepsItem {
  key: string;
  title: StepsContent;
  subTitle?: StepsContent;
  content?: StepsContent;
  icon?: Snippet;
  status?: StepsStatus;
  disabled?: boolean;
}

export interface StepsProps {
  items: readonly StepsItem[];
  current?: number;
  status?: StepsStatus;
  onChange?: (current: number) => void;
  orientation?: StepsOrientation;
  size?: StepsSize;
  responsive?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
