import type { Dayjs } from 'dayjs';
import { dayjsGenerateConfig as date } from './date-picker-dayjs.engine';
import type { DatePickerFormat, DatePickerMode, DatePickerProps, DatePickerTimeConfig } from './date-picker.types';

export function pickerFormats(props: Pick<DatePickerProps, 'format' | 'showTime'>, locale: NonNullable<DatePickerProps['locale']>['lang'] = {}): DatePickerFormat[] {
  if (props.format) return Array.isArray(props.format) ? props.format : [props.format];
  if (!props.showTime) return [locale.fieldDateFormat ?? 'YYYY-MM-DD'];
  const config = typeof props.showTime === 'object' ? props.showTime : {};
  const columns = timeColumns(config, 'HH:mm:ss');
  const units = columns.filter(column => column.unit !== 'millisecond').map(column => column.unit === 'hour' ? config.use12Hours ? 'hh' : 'HH' : column.unit === 'minute' ? 'mm' : 'ss');
  const time = units.join(':') + (columns.some(column => column.unit === 'millisecond') ? '.SSS' : '') + (config.use12Hours ? ' A' : '');
  return [locale.fieldDateTimeFormat ?? `YYYY-MM-DD ${time}`];
}
export function formatPicker(value: Dayjs | null | undefined, locale: string, formats: readonly DatePickerFormat[]): string {
  if (!value || !value.isValid()) return '';
  return typeof formats[0] === 'function' ? formats[0](value) : date.locale.format(locale, value, formats[0] ?? 'YYYY-MM-DD');
}
export function parsePicker(text: string, locale: string, formats: readonly DatePickerFormat[]): Dayjs | null {
  return date.locale.parse(locale, text, formats.filter((format): format is string => typeof format === 'string'));
}
export function calendarCells(panel: Dayjs, mode: DatePickerMode, locale: string): Dayjs[] {
  if (mode === 'date') {
    const first = panel.date(1);
    const offset = (date.getWeekDay(first) - date.locale.getWeekFirstDay(locale) + 7) % 7;
    return Array.from({ length: 42 }, (_, index) => date.addDate(first, index - offset));
  }
  if (mode === 'month') return Array.from({ length: 12 }, (_, index) => panel.month(index));
  const unit = mode === 'year' ? 1 : 10;
  const base = Math.floor(panel.year() / (unit * 10)) * unit * 10;
  return Array.from({ length: 12 }, (_, index) => panel.year(base + (index - 1) * unit));
}
export function pickerDateDisabled(value: Dayjs, props: Pick<DatePickerProps, 'minDate' | 'maxDate' | 'disabledDate'>, mode: DatePickerMode = 'date'): boolean {
  const unit = mode === 'date' ? 'day' : mode === 'month' ? 'month' : 'year';
  return Boolean(props.minDate && value.endOf(unit).isBefore(props.minDate.startOf('day')) || props.maxDate && value.startOf(unit).isAfter(props.maxDate.endOf('day')) || props.disabledDate?.(value, { type: mode }));
}
export function pickerTimeDisabled(value: Dayjs, props: Pick<DatePickerProps, 'showTime' | 'disabledTime'>): boolean {
  if (!props.showTime) return false;
  const base = typeof props.showTime === 'object' ? props.showTime : {};
  const dynamic = props.disabledTime?.(value);
  const config = { ...base, ...dynamic, disabledHours: dynamic?.disabledHours ?? base.disabledHours, disabledMinutes: dynamic?.disabledMinutes ?? base.disabledMinutes, disabledSeconds: dynamic?.disabledSeconds ?? base.disabledSeconds };
  return Boolean(config.disabledHours?.().includes(value.hour()) || config.disabledMinutes?.(value.hour()).includes(value.minute()) || config.disabledSeconds?.(value.hour(), value.minute()).includes(value.second()) || config.disabledMilliseconds?.(value.hour(), value.minute(), value.second()).includes(value.millisecond()));
}
export function timeColumns(config: DatePickerTimeConfig, format: string) {
  const explicit = [config.showHour, config.showMinute, config.showSecond, config.showMillisecond].some(value => value !== undefined);
  const clean = format.replace(/\[[^\]]*\]/g, '');
  const existFalse = [config.showHour, config.showMinute, config.showSecond].some(value => value === false);
  const existTrue = [config.showHour, config.showMinute, config.showSecond].some(value => value === true);
  const fallback = existFalse || !existTrue;
  return [
    { unit: 'hour' as const, shown: config.showHour ?? (explicit ? fallback : /[Hh]/.test(clean)), count: 24, step: config.hourStep },
    { unit: 'minute' as const, shown: config.showMinute ?? (explicit ? fallback : /m/.test(clean)), count: 60, step: config.minuteStep },
    { unit: 'second' as const, shown: config.showSecond ?? (explicit ? fallback : /s/.test(clean)), count: 60, step: config.secondStep },
    { unit: 'millisecond' as const, shown: config.showMillisecond ?? (!explicit && /S/.test(clean)), count: 1000, step: config.millisecondStep }
  ].filter(column => column.shown).map(column => ({ ...column, step: Number.isInteger(column.step) && column.step! > 0 ? column.step! : column.unit === 'millisecond' ? 100 : 1 }));
}

// Как findValidateTime: ближайший разрешённый unit слева, иначе первый разрешённый.
// Выравниваются все четыре unit, включая скрытые секунды/миллисекунды.
export function validPickerTime(value: Dayjs, config: DatePickerTimeConfig = {}, disabledTime?: DatePickerProps['disabledTime']): Dayjs {
  const dynamic = disabledTime?.(value) ?? {};
  let next = value;
  for (const column of [
    { unit: 'hour' as const, count: 24, step: config.hourStep ?? 1, disabled: () => (dynamic.disabledHours ?? config.disabledHours)?.() ?? [] },
    { unit: 'minute' as const, count: 60, step: config.minuteStep ?? 1, disabled: () => (dynamic.disabledMinutes ?? config.disabledMinutes)?.(next.hour()) ?? [] },
    { unit: 'second' as const, count: 60, step: config.secondStep ?? 1, disabled: () => (dynamic.disabledSeconds ?? config.disabledSeconds)?.(next.hour(), next.minute()) ?? [] },
    { unit: 'millisecond' as const, count: 1000, step: config.millisecondStep ?? 100, disabled: () => dynamic.disabledMilliseconds?.(next.hour(), next.minute(), next.second()) ?? [] }
  ]) {
    const step = column.step >= 1 ? column.step | 0 : 1;
    const forbidden = column.disabled();
    const allowed = Array.from({ length: Math.ceil(column.count / step) }, (_, n) => n * step).filter(n => !forbidden.includes(n));
    const current = next.get(column.unit);
    const selected = allowed.findLast(n => n <= current) ?? allowed[0];
    if (selected !== undefined && selected !== current) next = next.set(column.unit, selected);
  }
  return next;
}
