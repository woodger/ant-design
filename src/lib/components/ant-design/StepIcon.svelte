<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { useStepsIcon } from './steps-icon-context';
  let { children, class: className = '', style, ...rest }: Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'style' | 'class'> & { children?: Snippet; class?: string; style?: string } = $props();
  const context = useStepsIcon();
</script>

<span {...rest} class={['ant-steps-item-icon', context?.className, className]} style={[context?.style, style].filter(Boolean).join(';')} aria-hidden={context?.decorative === false ? undefined : true} inert={context?.decorative !== false}>
  {@render children?.()}
</span>
