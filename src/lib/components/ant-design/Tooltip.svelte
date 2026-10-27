<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { getTooltipDelay } from './tooltip.engine';
  import type { TooltipProps, TooltipTrigger } from './tooltip.types';
  import TooltipPopup from './TooltipPopup.svelte';

  let { title, children, open = $bindable<boolean | undefined>(), defaultOpen = false, onOpenChange, placement = 'top', arrow = true, autoAdjustOverflow = true, trigger = ['hover', 'focus'], mouseEnterDelay = 0.1, mouseLeaveDelay = 0.1, class: className = '', style }: TooltipProps = $props();

  const initialDefault = untrack(() => defaultOpen);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<Element>();
  let pending: ReturnType<typeof setTimeout> | undefined;
  let hovered = false;
  let focused = false;
  let popupHovered = false;
  let dismissed = false;
  let active = true;
  let text = $derived(title === undefined || title === null ? '' : String(title));
  let available = $derived(Boolean(text.trim()));
  let visible = $derived(available && (open ?? initialDefault));

  $effect(() => {
    const element = host;

    if (!element) return;

    function update() { anchor = element!.firstElementChild ?? element; }

    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { childList: true });

    return () => observer.disconnect();
  });

  onDestroy(() => { active = false; cancelPending(); });

  function cancelPending() {
    if (pending !== undefined) clearTimeout(pending);
    pending = undefined;
  }

  function supports(kind: TooltipTrigger) {
    return typeof trigger === 'string' ? trigger === kind : trigger.includes(kind);
  }

  function wanted() {
    return !dismissed && (hovered && supports('hover') || focused && supports('focus') || popupHovered);
  }

  function request(next: boolean, delay = 0) {
    cancelPending();
    const target = anchor;
    const ownerValue = open;

    function apply() {
      pending = undefined;

      if (!active || !available || !target?.isConnected || target !== anchor || !Object.is(open, ownerValue) || next && !wanted() || next === (open ?? initialDefault)) return;

      open = next;
      onOpenChange?.(next);
    }

    if (delay) pending = setTimeout(apply, delay);
    else apply();
  }

  function handleEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') return;

    hovered = true;
    dismissed = false;
    if (supports('hover')) request(true, getTooltipDelay(mouseEnterDelay));
  }

  function handleLeave() {
    hovered = false;
    if (!wanted()) request(false, getTooltipDelay(mouseLeaveDelay));
  }

  function handleFocus() {
    focused = true;
    dismissed = false;
    if (supports('focus')) request(true);
  }

  function handleBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && host?.contains(event.relatedTarget)) return;

    focused = false;
    if (!wanted()) request(false);
  }

  function handlePopupHover(next: boolean) {
    popupHovered = next;
    if (next) cancelPending();
    else if (!wanted()) request(false, getTooltipDelay(mouseLeaveDelay));
  }

  function dismiss() {
    dismissed = true;
    request(false);
  }
</script>

<style>
  .ant-tooltip-trigger { display: inline-block; max-width: 100%; vertical-align: middle; }
</style>

<span bind:this={host} role="presentation" class={['ant-tooltip-trigger', className]} {style} onpointerenter={handleEnter} onpointerleave={handleLeave} onfocusin={handleFocus} onfocusout={handleBlur}>{@render children()}</span>
<TooltipPopup title={text} open={visible} {anchor} describe={anchor} trigger={host} {placement} {arrow} {autoAdjustOverflow} onDismiss={dismiss} onHoverChange={handlePopupHover} />
