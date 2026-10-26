import type { ComponentSize, TableChange, TableKey, TableSorter } from '../../src/lib/components/ant-design';

export interface FixturePerson { id: number; name: string; score: number; locked?: boolean }

const people: FixturePerson[] = [
  { id: 0, name: 'Anna', score: 30 },
  { id: 1, name: 'Boris', score: 10, locked: true },
  { id: 2, name: 'Clara', score: 30 },
  { id: 3, name: 'David', score: 20 },
  { id: 4, name: 'Elena', score: 50 },
  { id: 5, name: 'Felix', score: 40 },
  { id: 6, name: 'Gala', score: 5 },
  { id: 7, name: 'Henry', score: 60 },
  { id: 8, name: 'Iris', score: 15 },
  { id: 9, name: 'John', score: 35 },
  { id: 10, name: 'Kira', score: 25 },
  { id: 11, name: 'Leon', score: 45 }
];

export function createTableControls() {
  let rows = $state(people);
  let current = $state(1);
  let pageSize = $state(3);
  let sorter = $state<TableSorter | null>(null);
  let selected = $state<TableKey[]>([]);
  let loading = $state(false);
  let noPagination = $state(false);
  let allRowsLocked = $state(false);
  let hideScore = $state(false);
  let dark = $state(false);
  let purple = $state(false);
  let compact = $state(false);
  let size = $state<ComponentSize>('middle');
  let events = $state<TableChange<FixturePerson>[]>([]);
  let selectionEvents = $state<{ keys: TableKey[]; ids: number[]; names: string[]; type: string }[]>([]);
  let action = $state('');
  let submissions = $state(0);

  return {
    defaults: people.slice(0, 4),
    get rows() { return rows; },
    get current() { return current; },
    set current(value: number) { current = value; },
    get pageSize() { return pageSize; },
    set pageSize(value: number) { pageSize = value; },
    get sorter() { return sorter; },
    set sorter(value: TableSorter | null) { sorter = value; },
    get selected() { return selected; },
    set selected(value: TableKey[]) { selected = value; },
    get loading() { return loading; },
    set loading(value: boolean) { loading = value; },
    get noPagination() { return noPagination; },
    set noPagination(value: boolean) { noPagination = value; },
    get allRowsLocked() { return allRowsLocked; },
    set allRowsLocked(value: boolean) { allRowsLocked = value; },
    get hideScore() { return hideScore; },
    get dark() { return dark; },
    set dark(value: boolean) { dark = value; },
    get purple() { return purple; },
    set purple(value: boolean) { purple = value; },
    get compact() { return compact; },
    set compact(value: boolean) { compact = value; },
    get size() { return size; },
    set size(value: ComponentSize) { size = value; },
    get events() {
      return JSON.stringify(events.map((event) => ({
        action: event.action,
        page: event.pagination.current,
        size: event.pagination.pageSize,
        total: event.pagination.total,
        sorter: event.sorter,
        ids: event.currentDataSource.map((row) => row.id)
      })));
    },
    change(event: TableChange<FixturePerson>) { events.push(event); },
    get selectionEvents() { return JSON.stringify(selectionEvents); },
    changeSelection(keys: TableKey[], records: FixturePerson[], info: { type: 'single' | 'all' }) {
      selectionEvents.push({ keys, ids: records.map((row) => row.id), names: records.map((row) => row.name), type: info.type });
    },
    setExternalState() { current = 2; pageSize = 3; sorter = { columnKey: 'score', order: 'descend' }; selected = [0, 7]; },
    setLastPage() { current = 4; },
    clearSelection() { selected = []; },
    shrinkRows() { rows = people.slice(0, 2); },
    emptyRows() { rows = []; },
    restoreRows() { rows = people; },
    replaceSelectedRecord() { rows = rows.map((row) => row.id === 0 ? { ...row, name: 'Updated Anna' } : row); },
    removeSortColumn() { hideScore = true; },
    get action() { return action; },
    inspect(row: FixturePerson, index: number) { action = `${row.id}:${row.name}:${index}`; },
    get submissions() { return submissions; },
    submit(event: SubmitEvent) { event.preventDefault(); submissions++; }
  };
}
