import type { Snippet } from 'svelte';
import type { TagPresetColor } from './tag.types';

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';
export type BadgeColor = TagPresetColor;
export type BadgeSize = 'medium' | 'small';
export type BadgeText = string | Snippet;
export interface BadgeContext {
  count: number | undefined;
  descriptionId: string | undefined;
}

/** Счётчик или статус у дочернего содержимого; число и отображаемый текст различаются. */
export interface BadgeProps {
  count?: number;
  /** @defaultValue 99 */
  overflowCount?: number;
  /** @defaultValue false */
  showZero?: boolean;
  /** @defaultValue false */
  dot?: boolean;
  status?: BadgeStatus;
  color?: BadgeColor;
  text?: BadgeText;
  /** @defaultValue 'medium' */
  size?: BadgeSize;
  offset?: readonly [number, number];
  title?: string | false | null;
  children?: Snippet<[BadgeContext]>;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
