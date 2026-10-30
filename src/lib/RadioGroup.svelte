<script lang="ts" generics="Value extends RadioValue = string">
  import { onDestroy, untrack } from 'svelte';
  import Radio from './Radio.svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { provideRadioGroup } from './radio-context';
  import { getRadioOptions } from './radio.engine';
  import type { RadioGroupProps, RadioValue } from './radio.types';

  let {
    options,
    value = $bindable<Value | undefined>(),
    defaultValue,
    disabled,
    required,
    orientation = 'horizontal',
    id,
    name,
    onValueChange,
    onfocus,
    'aria-invalid': ariaInvalid,
    style,
    class: className = '',
    ...attributes
  }: RadioGroupProps<Value> = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const generatedId = $props.id();
  const initialDefault = untrack(() => defaultValue);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let useDefault = $state(true);
  let container = $state<HTMLFieldSetElement>();
  let controlId = $derived(id ?? field?.id ?? `ant-radio-group-${generatedId}`);
  let nativeName = $derived(name ?? field?.name ?? `ant-radio-name-${generatedId}`);
  let selected = $derived(value ?? (useDefault ? initialDefault : undefined));
  let items = $derived(getRadioOptions(options));
  let resolvedDisabled = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedRequired = $derived(required ?? field?.required ?? false);
  let describedBy = $derived(
    [attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined
  );

  provideRadioGroup({
    get value() {
      return selected;
    },
    get defaultValue() {
      return initialDefault;
    },
    get name() {
      return nativeName;
    },
    get disabled() {
      return resolvedDisabled;
    },
    get required() {
      return resolvedRequired;
    },
    select(next) {
      const option = items.find((item) => item.value === next);

      if (!option || resolvedDisabled || option.disabled || selected === option.value) return;

      useDefault = false;
      value = option.value;
      onValueChange?.(option.value);
    }
  });

  onDestroy(() => {
    for (const reset of resets)
      clearTimeout(reset);
  });

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLFieldSetElement; }) {
    if (!event.defaultPrevented && event.target === event.currentTarget) {
      const element = event.currentTarget;
      const input = element.querySelector<HTMLInputElement>('input:checked:not(:disabled)')
        ?? element.querySelector<
          HTMLInputElement
        >(
          'input:not(:disabled)'
        );

      input?.focus();
    }

    onfocus?.(event);
  }

  function handleReset(event: Event) {
    const element = container;

    if (!element || event.target !== element.form) return;

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !element.isConnected || element !== container) return;

      useDefault = false;
      value = initialDefault;
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-radio-group { display: inline-flex; flex-wrap: wrap; min-width: 0; max-width: 100%; padding: 0; border: 0; row-gap: var(--ant-margin-xs); }
  .ant-radio-group-vertical { flex-direction: column; align-items: flex-start; }
  .ant-radio-group:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-radio-group :global(.ant-radio-wrapper) { min-width: 0; max-width: 100%; }
</style>

<svelte:document onreset={handleReset} />

<fieldset
  {...attributes}
  bind:this={container}
  id={controlId}
  {name}
  {style}
  role="radiogroup"
  class={[
      'ant-radio-group ant-radio-css-var',
      orientation === 'vertical' && 'ant-radio-group-vertical',
      config.direction === 'rtl' && 'ant-radio-group-rtl',
      className
    ]}
  disabled={resolvedDisabled}
  aria-label={attributes['aria-label']
      ?? (attributes['aria-labelledby']
        ? undefined
        : field?.label)}
  aria-required={resolvedRequired || undefined}
  aria-invalid={field?.status === 'error' || ariaInvalid || undefined}
  aria-orientation={orientation}
  aria-describedby={describedBy}
  data-ant-form-invalid={field?.status === 'error'
      || ariaInvalid === true
      || ariaInvalid === 'true'
      || undefined}
  tabindex="-1"
  onfocus={handleFocus}
>
  {#each items as option, index (option.value)}
    <Radio id={`${controlId}-${index}`} value={option.value} disabled={option.disabled} form={attributes.form} aria-label={option.label} aria-invalid={ariaInvalid} aria-describedby={attributes['aria-describedby']}>{option.label}</Radio>
  {/each}
</fieldset>
