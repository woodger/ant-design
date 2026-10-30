import type { Snippet } from 'svelte';
import type { HTMLImgAttributes } from 'svelte/elements';

export interface ImageTransform {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
}
export type ImageTransformAction =
  'flipY'
  | 'flipX'
  | 'rotateLeft'
  | 'rotateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'close'
  | 'prev'
  | 'next'
  | 'wheel'
  | 'doubleClick'
  | 'move'
  | 'dragRebound'
  | 'reset'
  | 'touchZoom';
export interface ImageInfo {
  url?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}
/** Действия viewer; onActive принимает относительное смещение индекса в группе. */
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
/** Настройки viewer: видимость, преобразования, focus trap и render snippets. */
export interface ImagePreviewConfig {
  src?: string;
  /** Управляемая видимость; onOpenChange запрашивает её изменение у владельца. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  /** Сообщает transform и действие через очередь requestAnimationFrame. */
  onTransform?: (info: { transform: ImageTransform; action: ImageTransformAction; }) => void;
  scaleStep?: number;
  minScale?: number;
  maxScale?: number;
  wheel?: boolean;
  movable?: boolean;
  focusTrap?: boolean;
  mask?: boolean | { enabled?: boolean; blur?: boolean; closable?: boolean; };
  closeIcon?: Snippet | boolean | null;
  cover?: boolean | Snippet | { coverNode?: Snippet; placement?: 'top' | 'bottom' | 'center'; };
  rootClassName?: string;
  zIndex?: number;
  /** Snippet получает исходную панель действий и контекст viewer. */
  actionsRender?: Snippet<[Snippet, ImagePreviewRenderInfo]>;
  /** Snippet получает исходное изображение и текущий transform. */
  imageRender?: Snippet<
    [Snippet, { transform: ImageTransform; image: ImageInfo; current?: number; }]
  >;
}
/** Нативное изображение с fallback/placeholder и интерактивным preview. */
export interface ImageProps extends Omit<
  HTMLImgAttributes,
  'width'
  | 'height'
  | 'class'
  | 'style'
  | 'onerror'
  | 'onload'
  | 'onclick'
  | 'onkeydown'
  | 'placeholder'
  | 'children'
> {
  width?: number | string;
  height?: number | string;
  /** @defaultValue true */
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
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLElement;
  /** Нативный ref доступен после mount и очищается при unmount. */
  imageElement?: HTMLImageElement;
}
export type ImageElementData = Pick<
  HTMLImgAttributes,
  'src'
  | 'alt'
  | 'crossorigin'
  | 'decoding'
  | 'draggable'
  | 'loading'
  | 'referrerpolicy'
  | 'sizes'
  | 'srcset'
  | 'usemap'
  | 'fetchpriority'
>;
