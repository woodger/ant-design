import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { InputVariant } from './input.types';

export type InputOTPSemanticSlots = Partial<Record<'root' | 'input' | 'separator', string>>;
/** Callback получает исходные Props с default length и разрешённым variant. */
export type InputOTPSemantic =
  | InputOTPSemanticSlots
  | ((info: { props: InputOTPProps; }) => InputOTPSemanticSlots | undefined);

export type InputOTPSeparatorContent = string | number | boolean | null | Snippet<[number]>;

/**
 * Настройки ConfigProvider.otp; локальные Props имеют приоритет,
 * nested config заменяется целиком.
 */
export interface InputOTPConfig {
  variant?: InputVariant;
  class?: string;
  style?: string;
  classNames?: InputOTPSemantic;
  styles?: InputOTPSemantic;
}

/**
 * Svelte-экспорт Input.OTP. Каждая ячейка хранит одну UTF-16 code unit; обычный ввод
 * принимает любой текст. Native атрибуты относятся к div role=group, кроме явных input Props.
 */
export interface InputOTPProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> {
  /** Число ячеек; по умолчанию 6. */
  length?: number;
  /**
   * Синхронизирует ячейки при изменении prop, без formatter. Как в upstream,
   * неизменённый value не отклоняет локальный ввод; bind:value не предоставляется.
   * На SSR используется defaultValue, value применяется после mount.
   */
  value?: string;
  /** Начальное значение; formatter применяется один раз, последующие изменения игнорируются. */
  defaultValue?: string;
  /** Применяется ко всей строке с пробелами вместо пустых ячеек до ограничения length. */
  formatter?: (value: string) => string;
  /** Вызывается при каждом input перед onChange; массив сохраняет пустые промежуточные ячейки. */
  onInput?: (cells: string[]) => void;
  /**
   * Только полностью заполненный изменившийся код;
   * очистка и неполный ввод не вызывают callback.
   */
  onChange?: (value: string) => void;
  /** Scalar или factory(index); для rich content возвращайте Snippet через () => snippet. */
  separator?: string | number | boolean | null
    | ((index: number) => InputOTPSeparatorContent | undefined);
  /** true показывает •, строка задаёт собственную маску. Исходное значение сохраняется. */
  mask?: boolean | string;
  /** Имеет приоритет над type=password при mask; без mask по умолчанию text. */
  type?: HTMLInputAttributes['type'];
  autoComplete?: HTMLInputAttributes['autocomplete'];
  inputMode?: HTMLInputAttributes['inputmode'];
  /** Фокусирует только первую ячейку. */
  autoFocus?: boolean;
  /** По умолчанию размер ConfigProvider; Compact продолжает действовать на внутренние Input. */
  size?: ComponentSize | 'medium';
  disabled?: boolean;
  status?: 'error' | 'warning' | '';
  /** Приоритет: локальный variant, ConfigProvider.otp.variant, input.variant, outlined. */
  variant?: InputVariant;
  /** Вызывается для ячеек, включая фокус, перенаправленный к первой пустой ячейке. */
  onFocus?: HTMLInputAttributes['onfocus'];
  onBlur?: HTMLInputAttributes['onblur'];
  class?: string;
  rootClassName?: string;
  classNames?: InputOTPSemantic;
  styles?: InputOTPSemantic;
  /** bind:nativeElement возвращает div группы; bind:this предоставляет focus() и blur(). */
  nativeElement?: HTMLDivElement;
}
