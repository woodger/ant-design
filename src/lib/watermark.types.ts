import type { Snippet } from 'svelte';

export interface WatermarkFont {
  color?: CanvasFillStrokeStyles['fillStyle'];
  fontSize?: number | string;
  fontWeight?: 'normal' | 'lighter' | 'bold' | 'bolder' | number;
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
}

export interface WatermarkText {
  text: string;
  font?: WatermarkFont;
}

export type WatermarkContent = string | WatermarkText;

/** Стили ConfigProvider.watermark; локальный class/style добавляется после настроек провайдера. */
export interface WatermarkConfig {
  class?: string;
  style?: string;
}

/** Повторяемая Canvas-подложка текста или изображения с наследованием в Modal/Drawer. */
export interface WatermarkProps {
  zIndex?: number;
  rotate?: number;
  width?: number;
  height?: number;
  image?: string;
  content?: WatermarkContent | readonly WatermarkContent[];
  font?: WatermarkFont;
  class?: string;
  rootClassName?: string;
  style?: string;
  gap?: readonly [number, number];
  offset?: readonly [number, number];
  children?: Snippet;
  /** Передаёт подложку в дочерние Modal/Drawer. */
  inherit?: boolean;
  /** Удаление watermark DOM извне; штатный unmount callback не вызывает. */
  onRemove?: () => void;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}

export interface WatermarkContentLine {
  text: string;
  font: Required<WatermarkFont>;
}
