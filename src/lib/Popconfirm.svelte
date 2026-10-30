<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import { ruRU } from './types';
  import { createPopconfirmAction } from './popconfirm.model.svelte.js';
  import type { PopconfirmProps } from './popconfirm.types';
  import Popover from './Popover.svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  let { children, title, description, icon, open = $bindable<boolean | undefined>(), defaultOpen = false, disabled, showCancel = true, okText, cancelText, okType = 'primary', okButtonProps, cancelButtonProps, placement = 'top', arrow = true, autoAdjustOverflow = true, onOpenChange, onConfirm, onCancel, onError, class: className = '', style }: PopconfirmProps = $props();

  const config = useConfig();
  const form = useForm();
  const generatedId = $props.id();
  const titleId = `ant-popconfirm-${generatedId}-title`;
  const descriptionId = `ant-popconfirm-${generatedId}-description`;
  const initialDefault = untrack(() => defaultOpen);
  let overlay = $state<HTMLDivElement>();
  let errorSession = $state.raw<object>();
  let active = true;
  let resolvedDisabled = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let hasTitle = $derived(typeof title === 'function' || Boolean(String(title ?? '').trim()));
  let hasDescription = $derived(typeof description === 'function' || Boolean(String(description ?? '').trim()));
  let visible = $derived(!resolvedDisabled && hasTitle && (open ?? initialDefault));
  let session = $derived(visible ? { owner: open } : null);
  const action = createPopconfirmAction(() => session, {
    onSuccess: () => { open = false; onOpenChange?.(false); },
    onError: (error) => { errorSession = session ?? undefined; onError?.(error); }
  });
  let errorVisible = $derived(session !== null && session === errorSession);

  $effect.pre(() => {
    const element = overlay;

    // Сохраняем фокус в карточке до отключения кнопок на время Promise.
    if (action.loading && element?.contains(element.ownerDocument.activeElement)) element.focus({ preventScroll: true });
  });

  onDestroy(() => { active = false; action.dispose(); });

  function request(next: boolean) {
    if (!active || resolvedDisabled || action.loading || next === (open ?? initialDefault)) return;

    open = next;
    onOpenChange?.(next);
  }

  function confirm(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (!visible || action.loading || okButtonProps?.disabled) return;

    okButtonProps?.onclick?.(event);
    if (event.defaultPrevented) return;

    errorSession = undefined;
    void action.run(() => onConfirm?.(event));
  }

  function cancel(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (!visible || action.loading || cancelButtonProps?.disabled) return;

    cancelButtonProps?.onclick?.(event);
    if (event.defaultPrevented) return;

    request(false);
    onCancel?.(event);
  }
</script>

<style>
  .ant-popconfirm-inner-content { min-width: min(200px, calc(100vw - 40px)); overflow-wrap: anywhere; }
  .ant-popconfirm-inner-content:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-popconfirm-message-text { min-width: 0; }
  .ant-popconfirm-inner-content .ant-popconfirm-buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--ant-margin-xs); white-space: normal; }
  .ant-popconfirm-buttons :global(.ant-btn) { max-width: 100%; min-height: var(--ant-control-height-sm); height: auto; margin-inline-start: 0; white-space: normal; }
  .anticon { display: inline-flex; }
  .ant-popconfirm-error { margin: 8px 0 0; color: var(--ant-color-error); }
</style>

{#snippet content()}
  <div bind:this={overlay} class="ant-popconfirm-inner-content" tabindex="-1">
    <div class="ant-popconfirm-message">
      {#if icon !== null}<span class="ant-popconfirm-message-icon" aria-hidden="true"><span class="anticon">{#if icon}{@render icon()}{:else}<Icon name="warning" />{/if}</span></span>{/if}
      <div class="ant-popconfirm-message-text">
        <div id={titleId} class="ant-popconfirm-title">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</div>
        {#if hasDescription}<div id={descriptionId} class="ant-popconfirm-description">{#if typeof description === 'function'}{@render description()}{:else}{description}{/if}</div>{/if}
      </div>
    </div>
    <div class="ant-popconfirm-buttons">
      {#if showCancel}<Button {...cancelButtonProps} size={cancelButtonProps?.size ?? 'small'} disabled={Boolean(action.loading || resolvedDisabled || cancelButtonProps?.disabled)} htmlType="button" onclick={cancel}>{cancelText ?? config.locale.cancelText}</Button>{/if}
      <Button {...okButtonProps} type={okButtonProps?.type ?? okType} size={okButtonProps?.size ?? 'small'} disabled={Boolean(action.loading || resolvedDisabled || okButtonProps?.disabled)} loading={action.loading} htmlType="button" onclick={confirm}>{okText ?? config.locale.okText}</Button>
    </div>
    {#if errorVisible}<p role="alert" class="ant-popconfirm-error">{config.locale.confirmErrorText ?? ruRU.confirmErrorText}</p>{/if}
  </div>
{/snippet}

<Popover content={hasTitle ? content : undefined} bind:open={() => visible, request} trigger={resolvedDisabled ? [] : 'click'} {placement} {arrow} {autoAdjustOverflow} popupClass="ant-popconfirm" aria-labelledby={titleId} aria-describedby={hasDescription ? descriptionId : undefined} aria-busy={action.loading || undefined} class={className} {style}>
  {@render children()}
</Popover>
