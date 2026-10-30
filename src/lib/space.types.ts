import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type SpaceOrientation = 'horizontal' | 'vertical';
export type SpaceSize = ComponentSize | 'medium' | number;
export type SpaceContent = string | number | boolean | null | undefined | Snippet;
export interface SpaceItem { key: string | number; children?: SpaceContent; }
export type SpaceSlots = Partial<Record<'root' | 'item' | 'separator', string>>;
export interface SpaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  items?: readonly (SpaceContent | SpaceItem)[];
  children?: Snippet;
  size?: SpaceSize | readonly [SpaceSize, SpaceSize];
  orientation?: SpaceOrientation;
  vertical?: boolean;
  direction?: SpaceOrientation;
  align?: 'start' | 'end' | 'center' | 'baseline';
  separator?: SpaceContent;
  split?: SpaceContent;
  wrap?: boolean;
  classNames?: SpaceSlots | ((info: { props: SpaceProps }) => SpaceSlots);
  styles?: SpaceSlots | ((info: { props: SpaceProps }) => SpaceSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}
