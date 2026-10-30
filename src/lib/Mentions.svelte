<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import type { MentionsProps, MentionsOption } from './mentions.types';
  import { getMentionMeasure, validateMentionSearch, filterMentionOption, replaceMention } from './mentions.engine';
  import { connectMentionsMeasure } from './mentions.dom';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { useCompact } from './space-compact-context';
  import { connectPopup } from './popup.dom';
  import Icon from './Icon.svelte';

  let {
    value, defaultValue = '', options = [], prefix = '@', split = ' ', filterOption = filterMentionOption, validateSearch = validateMentionSearch,
    loading = false, notFoundContent, placement = 'bottom', autoSize = false, allowClear = false, size, status, variant = 'outlined',
    onChange, onSearch, onSelect, onClear, onFocus, onBlur, onKeyDown, onKeyUp, onPressEnter, onResize, onPopupScroll,
    class: className = '', rootClassName = '', popupClassName = '', style, id, name, disabled, readonly,
    nativeElement = $bindable(), textarea = $bindable(), oninput, onkeydown, onkeyup, ...attributes
  }: MentionsProps = $props();
  const config = useConfig(); const form = useForm(); const field = useFormField(); const compact = useCompact();
  const generated = $props.id();
  let internalValue = $state(untrack(() => value ?? defaultValue));
  let text = $derived(value ?? internalValue);
  let blocked = $derived(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let controlId = $derived(id ?? field?.id ?? `ant-mentions-${generated}`);
  let prefixes = $derived(typeof prefix === 'string' ? [prefix] : prefix);
  let measuring = $state(false); let query = $state(''); let token = $state(''); let location = $state(0); let active = $state(0);
  let filtered = $derived<readonly MentionsOption[]>(loading ? [{ value: 'ANTD_SEARCHING', disabled: true }] : filterOption === false ? options : options.filter(option => filterOption(query, option)));
  let visible = $derived(measuring && !blocked && !readonly);
  let focused = $state(false); let shown = $state(false); let mounted = $state(false);
  let mirror = $state<HTMLDivElement>(); let anchor = $state<HTMLSpanElement>(); let popup = $state<HTMLDivElement>();
  let measure: ReturnType<typeof connectMentionsMeasure> | undefined;
  let blurTimer: ReturnType<typeof setTimeout> | undefined;
  let previousValue = untrack(() => value);
  let alive = true;
  onDestroy(() => { alive = false; if (blurTimer !== undefined) clearTimeout(blurTimer); });

  $effect(() => { const next = value; if (next !== previousValue) internalValue = next ?? ''; previousValue = next; });
  $effect(() => { if (blocked || readonly) measuring = false; });
  $effect(() => {
    if (!textarea || !mirror) return;
    const element = textarea; const target = mirror; const resize = onResize; const sizing = autoSize;
    const connection = untrack(() => connectMentionsMeasure(element, target, sizing, resize));
    measure = connection;
    return () => { connection.destroy(); if (measure === connection) measure = undefined; };
  });
  $effect(() => { void text; void location; void token; void tick().then(() => { if (alive) measure?.sync(); }); });
  $effect(() => {
    if (!visible) return;
    mounted = true;
    if (!filtered[active] || filtered[active].disabled) active = enabled(0);
  });
  $effect(() => {
    if (!visible || !popup || !anchor || !nativeElement) return;
    return connectPopup(popup, anchor, {
      trigger: nativeElement, placement, align: config.direction === 'rtl' ? 'right' : 'left', gap: 4,
      autoAdjustOverflow: true, maxWidth: '100vw', onPlacement: () => {}, onVisibilityChange: next => { shown = next; },
      onDismiss: () => { measuring = false; }
    });
  });
  $effect(() => { const index = active; if (visible && index >= 0) popup?.querySelector(`#${CSS.escape(`${controlId}-option-${index}`)}`)?.scrollIntoView({ block: 'nearest' }); });

  function enabled(start: number, offset = 1) {
    for (let step = 0; step < filtered.length; step++) {
      const index = ((start + step * offset) % filtered.length + filtered.length) % filtered.length;
      if (!filtered[index].disabled) return index;
    }
    return -1;
  }
  function change(next: string) { internalValue = next; onChange?.(next); }
  function handleInput(event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) {
    if (blocked || readonly) return;
    const element = event.currentTarget;
    change(element.value); oninput?.(event);
    void tick().then(() => { if (alive && element.isConnected && value !== undefined && element.value !== text) element.value = text; });
  }
  async function choose(option: MentionsOption) {
    if (blocked || readonly || loading || option.disabled || !textarea) return;
    const result = replaceMention(text, { location, prefix: token, target: option.value, selectionStart: textarea.selectionStart, split });
    const selectedPrefix = token;
    change(result.text); measuring = false; query = ''; location = 0;
    onSelect?.({ ...option }, selectedPrefix);
    await tick();
    if (alive && textarea?.isConnected) { textarea.focus({ preventScroll: true }); textarea.setSelectionRange(result.selection, result.selection); }
  }
  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) {
    onKeyDown?.(event); onkeydown?.(event);
    if (event.defaultPrevented || event.isComposing || blocked || readonly) return;
    if (!visible) { if (event.key === 'Enter') onPressEnter?.(event); return; }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && filtered.length) {
      const next = enabled(active + (event.key === 'ArrowDown' ? 1 : -1), event.key === 'ArrowDown' ? 1 : -1);
      if (next >= 0) active = next;
      event.preventDefault();
    } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); measuring = false; }
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (loading) return;
      const index = filtered[active] && !filtered[active].disabled ? active : enabled(0);
      if (index < 0) measuring = false;
      else void choose(filtered[index]);
    }
  }
  function handleKeyup(event: KeyboardEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) {
    onKeyUp?.(event); onkeyup?.(event);
    if (blocked || readonly || ['Escape', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) return;
    const before = event.currentTarget.value.slice(0, event.currentTarget.selectionStart);
    const found = getMentionMeasure(before, prefixes);
    if (found.location < 0) { measuring = false; return; }
    const next = before.slice(found.location + found.prefix.length);
    const valid = validateSearch(next, split);
    const matches = loading || options.some(option => filterOption === false || filterOption(next, option));
    if (valid) {
      if (event.key === found.prefix || ['Shift', 'Alt', 'AltGraph'].includes(event.key) || measuring || next !== query && matches) {
        query = next; token = found.prefix; location = found.location; active = 0; measuring = true;
      }
      onSearch?.(next, found.prefix);
    } else measuring = false;
  }
  function handleFocus(event: FocusEvent) {
    if (blurTimer !== undefined) clearTimeout(blurTimer);
    if (!focused) onFocus?.(event);
    focused = true;
  }
  function handleBlur(event: FocusEvent) {
    if (blurTimer !== undefined) clearTimeout(blurTimer);
    blurTimer = setTimeout(() => { blurTimer = undefined; focused = false; measuring = false; field?.onBlur(); onBlur?.(event); }, 0);
  }
  function clear() {
    if (blocked || readonly || typeof allowClear === 'object' && allowClear.disabled) return;
    change(''); measuring = false; textarea?.focus(); onClear?.();
  }
  export function focus(options?: FocusOptions) { textarea?.focus(options); }
  export function blur() { textarea?.blur(); }
</script>

<style>
  .ant-mentions { max-width: 100%; }
  .ant-mentions-textarea { display: block; width: 100%; min-width: 0; }
  .ant-mentions-measure { position: absolute; inset: 0 auto auto 0; overflow: hidden; visibility: hidden; pointer-events: none; white-space: pre-wrap; }
  .caret-anchor { display: inline-block; width: 1px; height: 1em; vertical-align: text-bottom; }
  .popup { position: fixed; margin: 0; border: 0; overflow: auto; }
  .ant-mentions-dropdown-menu-item { border: 0; width: 100%; background: transparent; font: inherit; text-align: start; }
  .ant-mentions-clear { position: absolute; inset-inline-end: var(--ant-padding-xs); top: 50%; transform: translateY(-50%); display: flex; padding: 0; border: 0; color: var(--ant-color-text-quaternary); background: transparent; cursor: pointer; }
  .ant-mentions-clear:focus-visible { outline: 2px solid var(--ant-color-primary); }
</style>

<div bind:this={nativeElement} {style} dir={config.direction}
  class={['ant-mentions ant-mentions-css-var', `ant-mentions-${variant}`, focused && 'ant-mentions-focused', blocked && 'ant-mentions-disabled',
    config.direction === 'rtl' && 'ant-mentions-rtl', resolvedSize === 'large' && 'ant-mentions-lg', resolvedSize === 'small' && 'ant-mentions-sm',
    resolvedStatus && `ant-mentions-status-${resolvedStatus}`, className, rootClassName]}>
  <textarea {...attributes} bind:this={textarea} id={controlId} name={name ?? field?.name} rows={attributes.rows ?? 1}
    class={['ant-mentions-textarea', config.direction === 'rtl' && 'ant-mentions-textarea-rtl']} dir={attributes.dir ?? config.direction}
    value={text} {readonly} disabled={blocked} required={attributes.required ?? field?.required} role="combobox" aria-expanded={visible}
    aria-autocomplete="list" aria-haspopup="listbox" aria-controls={visible ? `${controlId}-list` : undefined}
    aria-activedescendant={visible && active >= 0 ? `${controlId}-option-${active}` : undefined}
    aria-label={attributes['aria-label'] ?? field?.label} aria-invalid={resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
    aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
    oninput={handleInput} onkeydown={handleKeydown} onkeyup={handleKeyup} onfocus={handleFocus} onblur={handleBlur}></textarea>
  <div bind:this={mirror} class="ant-mentions-measure" aria-hidden="true">{text.slice(0, location) + token}<span bind:this={anchor} class="caret-anchor"></span>{text.slice(location + token.length)}</div>
  {#if allowClear && text && !blocked && !readonly}<button type="button" class="ant-mentions-clear" aria-label={config.locale.clearText}
    disabled={typeof allowClear === 'object' && allowClear.disabled} onpointerdown={event => event.preventDefault()} onclick={clear}>
    {#if typeof allowClear === 'object' && allowClear.clearIcon}{@render allowClear.clearIcon()}{:else}<Icon name="close" />{/if}
  </button>{/if}
  {#if mounted}<div bind:this={popup} popover="manual" hidden={!visible || !shown} class={['popup ant-mentions-dropdown ant-mentions-css-var', popupClassName]} dir={config.direction}>
    <div id={`${controlId}-list`} role="listbox" class="ant-mentions-dropdown-menu" aria-label={attributes['aria-label'] ?? config.locale.searchText} onscroll={onPopupScroll} aria-busy={loading || undefined}>
      {#each filtered as option, index (option.key ?? option.value)}
        <button type="button" role="option" tabindex="-1" id={`${controlId}-option-${index}`} disabled={option.disabled} aria-selected={active === index}
          aria-disabled={option.disabled || undefined} class={['ant-mentions-dropdown-menu-item', active === index && 'ant-mentions-dropdown-menu-item-active', option.disabled && 'ant-mentions-dropdown-menu-item-disabled', 'class' in option && option.class]}
          style={'style' in option ? option.style : undefined} onpointermove={() => { if (!option.disabled) active = index; }} onclick={() => void choose(option)}>
          {#if loading}<Icon name="loading" />{:else if 'label' in option && typeof option.label === 'function'}{@render option.label()}{:else}{'label' in option ? option.label ?? option.value : option.value}{/if}
        </button>
      {:else}<div class="ant-mentions-dropdown-menu-item ant-mentions-dropdown-menu-item-disabled">{#if typeof notFoundContent === 'function'}{@render notFoundContent()}{:else}{notFoundContent === undefined ? config.locale.emptyText : notFoundContent ?? ''}{/if}</div>{/each}
    </div>
  </div>{/if}
</div>
