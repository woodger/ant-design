import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { FormValidationError } from './FormValidationError';
import type { FormInstance } from './form.model.svelte';
import type { FormValues } from './validation.engine';

export interface FormProps<Values extends FormValues> extends Omit<HTMLFormAttributes, 'children' | 'onsubmit' | 'onreset' | 'class'> {
  form: FormInstance<Values>;
  children: Snippet;
  layout?: 'vertical' | 'horizontal';
  disabled?: boolean;
  onFinish?: (values: Values) => void | Promise<void>;
  onFinishFailed?: (error: FormValidationError<Values>) => void;
  onError?: (error: unknown) => void;
  class?: string;
}
