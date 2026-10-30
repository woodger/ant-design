import type { FieldErrors, FormValues } from './validation.engine';

export class FormValidationError<Values extends FormValues = FormValues> extends Error {
  constructor(
    readonly values: Readonly<Values>,
    readonly errors: FieldErrors<Values>,
    readonly outOfDate = false
  ) {
    super(outOfDate ? 'Form values changed during validation' : 'Form validation failed');
    this.name = 'FormValidationError';
  }
}
