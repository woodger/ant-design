import type { Dayjs } from 'dayjs';
import type { Snippet } from 'svelte';
import type { DatePickerProps, DatePickerTimeConfig, DatePickerDisabledTime, DatePickerMode } from './date-picker.types';
export type RangePickerValue = [Dayjs | null, Dayjs | null];
export type RangePickerInputValue = [Dayjs | null | undefined, Dayjs | null | undefined];
export type RangePickerPart = 'start' | 'end';
export interface RangePickerInfo { range: RangePickerPart; }
export interface RangePickerTimeConfig extends Omit<DatePickerTimeConfig, 'defaultOpenValue'> {
  defaultOpenValue?: [Dayjs, Dayjs];
}
export interface RangePickerPreset {
  label: string | Snippet;
  value: RangePickerInputValue | (() => RangePickerInputValue);
}
export interface RangePickerProps extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'showTime' | 'disabled' | 'id' | 'placeholder' | 'disabledDate' | 'disabledTime' | 'onChange' | 'onCalendarChange' | 'onOk' | 'pickerValue' | 'defaultPickerValue' | 'onPickerValueChange' | 'onPanelChange'> {
  value?: RangePickerInputValue | null;
  defaultValue?: RangePickerInputValue;
  disabled?: boolean | [boolean, boolean];
  allowEmpty?: boolean | [boolean, boolean];
  order?: boolean;
  id?: string | { start?: string; end?: string };
  placeholder?: [string, string];
  showTime?: boolean | RangePickerTimeConfig;
  disabledDate?: (date: Dayjs, info: { type: DatePickerMode; from?: Dayjs }) => boolean;
  disabledTime?: (date: Dayjs, partial: RangePickerPart, info: { from?: Dayjs }) => DatePickerDisabledTime;
  defaultPickerValue?: [Dayjs, Dayjs] | Dayjs | null;
  pickerValue?: [Dayjs, Dayjs] | Dayjs | null;
  onChange?: (value: RangePickerValue | null, dateStrings: [string, string] | null) => void;
  onCalendarChange?: (value: RangePickerValue, dateStrings: [string, string], info: RangePickerInfo) => void;
  onOk?: (value: RangePickerValue) => void;
  onPickerValueChange?: (value: [Dayjs, Dayjs], info: RangePickerInfo & { source: 'reset' | 'panel'; mode: [DatePickerMode, DatePickerMode] }) => void;
  onPanelChange?: (value: RangePickerValue, modes: [DatePickerMode, DatePickerMode]) => void;
  separator?: string | Snippet;
  presets?: readonly RangePickerPreset[];
  previewValue?: false | 'hover';
  startInput?: HTMLInputElement;
  endInput?: HTMLInputElement;
}
