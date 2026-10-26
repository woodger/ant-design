<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';

  export interface CheckboxProps extends Omit<HTMLInputAttributes, 'type' | 'checked' | 'indeterminate' | 'children' | 'class' | 'size'> {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    children?: Snippet;
    onCheckedChange?: (checked: boolean) => void;
    class?: string;
  }

  let {
    checked = $bindable(),
    defaultChecked = false,
    indeterminate = $bindable(),
    children,
    onCheckedChange,
    disabled,
    id,
    name,
    value = 'on',
    onchange,
    onblur,
    style,
    class: className = '',
    ...attributes
  }: CheckboxProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => defaultChecked);
  let resolvedChecked = $derived(checked ?? initialDefault);
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);

  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    checked = event.currentTarget.checked;
    indeterminate = false;
    onCheckedChange?.(checked);
    onchange?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    field?.onBlur();
    onblur?.(event);
  }
</script>

<label
  class={[
    'ant-checkbox-wrapper ant-checkbox-css-var',
    resolvedChecked && 'ant-checkbox-wrapper-checked',
    resolvedDisabled && 'ant-checkbox-wrapper-disabled',
    config.direction === 'rtl' && 'ant-checkbox-rtl',
    className
  ]}
  {style}
>
  <span class={['ant-checkbox', resolvedChecked && 'ant-checkbox-checked', indeterminate && 'ant-checkbox-indeterminate', resolvedDisabled && 'ant-checkbox-disabled']}>
    <input
      {...attributes}
      type="checkbox"
      class="ant-checkbox-input"
      id={id ?? field?.id}
      name={name ?? field?.name}
      {value}
      defaultChecked={initialDefault}
      bind:checked={() => resolvedChecked, (next) => { checked = next; }}
      bind:indeterminate={() => indeterminate ?? false, (next) => { indeterminate = next; }}
      disabled={resolvedDisabled}
      required={attributes.required ?? field?.required}
      aria-checked={indeterminate ? 'mixed' : resolvedChecked}
      aria-invalid={field?.status === 'error' || attributes['aria-invalid'] || undefined}
      aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
      onchange={handleChange}
      onblur={handleBlur}
    />
  </span>
  {#if children}<span class="ant-checkbox-label">{@render children()}</span>{/if}
</label>
