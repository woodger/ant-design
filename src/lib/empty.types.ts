import type { Snippet } from 'svelte';

export type EmptyImage = 'default' | 'simple' | Snippet | false;
export type EmptyDescription = string | Snippet | false;

export interface EmptyProps {
  image?: EmptyImage;
  description?: EmptyDescription;
  children?: Snippet;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
