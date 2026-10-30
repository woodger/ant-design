<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { MenuEntry } from './menu.engine';
  import { menuSubMenu } from './menu.engine';
  import type { MenuTheme } from './menu.types';
  import { useMenu } from './menu-context';
  import { connectPopup } from './popup.dom';
  import MenuList from './MenuList.svelte';

  let { entry, theme }: { entry: MenuEntry; theme: MenuTheme } = $props();
  const context = useMenu();
  let item = $derived(menuSubMenu(entry));
  let actualTheme = $derived(item.theme ?? theme);
  let opened = $derived(context.open.includes(entry.key));
  let blocked = $derived(context.disabled || Boolean(item.disabled));
  let selected = $derived(context.selected.some(key => entry.children.some(child => contains(child, key))));
  let title = $state<HTMLButtonElement>();
  let popup = $state<HTMLDivElement>();
  let shown = $state(false);
  let mounted = $state(untrack(() => opened || context.forceRender));
  let timer: ReturnType<typeof setTimeout> | undefined;

  function contains(node: MenuEntry, key: string): boolean {
    return node.key === key || node.children.some(child => contains(child, key));
  }
  function register(element: HTMLButtonElement) { return { destroy: context.register(entry.key, element) }; }

  $effect(() => { if (opened || context.forceRender) mounted = true; });
  $effect(() => {
    if (!opened || context.mode === 'inline' || !popup || !title) return;

    const horizontal = context.mode === 'horizontal' && !entry.parent;
    return connectPopup(popup, title, {
      placement: horizontal ? 'bottom' : context.direction === 'rtl' ? 'left' : 'right',
      align: horizontal ? (context.direction === 'rtl' ? 'right' : 'left') : 'top',
      autoAdjustOverflow: true, maxWidth: '100vw', matchAnchorWidth: horizontal, preserveFocus: false,
      onPlacement: () => {}, onVisibilityChange: next => { shown = next; },
      onDismiss: reason => {
        context.setOpen(entry, false);
        if (reason === 'escape') context.focusItem(entry.key);
      }
    });
  });
  $effect(() => { if (blocked || context.mode === 'inline' || context.trigger !== 'hover') cancel(); });

  function cancel() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }
  function hover(next: boolean) {
    cancel();
    if (blocked || context.mode === 'inline' || context.trigger !== 'hover') return;

    timer = setTimeout(() => {
      timer = undefined;
      context.setOpen(entry, next);
    }, Math.max(0, next ? context.openDelay : context.closeDelay) * 1000);
  }
  onDestroy(cancel);
</script>

<style>
  .ant-menu-submenu-title { display: block; width: 100%; padding-block: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; }
  .ant-menu-submenu-title:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
  .menu-popup { position: fixed; margin: 0; padding: 0; border: 0; overflow: visible; background: transparent; }
</style>

<li role="none" class={['ant-menu-submenu', `ant-menu-submenu-${context.mode}`, opened && 'ant-menu-submenu-open',
  selected && 'ant-menu-submenu-selected', blocked && 'ant-menu-submenu-disabled', context.active === entry.key && 'ant-menu-submenu-active', item.class]}
  style={item.style} onmouseenter={() => { if (!blocked) context.activate(entry.key); hover(true); }}
  onmouseleave={() => { if (context.active === entry.key) context.activate(null); hover(false); }}>
  <button type="button" disabled={blocked} bind:this={title} use:register id={context.id(entry.key)} data-menu-id={context.id(entry.key)}
    class="ant-menu-submenu-title" role="menuitem" tabindex={blocked ? undefined : -1} aria-disabled={blocked || undefined}
    aria-haspopup="menu" aria-expanded={opened} aria-controls={`${context.id(entry.key)}-popup`}
    title={item.title ?? (context.collapsed && typeof item.label === 'string' ? item.label : undefined)}
    aria-label={context.collapsed && !entry.parent ? (item.title ?? (typeof item.label === 'string' ? item.label : undefined)) : undefined}
    style={context.mode === 'inline' ? `padding-${context.direction === 'rtl' ? 'right' : 'left'}:${entry.level * context.inlineIndent}px` : undefined}
    onclick={event => { cancel(); context.titleClick(entry, event); }} onkeydown={event => { if (event.key === ' ') event.preventDefault(); }}
    onfocus={() => { if (!blocked) context.activate(entry.key); }}>
    {#if item.icon}<span class="ant-menu-item-icon">{@render item.icon()}</span>{/if}
    {#if context.collapsed && !entry.parent && !item.icon && typeof item.label === 'string'}
      <span class="ant-menu-inline-collapsed-noicon">{item.label.charAt(0)}</span>
    {:else}<span class="ant-menu-title-content">{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label ?? ''}{/if}</span>{/if}
    {#if context.mode !== 'horizontal' || entry.parent}<i class="ant-menu-submenu-arrow" aria-hidden="true"></i>{/if}
  </button>
  {#if mounted}
    {#if context.mode === 'inline'}
      <ul id={`${context.id(entry.key)}-popup`} role="menu" data-menu-list="true"
        class={['ant-menu ant-menu-css-var ant-menu-sub ant-menu-inline', !opened && 'ant-menu-hidden', context.direction === 'rtl' && 'ant-menu-rtl']}
        hidden={!opened}><MenuList entries={entry.children} theme={actualTheme} /></ul>
    {:else}
      <div bind:this={popup} popover="manual" hidden={!opened || !shown}
        class={['menu-popup ant-menu ant-menu-css-var ant-menu-submenu ant-menu-submenu-popup', `ant-menu-${actualTheme}`,
          context.direction === 'rtl' && 'ant-menu-rtl', item.popupClassName]}>
        <ul id={`${context.id(entry.key)}-popup`} role="menu" data-menu-list="true"
          class={['ant-menu ant-menu-css-var ant-menu-sub ant-menu-vertical', context.direction === 'rtl' && 'ant-menu-rtl']}>
          <MenuList entries={entry.children} theme={actualTheme} />
        </ul>
      </div>
    {/if}
  {/if}
</li>
