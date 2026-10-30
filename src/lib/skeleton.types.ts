import type { Snippet } from 'svelte';

export type SkeletonWidth = number | string;
export type SkeletonAvatarSize = 'small' | 'medium' | 'large' | number;
/** Размер и форма placeholder аватара внутри Skeleton. */
export interface SkeletonAvatarProps {
  size?: SkeletonAvatarSize;
  shape?: 'circle' | 'square';
}
/** Геометрия строки title в Skeleton. */
export interface SkeletonTitleProps {
  width?: SkeletonWidth;
}
/** Число строк и ширины текстового placeholder Skeleton. */
export interface SkeletonParagraphProps {
  rows?: number;
  width?: SkeletonWidth | SkeletonWidth[];
}

/** Каркас загрузки, который заменяет children и сохраняет доступный статус. */
export interface SkeletonProps {
  /** @defaultValue true */
  loading?: boolean;
  /** @defaultValue false */
  active?: boolean;
  /** @defaultValue false */
  round?: boolean;
  /** @defaultValue false */
  avatar?: boolean | SkeletonAvatarProps;
  /** @defaultValue true */
  title?: boolean | SkeletonTitleProps;
  /** @defaultValue true */
  paragraph?: boolean | SkeletonParagraphProps;
  children?: Snippet;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  class?: string;
  style?: string;
}
