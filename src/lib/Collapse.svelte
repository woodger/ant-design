<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import CollapsePanel from './CollapsePanel.svelte';
  import { useConfig } from './config-context';
  import {
    getCollapseFocusKey,
    getCollapseKeys,
    getCollapseTrigger,
    normalizeCollapseItems,
    toggleCollapseKey
  } from './collapse.engine';
  import type { CollapseActiveKey, CollapseProps } from './collapse.types';

  let {
    items: sourceItems,
    activeKey = $bindable<CollapseActiveKey | undefined>(),
    defaultActiveKey,
    onChange,
    accordion = false,
    collapsible = 'header',
    expandIconPlacement = 'start',
    size,
    bordered = true,
    ghost = false,
    destroyOnHidden = false,
    headingLevel = 3,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    class: className = '',
    style
  }: CollapseProps = $props();

  const config = useConfig();
  const generatedId = $props.id();
  const initialDefault = untrack(() => getCollapseKeys(defaultActiveKey));
  let root = $state<HTMLDivElement>();
  let repairFocus = false;
  let repairKey: string | undefined;
  let retainedFocus: HTMLElement | undefined;
  let active = true;
  let rootId = $derived(id ?? `ant-collapse-${generatedId}`);
  let items = $derived(normalizeCollapseItems(sourceItems));
  let openKeys = $derived(getCollapseKeys(activeKey ?? initialDefault, accordion));
  let resolvedSize = $derived(size ?? config.componentSize);
  let region = $derived(accordion || items.length <= 6);

  $effect.pre(() => {
    const container = root;
    const current = items;
    const open = openKeys;
    const modes = current.map((item) => getCollapseTrigger(item, collapsible));
    repairFocus = false;
    retainedFocus = undefined;
    if (!container) return;

    const focused = container.ownerDocument.activeElement;
    if (focused === container) {
      repairKey = getCollapseFocusKey(current, undefined, open, collapsible);
      repairFocus = repairKey !== undefined;
      return;
    }

    const panels = Array.from(container.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement
        && element.hasAttribute(
          'data-collapse-key'
        )
    );
    const previous = panels.find((element) => element.contains(focused));
    if (!previous || !(focused instanceof HTMLElement)) return;

    const key = previous.dataset.collapseKey;
    const index = current.findIndex((item) => item.key === key);
    const trigger = previous.querySelector('[data-collapse-trigger]');
    const content = previous.querySelector(':scope > [data-collapse-panel]');
    const extra = previous.querySelector(':scope > .ant-collapse-header > .ant-collapse-extra');
    if (index === -1
      || focused === trigger
      && modes[index] === 'disabled'
      || content?.contains(
        focused
      )
      && !open.includes(
        key!
      )
      || extra?.contains(
        focused
      )
      && !current[index]?.extra) {
      repairFocus = true;
      repairKey = key;
    } else if (panels.length !== current.length
      || current.some(
        (item, position) => item.key !== panels[position]?.dataset.collapseKey
      ))
      retainedFocus = focused;
  });

  $effect(() => {
    const container = root;
    const target = getCollapseFocusKey(items, repairKey, openKeys, collapsible);
    const previous = retainedFocus;
    retainedFocus = undefined;
    if (!container) return;

    if (repairFocus) {
      repairFocus = false;
      untrack(() => focusHeader(target));
    }
    else if (previous?.isConnected
      && previous.getClientRects().length
      && !previous.matches(
        ':disabled'
      )
      && container.ownerDocument.activeElement === container.ownerDocument.body)
      untrack(() => previous.focus({ preventScroll: true }));
  });

  onDestroy(() => {
    active = false;
  });

  function itemId(key: string, kind: 'header' | 'panel' | 'label') {
    const encoded = Array.from(key, (character) => character.codePointAt(0)!.toString(16)).join(
      '-'
    );
    return `${rootId}-${kind}-${encoded || 'empty'}`;
  }

  function focusHeader(key: string | undefined) {
    const panel = Array.from(root?.children ?? []).find(
      (element) => element instanceof HTMLElement && element.dataset.collapseKey === key
    );
    const button = panel?.querySelector<HTMLButtonElement>('[data-collapse-trigger]');
    (button && !button.disabled ? button : root)?.focus({ preventScroll: true });
  }

  function toggle(key: string, event: MouseEvent) {
    const item = items.find((entry) => entry.key === key);
    if (!active
      || event.defaultPrevented
      || !item
      || getCollapseTrigger(item, collapsible) === 'disabled') return;

    const next = toggleCollapseKey(activeKey ?? initialDefault, key, accordion);
    activeKey = [...next];
    onChange?.(next);
  }
</script>

<style>
  .ant-collapse { min-width: 0; max-width: 100%; --ant-collapse-toggle-padding: var(--ant-collapse-header-padding); --ant-collapse-extra-spacing: var(--ant-padding); }
  .ant-collapse-small { --ant-collapse-toggle-padding: var(--ant-collapse-header-padding-sm); --ant-collapse-extra-spacing: var(--ant-padding-sm); }
  .ant-collapse-large { --ant-collapse-toggle-padding: var(--ant-collapse-header-padding-lg); --ant-collapse-extra-spacing: var(--ant-padding-lg); }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header { padding: 0; align-items: center; cursor: default; }
  .ant-collapse-heading { flex: 1; min-width: 0; margin: 0; font: inherit; color: inherit; }
  .ant-collapse-trigger { display: flex; align-items: flex-start; width: 100%; min-width: 0; margin: 0; padding: var(--ant-collapse-toggle-padding); border: 0; border-radius: inherit; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  .ant-collapse-trigger:disabled { cursor: not-allowed; }
  .ant-collapse-trigger:focus-visible, .ant-collapse:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
  .ant-collapse-title { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-expand-icon { height: 1lh; }
  .ant-collapse-small.ant-collapse-icon-placement-start > .ant-collapse-item > .ant-collapse-header .ant-collapse-expand-icon { margin-inline-start: calc(var(--ant-padding-sm) - var(--ant-padding-xs)); }
  .ant-collapse-large.ant-collapse-icon-placement-start > .ant-collapse-item > .ant-collapse-header .ant-collapse-expand-icon { margin-inline-start: calc(var(--ant-padding-lg) - var(--ant-padding)); }
  .ant-collapse-trigger-icon { pointer-events: none; cursor: default; }
  .ant-collapse-trigger-icon .ant-collapse-expand-icon { pointer-events: auto; cursor: pointer; }
  .ant-collapse-extra { flex: none; min-width: 0; max-width: 45%; margin-inline-end: var(--ant-collapse-extra-spacing); overflow-wrap: anywhere; }
  .ant-collapse-empty { padding: var(--ant-padding-sm); color: var(--ant-color-text-description); }
  @media (prefers-reduced-motion: reduce) { .ant-collapse > .ant-collapse-item > .ant-collapse-header, .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow { animation: none; transition: none; } }
</style>

<div bind:this={root} id={rootId} role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} tabindex="-1" dir={config.direction} class={[
    'ant-collapse ant-collapse-css-var',
    `ant-collapse-icon-placement-${expandIconPlacement}`,
    resolvedSize !== 'middle' && `ant-collapse-${resolvedSize}`,
    !bordered && 'ant-collapse-borderless',
    ghost && 'ant-collapse-ghost',
    config.direction === 'rtl' && 'ant-collapse-rtl',
    className
  ]} {style}>
  {#each items as item (item.key)}
    {@const mode = getCollapseTrigger(item, collapsible)}
    {@const open = openKeys.includes(item.key)}
    <div data-collapse-key={item.key} class={[
        'ant-collapse-item',
        open && 'ant-collapse-item-active',
        mode === 'disabled' && 'ant-collapse-item-disabled'
      ]}>
      <div class={[
          'ant-collapse-header',
          mode === 'icon' && 'ant-collapse-collapsible-icon'
        ]}>
        <svelte:element this={`h${headingLevel}`} class="ant-collapse-heading">
          <button type="button" id={itemId(item.key, 'header')} data-collapse-trigger={item.key} aria-expanded={open} aria-controls={itemId(item.key, 'panel')} disabled={mode === 'disabled'} class={[
              'ant-collapse-trigger',
              mode === 'icon' && 'ant-collapse-trigger-icon'
            ]} onclick={(event) => toggle(item.key, event)}>
            {#if item.showArrow !== false}<span class="ant-collapse-expand-icon" aria-hidden="true"><span class="ant-collapse-arrow" style:transform={`rotate(${open
                ? 90
                : config.direction === 'rtl' ? 180 : 0}deg)`}><Icon name="right" /></span></span>{/if}
            <span id={itemId(item.key, 'label')} class="ant-collapse-title">{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}</span>
          </button>
        </svelte:element>
        {#if item.extra}<div class="ant-collapse-extra">{@render item.extra()}</div>{/if}
      </div>
      <CollapsePanel id={itemId(item.key, 'panel')} labelledBy={itemId(item.key, 'header')} itemKey={item.key} {open} {region} children={item.children} forceRender={item.forceRender} destroyOnHidden={item.destroyOnHidden ?? destroyOnHidden} />
    </div>
  {:else}<div class="ant-collapse-empty">{config.locale.emptyText}</div>{/each}
</div>
