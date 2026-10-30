import type { Snippet } from 'svelte';

export interface InputCountInfo { value: string; count: number; maxLength?: number; }
export type InputCountContent = string | number | boolean | null | undefined | Snippet<[InputCountInfo]>;
export type InputCountFormatter = (info: InputCountInfo) => InputCountContent;
export interface InputCountConfig {
  max?: number;
  strategy?: (value: string) => number;
  show?: boolean | InputCountFormatter;
  exceedFormatter?: (value: string, info: { max: number }) => string;
}
export interface InputAllowClear { disabled?: boolean; clearIcon?: string | number | false | null | Snippet; }
export type InputShowCount = boolean | { formatter: InputCountFormatter };
