import type { TableChange, TableFilters, TableKey, TableSorter } from '../../src/lib/components/ant-design';
import { createRemoteTable, type RemoteTablePage, type RemoteTableQuery } from '../../src/lib/presentation/ant-design/remote-table.model.svelte';

export interface ServerPerson { key: number; name: string; team: string; score: number; locked?: boolean }

const firstPage: ServerPerson[] = [
  { key: 31, name: 'Zulu', team: 'B', score: 9 },
  { key: 32, name: 'Alpha', team: 'A', score: 1, locked: true },
  { key: 33, name: 'Mike', team: 'B', score: 5 }
];
const secondPage: ServerPerson[] = [
  { key: 41, name: 'Echo', team: 'A', score: 2 },
  { key: 42, name: 'Bravo', team: 'B', score: 3 },
  { key: 43, name: 'Locked', team: 'B', score: 4, locked: true }
];

export function createServerControls() {
  let rows = $state(firstPage);
  let current = $state(4);
  let pageSize = $state(2);
  let total = $state(42);
  let sorter = $state<TableSorter | null>({ columnKey: 'name', order: 'ascend' });
  let filters = $state<TableFilters>({ team: ['A'] });
  let selected = $state<TableKey[]>([]);
  let client = $state(false);
  let loading = $state(false);
  let noPagination = $state(false);
  let events = $state<TableChange<ServerPerson>[]>([]);
  let selections = $state<{ keys: TableKey[]; ids: number[]; type: string }[]>([]);

  return {
    get rows() { return rows; },
    get total() { return total; },
    get current() { return current; },
    set current(value: number) { current = value; },
    get pageSize() { return pageSize; },
    set pageSize(value: number) { pageSize = value; },
    get sorter() { return sorter; },
    set sorter(value: TableSorter | null) { sorter = value; },
    get filters() { return filters; },
    set filters(value: TableFilters) { filters = value; },
    get selected() { return selected; },
    set selected(value: TableKey[]) { selected = value; },
    get client() { return client; },
    set client(value: boolean) { client = value; },
    get loading() { return loading; },
    set loading(value: boolean) { loading = value; },
    get noPagination() { return noPagination; },
    set noPagination(value: boolean) { noPagination = value; },
    get owner() { return JSON.stringify({ current, pageSize, sorter, filters }); },
    get events() { return JSON.stringify(events.map((event) => ({ ...event, currentDataSource: event.currentDataSource.map((row) => row.key) }))); },
    get selections() { return JSON.stringify(selections); },
    change(event: TableChange<ServerPerson>) { events.push(event); },
    select(keys: TableKey[], records: ServerPerson[], info: { type: 'single' | 'all' }) { selections.push({ keys, ids: records.map((row) => row.key), type: info.type }); },
    replacePage() { current = 5; rows = secondPage; },
    restorePage() { current = 4; rows = firstPage; total = 42; },
    shrinkTotal() { total = 3; },
    emptyPage() { rows = []; }
  };
}

interface RequestInfo { id: number; query: RemoteTableQuery; aborted: boolean; done: boolean }

export function createQueuedTable() {
  let requests = $state.raw<RequestInfo[]>([]);
  let active = $state(true);
  const pending = new Map<number, { resolve: (page: RemoteTablePage<ServerPerson>) => void; reject: (reason: Error) => void; cleanup: () => void }>();
  const remote = createRemoteTable<ServerPerson>((query, signal) => new Promise((resolve, reject) => {
    const id = requests.length + 1;
    const abort = () => { requests = requests.map((request) => request.id === id ? { ...request, aborted: true } : request); };
    signal.addEventListener('abort', abort, { once: true });
    requests = [...requests, { id, query, aborted: signal.aborted, done: false }];
    pending.set(id, { resolve, reject, cleanup: () => signal.removeEventListener('abort', abort) });
  }), { pageSize: 2 });

  function finish(id: number, result: 'success' | 'shrink' | 'failure') {
    const request = pending.get(id);
    if (!request) return;
    request.cleanup();
    pending.delete(id);
    requests = requests.map((entry) => entry.id === id ? { ...entry, done: true } : entry);
    if (result === 'failure') request.reject(new Error('Controlled failure'));
    else request.resolve({ rows: result === 'shrink' ? [] : [{ key: id * 10, name: `Response ${id}`, team: 'B', score: id }], total: result === 'shrink' ? 3 : 40 });
  }

  return {
    remote,
    get requests() { return requests; },
    get active() { return active; },
    start() { void remote.load(); },
    lastPage() { void remote.load({ ...remote.query, current: 8 }); },
    finish,
    dispose() {
      remote.dispose();
      active = false;
    },
    cleanup() {
      remote.dispose();
      pending.forEach((request) => request.cleanup());
    }
  };
}
