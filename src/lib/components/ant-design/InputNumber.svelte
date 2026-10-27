<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { commitInputNumber, formatInputNumber, isInputNumberInRange, normalizeInputNumber, parseInputNumber, resolveInputNumberOptions, stepInputNumber } from './input-number.engine';
  import { ruRU, type ComponentSize } from './types';
  import Icon from './Icon.svelte';

  export interface InputNumberProps extends Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'size' | 'class' | 'type' | 'children'> {
    value?: number | null | undefined;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
    keyboard?: boolean;
    size?: ComponentSize;
    status?: 'error' | 'warning';
    onValueChange?: (value: number | null) => void;
    class?: string;
  }

  let {
    value = $bindable<number | null | undefined>(),
    defaultValue,
    min,
    max,
    step,
    precision,
    controls = true,
    keyboard = true,
    size,
    status,
    disabled,
    readonly,
    id,
    name,
    style,
    onValueChange,
    oninput,
    onkeydown,
    onfocus,
    onblur,
    oncompositionstart,
    oncompositionend,
    class: className = '',
    ...attributes
  }: InputNumberProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const generatedId = $props.id();
  const initialDefault = untrack(() => normalizeInputNumber(defaultValue));
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let control = $state<HTMLInputElement>();
  let focused = $state(false);
  let composing = false;
  let resolvedValue = $derived(normalizeInputNumber(value === undefined ? initialDefault : value));
  let options = $derived(resolveInputNumberOptions({ min, max, step, precision }));
  let resolvedPrecision = $derived(options.precision);
  let resolvedSize = $derived(size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let controlId = $derived(id ?? field?.id ?? `ant-input-number-${generatedId}`);
  let fieldName = $derived(name ?? field?.name);
  let upValue = $derived(stepInputNumber(resolvedValue, 1, options));
  let downValue = $derived(stepInputNumber(resolvedValue, -1, options));
  let editor: { text: string; dirty: boolean; resetKey?: object } = $derived.by(() => {
    // Исходный value и контейнер Form снимают черновик даже при прежнем нормализованном числе.
    const current = normalizeInputNumber(value === undefined ? initialDefault : value);

    return { text: formatInputNumber(current, resolvedPrecision), dirty: false, resetKey: form?.resetKey };
  });
  let parsed = $derived(parseInputNumber(editor.text));
  let outOfRange = $derived(resolvedValue !== null && !isInputNumberInRange(resolvedValue, options)
    || parsed !== null && parsed !== undefined && !isInputNumberInRange(parsed, options));

  $effect(() => {
    const input = control;

    if (!input) return;

    input.setCustomValidity(!resolvedDisabled && !readonly && (parsed === undefined || outOfRange)
      ? config.locale.inputNumber?.invalidNumber ?? ruRU.inputNumber.invalidNumber : '');

    return () => input.setCustomValidity('');
  });

  onDestroy(() => { for (const reset of resets) clearTimeout(reset); });

  function publish(next: number | null) {
    if (next === resolvedValue) return;

    value = next;
    onValueChange?.(next);
  }

  function collect(text: string) {
    const next = parseInputNumber(text);

    if (next === null || next !== undefined && isInputNumberInRange(next, options)) publish(next);

    editor = { text, dirty: true };
  }

  function flush() {
    if (!editor.dirty || composing || resolvedDisabled || readonly) return;

    const next = commitInputNumber(parseInputNumber(editor.text) ?? resolvedValue, options);

    // Пустое поле остаётся null; нечисловой черновик возвращается к последнему числу.
    if (next !== undefined) publish(editor.text.trim() ? next : null);

    editor = { text: formatInputNumber(resolvedValue, resolvedPrecision), dirty: false };
  }

  function changeStep(direction: 1 | -1) {
    if (resolvedDisabled || readonly || composing) return;

    const next = direction > 0 ? upValue : downValue;

    if (next === null) return;

    publish(next);
    editor = { text: formatInputNumber(resolvedValue, resolvedPrecision), dirty: false };
    control?.focus();
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    if (resolvedDisabled || readonly) return;

    if (composing) editor = { text: event.currentTarget.value, dirty: true };
    else collect(event.currentTarget.value);
    oninput?.(event);
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeydown?.(event);

    if (event.defaultPrevented || event.isComposing || composing || resolvedDisabled || readonly) return;

    if (keyboard && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      changeStep(event.key === 'ArrowUp' ? 1 : -1);
    } else if (event.key === 'Enter') {
      flush();
    }
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    focused = true;
    onfocus?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    focused = false;
    flush();
    field?.onBlur();
    onblur?.(event);
  }

  function handleCompositionStart(event: CompositionEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    composing = true;
    oncompositionstart?.(event);
  }

  function handleCompositionEnd(event: CompositionEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    composing = false;
    if (!resolvedDisabled && !readonly) collect(event.currentTarget.value);
    oncompositionend?.(event);
  }

  function handleReset(event: Event) {
    const input = control;

    if (!input || event.target !== input.form) return;

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !input.isConnected || input !== control) return;

      composing = false;
      value = initialDefault;
      editor = { text: formatInputNumber(initialDefault, resolvedPrecision), dirty: false };
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-input-number { max-width: 100%; height: var(--ant-control-height); }
  .ant-input-number-lg { height: var(--ant-control-height-lg); }
  .ant-input-number-sm { height: var(--ant-control-height-sm); }
  .ant-input-number-input { min-width: 0; height: 100%; }
  .ant-input-number-action { padding: 0; border: 0; border-radius: 0; background: transparent; font-family: inherit; }
  .ant-input-number-action:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
  .up-icon { display: inline-flex; transform: rotate(180deg); }
  @media (prefers-reduced-motion: reduce) {
    .ant-input-number, .ant-input-number-input, .ant-input-number-actions, .ant-input-number-action { transition: none; }
  }
</style>

<svelte:document onreset={handleReset} />

<div
  {style}
  class={[
    'ant-input-number ant-input-number-css-var ant-input-number-outlined ant-input-number-mode-input',
    resolvedDisabled && 'ant-input-number-disabled',
    readonly && 'ant-input-number-readonly',
    focused && !resolvedDisabled && 'ant-input-number-focused ant-input-number-mode-input-focused',
    resolvedSize === 'large' && 'ant-input-number-lg',
    resolvedSize === 'small' && 'ant-input-number-sm',
    resolvedStatus && `ant-input-number-status-${resolvedStatus}`,
    outOfRange && 'ant-input-number-out-of-range',
    config.direction === 'rtl' && 'ant-input-number-rtl',
    (!controls || resolvedDisabled || readonly) && 'ant-input-number-without-controls',
    className
  ]}
>
  <input
    {...attributes}
    bind:this={control}
    id={controlId}
    type="text"
    role="spinbutton"
    class="ant-input-number-input"
    value={editor.text}
    inputmode={attributes.inputmode ?? (resolvedPrecision === 0 ? 'numeric' : 'decimal')}
    autocomplete={attributes.autocomplete ?? 'off'}
    required={attributes.required ?? field?.required}
    disabled={resolvedDisabled}
    {readonly}
    aria-label={attributes['aria-label'] ?? (attributes['aria-labelledby'] ? undefined : field?.label)}
    aria-valuenow={resolvedValue ?? undefined}
    aria-valuemin={options.min}
    aria-valuemax={options.max}
    aria-invalid={resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
    aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onfocus={handleFocus}
    onblur={handleBlur}
    oncompositionstart={handleCompositionStart}
    oncompositionend={handleCompositionEnd}
  />
  {#if controls && !resolvedDisabled && !readonly}
    <div class="ant-input-number-actions">
      <button type="button" class={['ant-input-number-action ant-input-number-action-up', upValue === null && 'ant-input-number-action-up-disabled']} tabindex="-1" disabled={upValue === null} aria-label={config.locale.inputNumber?.increase ?? ruRU.inputNumber.increase} aria-controls={controlId} onpointerdown={(event) => event.preventDefault()} onclick={() => changeStep(1)}><span class="up-icon"><Icon name="down" /></span></button>
      <button type="button" class={['ant-input-number-action ant-input-number-action-down', downValue === null && 'ant-input-number-action-down-disabled']} tabindex="-1" disabled={downValue === null} aria-label={config.locale.inputNumber?.decrease ?? ruRU.inputNumber.decrease} aria-controls={controlId} onpointerdown={(event) => event.preventDefault()} onclick={() => changeStep(-1)}><Icon name="down" /></button>
    </div>
  {/if}
  {#if fieldName}<input type="hidden" name={fieldName} value={resolvedValue ?? ''} disabled={resolvedDisabled} form={attributes.form} />{/if}
</div>
