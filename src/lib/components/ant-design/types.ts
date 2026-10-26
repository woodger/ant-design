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
  pagination?: Partial<PaginationLocale>;
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
  }
} satisfies Locale;

export const enUS = {
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
  }
} satisfies Locale;
