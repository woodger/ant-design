import type { Snippet } from 'svelte';
import type { HTMLImgAttributes } from 'svelte/elements';

export interface ImageTransform { x: number; y: number; rotate: number; scale: number; flipX: boolean; flipY: boolean; }
export type ImageTransformAction = 'flipY' | 'flipX' | 'rotateLeft' | 'rotateRight' | 'zoomIn' | 'zoomOut' | 'close' | 'prev' | 'next' | 'wheel' | 'doubleClick' | 'move' | 'dragRebound' | 'reset' | 'touchZoom';
export interface ImageInfo { url?: string; alt?: string; width?: string | number; height?: string | number; }
export interface ImagePreviewActions {
  onActive: (offset: number) => void;
  onFlipY: () => void;
  onFlipX: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onClose: () => void;
  onReset: () => void;
}
export interface ImagePreviewRenderInfo {
  transform: ImageTransform;
  current: number;
  total: number;
  image: ImageInfo;
  actions: ImagePreviewActions;
}
export interface ImagePreviewConfig {
  src?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  onTransform?: (info: { transform: ImageTransform; action: ImageTransformAction }) => void;
  scaleStep?: number;
  minScale?: number;
  maxScale?: number;
  wheel?: boolean;
  movable?: boolean;
  focusTrap?: boolean;
  mask?: boolean | { enabled?: boolean; blur?: boolean; closable?: boolean };
  closeIcon?: Snippet | boolean | null;
  cover?: boolean | Snippet | { coverNode?: Snippet; placement?: 'top' | 'bottom' | 'center' };
  rootClassName?: string;
  zIndex?: number;
  actionsRender?: Snippet<[Snippet, ImagePreviewRenderInfo]>;
  imageRender?: Snippet<[Snippet, { transform: ImageTransform; image: ImageInfo; current?: number }]>;
}
export interface ImageProps extends Omit<HTMLImgAttributes, 'width' | 'height' | 'class' | 'style' | 'onerror' | 'onload' | 'onclick' | 'onkeydown' | 'placeholder' | 'children'> {
  width?: number | string;
  height?: number | string;
  preview?: boolean | ImagePreviewConfig;
  fallback?: string;
  placeholder?: boolean | Snippet;
  rootClassName?: string;
  wrapperStyle?: string;
  class?: string;
  style?: string;
  onError?: (event: Event) => void;
  onLoad?: (event: Event) => void;
  onClick?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  nativeElement?: HTMLElement;
  imageElement?: HTMLImageElement;
}
export type ImageElementData = Pick<HTMLImgAttributes, 'src' | 'alt' | 'crossorigin' | 'decoding' | 'draggable' | 'loading' | 'referrerpolicy' | 'sizes' | 'srcset' | 'usemap' | 'fetchpriority'>;
