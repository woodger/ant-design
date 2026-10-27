<script lang="ts">
  import { onDestroy, untrack, type Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import Icon from './Icon.svelte';

  export interface SwitchProps extends Omit<HTMLButtonAttributes, 'type' | 'value' | 'children' | 'class' | 'onchange'> {
    checked?: boolean | undefined;
    defaultChecked?: boolean;
    loading?: boolean;
    size?: 'small' | 'middle';
    checkedChildren?: Snippet;
    unCheckedChildren?: Snippet;
    onCheckedChange?: (checked: boolean) => void;
    class?: string;
  }

  let {
    checked = $bindable<boolean | undefined>(),
    defaultChecked = false,
    loading = false,
    size,
    checkedChildren,
    unCheckedChildren,
    onCheckedChange,
    disabled,
    id,
    name,
    onclick,
    onblur,
    style,
    class: className = '',
    ...attributes
  }: SwitchProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => defaultChecked);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let control = $state<HTMLButtonElement>();
  let resolvedChecked = $derived(checked ?? initialDefault);
  let resolvedDisabled = $derived(loading || (disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled));
  let isSmall = $derived((size ?? config.componentSize) === 'small');
  let fieldName = $derived(name ?? field?.name);

  onDestroy(() => { for (const reset of resets) clearTimeout(reset); });

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (resolvedDisabled) return;

    onclick?.(event);

    if (event.defaultPrevented) return;

    const next = !resolvedChecked;
    checked = next;
    onCheckedChange?.(next);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    field?.onBlur();
    onblur?.(event);
  }

  function handleReset(event: Event) {
    const button = control;

    if (!button || event.target !== button.form) return;

    // Отмена reset учитывается после всех обработчиков, включая window.
    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !button.isConnected || button !== control) return;

      checked = initialDefault;
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-switch { max-width: 100%; }
</style>

<svelte:document onreset={handleReset} />

<button
  {...attributes}
  bind:this={control}
  type="button"
  role="switch"
  id={id ?? field?.id}
  name={fieldName}
  {style}
  disabled={resolvedDisabled}
  aria-checked={resolvedChecked}
  aria-busy={loading || undefined}
  aria-label={attributes['aria-label'] ?? (attributes['aria-labelledby'] ? undefined : field?.label)}
  aria-required={attributes['aria-required'] ?? (field?.required || undefined)}
  aria-invalid={field?.status === 'error' || attributes['aria-invalid'] || undefined}
  aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
  class={['ant-switch', resolvedChecked && 'ant-switch-checked', resolvedDisabled && 'ant-switch-disabled', loading && 'ant-switch-loading', isSmall && 'ant-switch-small', config.direction === 'rtl' && 'ant-switch-rtl', className]}
  onclick={handleClick}
  onblur={handleBlur}
>
  <span class="ant-switch-handle" aria-hidden="true">{#if loading}<span class="ant-switch-loading-icon anticon"><Icon name="loading" /></span>{/if}</span>
  <span class="ant-switch-inner" aria-hidden="true">
    <span class="ant-switch-inner-checked">{#if checkedChildren}{@render checkedChildren()}{/if}</span>
    <span class="ant-switch-inner-unchecked">{#if unCheckedChildren}{@render unCheckedChildren()}{/if}</span>
  </span>
  {#if fieldName && resolvedChecked}<input type="hidden" name={fieldName} value="on" disabled={resolvedDisabled} form={attributes.form} />{/if}
</button>
