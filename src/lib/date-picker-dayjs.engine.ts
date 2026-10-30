// Day.js adapter по @rc-component/picker 1.12.2; MIT, vendor/LICENSE.rc-picker.
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import weekday from 'dayjs/plugin/weekday.js';
import localeData from 'dayjs/plugin/localeData.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import 'dayjs/locale/ru.js';
import type { GenerateConfig } from './date-generate.types';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend((_options, constructor) => {
  const original = constructor.prototype.format;
  constructor.prototype.format = function(format) {
    // Оригинальный formatter использует текущий экземпляр Dayjs как receiver.
    return original.call(this, (format ?? '').replace('Wo', 'wo'));
  };
});
const localeMap: Record<string, string> = {
  bn_BD: 'bn-bd',
  by_BY: 'be',
  en_GB: 'en-gb',
  en_US: 'en',
  fr_BE: 'fr',
  fr_CA: 'fr-ca',
  hy_AM: 'hy-am',
  km_KH: 'km',
  kmr_IQ: 'ku',
  nl_BE: 'nl-be',
  pt_BR: 'pt-br',
  zh_CN: 'zh-cn',
  zh_HK: 'zh-hk',
  zh_TW: 'zh-tw'
};
const localeName = (locale: string) => localeMap[locale] || locale.split('_')[0];
// Сохраняем поведение адаптера при нескольких экземплярах библиотеки Day.js.
const own = (value: Dayjs) => !dayjs.isDayjs(value) || value instanceof dayjs
  ? value
  : dayjs(value.valueOf());
export const dayjsGenerateConfig: GenerateConfig<Dayjs> = {
  getNow: () => {
    const now = dayjs() as Dayjs & { tz?: () => Dayjs; };
    return typeof now.tz === 'function' ? now.tz() : now;
  },
  getFixedDate: text => dayjs(text, ['YYYY-M-DD', 'YYYY-MM-DD']),
  getEndDate: value => own(value).endOf('month'),
  getWeekDay: value => {
    const date = own(value).locale('en');
    return date.weekday() + date.localeData().firstDayOfWeek();
  },
  getYear: value => own(value).year(),
  getMonth: value => own(value).month(),
  getDate: value => own(value).date(),
  getHour: value => own(value).hour(),
  getMinute: value => own(value).minute(),
  getSecond: value => own(value).second(),
  getMillisecond: value => own(value).millisecond(),
  addYear: (value, amount) => own(value).add(amount, 'year'),
  addMonth: (value, amount) => own(value).add(amount, 'month'),
  addDate: (value, amount) => own(value).add(amount, 'day'),
  setYear: (value, year) => own(value).year(year),
  setMonth: (value, month) => own(value).month(month),
  setDate: (value, date) => own(value).date(date),
  setHour: (value, hour) => own(value).hour(hour),
  setMinute: (value, minute) => own(value).minute(minute),
  setSecond: (value, second) => own(value).second(second),
  setMillisecond: (value, millisecond) => own(value).millisecond(millisecond),
  isAfter: (a, b) => own(a).isAfter(own(b)),
  isValidate: value => own(value).isValid(),
  locale: {
    getWeekFirstDay: locale => dayjs().locale(localeName(locale)).localeData().firstDayOfWeek(),
    getWeekFirstDate: (locale, value) => own(value).locale(localeName(locale)).weekday(0),
    getWeek: (locale, value) => own(value).locale(localeName(locale)).week(),
    getShortWeekDays: locale => dayjs().locale(localeName(locale)).localeData().weekdaysMin(),
    getShortMonths: locale => dayjs().locale(localeName(locale)).localeData().monthsShort(),
    format: (locale, value, format) => own(value).locale(localeName(locale)).format(format),
    parse: (locale, text, formats) => {
      for (const format of formats) {
        if (format.includes('wo') || format.includes('Wo')) {
          const [year, week] = text.split('-');
          const first = dayjs(year, 'YYYY').startOf('year').locale(localeName(locale));
          for (let n = 0; n <= 52; n++) {
            const date = first.add(n, 'week');
            if (date.format('Wo') === week) return date;
          }
          return null;
        }
        const date = dayjs(text, format, true).locale(localeName(locale));
        if (date.isValid()) return date;
      }
      return null;
    }
  }
};
