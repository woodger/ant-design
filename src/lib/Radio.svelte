<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { useRadioGroup } from './radio-context';
  import { connectRadio, syncRadioPeers } from './radio.dom';
  import type { RadioProps } from './radio.types';

  let {
    checked = $bindable<boolean | undefined>(),
    defaultChecked = false,
    value = 'on',
    children,
    onCheckedChange,
    disabled,
    id,
    name,
    onchange,
    onblur,
    'aria-invalid': ariaInvalid,
    style,
    class: className = '',
    ...attributes
  }: RadioProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const group = useRadioGroup();
  const initialDefault = untrack(() => defaultChecked);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let control = $state<HTMLInputElement>();
  let resolvedChecked = $derived(group ? group.value === value : checked ?? initialDefault);
  let resolvedDefault = $derived(group ? group.defaultValue === value : initialDefault);
  let resolvedDisabled = $derived(group ? group.disabled || Boolean(disabled) : disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let nativeGroup = $derived({ name: group?.name ?? name ?? field?.name, form: attributes.form });

  $effect(() => {
    if (!control || group) return;

    return connectRadio(control, (next) => { checked = next; });
  });

  $effect(() => {
    if (control && !group && resolvedChecked && nativeGroup.name) {
      const input = control;

      // Нативное снятие соседнего radio не вызывает у него change.
      untrack(() => syncRadioPeers(input));
    }
  });

  onDestroy(() => { for (const reset of resets) clearTimeout(reset); });

  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    if (resolvedDisabled) return;

    const next = event.currentTarget.checked;

    if (group) {
      if (next) group.select(value);
    } else {
      checked = next;
      onCheckedChange?.(next);
    }

    onchange?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    field?.onBlur();
    onblur?.(event);
  }

  function handleReset(event: Event) {
    const input = control;

    if (group || !input || event.target !== input.form) return;

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !input.isConnected || input !== control) return;

      checked = input.checked;
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-radio-label { min-width: 0; overflow-wrap: anywhere; }
</style>

<svelte:document onreset={handleReset} />

<label class={['ant-radio-wrapper ant-radio-css-var', resolvedChecked && 'ant-radio-wrapper-checked', resolvedDisabled && 'ant-radio-wrapper-disabled', config.direction === 'rtl' && 'ant-radio-wrapper-rtl', className]} {style}>
  <span class={['ant-radio', resolvedChecked && 'ant-radio-checked', resolvedDisabled && 'ant-radio-disabled']}>
    <input
      {...attributes}
      bind:this={control}
      type="radio"
      class="ant-radio-input"
      id={id ?? field?.id}
      name={nativeGroup.name}
      form={nativeGroup.form}
      value={String(value)}
      defaultChecked={resolvedDefault}
      checked={resolvedChecked}
      disabled={resolvedDisabled}
      required={group?.required ?? attributes.required ?? field?.required}
      aria-checked={resolvedChecked}
      data-ant-form-invalid={!group && (field?.status === 'error' || ariaInvalid === true || ariaInvalid === 'true') || undefined}
      aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
      onchange={handleChange}
      onblur={handleBlur}
    />
  </span>
  {#if children}<span class="ant-radio-label">{@render children()}</span>{/if}
</label>
