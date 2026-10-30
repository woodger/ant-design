import type { HTMLAttributes } from 'svelte/elements';
import type { StepsDataContent, StepsItemSlots, StepsSemanticSlots } from './steps-data.engine';
export type TimelineContent = StepsDataContent;
export type TimelinePlacement = 'start' | 'end';
export type TimelinePosition = TimelinePlacement | 'left' | 'right';
export type TimelineMode = TimelinePosition | 'alternate';
export type TimelineSlots = Omit<StepsSemanticSlots, 'itemSubtitle'>;
export interface TimelineItem {
  key?: string | number;
  title?: TimelineContent;
  content?: TimelineContent;
  label?: TimelineContent;
  children?: TimelineContent;
  color?: string;
  placement?: TimelinePlacement;
  position?: TimelinePosition;
  loading?: boolean;
  icon?: TimelineContent;
  dot?: TimelineContent;
  class?: string;
  style?: string;
  classNames?: StepsItemSlots;
  styles?: StepsItemSlots;
}
export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children' | 'class' | 'style'> {
  items?: readonly TimelineItem[];
  variant?: 'filled' | 'outlined';
  mode?: TimelineMode;
  orientation?: 'horizontal' | 'vertical';
  titleSpan?: number | string;
  pending?: TimelineContent;
  pendingDot?: TimelineContent;
  reverse?: boolean;
  classNames?: TimelineSlots | ((info: { props: TimelineProps }) => TimelineSlots);
  styles?: TimelineSlots | ((info: { props: TimelineProps }) => TimelineSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLOListElement;
}
