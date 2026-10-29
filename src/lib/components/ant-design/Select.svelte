<script lang="ts" generics="Value extends string | number = string, Mode extends 'multiple' | undefined = undefined">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useFormField } from './form-context';
  import { filterOptions, getEnabledIndex, getSelectValues } from './select.engine';
  import { ruRU, type SelectOption } from './types';
  import type { SelectProps } from './select.types';
  import Icon from './Icon.svelte';

  let {
    options,
    mode,
    defaultValue,
    value = $bindable<SelectProps<Value, Mode>['value']>(),
    size,
    showSearch,
    allowClear = false,
    status,
    disabled,
    id,
    name,
    placeholder,
    onValueChange,
    onOpenChange,
    onkeydown,
    onbeforeinput,
    onblur,
    onclick,
    style,
    class: className = '',
    ...attributes
  }: SelectProps<Value, Mode> = $props();

  const config = useConfig();
  const compact = useCompact();
  const field = useFormField();
  const generatedId = $props.id();
  const initialDefault = untrack(() => Array.isArray(defaultValue) ? [...defaultValue] : defaultValue);
  let useDefault = $state(true);
  let isOpen = $state(false);
  let search = $state('');
  let activeValue = $state<Value>();
  let container: HTMLDivElement;
  let control = $state<HTMLInputElement>();
  let list = $state<HTMLDivElement>();
  let typeahead = '';
  let lastTyped = 0;
  let controlId = $derived(id ?? field?.id ?? `ant-select-${generatedId}`);
  let selectedValue = $derived(value ?? (useDefault ? initialDefault : undefined));
  let selected = $derived(options.find((option) => option.value === selectedValue));
  let multiple = $derived(mode === 'multiple');
  let canSearch = $derived(showSearch ?? multiple);
  // Readonly исключает input из нативной проверки; required multiple блокирует ввод через beforeinput.
  let isReadOnly = $derived(!canSearch && (!multiple || !attributes.required));
  let selectedValues = $derived(multiple ? getSelectValues(selectedValue) : []);
  let selectedKeys = $derived(new Set(selectedValues));
  let optionMap = $derived(new Map(options.map((option) => [option.value, option])));
  let tags = $derived(selectedValues.map((item) => ({ value: item, label: optionMap.get(item)?.label ?? String(item), disabled: optionMap.get(item)?.disabled ?? false })));
  let filtered = $derived(filterOptions(options, search));
  let activeIndex = $derived.by(() => {
    const index = filtered.findIndex((option) => option.value === activeValue && !option.disabled);

    return index < 0 ? getEnabledIndex(filtered, -1, 'first') : index;
  });
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? config.componentDisabled);
  let resolvedStatus = $derived(status ?? field?.status);
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let compactItemClasses = $derived(compactClasses('ant-select', config.direction, compact));
  let expanded = $derived(isOpen && !resolvedDisabled);

  $effect(() => {
    if (!control || !multiple) return;

    const input = control;
    input.setCustomValidity(attributes.required && !selectedValues.length ? config.locale.selectRequiredText ?? ruRU.selectRequiredText : '');

    return () => input.setCustomValidity('');
  });

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
      activeValue = !multiple && selected && !selected.disabled
        ? selected.value
        : options[getEnabledIndex(options, -1, direction)]?.value;
    }

    setOpen(true);
  }

  function changeMultiple(next: Value[]) {
    if (mode !== 'multiple') return;

    useDefault = false;
    // TypeScript не сужает generic Mode при проверке его значения.
    value = [...next] as typeof value;
    (onValueChange as ((values: Value[]) => void) | undefined)?.(next);
  }

  function choose(option: SelectOption<Value> | undefined) {
    if (resolvedDisabled || option?.disabled) {
      return;
    }

    if (multiple) {
      const next = new Set(selectedValues);

      if (option) {
        if (next.has(option.value)) next.delete(option.value);
        else next.add(option.value);
      } else {
        if (!next.size) return;
        next.clear();
      }

      changeMultiple([...next]);
      search = '';
      control?.focus();
      return;
    }

    useDefault = false;
    value = option?.value as typeof value;
    (onValueChange as ((value: Value | undefined) => void) | undefined)?.(option?.value);
    setOpen(false);
    control?.focus();
  }

  function remove(item: Value) {
    if (resolvedDisabled || optionMap.get(item)?.disabled) return;

    const next = new Set(selectedValues);

    if (next.delete(item)) changeMultiple([...next]);
    control?.focus();
  }

  function handleReset(event: Event) {
    const input = control;

    if (!multiple || !input || event.target !== input.form) return;

    queueMicrotask(() => {
      if (event.defaultPrevented || !input.isConnected || input !== control || !multiple) return;

      useDefault = false;
      value = getSelectValues(initialDefault) as typeof value;
      search = '';
      isOpen = false;
    });
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
    } else if (event.key === 'Enter' || (event.key === ' ' && !canSearch)) {
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
    } else if (multiple && event.key === 'Backspace' && !search && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();

      const last = [...tags].reverse().find((tag) => !tag.disabled);

      if (last) remove(last.value);
    } else if (!multiple && allowClear && !canSearch && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      choose(undefined);
    } else if (!canSearch && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead = (event.timeStamp - lastTyped > 700 ? '' : typeahead) + event.key;
      lastTyped = event.timeStamp;
      const matches = filterOptions(options, typeahead);

      openList();
      activeValue = matches[getEnabledIndex(matches, -1, 'first')]?.value;
    }
  }

  function handleBeforeInput(event: InputEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onbeforeinput?.(event);

    if (multiple && !canSearch) event.preventDefault();
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    if (multiple && !canSearch) {
      event.currentTarget.value = search;
      return;
    }

    search = event.currentTarget.value;
    const matches = filterOptions(options, search);
    activeValue = matches[getEnabledIndex(matches, -1, 'first')]?.value;
    setOpen(true);
  }

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onclick?.(event);

    if (!event.defaultPrevented) {
      if (expanded && !canSearch) { setOpen(false); } else { openList(); }
    }
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    setOpen(false);
    field?.onBlur();
    onblur?.(event);
  }

  function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    const target = event.target;

    if (multiple && target instanceof Element && !target.closest('button, input') && !resolvedDisabled) {
      event.preventDefault();
      control?.focus();
      openList();
    } else if (target === event.currentTarget && !resolvedDisabled) {
      event.preventDefault();
      control?.focus();
      control?.click();
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
  .ant-select.ant-select-single .ant-select-input, .ant-select.ant-select-multiple .ant-select-input {
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
  .ant-select.ant-select-multiple { height: auto; min-height: var(--ant-select-height); }
  .ant-select.ant-select-multiple .ant-select-content { gap: 0; }
  .ant-select.ant-select-multiple .ant-select-input { flex: 1 1 60px; width: 60px; min-width: 40px; max-width: 100%; }
  .ant-select.ant-select-multiple .ant-select-selection-item { flex: none; box-sizing: border-box; max-width: calc(100% - var(--ant-select-internal_fixed_item_margin) * 2); min-width: 0; }
  .ant-select-selection-item-remove { flex: none; padding: 0; border: 0; background: transparent; }
  .ant-select-selection-item-remove:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 1px; }
  .ant-select-selection-item-disabled { color: var(--ant-select-multiple-item-color-disabled); }
  .container.ant-select-compact-item > .ant-select { border-radius: inherit; }
</style>

<svelte:document onpointerdown={handleOutside} onreset={handleReset} />

<div class={['container ant-select-css-var', compactItemClasses, compact && resolvedSize === 'large' && 'ant-select-lg', compact && resolvedSize === 'small' && 'ant-select-sm', compact && expanded && 'ant-select-focused', compact && resolvedDisabled && 'ant-select-disabled', className]} bind:this={container} {style}>
  <div
    role="presentation"
    onpointerdown={handlePointerDown}
    class={[
      'ant-select ant-select-css-var ant-select-outlined ant-select-show-arrow',
      multiple ? 'ant-select-multiple' : 'ant-select-single',
      expanded && 'ant-select-open ant-select-focused',
      resolvedDisabled && 'ant-select-disabled',
      resolvedSize === 'large' && 'ant-select-lg',
      resolvedSize === 'small' && 'ant-select-sm',
      resolvedStatus && `ant-select-status-${resolvedStatus}`
    ]}
  >
    <div class="ant-select-content">
      {#if multiple}
        {#each tags as tag (tag.value)}
          <span class={['ant-select-selection-item', (resolvedDisabled || tag.disabled) && 'ant-select-selection-item-disabled']} title={tag.label}>
            <span class="ant-select-selection-item-content">{tag.label}</span>
            {#if !resolvedDisabled && !tag.disabled}<button type="button" class="ant-select-selection-item-remove" aria-label={`${config.locale.removeText ?? ruRU.removeText} ${tag.label}`} onpointerdown={(event) => event.preventDefault()} onclick={() => remove(tag.value)}><Icon name="close" /></button>{/if}
          </span>
        {/each}
      {/if}
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
        aria-autocomplete={canSearch ? 'list' : 'none'}
        aria-invalid={resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
        aria-required={attributes.required || field?.required || undefined}
        aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
        autocomplete="off"
        readonly={isReadOnly}
        inputmode={attributes.inputmode ?? (multiple && !canSearch ? 'none' : undefined)}
        required={multiple ? false : attributes.required}
        disabled={resolvedDisabled}
        value={multiple ? search : expanded && canSearch ? search : selected?.label ?? ''}
        placeholder={multiple ? selectedValues.length ? undefined : placeholder : expanded && canSearch ? selected?.label ?? placeholder : placeholder}
        onkeydown={handleKeydown}
        onbeforeinput={handleBeforeInput}
        oninput={handleInput}
        onclick={handleClick}
        onblur={handleBlur}
      />
    </div>
    {#if allowClear && (multiple ? selectedValues.length : selected) && !resolvedDisabled}
      <button type="button" class="clear" aria-label={config.locale.clearText} onpointerdown={(event) => event.preventDefault()} onclick={() => choose(undefined)}><Icon name="close" /></button>
    {/if}
    <span class="suffix"><Icon name="down" /></span>
  </div>
  {#if name ?? field?.name}
    {#if multiple}
      {#each selectedValues as item (item)}<input type="hidden" name={name ?? field?.name} value={item} disabled={resolvedDisabled} form={attributes.form} />{/each}
    {:else}
      <input type="hidden" name={name ?? field?.name} value={typeof selectedValue === 'string' || typeof selectedValue === 'number' ? selectedValue : ''} disabled={resolvedDisabled} form={attributes.form} />
    {/if}
  {/if}
  {#if expanded}
    <div
      bind:this={list}
      class="popup ant-select-dropdown"
      id={`${controlId}-list`}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      aria-label={attributes['aria-label'] ?? placeholder ?? config.locale.searchText}
    >
      {#each filtered as option, index (option.value)}
        <button
          type="button"
          role="option"
          tabindex="-1"
          id={`${controlId}-option-${index}`}
          aria-selected={multiple ? selectedKeys.has(option.value) : option.value === selectedValue}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          class={[
            'ant-select-item ant-select-item-option',
            (multiple ? selectedKeys.has(option.value) : option.value === selectedValue) && 'ant-select-item-option-selected',
            index === activeIndex && 'ant-select-item-option-active',
            option.disabled && 'ant-select-item-option-disabled'
          ]}
          onpointerdown={(event) => event.preventDefault()}
          onpointermove={() => { if (!option.disabled) activeValue = option.value; }}
          onclick={() => choose(option)}
        >
          <span class="ant-select-item-option-content">{option.label}</span>
          {#if multiple ? selectedKeys.has(option.value) : option.value === selectedValue}<span class="ant-select-item-option-state"><Icon name="check" /></span>{/if}
        </button>
      {:else}
        <div class="ant-select-item-empty">{config.locale.emptyText}</div>
      {/each}
    </div>
  {/if}
</div>
