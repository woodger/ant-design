import type { AvatarSize } from './avatar.types';
import type { ComponentSize } from './types';

export function resolveAvatarSize(size:
  AvatarSize
  | undefined, context: ComponentSize = 'middle'): AvatarSize {
  const inherited = context === 'middle' ? 'medium' : context;
  return typeof size === 'number'
    ? Number.isFinite(size) && size > 0 ? size : inherited
    : size ?? inherited;
}

export function normalizeAvatarGap(gap = 4): number {
  return Number.isFinite(gap) && gap >= 0 ? gap : 4;
}

export function getAvatarScale(textWidth: number, containerWidth: number, gap = 4): number {
  if (!Number.isFinite(textWidth)
    || !Number.isFinite(containerWidth)
    || textWidth <= 0
    || containerWidth <= 0) return 1;

  const available = containerWidth - normalizeAvatarGap(gap) * 2;
  return available > 0 ? Math.min(1, available / textWidth) : 1;
}
