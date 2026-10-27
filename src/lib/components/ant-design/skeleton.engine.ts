import type { SkeletonProps, SkeletonWidth } from './skeleton.types';

export function normalizeSkeletonWidth(value: SkeletonWidth | undefined, fallback?: string): string | undefined {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? `${value}px` : fallback;

  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function normalizeSkeletonRows(rows: number | undefined, fallback: number): number {
  return typeof rows === 'number' && Number.isFinite(rows) && rows >= 0 ? Math.min(1000, Math.floor(rows)) : fallback;
}

export function resolveSkeletonLayout({ avatar = false, title = true, paragraph = true }: Pick<SkeletonProps, 'avatar' | 'title' | 'paragraph'> = {}) {
  const avatarProps = typeof avatar === 'object' && avatar ? avatar : {};
  const titleProps = typeof title === 'object' && title ? title : {};
  const paragraphProps = typeof paragraph === 'object' && paragraph ? paragraph : {};
  const defaultWidth = !avatar || !title ? '61%' : undefined;
  const rows = normalizeSkeletonRows(paragraphProps.rows, !avatar && title ? 3 : 2);
  const size = avatarProps.size;
  const avatarWidth = typeof size === 'number' ? normalizeSkeletonWidth(size) : undefined;

  return {
    avatar: avatar ? { size: typeof size === 'string' && ['small', 'medium', 'large'].includes(size) ? size : 'large', width: avatarWidth, shape: avatarProps.shape ?? (title && !paragraph ? 'square' : 'circle') } : undefined,
    title: title ? { width: normalizeSkeletonWidth(titleProps.width, paragraph ? avatar ? '50%' : '38%' : undefined) } : undefined,
    paragraph: paragraph ? { widths: Array.from({ length: rows }, (_, index) => Array.isArray(paragraphProps.width) ? normalizeSkeletonWidth(paragraphProps.width[index]) : index === rows - 1 ? normalizeSkeletonWidth(paragraphProps.width, defaultWidth) : undefined) } : undefined
  };
}
