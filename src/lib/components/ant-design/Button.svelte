<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import type { ComponentSize } from './types';
  import Icon from './Icon.svelte';

  export interface ButtonProps extends Omit<HTMLButtonAttributes, 'type' | 'children' | 'class'> {
    children?: Snippet;
    icon?: Snippet;
    type?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
    htmlType?: 'button' | 'submit' | 'reset';
    size?: ComponentSize;
    loading?: boolean;
    danger?: boolean;
    block?: boolean;
    shape?: 'default' | 'circle' | 'round';
    class?: string;
  }

  let {
    children,
    icon,
    type = 'default',
    htmlType = 'button',
    size,
    loading = false,
    danger = false,
    block = false,
    shape = 'default',
    disabled,
    class: className = '',
    ...attributes
  }: ButtonProps = $props();

  const config = useConfig();
  const form = useForm();
  let resolvedSize = $derived(size ?? config.componentSize);
  let variant = $derived(type === 'primary' ? 'solid' : type === 'default' ? 'outlined' : type);
  let color = $derived(danger ? 'dangerous' : type === 'primary' || type === 'link' ? 'primary' : 'default');
</script>

<button
  {...attributes}
  type={htmlType}
  disabled={loading || (disabled ?? form?.disabled ?? config.componentDisabled)}
  aria-busy={loading || undefined}
  class={[
    'ant-btn',
    `ant-btn-${type}`,
    `ant-btn-color-${color}`,
    `ant-btn-variant-${variant}`,
    resolvedSize === 'large' && 'ant-btn-lg',
    resolvedSize === 'small' && 'ant-btn-sm',
    loading && 'ant-btn-loading',
    danger && 'ant-btn-dangerous',
    block && 'ant-btn-block',
    shape !== 'default' && `ant-btn-${shape}`,
    !children && 'ant-btn-icon-only',
    className
  ]}
>
  {#if loading || icon}
    <span class="ant-btn-icon">
      {#if loading}<Icon name="loading" />{:else if icon}{@render icon()}{/if}
    </span>
  {/if}
  {#if children}<span>{@render children()}</span>{/if}
</button>
