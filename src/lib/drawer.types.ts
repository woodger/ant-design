import type { Snippet } from 'svelte';

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSize = 'default' | 'large' | number | (string & {});

export interface DrawerProps {
  open?: boolean;
  title?: string | Snippet;
  children?: Snippet;
  extra?: Snippet;
  footer?: Snippet;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closable?: boolean;
  keyboard?: boolean;
  mask?: { closable?: boolean; blur?: boolean };
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  onClose?: (event: Event) => void;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
