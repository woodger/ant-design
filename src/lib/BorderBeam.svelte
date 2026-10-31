<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { createBorderBeamRuntime } from './border-beam.dom';
  import type { BorderBeamProps } from './border-beam.types';

  let {
    target,
    children,
    color,
    count = 1,
    duration,
    lineWidth,
    outset,
    size,
    class: className,
    style
  }: BorderBeamProps = $props();

  const config = useConfig();
  let runtime = $state.raw<ReturnType<typeof createBorderBeamRuntime>>();
  let options = $derived({
    color: Array.isArray(color) ? color.map(item => ({ ...item })) : color,
    count,
    duration,
    lineWidth,
    outset,
    size,
    className: [
      'ant-border-beam',
      config.borderBeam?.class,
      className,
      'ant-border-beam-css-var'
    ].filter(Boolean).join(' '),
    contextStyle: config.borderBeam?.style,
    style
  });

  $effect(() => {
    if (!(target instanceof HTMLElement)) return;

    const controller = createBorderBeamRuntime(target);
    runtime = controller;

    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });

  $effect(() => {
    const controller = runtime;
    const next = options;

    untrack(() => controller?.configure(next));
  });
</script>

{#if typeof children === 'function'}{@render children()}{:else if typeof children !== 'boolean'}{children ?? ''}{/if}
