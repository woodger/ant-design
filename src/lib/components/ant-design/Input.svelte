<script lang="ts">
  import { untrack } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { useConfig } from './config-context';
  import { useFormField } from './form-context';
  import type { ComponentSize } from './types';

  export interface InputProps extends Omit<HTMLInputAttributes, 'value' | 'size' | 'class' | 'onchange' | 'type'> {
    value?: string;
    defaultValue?: string;
    size?: ComponentSize;
    status?: 'error' | 'warning';
    onValueChange?: (value: string) => void;
    onchange?: HTMLInputAttributes['onchange'];
    class?: string;
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  }

  let {
    defaultValue,
    value = $bindable(),
    size,
    status,
    disabled,
    id,
    name,
    type = 'text',
    onValueChange,
    oninput,
    onblur,
    class: className = '',
    ...attributes
  }: InputProps = $props();

  const config = useConfig();
  const field = useFormField();
  const initialDefault = untrack(() => defaultValue);
  let useDefault = $state(true);
  let resolvedSize = $derived(size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    useDefault = false;
    value = event.currentTarget.value;
    onValueChange?.(value);
    oninput?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    field?.onBlur();
    onblur?.(event);
  }
</script>

<input
  {...attributes}
  id={id ?? field?.id}
  name={name ?? field?.name}
  {type}
  value={value ?? (useDefault ? initialDefault : '') ?? ''}
  required={attributes.required ?? field?.required}
  disabled={disabled ?? field?.disabled ?? config.componentDisabled}
  aria-invalid={resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
  aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
  oninput={handleInput}
  onblur={handleBlur}
  class={[
    'ant-input',
    'ant-input-outlined',
    resolvedSize === 'large' && 'ant-input-lg',
    resolvedSize === 'small' && 'ant-input-sm',
    resolvedStatus && `ant-input-status-${resolvedStatus}`,
    className
  ]}
/>
