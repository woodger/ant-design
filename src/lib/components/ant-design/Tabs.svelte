<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import TabsPanel from './TabsPanel.svelte';
  import { useConfig } from './config-context';
  import { connectTabsNav, revealTab } from './tabs.dom';
  import { getTabsActiveKey, getTabsNavigationKey, getTabsPlacement, normalizeTabsItems } from './tabs.engine';
  import type { TabsProps } from './tabs.types';

  let { items: sourceItems, activeKey = $bindable<string | undefined>(), defaultActiveKey, onChange, onTabClick, type = 'line', tabPlacement = 'top', size, destroyOnHidden = false, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, class: className = '', style }: TabsProps = $props();

  const config = useConfig();
  const generatedId = $props.id();
  const initialDefault = untrack(() => defaultActiveKey);
  let root = $state<HTMLDivElement>();
  let viewport = $state<HTMLDivElement>();
  let list = $state<HTMLDivElement>();
  let body = $state<HTMLDivElement>();
  let indicator = $state<HTMLDivElement>();
  let focusKey = $state<string | undefined>();
  let mobile = $state(false);
  let repairFocus = false;
  let retainedFocus: HTMLElement | undefined;
  let active = true;
  let rootId = $derived(id ?? `ant-tabs-${generatedId}`);
  let items = $derived(normalizeTabsItems(sourceItems));
  let selectedKey = $derived(getTabsActiveKey(items, activeKey ?? initialDefault));
  let tabStop = $derived(getTabsActiveKey(items, focusKey ?? selectedKey));
  let resolvedSize = $derived(size ?? config.componentSize);
  let placement = $derived(getTabsPlacement(tabPlacement, config.direction, mobile));
  let vertical = $derived(placement === 'left' || placement === 'right');

  $effect(() => {
    const media = window.matchMedia('(max-width: 575px)');
    const update = () => { mobile = media.matches; };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });

  $effect.pre(() => {
    const nav = list;
    const panels = body;
    const key = selectedKey;
    const available = items.filter((item) => !item.disabled);
    retainedFocus = undefined;
    if (!nav || !panels) return;

    const currentKeys = Array.from(nav.querySelectorAll<HTMLElement>('[role="tab"]'), (element) => element.dataset.tabsKey);
    const moving = currentKeys.length !== items.length || items.some((item, index) => item.key !== currentKeys[index]);
    const focused = nav.ownerDocument.activeElement;
    if (nav.contains(focused)) {
      if (focused === nav) repairFocus = key !== undefined;
      else if (focused instanceof HTMLElement && !available.some((item) => item.key === focused.dataset.tabsKey)) repairFocus = true;
      else if (moving && focused instanceof HTMLElement) retainedFocus = focused;
    } else if (panels.contains(focused)) {
      const panel = Array.from(panels.children).find((element) => element.contains(focused));
      if (panel instanceof HTMLElement && panel.dataset.tabsKey !== key) repairFocus = true;
      else if (moving && focused instanceof HTMLElement) retainedFocus = focused;
    }
  });

  $effect(() => {
    const nav = list;
    const key = getTabsActiveKey(items, focusKey ?? selectedKey);
    const previous = retainedFocus;
    retainedFocus = undefined;
    if (!nav) return;

    if (repairFocus) { repairFocus = false; untrack(() => focusTab(key)); }
    // Перемещение keyed DOM сохраняет экземпляр панели, но браузер сбрасывает её фокус.
    else if (previous?.isConnected && previous.getClientRects().length && !previous.matches(':disabled') && nav.ownerDocument.activeElement === nav.ownerDocument.body) untrack(() => previous.focus({ preventScroll: true }));
  });

  $effect(() => {
    const container = root;
    const scroller = viewport;
    const nav = list;
    const line = indicator;
    const selected = items.find((item) => item.key === selectedKey);
    const isVertical = vertical;
    const showIndicator = type === 'line';

    if (container && scroller && nav && line) return untrack(() => connectTabsNav(container, scroller, nav, line, { key: selected?.key, vertical: isVertical, showIndicator }));
  });

  onDestroy(() => { active = false; });

  function itemId(key: string, kind: 'tab' | 'panel') {
    const encoded = Array.from(key, (character) => character.codePointAt(0)!.toString(16)).join('-');
    return `${rootId}-${kind}-${encoded || 'empty'}`;
  }

  function focusTab(key: string | undefined) {
    if (!list) return;

    const tab = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find((element) => element.dataset.tabsKey === key && !element.disabled);
    focusKey = tab?.dataset.tabsKey;
    (tab ?? list).focus({ preventScroll: true });
    if (tab && viewport) revealTab(viewport, tab, vertical);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;

    const forward = vertical ? 'ArrowDown' : config.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = vertical ? 'ArrowUp' : config.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const direction = event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : event.key === forward ? 'next' : event.key === backward ? 'previous' : null;
    if (!direction) return;

    event.preventDefault();
    focusTab(getTabsNavigationKey(items, tabStop, direction));
  }

  function activate(key: string, event: MouseEvent) {
    if (event.defaultPrevented || !items.some((item) => item.key === key && !item.disabled)) return;

    onTabClick?.(key, event);
    if (!active || event.defaultPrevented || !items.some((item) => item.key === key && !item.disabled) || key === selectedKey) return;

    activeKey = key;
    onChange?.(key);
  }

  function handleFocusout(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && !list?.contains(event.relatedTarget)) focusKey = undefined;
  }

  function handleTabFocus(key: string, element: HTMLButtonElement) {
    focusKey = key;
    if (viewport) revealTab(viewport, element, vertical);
  }
</script>

<style>
  .ant-tabs { min-width: 0; max-width: 100%; }
  .ant-tabs > .ant-tabs-nav { min-width: 0; }
  .ant-tabs > .ant-tabs-nav .ant-tabs-nav-wrap { min-width: 0; overflow: auto; overscroll-behavior: contain; scrollbar-width: thin; scroll-behavior: auto; }
  .ant-tabs > .ant-tabs-nav .ant-tabs-nav-list { flex: 0 0 auto; min-height: var(--ant-control-height); }
  .ant-tabs-left > .ant-tabs-nav, .ant-tabs-right > .ant-tabs-nav { max-width: 45%; }
  .ant-tabs-left > .ant-tabs-nav .ant-tabs-nav-wrap, .ant-tabs-right > .ant-tabs-nav .ant-tabs-nav-wrap { max-height: min(400px, 60dvh); }
  .ant-tabs-left > .ant-tabs-nav .ant-tabs-tab, .ant-tabs-right > .ant-tabs-nav .ant-tabs-tab { white-space: normal; overflow-wrap: anywhere; }
  :where(button.ant-tabs-tab) { appearance: none; margin: 0; font: inherit; text-align: inherit; flex: none; }
  .ant-tabs .ant-tabs-tab:focus-visible, .ant-tabs-nav-list:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
  .ant-tabs-empty { padding: var(--ant-padding-sm); color: var(--ant-color-text-description); }
  .ant-tabs-ink-bar[hidden] { display: none; }
  @media (prefers-reduced-motion: reduce) { .ant-tabs > .ant-tabs-nav .ant-tabs-nav-list, .ant-tabs > .ant-tabs-nav .ant-tabs-tab, .ant-tabs > .ant-tabs-nav .ant-tabs-tab-btn, .ant-tabs > .ant-tabs-nav .ant-tabs-ink-bar { animation: none; transition: none; } }
</style>

<div bind:this={root} id={rootId} dir={config.direction} class={['ant-tabs ant-tabs-css-var', `ant-tabs-${placement}`, type === 'card' && 'ant-tabs-card', resolvedSize !== 'middle' && `ant-tabs-${resolvedSize}`, config.direction === 'rtl' && 'ant-tabs-rtl', className]} {style}>
  <div class="ant-tabs-nav" role="presentation">
    <div bind:this={viewport} class="ant-tabs-nav-wrap">
      <div bind:this={list} role="tablist" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-orientation={vertical ? 'vertical' : 'horizontal'} tabindex={tabStop === undefined ? 0 : undefined} class="ant-tabs-nav-list" onkeydown={handleKeydown} onfocusout={handleFocusout}>
        {#each items as item (item.key)}
          <button type="button" role="tab" id={itemId(item.key, 'tab')} data-tabs-key={item.key} aria-controls={itemId(item.key, 'panel')} aria-selected={selectedKey === item.key} disabled={item.disabled} tabindex={tabStop === item.key ? 0 : -1} class={['ant-tabs-tab', selectedKey === item.key && 'ant-tabs-tab-active', item.disabled && 'ant-tabs-tab-disabled']} onfocus={(event) => handleTabFocus(item.key, event.currentTarget)} onclick={(event) => activate(item.key, event)}>
            <span class="ant-tabs-tab-btn">{#if item.icon}<span class="ant-tabs-tab-icon" aria-hidden="true">{@render item.icon()}</span>{/if}<span class="ant-tabs-tab-label">{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}</span></span>
          </button>
        {/each}
        <div bind:this={indicator} class="ant-tabs-ink-bar ant-tabs-ink-bar-animated" aria-hidden="true" hidden></div>
      </div>
    </div>
  </div>
  <div class="ant-tabs-body-holder"><div bind:this={body} class="ant-tabs-body">
    {#each items as item (item.key)}
      <TabsPanel id={itemId(item.key, 'panel')} labelledBy={itemId(item.key, 'tab')} itemKey={item.key} active={selectedKey === item.key} children={item.children} forceRender={item.forceRender} destroyOnHidden={item.destroyOnHidden ?? destroyOnHidden} />
    {:else}<div class="ant-tabs-empty">{config.locale.emptyText}</div>{/each}
  </div></div>
</div>
