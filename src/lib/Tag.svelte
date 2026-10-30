<script lang="ts">
  import { onDestroy } from 'svelte';
  import { useConfig } from './config-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import Icon from './Icon.svelte';
  import type { TagProps } from './tag.types';

  let {
    children,
    color = 'default',
    variant = 'filled',
    icon,
    closeIcon = false,
    closeLabel,
    disabled,
    onClose,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style
  }: TagProps = $props();
  const config = useConfig();
  const generatedId = $props.id();
  let host = $state<HTMLSpanElement>();
  let closed = $state(false);
  let active = true;
  let closing = false;
  let blocked = $derived(disabled ?? config.componentDisabled);
  let contentId = $derived(`ant-tag-content-${generatedId}`);

  onDestroy(() => {
    active = false;
  });
  $effect(() => {
    const node = host;
    if (node && closeIcon) return connectFeedbackFocus(node);
  });

  function handleClose(event: MouseEvent) {
    event.stopPropagation();
    if (!active || closed || closing || blocked || !closeIcon || event.defaultPrevented) return;

    closing = true;
    try {
      onClose?.(event);
    } finally {
      closing = false;
    }
    if (active && !event.defaultPrevented)
      closed = true;
  }

  function connectClose(node: HTMLButtonElement) {
    // Прямой listener останавливает всплытие до нативных обработчиков родителя.
    node.addEventListener('click', handleClose);
    return () => node.removeEventListener('click', handleClose);
  }
</script>

<style>
  .ant-tag { display: inline-flex; align-items: center; min-width: 0; max-width: 100%; white-space: normal; vertical-align: middle; --ant-tag-default-color: var(--ant-color-text); }
  .ant-tag-dark { --ant-tag-default-bg: var(--ant-color-fill-tertiary); }
  .ant-tag-dark.ant-tag-default.ant-tag-solid:not(.ant-tag-disabled) { background-color: var(--ant-color-text); color: var(--ant-color-bg-container); }
  .ant-tag-dark.ant-tag-blue { --ant-tag-accent: var(--ant-blue-6); --ant-tag-dark-color: var(--ant-blue-4); }
  .ant-tag-dark.ant-tag-purple { --ant-tag-accent: var(--ant-purple-6); --ant-tag-dark-color: var(--ant-purple-4); }
  .ant-tag-dark.ant-tag-cyan { --ant-tag-accent: var(--ant-cyan-6); --ant-tag-dark-color: var(--ant-cyan-4); }
  .ant-tag-dark.ant-tag-green { --ant-tag-accent: var(--ant-green-6); --ant-tag-dark-color: var(--ant-green-4); }
  .ant-tag-dark.ant-tag-magenta { --ant-tag-accent: var(--ant-magenta-6); --ant-tag-dark-color: var(--ant-magenta-4); }
  .ant-tag-dark.ant-tag-pink { --ant-tag-accent: var(--ant-pink-6); --ant-tag-dark-color: var(--ant-pink-4); }
  .ant-tag-dark.ant-tag-red { --ant-tag-accent: var(--ant-red-6); --ant-tag-dark-color: var(--ant-red-4); }
  .ant-tag-dark.ant-tag-orange { --ant-tag-accent: var(--ant-orange-6); --ant-tag-dark-color: var(--ant-orange-4); }
  .ant-tag-dark.ant-tag-yellow { --ant-tag-accent: var(--ant-yellow-6); --ant-tag-dark-color: var(--ant-yellow-4); }
  .ant-tag-dark.ant-tag-volcano { --ant-tag-accent: var(--ant-volcano-6); --ant-tag-dark-color: var(--ant-volcano-4); }
  .ant-tag-dark.ant-tag-geekblue { --ant-tag-accent: var(--ant-geekblue-6); --ant-tag-dark-color: var(--ant-geekblue-4); }
  .ant-tag-dark.ant-tag-lime { --ant-tag-accent: var(--ant-lime-6); --ant-tag-dark-color: var(--ant-lime-4); }
  .ant-tag-dark.ant-tag-gold { --ant-tag-accent: var(--ant-gold-6); --ant-tag-dark-color: var(--ant-gold-4); }
  .ant-tag-dark.ant-tag-success { --ant-tag-accent: var(--ant-color-success); --ant-tag-dark-color: var(--ant-color-success); }
  .ant-tag-dark.ant-tag-processing { --ant-tag-accent: var(--ant-color-info); --ant-tag-dark-color: var(--ant-color-info); }
  .ant-tag-dark.ant-tag-error { --ant-tag-accent: var(--ant-color-error); --ant-tag-dark-color: var(--ant-color-error); }
  .ant-tag-dark.ant-tag-warning { --ant-tag-accent: var(--ant-color-warning); --ant-tag-dark-color: var(--ant-color-warning); }
  .ant-tag-dark:not(.ant-tag-default):not(.ant-tag-solid):not(.ant-tag-disabled) { color: var(--ant-tag-dark-color); background-color: color-mix(in srgb, var(--ant-tag-accent) 15%, var(--ant-color-bg-container)); }
  .ant-tag-dark.ant-tag-outlined:not(.ant-tag-default):not(.ant-tag-disabled) { border-color: color-mix(in srgb, var(--ant-tag-accent) 40%, var(--ant-color-bg-container)); }
  .ant-tag-content { min-width: 0; overflow-wrap: anywhere; }
  .ant-tag-icon { display: inline-flex; flex: none; align-items: center; }
  .ant-tag-icon :global(svg) { max-width: 1em; max-height: 1em; }
  .ant-tag-close-icon { display: inline-flex; align-items: center; justify-content: center; flex: none; min-width: 20px; min-height: 20px; border: 0; padding: 0; background: transparent; font: inherit; }
  .ant-tag-close-icon:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; border-radius: var(--ant-border-radius-sm); }
  .ant-tag-close-icon:disabled { cursor: not-allowed; }
  .ant-tag-dark .ant-tag-close-icon { color: inherit; }
  @media (prefers-reduced-motion: reduce) { .ant-tag, .ant-tag-close-icon { transition: none; } }
</style>

{#if !closed}
  <span bind:this={host} {id} role={ariaLabel || ariaLabelledby ? 'group' : undefined} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={[
      'ant-tag ant-tag-css-var',
      `ant-tag-${color}`,
      `ant-tag-${variant}`,
      blocked && 'ant-tag-disabled',
      config.theme.mode === 'dark' && 'ant-tag-dark',
      config.direction === 'rtl' && 'ant-tag-rtl',
      className
    ]} {style}>
    {#if icon}<span class="ant-tag-icon anticon" aria-hidden="true" inert>{@render icon()}</span>{/if}<span class="ant-tag-content" id={contentId}>{@render children()}</span>
    {#if closeIcon}<button type="button" class="ant-tag-close-icon" disabled={blocked} aria-label={closeLabel ?? config.locale.closeText} aria-describedby={contentId} {@attach connectClose}><span aria-hidden="true" inert>{#if typeof closeIcon === 'function'}{@render closeIcon()}{:else}<Icon name="close" />{/if}</span></button>{/if}
  </span>
{/if}
