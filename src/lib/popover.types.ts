import type { Snippet } from 'svelte';
import type { TooltipPlacement } from './tooltip.types';

export type PopoverPlacement = TooltipPlacement;
export type PopoverTrigger = 'hover' | 'focus' | 'click';
export type PopoverContent = string | number | Snippet;

/** Интерактивная поверхность у trigger snippet с bind:open и управлением фокусом. */
export interface PopoverProps {
  children: Snippet;
  title?: PopoverContent | null;
  content?: PopoverContent | null;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  /** @defaultValue 'top' */
  placement?: PopoverPlacement;
  /** @defaultValue true */
  arrow?: boolean;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean;
  /** Задержка открытия в секундах. */
  mouseEnterDelay?: number;
  /** Задержка закрытия в секундах. */
  mouseLeaveDelay?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-busy'?: boolean;
  popupClass?: string;
  class?: string;
  style?: string;
}
