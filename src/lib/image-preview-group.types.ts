import type { Snippet } from 'svelte';
import type { ImageElementData, ImagePreviewConfig } from './image.types';
export type ImagePreviewGroupItem = string | ImageElementData;
/** Настройки общего viewer ImagePreviewGroup и управляемого индекса изображения. */
export interface ImagePreviewGroupConfig extends Omit<
  ImagePreviewConfig,
  'onOpenChange' | 'src' | 'cover'
> {
  /** Управляемый zero-based индекс; default для локального состояния — 0. */
  current?: number;
  onChange?: (current: number, previous: number) => void;
  onOpenChange?: (open: boolean, info: { current: number; }) => void;
  /** Snippet получает one-based номер и полное число изображений. */
  countRender?: Snippet<[number, number]>;
}
/** Общий preview для явных items либо зарегистрированных дочерних Image. */
export interface ImagePreviewGroupProps {
  /** Явный список, включая пустой, имеет приоритет над регистрацией дочерних Image. */
  items?: readonly ImagePreviewGroupItem[];
  /** @defaultValue true */
  preview?: boolean | ImagePreviewGroupConfig;
  fallback?: string;
  children?: Snippet;
}
