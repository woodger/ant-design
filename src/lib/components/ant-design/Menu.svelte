<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { buildMenuEntries, menuLevel, menuVisible, menuOpenKeys, menuSelection, menuKeyboardAction, menuItem, menuSubMenu } from './menu.engine';
  import type { MenuEntry } from './menu.engine';
  import type { MenuProps, MenuClickInfo } from './menu.types';
  import { provideMenu } from './menu-context';
  import { useConfig } from './config-context';
  import { useSider } from './layout-context';
  import MenuList from './MenuList.svelte';

  let {
    items = [], mode = 'vertical', theme = 'light', disabled = false,
    selectedKeys, defaultSelectedKeys = [], multiple = false, selectable = true,
    openKeys, defaultOpenKeys = [], onOpenChange, onClick, onSelect, onDeselect,
    inlineIndent = 24, inlineCollapsed, forceSubMenuRender = false,
    triggerSubMenuAction = 'hover', subMenuOpenDelay = 0.1, subMenuCloseDelay = 0.1,
    class: className = '', rootClassName = '', style, nativeElement = $bindable(),
    onkeydown, tabindex = 0, ...attributes
  }: MenuProps = $props();

  const config = useConfig();
  const sider = useSider();
  const generated = $props.id();
  let model = $derived(buildMenuEntries(items));
  let selected = $state.raw<string[]>(untrack(() => [...selectedKeys ?? defaultSelectedKeys]));
  let opened = $state.raw<string[]>(untrack(() => [...openKeys ?? defaultOpenKeys]));
  let actualSelected = $derived(selectedKeys ?? selected);
  let actualOpen = $derived(openKeys ?? opened);
  let collapsed = $derived(mode !== 'horizontal' && (inlineCollapsed ?? sider?.collapsed ?? false));
  let actualMode = $derived(collapsed ? 'vertical' : mode);
  let active = $state<string | null>(null);
  const elements = new Map<string, HTMLElement>();
  const frames = new Set<number>();
  let previous = untrack(() => ({ selectedKeys, openKeys, mode: actualMode, collapsed }));
  let inlineCache = untrack(() => [...actualOpen]);

  onDestroy(() => {
    frames.forEach(frame => cancelAnimationFrame(frame));
    frames.clear();
  });

  $effect(() => {
    const next = { selectedKeys, openKeys, mode: actualMode, collapsed };

    untrack(() => {
      if (next.selectedKeys !== previous.selectedKeys) selected = [...next.selectedKeys ?? []];
      if (next.openKeys !== previous.openKeys) opened = [...next.openKeys ?? []];
      if (next.mode !== previous.mode || next.collapsed !== previous.collapsed) {
        if (next.mode === 'inline') opened = [...inlineCache];
        else {
          opened = [];
          onOpenChange?.([]);
        }
      }
      previous = next;
    });
  });

  $effect(() => {
    const keys = actualOpen;
    if (actualMode === 'inline') inlineCache = [...keys];
  });

  function id(key: string) { return `ant-menu-${generated}-${encodeURIComponent(key)}`; }

  function register(key: string, element: HTMLElement) {
    elements.set(key, element);
    return () => { if (elements.get(key) === element) elements.delete(key); };
  }

  function setOpen(entry: MenuEntry, next: boolean) {
    const keys = menuOpenKeys(actualOpen, entry, next, actualMode);
    if (keys.length === actualOpen.length && keys.every((key, index) => key === actualOpen[index])) return;

    opened = keys;
    onOpenChange?.(keys);
  }

  function click(entry: MenuEntry, event: MouseEvent | KeyboardEvent) {
    if (disabled || menuItem(entry).disabled) return;

    const before = [...actualSelected];
    const info: MenuClickInfo = {
      key: entry.key, keyPath: [...entry.path].reverse(), domEvent: event, itemData: { ...menuItem(entry) }
    };
    menuItem(entry).onClick?.(info);
    for (let parent = entry.parent; parent; parent = parent.parent) menuSubMenu(parent).onClick?.(info);
    onClick?.(info);

    if (selectable) {
      const next = menuSelection(before, entry.key, multiple);
      selected = next.keys;
      const detail = { ...info, selectedKeys: [...next.keys] };
      if (next.deselect) onDeselect?.(detail);
      else onSelect?.(detail);
    }
    if (!multiple && actualMode !== 'inline' && actualOpen.length) {
      opened = [];
      onOpenChange?.([]);
    }
  }

  function titleClick(entry: MenuEntry, event: MouseEvent) {
    if (disabled || menuSubMenu(entry).disabled) return;

    menuSubMenu(entry).onTitleClick?.({ key: entry.key, domEvent: event });
    if (actualMode === 'inline' || triggerSubMenuAction === 'click') setOpen(entry, !actualOpen.includes(entry.key));
  }

  function focusItem(key: string) {
    const element = elements.get(key);
    if (!element?.isConnected) return;

    const link = element.querySelector<HTMLAnchorElement>('a[href]');
    active = key;
    (link ?? element).focus({ preventScroll: true });
  }

  function available(entry: MenuEntry) {
    return !disabled && !('disabled' in entry.item && entry.item.disabled)
      && Boolean(elements.get(entry.key)?.getClientRects().length);
  }

  async function keyboard(entry: MenuEntry | null, event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || disabled) return;

    const action = menuKeyboardAction(actualMode, !entry?.parent, config.direction === 'rtl', event.key);
    const boundary = event.key === 'Home' || event.key === 'End';
    if (!action && !boundary) return;
    if (event.key.startsWith('Arrow') || boundary) event.preventDefault();

    if (boundary || action === 'previous' || action === 'next' || !entry) {
      const candidates = (actualMode === 'inline'
        ? menuVisible(model.roots, actualOpen, true)
        : menuLevel(entry?.parent?.children ?? model.roots)).filter(available);
      const position = candidates.findIndex(item => item.key === entry?.key);
      const offset = action === 'previous' ? -1 : 1;
      const index = position < 0 ? (offset < 0 ? candidates.length - 1 : 0)
        : (position + offset + candidates.length) % candidates.length;
      const target = event.key === 'Home' ? candidates[0] : event.key === 'End' ? candidates.at(-1) : candidates[index];
      if (target) focusItem(target.key);
    } else if (entry.kind === 'submenu' && (action === 'children' || action === 'toggle')) {
      if (event.key === 'Enter') event.preventDefault();
      setOpen(entry, action === 'toggle' ? !actualOpen.includes(entry.key) : true);

      if (action === 'children') {
        await tick();
        await new Promise<void>(resolve => {
          const frame = requestAnimationFrame(() => { frames.delete(frame); resolve(); });
          frames.add(frame);
        });
        const first = menuLevel(entry.children).find(available);
        if (first && actualOpen.includes(entry.key)) focusItem(first.key);
      }
    } else if (action === 'parent' && entry.parent) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); }
      setOpen(entry.parent, false);
      await tick();
      focusItem(entry.parent.key);
    }
  }

  provideMenu({
    get mode() { return actualMode; }, get theme() { return theme; },
    get collapsed() { return collapsed; }, get disabled() { return disabled; },
    get direction() { return config.direction; }, get inlineIndent() { return inlineIndent; },
    get selected() { return actualSelected; }, get open() { return actualOpen; },
    get active() { return active; }, get forceRender() { return forceSubMenuRender; },
    get trigger() { return triggerSubMenuAction; },
    get openDelay() { return subMenuOpenDelay; }, get closeDelay() { return subMenuCloseDelay; },
    id, register, activate: key => { active = key; }, click, titleClick, setOpen, keyboard, focusItem
  });

  function keydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLUListElement }) {
    const target = event.target instanceof Element ? event.target.closest('[data-menu-id]') : null;
    const key = [...elements].find(([, element]) => element === target)?.[0];
    void keyboard(key ? model.entries.get(key) ?? null : null, event);
    onkeydown?.(event);
  }

  export function focus(options?: FocusOptions) {
    const entry = active ? model.entries.get(active) : undefined;
    const target = entry && available(entry) ? entry : menuVisible(model.roots, actualOpen, actualMode === 'inline').find(available);
    if (target) {
      const element = elements.get(target.key);
      const link = element?.querySelector<HTMLAnchorElement>('a[href]');
      active = target.key;
      (link ?? element)?.focus(options);
    }
  }

  export function findItem(params: { key: string }) { return elements.get(params.key) ?? null; }
</script>

<ul {...attributes} bind:this={nativeElement} role="menu" tabindex={tabindex} data-menu-list="true" dir={config.direction}
  aria-disabled={disabled || undefined} aria-orientation={actualMode === 'horizontal' ? 'horizontal' : 'vertical'}
  {style} class={['ant-menu ant-menu-css-var ant-menu-root', `ant-menu-${actualMode}`, `ant-menu-${theme}`,
    collapsed && 'ant-menu-inline-collapsed', config.direction === 'rtl' && 'ant-menu-rtl', className, rootClassName]}
  onkeydown={keydown}>
  <MenuList entries={model.roots} {theme} />
</ul>
