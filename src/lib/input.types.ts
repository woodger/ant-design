import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { InputAllowClear, InputCountConfig, InputShowCount } from './input-count.types';

export type {
  InputAllowClear,
  InputCountConfig,
  InputCountInfo,
  InputCountFormatter,
  InputCountContent
} from './input-count.types';

export type InputVariant = 'outlined' | 'filled' | 'borderless' | 'underlined';
export type InputContent = string | number | boolean | null | Snippet;
export type InputSemanticSlots = Partial<
  Record<'root' | 'input' | 'prefix' | 'suffix' | 'clear' | 'count', string>
>;

/** Callback получает Props с разрешёнными size и disabled; root — внешняя обёртка. */
export type InputSemantic =
  | InputSemanticSlots
  | ((info: { props: InputProps; }) => InputSemanticSlots | undefined);

/**
 * Адаптация DOM Event для onChange. target и currentTarget — копия input со значением
 * на момент вызова; nativeEvent — исходное событие. Для input type заменяется на
 * change; очистка сохраняет click. Методы события работают с исходным DOM Event.
 */
export type InputChangeEvent = Event & {
  target: HTMLInputElement;
  currentTarget: HTMLInputElement;
  readonly nativeEvent: Event;
};

/**
 * Общие настройки ConfigProvider.input. Локальные Props имеют приоритет;
 * вложенный ConfigProvider с input заменяет этот объект целиком.
 */
export interface InputConfig {
  allowClear?: boolean | InputAllowClear;
  autoComplete?: HTMLInputAttributes['autocomplete'];
  variant?: InputVariant;
  class?: string;
  style?: string;
  classNames?: InputSemantic;
  styles?: InputSemantic;
}

/** Input с bind:value, нативными HTML-атрибутами и совместимыми callbacks Ant Design. */
export interface InputProps extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'children' | 'size' | 'class' | 'prefix'
> {
  /** Поддерживает bind:value. Внешнее значение не обрезается через count.exceedFormatter. */
  value?: string;
  /** Начальное значение при отсутствующем value; последующие изменения не применяются. */
  defaultValue?: string;
  /** Приоритет: локальный size, SpaceCompact, ConfigProvider.componentSize. */
  size?: ComponentSize | 'medium';
  /** Нативный атрибут size; визуальный размер задаётся через size. */
  htmlSize?: number;
  status?: 'error' | 'warning' | '';
  /** Приоритет: variant, bordered=false, ConfigProvider.input.variant, outlined. */
  variant?: InputVariant;
  /** Совместимость с Ant Design: false выбирает borderless, если variant не задан. */
  bordered?: boolean;
  prefix?: InputContent;
  suffix?: InputContent;
  addonBefore?: InputContent;
  addonAfter?: InputContent;
  /** false отключает очистку; иначе отсутствующие поля наследуются из ConfigProvider.input. */
  allowClear?: boolean | InputAllowClear;
  /** По умолчанию скрыт; count.show имеет приоритет. */
  showCount?: InputShowCount;
  count?: InputCountConfig;
  /** Жёсткий нативный maxlength; также максимум счётчика, если count.max не задан. */
  maxLength?: number;
  readOnly?: boolean;
  autoComplete?: HTMLInputAttributes['autocomplete'];
  autoFocus?: boolean;
  class?: string;
  rootClassName?: string;
  classNames?: InputSemantic;
  /** Inline CSS по semantic slots; локальные стили идут после настроек ConfigProvider.input. */
  styles?: InputSemantic;
  /** bind:inputElement возвращает нативный input. */
  inputElement?: HTMLInputElement;
  /** bind:nativeElement возвращает внешний root: input или span при affixes/addons. */
  nativeElement?: HTMLElement;
  /** Вызывается при вводе и очистке перед onChange; bind:value к этому моменту обновлён. */
  onValueChange?: (value: string) => void;
  /** Адаптированное событие ввода/очистки. Нативные oninput и onchange сохраняются отдельно. */
  onChange?: (event: InputChangeEvent) => void;
  /** Вызывается после onValueChange и onChange при очистке кнопкой. */
  onClear?: () => void;
  /** Один вызов на Enter до keyup/blur/disabled; composing Enter пропускается. */
  onPressEnter?: HTMLInputAttributes['onkeydown'];
  onFocus?: HTMLInputAttributes['onfocus'];
  onBlur?: HTMLInputAttributes['onblur'];
  onKeyDown?: HTMLInputAttributes['onkeydown'];
  onKeyUp?: HTMLInputAttributes['onkeyup'];
  onCompositionStart?: HTMLInputAttributes['oncompositionstart'];
  onCompositionEnd?: HTMLInputAttributes['oncompositionend'];
  [key: `data-${string}`]: string | undefined;
}
