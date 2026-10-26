export type FormValue = string | number | boolean | null | undefined;
export type FormValues = Record<string, FormValue>;
export type FieldName<Values> = Extract<keyof Values, string>;

export interface ValidationRule<Values extends FormValues = FormValues> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (value: FormValue, values: Readonly<Values>) => string | void | Promise<string | void>;
}

export type FormRules<Values extends FormValues> = Partial<
  Record<FieldName<Values>, readonly ValidationRule<Values>[]>
>;

export type FieldErrors<Values extends FormValues> = Partial<Record<FieldName<Values>, string[]>>;

export async function validateValue<Values extends FormValues>(
  value: FormValue,
  values: Readonly<Values>,
  rules: readonly ValidationRule<Values>[]
): Promise<string[]> {
  const errors: string[] = [];
  const empty = value === null || value === undefined || (typeof value === 'string' && !value.trim());

  for (const rule of rules) {
    if (empty && rule.required) {
      errors.push(rule.message ?? 'Заполните это поле.');
      continue;
    }

    if (empty && !rule.validator) {
      continue;
    }

    const length = typeof value === 'string' ? [...value].length : typeof value === 'number' ? value : undefined;

    if (length !== undefined && rule.min !== undefined && length < rule.min) {
      errors.push(rule.message ?? `Минимальное значение: ${rule.min}.`);
      continue;
    }

    if (length !== undefined && rule.max !== undefined && length > rule.max) {
      errors.push(rule.message ?? `Максимальное значение: ${rule.max}.`);
      continue;
    }

    if (!empty && rule.pattern && !new RegExp(rule.pattern.source, rule.pattern.flags).test(String(value))) {
      errors.push(rule.message ?? 'Проверьте формат значения.');
      continue;
    }

    if (rule.validator) {
      try {
        const message = await rule.validator(value, values);

        if (message) {
          errors.push(message);
        }
      } catch (error) {
        errors.push(rule.message ?? (error instanceof Error ? error.message : 'Проверьте значение.'));
      }
    }
  }

  return errors;
}
