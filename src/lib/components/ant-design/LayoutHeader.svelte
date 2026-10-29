<script lang="ts">
  import LayoutPart from './LayoutPart.svelte';
  import type { LayoutSectionProps } from './layout.types';
  let { nativeElement = $bindable(), ...rest }: LayoutSectionProps = $props();
</script>
<LayoutPart {...rest} tag="header" part="header" bind:nativeElement />
