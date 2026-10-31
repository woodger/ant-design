<script module lang="ts">
  export type { InputGroupProps } from './input-group.types';
</script>

<script lang="ts">
  import SpaceCompact from './SpaceCompact.svelte';
  import { useConfig } from './config-context';
  import { provideFormField, useFormField } from './form-context';
  import type { InputGroupProps } from './input-group.types';

  let {
    children,
    items,
    size,
    compact,
    class: className = '',
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    nativeElement = $bindable()
  }: InputGroupProps = $props();

  const config = useConfig();
  const field = useFormField();
  // Аналог status-only FormItemInputContext: группа не связывает все controls с одним полем.
  provideFormField(field ? {
    get disabled() {
      return field.disabled;
    },
    get status() {
      return field.status;
    },
    required: false,
    describedBy: undefined,
    onBlur() {
      field.onBlur();
    }
  } : undefined);
</script>

<SpaceCompact
  {children}
  {items}
  bind:nativeElement
  {style}
  class={[
    'ant-input-group ant-input-css-var',
    size === 'large' && 'ant-input-group-lg',
    size === 'small' && 'ant-input-group-sm',
    compact && 'ant-input-group-compact',
    config.direction === 'rtl' && 'ant-input-group-rtl',
    className
  ].filter(Boolean).join(' ')}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onfocusin={onFocus}
  onfocusout={onBlur}
/>
