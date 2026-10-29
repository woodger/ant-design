import type { Snippet } from 'svelte';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus';

export interface TooltipProps {
  title?: string | number | null | Snippet;
  children: Snippet;
  open?: boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  class?: string;
  style?: string;
}

export interface SliderTooltipConfig {
  open?: boolean;
  placement?: TooltipPlacement;
  arrow?: boolean;
  formatter?: ((value: number) => string | null) | null;
}
