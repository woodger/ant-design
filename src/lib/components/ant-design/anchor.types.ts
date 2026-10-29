import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { AffixProps } from './affix.types';
export type AnchorContainer = HTMLElement | Window;
export type AnchorContent = string | number | boolean | null | undefined | Snippet;
export type AnchorDirection = 'vertical' | 'horizontal';
export type AnchorSlots = Partial<Record<'root' | 'item' | 'itemTitle' | 'indicator', string>>;
export interface AnchorItem {
  key: string | number;
  href: string;
  title?: AnchorContent;
  target?: string;
  class?: string;
  replace?: boolean;
  targetOffset?: number;
  children?: readonly AnchorItem[];
}
export interface AnchorLinkProps extends Omit<AnchorItem, 'key' | 'children'> { children?: Snippet; }
export interface AnchorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style' | 'onchange' | 'onclick'> {
  items?: readonly AnchorItem[];
  children?: Snippet;
  offsetTop?: number;
  bounds?: number;
  affix?: boolean | Omit<AffixProps, 'offsetTop' | 'target' | 'children'>;
  showInkInFixed?: boolean;
  getContainer?: () => AnchorContainer;
  getCurrentAnchor?: (activeLink: string) => string;
  onClick?: (event: MouseEvent, link: { title?: AnchorContent; href: string }) => void;
  onChange?: (activeLink: string) => void;
  targetOffset?: number;
  direction?: AnchorDirection;
  replace?: boolean;
  classNames?: AnchorSlots | ((info: { props: AnchorProps }) => AnchorSlots);
  styles?: AnchorSlots | ((info: { props: AnchorProps }) => AnchorSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}
