<script lang="ts" generics="Value extends SegmentedValue = SegmentedValue">
  import { onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { normalizeSegmentedOptions, offsetSegmentedValue } from './segmented.engine';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { SegmentedProps, SegmentedValue } from './segmented.types';

  let {
    options, value = $bindable<Value | undefined>(), defaultValue, onChange,
    disabled = false, name, block = false, size, orientation, vertical = false, shape = 'default',
    class: className = '', rootClassName = '', style, classNames, styles,
    nativeElement = $bindable(), ...rest
  }: SegmentedProps<Value> = $props();
  const config = useConfig();
  const generatedId = $props.id();
  const resets = new Set<ReturnType<typeof setTimeout>>();
  const initialValue = untrack(() => defaultValue ?? (typeof options[0] === 'object' ? options[0].value : options[0]));
  let selected = $derived(value ?? initialValue);
  let items = $derived(normalizeSegmentedOptions(options));
  let nativeName = $derived(name ?? `ant-segmented-${generatedId}`);
  let isVertical = $derived(orientation ? orientation === 'vertical' : vertical);
  let mergedSize = $derived(size ?? config.componentSize);
  let info = $derived({ props: { ...rest, options, value, defaultValue, onChange, disabled, name: nativeName, block, size, orientation, vertical, shape, class: className, rootClassName, style, classNames, styles } });
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slotStyles = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});

  $effect(() => { const node = nativeElement; if (node) return connectFeedbackFocus(node); });
  onDestroy(() => { for (const reset of resets) clearTimeout(reset); });

  function choose(next: Value) {
    if (disabled || next === selected || !items.some(item => item.value === next && !item.disabled)) return;

    value = next;
    onChange?.(next);
  }

  async function handleKey(event: KeyboardEvent) {
    if (event.defaultPrevented || disabled || !['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) return;

    event.preventDefault();
    const next = offsetSegmentedValue(items, selected, event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1);
    if (next === undefined) return;

    const root = nativeElement;
    choose(next);
    await tick();
    if (root?.isConnected && root === nativeElement) root.querySelectorAll<HTMLInputElement>('input')[items.findIndex(item => item.value === next)]?.focus();
  }

  function handleReset(event: Event) {
    const root = nativeElement;
    if (!root || ![...root.querySelectorAll('input')].some(input => input.form === event.target)) return;

    const reset = setTimeout(() => {
      resets.delete(reset);
      if (!root.isConnected || root !== nativeElement) return;

      root.querySelectorAll<HTMLInputElement>('input').forEach((input, index) => { input.checked = items[index]?.value === selected; });
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-segmented { --ant-segmented-track-bg: var(--ant-color-bg-layout); --ant-segmented-item-color: var(--ant-color-text-label); --ant-segmented-item-hover-color: var(--ant-color-text); --ant-segmented-item-hover-bg: var(--ant-color-fill-secondary); --ant-segmented-item-selected-bg: var(--ant-color-bg-elevated); --ant-segmented-item-active-bg: var(--ant-color-fill); --ant-segmented-item-selected-color: var(--ant-color-text); }
  .ant-segmented-item:has(input:focus-visible) { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  @media (prefers-reduced-motion: reduce) { .ant-segmented, .ant-segmented-item, .ant-segmented-item::after { transition: none; } }
</style>

<svelte:document onreset={handleReset} />

<div {...rest} bind:this={nativeElement} role="radiogroup" aria-label={rest['aria-label'] ?? (rest['aria-labelledby'] ? undefined : 'segmented control')}
  aria-orientation={isVertical ? 'vertical' : 'horizontal'} tabindex={rest.tabindex ?? (disabled ? undefined : 0)} dir={config.direction}
  class={['ant-segmented ant-segmented-css-var', disabled && 'ant-segmented-disabled', block && 'ant-segmented-block', isVertical && 'ant-segmented-vertical', config.direction === 'rtl' && 'ant-segmented-rtl', mergedSize === 'small' && 'ant-segmented-sm', mergedSize === 'large' && 'ant-segmented-lg', shape === 'round' && 'ant-segmented-shape-round', className, rootClassName, classes.root]}
  style={[slotStyles.root, style].filter(Boolean).join(';')}>
  <div class="ant-segmented-group">
    {#each items as item (item.value)}
      <label class={['ant-segmented-item', item.value === selected && 'ant-segmented-item-selected ant-segmented-item-selected-text', (disabled || item.disabled) && 'ant-segmented-item-disabled', item.class, classes.item]} style={slotStyles.item}>
        <input type="radio" class="ant-segmented-item-input" name={nativeName} checked={item.value === selected} disabled={disabled || item.disabled} aria-label={item['aria-label'] ?? (item.icon && item.label === undefined ? item.title : undefined)} onchange={() => choose(item.value)} onkeydown={handleKey} />
        <div class={['ant-segmented-item-label', classes.label]} title={item.title} style={slotStyles.label}>
          {#if item.icon}<span class={['ant-segmented-item-icon', classes.icon]} style={slotStyles.icon} aria-hidden="true">{@render item.icon()}</span>{/if}
          {#if item.icon && item.label !== undefined}<span>{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}</span>
          {:else if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}
        </div>
      </label>
    {/each}
  </div>
</div>
