import type { Snippet } from 'svelte';
import type StepIcon from './StepIcon.svelte';
import type { StepsStatus } from './steps.types';
import type { NormalizedStepsDataItem, StepsDataItem, StepsDataContent, StepsSemanticSlots } from './steps-data.engine';
export type { StepsDataItem, StepsDataContent, StepsItemSlots, StepsSemanticSlots } from './steps-data.engine';
export type StepsType = 'default' | 'dot' | 'inline' | 'navigation' | 'panel';
export interface StepsIconInfo {
  index: number;
  active: boolean;
  item: StepsDataItem & { status: StepsStatus };
  components: { Icon: typeof StepIcon };
}
export type StepsIconRender = Snippet<[Snippet, StepsIconInfo]>;
export type StepsProgressDotRender = Snippet<[Snippet, { index: number; status: StepsStatus; title?: StepsDataContent; description?: StepsDataContent; content?: StepsDataContent }]>;
export interface StepItemViewProps {
  item: NormalizedStepsDataItem;
  index: number;
  status: StepsStatus;
  active: boolean;
  blocked: boolean;
  nextStatus?: StepsStatus;
  rootId: string;
  statusText: string;
  classes: StepsSemanticSlots;
  slots: StepsSemanticSlots;
  dot?: boolean;
  panel?: boolean;
  inline?: boolean;
  percent?: number;
  iconRender?: StepsIconRender;
  progressDotRender?: StepsProgressDotRender;
  ellipsis?: boolean;
  sourceKey?: string | number;
  onChoose?: (event: MouseEvent) => void;
}
