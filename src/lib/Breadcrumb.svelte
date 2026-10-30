<script lang="ts" generics="Params extends Record<string, unknown> = Record<string, unknown>">
  import { useConfig } from './config-context';
  import { breadcrumbEntries, breadcrumbHasContent, breadcrumbItems } from './breadcrumb.engine';
  import BreadcrumbEntry from './BreadcrumbEntry.svelte';
  import type { BreadcrumbContent, BreadcrumbProps } from './breadcrumb.types';

  let { items, routes, params = {} as Params, separator, dropdownIcon, itemRender, classNames, styles,
    class: className = '', rootClassName = '', style, nativeElement = $bindable(), ...rest }: BreadcrumbProps<Params> = $props();
  const config = useConfig();
  let mergedSeparator = $derived(separator ?? '/');
  let mergedItems = $derived(breadcrumbItems(items, routes));
  let entries = $derived(breadcrumbEntries(mergedItems, params));
  let info = $derived({ props: { ...rest, items, routes, params, separator: mergedSeparator, dropdownIcon, itemRender, classNames, styles, class: className, rootClassName, style } });
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
</script>

{#snippet value(node: BreadcrumbContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<nav {...rest} bind:this={nativeElement} dir={config.direction} class={['ant-breadcrumb ant-breadcrumb-css-var', config.direction === 'rtl' && 'ant-breadcrumb-rtl', className, rootClassName, classes.root]} style={[slots.root, style].filter(Boolean).join(';')}>
  <ol>{#each entries as entry, index (entry.item.key ?? index)}
    {#if entry.item.type === 'separator'}
      <li class={['ant-breadcrumb-separator', classes.separator]} style={slots.separator} aria-hidden="true">{@render value(entry.item.separator ?? '/')}</li>
    {:else if itemRender || entry.item.menu || entry.title !== null}
      <BreadcrumbEntry {entry} {params} routes={items ?? routes ?? []} {itemRender} {dropdownIcon} {classes} styles={slots} />
      {#if index < entries.length - 1 && breadcrumbHasContent(mergedSeparator)}<li class={['ant-breadcrumb-separator', classes.separator]} style={slots.separator} aria-hidden="true">{@render value(mergedSeparator)}</li>{/if}
    {/if}
  {/each}</ol>
</nav>
