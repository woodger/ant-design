export type ComponentSize = 'small' | 'middle' | 'large';

export interface ThemeConfig {
  mode?: 'light' | 'dark';
  primary?: 'blue' | 'purple' | 'green';
  compact?: boolean;
}

export interface Locale {
  okText: string;
  cancelText: string;
  closeText: string;
  clearText: string;
  emptyText: string;
  searchText: string;
  submitErrorText: string;
  removeText?: string;
  selectRequiredText?: string;
  pagination?: Partial<PaginationLocale>;
  table?: Partial<TableLocale>;
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
  removeText: 'Удалить',
  selectRequiredText: 'Выберите хотя бы один вариант.',
  okText: 'Подтвердить',
  cancelText: 'Отмена',
  closeText: 'Закрыть',
  clearText: 'Очистить',
  emptyText: 'Ничего не найдено',
  searchText: 'Поиск',
  submitErrorText: 'Не удалось отправить форму. Попробуйте ещё раз.',
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
  removeText: 'Remove',
  selectRequiredText: 'Select at least one option.',
  okText: 'OK',
  cancelText: 'Cancel',
  closeText: 'Close',
  clearText: 'Clear',
  emptyText: 'No options',
  searchText: 'Search',
  submitErrorText: 'Could not submit the form. Please try again.',
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
