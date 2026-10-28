<script lang="ts">
  import { useConfig } from './config-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import BuiltinImage from './EmptyImage.svelte';
  import { ruRU } from './types';
  import type { EmptyProps } from './empty.types';

  let { image = 'default', description, children, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, class: className = '', style }: EmptyProps = $props();
  const config = useConfig();
  let host = $state<HTMLDivElement>();
  let strings = $derived({ ...ruRU.empty, ...config.locale.empty });
  let content = $derived(description === undefined ? strings.description : description);
  let hasDescription = $derived(typeof content === 'function' || Boolean(content));

  $effect(() => {
    const node = host;
    const interactive = Boolean(children) || typeof description === 'function';
    if (node && interactive) return connectFeedbackFocus(node);
  });
</script>

<style>
  .ant-empty { min-width: 0; max-width: 100%; }
  .ant-empty-description { min-width: 0; overflow-wrap: anywhere; }
  .ant-empty-image { min-width: 0; max-width: 100%; }
  .ant-empty-image :global(img), .ant-empty-image :global(svg) { max-width: 100%; max-height: 100%; object-fit: contain; }
  .ant-empty-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; min-width: 0; }
  .ant-empty-footer > :global(*) { max-width: 100%; }
</style>

<div bind:this={host} {id} role={ariaLabel || ariaLabelledby ? 'group' : undefined} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={['ant-empty ant-empty-css-var', image === 'simple' && 'ant-empty-normal', config.direction === 'rtl' && 'ant-empty-rtl', className]} {style}>
  {#if image !== false}<div class="ant-empty-image" aria-hidden="true" inert>{#if typeof image === 'function'}{@render image()}{:else}<BuiltinImage simple={image === 'simple'} />{/if}</div>{/if}
  {#if hasDescription}<div class="ant-empty-description">{#if typeof content === 'function'}{@render content()}{:else}{content}{/if}</div>{/if}
  {#if children}<div class="ant-empty-footer">{@render children()}</div>{/if}
</div>
