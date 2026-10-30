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

export interface WatermarkConfig {
  class?: string;
  style?: string;
}

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
  inherit?: boolean;
  onRemove?: () => void;
  nativeElement?: HTMLDivElement;
}

export interface WatermarkContentLine {
  text: string;
  font: Required<WatermarkFont>;
}
