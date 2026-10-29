<script lang="ts">
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { compactEntries } from './space-compact.engine';
  import { spaceOrientation } from './space.engine';
  import { connectFeedbackFocus } from './feedback.dom';
  import SpaceCompactItem from './SpaceCompactItem.svelte';
  import type { SpaceCompactProps } from './space-compact.types';

  let { items, children, size, orientation, vertical, direction, block = false, class: className = '', rootClassName = '', style,
    nativeElement = $bindable(), ...rest }: SpaceCompactProps = $props();
  const config = useConfig();
  const parent = useCompact();
  let entries = $derived(compactEntries(items, children));
  let actualOrientation = $derived(spaceOrientation(orientation, vertical, direction));
  let actualSize = $derived(size ?? config.explicitComponentSize);
  let retainedFocus: HTMLElement | undefined;
  $effect.pre(() => {
    const host = nativeElement;
    const focused = host?.ownerDocument.activeElement;
    retainedFocus = entries.length && host && focused instanceof HTMLElement && host.contains(focused) ? focused : undefined;
  });
  $effect(() => {
    const host = nativeElement;
    const focused = retainedFocus;
    retainedFocus = undefined;
    if (entries.length && host && focused?.isConnected && host.contains(focused) && host.ownerDocument.activeElement === host.ownerDocument.body
      && focused.getClientRects().length && !focused.matches(':disabled') && !focused.closest('[inert]') && host.ownerDocument.defaultView!.getComputedStyle(focused).visibility === 'visible') focused.focus({ preventScroll: true });
  });
  $effect(() => { if (nativeElement) return connectFeedbackFocus(nativeElement); });
</script>

{#if entries.length}
  <div {...rest} bind:this={nativeElement} dir={config.direction} class={['ant-space-compact ant-space-compact-css-var', actualOrientation === 'vertical' && 'ant-space-compact-vertical', block && 'ant-space-compact-block', config.direction === 'rtl' && 'ant-space-compact-rtl', className, rootClassName]} {style}>
    {#each entries as item, index (item.key)}
      <SpaceCompactItem children={item.children} size={actualSize} orientation={actualOrientation} first={index === 0 && (!parent || parent.first)} last={index === entries.length - 1 && (!parent || parent.last)} />
    {/each}
  </div>
{/if}
