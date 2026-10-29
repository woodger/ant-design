import type { Dayjs } from 'dayjs';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ComponentSize } from './types';
import type { datePickerEnUS } from './date-picker.locale';
export type DatePickerLocale = { lang: Partial<typeof datePickerEnUS.lang> & { fieldDateFormat?: string; fieldDateTimeFormat?: string; fieldTimeFormat?: string }; timePickerLocale?: { placeholder?: string } };
export type DatePickerMode = 'date' | 'month' | 'year' | 'decade';
export type DatePickerFormat = string | ((value: Dayjs) => string);
export interface DatePickerDisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  disabledMilliseconds?: (hour: number, minute: number, second: number) => number[];
}
export interface DatePickerTimeConfig extends Omit<DatePickerDisabledTime, 'disabledMilliseconds'> {
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
export interface DatePickerProps extends Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'size' | 'type' | 'children' | 'onchange' | 'oninput' | 'onselect'> {
  value?: Dayjs | null;
  defaultValue?: Dayjs;
  showTime?: boolean | DatePickerTimeConfig;
  format?: DatePickerFormat | DatePickerFormat[];
  defaultPickerValue?: Dayjs;
  pickerValue?: Dayjs;
  open?: boolean;
  defaultOpen?: boolean;
  disabledDate?: (date: Dayjs, info: { type: DatePickerMode }) => boolean;
  disabledTime?: (date: Dayjs) => DatePickerDisabledTime;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  needConfirm?: boolean;
  allowClear?: boolean;
  inputReadOnly?: boolean;
  preserveInvalidOnBlur?: boolean;
  showNow?: boolean;
  showToday?: boolean;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  locale?: DatePickerLocale;
  onChange?: (value: Dayjs | null, dateString: string) => void;
  onCalendarChange?: (value: Dayjs | null, dateString: string, info: { source: 'date' | 'time' }) => void;
  onOk?: (value: Dayjs) => void;
  onClear?: () => void;
  onPickerValueChange?: (value: Dayjs) => void;
  onOpenChange?: (open: boolean) => void;
  onPanelChange?: (value: Dayjs, mode: DatePickerMode) => void;
  renderExtraFooter?: Snippet;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  class?: string;
  rootClassName?: string;
  popupClassName?: string;
  nativeElement?: HTMLDivElement;
}
