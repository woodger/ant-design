<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideWatermark, type WatermarkContext } from './watermark-context';
  let { context, children }: { context: WatermarkContext; children?: Snippet; } = $props();
  provideWatermark(
    { add: element => context.add(element), remove: element => context.remove(element) }
  );
</script>

{@render children?.()}
