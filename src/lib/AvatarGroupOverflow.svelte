<script lang="ts">
  import Avatar from './Avatar.svelte';
  import Popover from './Popover.svelte';
  import { useConfig } from './config-context';
  import { ruRU } from './types';
  import type { AvatarGroupItem, AvatarGroupMax } from './avatar-group.types';
  import type { AvatarShape, AvatarSize } from './avatar.types';

  let { items, size, shape, max }: { items: readonly AvatarGroupItem[]; size?: AvatarSize; shape?: AvatarShape; max?: AvatarGroupMax } = $props();
  const config = useConfig();
  let open = $state<boolean | undefined>(false);
  let strings = $derived({ ...ruRU.avatarGroup, ...config.locale.avatarGroup });
</script>

<style>
  .ant-avatar-group-more { display: inline-flex; padding: 0; margin: 0; border: 0; border-radius: 50%; background: transparent; color: inherit; font: inherit; vertical-align: middle; cursor: pointer; }
  .ant-avatar-group-more:focus-visible { position: relative; z-index: 1; outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-avatar-group-list { display: grid; gap: var(--ant-avatar-group-space); padding: 0; margin: 0; list-style: none; max-width: 100%; }
  .ant-avatar-group-list li { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .ant-avatar-group-name { min-width: 0; overflow-wrap: anywhere; }
  @media (prefers-reduced-motion: reduce) { .ant-avatar-group-more { transition: none; animation: none; } }
</style>

{#snippet hiddenItems()}{#if open}<ul class="ant-avatar-group-list" aria-label={strings.hiddenLabel}>{#each items as item (item.key)}<li><Avatar {...item} size={item.size ?? size} shape={item.shape ?? shape} aria-hidden>{#if item.children}{@render item.children()}{:else}{item.text}{/if}</Avatar><span class="ant-avatar-group-name">{item.label}</span></li>{/each}</ul>{/if}{/snippet}
<Popover bind:open title={strings.hiddenLabel} content={hiddenItems} trigger={max?.popover?.trigger ?? ['hover', 'click']} placement={max?.popover?.placement ?? 'top'} arrow={max?.popover?.arrow} autoAdjustOverflow={max?.popover?.autoAdjustOverflow} mouseEnterDelay={max?.popover?.mouseEnterDelay} mouseLeaveDelay={max?.popover?.mouseLeaveDelay} aria-label={strings.hiddenLabel} popupClass="ant-avatar-group-popover">
  <button type="button" class="ant-avatar-group-more" aria-label={`${strings.overflow}: ${items.length}`}><Avatar {size} {shape} style={max?.style} aria-hidden>+{items.length}</Avatar></button>
</Popover>
