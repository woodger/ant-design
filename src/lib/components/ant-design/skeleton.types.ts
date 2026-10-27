import type { Snippet } from 'svelte';

export type SkeletonWidth = number | string;
export type SkeletonAvatarSize = 'small' | 'medium' | 'large' | number;
export interface SkeletonAvatarProps { size?: SkeletonAvatarSize; shape?: 'circle' | 'square'; }
export interface SkeletonTitleProps { width?: SkeletonWidth; }
export interface SkeletonParagraphProps { rows?: number; width?: SkeletonWidth | SkeletonWidth[]; }

export interface SkeletonProps {
  loading?: boolean;
  active?: boolean;
  round?: boolean;
  avatar?: boolean | SkeletonAvatarProps;
  title?: boolean | SkeletonTitleProps;
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
