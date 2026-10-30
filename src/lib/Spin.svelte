<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { createSpinModel, normalizeSpinDelay } from './spin.model.svelte.js';
  import { createSpinFocus } from './spin.dom';
  import { ruRU } from './types';
  import type { SpinProps } from './spin.types';

  let { spinning = true, delay = 0, size, description, indicator, children, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, 'aria-hidden': ariaHidden, class: className = '', style }: SpinProps = $props();
  const config = useConfig();
  let host = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let request = $derived({ spinning, delay: normalizeSpinDelay(delay) });
  const model = createSpinModel(() => request);
  const focus = createSpinFocus();
  let visible = $derived(model.visible);
  let resolvedSize = $derived(size ?? (config.componentSize === 'middle' ? 'medium' : config.componentSize));
  let strings = $derived({ ...ruRU.spin, ...config.locale.spin });
  let hasDescription = $derived(typeof description === 'function' || Boolean(description));
  let label = $derived(ariaLabel ?? (ariaLabelledby ? undefined : typeof description === 'string' && description ? description : strings.loadingText));
  let announce = $derived(visible && !ariaHidden);

  $effect(() => {
    const node = host;
    const current = request;
    if (!node) return;

    const view = node.ownerDocument.defaultView!;
    return untrack(() => model.connect(current, { schedule(callback, milliseconds) { const timer = view.setTimeout(callback, milliseconds); return () => view.clearTimeout(timer); } }));
  });

  $effect.pre(() => {
    const node = host;
    const container = content;
    const busy = spinning;
    if (node) untrack(() => focus.update(node, container, busy));
  });

  onDestroy(() => focus.destroy());
</script>

<style>
  .ant-spin { min-width: 0; max-width: 100%; }
  .ant-spin[hidden] { display: none; }
  .ant-spin:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  .ant-spin > .ant-spin-section { width: max-content; max-width: calc(100% - 24px); pointer-events: none; text-align: center; }
  .ant-spin-description { min-width: 0; max-width: 100%; overflow-wrap: anywhere; text-align: center; }
  .ant-spin-dot { flex: none; }
  @media (prefers-reduced-motion: reduce) {
    .ant-spin .ant-spin-dot-spin, .ant-spin .ant-spin-dot-item { animation: none; }
    .ant-spin .ant-spin-dot-item { opacity: 1; }
    .ant-spin .ant-spin-container, .ant-spin .ant-spin-container::after, .ant-spin .ant-spin-dot-holder { transition: none; }
    .ant-spin .ant-spin-dot :global(*) { animation: none !important; transition: none !important; }
  }
</style>

{#snippet visual()}
  <span class="ant-spin-dot" aria-hidden="true">{#if indicator}{@render indicator()}{:else}<span class="ant-spin-dot-holder"><span class="ant-spin-dot-holder ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span></span>{/if}</span>
  {#if hasDescription}<div class="ant-spin-description">{#if typeof description === 'function'}{@render description()}{:else}{description}{/if}</div>{/if}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Отрицательный tabindex нужен для временного фокуса при блокировке children.) -->
<div bind:this={host} {id} role={ariaHidden ? undefined : children ? 'group' : announce ? 'status' : undefined} aria-live={!children && announce ? 'polite' : undefined} aria-atomic={!children && announce || undefined} aria-label={children || visible ? label : undefined} aria-labelledby={children || visible ? ariaLabelledby : undefined} aria-describedby={ariaDescribedby} aria-hidden={ariaHidden || !children && !visible || undefined} tabindex={children ? -1 : undefined} hidden={!children && !visible} dir={config.direction} class={['ant-spin ant-spin-css-var', !children && 'ant-spin-section', visible && 'ant-spin-spinning', resolvedSize === 'small' && 'ant-spin-sm', resolvedSize === 'large' && 'ant-spin-lg', config.direction === 'rtl' && 'ant-spin-rtl', className]} {style}>
  {#if visible}{#if children}<div class="ant-spin-section" role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : undefined} aria-atomic={announce || undefined} aria-label={typeof description === 'string' && description ? description : strings.loadingText}>{@render visual()}</div>{:else}{@render visual()}{/if}{/if}
  {#if children}<div bind:this={content} class="ant-spin-container" inert={spinning} aria-busy={spinning}>{@render children()}</div>{/if}
</div>
