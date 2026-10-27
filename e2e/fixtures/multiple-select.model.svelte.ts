import { createForm, type SelectOption } from '../../src/lib/components/ant-design';

export function createMultipleControls() {
  const base: SelectOption<number>[] = [{ value: 0, label: 'Zero' }, { value: 1, label: 'Locked one', disabled: true }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }];
  let values = $state<number[]>([0]);
  let strings = $state<string[]>([]);
  let search = $state(true);
  let allowClear = $state(true);
  let required = $state(false);
  let lockTwo = $state(false);
  let hideZero = $state(false);
  let updatedLabel = $state(false);
  let noOptions = $state(false);
  let allLocked = $state(false);
  let mutateCallback = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let events = $state<number[][]>([]);
  let opens = $state<boolean[]>([]);
  let defaultChanges = $state(0);
  let native = $state('');
  let nativeReads = $state(0);
  let external = $state('');
  let saved = $state<number[]>([]);
  let finishes = $state(0);
  let holdValidation = $state(false);
  let validations = $state<{ id: number; values: number[]; resolve: (message?: string) => void }[]>([]);
  let nextValidation = 0;
  let modalOpen = $state(false);
  let dialogValues = $state<number[]>([]);
  const form = createForm<{ roles: number[] }>({
    initialValues: { roles: [0] },
    rules: { roles: [
      { required: true, message: 'Select at least one role' },
      { min: 2, max: 3, message: 'Select two or three roles' },
      { validator: (value) => holdValidation ? new Promise<string | undefined>((resolve) => { validations.push({ id: ++nextValidation, values: Array.isArray(value) ? [...value] : [], resolve }); }) : undefined }
    ] }
  });

  return {
    base,
    form,
    get options() { return noOptions ? [] : base.filter((option) => !hideZero || option.value !== 0).map((option) => ({ ...option, label: option.value === 0 && updatedLabel ? 'Updated zero' : option.label, disabled: allLocked || option.disabled || (lockTwo && option.value === 2) })); },
    get values() { return values; },
    set values(value: number[]) { values = value; },
    get strings() { return strings; },
    set strings(value: string[]) { strings = value; },
    get search() { return search; },
    set search(value: boolean) { search = value; },
    get allowClear() { return allowClear; },
    set allowClear(value: boolean) { allowClear = value; },
    get required() { return required; },
    set required(value: boolean) { required = value; },
    get lockTwo() { return lockTwo; },
    set lockTwo(value: boolean) { lockTwo = value; },
    get hideZero() { return hideZero; },
    set hideZero(value: boolean) { hideZero = value; },
    get updatedLabel() { return updatedLabel; },
    set updatedLabel(value: boolean) { updatedLabel = value; },
    get noOptions() { return noOptions; },
    set noOptions(value: boolean) { noOptions = value; },
    get allLocked() { return allLocked; },
    set allLocked(value: boolean) { allLocked = value; },
    get mutateCallback() { return mutateCallback; },
    set mutateCallback(value: boolean) { mutateCallback = value; },
    get mounted() { return mounted; },
    set mounted(value: boolean) { mounted = value; },
    get dark() { return dark; },
    set dark(value: boolean) { dark = value; },
    get compact() { return compact; },
    set compact(value: boolean) { compact = value; },
    get events() { return JSON.stringify(events); },
    change(next: number[]) { events.push([...next]); if (mutateCallback) next.push(99); },
    get opens() { return JSON.stringify(opens); },
    open(next: boolean) { opens.push(next); },
    setExternal() { values = [2, 0, 2]; },
    clearExternal() { values = []; },
    get defaultChanges() { return defaultChanges; },
    changeDefault() { defaultChanges++; },
    get native() { return native; },
    get nativeReads() { return nativeReads; },
    readNative(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      native = JSON.stringify({ choices: data.getAll('choices'), defaults: data.getAll('nativeDefaults') });
      nativeReads++;
    },
    get external() { return external; },
    readExternal(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) { event.preventDefault(); external = JSON.stringify(new FormData(event.currentTarget).getAll('external')); },
    get saved() { return JSON.stringify(saved); },
    get finishes() { return finishes; },
    finish(values: { roles: number[] }) { saved = [...values.roles]; finishes++; },
    replaceForm() { form.setFieldsValue({ roles: [2, 3] }); },
    get holdValidation() { return holdValidation; },
    set holdValidation(value: boolean) { holdValidation = value; },
    get validations() { return validations; },
    completeValidation(id: number) { const pending = validations.find((request) => request.id === id); validations = validations.filter((request) => request.id !== id); pending?.resolve(); },
    get modalOpen() { return modalOpen; },
    set modalOpen(value: boolean) { modalOpen = value; },
    get dialogValues() { return dialogValues; },
    set dialogValues(value: number[]) { dialogValues = value; }
  };
}
