import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes, HTMLInputAttributes } from 'svelte/elements';

export type RadioValue = string | number | boolean;

/** Нативный radio с типизированным value и bind:checked вне RadioGroup. */
export interface RadioProps extends Omit<
  HTMLInputAttributes,
  'type' | 'value' | 'checked' | 'children' | 'class' | 'size'
> {
  /** @defaultValue 'on' */
  value?: RadioValue;
  /** Поддерживает bind:checked. */
  checked?: boolean | undefined;
  /** @defaultValue false */
  defaultChecked?: boolean;
  children?: Snippet;
  onCheckedChange?: (checked: boolean) => void;
  class?: string;
}

export interface RadioOption<Value extends RadioValue = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

/** Одиночный выбор типизированного значения через независимую группу native radio. */
export interface RadioGroupProps<Value extends RadioValue = string> extends Omit<
  HTMLFieldsetAttributes,
  'children' | 'class' | 'onchange'
> {
  options: readonly (Value | RadioOption<Value>)[];
  /** Поддерживает bind:value. */
  value?: Value | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: Value;
  required?: boolean;
  /** @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  onValueChange?: (value: Value) => void;
  class?: string;
}
