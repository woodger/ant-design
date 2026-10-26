import type { TableChange, TableFilters, TableSorter } from '$lib/components/ant-design';
import { getPaginationState } from '$lib/components/ant-design/pagination.engine';

export interface RemoteTableQuery {
  current: number;
  pageSize: number;
  sorter: TableSorter | null;
  filters: TableFilters;
}

export interface RemoteTablePage<Row extends object> {
  rows: readonly Row[];
  total: number;
}

export type RemoteTableLoader<Row extends object> = (query: RemoteTableQuery, signal: AbortSignal) => Promise<RemoteTablePage<Row>>;

function copyQuery(query: RemoteTableQuery): RemoteTableQuery {
  return {
    current: query.current,
    pageSize: query.pageSize,
    sorter: query.sorter ? { ...query.sorter } : null,
    filters: Object.fromEntries(Object.entries(query.filters).map(([key, values]) => [key, [...values]]))
  };
}

export function createRemoteTable<Row extends object>(loadPage: RemoteTableLoader<Row>, initial: Partial<RemoteTableQuery> = {}) {
  let current = $state(initial.current ?? 1);
  let pageSize = $state(initial.pageSize ?? 5);
  let sorter = $state<TableSorter | null>(initial.sorter ? { ...initial.sorter } : null);
  let filters = $state<TableFilters>(Object.fromEntries(Object.entries(initial.filters ?? {}).map(([key, values]) => [key, [...values]])));
  let rows = $state.raw<readonly Row[]>([]);
  let total = $state(0);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let requestId = 0;
  let controller: AbortController | undefined;
  let disposed = false;
  let lastQuery = readQuery();

  function readQuery(): RemoteTableQuery {
    return copyQuery({ current, pageSize, sorter, filters });
  }

  async function load(query: RemoteTableQuery = readQuery()) {
    if (disposed) {
      return;
    }

    const id = ++requestId;
    controller?.abort();
    const activeController = new AbortController();
    controller = activeController;
    let pending = copyQuery(query);
    lastQuery = copyQuery(pending);
    current = pending.current;
    pageSize = pending.pageSize;
    sorter = pending.sorter ? { ...pending.sorter } : null;
    filters = copyQuery(pending).filters;
    rows = [];
    error = null;
    loading = true;

    try {
      while (true) {
        const page = await loadPage(copyQuery(pending), activeController.signal);

        if (disposed || id !== requestId) {
          return;
        }

        const paging = getPaginationState(page.total, pending.current, pending.pageSize);
        total = paging.total;
        current = paging.current;
        pageSize = paging.pageSize;

        if (pending.current !== paging.current || pending.pageSize !== paging.pageSize) {
          pending = { ...pending, current: paging.current, pageSize: paging.pageSize };
          lastQuery = copyQuery(pending);
          continue;
        }

        rows = [...page.rows];
        return;
      }
    } catch {
      if (!disposed && id === requestId) {
        error = 'Не удалось загрузить данные. Попробуйте ещё раз.';
      }
    } finally {
      if (!disposed && id === requestId) {
        loading = false;
        controller = undefined;
      }
    }
  }

  return {
    get current() { return current; },
    set current(value: number) { current = value; },
    get pageSize() { return pageSize; },
    set pageSize(value: number) { pageSize = value; },
    get sorter() { return sorter; },
    set sorter(value: TableSorter | null) { sorter = value; },
    get filters() { return filters; },
    set filters(value: TableFilters) { filters = value; },
    get rows() { return rows; },
    get total() { return total; },
    get loading() { return loading; },
    get error() { return error; },
    get query() { return readQuery(); },
    load,
    retry() { return load(lastQuery); },
    change(change: TableChange<Row>) {
      return load({ current: change.pagination.current, pageSize: change.pagination.pageSize, sorter: change.sorter, filters: change.filters ?? {} });
    },
    dispose() {
      disposed = true;
      requestId++;
      controller?.abort();
      controller = undefined;
      loading = false;
    }
  };
}
