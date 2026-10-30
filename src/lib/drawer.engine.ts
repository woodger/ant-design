import type { DrawerPlacement, DrawerSize } from './drawer.types';

export function getDrawerSize(size: DrawerSize = 'default'): string {
  if (size === 'default') return '378px';
  if (size === 'large') return '736px';
  if (typeof size === 'number') return Number.isFinite(size) && size > 0 ? `${size}px` : '378px';

  return size.trim() || '378px';
}

export function getDrawerTransform(placement: DrawerPlacement): string {
  return {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)'
  }[placement];
}

export function getDrawerMotionDuration(value: string): number {
  const match = value.trim().match(/^(\d*\.?\d+)(ms|s)$/);
  if (!match) return 300;

  const duration = Number(match[1]) * (match[2] === 's' ? 1000 : 1);
  return Number.isFinite(duration) ? duration : 300;
}
