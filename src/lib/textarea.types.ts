import type {
  InputCountFormatter as TextAreaCountFormatter,
  InputCountConfig as TextAreaCountConfig,
  InputAllowClear as TextAreaAllowClear
} from './input-count.types';
import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type TextAreaVariant = 'outlined' | 'filled' | 'borderless' | 'underlined';
export type {
  InputCountInfo as TextAreaCountInfo,
  InputCountContent as TextAreaCountContent,
  InputCountFormatter as TextAreaCountFormatter,
  InputCountConfig as TextAreaCountConfig,
  InputAllowClear as TextAreaAllowClear
} from './input-count.types';
export type TextAreaSemanticSlots = Partial<Record<
  'root'
  | 'textarea'
  | 'clear'
  | 'count',
  string
>>;
export type TextAreaSemantic =
  TextAreaSemanticSlots
  | ((info: { props: TextAreaProps; }) => TextAreaSemanticSlots | undefined);
export type TextAreaChangeEvent = Event & {
  target: HTMLTextAreaElement;
  currentTarget: HTMLTextAreaElement;
  readonly nativeEvent: Event;
};
/**
 * Настройки ConfigProvider.textArea; локальные props имеют приоритет, nested config заменяется
 * целиком.
 */
export interface TextAreaConfig {
  allowClear?: boolean | TextAreaAllowClear;
  autoComplete?: HTMLTextareaAttributes['autocomplete'];
  variant?: TextAreaVariant;
  class?: string;
  style?: string;
  classNames?: TextAreaSemantic;
  styles?: TextAreaSemantic;
}

/** Многострочный native control с bind:value, autoSize, clear/count и FormItem. */
export interface TextAreaProps extends Omit<
  HTMLTextareaAttributes,
  'value' | 'defaultValue' | 'children' | 'class'
> {
  /** Поддерживает bind:value. */
  value?: string;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: string;
  size?: ComponentSize | 'medium';
  status?: 'error' | 'warning' | '';
  variant?: TextAreaVariant;
  /** @defaultValue true */
  bordered?: boolean;
  /** Измеряет содержимое или placeholder; minRows/maxRows ограничивают высоту. */
  autoSize?: boolean | { minRows?: number; maxRows?: number; };
  allowClear?: boolean | TextAreaAllowClear;
  showCount?: boolean | { formatter: TextAreaCountFormatter; };
  /** Общие с Input правила soft max, strategy и opt-in exceedFormatter. */
  count?: TextAreaCountConfig;
  maxLength?: number;
  readOnly?: boolean;
  autoComplete?: HTMLTextareaAttributes['autocomplete'];
  autoFocus?: boolean;
  classNames?: TextAreaSemantic;
  styles?: TextAreaSemantic;
  rootClassName?: string;
  /** Вызывается перед onChange и native oninput при вводе или очистке. */
  onValueChange?: (value: string) => void;
  /** Стабильная копия target/currentTarget, nativeEvent содержит исходный DOM Event. */
  onChange?: (event: TextAreaChangeEvent) => void;
  onClear?: () => void;
  onResize?: (size: { width: number; height: number; }) => void;
  onFocus?: HTMLTextareaAttributes['onfocus'];
  onBlur?: HTMLTextareaAttributes['onblur'];
  onKeyDown?: HTMLTextareaAttributes['onkeydown'];
  onMouseDown?: HTMLTextareaAttributes['onmousedown'];
  onCompositionStart?: HTMLTextareaAttributes['oncompositionstart'];
  onCompositionEnd?: HTMLTextareaAttributes['oncompositionend'];
  onPressEnter?: HTMLTextareaAttributes['onkeydown'];
  /** bind:nativeElement сохраняет реальный textarea, даже при наличии wrapper. */
  nativeElement?: HTMLTextAreaElement;
  /** bind:rootElement даёт внешний textarea/span после mount. */
  rootElement?: HTMLElement;
  class?: string;
}
