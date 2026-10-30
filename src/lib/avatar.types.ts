import type { Snippet } from 'svelte';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'small' | 'medium' | 'large' | number;

export interface AvatarProps {
  src?: string;
  srcSet?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  draggable?: boolean | 'true' | 'false';
  shape?: AvatarShape;
  size?: AvatarSize;
  gap?: number;
  icon?: Snippet;
  children?: Snippet;
  onError?: () => boolean | void;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  class?: string;
  style?: string;
}
