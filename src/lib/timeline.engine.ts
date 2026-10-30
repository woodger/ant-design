import type { StepsDataItem } from './steps-data.engine';
import type { TimelineContent, TimelineItem, TimelineMode } from './timeline.types';
export function timelineMode(mode?: TimelineMode): 'start' | 'end' | 'alternate' {
  return mode === 'left'
    ? 'start'
    : mode === 'right' ? 'end' : mode === 'alternate' || mode === 'end' ? mode : 'start';
}
export function timelineItems(
  items: readonly TimelineItem[],
  mode: 'start' | 'end' | 'alternate',
  loadingIcon: TimelineContent,
  pending?: TimelineContent,
  pendingDot?: TimelineContent,
  reverse?: boolean
): StepsDataItem[] {
  const result: StepsDataItem[] = items.map((item, index) => {
    const {
      color,
      placement,
      position,
      loading,
      icon,
      dot,
      label,
      children,
      title,
      content,
      class: className,
      style,
      ...rest
    } = item;
    const actualPlacement = placement
      ?? position
      ?? (mode === 'alternate'
        ? index % 2 === 0 ? 'start' : 'end'
        : mode);
    const preset = color && ['blue', 'red', 'green', 'gray'].includes(color);
    const actualIcon = icon ?? dot;
    return {
      ...rest,
      title: title ?? label,
      content: content ?? children,
      icon: !actualIcon && loading ? loadingIcon : actualIcon,
      status: loading ? 'process' : 'finish',
      class: [
        className,
        preset && `ant-timeline-item-color-${color}`,
        `ant-timeline-item-placement-${actualPlacement}`
      ].filter(
        Boolean
      ).join(
        ' '
      ),
      style: [color && !preset && `--ant-cmp-steps-item-icon-dot-color:${color}`, style].filter(
        Boolean
      ).join(
        ';'
      )
    };
  });
  if (pending)
    result.push({ icon: pendingDot ?? loadingIcon, content: pending, status: 'process' });
  return reverse ? result.reverse() : result;
}
export function timelineLayoutAlternate(
  mode: 'start' | 'end' | 'alternate',
  orientation: 'horizontal' | 'vertical',
  items: readonly StepsDataItem[]
) {
  return mode === 'alternate'
    || orientation === 'vertical'
    && items.some(
      item => Boolean(item.title)
    );
}
