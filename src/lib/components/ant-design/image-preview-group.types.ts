import type { Snippet } from 'svelte';
import type { ImageElementData, ImagePreviewConfig } from './image.types';
export type ImagePreviewGroupItem = string | ImageElementData;
export interface ImagePreviewGroupConfig extends Omit<ImagePreviewConfig, 'onOpenChange' | 'src' | 'cover'> {
  current?: number;
  onChange?: (current: number, previous: number) => void;
  onOpenChange?: (open: boolean, info: { current: number }) => void;
  countRender?: Snippet<[number, number]>;
}
export interface ImagePreviewGroupProps {
  items?: readonly ImagePreviewGroupItem[];
  preview?: boolean | ImagePreviewGroupConfig;
  fallback?: string;
  children?: Snippet;
}
