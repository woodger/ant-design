import type { Snippet } from 'svelte';
import type { PaginationProps } from './Pagination.svelte';
import type { ComponentSize } from './types';

export type TableKey = string | number;
export type TableRowKey<Row extends object> = keyof Row | ((record: Row) => TableKey);
export type TableSortOrder = 'ascend' | 'descend';

export interface TableSorter {
  columnKey: string;
  order: TableSortOrder;
}

export interface TableColumn<Row extends object> {
  key: string;
  title: string;
  dataIndex?: keyof Row;
  render?: Snippet<[record: Row, index: number]>;
  sorter?: (left: Row, right: Row) => number;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

export interface TableRowSelection<Row extends object> {
  getCheckboxProps?: (record: Row) => { disabled?: boolean; 'aria-label'?: string };
}

export type TablePaginationConfig = Pick<PaginationProps, 'showSizeChanger' | 'pageSizeOptions' | 'hideOnSinglePage' | 'showTotal' | 'aria-label'>;

export interface TableChange<Row extends object> {
  action: 'sort' | 'paginate';
  pagination: { current: number; pageSize: number; total: number };
  sorter: TableSorter | null;
  currentDataSource: Row[];
}

export interface TableProps<Row extends object> {
  dataSource: readonly Row[];
  columns: readonly TableColumn<Row>[];
  rowKey?: TableRowKey<Row>;
  sorter?: TableSorter | null;
  defaultSorter?: TableSorter | null;
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
