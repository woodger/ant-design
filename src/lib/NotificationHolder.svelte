<script lang="ts">
  import { untrack } from 'svelte';
  import NotificationNotice from './NotificationNotice.svelte';
  import { useConfig } from './config-context';
  import { notificationHolderKey, notificationPlacements } from './notification.model.svelte.js';
  import { connectNoticeSurface } from './notice.dom';
  import type { NotificationHolderProps } from './notification.types';

  let { notification, top = 24, bottom = 24, id, class: className = '', style }: NotificationHolderProps = $props();
  const config = useConfig();
  let anchor = $state<HTMLSpanElement>();
  let surface = $state<HTMLDivElement>();
  let runtime = $derived(notification[notificationHolderKey]);
  let notices = $derived(runtime.notices);
  let resolvedTop = $derived(Number.isFinite(top) && top >= 0 ? top : 24);
  let resolvedBottom = $derived(Number.isFinite(bottom) && bottom >= 0 ? bottom : 24);

  function connectHost(node: HTMLSpanElement) {
    const view = node.ownerDocument.defaultView!;
    return runtime.connect({ now: () => view.performance.now(), schedule(callback, milliseconds) { const timer = view.setTimeout(callback, milliseconds); return () => view.clearTimeout(timer); } });
  }

  $effect(() => {
    const node = surface;
    const origin = anchor;
    const current = runtime;
    if (node && origin) return untrack(() => connectNoticeSurface(node, origin, current.setVisible));
  });
</script>

<style>
  .ant-notification-anchor { position: absolute; width: 0; height: 0; pointer-events: none; visibility: hidden; }
  .ant-notification-surface { position: fixed; inset: auto; top: var(--ant-svelte-notice-viewport-top, 0px); left: 0; width: 100%; height: var(--ant-svelte-notice-viewport-height, 100dvh); max-width: 100vw; max-height: none; margin: 0; border: 0; padding: 0; overflow: hidden; background: transparent; pointer-events: none; outline: none; }
  .ant-notification-surface:not(:popover-open) { display: none; }
  .ant-notification-surface::backdrop { pointer-events: none; background: transparent; }
  .ant-notification-surface > .ant-notification.ant-notification-list { position: absolute; height: auto; max-width: 100%; max-height: calc(100% - max(0px, var(--notification-top) - var(--ant-margin-lg))); }
  .ant-notification-surface > .ant-notification.ant-notification-list[data-placement^='bottom'] { max-height: calc(100% - max(0px, var(--notification-bottom) - var(--ant-margin-lg))); }
  .ant-notification-surface .ant-notification-list-content { pointer-events: none; }
  [data-placement^='bottom'] > .ant-notification-list-content { flex-direction: column-reverse; }
</style>

<span bind:this={anchor} class="ant-notification-anchor" aria-hidden="true" {@attach connectHost}></span>
{#key notification}
  {#if notices.length}
    <div bind:this={surface} popover="manual" {id} dir={config.direction} class={['ant-notification-surface ant-notification-css-var', className]} {style} style:--notification-top={`${resolvedTop}px`} style:--notification-bottom={`${resolvedBottom}px`}>
      {#each notificationPlacements as placement}
        {@const items = notices.filter((notice) => notice.placement === placement)}
        {#if items.length}
          <div class={['ant-notification ant-notification-list', `ant-notification-${placement}`, config.direction === 'rtl' && 'ant-notification-rtl']} data-placement={placement}>
            <div class="ant-notification-list-content">{#each items as notice (notice.id)}<NotificationNotice {notice} {notification} />{/each}</div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
{/key}
