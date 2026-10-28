import type { Snippet } from 'svelte';

export type TagPresetColor = 'blue' | 'purple' | 'cyan' | 'green' | 'magenta' | 'pink' | 'red' | 'orange' | 'yellow' | 'volcano' | 'geekblue' | 'lime' | 'gold';
export type TagStatusColor = 'success' | 'processing' | 'error' | 'default' | 'warning';
export type TagColor = TagPresetColor | TagStatusColor;
export type TagVariant = 'filled' | 'outlined' | 'solid';

export interface TagProps {
  children: Snippet;
  color?: TagColor;
  variant?: TagVariant;
  icon?: Snippet;
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

export interface CheckableTagProps {
  children: Snippet;
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
