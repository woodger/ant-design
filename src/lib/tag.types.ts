import type { Snippet } from 'svelte';

export type TagPresetColor =
  'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold';
export type TagStatusColor = 'success' | 'processing' | 'error' | 'default' | 'warning';
export type TagColor = TagPresetColor | TagStatusColor;
export type TagVariant = 'filled' | 'outlined' | 'solid';

/** Метка с цветом, icon и отменяемым закрытием. */
export interface TagProps {
  children: Snippet;
  /** @defaultValue 'default' */
  color?: TagColor;
  /** @defaultValue 'filled' */
  variant?: TagVariant;
  icon?: Snippet;
  /** @defaultValue false */
  closeIcon?: boolean | Snippet;
  closeLabel?: string;
  disabled?: boolean;
  onClose?: (event: MouseEvent) => void;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}

/** Управляемая метка-фильтр: новое checked передаётся через onChange. */
export interface CheckableTagProps {
  children: Snippet;
  /** @defaultValue false */
  checked?: boolean;
  disabled?: boolean;
  icon?: Snippet;
  onChange?: (checked: boolean) => void;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
