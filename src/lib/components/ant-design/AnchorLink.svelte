<script lang="ts">
  import { untrack } from 'svelte';
  import { useAnchor } from './anchor-context';
  import type { AnchorLinkProps } from './anchor.types';
  let { href, title, target, class: className = '', replace, targetOffset, children }: AnchorLinkProps = $props();
  const context = useAnchor();
  $effect(() => {
    const link = href; const offset = targetOffset;
    return untrack(() => context?.register(link, offset));
  });
  function click(event: MouseEvent) {
    context?.click(event, href, title, targetOffset);
    if (event.defaultPrevented) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (replace) { event.preventDefault(); window.location.replace(href); }
      return;
    }
    event.preventDefault();
    window.history[replace ? 'replaceState' : 'pushState'](null, '', href);
  }
</script>

<div class={['ant-anchor-link', className, context?.classNames.item, context?.activeLink === href && 'ant-anchor-link-active']} style={context?.styles.item}>
  <a class={['ant-anchor-link-title', context?.classNames.itemTitle, context?.activeLink === href && 'ant-anchor-link-title-active']} style={context?.styles.itemTitle}
    {href} {target} title={typeof title === 'string' ? title : undefined} onclick={click}>
    {#if typeof title === 'function'}{@render title()}{:else if title !== true && title !== false}{title ?? ''}{/if}
  </a>
  {#if context?.direction !== 'horizontal'}{@render children?.()}{/if}
</div>
