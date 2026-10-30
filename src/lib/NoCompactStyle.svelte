<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideCompact } from './space-compact-context';
  let { children }: { children: Snippet; } = $props();
  provideCompact(null);
</script>

{@render children()}
