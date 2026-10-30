import type { TableChange, TableFilters, TableKey, TableSorter } from 'antd-svelte';

export interface ExpandedPerson {
  key: number;
  name: string;
  team: string;
  score: number
}

const people: ExpandedPerson[] = [
  'Aster',
  'Birch',
  'Cedar',
  'Dahlia',
  'Elm',
  'Fir',
  'Ginger',
  'Hazel'
]
  .map(
    (name, key) =>
    ({
      key,
      name,
      team: key % 2 ? 'Support' : 'Core',
      score: [30, 10, 40, 20, 50, 25, 35, 15][key]
    })
  );

export function createExpansionControls() {
  let rows = $state(people);
  let current = $state(1);
  let sorter = $state<TableSorter | null>(null);
  let filters = $state<TableFilters>({});
  let expanded = $state<TableKey[]>([]);
  let selected = $state<TableKey[]>([]);
  let enabled = $state(true);
  let locked = $state(false);
  let loading = $state(false);
  let selection = $state(true);
  let fixed = $state(true);
  let noPagination = $state(false);
  let server = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let events = $state<object[]>([]);
  let dataEvents = $state<object[]>([]);
  let selections = $state(0);
  let submissions = $state(0);
  let inspected = $state(-1);

  return {
    defaults: people.slice(0, 2),
    get rows() { return rows; },
    get current() { return current; },
    set current(value: number) { current = value; },
    get sorter() { return sorter; },
    set sorter(value: TableSorter | null) { sorter = value; },
    get filters() { return filters; },
    set filters(value: TableFilters) { filters = value; },
    get expanded() { return expanded; },
    set expanded(value: TableKey[]) { expanded = value; },
    get selected() { return selected; },
    set selected(value: TableKey[]) { selected = value; },
    get enabled() { return enabled; },
    set enabled(value: boolean) { enabled = value; },
    get locked() { return locked; },
    set locked(value: boolean) { locked = value; },
    get loading() { return loading; },
    set loading(value: boolean) { loading = value; },
    get selection() { return selection; },
    set selection(value: boolean) { selection = value; },
    get fixed() { return fixed; },
    set fixed(value: boolean) { fixed = value; },
    get noPagination() { return noPagination; },
    set noPagination(value: boolean) { noPagination = value; },
    get server() { return server; },
    get dark() { return dark; },
    set dark(value: boolean) { dark = value; },
    get compact() { return compact; },
    set compact(value: boolean) { compact = value; },
    get events() { return JSON.stringify(events); },
    expand(value: boolean, record: ExpandedPerson) {
      events.push(
        {
          type: 'expand',
          expanded: value,
          key: record.key,
          name: record.name,
          owner: [...expanded]
        }
      );
    },
    changeKeys(keys: TableKey[]) { events.push({ type: 'keys', keys }); },
    get dataEvents() { return JSON.stringify(dataEvents); },
    change(event: TableChange<ExpandedPerson>) {
      dataEvents.push(
        {
          action: event.action,
          pagination: event.pagination,
          ids: event.currentDataSource.map((row) => row.key)
        }
      );
    },
    get selections() { return selections; },
    select() { selections++; },
    get submissions() { return submissions; },
    submit(event: SubmitEvent) {
      event.preventDefault();
      submissions++;
    },
    get inspected() { return inspected; },
    inspect(key: number) { inspected = key; },
    openExternal() { expanded = [0, 3, 99]; },
    clearExternal() { expanded = []; },
    replaceZero() {
      rows = rows.map((row) => row.key === 0 ? { ...row, name: 'Updated Aster' } : row);
    },
    emptyRows() { rows = []; },
    restoreRows() {
      rows = people;
      server = false;
      current = 1;
    },
    serverPage() {
      rows = people.slice(3, 6);
      server = true;
      current = 4;
    }
  };
}
