// Ant Design 6.6.8 _util/easings: shared by Anchor and FloatButton.BackTop.
export function scrollFrame(elapsed: number, from: number, to: number, duration = 450): number {
  let t = Math.min(elapsed, duration) / (duration / 2);
  const delta = to - from;
  if (t < 1) return delta / 2 * t * t * t + from;
  t -= 2;
  return delta / 2 * (t * t * t + 2) + from;
}
