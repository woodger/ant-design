import type { Snippet } from 'svelte';

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSize = 'default' | 'large' | number | (string & {});

/** Модальная выдвижная панель с управлением open, фокусом и жизненным циклом children. */
export interface DrawerProps {
  /** Поддерживает bind:open. */
  open?: boolean;
  title?: string | Snippet;
  children?: Snippet;
  extra?: Snippet;
  footer?: Snippet;
  /** @defaultValue 'right' */
  placement?: DrawerPlacement;
  /** @defaultValue 'default' */
  size?: DrawerSize;
  /** @defaultValue true */
  closable?: boolean;
  /** @defaultValue true */
  keyboard?: boolean;
  mask?: { closable?: boolean; blur?: boolean; };
  /** @defaultValue false */
  forceRender?: boolean;
  /** @defaultValue false */
  destroyOnHidden?: boolean;
  onClose?: (event: Event) => void;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
