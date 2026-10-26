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
}

export interface SelectOption<Value extends string | number = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export const ruRU: Locale = {
  okText: 'Подтвердить',
  cancelText: 'Отмена',
  closeText: 'Закрыть',
  clearText: 'Очистить',
  emptyText: 'Ничего не найдено',
  searchText: 'Поиск',
  submitErrorText: 'Не удалось отправить форму. Попробуйте ещё раз.'
};

export const enUS: Locale = {
  okText: 'OK',
  cancelText: 'Cancel',
  closeText: 'Close',
  clearText: 'Clear',
  emptyText: 'No options',
  searchText: 'Search',
  submitErrorText: 'Could not submit the form. Please try again.'
};
