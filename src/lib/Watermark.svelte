<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { createWatermarkRuntime } from './watermark.dom';
  import type { WatermarkContext } from './watermark-context';
  import type { WatermarkContent, WatermarkProps } from './watermark.types';
  import WatermarkChildren from './WatermarkChildren.svelte';

  let {
    zIndex,
    rotate = -22,
    width,
    height,
    image,
    content,
    font = {},
    gap = [100, 100],
    offset,
    children,
    inherit = true,
    onRemove,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable()
  }: WatermarkProps = $props();
  const config = useConfig();
  let panels = $state.raw<ReadonlySet<HTMLElement>>(new Set());
  let runtime = $state.raw<ReturnType<typeof createWatermarkRuntime>>();
  let containerStyle = $derived(
    ['position:relative;overflow:hidden', config.watermark?.style, style].filter(Boolean).join(
      ';'
    )
  );
  const context: WatermarkContext = {
    add(element) {
      if (!panels.has(element))
        panels = new Set([...panels, element]);
    },
    remove(element) {
      runtime?.remove(element);
      const next = new Set(panels);
      next.delete(element);
      panels = next;
    }
  };

  let options = $derived.by(() => {
    const copy = (item: WatermarkContent) => item === null || item === undefined
      ? ''
      : typeof item === 'string'
        ? item
        : { text: item.text, font: item.font ? { ...item.font } : undefined };
    // Чтение полей snapshots делает массивы и построчные font реактивными в Svelte.
    return {
      zIndex,
      rotate,
      width,
      height,
      image,
      content: Array.isArray(content)
        ? content.map(copy)
        : content === undefined || content === null ? undefined : copy(
          content as WatermarkContent
        ),
      font: { ...font },
      gap: [gap[0], gap[1]] as const,
      offset: offset ? [offset[0], offset[1]] as const : undefined,
      containerStyle,
      theme: `${config.theme.mode}:${config.theme.compact}`
    };
  });

  $effect(() => {
    if (!nativeElement) return;
    const controller = createWatermarkRuntime(nativeElement, () => onRemove);
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect(() => {
    const controller = runtime;
    const next = options;
    const targets = panels;
    untrack(() => controller?.configure(next, targets));
  });
</script>

<div bind:this={nativeElement} class={[className, config.watermark?.class, rootClassName]} style={containerStyle}>
  {#if inherit}<WatermarkChildren {context} {children} />{:else}{@render children?.()}{/if}
</div>
