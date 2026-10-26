import type { Snippet } from 'svelte';
import type { PaginationProps } from './Pagination.svelte';
import type { ComponentSize } from './types';

export type TableKey = string | number;
export type TableRowKey<Row extends object> = keyof Row | ((record: Row) => TableKey);
export type TableSortOrder = 'ascend' | 'descend';
export type TableMode = 'client' | 'server';
export type TableFilterValue = TableKey | boolean;
export type TableFilters = Record<string, TableFilterValue[]>;

export interface TableFilterOption {
  text: string;
  value: TableFilterValue;
}

export interface TableSorter {
  columnKey: string;
  order: TableSortOrder;
}

export interface TableColumn<Row extends object> {
  key: string;
  title: string;
  dataIndex?: keyof Row;
  render?: Snippet<[record: Row, index: number]>;
  sorter?: true | ((left: Row, right: Row) => number);
  filters?: readonly TableFilterOption[];
  onFilter?: (value: TableFilterValue, record: Row) => boolean;
  filterMultiple?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

export interface TableRowSelection<Row extends object> {
  getCheckboxProps?: (record: Row) => { disabled?: boolean; 'aria-label'?: string };
}

export type TablePaginationConfig = Pick<PaginationProps, 'showSizeChanger' | 'pageSizeOptions' | 'hideOnSinglePage' | 'showTotal' | 'aria-label'>;

export interface TableChange<Row extends object> {
  action: 'sort' | 'paginate' | 'filter';
  pagination: { current: number; pageSize: number; total: number };
  sorter: TableSorter | null;
  filters?: TableFilters;
  currentDataSource: Row[];
}

export interface TableProps<Row extends object> {
  mode?: TableMode;
  total?: number;
  dataSource: readonly Row[];
  columns: readonly TableColumn<Row>[];
  rowKey?: TableRowKey<Row>;
  sorter?: TableSorter | null;
  defaultSorter?: TableSorter | null;
  filters?: TableFilters;
  defaultFilters?: Readonly<Record<string, readonly TableFilterValue[]>>;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  pagination?: false | TablePaginationConfig;
  rowSelection?: boolean | TableRowSelection<Row>;
  selectedRowKeys?: TableKey[];
  defaultSelectedRowKeys?: readonly TableKey[];
  onChange?: (change: TableChange<Row>) => void;
  onSelectionChange?: (keys: TableKey[], rows: Row[], info: { type: 'single' | 'all' }) => void;
  loading?: boolean;
  disabled?: boolean;
  bordered?: boolean;
  size?: ComponentSize;
  caption?: string;
  empty?: Snippet;
  scroll?: { x?: number | string };
  'aria-label'?: string;
  class?: string;
  style?: string;
}
