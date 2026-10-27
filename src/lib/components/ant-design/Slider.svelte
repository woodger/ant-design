<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { getSliderDirection, getSliderKeyValue, getSliderRatio, normalizeSliderValue, resolveSliderOptions, type SliderDirection, type SliderOptions } from './slider.engine';
  import type { SliderTooltipConfig } from './tooltip.types';
  import TooltipPopup from './TooltipPopup.svelte';

  export interface SliderProps extends Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'type' | 'min' | 'max' | 'step' | 'size' | 'class' | 'children' | 'readonly'> {
    value?: number | undefined;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    orientation?: 'horizontal' | 'vertical';
    reverse?: boolean;
    keyboard?: boolean;
    tooltip?: false | SliderTooltipConfig;
    onValueChange?: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    class?: string;
  }

  interface Interaction {
    kind: 'pointer' | 'key' | 'native';
    pointerId?: number;
    keys: Set<string>;
    expectedValue: number | undefined;
    options: SliderOptions;
    direction: SliderDirection;
    resetKey?: object;
    changed: boolean;
    canceled: boolean;
  }

  let {
    value = $bindable<number | undefined>(),
    defaultValue = 0,
    min,
    max,
    step,
    orientation = 'horizontal',
    reverse = false,
    keyboard = true,
    tooltip,
    disabled,
    id,
    name,
    style,
    onValueChange,
    onChangeComplete,
    oninput,
    onchange,
    onkeydown,
    onkeyup,
    onpointerdown,
    onpointerenter,
    onpointerleave,
    onlostpointercapture,
    onfocus,
    onblur,
    class: className = '',
    ...attributes
  }: SliderProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => defaultValue);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let control = $state<HTMLInputElement>();
  let handle = $state<HTMLDivElement>();
  let dragging = $state(false);
  let tooltipHovered = $state(false);
  let tooltipFocused = $state(false);
  let popupHovered = $state(false);
  let interaction: Interaction | null = null;
  let options = $derived(resolveSliderOptions({ min, max, step }));
  let resolvedValue = $derived(normalizeSliderValue(value === undefined ? initialDefault : value, options));
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let direction = $derived(getSliderDirection(orientation, reverse, config.direction === 'rtl'));
  let percentage = $derived(getSliderRatio(resolvedValue, options) * 100);
  let position = $derived(direction === 'rtl' || direction === 'btt' ? 100 - percentage : percentage);
  let trackStart = $derived(direction === 'rtl' || direction === 'btt' ? 100 - percentage : 0);
  let configuredTooltipOpen = $derived(tooltip === false ? false : tooltip?.open);
  let tooltipState = $derived({ ownerOpen: configuredTooltipOpen, disabled: resolvedDisabled, dismissed: false });
  let tooltipTitle = $derived(tooltip === false || configuredTooltipOpen === false ? '' : tooltip?.formatter === null ? '' : tooltip?.formatter ? tooltip.formatter(resolvedValue) ?? '' : String(resolvedValue));
  let tooltipOpen = $derived(!resolvedDisabled && !tooltipState.dismissed && configuredTooltipOpen !== false && (configuredTooltipOpen === true || tooltipHovered || tooltipFocused || popupHovered || dragging));
  let tooltipPlacement = $derived(tooltip !== false && tooltip?.placement || (orientation === 'vertical' ? config.direction === 'rtl' ? 'left' : 'right' : 'top'));

  function runtime() {
    return { value, options, direction, disabled: resolvedDisabled, keyboard, resetKey: form?.resetKey };
  }

  function isCurrent(active: Interaction, current = runtime()): boolean {
    return !active.canceled && !current.disabled && !!control?.isConnected
      && Object.is(active.expectedValue, current.value)
      && active.options.min === current.options.min && active.options.max === current.options.max && active.options.step === current.options.step
      && active.direction === current.direction && active.resetKey === current.resetKey
      && (active.kind !== 'key' || current.keyboard);
  }

  $effect(() => {
    const input = control;
    const current = runtime();
    const next = resolvedValue;

    if (!input) return;

    // Нативный reset хранит defaults отдельно от текущего value; смена владельца отменяет захват.
    input.defaultValue = String(normalizeSliderValue(initialDefault, current.options));
    input.value = String(next);

    if (interaction && !interaction.canceled && !isCurrent(interaction, current)) cancelInteraction(true);
  });

  onDestroy(() => {
    cancelInteraction();
    for (const reset of resets) clearTimeout(reset);
  });

  function begin(kind: Interaction['kind'], pointerId?: number): Interaction {
    cancelInteraction();
    interaction = { kind, pointerId, keys: new Set(), expectedValue: value, options, direction, resetKey: form?.resetKey, changed: false, canceled: false };
    dragging = kind === 'pointer';
    tooltipState = { ...tooltipState, dismissed: false };

    return interaction;
  }

  function cancelInteraction(keepPointer = false) {
    const active = interaction;

    if (!active) return;

    active.canceled = true;
    if (!keepPointer || active.kind !== 'pointer') interaction = null;
    dragging = false;

    if (active.pointerId !== undefined && control?.hasPointerCapture(active.pointerId)) control.releasePointerCapture(active.pointerId);
  }

  function finish(canceled = false) {
    const active = interaction;
    const notify = !canceled && active?.changed && isCurrent(active);
    const next = resolvedValue;

    cancelInteraction();

    if (notify) onChangeComplete?.(next);
  }

  function publish(next: number) {
    if (next === resolvedValue) return;

    if (interaction) {
      interaction.changed = true;
      interaction.expectedValue = next;
    }
    value = next;
    onValueChange?.(next);
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    if (resolvedDisabled || interaction?.canceled) {
      event.currentTarget.value = String(resolvedValue);
      return;
    }

    if (!interaction) begin('native');
    publish(normalizeSliderValue(event.currentTarget.valueAsNumber, options));
    event.currentTarget.value = String(resolvedValue);
    oninput?.(event);
  }

  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    if (resolvedDisabled || interaction?.canceled) return;

    if (interaction?.kind === 'native') finish();
    onchange?.(event);
  }

  function handlePointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onpointerdown?.(event);

    if (event.defaultPrevented || resolvedDisabled) return;
    if (event.button !== 0 || !event.isPrimary) {
      event.preventDefault();
      return;
    }

    begin('pointer', event.pointerId);
  }

  function handlePointerup(event: PointerEvent) {
    if (interaction?.kind === 'pointer' && interaction.pointerId === event.pointerId) finish(event.defaultPrevented);
  }

  function handlePointercancel(event: PointerEvent) {
    if (interaction?.kind === 'pointer' && interaction.pointerId === event.pointerId) cancelInteraction();
  }

  function handleLostCapture(event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onlostpointercapture?.(event);

    if (interaction?.kind === 'pointer' && interaction.pointerId === event.pointerId) cancelInteraction(true);
  }

  function handlePointerenter(event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    if (event.pointerType !== 'touch') {
      tooltipHovered = true;
      tooltipState = { ...tooltipState, dismissed: false };
    }
    onpointerenter?.(event);
  }

  function handlePointerleave(event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    tooltipHovered = false;
    onpointerleave?.(event);
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeydown?.(event);

    if (event.defaultPrevented || event.isComposing || resolvedDisabled) return;

    const next = getSliderKeyValue(event.key, resolvedValue, options, direction);

    if (next === undefined) return;

    event.preventDefault();

    if (!keyboard || interaction?.kind === 'pointer') return;

    const active = interaction?.kind === 'key' ? interaction : begin('key');
    active.keys.add(event.key);
    publish(next);
  }

  function handleKeyup(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeyup?.(event);

    if (interaction?.kind !== 'key' || !interaction.keys.delete(event.key)) return;
    if (!interaction.keys.size) finish(event.defaultPrevented);
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    tooltipFocused = true;
    tooltipState = { ...tooltipState, dismissed: false };
    onfocus?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    tooltipFocused = false;
    cancelInteraction(true);
    field?.onBlur();
    onblur?.(event);
  }

  function handleReset(event: Event) {
    const input = control;

    if (!input || event.target !== input.form) return;

    cancelInteraction(true);

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !input.isConnected || input !== control) return;

      value = normalizeSliderValue(input.valueAsNumber, options);
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-slider { min-width: 0; }
  .ant-slider-rail, .ant-slider-track, .ant-slider-handle { pointer-events: none; }
  .ant-slider-horizontal .ant-slider-handle { transform: translateX(-50%); }
  .ant-slider-vertical .ant-slider-handle { transform: translateY(-50%); }
  .slider-input { position: absolute; margin: 0; padding: 0; border: 0; opacity: 0; cursor: inherit; appearance: none; touch-action: none; }
  .ant-slider-horizontal .slider-input { left: calc(var(--ant-slider-handle-size) / -2); top: calc((var(--ant-slider-rail-size) * 3 - 32px) / 2); width: calc(100% + var(--ant-slider-handle-size)); height: 32px; }
  .ant-slider-vertical .slider-input { top: calc(var(--ant-slider-handle-size) / -2); left: calc((var(--ant-slider-rail-size) * 3 - 32px) / 2); height: calc(100% + var(--ant-slider-handle-size)); width: 32px; writing-mode: vertical-lr; }
  .slider-input::-webkit-slider-thumb { appearance: none; width: var(--ant-slider-handle-size); height: var(--ant-slider-handle-size); }
  .slider-input::-moz-range-thumb { width: var(--ant-slider-handle-size); height: var(--ant-slider-handle-size); border: 0; }
  .ant-slider:has(.slider-input:focus-visible) .ant-slider-handle::after { outline: 6px solid var(--ant-slider-handle-active-outline-color); box-shadow: 0 0 0 var(--ant-slider-handle-line-width-hover) var(--ant-slider-handle-active-color); }
  @media (prefers-reduced-motion: reduce) {
    .ant-slider-rail, .ant-slider-track, .ant-slider-handle::before, .ant-slider-handle::after { transition: none; }
  }
</style>

<svelte:document onreset={handleReset} />
<svelte:window onpointerup={handlePointerup} onpointercancel={handlePointercancel} />

<div class={['ant-slider', `ant-slider-${orientation}`, resolvedDisabled && 'ant-slider-disabled', dragging && 'ant-slider-lock', config.direction === 'rtl' && 'ant-slider-rtl', className]} {style}>
  <div class="ant-slider-rail" aria-hidden="true"></div>
  <div class="ant-slider-track" aria-hidden="true" style={orientation === 'horizontal' ? `left:${trackStart}%;width:${percentage}%` : `top:${trackStart}%;height:${percentage}%`}></div>
  <div bind:this={handle} class={['ant-slider-handle', resolvedDisabled && 'ant-slider-handle-disabled']} aria-hidden="true" style={orientation === 'horizontal' ? `left:${position}%` : `top:${position}%`}></div>
  <input
    {...attributes}
    bind:this={control}
    type="range"
    class="slider-input"
    id={id ?? field?.id}
    name={name ?? field?.name}
    min={options.min}
    max={options.max}
    step={options.step}
    value={resolvedValue}
    disabled={resolvedDisabled}
    style:direction={direction === 'rtl' || direction === 'btt' ? 'rtl' : 'ltr'}
    aria-label={attributes['aria-label'] ?? (attributes['aria-labelledby'] ? undefined : field?.label)}
    aria-valuemin={options.min}
    aria-valuemax={options.max}
    aria-valuenow={resolvedValue}
    aria-orientation={orientation}
    aria-invalid={field?.status === 'error' || attributes['aria-invalid'] || undefined}
    aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
    oninput={handleInput}
    onchange={handleChange}
    onpointerdown={handlePointerdown}
    onpointerenter={handlePointerenter}
    onpointerleave={handlePointerleave}
    onlostpointercapture={handleLostCapture}
    onkeydown={handleKeydown}
    onkeyup={handleKeyup}
    onfocus={handleFocus}
    onblur={handleBlur}
  />
  <TooltipPopup title={resolvedDisabled ? '' : tooltipTitle} open={tooltipOpen} anchor={handle} describe={control} trigger={control} placement={tooltipPlacement} arrow={tooltip === false ? false : tooltip?.arrow ?? true} onDismiss={() => { tooltipState = { ...tooltipState, dismissed: true }; }} onHoverChange={(next) => { popupHovered = next; }} />
</div>
