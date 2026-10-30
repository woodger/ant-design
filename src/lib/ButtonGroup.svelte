<script lang="ts">
  import { provideButtonGroup } from './button-group-context';
  import { useConfig } from './config-context';
  import type { ButtonGroupProps } from './button.types';
  let { children, size, class: className = '', style, nativeElement = $bindable(), ...rest }: ButtonGroupProps = $props();
  const config = useConfig();
  provideButtonGroup({ get size() { return size; } });
</script>
<div {...rest} bind:this={nativeElement} dir={config.direction} class={['ant-btn-group', size === 'large' && 'ant-btn-group-lg', size === 'small' && 'ant-btn-group-sm', config.direction === 'rtl' && 'ant-btn-group-rtl', className]} {style}>
  {@render children?.()}
</div>
