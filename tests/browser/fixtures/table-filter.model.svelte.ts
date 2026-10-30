import type { TableChange, TableFilters, TableKey, TableSorter } from 'antd-svelte';

export interface FilterPerson {
  key: number;
  name: string;
  team: string;
  score: number;
  active: boolean
}

const people: FilterPerson[] = [
  { key: 0, name: 'Aster', team: 'Core', score: 30, active: true },
  { key: 1, name: 'Birch', team: 'Design', score: 10, active: false },
  { key: 2, name: 'Cedar', team: 'Core', score: 30, active: true },
  { key: 3, name: 'Dahlia', team: 'Support', score: 20, active: true },
  { key: 4, name: 'Elm', team: 'Design', score: 50, active: true },
  { key: 5, name: 'Fern', team: 'Core', score: 40, active: false },
  { key: 6, name: 'Ginger', team: 'Support', score: 0, active: true },
  { key: 7, name: 'Hazel', team: 'Core', score: 60, active: true }
];

export function createTableFilterControls() {
  let current = $state(1);
  let pageSize = $state(2);
  let sorter = $state<TableSorter | null>(null);
  let filters = $state<TableFilters>({});
  let selected = $state<TableKey[]>([]);
  let rows = $state(people);
  let changes = $state<TableChange<FilterPerson>[]>([]);
  let selections = $state<{ keys: TableKey[]; names: string[] }[]>([]);
  let hideTeam = $state(false);
  let limitedTeams = $state(false);
  let loading = $state(false);
  let dark = $state(false);
  let purple = $state(false);
  let modal = $state(false);
  let submissions = $state(0);

  return {
    people,
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
    get rows() { return rows; },
    get hideTeam() { return hideTeam; },
    get limitedTeams() { return limitedTeams; },
    get loading() { return loading; },
    get dark() { return dark; },
    set dark(value: boolean) { dark = value; },
    get purple() { return purple; },
    set purple(value: boolean) { purple = value; },
    get modal() { return modal; },
    set modal(value: boolean) { modal = value; },
    openModal() { modal = true; },
    get events() {
      return JSON.stringify(
        changes.map(
          (change) =>
          ({
            action: change.action,
            pagination: change.pagination,
            sorter: change.sorter,
            filters: change.filters,
            keys: change.currentDataSource.map((row) => row.key)
          })
        )
      );
    },
    change(event: TableChange<FilterPerson>) { changes.push(event); },
    get selections() { return JSON.stringify(selections); },
    changeSelection(keys: TableKey[], records: FilterPerson[]) {
      selections
        .push({
          keys,
          names: records
            .map((
              row
            ) =>
              row.name)
        });
    },
    setPage() { current = 4; },
    setExternalFilters() { filters = { team: ['Core'], active: [false] }; },
    clearFilters() { filters = {}; },
    get submissions() { return submissions; },
    submit(event: SubmitEvent) {
      event.preventDefault();
      submissions++;
    },
    toggleLoading() { loading = !loading; },
    removeTeam() { hideTeam = true; },
    restoreTeam() { hideTeam = false; },
    limitTeams() { limitedTeams = true; },
    replaceRows() { rows = rows.map((row) => row.key === 0 ? { ...row, name: 'New Aster' } : row); }
  };
}
