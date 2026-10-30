<script lang="ts">
  import { useConfig } from './config-context';
  import { spaceEntries, spaceGap, spaceHasContent, spaceOrientation } from './space.engine';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { SpaceContent, SpaceProps } from './space.types';

  let {
    items,
    children,
    size = 'small',
    orientation,
    vertical,
    direction,
    align,
    separator,
    split,
    wrap,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: SpaceProps = $props();
  const config = useConfig();
  let entries = $derived(spaceEntries(items, children));
  let latest = $derived(
    entries.reduce((index, item, next) => spaceHasContent(item.children) ? next : index, 0)
  );
  let actualOrientation = $derived(spaceOrientation(orientation, vertical, direction));
  let actualAlign = $derived(
    align ?? (actualOrientation === 'horizontal' ? 'center' : undefined)
  );
  let actualSeparator = $derived(separator ?? split);
  let gap = $derived(spaceGap(size));
  let info = $derived(
    {
      props: {
        ...rest,
        items,
        children,
        size,
        orientation: actualOrientation,
        vertical,
        direction,
        align: actualAlign,
        separator,
        split,
        wrap,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
  let retainedFocus: HTMLElement | undefined;
  $effect.pre(() => {
    const host = nativeElement;
    const focused = host?.ownerDocument.activeElement;
    retainedFocus = entries.length
      && host
      && focused instanceof HTMLElement
      && host.contains(
        focused
      )
      ? focused
      : undefined;
  });
  $effect(() => {
    const host = nativeElement;
    const focused = retainedFocus;
    retainedFocus = undefined;
    // Keyed DOM сохраняется, но перемещение input через before() сбрасывает фокус браузера.
    if (entries.length
      && host
      && focused?.isConnected
      && host.contains(focused)
      && host.ownerDocument.activeElement === host.ownerDocument.body
      && focused.getClientRects().length
      && !focused.matches(':disabled')
      && !focused.closest(
        '[inert]'
      )
      && host.ownerDocument.defaultView!.getComputedStyle(
        focused
      ).visibility === 'visible')
      focused.focus({ preventScroll: true });
  });
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
</script>

{#snippet value(node: SpaceContent)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#if entries.length}
  <div {...rest} bind:this={nativeElement} dir={config.direction} class={[
      'ant-space ant-space-css-var',
      `ant-space-${actualOrientation}`,
      config.direction === 'rtl' && 'ant-space-rtl',
      actualAlign && `ant-space-align-${actualAlign}`,
      gap.classes,
      className,
      rootClassName,
      classes.root
    ]}
    style={[wrap && 'flex-wrap:wrap', gap.style, slots.root, style].filter(
        Boolean
      ).join(
        ';'
      )}>
    {#each entries as item, index (item.key)}
      {#if spaceHasContent(item.children)}
        <div class={['ant-space-item', classes.item]} style={slots.item}>{@render value(item.children)}</div>
        {#if index < latest && actualSeparator}<span class={['ant-space-item-separator', classes.separator]} style={slots.separator}>{@render value(actualSeparator)}</span>{/if}
      {/if}
    {/each}
  </div>
{/if}
