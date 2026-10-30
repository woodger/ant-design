import type { Snippet } from 'svelte';

export interface InputCountInfo {
  value: string;
  count: number;
  maxLength?: number;
}

export type InputCountContent =
  | string
  | number
  | boolean
  | null
  | undefined
  | Snippet<[InputCountInfo]>;
export type InputCountFormatter = (info: InputCountInfo) => InputCountContent;

/** Общая настройка счётчика Input и TextArea; по умолчанию считает UTF-16 code units. */
export interface InputCountConfig {
  /** Мягкий предел с индикацией превышения; 0 снимает предел. Сам по себе ввод не обрезает. */
  max?: number;
  strategy?: (value: string) => number;
  /** Имеет приоритет над showCount; formatter может вернуть snippet с InputCountInfo. */
  show?: boolean | InputCountFormatter;
  /** Преобразует пользовательский ввод при превышении max после завершения composition. */
  exceedFormatter?: (value: string, info: { max: number }) => string;
}

/** Настройки кнопки очистки; disabled скрывает кнопку, сохраняя её в DOM. */
export interface InputAllowClear {
  disabled?: boolean;
  clearIcon?: string | number | false | null | Snippet;
}

export type InputShowCount = boolean | { formatter: InputCountFormatter };
