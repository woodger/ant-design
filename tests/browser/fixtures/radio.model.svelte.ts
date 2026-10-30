import { createForm, type RadioOption, type RadioValue } from 'antd-svelte';

export function createRadios() {
  const base: RadioOption<number>[] = [
    { value: 0, label: 'Radio zero' },
    { value: 1, label: 'Radio locked', disabled: true },
    { value: 2, label: 'Radio two' },
    { value: 3, label: 'Radio three' }
  ];
  let bound = $state<boolean | undefined>();
  let peer = $state<boolean | undefined>();
  let choice = $state<number | undefined>(0);
  let mixed = $state<RadioValue | undefined>();
  let defaults = $state(2);
  let singleEvents = $state<string[]>([]);
  let groupEvents = $state<number[]>([]);
  let defaultChanges = $state(0);
  let disabled = $state(false);
  let locked = $state(false);
  let hidden = $state(false);
  let renamed = $state(false);
  let reversed = $state(false);
  let empty = $state(false);
  let allLocked = $state(false);
  let mounted = $state(true);
  let singlesMounted = $state(true);
  let cancelReset = $state(false);
  let required = $state(false);
  let vertical = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let data = $state('');
  let externalData = $state('');
  let formDisabled = $state(false);
  let emptyForm = $state(false);
  let saved = $state('');
  let finishes = $state(0);
  const form = createForm<{
    choice: number | undefined;
    decision: boolean | undefined;
    accepted: boolean
  }>({
    initialValues: { choice: undefined, decision: false, accepted: false },
    rules: {
      choice: [
        { required: true, message: 'Choose a radio role' },
        { validator: (value) => value === 3 ? 'Choose zero or two' : undefined }
      ],
      decision: [{ required: true, message: 'Choose a radio decision' }],
      accepted: [{ validator: (value) => value === true ? undefined : 'Accept radio consent' }]
    }
  });

  return {
    base,
    form,
    get options() {
      const items = empty
        ? []
        : base.filter((option) => !hidden || option.value !== 0)
          .map((option) => ({
            ...option,
            label: renamed && option.value === 0 ? 'Renamed radio zero' : option.label,
            disabled: allLocked || option.disabled || locked && option.value === 2
          }));

      return reversed ? items.reverse() : items;
    },
    get bound() { return bound; },
    set bound(next: boolean | undefined) { bound = next; },
    get peer() { return peer; },
    set peer(next: boolean | undefined) { peer = next; },
    get choice() { return choice; },
    set choice(next: number | undefined) { choice = next; },
    get mixed() { return mixed; },
    set mixed(next: RadioValue | undefined) { mixed = next; },
    get defaults() { return defaults; },
    get singleEvents() { return JSON.stringify(singleEvents); },
    get groupEvents() { return JSON.stringify(groupEvents); },
    get defaultChanges() { return defaultChanges; },
    changeBound(checked: boolean) { singleEvents.push(`bound:${checked}`); },
    changePeer(checked: boolean) { singleEvents.push(`peer:${checked}`); },
    changeChoice(value: number) { groupEvents.push(value); },
    changeDefault() { defaultChanges++; },
    selectBound() { bound = true; },
    selectPeer() { peer = true; },
    setChoice() { choice = 3; },
    clearChoice() { choice = undefined; },
    setMissing() { choice = 99; },
    replaceDefaults() { defaults = 0; },
    get disabled() { return disabled; },
    set disabled(next: boolean) { disabled = next; },
    get locked() { return locked; },
    set locked(next: boolean) { locked = next; },
    get hidden() { return hidden; },
    set hidden(next: boolean) { hidden = next; },
    get renamed() { return renamed; },
    set renamed(next: boolean) { renamed = next; },
    get reversed() { return reversed; },
    set reversed(next: boolean) { reversed = next; },
    get empty() { return empty; },
    set empty(next: boolean) { empty = next; },
    get allLocked() { return allLocked; },
    set allLocked(next: boolean) { allLocked = next; },
    get mounted() { return mounted; },
    set mounted(next: boolean) { mounted = next; },
    get singlesMounted() { return singlesMounted; },
    set singlesMounted(next: boolean) { singlesMounted = next; },
    get cancelReset() { return cancelReset; },
    set cancelReset(next: boolean) { cancelReset = next; },
    get required() { return required; },
    set required(next: boolean) { required = next; },
    get vertical() { return vertical; },
    set vertical(next: boolean) { vertical = next; },
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
          number: values.get('numberChoice'),
          single: values.get('standalone'),
          defaults: values.get('defaultRadio'),
          defaultGroup: values.get('defaultGroup')
        }
      );
    },
    reset(event: Event) { if (cancelReset) event.preventDefault(); },
    get externalData() { return externalData; },
    readExternal(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      externalData = String(new FormData(event.currentTarget).get('numberChoice'));
    },
    get formDisabled() { return formDisabled; },
    set formDisabled(next: boolean) { formDisabled = next; },
    get emptyForm() { return emptyForm; },
    set emptyForm(next: boolean) { emptyForm = next; },
    get saved() { return saved; },
    get finishes() { return finishes; },
    finish(values: typeof form.values) {
      saved = JSON.stringify(values);
      finishes++;
    },
    clearDecision() { form.setFieldValue('decision', undefined); }
  };
}
