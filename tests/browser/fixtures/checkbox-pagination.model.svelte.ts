import { createForm } from 'antd-svelte';

export function createCheckboxPaginationControls() {
  let checked = $state<boolean | undefined>();
  let indeterminate = $state(true);
  let checkboxChanges = $state<boolean[]>([]);
  let nativeValue = $state('');
  let defaultChanges = $state(0);
  let finished = $state(0);
  let total = $state(237);
  let current = $state(1);
  let pageSize = $state(10);
  let hideOnSinglePage = $state(false);
  let events = $state<string[]>([]);
  let nativeSubmissions = $state(0);

  const form = createForm<{ accepted: boolean }>({
    initialValues: { accepted: false },
    rules: { accepted: [{ validator: (value) => value === true ? undefined : 'Accept the terms' }] }
  });

  return {
    form,
    get checked() { return checked; },
    set checked(value: boolean | undefined) { checked = value; },
    get indeterminate() { return indeterminate; },
    set indeterminate(value: boolean) { indeterminate = value; },
    get checkboxChanges() { return checkboxChanges.join(','); },
    changeCheckbox(value: boolean) { checkboxChanges.push(value); },
    setCheckbox() {
      checked = true;
      indeterminate = true;
    },
    clearCheckbox() {
      checked = false;
      indeterminate = false;
    },
    get nativeValue() { return nativeValue; },
    get defaultChanges() { return defaultChanges; },
    changeDefault() { defaultChanges++; },
    readCheckbox(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      nativeValue = String(new FormData(event.currentTarget).get('choice'));
    },
    get finished() { return finished; },
    finishForm() { finished++; },
    get total() { return total; },
    get current() { return current; },
    set current(value: number) { current = value; },
    get pageSize() { return pageSize; },
    set pageSize(value: number) { pageSize = value; },
    get hideOnSinglePage() { return hideOnSinglePage; },
    set hideOnSinglePage(value: boolean) { hideOnSinglePage = value; },
    get events() { return events.join(';'); },
    changePage(page: number, size: number) { events.push(`change:${page}:${size}`); },
    changeSize(page: number, size: number) { events.push(`size:${page}:${size}`); },
    shrinkTotal() { total = 15; },
    emptyTotal() { total = 0; },
    largeTotal() {
      total = Number.MAX_SAFE_INTEGER;
      pageSize = 1;
      current = 1000;
    },
    invalidInputs() {
      total = Number.NaN;
      current = -5;
      pageSize = 0;
    },
    setPage() { current = 24; },
    setSize() { pageSize = 50; },
    get nativeSubmissions() { return nativeSubmissions; },
    submitNative(event: SubmitEvent) {
      event.preventDefault();
      nativeSubmissions++;
    }
  };
}
