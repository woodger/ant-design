<script lang="ts" generics="Value extends CheckboxGroupValue = string">
  import { onDestroy, untrack } from 'svelte';
  import Checkbox from './Checkbox.svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { getCheckboxGroupOptions, getCheckboxGroupValue } from './checkbox-group.engine';
  import type {
    CheckboxGroupOption,
    CheckboxGroupProps,
    CheckboxGroupValue
  } from './checkbox-group.types';

  let {
    options,
    value = $bindable<Value[]>(),
    defaultValue,
    disabled,
    id,
    name,
    onValueChange,
    onfocus,
    'aria-invalid': ariaInvalid,
    style,
    class: className = '',
    ...attributes
  }: CheckboxGroupProps<Value> = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const generatedId = $props.id();
  const initialDefault = untrack(() => [...(defaultValue ?? [])]);
  const initialKeys = new Set(initialDefault);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let container = $state<HTMLFieldSetElement>();
  let controlId = $derived(id ?? field?.id ?? `ant-checkbox-group-${generatedId}`);
  let items = $derived(getCheckboxGroupOptions(options));
  let selected = $derived(new Set(value ?? initialDefault));
  let resolvedDisabled = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let describedBy = $derived(
    [attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined
  );

  onDestroy(() => {
    for (const reset of resets)
      clearTimeout(reset);
  });

  function change(option: CheckboxGroupOption<Value>, checked: boolean) {
    if (resolvedDisabled || option.disabled || selected.has(option.value) === checked) return;

    const next = new Set(selected);

    if (checked)
      next.add(option.value);
    else next.delete(option.value);

    const values = getCheckboxGroupValue(items, [...next]);
    value = [...values];
    onValueChange?.(values);
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLFieldSetElement; }) {
    if (!event.defaultPrevented && event.target === event.currentTarget) {
      event.currentTarget.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
    }

    onfocus?.(event);
  }

  function handleReset(event: Event) {
    const element = container;

    if (!element || event.target !== element.form) return;

    // Следующая задача учитывает отмену reset даже в позднем listener на window.
    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !element.isConnected || element !== container) return;

      value = [...initialDefault];
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-checkbox-group { min-width: 0; max-width: 100%; border: 0; row-gap: var(--ant-margin-xs); }
  .ant-checkbox-group:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-checkbox-group :global(.ant-checkbox-wrapper) { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .ant-checkbox-group :global(.ant-checkbox-label) { min-width: 0; }
</style>

<svelte:document onreset={handleReset} />

<fieldset
  {...attributes}
  bind:this={container}
  id={controlId}
  {name}
  {style}
  class={[
      'ant-checkbox-group ant-checkbox-css-var',
      config.direction === 'rtl' && 'ant-checkbox-group-rtl',
      className
    ]}
  disabled={resolvedDisabled}
  aria-label={attributes['aria-label']
      ?? (attributes['aria-labelledby']
        ? undefined
        : field?.label)}
  data-ant-form-invalid={field?.status === 'error'
      || ariaInvalid === true
      || ariaInvalid === 'true'
      || undefined}
  aria-describedby={describedBy}
  tabindex="-1"
  onfocus={handleFocus}
>
  {#each items as option, index (option.value)}
    <!-- Массивом и отменой reset управляет группа; дочерние привязки не меняют локальный checked. -->
    <Checkbox
      id={`${controlId}-${index}`}
      name={name ?? field?.name}
      value={String(option.value)}
      form={attributes.form}
      bind:checked={() => selected.has(option.value), () => { }}
      defaultChecked={initialKeys.has(option.value)}
      disabled={resolvedDisabled || option.disabled || false}
      required={false}
      aria-label={option.label}
      aria-invalid={ariaInvalid}
      aria-describedby={attributes['aria-describedby']}
      onchange={(event) => change(option, event.currentTarget.checked)}
    >{option.label}</Checkbox>
  {/each}
</fieldset>
