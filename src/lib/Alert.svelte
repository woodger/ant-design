<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { closeAlert, focusAfterAlert } from './alert.dom';
  import type { AlertProps } from './alert.types';

  let {
    type,
    variant = 'outlined',
    title,
    description,
    showIcon,
    icon,
    action,
    banner = false,
    closable = false,
    role = 'alert',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-live': ariaLive,
    'aria-atomic': ariaAtomic = true,
    class: className = '',
    style
  }: AlertProps = $props();

  const config = useConfig();
  let root = $state<HTMLDivElement>();
  let phase = $state<'open' | 'closing' | 'closed'>('open');
  let disposeMotion: (() => void) | undefined;
  let active = true;
  let resolvedType = $derived(type ?? (banner ? 'warning' : 'info'));
  let hasIcon = $derived(showIcon ?? banner);
  let hasTitle = $derived(typeof title === 'function' || Boolean(title));
  let hasDescription = $derived(typeof description === 'function' || Boolean(description));
  let closeConfig = $derived(typeof closable === 'object' ? closable : undefined);
  const statusIcon = {
    success: 'check-circle-filled',
    info: 'info-circle-filled',
    warning: 'exclamation-circle-filled',
    error: 'close-circle-filled'
  } as const;

  onDestroy(() => {
    active = false;
    disposeMotion?.();
  });

  function handleClose(event: MouseEvent) {
    const node = root;
    if (!active || !node || phase !== 'open' || !closable || closeConfig?.disabled) return;

    const ownedFocus = node.contains(node.ownerDocument.activeElement);
    const onClose = closeConfig?.onClose;
    const afterClose = closeConfig?.afterClose;
    phase = 'closing';
    try {
      onClose?.(event);
    }
    finally {
      if (active && node.isConnected) {
        focusAfterAlert(node, ownedFocus);
        disposeMotion = closeAlert(node, () => {
          phase = 'closed';
          // afterClose видит уже удалённое содержимое и не вызывается после unmount.
          void tick().then(() => {
            if (active)
              afterClose?.();
          });
        });
      }
    }
  }
</script>

<style>
  .ant-alert { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .ant-alert-closing { overflow: hidden; }
  .ant-alert-actions { min-width: 0; max-width: 50%; }
  .ant-alert-close-icon { display: inline-flex; flex: none; align-items: center; justify-content: center; min-width: 24px; min-height: 24px; color: var(--ant-color-icon); }
  .anticon-close { display: inline-flex; }
  .ant-alert-close-icon:hover:not(:disabled) .anticon-close { color: var(--ant-color-icon-hover); }
  @media (max-width: 575px) {
    .ant-alert { flex-wrap: wrap; align-items: flex-start; }
    .ant-alert-actions { order: 1; flex: 0 0 100%; max-width: 100%; margin-inline-start: 0; margin-block-start: var(--ant-margin-xs); }
  }
  @media (prefers-reduced-motion: reduce) { .ant-alert-close-icon .anticon-close { transition: none; } }
</style>

{#if phase !== 'closed'}
  <div bind:this={root} {id} {role} dir={config.direction} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} aria-live={ariaLive} aria-atomic={ariaAtomic} aria-hidden={phase === 'closing' || undefined} inert={phase === 'closing'} data-show={phase === 'open'} class={[
      'ant-alert ant-alert-css-var',
      `ant-alert-${resolvedType}`,
      `ant-alert-${variant}`,
      hasDescription && 'ant-alert-with-description',
      !hasIcon && 'ant-alert-no-icon',
      banner && 'ant-alert-banner',
      config.direction === 'rtl' && 'ant-alert-rtl',
      phase === 'closing' && 'ant-alert-closing',
      className
    ]} {style}>
    {#if hasIcon}<span class="ant-alert-icon" aria-hidden="true">{#if icon}{@render icon()}{:else}<Icon name={statusIcon[resolvedType]} />{/if}</span>{/if}
    <div class="ant-alert-section">
      {#if hasTitle}<div class="ant-alert-title">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</div>{/if}
      {#if hasDescription}<div class="ant-alert-description">{#if typeof description === 'function'}{@render description()}{:else}{description}{/if}</div>{/if}
    </div>
    {#if action}<div class="ant-alert-actions">{@render action()}</div>{/if}
    {#if closable}<button type="button" class="ant-alert-close-icon" disabled={phase === 'closing' || closeConfig?.disabled} aria-label={closeConfig?.['aria-label'] ?? config.locale.closeText} aria-labelledby={closeConfig?.['aria-labelledby']} aria-describedby={closeConfig?.['aria-describedby']} onclick={handleClose}><span class="anticon-close" aria-hidden="true">{#if closeConfig?.closeIcon !== undefined}{#if typeof closeConfig.closeIcon === 'function'}{@render closeConfig.closeIcon()}{:else}{closeConfig.closeIcon}{/if}{:else}<Icon name="close" />{/if}</span></button>{/if}
  </div>
{/if}
