import { createForm } from '../../src/lib/components/ant-design';

interface ValidationRequest {
  id: number;
  value: string;
  resolve: (message: string | undefined) => void;
}

export function createControls() {
  let input = $state<string | undefined>();
  let changes = $state(0);
  let selection = $state<string | undefined>('alpha');
  let numeric = $state<number | undefined>(0);
  let nativeValue = $state('');
  let selectDisabled = $state(false);
  let allDisabled = $state(false);
  let rtl = $state(false);
  let english = $state(false);
  let modalOpen = $state(false);
  let modalMounted = $state(true);
  let modalLoading = $state(false);
  let holdConfirmation = $state(false);
  let modalResolution = $state.raw<(() => void) | undefined>();
  let cancelled = $state(0);
  let confirmed = $state(0);
  let keyboard = $state(true);
  let maskClosable = $state(true);
  let modalSelection = $state<string | undefined>();
  let asyncValidation = $state(false);
  let horizontalForm = $state(false);
  let nextValidation = 0;
  let validations = $state<ValidationRequest[]>([]);
  let holdSubmission = $state(false);
  let submission = $state.raw<{ resolve: () => void; reject: (error: Error) => void }>();
  let finished = $state(0);
  let saved = $state('');
  let submitErrors = $state(0);

  const form = createForm({
    initialValues: { name: 'Anna', password: '', confirmation: '' },
    rules: {
      name: [
        { required: true, message: 'Name is required' },
        {
          validator(value) {
            if (asyncValidation) {
              return new Promise<string | undefined>((resolve) => {
                validations.push({ id: ++nextValidation, value: String(value), resolve });
              });
            }
          }
        }
      ],
      confirmation: [{ validator: (value, values) => value === values.password ? undefined : 'Passwords differ' }]
    }
  });

  function resolveValidation(id: number, message?: string) {
    const request = validations.find((item) => item.id === id);
    validations = validations.filter((item) => item.id !== id);
    request?.resolve(message);
  }

  return {
    form,
    get input() { return input; },
    set input(value: string | undefined) { input = value; },
    get changes() { return changes; },
    changeInput() { changes++; },
    replaceInput() { input = 'Parent value'; },
    clearInput() { input = undefined; },
    get selection() { return selection; },
    set selection(value: string | undefined) { selection = value; },
    clearSelection() { selection = undefined; },
    get numeric() { return numeric; },
    set numeric(value: number | undefined) { numeric = value; },
    get nativeValue() { return nativeValue; },
    recordNativeValue(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      nativeValue = String(new FormData(event.currentTarget).get('number'));
    },
    get selectDisabled() { return selectDisabled; },
    toggleSelectDisabled() { selectDisabled = !selectDisabled; },
    get allDisabled() { return allDisabled; },
    set allDisabled(value: boolean) { allDisabled = value; },
    get rtl() { return rtl; },
    set rtl(value: boolean) { rtl = value; },
    get english() { return english; },
    set english(value: boolean) { english = value; },
    get modalOpen() { return modalOpen; },
    set modalOpen(value: boolean) { modalOpen = value; },
    get modalMounted() { return modalMounted; },
    get modalLoading() { return modalLoading; },
    get holdConfirmation() { return holdConfirmation; },
    set holdConfirmation(value: boolean) { holdConfirmation = value; },
    get hasConfirmation() { return Boolean(modalResolution); },
    get cancelled() { return cancelled; },
    get confirmed() { return confirmed; },
    get keyboard() { return keyboard; },
    set keyboard(value: boolean) { keyboard = value; },
    get maskClosable() { return maskClosable; },
    set maskClosable(value: boolean) { maskClosable = value; },
    get modalSelection() { return modalSelection; },
    set modalSelection(value: string | undefined) { modalSelection = value; },
    openModal() { modalMounted = true; modalOpen = true; },
    unmountModal() { modalMounted = false; modalOpen = false; },
    cancelModal() { cancelled++; },
    async confirmModal() {
      if (holdConfirmation) {
        modalLoading = true;

        await new Promise<void>((resolve) => { modalResolution = resolve; });

        modalResolution = undefined;
        modalLoading = false;
      }

      confirmed++;
      modalOpen = false;
    },
    completeConfirmation() { modalResolution?.(); },
    get asyncValidation() { return asyncValidation; },
    set asyncValidation(value: boolean) { asyncValidation = value; },
    get horizontalForm() { return horizontalForm; },
    set horizontalForm(value: boolean) { horizontalForm = value; },
    get validations() { return validations; },
    resolveValidation,
    rejectValidations() {
      for (const request of validations) {
        resolveValidation(request.id, `Rejected ${request.value}`);
      }
    },
    get holdSubmission() { return holdSubmission; },
    set holdSubmission(value: boolean) { holdSubmission = value; },
    get hasSubmission() { return Boolean(submission); },
    get finished() { return finished; },
    get saved() { return saved; },
    get submitErrors() { return submitErrors; },
    onSubmitError() { submitErrors++; },
    async finishForm(values: typeof form.values) {
      finished++;

      if (holdSubmission) {
        await new Promise<void>((resolve, reject) => { submission = { resolve, reject }; });
      }

      saved = values.name;
    },
    completeSubmission() {
      submission?.resolve();
      submission = undefined;
    },
    failSubmission() {
      submission?.reject(new Error('Save failed'));
      submission = undefined;
    }
  };
}
