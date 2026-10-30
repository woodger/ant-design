import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AffixTarget = Window | HTMLElement;
export type AffixUpdatePosition = (() => void) & { cancel: () => void; };
/** Закрепляет содержимое у края выбранного окна или прокручиваемого контейнера. */
export interface AffixProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  children?: Snippet;
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => AffixTarget | null;
  onChange?: (affixed?: boolean) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
export interface AffixPosition {
  edge: 'top' | 'bottom';
  offset: number;
  width: number;
  height: number;
}
