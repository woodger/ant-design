<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import { connectPopup } from './popup.dom';
  import { connectPopoverTrigger } from './popover.dom';
  import { getTooltipDelay } from './tooltip.engine';
  import {
    getDropdownActiveKey,
    getDropdownCommands,
    getDropdownMatch,
    getDropdownNavigationKey,
    normalizeDropdownItems
  } from './dropdown.engine';
  import type {
    DropdownClickInfo,
    DropdownPlacement,
    DropdownProps,
    DropdownTrigger
  } from './dropdown.types';

  let {
    children,
    menu,
    open = $bindable<boolean | undefined>(),
    defaultOpen = false,
    onOpenChange,
    trigger = ['hover'],
    disabled,
    placement,
    arrow = false,
    autoAdjustOverflow = true,
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    'aria-label': ariaLabel,
    class: className = '',
    style
  }: DropdownProps = $props();

  const config = useConfig();
  const form = useForm();
  const generatedId = $props.id();
  const menuId = `ant-dropdown-${generatedId}-menu`;
  const triggerId = `ant-dropdown-${generatedId}-trigger`;
  const initialDefault = untrack(() => defaultOpen);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<Element>();
  let popup = $state<HTMLDivElement>();
  let list = $state<HTMLUListElement>();
  let shown = $state(false);
  let activeKey = $state<string | null>(null);
  let actualSide = $state<'top' | 'bottom'>('bottom');
  let pending: ReturnType<typeof setTimeout> | undefined;
  let focusPending: 'first' | 'last' | null = null;
  let hovered = false;
  let popupHovered = false;
  let menuFocused = false;
  let clicked = false;
  let dismissed = false;
  let closing = false;
  let leavingByTab = false;
  let repairFocus = false;
  let resumeFocus = false;
  let search = { text: '', time: 0 };
  let active = true;
  let items = $derived(normalizeDropdownItems(menu?.items ?? []));
  let resolvedKey = $derived(getDropdownActiveKey(items, activeKey));
  let resolvedDisabled = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let visible = $derived(!resolvedDisabled && (open ?? initialDefault));
  let requestedPlacement = $derived(
    placement ?? (config.direction === 'rtl' ? 'bottomRight' : 'bottomLeft')
  );
  let side = $derived(requestedPlacement.startsWith('top') ? 'top' as const : 'bottom' as const);
  let align = $derived(
    requestedPlacement.endsWith('Left')
      ? 'left' as const
      : requestedPlacement.endsWith('Right') ? 'right' as const : undefined
  );
  let actualPlacement = $derived(
    `${actualSide}${align === 'left'
      ? 'Left'
      : align === 'right' ? 'Right' : ''}` as DropdownPlacement
  );

  $effect(() => {
    const element = host;
    if (!element) return;

    function update() {
      anchor = element!.firstElementChild ?? element;
    }

    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { childList: true });
    return () => observer.disconnect();
  });

  $effect(() => {
    if (anchor) return connectPopoverTrigger(anchor, menuId, shown, 'menu');
  });

  $effect.pre(() => {
    const element = list;
    const source = anchor;
    const key = resolvedKey;

    if (!visible) {
      clicked = false;
      focusPending = null;
      search = { text: '', time: 0 };
      if (element?.contains(element.ownerDocument.activeElement)
        && source instanceof HTMLElement
        && source.isConnected) {
        untrack(() => {
          closing = true;
          source.focus({ preventScroll: true });
          closing = false;
        });
      }
    } else if (element?.contains(element.ownerDocument.activeElement)) {
      const focused = element.ownerDocument.activeElement;
      if (focused instanceof HTMLElement && (focused.dataset.dropdownKey ?? null) !== key)
        repairFocus = true;
    }
  });

  $effect(() => {
    const element = list;
    const key = resolvedKey;
    const currentItems = items;

    if (shown && element && currentItems && repairFocus) {
      repairFocus = false;
      untrack(() => focusItem(key));
    }
  });

  $effect(() => {
    const surface = popup;
    const source = anchor;
    if (!surface || !source || !visible) return;

    const disconnect = untrack(() => connectPopup(surface, source, {
      trigger: host,
      get placement() {
        return side;
      },
      get align() {
        return align;
      },
      get autoAdjustOverflow() {
        return autoAdjustOverflow;
      },
      maxWidth: '100vw',
      matchAnchorWidth: true,
      preserveFocus: false,
      onPlacement: (next) => {
        actualSide = next === 'top' ? 'top' : 'bottom';
      },
      onDismiss: close,
      onVisibilityChange: (next) => {
        shown = next;
        if (!next) {
          menuFocused = false;
          popupHovered = false;
        }
        else if (resumeFocus) {
          resumeFocus = false;
          focusItem(resolvedKey);
        }
        else if (focusPending) {
          const edge = focusPending;
          focusPending = null;
          focusItem(getDropdownNavigationKey(items, null, edge));
        }
      }
    }));

    return () => {
      resumeFocus = Boolean(list?.contains(surface.ownerDocument.activeElement));
      closing = true;
      disconnect();
      closing = false;
    };
  });

  onDestroy(() => {
    active = false;
    cancelPending();
  });

  function cancelPending() {
    if (pending !== undefined)
      clearTimeout(pending);
    pending = undefined;
  }

  function supports(kind: DropdownTrigger) {
    return typeof trigger === 'string' ? trigger === kind : trigger.includes(kind);
  }

  function wanted() {
    return !dismissed && (clicked || menuFocused || popupHovered || hovered && supports('hover'));
  }

  function request(next: boolean, delay = 0, notify = true) {
    cancelPending();
    const source = anchor;
    const ownerValue = open;

    function apply() {
      pending = undefined;
      if (!active
        || next
        && (resolvedDisabled
          || !wanted())
        || !source?.isConnected
        || source !== anchor
        || !Object.is(
          open,
          ownerValue
        )) return;

      if (next !== (open ?? initialDefault)) {
        open = next;
        if (notify)
          onOpenChange?.(next);
      }
      if (next && visible && shown && focusPending) {
        const edge = focusPending;
        focusPending = null;
        focusItem(getDropdownNavigationKey(items, null, edge));
      }
    }

    if (delay)
      pending = setTimeout(apply, delay);
    else apply();
  }

  function focusItem(key: string | null) {
    if (!list) return;

    const element = Array.from(list.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
      (item) => item.dataset.dropdownKey === key
        && !item.matches(
          ':disabled, [aria-disabled="true"]'
        )
    );
    activeKey = key;
    (element ?? list).focus({ preventScroll: true });
    if (element) {
      const bounds = element.getBoundingClientRect();
      const menuBounds = list.getBoundingClientRect();
      if (bounds.top < menuBounds.top + 4)
        list.scrollTop -= menuBounds.top + 4 - bounds.top;
      else if (bounds.bottom > menuBounds.bottom - 4)
        list.scrollTop += bounds.bottom - menuBounds.bottom + 4;
    }
  }

  function close(reason: 'escape' | 'outside' | 'trigger' | 'tab' | 'menu') {
    const previous = { clicked, dismissed, focusPending };
    clicked = false;
    dismissed = true;
    focusPending = null;
    request(false, 0, reason !== 'menu');
    if (visible) {
      ({ clicked, dismissed, focusPending } = previous);
      return;
    }

    search = { text: '', time: 0 };
    if ((reason === 'escape'
      || reason === 'menu')
      && popup?.contains(
        popup.ownerDocument.activeElement
      )
      && anchor instanceof HTMLElement
      && anchor.isConnected) {
      closing = true;
      anchor.focus({ preventScroll: true });
      closing = false;
    }
  }

  function handleEnter(event: PointerEvent) {
    if (resolvedDisabled
      || event.pointerType === 'touch'
      || anchor?.matches(
        ':disabled, [aria-disabled="true"]'
      )) return;

    hovered = true;
    dismissed = false;
    if (supports('hover'))
      request(true, getTooltipDelay(mouseEnterDelay));
  }

  function handleLeave() {
    hovered = false;
    if (!wanted())
      request(false, getTooltipDelay(mouseLeaveDelay));
  }

  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented
      || resolvedDisabled
      || anchor?.matches(
        ':disabled, [aria-disabled="true"]'
      )
      || !supports(
        'click'
      )
      && !(event.detail === 0
        && supports(
          'hover'
        ))) return;

    if (clicked || visible && !wanted())
      close('trigger');
    else {
      clicked = true;
      dismissed = false;
      focusPending = 'first';
      request(true);
    }
  }

  function handleTriggerKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented
      || event.isComposing
      || resolvedDisabled
      || !supports('click')
      && !supports(
        'hover'
      )
      && !visible
      || anchor?.matches(
        ':disabled, [aria-disabled="true"]'
      )) return;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    clicked = true;
    dismissed = false;
    focusPending = event.key === 'ArrowDown' ? 'first' : 'last';
    request(true);
  }

  function handlePopupHover(next: boolean) {
    popupHovered = next;
    if (next)
      cancelPending();
    else if (!wanted())
      request(false, getTooltipDelay(mouseLeaveDelay));
  }

  function handleFocusout(event: FocusEvent) {
    if (closing
      || !shown
      || event.relatedTarget instanceof Node
      && popup?.contains(
        event.relatedTarget
      )) return;
    if (event.relatedTarget === null && !leavingByTab) return;
    if (!leavingByTab
      && event.relatedTarget instanceof Node
      && host?.contains(event.relatedTarget)) {
      menuFocused = false;
      return;
    }

    menuFocused = false;
    leavingByTab = false;
    close('tab');
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented
      || event.isComposing
      || event.ctrlKey
      || event.altKey
      || event.metaKey) return;

    leavingByTab = event.key === 'Tab';
    const direction = event.key === 'ArrowDown'
      ? 'next'
      : event.key === 'ArrowUp'
        ? 'previous'
        : event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : null;
    if (direction) {
      event.preventDefault();
      focusItem(getDropdownNavigationKey(items, resolvedKey, direction));
      return;
    }
    if (event.key === ' ') {
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[role="menuitem"]')
        : null;
      if (link) {
        event.preventDefault();
        link.click();
      }
      return;
    }
    if (Array.from(event.key).length !== 1) return;

    event.preventDefault();
    const now = Date.now();
    const previous = now - search.time < 1000 ? search.text : '';
    const repeated = previous
      && Array.from(previous).every(
        (character) => character.toLocaleLowerCase() === event.key.toLocaleLowerCase()
      );
    search = { text: repeated ? event.key : previous + event.key, time: now };
    const commands = getDropdownCommands(items).map((item) => {
      const element = Array.from(list?.querySelectorAll<HTMLElement>('[role="menuitem"]')
        ?? []).find(
          (node) => node.dataset.dropdownKey === item.key
        );
      return {
        key: item.key,
        text: item.textValue
          ?? (typeof item.label === 'string'
            ? item.label
            : element?.querySelector('.ant-dropdown-menu-title-content')?.textContent ?? '')
      };
    });
    const key = getDropdownMatch(commands, resolvedKey, search.text);
    if (key !== null)
      focusItem(key);
  }

  function activate(key: string, event: MouseEvent) {
    const item = getDropdownCommands(items).find((command) => command.key === key);
    if (!active
      || !visible
      || !shown
      || resolvedDisabled
      || !item
      || event.defaultPrevented) return;

    const info: DropdownClickInfo = { key, domEvent: event };
    item.onClick?.(info);
    if (!active || event.defaultPrevented) return;
    menu.onClick?.(info);
    if (active && !event.defaultPrevented)
      close('menu');
  }
</script>

<style>
  .ant-dropdown-trigger { display: inline-block; max-width: 100%; vertical-align: middle; }
  .ant-dropdown { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; width: max-content; overflow: visible; }
  .ant-dropdown[hidden], .ant-dropdown:not(:popover-open) { display: none; }
  .ant-dropdown-menu { box-sizing: border-box; width: 100%; max-width: 100%; max-height: calc(100dvh - 16px); overflow: auto; overflow-wrap: anywhere; }
  :where(button, a) { appearance: none; width: 100%; margin: 0; border: 0; background: transparent; color: inherit; text-align: start; font: inherit; }
  a.ant-dropdown-menu-item { box-sizing: border-box; text-decoration: none; }
  .ant-dropdown-menu-title-content { min-width: 0; white-space: normal; }
  .ant-dropdown-menu-empty { padding: 8px 12px; color: var(--ant-color-text-description); }
  .ant-dropdown-placement-top > .ant-dropdown-arrow, .ant-dropdown-placement-topLeft > .ant-dropdown-arrow, .ant-dropdown-placement-topRight > .ant-dropdown-arrow { left: var(--arrow-x, 50%); right: auto; transform: translateX(-50%) translateY(100%) rotate(180deg); }
  .ant-dropdown-placement-bottom > .ant-dropdown-arrow, .ant-dropdown-placement-bottomLeft > .ant-dropdown-arrow, .ant-dropdown-placement-bottomRight > .ant-dropdown-arrow { left: var(--arrow-x, 50%); right: auto; transform: translateX(-50%) translateY(-100%); }
  @media (prefers-reduced-motion: reduce) { .ant-dropdown, .ant-dropdown .ant-dropdown-menu, .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item { animation: none; transition: none; } }
</style>

<span bind:this={host} id={triggerId} role="presentation" class={['ant-dropdown-trigger', className]} {style} onpointerenter={handleEnter} onpointerleave={handleLeave} onclick={handleClick} onkeydown={handleTriggerKeydown}>{@render children()}</span>
<NoCompactStyle>
<div bind:this={popup} id={`${menuId}-popup`} popover="manual" role="presentation" hidden dir={config.direction} class={[
    'ant-dropdown',
    'ant-dropdown-css-var',
    `ant-dropdown-placement-${shown ? actualPlacement : requestedPlacement}`,
    config.direction === 'rtl' && 'ant-dropdown-rtl'
  ]} onpointerenter={(event) => {
      if (event.pointerType !== 'touch')
        handlePopupHover(true);
    }} onpointerleave={() => handlePopupHover(false)} onfocusin={() => {
      menuFocused = true;
      cancelPending();
    }} onfocusout={handleFocusout}>
  {#if arrow}<span class="ant-dropdown-arrow" aria-hidden="true"></span>{/if}
  <ul bind:this={list} id={menuId} role="menu" tabindex="-1" aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : triggerId} class="ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical" onkeydown={handleMenuKeydown}>
    {#each items as item (item.key)}
      {#if item.type === 'divider'}<li role="separator" class="ant-dropdown-menu-item-divider"></li>
      {:else}
        <li role="none"><svelte:element this={item.href === undefined ? 'button' : 'a'} type={item.href === undefined ? 'button' : undefined} href={item.disabled ? undefined : item.href} target={item.href === undefined ? undefined : item.target} rel={item.href === undefined ? undefined : item.rel} role="menuitem" data-dropdown-key={item.key} disabled={item.href === undefined ? item.disabled : undefined} aria-disabled={item.href !== undefined && item.disabled || undefined} tabindex={resolvedKey === item.key ? 0 : -1} aria-label={typeof item.label === 'function' ? item.textValue : undefined} class={[
            'ant-dropdown-menu-item',
            item.disabled && 'ant-dropdown-menu-item-disabled',
            item.danger && 'ant-dropdown-menu-item-danger',
            resolvedKey === item.key && 'ant-dropdown-menu-item-active'
          ]} onfocus={() => {
              activeKey = item.key;
            }} onpointermove={(event: PointerEvent) => {
              if (!item.disabled && event.pointerType !== 'touch') {
                activeKey = item.key;
                if (menuFocused)
                  focusItem(item.key);
              }
            }} onclick={(event: MouseEvent) => activate(item.key, event)}>
          {#if item.icon}<span class="ant-dropdown-menu-item-icon" aria-hidden="true">{@render item.icon()}</span>{/if}
          <span class="ant-dropdown-menu-title-content">{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}</span>
        </svelte:element></li>
      {/if}
    {:else}<li role="none" class="ant-dropdown-menu-empty">{config.locale.emptyText}</li>{/each}
  </ul>
</div>
</NoCompactStyle>
