<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { resolveAvatarSize, normalizeAvatarGap } from './avatar.engine';
  import { connectAvatarText } from './avatar.dom';
  import type { AvatarProps } from './avatar.types';

  let {
    src,
    srcSet,
    alt,
    crossOrigin,
    draggable,
    shape = 'circle',
    size,
    gap = 4,
    icon,
    children,
    onError,
    id,
    title,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-hidden': ariaHidden = false,
    class: className = '',
    style
  }: AvatarProps = $props();
  const config = useConfig();
  let host = $state<HTMLSpanElement>();
  let sourceSrc = $derived(src);
  let sourceSet = $derived(srcSet);
  let source = $derived({ src: sourceSrc, srcSet: sourceSet });
  let failed = $state.raw<typeof source>();
  let hasImage = $derived(Boolean(source.src) && failed !== source);
  let resolvedSize = $derived(resolveAvatarSize(size, config.componentSize));
  let rootStyle = $derived(
    [
      typeof resolvedSize === 'number'
        ? `width: ${resolvedSize}px; height: ${resolvedSize}px; font-size: ${icon
          ? resolvedSize / 2
          : 18}px;`
        : '',
      style
    ].filter(
      Boolean
    ).join(
      ' '
    )
    || undefined
  );
  let resolvedGap = $derived(normalizeAvatarGap(gap));
  let named = $derived(Boolean(ariaLabel || ariaLabelledby || alt));
  let hidden = $derived(ariaHidden || !named);

  function watchImage(node: HTMLImageElement, request: typeof source) {
    let reported = false;
    const error = () => {
      if (reported || request !== source) return;

      reported = true;
      const fallback = onError?.() !== false;
      if (fallback && request === source)
        failed = request;
    };
    node.addEventListener('error', error);
    if (node.complete && node.naturalWidth === 0)
      untrack(error);
    return () => {
      reported = true;
      node.removeEventListener('error', error);
    };
  }
  function fitText(node: HTMLSpanElement) {
    const container = host;
    const distance = resolvedGap;
    if (container) return connectAvatarText(container, node, distance);
  }
</script>

<style>
  .ant-avatar { flex-shrink: 0; }
  .ant-avatar-string { display: inline-block; flex: none; transform-origin: center; white-space: nowrap; }
  .ant-avatar-icon-content { display: inline-flex; align-items: center; justify-content: center; width: 1em; height: 1em; }
  .ant-avatar-icon-content :global(svg) { width: 1em; height: 1em; }
  @media (prefers-reduced-motion: reduce) { .ant-avatar, .ant-avatar-string { animation: none; transition: none; } }
</style>

<span bind:this={host} {id} {title} role={!hidden ? 'img' : undefined} aria-label={ariaLabel ?? (ariaLabelledby ? undefined : alt || undefined)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} aria-hidden={hidden || undefined} dir={config.direction} class={[
    'ant-avatar ant-avatar-css-var',
    `ant-avatar-${shape}`,
    resolvedSize === 'small' && 'ant-avatar-sm',
    resolvedSize === 'large' && 'ant-avatar-lg',
    hasImage && 'ant-avatar-image',
    icon && 'ant-avatar-icon',
    className
  ]} style={rootStyle}>
  {#if hasImage}{#key source}{@const request = source}<img src={request.src} srcset={request.srcSet} alt="" aria-hidden="true" {draggable} crossorigin={crossOrigin} {@attach node => watchImage(node, request)} />{/key}{:else if icon}<span class="ant-avatar-icon-content" aria-hidden="true" inert>{@render icon()}</span>{:else}<span class="ant-avatar-string" aria-hidden="true" inert {@attach fitText}>{@render children?.()}</span>{/if}
</span>
