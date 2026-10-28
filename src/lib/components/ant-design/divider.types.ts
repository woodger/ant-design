import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerTitlePlacement = 'start' | 'end' | 'center' | 'left' | 'right';
export type DividerSize = 'small' | 'medium' | 'middle' | 'large';
export type DividerSemanticSlots = Partial<Record<'root' | 'rail' | 'content', string>>;
export interface DividerSemanticInfo {
  props: DividerProps & { orientation: DividerOrientation; titlePlacement: 'start' | 'end' | 'center'; size: DividerSize };
}

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  children?: Snippet | string | number | null | false;
  orientation?: DividerOrientation | DividerTitlePlacement;
  vertical?: boolean;
  /** @deprecated Используйте orientation. */
  type?: DividerOrientation;
  titlePlacement?: DividerTitlePlacement;
  /** @deprecated Используйте styles.content. */
  orientationMargin?: string | number;
  dashed?: boolean;
  variant?: 'solid' | 'dashed' | 'dotted';
  size?: DividerSize;
  plain?: boolean;
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: DividerSemanticSlots | ((info: DividerSemanticInfo) => DividerSemanticSlots);
  styles?: DividerSemanticSlots | ((info: DividerSemanticInfo) => DividerSemanticSlots);
  nativeElement?: HTMLDivElement;
}
