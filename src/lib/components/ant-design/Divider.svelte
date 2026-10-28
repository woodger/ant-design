<script lang="ts">
  import { useConfig } from './config-context';
  import type { DividerProps, DividerOrientation, DividerSemanticInfo } from './divider.types';

  let {
    children, orientation, vertical, type, titlePlacement, orientationMargin,
    dashed = false, variant = 'solid', size, plain = false,
    class: className = '', rootClassName = '', style, classNames, styles,
    nativeElement = $bindable(), ...rest
  }: DividerProps = $props();
  const config = useConfig();
  let direction = $derived<DividerOrientation>(orientation === 'horizontal' || orientation === 'vertical'
    ? orientation : typeof vertical === 'boolean' ? vertical ? 'vertical' : 'horizontal' : type ?? 'horizontal');
  let placement = $derived(titlePlacement ?? (orientation && !['horizontal', 'vertical'].includes(orientation) ? orientation : 'center'));
  let logicalPlacement = $derived<'start' | 'end' | 'center'>(placement === 'left' ? config.direction === 'rtl' ? 'end' : 'start'
    : placement === 'right' ? config.direction === 'rtl' ? 'start' : 'end' : placement as 'start' | 'end' | 'center');
  let mergedSize = $derived(size ?? config.explicitComponentSize);
  let hasChildren = $derived(children !== undefined && children !== null && children !== false && children !== '');
  let hasMargin = $derived(logicalPlacement !== 'center' && orientationMargin != null);
  let margin = $derived(typeof orientationMargin === 'number' || /^\d+$/.test(String(orientationMargin)) ? `${orientationMargin}px` : orientationMargin);
  let semanticInfo = $derived<DividerSemanticInfo>({ props: {
    ...rest, children, orientation: direction, vertical, type, titlePlacement: logicalPlacement,
    orientationMargin, dashed, variant, size: mergedSize, plain, class: className, rootClassName, style, classNames, styles
  } });
  let classes = $derived(typeof classNames === 'function' ? classNames(semanticInfo) : classNames ?? {});
  let semanticStyles = $derived(typeof styles === 'function' ? styles(semanticInfo) : styles ?? {});
</script>

<div
  {...rest}
  bind:this={nativeElement}
  role="separator"
  aria-orientation={direction}
  dir={config.direction}
  class={[
    'ant-divider ant-divider-css-var', `ant-divider-${direction}`,
    hasChildren && ['ant-divider-with-text', `ant-divider-with-text-${logicalPlacement}`],
    dashed && 'ant-divider-dashed', variant !== 'solid' && `ant-divider-${variant}`,
    plain && 'ant-divider-plain', config.direction === 'rtl' && 'ant-divider-rtl',
    hasMargin && `ant-divider-no-default-orientation-margin-${logicalPlacement}`,
    (mergedSize === 'medium' || mergedSize === 'middle') && 'ant-divider-md', mergedSize === 'small' && 'ant-divider-sm',
    !hasChildren && ['ant-divider-rail', classes.rail], className, rootClassName, classes.root
  ]}
  style={[semanticStyles.root, !hasChildren && semanticStyles.rail, style].filter(Boolean).join(';')}
>
  {#if hasChildren && direction !== 'vertical'}
    <div class={['ant-divider-rail ant-divider-rail-start', classes.rail]} style={semanticStyles.rail}></div>
    <span class={['ant-divider-inner-text', classes.content]} style={[
      hasMargin && `margin-inline-${logicalPlacement}:${margin}`, semanticStyles.content
    ].filter(Boolean).join(';')}>{#if typeof children === 'function'}{@render children()}{:else}{children}{/if}</span>
    <div class={['ant-divider-rail ant-divider-rail-end', classes.rail]} style={semanticStyles.rail}></div>
  {/if}
</div>
