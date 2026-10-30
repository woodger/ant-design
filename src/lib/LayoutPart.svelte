<script lang="ts">
  import { useConfig } from './config-context';
  import type { LayoutSectionProps } from './layout.types';
  let {
    tag,
    part,
    children,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: LayoutSectionProps & {
    tag: 'header' | 'footer' | 'main';
    part: 'header' | 'footer' | 'content';
  } = $props();
  const config = useConfig();
</script>

<svelte:element this={tag} {...rest} bind:this={nativeElement} dir={config.direction} class={['ant-layout-css-var', `ant-layout-${part}`, className, rootClassName]} {style}>
  {@render children?.()}
</svelte:element>
