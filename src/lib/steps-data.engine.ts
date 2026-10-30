import type { StepsStatus } from './steps.types';
import type { Snippet } from 'svelte';

export type StepsDataContent = string | number | boolean | null | undefined | Snippet;
export type StepsSemanticSlots = Partial<
  Record<
    'root'
    | 'item'
    | 'itemWrapper'
    | 'itemIcon'
    | 'itemSection'
    | 'itemHeader'
    | 'itemTitle'
    | 'itemSubtitle'
    | 'itemContent'
    | 'itemRail',
    string
  >
>;
export type StepsItemSlots = Partial<
  Record<
    'root' | 'wrapper' | 'icon' | 'section' | 'header' | 'title' | 'subtitle' | 'content' | 'rail',
    string
  >
>;
export interface StepsDataItem {
  key?: string | number;
  title?: StepsDataContent;
  subTitle?: StepsDataContent;
  content?: StepsDataContent;
  description?: StepsDataContent;
  icon?: StepsDataContent;
  status?: StepsStatus;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  class?: string;
  style?: string;
  classNames?: StepsItemSlots;
  styles?: StepsItemSlots;
}
export interface NormalizedStepsDataItem extends Omit<StepsDataItem, 'key'> {
  key: string;
  originalKey?: string | number;
}

export function stepsDataItems(items: readonly (
  StepsDataItem
  | false
  | null
  | undefined)[]): NormalizedStepsDataItem[] {
  const explicitKeys = items.flatMap(item => item && typeof item.key === 'string'
    ? [item.key]
    : []);
  let namespace = '@steps:';
  while (explicitKeys.some(key => key.startsWith(namespace)))
    namespace = `@${namespace}`;
  const seen = new Set<string>();
  return items.filter((item): item is StepsDataItem => Boolean(item)).flatMap((item, index) => {
    const key = typeof item.key === 'string'
      ? item.key
      : item.key === undefined ? `${namespace}index:${index}` : `${namespace}number:${item.key}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ ...item, key, originalKey: item.key, content: item.content ?? item.description }];
  });
}
export function stepsDataHasContent(value: StepsDataContent): boolean {
  return value !== undefined && value !== null;
}
export function stepsLayout(
  type: 'default' | 'dot' | 'inline' | 'navigation' | 'panel' | undefined,
  progressDot: boolean,
  orientation: 'horizontal' | 'vertical' | undefined,
  direction: 'horizontal' | 'vertical' | undefined,
  responsive: boolean,
  mobile: boolean,
  titlePlacement?: 'horizontal' | 'vertical',
  labelPlacement?: 'horizontal' | 'vertical'
) {
  const actualType = type && type !== 'default' ? type : progressDot ? 'dot' : type;
  const dot = actualType === 'dot' || actualType === 'inline';
  const vertical = actualType !== 'panel'
    && ((responsive
      && mobile)
      || (orientation
        || direction) === 'vertical');
  return {
    type: actualType,
    dot,
    vertical,
    titlePlacement: dot || vertical
      ? vertical ? 'horizontal' : 'vertical'
      : type === 'navigation' ? 'horizontal' : titlePlacement || labelPlacement || 'horizontal'
  };
}
