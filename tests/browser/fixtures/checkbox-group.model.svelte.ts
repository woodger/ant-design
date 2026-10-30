import { createForm, type CheckboxGroupOption, type CheckboxGroupValue } from 'antd-svelte';

export function createCheckboxGroups() {
  const base: CheckboxGroupOption<number>[] = [
    { value: 0, label: 'Group zero' },
    { value: 1, label: 'Group locked', disabled: true },
    { value: 2, label: 'Group two' },
    { value: 3, label: 'Group three' }
  ];
  let value = $state<number[]>([0]);
  let mixed = $state<CheckboxGroupValue[]>([]);
  let defaults = $state([0, 2]);
  let changes = $state<number[][]>([]);
  let defaultChanges = $state(0);
  let lockTwo = $state(false);
  let hideZero = $state(false);
  let reverse = $state(false);
  let renamed = $state(false);
  let empty = $state(false);
  let allLocked = $state(false);
  let groupDisabled = $state(false);
  let mutateCallback = $state(false);
  let cancelReset = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let data = $state('');
  let externalData = $state('');
  let saved = $state<number[]>([]);
  let finishes = $state(0);
  let formDisabled = $state(false);
  let emptyForm = $state(false);
  const form = createForm<{ roles: number[] }>({
    initialValues: { roles: [] },
    rules: {
      roles: [
        { required: true, message: 'Choose a group role' },
        { min: 2, max: 3, message: 'Choose two or three group roles' }
      ]
    }
  });

  return {
    base,
    form,
    get options() {
      const items = empty
        ? []
        : base.filter((option) => !hideZero || option.value !== 0)
          .map((option) => ({
            ...option,
            label: renamed && option.value === 0 ? 'Renamed group zero' : option.label,
            disabled: allLocked || option.disabled || lockTwo && option.value === 2
          }));

      return reverse ? items.reverse() : items;
    },
    get value() { return value; },
    set value(next: number[]) { value = next; },
    get mixed() { return mixed; },
    set mixed(next: CheckboxGroupValue[]) { mixed = next; },
    get defaults() { return defaults; },
    get changes() { return JSON.stringify(changes); },
    change(next: number[]) {
      changes.push([...next]);
      if (mutateCallback) next.push(99);
    },
    get defaultChanges() { return defaultChanges; },
    changeDefault() { defaultChanges++; },
    replaceDefaults() { defaults = [3]; },
    replaceValue() { value = [3, 0, 3, 99]; },
    clearValue() { value = []; },
    get lockTwo() { return lockTwo; },
    set lockTwo(next: boolean) { lockTwo = next; },
    get hideZero() { return hideZero; },
    set hideZero(next: boolean) { hideZero = next; },
    get reverse() { return reverse; },
    set reverse(next: boolean) { reverse = next; },
    get renamed() { return renamed; },
    set renamed(next: boolean) { renamed = next; },
    get empty() { return empty; },
    set empty(next: boolean) { empty = next; },
    get allLocked() { return allLocked; },
    set allLocked(next: boolean) { allLocked = next; },
    get groupDisabled() { return groupDisabled; },
    set groupDisabled(next: boolean) { groupDisabled = next; },
    get mutateCallback() { return mutateCallback; },
    set mutateCallback(next: boolean) { mutateCallback = next; },
    get cancelReset() { return cancelReset; },
    set cancelReset(next: boolean) { cancelReset = next; },
    get mounted() { return mounted; },
    set mounted(next: boolean) { mounted = next; },
    get dark() { return dark; },
    set dark(next: boolean) { dark = next; },
    get compact() { return compact; },
    set compact(next: boolean) { compact = next; },
    get data() { return data; },
    read(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      data = JSON.stringify(
        {
          choices: values.getAll('groupChoices'),
          defaults: values.getAll('groupDefaults')
        }
      );
    },
    reset(event: Event) { if (cancelReset) event.preventDefault(); },
    get externalData() { return externalData; },
    readExternal(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      externalData = JSON.stringify(new FormData(event.currentTarget).getAll('externalGroup'));
    },
    get saved() { return JSON.stringify(saved); },
    get finishes() { return finishes; },
    finish(values: { roles: number[] }) {
      saved = [...values.roles];
      finishes++;
    },
    get formDisabled() { return formDisabled; },
    set formDisabled(next: boolean) { formDisabled = next; },
    get emptyForm() { return emptyForm; },
    set emptyForm(next: boolean) { emptyForm = next; },
    replaceForm() { form.setFieldsValue({ roles: [0, 2, 3, 99] }); }
  };
}
