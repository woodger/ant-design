import { FormValidationError } from './FormValidationError';
import {
  validateValue,
  type FieldErrors,
  type FieldName,
  type FormRules,
  type FormValues
} from './validation.engine';

export type SubmissionResult<Values extends FormValues> =
  | { status: 'success' }
  | { status: 'invalid'; error: FormValidationError<Values> }
  | { status: 'failed'; error: unknown }
  | { status: 'busy' };

export interface FormInstance<Values extends FormValues> {
  readonly values: Readonly<Values>;
  readonly errors: Readonly<FieldErrors<Values>>;
  readonly isSubmitting: boolean;
  readonly submissionError: unknown;
  getFieldError(name: FieldName<Values>): readonly string[];
  isFieldTouched(name: FieldName<Values>): boolean;
  isFieldValidating(name: FieldName<Values>): boolean;
  isFieldRequired(name: FieldName<Values>): boolean;
  setFieldValue<Name extends FieldName<Values>>(name: Name, value: Values[Name]): void;
  setFieldsValue(next: Partial<Values>): void;
  touchField(name: FieldName<Values>): void;
  resetFields(): void;
  validateFields(names?: readonly FieldName<Values>[]): Promise<Values>;
  submit(onFinish: (values: Values) => void | Promise<void>): Promise<SubmissionResult<Values>>;
}

export function createForm<Values extends FormValues>({
  initialValues,
  rules = {}
}: {
  initialValues: Values;
  rules?: FormRules<Values>;
}): FormInstance<Values> {
  const defaults = { ...initialValues };
  const names = Object.keys(defaults) as FieldName<Values>[];
  const runs = new Map<FieldName<Values>, number>();
  let revision = 0;
  let request = 0;
  let values = $state<Values>({ ...defaults });
  let errors = $state<FieldErrors<Values>>({});
  let touched = $state<Partial<Record<FieldName<Values>, boolean>>>({});
  let validating = $state<Partial<Record<FieldName<Values>, boolean>>>({});
  let isSubmitting = $state(false);
  let submissionError = $state.raw<unknown>();

  async function validateFields(fields: readonly FieldName<Values>[] = names): Promise<Values> {
    const snapshot = { ...values };
    const startRevision = revision;
    const token = ++request;
    const nextErrors: FieldErrors<Values> = {};

    for (const name of fields) {
      runs.set(name, token);
      validating[name] = true;
    }

    await Promise.all(fields.map(async (name) => {
      const messages = await validateValue(snapshot[name], snapshot, rules[name] ?? []);

      if (messages.length) {
        nextErrors[name] = messages;
      }

      if (runs.get(name) === token) {
        validating[name] = false;

        if (revision === startRevision) {
          errors[name] = messages;
        }
      }
    }));

    const outOfDate = revision !== startRevision || fields.some((name) => runs.get(name) !== token);

    if (outOfDate || Object.keys(nextErrors).length) {
      throw new FormValidationError(snapshot, nextErrors, outOfDate);
    }

    return snapshot;
  }

  function revalidateTouched() {
    if (isSubmitting) {
      return;
    }

    const fields = names.filter((name) => touched[name]);

    if (fields.length) {
      void validateFields(fields).catch((error: unknown) => {
        if (!(error instanceof FormValidationError)) {
          throw error;
        }
      });
    }
  }

  return {
    get values() { return values; },
    get errors() { return errors; },
    get isSubmitting() { return isSubmitting; },
    get submissionError() { return submissionError; },
    getFieldError: (name) => errors[name] ?? [],
    isFieldTouched: (name) => touched[name] ?? false,
    isFieldValidating: (name) => validating[name] ?? false,
    isFieldRequired: (name) => rules[name]?.some((rule) => rule.required) ?? false,
    setFieldValue(name, value) {
      if (Object.is(values[name], value)) {
        return;
      }

      values[name] = value;
      errors[name] = [];
      revision++;
      submissionError = undefined;
      revalidateTouched();
    },
    setFieldsValue(next) {
      for (const name of names) {
        if (Object.hasOwn(next, name)) {
          values[name] = next[name] as Values[typeof name];
          errors[name] = [];
        }
      }

      revision++;
      submissionError = undefined;
      revalidateTouched();
    },
    touchField(name) {
      touched[name] = true;
      revalidateTouched();
    },
    resetFields() {
      revision++;
      runs.clear();
      values = { ...defaults };
      errors = {};
      touched = {};
      validating = {};
      submissionError = undefined;
    },
    validateFields,
    async submit(onFinish) {
      if (isSubmitting) {
        return { status: 'busy' };
      }

      isSubmitting = true;
      submissionError = undefined;

      for (const name of names) {
        touched[name] = true;
      }

      try {
        const result = await validateFields();

        await onFinish(result);

        return { status: 'success' };
      } catch (error) {
        if (error instanceof FormValidationError) {
          return { status: 'invalid', error };
        }

        submissionError = error;

        return { status: 'failed', error };
      } finally {
        isSubmitting = false;
      }
    }
  };
}
