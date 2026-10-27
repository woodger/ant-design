<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { connectPopup } from './popup.dom';
  import { connectPopoverTrigger, focusPopover } from './popover.dom';
  import { getTooltipDelay } from './tooltip.engine';
  import type { PopoverContent, PopoverProps, PopoverTrigger } from './popover.types';

  let { children, title, content, open = $bindable<boolean | undefined>(), defaultOpen = false, onOpenChange, trigger = ['hover', 'focus'], placement = 'top', arrow = true, autoAdjustOverflow = true, mouseEnterDelay = 0.1, mouseLeaveDelay = 0.1, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, 'aria-busy': ariaBusy, popupClass, class: className = '', style }: PopoverProps = $props();

  const config = useConfig();
  const generatedId = $props.id();
  const id = `ant-popover-${generatedId}`;
  const titleId = `${id}-title`;
  const initialDefault = untrack(() => defaultOpen);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<Element>();
  let popup = $state<HTMLDivElement>();
  let shown = $state(false);
  let actualPlacement = $state(untrack(() => placement));
  let pending: ReturnType<typeof setTimeout> | undefined;
  let hovered = false;
  let focused = false;
  let popupHovered = false;
  let popupFocused = false;
  let clicked = false;
  let dismissed = false;
  let closing = false;
  let focusOnShow = false;
  let resumeFocus: HTMLElement | undefined;
  let active = true;
  let hasTitle = $derived(hasContent(title));
  let hasBody = $derived(hasContent(content));
  let available = $derived(hasTitle || hasBody);
  let visible = $derived(available && (open ?? initialDefault));

  function hasContent(value: PopoverContent | null | undefined) {
    return typeof value === 'function' || value !== null && value !== undefined && Boolean(String(value).trim());
  }

  $effect(() => {
    const element = host;

    if (!element) return;

    function update() { anchor = element!.firstElementChild ?? element; }

    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { childList: true });

    return () => observer.disconnect();
  });

  $effect(() => {
    if (anchor && available) return connectPopoverTrigger(anchor, id, shown);
  });

  $effect.pre(() => {
    const source = anchor;
    const surface = popup;

    if (visible) return;

    clicked = false;
    focusOnShow = false;
    // Возвращаем фокус до удаления условного snippet и скрытия поверхности.
    if (surface?.contains(surface.ownerDocument.activeElement) && source instanceof HTMLElement && source.isConnected) {
      untrack(() => {
        closing = true;
        source.focus({ preventScroll: true });
        closing = false;
      });
    }
  });

  $effect(() => {
    const surface = popup;
    const source = anchor;

    if (!surface || !source || !visible) return;

    // Положение меняется без повторного hide/show, чтобы сохранить ввод и фокус.
    const disconnect = untrack(() => connectPopup(surface, source, {
      trigger: host,
      get placement() { return placement; },
      get autoAdjustOverflow() { return autoAdjustOverflow; },
      maxWidth: '100vw',
      preserveFocus: false,
      onPlacement: (next) => { actualPlacement = next; },
      onDismiss: dismiss,
      onVisibilityChange: (next) => {
        shown = next;
        if (!next) { popupFocused = false; popupHovered = false; }
        else if (resumeFocus?.isConnected) { resumeFocus.focus({ preventScroll: true }); resumeFocus = undefined; }
        else if (focusOnShow) { focusOnShow = false; focusPopover(surface); }
      }
    }));

    return () => {
      resumeFocus = surface.contains(surface.ownerDocument.activeElement) ? surface.ownerDocument.activeElement as HTMLElement : undefined;

      closing = true;
      disconnect();
      closing = false;
    };
  });

  onDestroy(() => { active = false; cancelPending(); });

  function cancelPending() {
    if (pending !== undefined) clearTimeout(pending);
    pending = undefined;
  }

  function supports(kind: PopoverTrigger) {
    return typeof trigger === 'string' ? trigger === kind : trigger.includes(kind);
  }

  function wanted() {
    return !dismissed && (clicked || popupHovered || popupFocused || hovered && supports('hover') || focused && supports('focus'));
  }

  function request(next: boolean, delay = 0) {
    cancelPending();
    const target = anchor;
    const ownerValue = open;

    function apply() {
      pending = undefined;
      if (!active || next && !available || !target?.isConnected || target !== anchor || !Object.is(open, ownerValue) || next && !wanted()) return;

      if (next !== (open ?? initialDefault)) { open = next; onOpenChange?.(next); }
      if (next && visible && shown && focusOnShow && popup) { focusOnShow = false; focusPopover(popup); }
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

  function handleFocus(event: FocusEvent) {
    focused = true;
    if (!active || closing || !shown && event.relatedTarget instanceof Node && popup?.contains(event.relatedTarget)) return;

    dismissed = false;
    if (supports('focus')) request(true);
  }

  function handleBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && host?.contains(event.relatedTarget)) return;

    focused = false;
    if (closing || event.relatedTarget instanceof Node && popup?.contains(event.relatedTarget)) return;

    clicked = false;
    if (!wanted()) request(false);
  }

  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented || !supports('click') || anchor?.matches(':disabled, [aria-disabled="true"]')) return;

    if (clicked || visible && !wanted()) dismiss('trigger');
    else { clicked = true; dismissed = false; focusOnShow = true; request(true); }
  }

  function handlePopupHover(next: boolean) {
    popupHovered = next;
    if (next) cancelPending();
    else if (!wanted()) request(false, getTooltipDelay(mouseLeaveDelay));
  }

  function handlePopupBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && popup?.contains(event.relatedTarget)) return;

    popupFocused = false;
    if (closing || !shown || event.relatedTarget instanceof Node && host?.contains(event.relatedTarget)) return;

    clicked = false;
    if (!wanted()) request(false);
  }

  function dismiss(reason: 'escape' | 'outside' | 'trigger') {
    const previous = { clicked, dismissed, focusOnShow };
    clicked = false;
    dismissed = true;
    focusOnShow = false;
    request(false);
    if (visible) {
      ({ clicked, dismissed, focusOnShow } = previous);
      return;
    }
    if (reason === 'escape' && popup?.contains(popup.ownerDocument.activeElement) && anchor instanceof HTMLElement) {
      closing = true;
      anchor.focus({ preventScroll: true });
      closing = false;
    }
  }
</script>

<style>
  .ant-popover-trigger { display: inline-block; max-width: 100%; vertical-align: middle; }
  .ant-popover { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  .ant-popover[hidden], .ant-popover:not(:popover-open) { display: none; }
  .ant-popover-container { box-sizing: border-box; max-height: calc(100dvh - 16px); overflow: auto; overflow-wrap: anywhere; }
  .ant-popover-title { min-width: min(var(--ant-popover-title-min-width), calc(100vw - 48px)); }
  .ant-popover-placement-top > .ant-popover-arrow, .ant-popover-placement-bottom > .ant-popover-arrow { left: var(--arrow-x, 50%); }
  .ant-popover-placement-left > .ant-popover-arrow, .ant-popover-placement-right > .ant-popover-arrow { top: var(--arrow-y, 50%); }
  @media (prefers-reduced-motion: reduce) { .ant-popover, .ant-popover-container { animation: none; transition: none; } }
</style>

<span bind:this={host} role="presentation" class={['ant-popover-trigger', className]} {style} onpointerenter={handleEnter} onpointerleave={handleLeave} onfocusin={handleFocus} onfocusout={handleBlur} onclick={handleClick}>{@render children()}</span>
<div bind:this={popup} {id} role="dialog" popover="manual" hidden tabindex="-1" dir={config.direction} aria-label={ariaLabel} aria-labelledby={!ariaLabel ? ariaLabelledby ?? (hasTitle ? titleId : undefined) : undefined} aria-describedby={ariaDescribedby} aria-busy={ariaBusy} class={['ant-popover', popupClass, `ant-popover-placement-${shown ? actualPlacement : placement}`, config.direction === 'rtl' && 'ant-popover-rtl']} onpointerenter={(event) => { if (event.pointerType !== 'touch') handlePopupHover(true); }} onpointerleave={() => handlePopupHover(false)} onfocusin={() => { popupFocused = true; cancelPending(); }} onfocusout={handlePopupBlur}>
  {#if arrow}<div class="ant-popover-arrow" aria-hidden="true"></div>{/if}
  <div class="ant-popover-container">
    {#if hasTitle}<div id={titleId} class="ant-popover-title">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</div>{/if}
    {#if hasBody}<div class="ant-popover-content">{#if typeof content === 'function'}{@render content()}{:else}{content}{/if}</div>{/if}
  </div>
</div>
