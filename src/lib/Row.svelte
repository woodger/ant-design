<script lang="ts">
  import { useConfig } from './config-context';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { provideGridRow } from './grid-context';
  import { gridGutters, gridHalfGutter, gridResponsiveValue } from './grid.engine';
  import type { RowProps } from './grid.types';

  let { children, gutter = 0, align, justify, wrap, class: className = '', style, nativeElement = $bindable(), ...rest }: RowProps = $props();
  const config = useConfig();
  const breakpoint = createBreakpoint();
  let screens = $derived(breakpoint.connected ? breakpoint.screens : null);
  let gutters = $derived(gridGutters(gutter, screens));
  let alignment = $derived(gridResponsiveValue(align, screens));
  let justification = $derived(gridResponsiveValue(justify, screens));
  let margin = $derived(gridHalfGutter(gutters[0], true));
  let rowGap = $derived(typeof gutters[1] === 'number' ? `${gutters[1]}px` : gutters[1]);
  provideGridRow({ get gutter() { return gutters; }, get wrap() { return wrap; } });
  $effect(() => breakpoint.connect(window));
</script>

<div {...rest} bind:this={nativeElement} dir={config.direction}
  class={['ant-row ant-grid-css-var', wrap === false && 'ant-row-no-wrap', alignment && `ant-row-${alignment}`, justification && `ant-row-${justification}`, config.direction === 'rtl' && 'ant-row-rtl', className]}
  style={[margin && `margin-inline:${margin}`, rowGap !== undefined && `row-gap:${rowGap}`, style].filter(Boolean).join(';')}>
  {@render children?.()}
</div>
