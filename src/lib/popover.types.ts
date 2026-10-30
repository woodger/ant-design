import type { Snippet } from 'svelte';
import type { TooltipPlacement } from './tooltip.types';

export type PopoverPlacement = TooltipPlacement;
export type PopoverTrigger = 'hover' | 'focus' | 'click';
export type PopoverContent = string | number | Snippet;

export interface PopoverProps {
  children: Snippet;
  title?: PopoverContent | null;
  content?: PopoverContent | null;
  open?: boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  placement?: PopoverPlacement;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-busy'?: boolean;
  popupClass?: string;
  class?: string;
  style?: string;
}
