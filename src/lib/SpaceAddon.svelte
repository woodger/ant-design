<script lang="ts">
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import type { SpaceAddonProps } from './space-compact.types';
  let { children, variant = 'outlined', disabled, status, class: className = '', style, nativeElement = $bindable(), ...rest }: SpaceAddonProps = $props();
  const config = useConfig();
  const compact = useCompact();
  let classes = $derived(compactClasses('ant-space-addon', config.direction, compact));
</script>

<div {...rest} bind:this={nativeElement} dir={config.direction} class={['ant-space-addon ant-space-addon-css-var', classes, `ant-space-addon-variant-${variant}`, compact?.size && `ant-space-addon-${compact.size}`, disabled && 'ant-space-addon-disabled', status && `ant-space-addon-status-${status}`, className]} {style}>{@render children?.()}</div>
