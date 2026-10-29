import type { SpaceContent, SpaceItem, SpaceOrientation, SpaceProps, SpaceSize } from './space.types';

export function spaceOrientation(orientation?: SpaceOrientation, vertical?: boolean, direction?: SpaceOrientation): SpaceOrientation {
  if (orientation === 'horizontal' || orientation === 'vertical') return orientation;
  if (typeof vertical === 'boolean') return vertical ? 'vertical' : 'horizontal';
  return direction === 'vertical' ? 'vertical' : 'horizontal';
}
export function spaceHasContent(content: SpaceContent): boolean {
  // React.Children нормализует оба boolean в null до проверки isReactRenderable.
  return content !== undefined && content !== null && typeof content !== 'boolean' && content !== '';
}
export function spaceEntries(items: SpaceProps['items'], children?: SpaceProps['children']): SpaceItem[] {
  return (items ?? (children ? [children] : [])).map((item, index) => typeof item === 'object' && item !== null
    ? { key: item.key === '' ? `index:${index}` : `key:${item.key}`, children: item.children }
    : { key: `index:${index}`, children: item });
}
export function spaceGap(size: SpaceProps['size'] = 'small'): { classes: string[]; style: string } {
  const [horizontal, vertical] = Array.isArray(size) ? size : [size, size];
  const classes: string[] = [];
  const styles: string[] = [];
  function axis(value: SpaceSize, direction: 'row' | 'col') {
    if (['small', 'medium', 'middle', 'large'].includes(String(value))) classes.push(`ant-space-gap-${direction}-${value}`);
    else if (typeof value === 'number' && value && !Number.isNaN(value)) styles.push(`${direction === 'col' ? 'column' : 'row'}-gap:${value}px`);
  }
  axis(horizontal, 'col'); axis(vertical, 'row');
  return { classes, style: styles.join(';') };
}
