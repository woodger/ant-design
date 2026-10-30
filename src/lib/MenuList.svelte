<script lang="ts">
  import type { MenuEntry } from './menu.engine';
  import { menuItem } from './menu.engine';
  import type { MenuContent, MenuTheme } from './menu.types';
  import { useMenu } from './menu-context';
  import MenuList from './MenuList.svelte';
  import MenuSubMenu from './MenuSubMenu.svelte';

  let { entries, theme }: { entries: readonly MenuEntry[]; theme: MenuTheme } = $props();
  const context = useMenu();
  function register(element: HTMLLIElement, key: string) { return { destroy: context.register(key, element) }; }

  function activate(event: MouseEvent, entry: MenuEntry) {
    if (context.disabled || menuItem(entry).disabled) { event.preventDefault(); event.stopPropagation(); return; }
    context.click(entry, event);
  }

  function keyboard(event: KeyboardEvent, entry: MenuEntry) {
    if (context.disabled || menuItem(entry).disabled) {
      if (event.key === 'Enter') event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      // Enter на настоящей ссылке создаёт native click, который запускает callback.
      if (event.target instanceof HTMLAnchorElement) return;
      event.preventDefault();
      context.click(entry, event);
    }
  }
</script>

<style>
  .ant-menu-item:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
  .ant-menu-item-disabled :global(a) { pointer-events: none; cursor: not-allowed; }
</style>

{#snippet content(value: MenuContent | undefined)}{#if typeof value === 'function'}{@render value()}{:else}{value ?? ''}{/if}{/snippet}
{#each entries as entry (entry.key)}
  {#if entry.kind === 'divider'}
    <li role="separator" class={['ant-menu-item-divider', 'dashed' in entry.item && entry.item.dashed && 'ant-menu-item-divider-dashed', entry.item.class]} style={entry.item.style}></li>
  {:else if entry.kind === 'group'}
    <li role="presentation" class={['ant-menu-item-group', entry.item.class]} style={entry.item.style}>
      <div class="ant-menu-item-group-title" role="presentation">{@render content('label' in entry.item ? entry.item.label : undefined)}</div>
      <ul class="ant-menu-item-group-list" role="group"><MenuList entries={entry.children} {theme} /></ul>
    </li>
  {:else if entry.kind === 'submenu'}<MenuSubMenu {entry} {theme} />
  {:else}
    {@const item = menuItem(entry)}{@const blocked = context.disabled || item.disabled}
    <li use:register={entry.key} id={context.id(entry.key)} data-menu-id={context.id(entry.key)} role="menuitem"
      tabindex={blocked ? undefined : -1} aria-disabled={blocked || undefined}
      title={item.title ?? (context.collapsed && typeof item.label === 'string' ? item.label : undefined)}
      aria-label={context.collapsed && !entry.parent ? (item.title ?? (typeof item.label === 'string' ? item.label : undefined)) : undefined}
      class={['ant-menu-item', context.active === entry.key && 'ant-menu-item-active', context.selected.includes(entry.key) && 'ant-menu-item-selected',
        blocked && 'ant-menu-item-disabled', item.danger && 'ant-menu-item-danger', item.class]}
      style={[context.mode === 'inline' && `padding-${context.direction === 'rtl' ? 'right' : 'left'}:${entry.level * context.inlineIndent}px`, item.style].filter(Boolean).join(';')}
      onclick={event => activate(event, entry)} onkeydown={event => keyboard(event, entry)}
      onfocusin={() => { if (!blocked) context.activate(entry.key); }} onmouseenter={() => { if (!blocked) context.activate(entry.key); }}
      onmouseleave={() => { if (context.active === entry.key) context.activate(null); }}>
      {#if item.icon}<span class="ant-menu-item-icon">{@render item.icon()}</span>{/if}
      <span class={['ant-menu-title-content', item.extra !== undefined && 'ant-menu-title-content-with-extra']}>
        {#if context.collapsed && !entry.parent && !item.icon && typeof item.label === 'string'}
          <span class="ant-menu-inline-collapsed-noicon">{item.label.charAt(0)}</span>
        {:else if item.extra !== undefined}
          <span class="ant-menu-item-label">{@render content(item.label)}</span><span class="ant-menu-item-extra">{@render content(item.extra)}</span>
        {:else}{@render content(item.label)}{/if}
      </span>
    </li>
  {/if}
{/each}
