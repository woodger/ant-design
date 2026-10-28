<script lang="ts">
  import { useConfig } from './config-context';
  import type { FlexProps } from './flex.types';

  let {
    children, orientation, vertical = false, wrap, justify, align, flex, gap,
    component = 'div', class: className = '', rootClassName = '', style,
    nativeElement = $bindable(), ...rest
  }: FlexProps = $props();
  const config = useConfig();
  let isVertical = $derived(orientation ? orientation === 'vertical' : vertical);
  let wrapping = $derived(wrap === true ? 'wrap' : wrap);
  let alignment = $derived(align || (isVertical ? 'stretch' : undefined));
  let presetGap = $derived(typeof gap === 'string' && ['small', 'medium', 'middle', 'large'].includes(gap));
  let rootStyle = $derived([
    style,
    flex != null && `flex:${flex}`,
    gap != null && !presetGap && `gap:${typeof gap === 'number' ? `${gap}px` : gap}`
  ].filter(value => value !== undefined && value !== null && value !== false).join(';'));
</script>

<svelte:element this={component}
  {...rest}
  bind:this={nativeElement}
  dir={config.direction}
  class={[
    'ant-flex ant-flex-css-var', className, rootClassName,
    isVertical && 'ant-flex-vertical', config.direction === 'rtl' && 'ant-flex-rtl',
    wrapping && `ant-flex-wrap-${wrapping}`, alignment && `ant-flex-align-${alignment}`,
    justify && `ant-flex-justify-${justify}`, presetGap && `ant-flex-gap-${gap}`
  ]}
  style={rootStyle}
>{#if children}{@render children()}{/if}</svelte:element>
