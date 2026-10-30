<script lang="ts">
  import { useConfig } from './config-context';
  import type { TableFilterOption, TableFilterValue } from './table.types';
  import { ruRU } from './types';
  import Button from './Button.svelte';
  import Checkbox from './Checkbox.svelte';
  import Icon from './Icon.svelte';

  let { title, options, value, multiple, disabled, onApply }: {
    title: string;
    options: readonly TableFilterOption[];
    value: readonly TableFilterValue[];
    multiple: boolean;
    disabled: boolean;
    onApply: (values: TableFilterValue[]) => void;
  } = $props();

  const config = useConfig();
  const id = $props.id();
  let trigger = $state<HTMLButtonElement>();
  let panel = $state<HTMLDivElement>();
  let open = $state(false);
  let draft = $state<TableFilterValue[]>([]);
  let openedValue: TableFilterValue[] = [];
  let openedOptions: TableFilterOption[] = [];
  let openedMultiple = true;
  let label = $derived(`${config.locale.table?.filterTitle ?? ruRU.table.filterTitle}: ${title}`);

  $effect(() => {
    if (!open || !panel) {
      return;
    }

    const sameValue = value.length === openedValue.length
      && value.every(
        (item) => openedValue.includes(item)
      );
    const sameOptions = options.length === openedOptions.length
      && options.every(
        (item, index) => Object.is(item.value, openedOptions[index].value)
          && item.text === openedOptions[index].text
      );

    if (disabled || !sameValue || !sameOptions || multiple !== openedMultiple) {
      panel.hidePopover();
    }
  });

  $effect(() => {
    if (!open || !panel || !trigger) {
      return;
    }

    positionPanel();
    const focusFrame = requestAnimationFrame(() => {
      positionPanel();

      if (panel?.matches(':popover-open')
        && (document.activeElement === panel
          || !panel.contains(
            document.activeElement
          ))) {
        (panel.querySelector<HTMLInputElement>('input:checked')
          ?? panel.querySelector<
            HTMLInputElement
          >(
            'input'
          ))?.focus(
            { preventScroll: true }
          );
      }
    });
    const observer = new ResizeObserver(positionPanel);
    observer.observe(panel);
    for (const cell of trigger.closest('tr')?.cells ?? [])
      observer.observe(cell);
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);

    return () => {
      cancelAnimationFrame(focusFrame);
      observer.disconnect();
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  });

  function positionPanel() {
    if (!panel?.matches(':popover-open') || !trigger) {
      return;
    }

    const anchor = trigger.getBoundingClientRect();
    const bounds = panel.getBoundingClientRect();
    const start = config.direction === 'rtl' ? anchor.right - bounds.width : anchor.left;
    panel.style.left = `${Math.max(8, Math.min(start, window.innerWidth - bounds.width - 8))}px`;
    const below = anchor.bottom + 4;
    panel.style.top = `${Math.max(
      8,
      Math.min(
        below + bounds.height <= window.innerHeight - 8 ? below : anchor.top - bounds.height - 4,
        window.innerHeight - bounds.height - 8
      )
    )}px`;
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  }

  function beforeToggle(event: ToggleEvent) {
    if (event.newState === 'open') {
      if (disabled) {
        event.preventDefault();
        return;
      }

      openedValue = [...value];
      openedOptions = options.map((option) => ({ ...option }));
      openedMultiple = multiple;
      draft = [...value];
      panel?.style.setProperty('opacity', '0');
      panel?.style.setProperty('pointer-events', 'none');
      open = true;
    } else {
      open = false;
    }
  }

  function choose(option: TableFilterValue, checked: boolean) {
    if (!multiple) {
      draft = [option];
      return;
    }

    const selected = new Set(draft);

    if (checked) {
      selected.add(option);
    } else {
      selected.delete(option);
    }

    draft = [...selected];
  }

  function close() {
    panel?.hidePopover();
    trigger?.focus();
  }

  function confirm() {
    if (disabled) {
      return;
    }

    const selected = [...draft];
    close();
    onApply(selected);
  }

  function reset() {
    panel?.querySelector<HTMLInputElement>('input')?.focus();
    draft = [];
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.stopPropagation();
      confirm();
    }
  }

  function handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget;

    if (next instanceof Node && (panel?.contains(next) || next === trigger)) {
      return;
    }

    if (panel?.matches(':popover-open')) {
      panel.hidePopover();
    }
  }
</script>

<style>
  .ant-table-filter-trigger { flex: none; min-width: 24px; min-height: 24px; border: 0; background: transparent; font: inherit; }
  .ant-table-filter-trigger:disabled { cursor: not-allowed; }
  .ant-table-filter-trigger:focus-visible, input:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  /* visibility наследуется Checkbox с transition: all и задерживает фокус при открытии. */
  .filter-popover { position: fixed; inset: auto; width: min(260px, calc(100vw - 16px)); max-height: min(360px, calc(100dvh - 16px)); margin: 0; padding: 0; overflow-y: auto; opacity: 0; pointer-events: none; border: 0; border-radius: var(--ant-border-radius-lg); background: var(--ant-color-bg-container); color: var(--ant-color-text); box-shadow: var(--ant-box-shadow-secondary); font: var(--ant-font-size)/var(--ant-line-height) var(--ant-font-family); font-weight: 400; text-align: start; }
  .filter-options { display: grid; gap: var(--ant-margin-xs); padding: var(--ant-padding-sm); overflow-wrap: anywhere; }
  .radio-option { display: flex; align-items: center; gap: var(--ant-margin-xs); cursor: pointer; }
  .radio-option input { flex: none; width: 16px; height: 16px; margin: 0; accent-color: var(--ant-color-primary); }
  .ant-table-filter-dropdown-btns { display: flex; justify-content: space-between; gap: var(--ant-margin-xs); padding: var(--ant-padding-xs); border-top: var(--ant-line-width) solid var(--ant-color-border-secondary); }
</style>

<button bind:this={trigger} type="button" class={['ant-table-filter-trigger', value.length > 0 && 'active']} {disabled} aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={`ant-filter-${id}`} popovertarget={`ant-filter-${id}`}><Icon name="filter" /></button>
<div bind:this={panel} id={`ant-filter-${id}`} class="filter-popover ant-dropdown" popover="auto" role="dialog" tabindex="-1" aria-label={label} dir={config.direction} onbeforetoggle={beforeToggle} onkeydown={handleKeydown} onfocusout={handleFocusOut}>
  <div class="ant-table-filter-dropdown">
    <div class="filter-options" role="group" aria-label={label}>
      {#each options as option, index (index)}
        {#if multiple}
          <Checkbox checked={draft.includes(option.value)} {disabled} onCheckedChange={(checked) => choose(option.value, checked)}>{option.text}</Checkbox>
        {:else}
          <label class="radio-option"><input type="radio" name={`ant-filter-${id}`} value={index} checked={draft.includes(option.value)} {disabled} onchange={() => choose(option.value, true)} />{option.text}</label>
        {/if}
      {/each}
    </div>
    <div class="ant-table-filter-dropdown-btns">
      <Button type="text" size="small" disabled={disabled || draft.length === 0} onclick={reset}>{config.locale.table?.filterReset ?? ruRU.table.filterReset}</Button>
      <Button type="primary" size="small" {disabled} onclick={confirm}>{config.locale.table?.filterApply ?? ruRU.table.filterApply}</Button>
    </div>
  </div>
</div>
