<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { useConfig } from './config-context';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  export interface ModalProps {
    open?: boolean;
    title: string;
    children: Snippet;
    footer?: Snippet | null;
    width?: number;
    closable?: boolean;
    keyboard?: boolean;
    maskClosable?: boolean;
    confirmLoading?: boolean;
    okText?: string;
    cancelText?: string;
    onOk?: () => void;
    onCancel?: () => void;
    class?: string;
  }

  let {
    open = $bindable(false),
    title,
    children,
    footer,
    width = 520,
    closable = true,
    keyboard = true,
    maskClosable = true,
    confirmLoading = false,
    okText,
    cancelText,
    onOk,
    onCancel,
    class: className = ''
  }: ModalProps = $props();

  const config = useConfig();
  const generatedId = $props.id();
  const titleId = `ant-modal-${generatedId}`;
  let dialog = $state<HTMLDialogElement>();
  let backdropPointer = false;

  $effect(() => {
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  onDestroy(() => {
    if (dialog?.open) {
      dialog.close();
    }
  });

  function cancel() {
    if (!confirmLoading) {
      open = false;
      onCancel?.();
    }
  }

  function handleCancel(event: Event) {
    event.preventDefault();

    if (keyboard) {
      cancel();
    }
  }

  function isBackdrop(event: PointerEvent) {
    if (!dialog) {
      return false;
    }

    const bounds = dialog.getBoundingClientRect();

    return event.target === dialog && (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    );
  }

  function handlePointerUp(event: PointerEvent) {
    if (maskClosable && backdropPointer && isBackdrop(event)) {
      cancel();
    }

    backdropPointer = false;
  }

  function handleOk() {
    if (onOk) { onOk(); } else { open = false; }
  }
</script>

<style>
  :global(html:has(dialog.ant-svelte-dialog[open])) { overflow: hidden; }
  .ant-svelte-dialog { max-width: calc(100vw - 32px); max-height: calc(100dvh - 48px); padding: 0; border: 0; overflow: visible; background: transparent; color: var(--ant-color-text); }
  .ant-svelte-dialog::backdrop { background: var(--ant-color-bg-mask); }
  .ant-modal { top: auto; max-width: none; width: 100%; margin: 0; padding: 0; }
  .ant-modal-container { max-height: calc(100dvh - 48px); overflow: auto; }
  .ant-modal-title { padding-inline-end: 32px; }
  .ant-modal-close { display: flex; align-items: center; justify-content: center; }
</style>

<dialog
  bind:this={dialog}
  class={`ant-svelte-dialog ant-modal-css-var ${className}`}
  style:width={`${width}px`}
  dir={config.direction}
  aria-labelledby={titleId}
  aria-modal="true"
  oncancel={handleCancel}
  onclose={() => { if (!dialog?.open) open = false; }}
  onpointerdown={(event) => { backdropPointer = isBackdrop(event); }}
  onpointerup={handlePointerUp}
>
  <div class="ant-modal">
    <div class="ant-modal-container">
      {#if closable}
        <button type="button" class="ant-modal-close" disabled={confirmLoading} aria-label={config.locale.closeText} onclick={cancel}>
          <Icon name="close" />
        </button>
      {/if}
      <div class="ant-modal-header"><h2 id={titleId} class="ant-modal-title">{title}</h2></div>
      <div class="ant-modal-body">{@render children()}</div>
      {#if footer !== null}
        <div class="ant-modal-footer">
          {#if footer}
            {@render footer()}
          {:else}
            <Button disabled={confirmLoading} onclick={cancel}>{cancelText ?? config.locale.cancelText}</Button>
            <Button type="primary" loading={confirmLoading} onclick={handleOk}>{okText ?? config.locale.okText}</Button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</dialog>
