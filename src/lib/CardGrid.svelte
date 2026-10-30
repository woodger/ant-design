<script lang="ts">
  import type { CardGridProps } from './card.types';
  let {
    children,
    hoverable = true,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: CardGridProps = $props();
</script>

<div {...rest} bind:this={nativeElement} class={['ant-card-grid', hoverable && 'ant-card-grid-hoverable', className]} {style}>{@render children?.()}</div>
