<script lang="ts">
  import AnchorItems from './AnchorItems.svelte';
  import AnchorLink from './AnchorLink.svelte';
  import type { AnchorItem } from './anchor.types';
  let { items, replace }: { items?: readonly AnchorItem[]; replace?: boolean; } = $props();
</script>

{#each items ?? [] as item (item.key)}
  <AnchorLink href={item.href} title={item.title} target={item.target} class={item.class} targetOffset={item.targetOffset} replace={'replace' in item ? item.replace : replace}>
    <AnchorItems items={item.children} {replace} />
  </AnchorLink>
{/each}
