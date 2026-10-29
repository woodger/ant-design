import type { Snippet } from 'svelte';
import type { AriaAttributes, HTMLAttributes } from 'svelte/elements';
import type { DropdownClickInfo, DropdownProps } from './dropdown.types';

export type BreadcrumbContent = string | number | boolean | null | Snippet;
export type BreadcrumbSlots = Partial<Record<'root' | 'item' | 'separator', string>>;
export interface BreadcrumbMenuItem {
  key?: string | number;
  title?: BreadcrumbContent;
  breadcrumbName?: string;
  label?: BreadcrumbContent;
  path?: string;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: (info: DropdownClickInfo) => void;
}
export interface BreadcrumbItem extends AriaAttributes {
  key?: string | number;
  href?: string;
  path?: string;
  title?: BreadcrumbContent;
  breadcrumbName?: string;
  menu?: { items?: readonly BreadcrumbMenuItem[]; onClick?: (info: DropdownClickInfo) => void };
  dropdownProps?: Partial<Omit<DropdownProps, 'children' | 'menu'>>;
  children?: readonly BreadcrumbMenuItem[];
  class?: string;
  style?: string;
  onClick?: (event: MouseEvent) => void;
  type?: 'separator';
  separator?: BreadcrumbContent;
  [key: `data-${string}`]: string | undefined;
}
export interface BreadcrumbProps<Params extends Record<string, unknown> = Record<string, unknown>> extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'style'> {
  items?: readonly BreadcrumbItem[];
  routes?: readonly BreadcrumbItem[];
  params?: Params;
  separator?: BreadcrumbContent;
  dropdownIcon?: BreadcrumbContent;
  itemRender?: Snippet<[BreadcrumbItem, Params, readonly BreadcrumbItem[], readonly string[]]>;
  classNames?: BreadcrumbSlots | ((info: { props: BreadcrumbProps<Params> }) => BreadcrumbSlots);
  styles?: BreadcrumbSlots | ((info: { props: BreadcrumbProps<Params> }) => BreadcrumbSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLElement;
}
