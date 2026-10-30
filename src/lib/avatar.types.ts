import type { Snippet } from 'svelte';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'small' | 'medium' | 'large' | number;

/** Аватар с приоритетом изображения, icon и текста и fallback при ошибке загрузки. */
export interface AvatarProps {
  src?: string;
  srcSet?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  draggable?: boolean | 'true' | 'false';
  /** @defaultValue 'circle' */
  shape?: AvatarShape;
  size?: AvatarSize;
  /** @defaultValue 4 */
  gap?: number;
  icon?: Snippet;
  children?: Snippet;
  onError?: () => boolean | void;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** @defaultValue false */
  'aria-hidden'?: boolean;
  class?: string;
  style?: string;
}
