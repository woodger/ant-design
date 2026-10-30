<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import { onDestroy, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { useWatermarkPanel } from './watermark-context';
  import { createDrawerDialog } from './drawer.dom';
  import { getDrawerSize } from './drawer.engine';
  import type { DrawerProps } from './drawer.types';

  let { open = $bindable(false), title, children, extra, footer, placement = 'right', size = 'default', closable = true, keyboard = true, mask, forceRender = false, destroyOnHidden = false, onClose, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, class: className = '', style }: DrawerProps = $props();

  const config = useConfig();
  const watermarkPanel = useWatermarkPanel();
  const generatedId = $props.id();
  let dialog = $state<HTMLDialogElement>();
  let mounted = $state(false);
  // Это фаза фактической DOM-анимации, а не копия запрошенного open.
  let closing = $state(false);
  let runtime: ReturnType<typeof createDrawerDialog> | undefined;
  let backdropPointer: number | undefined;
  let active = true;
  let rootId = $derived(id ?? `ant-drawer-${generatedId}`);
  let titleId = $derived(`${rootId}-title`);
  let renderContent = $derived(open || closing || forceRender || mounted && !destroyOnHidden);

  // Содержимое остаётся смонтированным до завершения ухода панели.
  $effect.pre(() => {
    const node = dialog;
    const requested = open;
    const side = placement;
    if (node && !requested) untrack(() => runtime?.sync(false, side));
  });

  $effect(() => {
    const node = dialog;
    const requested = open;
    const side = placement;
    if (!node) return;

    untrack(() => {
      runtime ??= createDrawerDialog(node, (value) => { closing = value; });
      runtime.sync(requested, side);
    });
  });

  onDestroy(() => { active = false; runtime?.destroy(); });

  function rememberContent() {
    mounted = true;
    return () => { mounted = false; };
  }

  function requestClose(event: Event) {
    if (!active || !open) return;

    backdropPointer = undefined;
    open = false;
    onClose?.(event);
  }

  function handleCancel(event: Event) {
    event.preventDefault();
    if (keyboard) requestClose(event);
  }

  function isBackdrop(event: PointerEvent) {
    return event.target === dialog || event.target instanceof HTMLElement && event.target.classList.contains('ant-drawer-mask') && event.target.parentElement === dialog;
  }

  function handlePointerUp(event: PointerEvent) {
    const dismiss = event.pointerId === backdropPointer && isBackdrop(event);
    backdropPointer = undefined;
    if (mask?.closable !== false && dismiss) requestClose(event);
  }

  function handleClose() {
    if (!active || dialog?.open) return;

    runtime?.nativeClosed();
    open = false;
  }
</script>

<style>
  :global(html:has(dialog.ant-svelte-drawer[open])) { overflow: hidden; }
  .ant-svelte-drawer { width: 100%; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; overflow: hidden; background: transparent; pointer-events: auto; outline: none; }
  .ant-svelte-drawer:not([open]) { display: none; }
  .ant-svelte-drawer::backdrop { background: transparent; }
  .ant-svelte-drawer > .ant-drawer-content-wrapper { max-width: 100%; max-height: 100%; transition: none; }
  .ant-drawer-left > .ant-drawer-content-wrapper, .ant-drawer-right > .ant-drawer-content-wrapper { width: min(var(--ant-svelte-drawer-size), 100%); height: 100%; }
  .ant-drawer-top > .ant-drawer-content-wrapper, .ant-drawer-bottom > .ant-drawer-content-wrapper { width: 100%; height: min(var(--ant-svelte-drawer-size), 100%); }
  .ant-drawer-header { gap: var(--ant-margin-xs); }
  .ant-drawer-title, .ant-drawer-extra, .ant-drawer-body, .ant-drawer-footer { min-width: 0; overflow-wrap: anywhere; }
  .ant-drawer-title { color: var(--ant-color-text-heading); }
  .ant-drawer-extra { max-width: 50%; }
  .ant-drawer-section { min-height: 0; }
  @media (prefers-reduced-motion: reduce) { .ant-drawer-close { transition: none; } }
</style>

<NoCompactStyle>
<dialog bind:this={dialog} id={rootId} class={['ant-drawer ant-drawer-css-var ant-svelte-drawer', `ant-drawer-${placement}`, config.direction === 'rtl' && 'ant-drawer-rtl', className]} {style} style:--ant-svelte-drawer-size={getDrawerSize(size)} dir={config.direction} aria-modal="true" aria-label={ariaLabel} aria-labelledby={ariaLabelledby ?? (ariaLabel === undefined && title !== undefined ? titleId : undefined)} aria-describedby={ariaDescribedby} oncancel={handleCancel} onclose={handleClose} onpointerdown={(event) => { backdropPointer = event.button === 0 && isBackdrop(event) ? event.pointerId : undefined; }} onpointerup={handlePointerUp} onpointercancel={() => { backdropPointer = undefined; }}>
  <div class={['ant-drawer-mask', mask?.blur && 'ant-drawer-mask-blur']} aria-hidden="true"></div>
  <div class="ant-drawer-content-wrapper">
    {#if renderContent}
      <div class="ant-drawer-section" {@attach rememberContent} {@attach watermarkPanel}>
        {#if title !== undefined || closable || extra}
          <div class="ant-drawer-header">
            <div class="ant-drawer-header-title">
              {#if closable}<button type="button" class="ant-drawer-close" aria-label={config.locale.closeText} onclick={requestClose}><Icon name="close" /></button>{/if}
              {#if title !== undefined}<h2 id={titleId} class="ant-drawer-title">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</h2>{/if}
            </div>
            {#if extra}<div class="ant-drawer-extra">{@render extra()}</div>{/if}
          </div>
        {/if}
        <div class="ant-drawer-body">{@render children?.()}</div>
        {#if footer}<div class="ant-drawer-footer">{@render footer()}</div>{/if}
      </div>
    {/if}
  </div>
</dialog>
</NoCompactStyle>
