export function anchorTargetId(href: string | null | undefined): string | undefined {
  return /#([^\t\r\n\f\v]+)$/.exec(href?.toString() ?? '')?.[1];
}
export function anchorSection(sections: readonly { href: string; top: number; targetOffset?: number }[], offset: number, bounds = 5): string {
  let current: { href: string; top: number } | undefined;
  for (const section of sections) if (section.top <= (section.targetOffset ?? offset) + bounds && (!current || section.top > current.top)) current = section;
  return current?.href ?? '';
}
export function anchorScrollFrame(elapsed: number, from: number, to: number, duration = 450): number {
  let t = Math.min(elapsed, duration) / (duration / 2);
  const delta = to - from;
  if (t < 1) return delta / 2 * t * t * t + from;
  t -= 2;
  return delta / 2 * (t * t * t + 2) + from;
}
