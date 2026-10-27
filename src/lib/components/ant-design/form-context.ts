import { getContext, setContext } from 'svelte';

export interface FormContext {
  readonly disabled: boolean;
  readonly layout: 'vertical' | 'horizontal';
  readonly resetKey?: object;
  getFieldError(name: string): readonly string[];
  isFieldRequired(name: string): boolean;
  touchField(name: string): void;
}

export interface FormFieldContext {
  readonly id: string;
  readonly name: string;
  readonly label?: string;
  readonly disabled: boolean | undefined;
  readonly required: boolean;
  readonly status: 'error' | undefined;
  readonly describedBy: string | undefined;
  onBlur(): void;
}

const formKey = Symbol('ant-design-form');
const fieldKey = Symbol('ant-design-form-field');

export function provideForm(form: FormContext) {
  setContext(formKey, form);
}

export function useForm(): FormContext | undefined {
  return getContext(formKey);
}

export function provideFormField(field: FormFieldContext) {
  setContext(fieldKey, field);
}

export function useFormField(): FormFieldContext | undefined {
  return getContext(fieldKey);
}
