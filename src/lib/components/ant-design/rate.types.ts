import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TooltipProps } from './tooltip.types';

export interface RateCharacterInfo {
  index: number;
  count: number;
  value?: number;
  allowHalf: boolean;
  disabled: boolean;
  focused: boolean;
  prefixCls: string;
  onHover: (event: MouseEvent, index: number) => void;
  onClick: (event: MouseEvent | KeyboardEvent, index: number) => void;
}

export interface RateConfig {
  class?: string;
  style?: string;
}

export interface RateProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children' | 'class' | 'style' | 'onchange'> {
  value?: number;
  defaultValue?: number;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  keyboard?: boolean;
  disabled?: boolean;
  size?: ComponentSize | 'medium';
  character?: string | number | Snippet<[RateCharacterInfo]>;
  characterRender?: Snippet<[Snippet, RateCharacterInfo]>;
  tooltips?: readonly (string | Omit<TooltipProps, 'children'>)[];
  autoFocus?: boolean;
  tabIndex?: number;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLUListElement;
}
