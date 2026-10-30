<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import type { Dayjs } from 'dayjs';
  import type { RangePickerProps, RangePickerValue } from './range-picker.types';
  import type { DatePickerMode, DatePickerTimeConfig } from './date-picker.types';
  import { createRangeInteraction, type RangeInteractionSource } from './range-picker-interaction.engine';
  import { rangePair, rangeFlags, sameRange, rangeFrom, orderedRange, validRange } from './range-picker.engine';
  import { pickerFormats, formatPicker, parsePicker, pickerDateDisabled, pickerTimeDisabled, validPickerTime } from './date-picker.engine';
  import { dayjsGenerateConfig as adapter } from './date-picker-dayjs.engine';
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
  import PickerCalendarIcon from './PickerCalendarIcon.svelte';
  import PickerRangeSeparator from './PickerRangeSeparator.svelte';
  let { value, defaultValue, disabled, allowEmpty = false, order = true, id, name, placeholder, showTime = false, format, disabledDate, disabledTime, minDate, maxDate,
    defaultPickerValue, pickerValue, open, defaultOpen = false, needConfirm, showNow, showToday, allowClear = true, inputReadOnly, preserveInvalidOnBlur = false,
    onChange, onCalendarChange, onOk, onClear, onPickerValueChange, onOpenChange, onPanelChange, onfocus, onblur, onkeydown,
    renderExtraFooter, separator, presets, previewValue = 'hover', placement, size, status, variant = 'outlined', locale,
    class: className = '', rootClassName = '', popupClassName = '', style, nativeElement = $bindable(), startInput = $bindable(), endInput = $bindable(), ...attributes }: RangePickerProps = $props();
  const config = useConfig();
  const field = useFormField();
  const form = useForm();
  const compact = useCompact();
  const generatedId = $props.id();
  const initial = untrack(() => rangePair(defaultValue));
  let internalValue = $state.raw<RangePickerValue>(initial);
  let committed = $derived(value === undefined ? internalValue : rangePair(value));
  let blocked = $derived(rangeFlags(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled));
  let empty = $derived(rangeFlags(allowEmpty));
  let confirm = $derived(needConfirm ?? Boolean(showTime));
  let internalOpen = $state(untrack(() => defaultOpen));
  let visible = $derived((open ?? internalOpen) && !blocked.every(Boolean));
  let lang = $derived({ ...datePickerEnUS.lang, ...config.locale.datePicker?.lang, ...locale?.lang });
  let formatConfig = $derived({ format, showTime: typeof showTime === 'object' ? { ...showTime, defaultOpenValue: undefined } : showTime });
  let formats = $derived(pickerFormats(formatConfig, lang));
  let readOnly = $derived(inputReadOnly ?? (attributes.readonly || formats.every(item => typeof item === 'function')));
  let calendar = $state.raw<RangePickerValue>(untrack(() => value === undefined ? [...initial] : rangePair(value)));
  let submit = $state.raw<RangePickerValue>(untrack(() => [...calendar]));
  let texts = $state<[string, string]>(untrack(() => dateTexts(calendar)));
  let revision = $state(0);
  const interaction = createRangeInteraction<Dayjs>({ fieldCount: () => blocked.filter(item => !item).length, needConfirm: () => confirm, allowEmpty: () => empty,
    getCalendarValue: () => calendar, triggerCalendarChange: (index, next) => { const copy: RangePickerValue = [...calendar]; copy[index] = next; changeCalendar(copy); },
    flushSubmit: (index, all) => { const copy: RangePickerValue = [...submit]; copy[index] = calendar[index]; submit = copy; if (all) { commit(copy); requestOpen(false); } },
    resetValue: index => { if (index === undefined) { changeCalendar(committed); submit = [...committed]; } else { const copy: RangePickerValue = [...calendar]; copy[index] = committed[index]; changeCalendar(copy); const next: RangePickerValue = [...submit]; next[index] = committed[index]; submit = next; } }
  });
  let active = $derived.by(() => { void revision; return interaction.activeIndex; });
  let clock = $derived.by((): DatePickerTimeConfig => {
    const raw = typeof showTime === 'object' ? showTime : {};
    return { ...raw, defaultOpenValue: raw.defaultOpenValue?.[active] };
  });
  let timeFormat = $derived(clock.format ?? (typeof formats[0] === 'string' ? formats[0] : 'HH:mm:ss'));
  let focused = $state(false);
  let shown = $state(false);
  let popup = $state<HTMLDivElement>();
  let now = $state.raw(untrack(() => adapter.getNow()));
  let panels = $state.raw<[Dayjs, Dayjs]>(untrack(() => { const base = initialPanel(0); return [base, initialPanel(1)]; }));
  let view = $derived(panelValues()[active]);
  let mode = $state<DatePickerMode>('date');
  let showCurrent = $derived((showNow ?? showToday ?? false) && mode === 'date');
  let hover = $state.raw<Dayjs | null>(null);
  let presetHover = $state.raw<RangePickerValue | null>(null);
  let displayRange = $derived.by((): RangePickerValue => {
    const pair: RangePickerValue = presetHover && previewValue ? [...presetHover] : [...calendar];
    if (hover && previewValue) pair[active] = hover;
    return pair[0] && pair[1] && pair[0].isAfter(pair[1]) ? [pair[1], pair[0]] : pair;
  });
  let displayedTexts = $derived.by(() => { const pair = presetHover && previewValue ? dateTexts(presetHover) : [...texts]; if (hover && previewValue) pair[active] = formatPicker(hover, lang.locale, formats); return pair; });
  let bar = $state({ left: 0, width: 0 });
  let actualPlacement = $derived(placement ?? (config.direction === 'rtl' ? 'bottomRight' : 'bottomLeft'));
  let verticalPlacement = $state<'top' | 'bottom'>('bottom');
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let previousVisible = untrack(() => visible);
  $effect(() => { calendar = [...committed]; submit = [...committed]; texts = dateTexts(committed); });
  $effect(() => { const next = visible; if (previousVisible && !next) { send(interaction.currentIndex ?? active, 'popupClose'); if (!preserveInvalidOnBlur) texts = dateTexts(calendar); } previousVisible = next; });
  $effect(() => { if (blocked.every(Boolean)) { internalOpen = false; interaction.reset(); revision = untrack(() => revision + 1); calendar = [...committed]; texts = dateTexts(committed); } });
  $effect(() => { if (visible && blocked[active]) untrack(() => send(blocked.findIndex(item => !item), 'field-switch')); });
  $effect(() => {
    if (!visible || !popup || !nativeElement) return;
    return connectPopup(popup, nativeElement, { placement: actualPlacement.startsWith('top') ? 'top' : 'bottom', align: actualPlacement.endsWith('Right') ? 'right' : 'left', autoAdjustOverflow: true, maxWidth: '100vw', preserveFocus: true,
      onPlacement: next => { verticalPlacement = next === 'top' ? 'top' : 'bottom'; }, onVisibilityChange: next => { shown = next; },
      onDismiss: reason => { if (reason === 'escape') { send(active, 'esc'); inputs()[active]?.focus(); } requestOpen(false); } });
  });
  $effect(() => {
    const root = nativeElement; const input = inputs()[active];
    if (!root || !input) return;
    function measure() { const rect = input!.getBoundingClientRect(); const parent = root!.getBoundingClientRect(); bar = { left: rect.left - parent.left, width: rect.width }; }
    const observer = new ResizeObserver(measure); observer.observe(root); observer.observe(input); measure();
    return () => observer.disconnect();
  });
  function inputs() { return [startInput, endInput]; }
  function dateTexts(pair: RangePickerValue): [string, string] { return [formatPicker(pair[0], lang.locale, formats), formatPicker(pair[1], lang.locale, formats)]; }
  function initialPanel(index: number): Dayjs { const defaults = Array.isArray(defaultPickerValue) ? defaultPickerValue : [defaultPickerValue, defaultPickerValue]; return defaults[index] ?? (value === undefined ? initial : value)?.[index] ?? (value === undefined ? initial : value)?.[index ^ 1] ?? adapter.getNow(); }
  function panelValues(): [Dayjs, Dayjs] { return pickerValue ? Array.isArray(pickerValue) ? pickerValue : [pickerValue, pickerValue] : panels; }
  function from() { return rangeFrom(calendar, interaction.triggeredFields, active); }
  function timeRestriction(date: Dayjs) { return disabledTime?.(date, active === 1 ? 'end' : 'start', { from: from() }) ?? {}; }
  function invalid(date: Dayjs, index: number, reference?: Dayjs, type: DatePickerMode = 'date') {
    const other = calendar[index ^ 1];
    const same = other && (type === 'decade' ? Math.floor(other.year() / 10) === Math.floor(date.year() / 10) : other.isSame(date, type === 'date' ? 'day' : type));
    if (blocked[index ^ 1] && other && !same && (index === 1 ? other.isAfter(date) : date.isAfter(other))) return true;
    if (pickerDateDisabled(date, { minDate, maxDate, disabledDate: next => Boolean(disabledDate?.(next, { type, from: reference })) }, type)) return true;
    const config = typeof showTime === 'object' ? { ...showTime, defaultOpenValue: undefined } : showTime;
    return pickerTimeDisabled(date, { showTime: config, disabledTime: next => disabledTime?.(next, index === 1 ? 'end' : 'start', { from: reference }) ?? {} });
  }
  function panelDisabled(date: Dayjs, info: { type: DatePickerMode }) {
    const other = calendar[active ^ 1];
    const same = other && (info.type === 'decade' ? Math.floor(other.year() / 10) === Math.floor(date.year() / 10) : other.isSame(date, info.type === 'date' ? 'day' : info.type));
    return Boolean(blocked[active ^ 1] && other && !same && (active === 1 ? other.isAfter(date) : date.isAfter(other)) || disabledDate?.(date, { ...info, from: from() }));
  }
  function changeCalendar(next: RangePickerValue) {
    const changed = !sameRange(calendar, next); const part = calendar[0]?.valueOf() === next[0]?.valueOf() ? 'end' : 'start';
    if (changed) { const nextTexts: [string, string] = [...texts]; for (const index of [0, 1]) if (calendar[index]?.valueOf() !== next[index]?.valueOf()) nextTexts[index] = formatPicker(next[index], lang.locale, formats); calendar = [...next]; texts = nextTexts; }
    if (changed) onCalendarChange?.([...next], dateTexts(next), { range: part });
  }
  function commit(next: RangePickerValue | null) {
    const pair: RangePickerValue = next === null ? [blocked[0] ? submit[0] : null, blocked[1] ? submit[1] : null] : orderedRange(next, order, blocked);
    changeCalendar(pair);
    const passed = next === null || validRange(pair, empty, order, blocked, invalid);
    if (passed) {
      const changed = !sameRange(pair, committed);
      if (value === undefined) internalValue = [...pair];
      if (changed) onChange?.(next === null && pair.every(item => !item) ? null : [...pair], pair.every(item => !item) ? null : dateTexts(pair));
    }
    return passed;
  }
  function requestOpen(next: boolean) {
    if (next && blocked.every(Boolean) || next === visible) return;
    if (next) { now = adapter.getNow(); syncPanel(active, 'reset', false); }
    else { hover = null; presetHover = null; }
    if (open === undefined) internalOpen = next;
    onOpenChange?.(next);
  }
  function syncPanel(index: number, source: 'reset' | 'panel', preserve: boolean, target?: Dayjs) {
    const defaults = Array.isArray(defaultPickerValue) ? defaultPickerValue : [defaultPickerValue, defaultPickerValue];
    let next = target ?? defaults[index] ?? (preserve ? panelValues()[index ^ 1] : calendar[index] ?? calendar[index ^ 1] ?? now);
    if (!showTime && index === 1 && !preserve && calendar[0] && calendar[1] && !calendar[1].isSame(calendar[0], 'month') && !calendar[1].isSame(calendar[0].add(1, 'month'), 'month')) next = calendar[1].add(-1, 'month');
    if (minDate && next.isBefore(minDate)) next = minDate;
    if (maxDate && (showTime ? next : next.add(1, 'month')).isAfter(maxDate)) next = showTime ? maxDate : maxDate.add(-1, 'month');
    const pair: [Dayjs, Dayjs] = [...panelValues()]; pair[index] = next;
    if (!pickerValue) panels = pair;
    onPickerValueChange?.(pair, { range: index === 1 ? 'end' : 'start', source, mode: [mode, mode] });
  }
  function send(index: number, source: RangeInteractionSource, next?: Dayjs | null) {
    const previous = interaction.activeIndex;
    interaction.trigger(index, source, next); revision++;
    if (interaction.activeIndex !== previous) { hover = null; mode = 'date'; syncPanel(interaction.activeIndex, 'reset', true); }
    const target = interaction.currentIndex;
    if (target !== null && interaction.forceFocus) {
      requestOpen(true);
      void tick().then(() => { if (interaction.currentIndex === target && visible && inputs()[target]?.isConnected) inputs()[target]?.focus(); });
    }
  }
  function focusField(index: number) {
    focused = true; send(index, 'field-switch'); requestOpen(true);
    const accepted = interaction.currentIndex;
    if (accepted !== null && accepted !== index) void tick().then(() => { if (visible && inputs()[index]?.ownerDocument.activeElement === inputs()[index]) inputs()[accepted]?.focus(); });
  }
  function blurInput(index: number, event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) { if (!preserveInvalidOnBlur && inputInvalid(index)) { const copy: [string, string] = [...texts]; copy[index] = formatPicker(calendar[index], lang.locale, formats); texts = copy; } onblur?.(event); blurWithin(event); }
  function blurWithin(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && (nativeElement?.contains(event.relatedTarget) || popup?.contains(event.relatedTarget))) return;
    queueMicrotask(() => {
      const current = startInput?.ownerDocument.activeElement;
      if (!startInput?.isConnected || current && (nativeElement?.contains(current) || popup?.contains(current))) return;
      focused = false; field?.onBlur(); requestOpen(false);
    });
  }
  function selectDate(date: Dayjs) {
    if (mode !== 'date') { syncPanel(active, 'panel', false, date); mode = mode === 'decade' ? 'year' : mode === 'year' ? 'month' : 'date'; onPanelChange?.([...calendar], [mode, mode]); return; }
    const base = calendar[active] ?? clock.defaultOpenValue ?? view;
    const next = showTime ? validPickerTime(base.year(date.year()).month(date.month()).date(date.date()), clock, timeRestriction) : date;
    send(active, showTime ? 'panel-intermediate' : 'panel-final', next);
  }
  function selectTime(date: Dayjs) { send(active, 'panel-intermediate', validPickerTime(date, clock, timeRestriction)); }
  function inputChange(index: number, text: string) {
    focusField(index); const copy: [string, string] = [...texts]; copy[index] = text; texts = copy;
    const next = text ? parsePicker(text, lang.locale, formats) : null;
    if (!text || next && !invalid(next, index, from())) { send(index, 'input', next); if (next) syncPanel(index, 'reset', false, next); }
    else send(index, 'input');
  }
  function inputInvalid(index: number) { return !readOnly && Boolean(texts[index] && (!parsePicker(texts[index], lang.locale, formats) || invalid(parsePicker(texts[index], lang.locale, formats)!, index, from()))); }
  async function keyboard(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }, index: number) {
    onkeydown?.(event); if (event.defaultPrevented || event.isComposing || blocked[index]) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); send(index, 'esc'); requestOpen(false); }
    else if (event.key === 'Enter') { event.preventDefault(); if (!visible) { focusField(index); requestOpen(true); } else if (!inputInvalid(index)) send(index, 'keyboard-submit'); }
    else if (event.key === 'Tab') { if (!inputInvalid(index)) send(index, 'keyboard-submit-weak'); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); requestOpen(true); await tick(); (popup?.querySelector<HTMLButtonElement>(`[data-picker-date="${view.format('YYYY-MM-DD')}"]:not(:disabled)`) ?? popup?.querySelector<HTMLButtonElement>('[data-picker-date]:not(:disabled)'))?.focus(); }
  }
  function clear() { interaction.reset(); revision++; commit(null); onClear?.(); requestOpen(false); }
  function presetValue(next: RangePickerValue) { interaction.reset(); revision++; if (commit(next)) requestOpen(false); }
  export function focus(options?: FocusOptions & { index?: 0 | 1; cursor?: 'start' | 'end' | 'all' }) { const input = inputs()[options?.index ?? blocked.findIndex(item => !item)]; input?.focus(options); if (options?.cursor) input?.setSelectionRange(options.cursor === 'end' ? input.value.length : 0, options.cursor === 'start' ? 0 : input.value.length); }
  export function blur() { inputs().forEach(input => input?.blur()); }
  onMount(() => { if (attributes.autofocus) focus(); });
</script>

<style>
  .ant-picker-dropdown { position:fixed;margin:0;padding:0;border:0;background:transparent;overflow:visible; }
  .ant-picker-clear { padding:0;border:0;background:transparent;cursor:pointer; }
  .ant-picker-clear:focus-visible { opacity:1;outline:2px solid var(--ant-color-primary); }
  .ant-picker-now-btn { padding:0;border:0;background:transparent;color:var(--ant-color-link);font:inherit;cursor:pointer; }
  .ant-picker-now-btn:disabled { color:var(--ant-color-text-disabled);cursor:not-allowed; }
  .ant-picker-presets button { border:0;padding:0;background:transparent;color:inherit;font:inherit;cursor:pointer; }
</style>

<div bind:this={nativeElement} role="group" {style} dir={config.direction} onfocusout={blurWithin}
  class={['ant-picker ant-picker-range ant-picker-css-var', `ant-picker-${variant}`, blocked.every(Boolean) && 'ant-picker-disabled', visible && 'ant-picker-open', focused && 'ant-picker-focused', texts.some((_, index) => inputInvalid(index)) && 'ant-picker-invalid', resolvedSize === 'large' && 'ant-picker-large', resolvedSize === 'small' && 'ant-picker-small', resolvedStatus && `ant-picker-status-${resolvedStatus}`, config.direction === 'rtl' && 'ant-picker-rtl', compactClasses('ant-picker', config.direction, compact), className, rootClassName]}>
  <div class={['ant-picker-input ant-picker-input-start', focused && active === 0 && 'ant-picker-input-active']}>
    <input {...attributes} bind:this={startInput} id={typeof id === 'string' ? id : id?.start ?? field?.id} name={name ?? field?.name} placeholder={placeholder?.[0] ?? lang.rangePlaceholder[0]} type="text" role="combobox" aria-haspopup="dialog" aria-expanded={visible && active === 0} aria-controls={`ant-range-picker-${generatedId}`} aria-invalid={inputInvalid(0) || resolvedStatus === 'error' || attributes['aria-invalid'] || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined} required={attributes.required ?? field?.required} disabled={blocked[0]} readonly={readOnly} autocomplete="off" value={displayedTexts[0]}
      oninput={event => inputChange(0, event.currentTarget.value)} onclick={() => { focusField(0); requestOpen(true); }} onfocus={event => { focusField(0); onfocus?.(event); }} onblur={event => blurInput(0, event)} onkeydown={event => keyboard(event, 0)} />
  </div>
  <div class="ant-picker-range-separator">{#if typeof separator === 'function'}{@render separator()}{:else}<span class="ant-picker-separator" aria-hidden="true">{#if separator !== undefined}{separator}{:else}<PickerRangeSeparator />{/if}</span>{/if}</div>
  <div class={['ant-picker-input ant-picker-input-end', focused && active === 1 && 'ant-picker-input-active']}>
    <input {...attributes} bind:this={endInput} id={typeof id === 'object' ? id.end : undefined} name={name ?? field?.name} placeholder={placeholder?.[1] ?? lang.rangePlaceholder[1]} type="text" role="combobox" aria-haspopup="dialog" aria-expanded={visible && active === 1} aria-controls={`ant-range-picker-${generatedId}`} aria-invalid={inputInvalid(1) || resolvedStatus === 'error' || attributes['aria-invalid'] || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined} required={attributes.required ?? field?.required} disabled={blocked[1]} readonly={readOnly} autocomplete="off" value={displayedTexts[1]}
      oninput={event => inputChange(1, event.currentTarget.value)} onclick={() => { focusField(1); requestOpen(true); }} onfocus={event => { focusField(1); onfocus?.(event); }} onblur={event => blurInput(1, event)} onkeydown={event => keyboard(event, 1)} />
  </div>
  <div class="ant-picker-active-bar" style={`position:absolute;left:${bar.left}px;width:${bar.width}px`}></div>
  <span class="ant-picker-suffix" aria-hidden="true"><PickerCalendarIcon /></span>
  {#if allowClear && committed.some((date, index) => date && !blocked[index])}<button type="button" class="ant-picker-clear" aria-label={lang.clear} onpointerdown={event => event.preventDefault()} onclick={clear}><Icon name="close-circle-filled" /></button>{/if}
</div>
<NoCompactStyle>
  {#if visible}
    <div bind:this={popup} id={`ant-range-picker-${generatedId}`} popover="manual" role="dialog" tabindex="-1" aria-label={attributes['aria-label'] ?? lang.placeholder} hidden={!shown} onfocusout={blurWithin}
      class={['ant-picker-dropdown ant-picker-css-var', config.direction === 'rtl' && 'ant-picker-dropdown-rtl', `ant-picker-dropdown-placement-${verticalPlacement}${actualPlacement.endsWith('Right') ? 'Right' : 'Left'}`, popupClassName]}
      onkeydown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); send(active, 'esc'); requestOpen(false); inputs()[active]?.focus(); } }}>
      <div class="ant-picker-range-arrow" style={`left:${bar.left + bar.width / 2}px`}></div>
      <div class="ant-picker-panel-container"><div class="ant-picker-panel-layout">
        {#if presets?.length}<div class="ant-picker-presets"><ul>{#each presets as preset, index (index)}<li><button type="button" onpointerenter={() => { if (previewValue) presetHover = rangePair(typeof preset.value === 'function' ? preset.value() : preset.value); }} onpointerleave={() => { presetHover = null; }} onclick={() => presetValue(rangePair(typeof preset.value === 'function' ? preset.value() : preset.value))}>{#if typeof preset.label === 'function'}{@render preset.label()}{:else}{preset.label}{/if}</button></li>{/each}</ul></div>{/if}
        <div><div class:ant-picker-panels={!showTime && mode === 'date'}>
          <div class="ant-picker-panel" tabindex="-1"><div class={showTime && mode === 'date' ? 'ant-picker-datetime-panel' : undefined}>
            <DatePickerCalendar panel={view} selected={calendar[active]} range={displayRange} onHover={date => { hover = date; }} {mode} locale={lang} restrictions={{ minDate, maxDate, disabledDate: panelDisabled }} {now} direction={config.direction} showNext={Boolean(showTime) || mode !== 'date'} onSelect={selectDate} onNavigate={next => syncPanel(active, 'panel', false, next)} onModeChange={next => { mode = next; onPanelChange?.([...calendar], [next, next]); }} />
            {#if showTime && mode === 'date'}<DatePickerTimePanel value={calendar[active] ?? clock.defaultOpenValue ?? view} config={clock} format={timeFormat} disabledTime={timeRestriction} onSelect={selectTime} />{/if}
          </div></div>
          {#if !showTime && mode === 'date'}<div class="ant-picker-panel" tabindex="-1"><DatePickerCalendar panel={view.add(1, 'month')} selected={calendar[active]} range={displayRange} onHover={date => { hover = date; }} {mode} locale={lang} restrictions={{ minDate, maxDate, disabledDate: panelDisabled }} {now} direction={config.direction} showPrevious={false} onSelect={selectDate} onNavigate={next => syncPanel(active, 'panel', false, next.add(-1, 'month'))} onModeChange={next => { syncPanel(active, 'panel', false, view.add(1, 'month')); mode = next; onPanelChange?.([...calendar], [next, next]); }} /></div>{/if}
        </div>
        {#if renderExtraFooter}<div class="ant-picker-footer-extra">{@render renderExtraFooter()}</div>{/if}
        {#if (confirm || showCurrent) && mode === 'date'}<div class="ant-picker-footer"><ul class="ant-picker-ranges">{#if showCurrent}<li class="ant-picker-now"><button type="button" class="ant-picker-now-btn" disabled={pickerDateDisabled(now, { minDate, maxDate, disabledDate: panelDisabled })} onclick={() => send(active, 'confirm', validPickerTime(adapter.getNow(), clock))}>{showTime ? lang.now : lang.today}</button></li>{/if}{#if confirm}<li class="ant-picker-ok"><button type="button" class="ant-btn ant-btn-primary ant-btn-color-primary ant-btn-variant-solid ant-btn-sm" disabled={!calendar[active] && !empty[active] || Boolean(calendar[active] && invalid(calendar[active]!, active, from()))} onclick={() => { send(active, 'confirm'); onOk?.([...calendar]); }}><span>{lang.ok}</span></button></li>{/if}</ul></div>{/if}
        </div>
      </div></div>
    </div>
  {/if}
</NoCompactStyle>
