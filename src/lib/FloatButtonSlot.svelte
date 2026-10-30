<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFloatButton } from './float-button-context';
  import type { FloatButtonContext } from './float-button-context';
  let { context, children }: { context: FloatButtonContext; children?: Snippet; } = $props();
  provideFloatButton({
    get shape() {
      return context.shape;
    },
    get individual() {
      return context.individual;
    },
    get classNames() {
      return context.classNames;
    },
    get styles() {
      return context.styles;
    }
  });
</script>
{@render children?.()}
