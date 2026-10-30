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
/** Ссылка навигации Anchor; нативные href/target сохраняют браузерную семантику. */
export interface AnchorLinkProps extends Omit<AnchorItem, 'key' | 'children'> {
  children?: Snippet;
}
/** Навигация по разделам с отслеживанием прокрутки, вложенными items и Affix. */
export interface AnchorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style' | 'onchange' | 'onclick'
> {
  items?: readonly AnchorItem[];
  children?: Snippet;
  offsetTop?: number;
  bounds?: number;
  /** @defaultValue true */
  affix?: boolean | Omit<AffixProps, 'offsetTop' | 'target' | 'children'>;
  /** @defaultValue false */
  showInkInFixed?: boolean;
  getContainer?: () => AnchorContainer;
  getCurrentAnchor?: (activeLink: string) => string;
  onClick?: (event: MouseEvent, link: { title?: AnchorContent; href: string; }) => void;
  onChange?: (activeLink: string) => void;
  targetOffset?: number;
  /** @defaultValue 'vertical' */
  direction?: AnchorDirection;
  replace?: boolean;
  classNames?: AnchorSlots | ((info: { props: AnchorProps; }) => AnchorSlots);
  styles?: AnchorSlots | ((info: { props: AnchorProps; }) => AnchorSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
