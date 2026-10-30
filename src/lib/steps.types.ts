import type { HTMLAttributes } from 'svelte/elements';
import type { StepsDataItem, StepsSemanticSlots } from './steps-data.engine';
import type { StepsType, StepsIconRender, StepsProgressDotRender } from './steps-expanded.types';
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

/** Управляемые этапы с current, items, статусами и вариантами размещения. */
export interface StepsProps extends Omit<
  HTMLAttributes<HTMLOListElement>,
  'children' | 'class' | 'style' | 'onchange'
> {
  items?: readonly (StepsItem | StepsDataItem | false | null | undefined)[];
  /** @defaultValue 0 */
  initial?: number;
  /** @defaultValue 'filled' */
  variant?: 'filled' | 'outlined';
  type?: StepsType;
  direction?: StepsOrientation;
  titlePlacement?: StepsOrientation;
  labelPlacement?: StepsOrientation;
  progressDot?: boolean | StepsProgressDotRender;
  percent?: number;
  maxCount?: number;
  ellipsis?: boolean;
  /** @defaultValue 0 */
  offset?: number;
  iconRender?: StepsIconRender;
  classNames?: StepsSemanticSlots | ((info: { props: StepsProps; }) => StepsSemanticSlots);
  styles?: StepsSemanticSlots | ((info: { props: StepsProps; }) => StepsSemanticSlots);
  rootClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLOListElement;
  /** @defaultValue 0 */
  current?: number;
  /** @defaultValue 'process' */
  status?: StepsStatus;
  onChange?: (current: number) => void;
  orientation?: StepsOrientation;
  size?: StepsSize | 'default';
  /** @defaultValue true */
  responsive?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
