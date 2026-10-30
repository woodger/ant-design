<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField } from './form-context';
  import { provideCompact } from './space-compact-context';
  let { children }: { children: Snippet; } = $props();
  provideFormField(undefined);
  provideCompact(null);
</script>

{@render children()}
