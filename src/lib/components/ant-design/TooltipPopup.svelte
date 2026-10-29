<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { connectTooltipDescription } from './tooltip.dom';
  import { connectPopup } from './popup.dom';
  import type { TooltipPlacement } from './tooltip.types';

  let { title, open, anchor, describe, trigger, placement = 'top', arrow = true, autoAdjustOverflow = true, onDismiss, onHoverChange }: {
    title: string | Snippet;
    open: boolean;
    anchor?: Element;
    describe?: Element;
    trigger?: Element;
    placement?: TooltipPlacement;
    arrow?: boolean;
    autoAdjustOverflow?: boolean;
    onDismiss: () => void;
    onHoverChange?: (hovered: boolean) => void;
  } = $props();

  const config = useConfig();
  const generatedId = $props.id();
  const id = `ant-tooltip-${generatedId}`;
  let popup = $state<HTMLSpanElement>();
  let actualPlacement = $state(untrack(() => placement));
  let available = $derived(typeof title === 'function' || Boolean(title.trim()));

  $effect(() => {
    if (describe && available) return connectTooltipDescription(describe, id);
  });

  $effect(() => {
    if (!popup || !anchor || !open || !available) return;

    return connectPopup(popup, anchor, { trigger, placement, autoAdjustOverflow, onDismiss, onPlacement: (next) => { actualPlacement = next; } });
  });
</script>

<style>
  .ant-tooltip { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  .ant-tooltip[hidden], .ant-tooltip:not(:popover-open) { display: none; }
  .ant-tooltip-container { display: block; max-height: calc(100dvh - 16px); overflow: auto; overflow-wrap: anywhere; }
  .ant-tooltip-placement-top > .ant-tooltip-arrow, .ant-tooltip-placement-bottom > .ant-tooltip-arrow { left: var(--arrow-x, 50%); }
  .ant-tooltip-placement-left > .ant-tooltip-arrow, .ant-tooltip-placement-right > .ant-tooltip-arrow { top: var(--arrow-y, 50%); }
  @media (prefers-reduced-motion: reduce) { .ant-tooltip, .ant-tooltip-container { animation: none; transition: none; } }
</style>

<span bind:this={popup} {id} role="tooltip" popover="manual" hidden dir={config.direction} class={['ant-tooltip', 'ant-tooltip-css-var', `ant-tooltip-placement-${open ? actualPlacement : placement}`, config.direction === 'rtl' && 'ant-tooltip-rtl']} onpointerenter={(event) => { if (event.pointerType !== 'touch') onHoverChange?.(true); }} onpointerleave={() => onHoverChange?.(false)}>
  {#if arrow}<span class="ant-tooltip-arrow" aria-hidden="true"></span>{/if}
  <span class="ant-tooltip-container" tabindex="-1">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</span>
</span>
