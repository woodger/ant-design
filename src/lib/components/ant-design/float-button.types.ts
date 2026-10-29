import type { Snippet } from 'svelte';
import type { MouseEventHandler } from 'svelte/elements';
import type { ButtonProps, ButtonSlots, ButtonContent } from './button.types';
import type { BadgeProps } from './badge.types';
import type { TooltipProps } from './tooltip.types';
export type FloatButtonContent = ButtonContent;
export type FloatButtonShape = 'circle' | 'square';
export type FloatButtonType = 'default' | 'primary';
export type FloatButtonPlacement = 'top' | 'left' | 'right' | 'bottom';
export type FloatButtonBadge = Omit<BadgeProps, 'status' | 'text' | 'title' | 'children'>;
export interface FloatButtonProps extends Omit<ButtonProps, 'children' | 'type' | 'shape' | 'size' | 'loading' | 'color' | 'variant' | 'danger' | 'ghost' | 'block' | 'classNames' | 'styles' | 'onclick' | 'onClick' | 'autoInsertSpace' | '_skipSemantic' | '_skipContentWrapper'> {
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  content?: FloatButtonContent;
  description?: FloatButtonContent;
  tooltip?: FloatButtonContent | Omit<TooltipProps, 'children'>;
  href?: string;
  badge?: FloatButtonBadge;
  onclick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | null;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  classNames?: ButtonSlots | ((info: { props: FloatButtonProps }) => ButtonSlots | undefined);
  styles?: ButtonSlots | ((info: { props: FloatButtonProps }) => ButtonSlots | undefined);
}
export type FloatButtonGroupSlots = Partial<Record<'root' | 'list' | 'item' | 'itemIcon' | 'itemContent' | 'trigger' | 'triggerIcon' | 'triggerContent', string>>;
export interface FloatButtonGroupProps extends Omit<FloatButtonProps, 'classNames' | 'styles' | 'nativeElement'> {
  children?: Snippet;
  items?: readonly { key: string | number; children: Snippet }[];
  trigger?: 'click' | 'hover';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeIcon?: FloatButtonContent;
  placement?: FloatButtonPlacement;
  classNames?: FloatButtonGroupSlots | ((info: { props: FloatButtonGroupProps }) => FloatButtonGroupSlots | undefined);
  styles?: FloatButtonGroupSlots | ((info: { props: FloatButtonGroupProps }) => FloatButtonGroupSlots | undefined);
  nativeElement?: HTMLDivElement;
}
export type BackTopTarget = Window | Document | HTMLElement;
export interface FloatButtonBackTopProps extends Omit<FloatButtonProps, 'target'> {
  target?: () => BackTopTarget | null;
  visibilityHeight?: number;
  duration?: number;
  showProgress?: boolean;
}
export interface FloatButtonConfig { backTopIcon?: FloatButtonContent; class?: string; style?: string; classNames?: FloatButtonProps['classNames']; styles?: FloatButtonProps['styles']; }
export interface FloatButtonGroupConfig { closeIcon?: FloatButtonContent; class?: string; style?: string; classNames?: FloatButtonGroupProps['classNames']; styles?: FloatButtonGroupProps['styles']; }
