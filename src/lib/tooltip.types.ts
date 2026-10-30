import type { Snippet } from 'svelte';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus';

/** Текстовая подсказка по hover/focus с bind:open и доступным описанием trigger. */
export interface TooltipProps {
  title?: string | number | null | Snippet;
  children: Snippet;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @defaultValue 'top' */
  placement?: TooltipPlacement;
  /** @defaultValue true */
  arrow?: boolean;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean;
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  /** Задержка открытия в секундах. */
  mouseEnterDelay?: number;
  /** Задержка закрытия в секундах. */
  mouseLeaveDelay?: number;
  class?: string;
  style?: string;
}

/** Параметры Tooltip ручки Slider; formatter=null отключает содержимое подсказки. */
export interface SliderTooltipConfig {
  open?: boolean;
  placement?: TooltipPlacement;
  arrow?: boolean;
  formatter?: ((value: number) => string | null) | null;
}
