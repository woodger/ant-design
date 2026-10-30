import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { SpaceOrientation, SpaceProps } from './space.types';

export type SpaceCompactSize = ComponentSize | 'medium';
/** Стыкует границы controls и передаёт им общий размер через контекст Compact. */
export interface SpaceCompactProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  items?: SpaceProps['items'];
  children?: Snippet;
  size?: SpaceCompactSize;
  orientation?: SpaceOrientation;
  vertical?: boolean;
  direction?: SpaceOrientation;
  /** @defaultValue false */
  block?: boolean;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
/** Нативный addon для композиции controls в SpaceCompact. */
export interface SpaceAddonProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  children?: Snippet;
  /** @defaultValue 'outlined' */
  variant?: 'outlined' | 'filled' | 'borderless' | 'underlined';
  disabled?: boolean;
  status?: 'error' | 'warning';
  class?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
