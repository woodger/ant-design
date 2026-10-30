<script lang="ts">
  import { untrack } from 'svelte';
  import MessageNotice from './MessageNotice.svelte';
  import { useConfig } from './config-context';
  import { messageHolderKey } from './message.model.svelte.js';
  import { connectMessageSurface } from './message.dom';
  import type { MessageHolderProps } from './message.types';

  let { message, top = 8, id, class: className = '', style }: MessageHolderProps = $props();
  const config = useConfig();
  let anchor = $state<HTMLSpanElement>();
  let surface = $state<HTMLDivElement>();
  let runtime = $derived(message[messageHolderKey]);
  let notices = $derived(runtime.notices);
  let resolvedTop = $derived(
    typeof top === 'number'
      ? `${Number.isFinite(top) && top >= 0 ? top : 8}px`
      : top.trim() || '8px'
  );

  function connectHost(node: HTMLSpanElement) {
    const view = node.ownerDocument.defaultView!;
    return runtime.connect({
      now: () => view.performance.now(),
      schedule(callback, milliseconds) {
        const timer = view.setTimeout(callback, milliseconds);
        return () => view.clearTimeout(timer);
      }
    });
  }

  $effect(() => {
    const node = surface;
    const origin = anchor;
    const current = runtime;
    if (node
      && origin) return untrack(() => connectMessageSurface(node, origin, current.setVisible));
  });
</script>

<style>
  .ant-message-anchor { position: absolute; width: 0; height: 0; pointer-events: none; visibility: hidden; }
  .ant-message.ant-message-list { position: fixed; inset: auto; top: calc(var(--notification-top) + var(--ant-svelte-notice-viewport-top, 0px) - var(--notification-margin-edge)); left: 0; right: auto; width: 100%; max-width: 100vw; height: auto; max-height: calc(100dvh - var(--notification-top) + var(--notification-margin-edge)); margin: 0; border: 0; background: transparent; transform: none; outline: none; }
  .ant-message:not(:popover-open) { display: none; }
  .ant-message-list-content { align-items: center; }
  .ant-message::backdrop { pointer-events: none; background: transparent; }
</style>

<span bind:this={anchor} class="ant-message-anchor" aria-hidden="true" {@attach connectHost}></span>
{#key message}
  {#if notices.length}
    <div bind:this={surface} popover="manual" {id} dir={config.direction} class={[
        'ant-message ant-message-css-var ant-message-list ant-message-top',
        config.direction === 'rtl' && 'ant-message-rtl',
        className
      ]} {style} style:--notification-top={resolvedTop}>
      <div class="ant-message-list-content">{#each notices as notice (notice.id)}<MessageNotice {notice} {message} />{/each}</div>
    </div>
  {/if}
{/key}
