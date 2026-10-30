<script lang="ts" generics="Params extends Record<string, unknown> = Record<string, unknown>">
  import Dropdown from './Dropdown.svelte';
  import Icon from './Icon.svelte';
  import { breadcrumbAttributes } from './breadcrumb.engine';
  import type { breadcrumbEntries } from './breadcrumb.engine';
  import type { BreadcrumbContent, BreadcrumbProps, BreadcrumbSlots } from './breadcrumb.types';
  import type { DropdownMenuProps } from './dropdown.types';

  let { entry, params, routes, itemRender, dropdownIcon, classes, styles }: {
    entry: ReturnType<typeof breadcrumbEntries>[number]; params: Params; routes: readonly import('./breadcrumb.types').BreadcrumbItem[];
    itemRender?: BreadcrumbProps<Params>['itemRender']; dropdownIcon?: BreadcrumbContent; classes: BreadcrumbSlots; styles: BreadcrumbSlots;
  } = $props();
  let attributes = $derived(breadcrumbAttributes(entry.item));
  let menu = $derived<DropdownMenuProps>({
    onClick: entry.item.menu?.onClick,
    items: (entry.item.menu?.items ?? []).map((item, index) => {
      const label = item.label ?? item.title;
      return { key: String(item.key ?? index), label: typeof label === 'function' ? label : typeof label === 'boolean' ? '' : String(label ?? ''),
        href: item.path ? `${entry.href ?? ''}${item.path}` : undefined, disabled: item.disabled, danger: item.danger, onClick: item.onClick };
    })
  });
</script>

<style>
  button { appearance: none; margin-block: 0; border: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }
  button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  .breadcrumb-arrow { display: inline-flex; margin-inline-start: var(--ant-margin-xxs); font-size: var(--ant-font-size-icon); }
</style>

{#snippet value(node: BreadcrumbContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#snippet arrow()}
  {#if dropdownIcon === undefined || dropdownIcon === null}<span class="breadcrumb-arrow" aria-hidden="true"><Icon name="down" /></span>
  {:else}{@render value(dropdownIcon)}{/if}
{/snippet}
{#snippet link(overlay: boolean)}
  {#if itemRender}
    {#if overlay}<span class="ant-breadcrumb-overlay-link">{@render itemRender(entry.item, params, routes, entry.paths)}{@render arrow()}</span>
    {:else}{@render itemRender(entry.item, params, routes, entry.paths)}{/if}
  {:else if entry.href !== undefined}
    <a {...attributes} href={entry.href} class={['ant-breadcrumb-link', overlay && 'ant-breadcrumb-overlay-link', entry.item.class]} onclick={entry.item.onClick}>{@render value(entry.title)}{#if overlay}{@render arrow()}{/if}</a>
  {:else if overlay || entry.item.onClick}
    <button {...attributes} type="button" class={['ant-breadcrumb-link', overlay && 'ant-breadcrumb-overlay-link', entry.item.class]} onclick={entry.item.onClick}>{@render value(entry.title)}{#if overlay}{@render arrow()}{/if}</button>
  {:else}<span {...attributes} class={['ant-breadcrumb-link', entry.item.class]}>{@render value(entry.title)}</span>{/if}
{/snippet}
<li class={['ant-breadcrumb-item', classes.item]} style={styles.item}>
  {#if entry.item.menu}<Dropdown placement="bottom" {...entry.item.dropdownProps} {menu}>{@render link(true)}</Dropdown>{:else}{@render link(false)}{/if}
</li>
