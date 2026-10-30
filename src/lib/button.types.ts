import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes, HTMLAnchorAttributes, MouseEventHandler } from 'svelte/elements';
import type { ComponentSize } from './types';
export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type ButtonColor = 'default' | 'primary' | 'danger' | 'blue' | 'purple' | 'cyan' | 'green' | 'magenta' | 'pink' | 'red' | 'orange' | 'yellow' | 'volcano' | 'geekblue' | 'lime' | 'gold';
export type ButtonShape = 'default' | 'circle' | 'round' | 'square';
export type ButtonContent = string | number | boolean | null | undefined | Snippet;
export type ButtonSlots = Partial<Record<'root' | 'icon' | 'content', string>>;
export type ButtonLoading = boolean | { delay?: number; icon?: ButtonContent };
export interface ButtonProps extends Omit<HTMLButtonAttributes, 'type' | 'children' | 'class' | 'color' | 'style' | 'onclick'> {
  children?: ButtonContent;
  icon?: ButtonContent;
  type?: ButtonType;
  htmlType?: 'button' | 'submit' | 'reset';
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ComponentSize | 'medium';
  loading?: ButtonLoading;
  danger?: boolean;
  block?: boolean;
  ghost?: boolean;
  shape?: ButtonShape;
  iconPlacement?: 'start' | 'end';
  iconPosition?: 'start' | 'end';
  target?: HTMLAnchorAttributes['target'];
  rel?: HTMLAnchorAttributes['rel'];
  download?: HTMLAnchorAttributes['download'];
  hreflang?: string;
  referrerpolicy?: HTMLAnchorAttributes['referrerpolicy'];
  onclick?: MouseEventHandler<HTMLButtonElement> | null;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  autoFocus?: boolean;
  autoInsertSpace?: boolean;
  classNames?: ButtonSlots | ((info: { props: ButtonSemanticProps }) => ButtonSlots | undefined);
  styles?: ButtonSlots | ((info: { props: ButtonSemanticProps }) => ButtonSlots | undefined);
  class?: string;
  rootClassName?: string;
  style?: HTMLButtonAttributes['style'];
  nativeElement?: HTMLButtonElement | HTMLAnchorElement;
  /** Internal FloatButton composition only. */
  _skipSemantic?: boolean;
  /** Internal FloatButton renders its already styled content and Badge without an extra span. */
  _skipContentWrapper?: boolean;
}
export type ButtonSemanticProps = Omit<ButtonProps, 'onclick' | 'onClick'>;
export type ButtonElementProps<Href extends string | undefined = undefined> = Omit<ButtonProps, 'onclick' | 'onClick'> & {
  href?: Href;
  onclick?: MouseEventHandler<Href extends string ? HTMLAnchorElement : HTMLButtonElement> | null;
  onClick?: MouseEventHandler<Href extends string ? HTMLAnchorElement : HTMLButtonElement>;
};
export interface ButtonLinkProps extends Omit<ButtonProps, 'onclick' | 'onClick'> {
  href: string;
  onclick?: MouseEventHandler<HTMLAnchorElement> | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface ButtonConfig {
  autoInsertSpace?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  loadingIcon?: ButtonContent;
  class?: string;
  style?: string;
  classNames?: ButtonProps['classNames'];
  styles?: ButtonProps['styles'];
}
export interface ButtonGroupProps {
  children?: Snippet;
  size?: ComponentSize | 'medium';
  class?: string;
  style?: string;
  id?: string;
  'aria-label'?: string;
  nativeElement?: HTMLDivElement;
}
