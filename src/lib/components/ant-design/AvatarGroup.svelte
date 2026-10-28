<script lang="ts">
  import Avatar from './Avatar.svelte';
  import AvatarGroupOverflow from './AvatarGroupOverflow.svelte';
  import { getAvatarGroupItems } from './avatar-group.engine';
  import { useConfig } from './config-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import { ruRU } from './types';
  import type { AvatarGroupProps } from './avatar-group.types';

  let { items = [], size, shape, max, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, class: className = '', style }: AvatarGroupProps = $props();
  const config = useConfig();
  let host = $state<HTMLDivElement>();
  let layout = $derived(getAvatarGroupItems(items, max?.count));
  let strings = $derived({ ...ruRU.avatarGroup, ...config.locale.avatarGroup });
  $effect(() => { const node = host; if (node) return connectFeedbackFocus(node); });
</script>

<style>
  .ant-avatar-group { align-items: center; flex-wrap: wrap; row-gap: 8px; max-width: 100%; padding-inline-start: calc(-1 * var(--ant-avatar-group-overlapping)); vertical-align: middle; }
  .ant-avatar-group > :global(*) { margin-inline-start: var(--ant-avatar-group-overlapping); }
  .ant-avatar-group :global(.ant-avatar) { --ant-avatar-group-border-color: var(--ant-color-bg-container); }
  .ant-avatar-group-overflow { display: inline-flex; flex-shrink: 0; }
</style>

<div bind:this={host} {id} role="group" aria-label={ariaLabel ?? (ariaLabelledby ? undefined : strings.label)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={['ant-avatar-group ant-avatar-css-var', config.direction === 'rtl' && 'ant-avatar-group-rtl', className]} {style}>
  {#each layout.visible as item (item.key)}<Avatar {...item} alt={item.alt ?? item.label} size={item.size ?? size} shape={item.shape ?? shape}>{#if item.children}{@render item.children()}{:else}{item.text}{/if}</Avatar>{/each}
  {#if layout.hidden.length}<span class="ant-avatar-group-overflow"><AvatarGroupOverflow items={layout.hidden} {size} {shape} {max} /></span>{/if}
</div>
