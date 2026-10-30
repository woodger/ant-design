import type { SpaceCompactContext } from './space-compact-context';
import type { SpaceCompactProps } from './space-compact.types';
import { spaceEntries } from './space.engine';

export function compactClasses(
  prefix: string,
  direction: 'ltr' | 'rtl',
  context: SpaceCompactContext | null
): string {
  if (!context) return '';

  const middle = context.orientation === 'vertical' ? '-vertical-' : '-';
  return [
    `${prefix}-compact${middle}item`,
    context.first && `${prefix}-compact${middle}first-item`,
    context.last && `${prefix}-compact${middle}last-item`,
    direction === 'rtl' && `${prefix}-compact${middle}item-rtl`
  ].filter(
    Boolean
  ).join(
    ' '
  );
}
export function compactEntries(
  items: SpaceCompactProps['items'],
  children?: SpaceCompactProps['children']
) {
  return spaceEntries(items, children).filter(
    item => item.children !== undefined
      && item.children !== null
      && typeof item.children !== 'boolean'
  );
}
