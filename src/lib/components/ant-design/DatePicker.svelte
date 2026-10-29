<script lang="ts">
  import { tick, untrack } from 'svelte';
  import type { Dayjs } from 'dayjs';
  import type { DatePickerProps, DatePickerMode } from './date-picker.types';
  import { dayjsGenerateConfig as adapter } from './date-picker-dayjs.engine';
  import { pickerFormats, formatPicker, parsePicker, pickerDateDisabled, pickerTimeDisabled, validPickerTime } from './date-picker.engine';
  import { datePickerEnUS } from './date-picker.locale';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { connectPopup } from './popup.dom';
  import NoCompactStyle from './NoCompactStyle.svelte';
  import DatePickerCalendar from './DatePickerCalendar.svelte';
  import DatePickerTimePanel from './DatePickerTimePanel.svelte';
  import Icon from './Icon.svelte';
  let { value, defaultValue, showTime = false, format, pickerValue, defaultPickerValue, open, defaultOpen = false, disabledDate, disabledTime, minDate, maxDate,
    needConfirm, allowClear = true, inputReadOnly, preserveInvalidOnBlur = false, showNow = true, showToday = true, size, status, variant = 'outlined', locale,
    onChange, onCalendarChange, onOk, onClear, onPickerValueChange, onOpenChange, onPanelChange, renderExtraFooter, placement = 'bottomLeft', disabled, id, name,
    onkeydown, onblur, onfocus, class: className = '', rootClassName = '', popupClassName = '', style, nativeElement = $bindable(), ...attributes }: DatePickerProps = $props();
  const config = useConfig();
  const field = useFormField();
  const form = useForm();
  const compact = useCompact();
  const generatedId = $props.id();
  const initialValue = untrack(() => defaultValue ?? null);
  let internalValue = $state.raw<Dayjs | null>(initialValue);
  let mergedValue = $derived(value === undefined ? internalValue : value);
  let internalOpen = $state(untrack(() => defaultOpen));
  let blocked = $derived(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let visible = $derived((open ?? internalOpen) && !blocked);
  let actualLocale = $derived({ ...datePickerEnUS.lang, ...config.locale.datePicker?.lang, ...locale?.lang });
  let formats = $derived(pickerFormats({ format, showTime }, actualLocale));
  let readOnly = $derived(inputReadOnly ?? (attributes.readonly || formats.every(item => typeof item === 'function')));
  let confirm = $derived(needConfirm ?? Boolean(showTime));
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let now = $state.raw(untrack(() => adapter.getNow()));
  let draft = $state.raw<Dayjs | null>(untrack(() => value === undefined ? initialValue : value));
  let internalPanel = $state.raw(untrack(() => pickerValue ?? defaultPickerValue ?? (value === undefined ? initialValue : value) ?? now));
  let panel = $derived(pickerValue ?? internalPanel);
  let mode = $state<DatePickerMode>('date');
  let text = $state(untrack(() => formatPicker(value === undefined ? initialValue : value, actualLocale.locale, formats)));
  let dirty = $state(false);
  let draftSource = $state<'input' | 'panel'>('input');
  let focused = $state(false);
  let input = $state<HTMLInputElement>();
  let popup = $state<HTMLDivElement>();
  let shown = $state(false);
  let popupPlacement = $state<'top' | 'bottom'>('bottom');
  let invalid = $derived(text !== '' && !valid(parsePicker(text, actualLocale.locale, formats)) && !readOnly);
  let clock = $derived(typeof showTime === 'object' ? showTime : {});
  let timeFormat = $derived(clock.format ?? (typeof formats[0] === 'string' ? formats[0] : 'HH:mm:ss'));
  let restrictions = $derived({ minDate, maxDate, disabledDate });

  $effect(() => { text = formatPicker(mergedValue, actualLocale.locale, formats); draft = mergedValue; dirty = false; });
  $effect(() => {
    if (!visible || !popup || !nativeElement) return;
    return connectPopup(popup, nativeElement, { placement: placement.startsWith('top') ? 'top' : 'bottom', align: placement.endsWith('Right') ? 'right' : 'left', autoAdjustOverflow: true, maxWidth: '100vw', preserveFocus: true,
      onVisibilityChange: next => { shown = next; }, onPlacement: next => { popupPlacement = next === 'top' ? 'top' : 'bottom'; }, onDismiss: reason => { finish(false); if (reason === 'escape') input?.focus(); } });
  });
  $effect(() => { if (blocked) { internalOpen = false; resetText(); } });
  function valid(next: Dayjs | null) { return Boolean(next?.isValid() && !pickerDateDisabled(next, { minDate, maxDate, disabledDate }) && !pickerTimeDisabled(next, { showTime, disabledTime })); }
  function requestOpen(next: boolean) {
    if (blocked || visible === next) return;
    if (next) { now = adapter.getNow(); draft = mergedValue; internalPanel = defaultPickerValue ?? mergedValue ?? now; mode = 'date'; }
    if (open === undefined) internalOpen = next;
    onOpenChange?.(next);
  }
  function resetText() { text = formatPicker(mergedValue, actualLocale.locale, formats); dirty = false; draft = mergedValue; }
  function setDraft(next: Dayjs | null, source: 'date' | 'time') { const changed = next?.valueOf() !== draft?.valueOf(); draft = next; if (changed) onCalendarChange?.(next, formatPicker(next, actualLocale.locale, formats), { source }); }
  function commit(next: Dayjs | null) {
    if (blocked || next && !valid(next)) return false;
    const changed = next?.valueOf() !== mergedValue?.valueOf();
    setDraft(next, 'date');
    if (value === undefined) internalValue = next;
    dirty = false;
    if (changed) onChange?.(next, formatPicker(next, actualLocale.locale, formats));
    void tick().then(resetText);
    return true;
  }
  function finish(confirmed: boolean) {
    if (confirmed) {
      if (!valid(draft) || !commit(draft)) return;
      if (draft) onOk?.(draft);
    } else if (!confirm && dirty) {
      if (!text) commit(null);
      else { const parsed = draftSource === 'panel' ? draft : parsePicker(text, actualLocale.locale, formats); if (valid(parsed)) commit(parsed); }
    }
    if (!preserveInvalidOnBlur || !invalid) resetText();
    requestOpen(false);
  }
  function navigate(next: Dayjs) {
    const target = minDate && next.endOf('month').isBefore(minDate) ? minDate : maxDate && next.startOf('month').isAfter(maxDate) ? maxDate : next;
    if (pickerValue === undefined) internalPanel = target;
    onPickerValueChange?.(target); onPanelChange?.(target, mode);
  }
  function changeMode(next: DatePickerMode) { mode = next; onPanelChange?.(panel, mode); }
  function selectDate(next: Dayjs) {
    if (mode !== 'date') { internalPanel = next; onPickerValueChange?.(next); changeMode(mode === 'decade' ? 'year' : mode === 'year' ? 'month' : 'date'); return; }
    const base = draft ?? clock.defaultOpenValue ?? panel;
    const candidate = showTime ? validPickerTime(base.year(next.year()).month(next.month()).date(next.date()), clock, disabledTime) : next;
    if (pickerDateDisabled(candidate, restrictions)) return;
    draftSource = 'panel'; setDraft(candidate, 'date'); internalPanel = candidate; text = formatPicker(candidate, actualLocale.locale, formats); dirty = true;
    if (!confirm && !showTime && commit(candidate)) { requestOpen(false); input?.focus(); }
  }
  function selectTime(value: Dayjs) { const next = validPickerTime(value, clock, disabledTime); draftSource = 'panel'; setDraft(next, 'time'); text = formatPicker(next, actualLocale.locale, formats); dirty = true; }
  async function keyboard(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeydown?.(event);
    if (event.defaultPrevented || event.isComposing || blocked) return;
    if (event.key === 'Escape' && visible) { event.preventDefault(); event.stopPropagation(); resetText(); requestOpen(false); }
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (!visible) requestOpen(true);
      else { const next = text ? readOnly || draftSource === 'panel' ? draft : parsePicker(text, actualLocale.locale, formats) : null; if (!text || valid(next)) { commit(next); requestOpen(false); } }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); if (!visible) requestOpen(true); await tick();
      (popup?.querySelector<HTMLButtonElement>(`[data-picker-date="${panel.format('YYYY-MM-DD')}"]:not(:disabled)`) ?? popup?.querySelector<HTMLButtonElement>('[data-picker-date]:not(:disabled)'))?.focus();
    }
  }
  function blurWithin(event?: FocusEvent) {
    if (event?.relatedTarget instanceof Node && (nativeElement?.contains(event.relatedTarget) || popup?.contains(event.relatedTarget))) return;
    queueMicrotask(() => {
      const active = input?.ownerDocument.activeElement;
      if (!input?.isConnected || active && (nativeElement?.contains(active) || popup?.contains(active))) return;
      focused = false; field?.onBlur(); if (visible || dirty) finish(false);
    });
  }
  export function focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all' }) { input?.focus(options); if (options?.cursor) { const end = input?.value.length ?? 0; input?.setSelectionRange(options.cursor === 'end' ? end : 0, options.cursor === 'start' ? 0 : end); } }
  export function blur() { input?.blur(); }
</script>
<style>
  .ant-picker-dropdown { position:fixed;margin:0;padding:0;border:0;background:transparent;overflow:visible; }
  .ant-picker-clear { padding:0;border:0;background:transparent;cursor:pointer; }
  .ant-picker-clear:focus-visible { opacity:1;outline:2px solid var(--ant-color-primary); }
  .ant-picker-now-btn, .ant-picker-today-btn { padding:0;border:0;background:transparent;color:var(--ant-color-link);font:inherit;cursor:pointer; }
  .ant-picker-now-btn:disabled, .ant-picker-today-btn:disabled { color:var(--ant-color-text-disabled);cursor:not-allowed; }
</style>
<div bind:this={nativeElement} role="group" {style} dir={config.direction} onfocusout={blurWithin}
  class={['ant-picker ant-picker-css-var', `ant-picker-${variant}`, blocked && 'ant-picker-disabled', visible && 'ant-picker-open', focused && 'ant-picker-focused', resolvedSize === 'large' && 'ant-picker-large', resolvedSize === 'small' && 'ant-picker-small', resolvedStatus && `ant-picker-status-${resolvedStatus}`, config.direction === 'rtl' && 'ant-picker-rtl', compactClasses('ant-picker', config.direction, compact), className, rootClassName]}>
  <div class="ant-picker-input">
    <input {...attributes} bind:this={input} id={id ?? field?.id} name={name ?? field?.name} placeholder={attributes.placeholder ?? actualLocale.placeholder} type="text" role="combobox" aria-haspopup="dialog" aria-expanded={visible} aria-controls={`ant-picker-${generatedId}`} aria-invalid={invalid || resolvedStatus === 'error' || attributes['aria-invalid'] || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
      disabled={blocked} readonly={readOnly} required={attributes.required ?? field?.required} autocomplete="off" value={text}
      oninput={event => { requestOpen(true); text = event.currentTarget.value; dirty = true; draftSource = 'input'; const parsed = parsePicker(text, actualLocale.locale, formats); if (valid(parsed)) { setDraft(parsed, 'date'); internalPanel = parsed!; } }}
      onclick={() => requestOpen(true)} onkeydown={keyboard} onfocus={event => { focused = true; onfocus?.(event); }} onblur={event => { onblur?.(event); blurWithin(event); }} />
    <span class="ant-picker-suffix" aria-hidden="true"><svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" focusable="false"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z" /></svg></span>
  </div>
  {#if allowClear && mergedValue && !blocked}<button type="button" class="ant-picker-clear" aria-label={actualLocale.clear} onpointerdown={event => event.preventDefault()} onclick={() => { commit(null); onClear?.(); requestOpen(false); input?.focus(); }}><Icon name="close-circle-filled" /></button>{/if}
</div>
<NoCompactStyle>
  {#if visible}
    <div bind:this={popup} id={`ant-picker-${generatedId}`} popover="manual" role="dialog" aria-label={attributes['aria-label'] ?? actualLocale.placeholder} hidden={!shown} onfocusout={blurWithin} class={['ant-picker-dropdown ant-picker-css-var', config.direction === 'rtl' && 'ant-picker-dropdown-rtl', `ant-picker-dropdown-placement-${popupPlacement === 'top' ? 'top' : 'bottom'}Left`, popupClassName]}>
      <div class="ant-picker-panel-container"><div class="ant-picker-panel-layout"><div><div class="ant-picker-panel" tabindex="-1">
        <div class={showTime && mode === 'date' ? 'ant-picker-datetime-panel' : undefined}>
          <DatePickerCalendar {panel} selected={draft} direction={config.direction} {mode} locale={actualLocale} {restrictions} {now} onSelect={selectDate} onNavigate={navigate} onModeChange={changeMode} />
          {#if showTime && mode === 'date'}<DatePickerTimePanel value={draft ?? clock.defaultOpenValue ?? panel} config={clock} format={timeFormat} {disabledTime} onSelect={selectTime} />{/if}
        </div>
        {#if renderExtraFooter}<div class="ant-picker-footer-extra">{@render renderExtraFooter()}</div>{/if}
        {#if mode === 'date'}<div class="ant-picker-footer">
          {#if confirm || showTime}<ul class="ant-picker-ranges">
            {#if showNow}<li class="ant-picker-now"><button type="button" class="ant-picker-now-btn" disabled={pickerDateDisabled(now, restrictions)} onclick={() => { const next = validPickerTime(adapter.getNow(), clock, disabledTime); if (commit(next)) { requestOpen(false); input?.focus(); } }}>{actualLocale.now}</button></li>{/if}
            {#if confirm}<li class="ant-picker-ok"><button type="button" class="ant-btn ant-btn-primary ant-btn-color-primary ant-btn-variant-solid ant-btn-sm" disabled={!valid(draft)} onclick={() => { finish(true); input?.focus(); }}><span>{actualLocale.ok}</span></button></li>{/if}
          </ul>{:else if showToday}<button type="button" class="ant-picker-today-btn" disabled={pickerDateDisabled(now, restrictions)} onclick={() => { const next = validPickerTime(adapter.getNow()); if (commit(next)) requestOpen(false); }}>{actualLocale.today}</button>{/if}
        </div>{/if}
      </div></div></div></div>
    </div>
  {/if}
</NoCompactStyle>
