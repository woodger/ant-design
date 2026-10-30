import type { TableChange, TableKey, TableSorter } from 'antd-svelte';

export interface FixedPerson {
  key: number;
  name: string;
  team: string;
  notes: string;
  score: number
}

export function createFixedTableControls() {
  const rows: FixedPerson[] = Array.from(
    { length: 24 },
    (_, index) =>
    ({
      key: index + 1,
      name: `Pinned ${index + 1}`,
      team: index % 2 ? 'East' : 'West',
      notes: `Scrollable content for record ${index + 1}`,
      score: 24 - index
    })
  );
  let pinned = $state(true);
  let selectionFixed = $state(true);
  let pinTeam = $state(false);
  let header = $state(true);
  let mounted = $state(true);
  let empty = $state(false);
  let loading = $state(false);
  let server = $state(false);
  let paginated = $state(false);
  let hideName = $state(false);
  let nameWidth = $state<number | string>(140);
  let selected = $state<TableKey[]>([]);
  let current = $state(1);
  let sorter = $state<TableSorter | null>(null);
  let events = $state<TableChange<FixedPerson>[]>([]);
  let selections = $state(0);
  let inspected = $state(0);
  let dark = $state(false);

  return {
    rows,
    get pinned() { return pinned; },
    set pinned(value: boolean) { pinned = value; },
    get selectionFixed() { return selectionFixed; },
    set selectionFixed(value: boolean) { selectionFixed = value; },
    get pinTeam() { return pinTeam; },
    set pinTeam(value: boolean) { pinTeam = value; },
    get header() { return header; },
    set header(value: boolean) { header = value; },
    get mounted() { return mounted; },
    set mounted(value: boolean) { mounted = value; },
    get empty() { return empty; },
    set empty(value: boolean) { empty = value; },
    get loading() { return loading; },
    set loading(value: boolean) { loading = value; },
    get server() { return server; },
    set server(value: boolean) { server = value; },
    get paginated() { return paginated; },
    set paginated(value: boolean) { paginated = value; },
    get hideName() { return hideName; },
    set hideName(value: boolean) { hideName = value; },
    get nameWidth() { return nameWidth; },
    widenName() { nameWidth = '18rem'; },
    get selected() { return selected; },
    set selected(value: TableKey[]) { selected = value; },
    get current() { return current; },
    set current(value: number) { current = value; },
    get sorter() { return sorter; },
    set sorter(value: TableSorter | null) { sorter = value; },
    get events() {
      return JSON.stringify(
        events.map(
          (event) =>
          ({
            action: event.action,
            pagination: event.pagination,
            sorter: event.sorter,
            filters: event.filters,
            ids: event.currentDataSource.map((row) => row.key)
          })
        )
      );
    },
    change(event: TableChange<FixedPerson>) { events.push(event); },
    get selections() { return selections; },
    select() { selections++; },
    get inspected() { return inspected; },
    inspect(key: number) { inspected = key; },
    get dark() { return dark; },
    set dark(value: boolean) { dark = value; }
  };
}
