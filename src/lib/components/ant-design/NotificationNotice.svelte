<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { notificationHolderKey, type NotificationNotice } from './notification.model.svelte';
  import { animateNotice, focusAfterNotice } from './notice.dom';
  import type { NotificationInstance } from './notification.types';

  let { notice, notification }: { notice: NotificationNotice; notification: NotificationInstance } = $props();
  const id = untrack(() => notice.id);
  const runtime = untrack(() => notification[notificationHolderKey]);
  const config = useConfig();
  const identity = $props.id();
  const icons = { success: 'check-circle-filled', info: 'info-circle-filled', warning: 'exclamation-circle-filled', error: 'close-circle-filled' } as const;
  let node = $state<HTMLDivElement>();
  let present = $state(true);
  let entered = false;
  let active = true;
  let disposeMotion: (() => void) | undefined;
  let hasTitle = $derived(typeof notice.title === 'function' || Boolean(notice.title));
  let hasDescription = $derived(typeof notice.description === 'function' || Boolean(notice.description));
  let closeConfig = $derived(typeof notice.closable === 'object' ? notice.closable : undefined);
  let closeIcon = $derived(closeConfig?.closeIcon !== undefined ? closeConfig.closeIcon : notice.closeIcon);
  let closable = $derived(notice.closable !== false && closeIcon !== false && closeIcon !== null);

  function mounted() { runtime.mounted(id); }
  function handleClose() { if (closable && !closeConfig?.disabled) runtime.close(id); }
  function handleFocusOut(event: FocusEvent) { if (!node?.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) runtime.focus(id, false); }

  $effect.pre(() => {
    const root = node;
    const closing = notice.closing;
    // Снимок фокуса нужен до inert и до возможного удаления action snippet.
    if (root) untrack(() => {
      const ownedFocus = root.contains(root.ownerDocument.activeElement);
      if (closing) focusAfterNotice(root, ownedFocus);
      else void tick().then(() => {
        if (!active || !root.isConnected) return;
        if (ownedFocus && !root.contains(root.ownerDocument.activeElement)) focusAfterNotice(root, true);
        runtime.focus(id, root.contains(root.ownerDocument.activeElement));
      });
    });
  });

  $effect(() => {
    const root = node;
    const current = notice;
    const visible = runtime.visible;
    if (!root || !present) return;

    untrack(() => {
      const shift = current.placement.endsWith('Left') ? 'translateX(-64px)' : current.placement.endsWith('Right') ? 'translateX(64px)' : current.placement === 'bottom' ? 'translateY(64px)' : 'translateY(-64px)';
      if (current.closing) {
        const style = root.ownerDocument.defaultView!.getComputedStyle(root);
        const from = { opacity: style.opacity, transform: style.transform };
        disposeMotion?.();
        const finish = () => { present = false; void tick().then(() => { if (active) runtime.complete(id, current.version); }); };
        if (!visible) finish(); else disposeMotion = animateNotice(root, true, from, finish, shift);
      } else if (visible && !entered) {
        entered = true;
        disposeMotion = animateNotice(root, false, undefined, () => {}, shift);
      }
    });
  });

  onDestroy(() => {
    active = false;
    disposeMotion?.();
    if (node) focusAfterNotice(node, node.contains(node.ownerDocument.activeElement));
    runtime.hover(id, false);
    runtime.focus(id, false);
  });
</script>

<style>
  :global(.ant-notification.ant-notification-list) > :global(.ant-notification-list-content) > .ant-notification-notice { position: relative; inset: auto; max-width: 100%; transform: none; transition: none; }
  .ant-notification-notice-title, .ant-notification-notice-description { min-width: 0; overflow-wrap: anywhere; }
  .ant-notification-notice-icon { display: inline-flex; }
  .ant-notification-notice-close { min-width: 24px; min-height: 24px; padding: 0; cursor: pointer; }
  .ant-notification-notice-close:disabled { cursor: default; }
  .ant-notification-notice-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--ant-margin-xs); max-width: 100%; }
  @media (prefers-reduced-motion: reduce) { .ant-notification-notice-close { transition: none; } }
</style>

{#if present}
  <div bind:this={node} {@attach mounted} role={notice.role} aria-atomic="true" aria-label={notice['aria-label']} aria-labelledby={notice['aria-labelledby'] ?? (notice['aria-label'] ? undefined : hasTitle ? `${identity}-title` : undefined)} aria-describedby={notice['aria-describedby'] ?? (hasDescription ? `${identity}-description` : undefined)} aria-hidden={notice.closing || undefined} inert={notice.closing} class={['ant-notification-notice', notice.type && `ant-notification-notice-${notice.type}`, closable && 'ant-notification-notice-closable', notice.class]} style={notice.style} onpointerenter={(event) => { if (event.pointerType !== 'touch') runtime.hover(id, true); }} onpointerleave={() => runtime.hover(id, false)} onfocusin={() => runtime.focus(id, true)} onfocusout={handleFocusOut}>
    <div class="ant-notification-notice-wrapper">
      {#if notice.icon || notice.type}<span class={['ant-notification-notice-icon', notice.type && `ant-notification-notice-icon-${notice.type}`]} aria-hidden="true">{#if notice.icon}{@render notice.icon()}{:else if notice.type}<Icon name={icons[notice.type]} />{/if}</span>{/if}
      <div class="ant-notification-notice-section">
        {#if hasTitle}<div class="ant-notification-notice-title" id={`${identity}-title`}>{#if typeof notice.title === 'function'}{@render notice.title()}{:else}{notice.title}{/if}</div>{/if}
        {#if hasDescription}<div class="ant-notification-notice-description" id={`${identity}-description`}>{#if typeof notice.description === 'function'}{@render notice.description()}{:else}{notice.description}{/if}</div>{/if}
        {#if notice.actions}<div class="ant-notification-notice-actions">{@render notice.actions()}</div>{/if}
      </div>
    </div>
    {#if closable}<button type="button" class="ant-notification-notice-close" disabled={notice.closing || closeConfig?.disabled} aria-label={closeConfig?.['aria-label'] ?? config.locale.closeText} aria-labelledby={closeConfig?.['aria-labelledby']} aria-describedby={closeConfig?.['aria-describedby']} onclick={handleClose}><span aria-hidden="true">{#if typeof closeIcon === 'function'}{@render closeIcon()}{:else if typeof closeIcon === 'string'}{closeIcon}{:else}<Icon name="close" />{/if}</span></button>{/if}
  </div>
{/if}
