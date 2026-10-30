import type { ProgressCircleSize, ProgressLineSize, ProgressStatus } from './progress.types';

export function normalizeProgressPercent(percent: number | undefined): number {
  return typeof percent === 'number' && Number.isFinite(percent)
    ? Math.max(0, Math.min(100, percent))
    : 0;
}

export function resolveProgressStatus(percent: number, status?: ProgressStatus): ProgressStatus {
  return status && ['normal', 'active', 'exception', 'success'].includes(status)
    ? status
    : normalizeProgressPercent(percent) === 100 ? 'success' : 'normal';
}

function positive(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

export function resolveProgressLineSize(size?: ProgressLineSize) {
  const fallback = size === 'small' ? 6 : 8;
  const width = typeof size === 'number'
    ? size
    : Array.isArray(size) ? size[0] : typeof size === 'object' ? size.width : undefined;
  const height = typeof size === 'number'
    ? size
    : Array.isArray(size) ? size[1] : typeof size === 'object' ? size.height : undefined;
  return {
    width: typeof width === 'string'
      ? width.trim() || '100%'
      : width !== undefined && Number.isFinite(width) && width > 0 ? `${width}px` : '100%',
    height: positive(height, fallback)
  };
}

export function resolveProgressCircleSize(size?: ProgressCircleSize): number {
  return typeof size === 'number' ? positive(size, 120) : size === 'small' ? 60 : 120;
}

export function getProgressCircleGeometry(
  percent: number,
  diameter: number,
  strokeWidth?: number
) {
  const width = Math.min(99.9, positive(strokeWidth, Math.max(6, 300 / positive(diameter, 120))));
  const radius = (100 - width) / 2;
  const circumference = 2 * Math.PI * radius;
  return {
    strokeWidth: width,
    radius,
    circumference,
    offset: circumference * (1 - normalizeProgressPercent(percent) / 100)
  };
}
