import { getContext, setContext } from 'svelte';
import type { RadioValue } from './radio.types';

interface RadioGroupContext {
  readonly value: RadioValue | undefined;
  readonly defaultValue: RadioValue | undefined;
  readonly name: string;
  readonly disabled: boolean;
  readonly required: boolean;
  select(value: RadioValue): void;
}

const groupKey = Symbol('ant-design-radio-group');

export function provideRadioGroup(group: RadioGroupContext) {
  setContext(groupKey, group);
}

export function useRadioGroup(): RadioGroupContext | undefined {
  return getContext(groupKey);
}
