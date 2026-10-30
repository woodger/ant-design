<script lang="ts">
  import { onDestroy } from 'svelte';
  import { useConfig } from './config-context';
  import { provideLayout } from './layout-context';
  import { createLayoutState } from './layout.model.svelte.js';
  import type { LayoutProps } from './layout.types';

  let {
    children,
    hasSider,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: LayoutProps = $props();
  const config = useConfig();
  const model = createLayoutState();
  provideLayout(model);
  onDestroy(() => model.destroy());
</script>

<div {...rest} bind:this={nativeElement} dir={config.direction} data-ant-has-sider={hasSider === false ? 'false' : undefined}
  class={[
      'ant-layout ant-layout-css-var',
      (hasSider ?? model.hasSider) && 'ant-layout-has-sider',
      config.direction === 'rtl' && 'ant-layout-rtl',
      className,
      rootClassName
    ]} {style}>
  {@render children?.()}
</div>
