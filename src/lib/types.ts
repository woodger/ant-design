import type { UploadLocale } from './upload.types';
import type { DatePickerLocale } from './date-picker.types';
import { datePickerEnUS, datePickerRuRU } from './date-picker.locale';
export type ComponentSize = 'small' | 'middle' | 'large';

/**
 * Поддерживаемая палитра, светлая/тёмная тема и compact density; не общий token engine Ant Design.
 */
export interface ThemeConfig {
  mode?: 'light' | 'dark';
  primary?: 'blue' | 'purple' | 'green';
  compact?: boolean;
}

export interface Locale {
  global?: { show?: string; hide?: string; };
  image?: { preview?: string; };
  tree?: { expand?: string; collapse?: string; };
  upload?: UploadLocale;
  datePicker?: DatePickerLocale;
  okText: string;
  cancelText: string;
  closeText: string;
  clearText: string;
  emptyText: string;
  searchText: string;
  submitErrorText: string;
  confirmErrorText?: string;
  removeText?: string;
  selectRequiredText?: string;
  pagination?: Partial<PaginationLocale>;
  table?: Partial<TableLocale>;
  inputNumber?: Partial<InputNumberLocale>;
  progress?: Partial<ProgressLocale>;
  spin?: Partial<SpinLocale>;
  skeleton?: Partial<SkeletonLocale>;
  empty?: Partial<EmptyLocale>;
  steps?: Partial<StepsLocale>;
  badge?: Partial<BadgeLocale>;
  avatarGroup?: Partial<AvatarGroupLocale>;
  layout?: Partial<LayoutLocale>;
}

export interface LayoutLocale {
  expand: string;
  collapse: string;
}

export interface AvatarGroupLocale {
  label: string;
  hiddenLabel: string;
  overflow: string;
}

export interface BadgeLocale {
  count: string;
  dot: string;
  success: string;
  processing: string;
  default: string;
  error: string;
  warning: string;
}

export interface StepsLocale {
  label: string;
  wait: string;
  process: string;
  finish: string;
  error: string;
}

export interface EmptyLocale {
  description: string;
}

export interface SkeletonLocale {
  loadingText: string;
}

export interface SpinLocale {
  loadingText: string;
}

export interface ProgressLocale {
  label: string;
  successText: string;
  exceptionText: string;
}

export interface InputNumberLocale {
  increase: string;
  decrease: string;
  invalidNumber: string;
}

export interface TableLocale {
  label: string;
  emptyText: string;
  loadingText: string;
  selectAll: string;
  selectRow: string;
  sortAscending: string;
  sortDescending: string;
  cancelSort: string;
  filterTitle?: string;
  filterApply?: string;
  filterReset?: string;
  expandColumn?: string;
  expandRow?: string;
  collapseRow?: string;
}

export interface PaginationLocale {
  label: string;
  previous: string;
  next: string;
  page: string;
  jumpPrevious: string;
  jumpNext: string;
  pageSize: string;
  itemsPerPage: string;
}

export interface SelectOption<Value extends string | number = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export const ruRU = {
  tree: { expand: 'Развернуть', collapse: 'Свернуть' },
  upload: {
    uploading: 'Загрузка...',
    removeFile: 'Удалить файл',
    uploadError: 'При загрузке произошла ошибка',
    previewFile: 'Предпросмотр файла',
    downloadFile: 'Загрузить файл'
  },
  datePicker: datePickerRuRU,
  layout: { expand: 'Развернуть боковую панель', collapse: 'Свернуть боковую панель' },
  avatarGroup: {
    label: 'Участники',
    hiddenLabel: 'Скрытые участники',
    overflow: 'Ещё участников'
  },
  badge: {
    count: 'Количество',
    dot: 'Есть обновления',
    success: 'Успешно',
    processing: 'Выполняется',
    default: 'Обычный статус',
    error: 'Ошибка',
    warning: 'Предупреждение'
  },
  steps: {
    label: 'Этапы',
    wait: 'Ожидается',
    process: 'Выполняется',
    finish: 'Завершён',
    error: 'Ошибка'
  },
  empty: { description: 'Нет данных' },
  skeleton: { loadingText: 'Загрузка…' },
  spin: { loadingText: 'Загрузка…' },
  progress: { label: 'Ход выполнения', successText: 'Завершено', exceptionText: 'Ошибка' },
  inputNumber: {
    increase: 'Увеличить значение',
    decrease: 'Уменьшить значение',
    invalidNumber: 'Введите число в допустимом диапазоне.'
  },
  removeText: 'Удалить',
  selectRequiredText: 'Выберите хотя бы один вариант.',
  okText: 'Подтвердить',
  cancelText: 'Отмена',
  closeText: 'Закрыть',
  global: { show: 'Показать', hide: 'Скрыть' },
  image: { preview: 'Просмотр изображения' },
  clearText: 'Очистить',
  emptyText: 'Ничего не найдено',
  searchText: 'Поиск',
  submitErrorText: 'Не удалось отправить форму. Попробуйте ещё раз.',
  confirmErrorText: 'Не удалось выполнить действие. Попробуйте ещё раз.',
  pagination: {
    label: 'Пагинация',
    previous: 'Предыдущая страница',
    next: 'Следующая страница',
    page: 'Страница',
    jumpPrevious: 'Предыдущие страницы',
    jumpNext: 'Следующие страницы',
    pageSize: 'Записей на странице',
    itemsPerPage: '/ стр.'
  },
  table: {
    label: 'Таблица',
    emptyText: 'Нет данных',
    loadingText: 'Загрузка данных…',
    selectAll: 'Выбрать все строки на странице',
    selectRow: 'Выбрать строку',
    sortAscending: 'Сортировать по возрастанию',
    sortDescending: 'Сортировать по убыванию',
    cancelSort: 'Сбросить сортировку',
    filterTitle: 'Фильтр',
    filterApply: 'Применить',
    filterReset: 'Сбросить',
    expandColumn: 'Подробности',
    expandRow: 'Раскрыть строку',
    collapseRow: 'Свернуть строку'
  }
} satisfies Locale;

export const enUS = {
  tree: { expand: 'Expand', collapse: 'Collapse' },
  upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    downloadFile: 'Download file'
  },
  datePicker: datePickerEnUS,
  layout: { expand: 'Expand sidebar', collapse: 'Collapse sidebar' },
  avatarGroup: { label: 'Members', hiddenLabel: 'Hidden members', overflow: 'More members' },
  badge: {
    count: 'Count',
    dot: 'Updates available',
    success: 'Success',
    processing: 'Processing',
    default: 'Default status',
    error: 'Error',
    warning: 'Warning'
  },
  steps: {
    label: 'Steps',
    wait: 'Waiting',
    process: 'In progress',
    finish: 'Finished',
    error: 'Error'
  },
  empty: { description: 'No data' },
  skeleton: { loadingText: 'Loading…' },
  spin: { loadingText: 'Loading…' },
  progress: { label: 'Progress', successText: 'Completed', exceptionText: 'Failed' },
  inputNumber: {
    increase: 'Increase value',
    decrease: 'Decrease value',
    invalidNumber: 'Enter a number within the allowed range.'
  },
  removeText: 'Remove',
  selectRequiredText: 'Select at least one option.',
  okText: 'OK',
  cancelText: 'Cancel',
  closeText: 'Close',
  global: { show: 'Show', hide: 'Hide' },
  image: { preview: 'Image preview' },
  clearText: 'Clear',
  emptyText: 'No options',
  searchText: 'Search',
  submitErrorText: 'Could not submit the form. Please try again.',
  confirmErrorText: 'Could not complete the action. Please try again.',
  pagination: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: 'Page',
    jumpPrevious: 'Previous pages',
    jumpNext: 'Next pages',
    pageSize: 'Items per page',
    itemsPerPage: '/ page'
  },
  table: {
    label: 'Table',
    emptyText: 'No data',
    loadingText: 'Loading data…',
    selectAll: 'Select all rows on this page',
    selectRow: 'Select row',
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    cancelSort: 'Clear sorting',
    filterTitle: 'Filter',
    filterApply: 'Apply',
    filterReset: 'Reset',
    expandColumn: 'Details',
    expandRow: 'Expand row',
    collapseRow: 'Collapse row'
  }
} satisfies Locale;
