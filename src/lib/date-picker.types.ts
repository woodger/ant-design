import type { Dayjs } from 'dayjs';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ComponentSize } from './types';
import type { datePickerEnUS } from './date-picker.locale';
export type DatePickerLocale = {
  lang: Partial<typeof datePickerEnUS.lang> & {
    fieldDateFormat?: string;
    fieldDateTimeFormat?: string;
    fieldTimeFormat?: string;
  };
  timePickerLocale?: { placeholder?: string; };
};
export type DatePickerMode = 'date' | 'month' | 'year' | 'decade';
export type DatePickerFormat = string | ((value: Dayjs) => string);
export interface DatePickerDisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  disabledMilliseconds?: (hour: number, minute: number, second: number) => number[];
}
/** Время в календаре: отображение разрядов, шаги, ограничения и начальная дата панели. */
export interface DatePickerTimeConfig extends Omit<
  DatePickerDisabledTime,
  'disabledMilliseconds'
> {
  format?: string;
  showHour?: boolean;
  showMinute?: boolean;
  showSecond?: boolean;
  showMillisecond?: boolean;
  use12Hours?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  millisecondStep?: number;
  hideDisabledOptions?: boolean;
  defaultOpenValue?: Dayjs;
}
/** Выбор одной даты или datetime через Dayjs, input и локализованную панель. */
export interface DatePickerProps extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'size' | 'type' | 'children' | 'onchange' | 'oninput' | 'onselect'
> {
  /** Управляемый Dayjs или null; компонент не вводит прикладную UTC-сериализацию. */
  value?: Dayjs | null;
  /** Начальная дата локального состояния при отсутствии value. */
  defaultValue?: Dayjs;
  /** @defaultValue false */
  showTime?: boolean | DatePickerTimeConfig;
  /** Первый формат используется для вывода; дополнительные строки допускаются при разборе ввода. */
  format?: DatePickerFormat | DatePickerFormat[];
  /** Начальная дата панели; применяется заново при каждом открытии popup. */
  defaultPickerValue?: Dayjs;
  /** Управляемая дата панели, независимая от выбранного value. */
  pickerValue?: Dayjs;
  open?: boolean;
  /** @defaultValue false */
  defaultOpen?: boolean;
  disabledDate?: (date: Dayjs, info: { type: DatePickerMode; }) => boolean;
  disabledTime?: (date: Dayjs) => DatePickerDisabledTime;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  /** При включении выбор публикуется после подтверждения OK. */
  needConfirm?: boolean;
  /** @defaultValue true */
  allowClear?: boolean;
  inputReadOnly?: boolean;
  /** @defaultValue false */
  preserveInvalidOnBlur?: boolean;
  /** @defaultValue true */
  showNow?: boolean;
  /** @defaultValue true */
  showToday?: boolean;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  /** @defaultValue 'outlined' */
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  locale?: DatePickerLocale;
  onChange?: (value: Dayjs | null, dateString: string) => void;
  onCalendarChange?: (
    value: Dayjs | null,
    dateString: string,
    info: { source: 'date' | 'time'; }
  ) => void;
  onOk?: (value: Dayjs) => void;
  onClear?: () => void;
  onPickerValueChange?: (value: Dayjs) => void;
  onOpenChange?: (open: boolean) => void;
  onPanelChange?: (value: Dayjs, mode: DatePickerMode) => void;
  renderExtraFooter?: Snippet;
  /** @defaultValue 'bottomLeft' */
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  class?: string;
  rootClassName?: string;
  /** @defaultValue '' */
  popupClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
