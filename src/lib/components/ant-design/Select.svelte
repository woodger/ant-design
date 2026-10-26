<script lang="ts" generics="Value extends string | number = string">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useFormField } from './form-context';
  import { filterOptions, getEnabledIndex } from './select.engine';
  import type { SelectOption } from './types';
  import type { SelectProps } from './select.types';
  import Icon from './Icon.svelte';

  let {
    options,
    defaultValue,
    value = $bindable<Value | undefined>(),
    size,
    showSearch = false,
    allowClear = false,
    status,
    disabled,
    id,
    name,
    placeholder,
    onValueChange,
    onOpenChange,
    onkeydown,
    onblur,
    onclick,
    style,
    class: className = '',
    ...attributes
  }: SelectProps<Value> = $props();

  const config = useConfig();
  const field = useFormField();
  const generatedId = $props.id();
  const initialDefault = untrack(() => defaultValue);
  let useDefault = $state(true);
  let isOpen = $state(false);
  let search = $state('');
  let activeValue = $state<Value>();
  let container: HTMLDivElement;
  let control: HTMLInputElement;
  let list = $state<HTMLDivElement>();
  let typeahead = '';
  let lastTyped = 0;
  let controlId = $derived(id ?? field?.id ?? `ant-select-${generatedId}`);
  let selectedValue = $derived(value ?? (useDefault ? initialDefault : undefined));
  let selected = $derived(options.find((option) => option.value === selectedValue));
  let filtered = $derived(filterOptions(options, search));
  let activeIndex = $derived.by(() => {
    const index = filtered.findIndex((option) => option.value === activeValue && !option.disabled);

    return index < 0 ? getEnabledIndex(filtered, -1, 'first') : index;
  });
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? config.componentDisabled);
  let resolvedStatus = $derived(status ?? field?.status);
  let resolvedSize = $derived(size ?? config.componentSize);
  let expanded = $derived(isOpen && !resolvedDisabled);

  $effect(() => {
    if (expanded && activeIndex >= 0) {
      list?.querySelector(`#${CSS.escape(`${controlId}-option-${activeIndex}`)}`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  });

  function setOpen(next: boolean) {
    if (next && resolvedDisabled) {
      return;
    }

    if (isOpen !== next) {
      isOpen = next;
      onOpenChange?.(next);
    }

    if (!next) {
      search = '';
    }
  }

  function openList(direction: 'first' | 'last' = 'first') {
    if (!isOpen) {
      search = '';
      activeValue = selected && !selected.disabled
        ? selected.value
        : options[getEnabledIndex(options, -1, direction)]?.value;
    }

    setOpen(true);
  }

  function choose(option: SelectOption<Value> | undefined) {
    if (resolvedDisabled || option?.disabled) {
      return;
    }

    useDefault = false;
    value = option?.value;
    onValueChange?.(option?.value);
    setOpen(false);
    control.focus();
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeydown?.(event);

    if (event.defaultPrevented || resolvedDisabled || event.isComposing) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!expanded) {
        openList(event.key === 'ArrowUp' ? 'last' : 'first');
      } else {
        activeValue = filtered[getEnabledIndex(filtered, activeIndex, event.key === 'ArrowUp' ? 'previous' : 'next')]?.value;
      }
    } else if ((event.key === 'Home' || event.key === 'End') && expanded) {
      event.preventDefault();
      activeValue = filtered[getEnabledIndex(filtered, -1, event.key === 'Home' ? 'first' : 'last')]?.value;
    } else if (event.key === 'Enter' || (event.key === ' ' && !showSearch)) {
      event.preventDefault();

      if (!expanded) {
        openList();
      } else if (activeIndex >= 0) {
        choose(filtered[activeIndex]);
      }
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (allowClear && !showSearch && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      choose(undefined);
    } else if (!showSearch && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead = (event.timeStamp - lastTyped > 700 ? '' : typeahead) + event.key;
      lastTyped = event.timeStamp;
      const matches = filterOptions(options, typeahead);

      openList();
      activeValue = matches[getEnabledIndex(matches, -1, 'first')]?.value;
    }
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    search = event.currentTarget.value;
    const matches = filterOptions(options, search);
    activeValue = matches[getEnabledIndex(matches, -1, 'first')]?.value;
    setOpen(true);
  }

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onclick?.(event);

    if (!event.defaultPrevented) {
      if (expanded && !showSearch) { setOpen(false); } else { openList(); }
    }
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    setOpen(false);
    field?.onBlur();
    onblur?.(event);
  }

  function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    if (event.target === event.currentTarget && !resolvedDisabled) {
      event.preventDefault();
      control.focus();
      control.click();
    }
  }

  function handleOutside(event: PointerEvent) {
    if (event.target instanceof Node && !container.contains(event.target)) {
      setOpen(false);
    }
  }
</script>

<style>
  .container { position: relative; min-width: 0; width: 100%; }
  .ant-select { display: flex; align-items: center; width: 100%; }
  .ant-select:focus-within { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-select.ant-select-single .ant-select-input {
    position: relative;
    inset: auto;
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: inherit;
    cursor: inherit;
  }
  .ant-select-input::placeholder { color: var(--ant-color-text-placeholder); }
  .suffix { display: flex; flex: none; color: var(--ant-color-text-quaternary); pointer-events: none; }
  .clear { display: flex; padding: 0; margin-inline-end: 4px; border: 0; background: none; color: var(--ant-color-text-tertiary); cursor: pointer; }
  .clear:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .popup.ant-select-dropdown { top: calc(100% + 4px); inset-inline: 0; max-height: 256px; overflow-y: auto; }
  .ant-select-item { width: 100%; border: 0; background: none; font-family: inherit; text-align: start; }
</style>

<svelte:document onpointerdown={handleOutside} />

<div class={`container ant-select-css-var ${className}`} bind:this={container} {style}>
  <div
    role="presentation"
    onpointerdown={handlePointerDown}
    class={[
      'ant-select ant-select-css-var ant-select-single ant-select-outlined ant-select-show-arrow',
      expanded && 'ant-select-open ant-select-focused',
      resolvedDisabled && 'ant-select-disabled',
      resolvedSize === 'large' && 'ant-select-lg',
      resolvedSize === 'small' && 'ant-select-sm',
      resolvedStatus && `ant-select-status-${resolvedStatus}`
    ]}
  >
    <div class="ant-select-content">
      <input
        {...attributes}
        bind:this={control}
        id={controlId}
        class="ant-select-input"
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={`${controlId}-list`}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${controlId}-option-${activeIndex}` : undefined}
        aria-autocomplete={showSearch ? 'list' : 'none'}
        aria-invalid={resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
        aria-required={attributes.required || field?.required || undefined}
        aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
        autocomplete="off"
        readonly={!showSearch}
        disabled={resolvedDisabled}
        value={expanded && showSearch ? search : selected?.label ?? ''}
        placeholder={expanded && showSearch ? selected?.label ?? placeholder : placeholder}
        onkeydown={handleKeydown}
        oninput={handleInput}
        onclick={handleClick}
        onblur={handleBlur}
      />
    </div>
    {#if allowClear && selected && !resolvedDisabled}
      <button type="button" class="clear" aria-label={config.locale.clearText} onpointerdown={(event) => event.preventDefault()} onclick={() => choose(undefined)}><Icon name="close" /></button>
    {/if}
    <span class="suffix"><Icon name="down" /></span>
  </div>
  {#if name ?? field?.name}
    <input type="hidden" name={name ?? field?.name} value={selectedValue ?? ''} disabled={resolvedDisabled} form={attributes.form} />
  {/if}
  {#if expanded}
    <div
      bind:this={list}
      class="popup ant-select-dropdown"
      id={`${controlId}-list`}
      role="listbox"
      aria-label={attributes['aria-label'] ?? placeholder ?? config.locale.searchText}
    >
      {#each filtered as option, index (option.value)}
        <button
          type="button"
          role="option"
          tabindex="-1"
          id={`${controlId}-option-${index}`}
          aria-selected={option.value === selectedValue}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          class={[
            'ant-select-item ant-select-item-option',
            option.value === selectedValue && 'ant-select-item-option-selected',
            index === activeIndex && 'ant-select-item-option-active',
            option.disabled && 'ant-select-item-option-disabled'
          ]}
          onpointerdown={(event) => event.preventDefault()}
          onpointermove={() => { if (!option.disabled) activeValue = option.value; }}
          onclick={() => choose(option)}
        >
          <span class="ant-select-item-option-content">{option.label}</span>
          {#if option.value === selectedValue}<span class="ant-select-item-option-state"><Icon name="check" /></span>{/if}
        </button>
      {:else}
        <div class="ant-select-item-empty">{config.locale.emptyText}</div>
      {/each}
    </div>
  {/if}
</div>
