<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { resolveSkeletonLayout } from './skeleton.engine';
  import { createSkeletonFocus } from './skeleton.dom';
  import { ruRU } from './types';
  import type { SkeletonProps } from './skeleton.types';

  let { loading = true, active = false, round = false, avatar = false, title = true, paragraph = true, children, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, 'aria-hidden': ariaHidden, class: className = '', style }: SkeletonProps = $props();
  const config = useConfig();
  const focus = createSkeletonFocus();
  let host = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let layout = $derived(resolveSkeletonLayout({ avatar, title, paragraph }));
  let strings = $derived({ ...ruRU.skeleton, ...config.locale.skeleton });
  let label = $derived(ariaLabel ?? (ariaLabelledby ? undefined : strings.loadingText));

  $effect.pre(() => {
    const node = host;
    const container = content;
    const busy = loading;
    if (node) untrack(() => focus.update(node, container, busy));
  });
  onDestroy(() => focus.destroy());
</script>

<style>
  .ant-skeleton-host, .ant-skeleton-content { min-width: 0; max-width: 100%; }
  .ant-skeleton-host:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  .ant-skeleton { display: flex; min-width: 0; max-width: 100%; }
  .ant-skeleton .ant-skeleton-header { display: block; flex: 0 1 auto; min-width: 0; max-width: 50%; }
  .ant-skeleton .ant-skeleton-header:only-child { max-width: 100%; padding-inline-end: 0; }
  .ant-skeleton .ant-skeleton-header .ant-skeleton-avatar { max-width: 100%; height: auto; aspect-ratio: 1; }
  .ant-skeleton .ant-skeleton-section { display: block; flex: 1; min-width: 0; }
  .ant-skeleton-title, .ant-skeleton-paragraph > li { max-width: 100%; }
  .ant-skeleton-title { margin-block: 1em; }
  .loading-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  @media (prefers-reduced-motion: reduce) {
    .ant-skeleton.ant-skeleton-active .ant-skeleton-title, .ant-skeleton.ant-skeleton-active .ant-skeleton-paragraph > li, .ant-skeleton.ant-skeleton-active .ant-skeleton-avatar { animation: none; background: var(--ant-skeleton-gradient-from-color); }
  }
</style>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Отрицательный tabindex нужен для фокуса при замене children каркасом.) -->
<div bind:this={host} {id} role={ariaHidden ? undefined : 'group'} aria-label={label} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} aria-hidden={ariaHidden || undefined} tabindex={children ? -1 : undefined} dir={config.direction} class={['ant-skeleton-host', className]} {style}>
  {#if loading && !ariaHidden}<span class="loading-status" role="status" aria-live="polite" aria-atomic="true">{strings.loadingText}</span>{/if}
  <div bind:this={content} class="ant-skeleton-content" aria-busy={loading}>
    {#if loading}
      <div class={['ant-skeleton ant-skeleton-css-var', layout.avatar && 'ant-skeleton-with-avatar', active && 'ant-skeleton-active', round && 'ant-skeleton-round', config.direction === 'rtl' && 'ant-skeleton-rtl']} aria-hidden="true">
        {#if layout.avatar}<div class="ant-skeleton-header"><span class={['ant-skeleton-avatar', `ant-skeleton-avatar-${layout.avatar.shape}`, !layout.avatar.width && layout.avatar.size === 'small' && 'ant-skeleton-avatar-sm', !layout.avatar.width && layout.avatar.size === 'large' && 'ant-skeleton-avatar-lg']} style:width={layout.avatar.width}></span></div>{/if}
        {#if layout.title || layout.paragraph}<div class="ant-skeleton-section">{#if layout.title}<div class="ant-skeleton-title" style:width={layout.title.width}></div>{/if}{#if layout.paragraph}<ul class="ant-skeleton-paragraph">{#each layout.paragraph.widths as width, index (index)}<li style:width></li>{/each}</ul>{/if}</div>{/if}
      </div>
    {:else if children}{@render children()}{/if}
  </div>
</div>
