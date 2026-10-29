<script lang="ts">
  import { provideCompact } from './space-compact-context';
  import type { SpaceCompactContext } from './space-compact-context';
  import type { SpaceContent } from './space.types';
  let { children, size, orientation, first, last }: SpaceCompactContext & { children?: SpaceContent } = $props();
  provideCompact({ get size() { return size; }, get orientation() { return orientation; }, get first() { return first; }, get last() { return last; } });
</script>

{#if typeof children === 'function'}{@render children()}{:else if typeof children !== 'boolean'}{children ?? ''}{/if}
