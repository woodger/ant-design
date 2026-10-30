export function anchorTargetId(href: string | null | undefined): string | undefined {
  return /#([^\t\r\n\f\v]+)$/.exec(href?.toString() ?? '')?.[1];
}
export function anchorSection(
  sections: readonly { href: string; top: number; targetOffset?: number; }[],
  offset: number,
  bounds = 5
): string {
  let current: { href: string; top: number; } | undefined;
  for (const section of sections)
    if (section.top <= (section.targetOffset
      ?? offset) + bounds
      && (!current
        || section.top > current.top))
      current = section;
  return current?.href ?? '';
}
export { scrollFrame as anchorScrollFrame } from './scroll.engine';
