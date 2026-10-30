<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { provideSider, useLayout } from './layout-context';
  import { layoutSiderWidth } from './layout.engine';
  import { connectSiderBreakpoint } from './layout.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import { focusAfterNotice } from './notice.dom';
  import Icon from './Icon.svelte';
  import { ruRU } from './types';
  import type { LayoutCollapseType, LayoutSiderProps } from './layout.types';

  let {
    children,
    collapsed = $bindable<boolean | undefined>(),
    defaultCollapsed = false,
    collapsible = false,
    reverseArrow = false,
    width = 200,
    collapsedWidth = 80,
    breakpoint,
    theme = 'dark',
    trigger,
    zeroWidthTriggerStyle,
    expandLabel,
    collapseLabel,
    onCollapse,
    onBreakpoint,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: LayoutSiderProps = $props();
  const config = useConfig();
  const layout = useLayout();
  const id = $props.id();
  const initial = untrack(() => defaultCollapsed);
  let selected = $derived(collapsed ?? initial);
  let below = $state(false);
  let body = $state<HTMLDivElement>();
  let button = $state<HTMLButtonElement>();
  let active = true;
  let actualWidth = $derived(layoutSiderWidth(selected ? collapsedWidth : width));
  let zero = $derived(Number.parseFloat(actualWidth) === 0);
  let zeroTrigger = $derived(Number.parseFloat(String(collapsedWidth || 0)) === 0);
  let showTrigger = $derived(trigger !== null && (collapsible || below && zeroTrigger));
  let reverseIcon = $derived((config.direction === 'rtl') === !reverseArrow);
  let strings = $derived({ ...ruRU.layout, ...config.locale.layout });
  let info = $derived(
    {
      props: {
        ...rest,
        children,
        collapsed: selected,
        defaultCollapsed,
        collapsible,
        reverseArrow,
        width,
        collapsedWidth,
        breakpoint,
        theme,
        trigger,
        zeroWidthTriggerStyle,
        expandLabel,
        collapseLabel,
        onCollapse,
        onBreakpoint,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
  provideSider({
    get collapsed() {
      return selected;
    }
  });
  onDestroy(() => {
    active = false;
  });
  $effect(() => untrack(() => layout?.register(id)));
  $effect(() => {
    const node = nativeElement;
    if (node) return connectFeedbackFocus(node);
  });
  $effect.pre(() => {
    if (!zero || !body?.contains(body.ownerDocument.activeElement)) return;
    const host = nativeElement;
    void tick().then(() => {
      if (!active || !host?.isConnected) return;
      if (button?.getClientRects().length)
        button.focus({ preventScroll: true }); else focusAfterNotice(host, true);
    });
  });
  $effect(() => {
    const key = breakpoint;
    if (!key) return;
    return untrack(() => connectSiderBreakpoint(window, key, broken => {
      const previous = selected;
      below = broken;
      onBreakpoint?.(broken);
      if (previous !== broken)
        collapse(broken, 'responsive');
    }));
  });

  function collapse(next: boolean, source: LayoutCollapseType) {
    if (!active) return;
    collapsed = next;
    onCollapse?.(next, source);
  }
</script>

<style>
  button { border: 0; padding: 0; font: inherit; }
  button:focus-visible, .ant-layout-sider:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; }
  svg { width: 1em; height: 1em; }
  .ant-layout-sider-compact .ant-layout-sider-zero-width-trigger { font-size: 16px; }
  @media (prefers-reduced-motion: reduce) { .ant-layout-sider, button, button::after { transition: none; } }
</style>

<aside {...rest} bind:this={nativeElement} dir={config.direction}
  class={[
      'ant-layout-sider ant-layout-css-var',
      `ant-layout-sider-${theme}`,
      config.theme.compact && 'ant-layout-sider-compact',
      selected && 'ant-layout-sider-collapsed',
      collapsible && trigger !== null && !zeroTrigger && 'ant-layout-sider-has-trigger',
      below && 'ant-layout-sider-below',
      zero && 'ant-layout-sider-zero-width',
      className,
      rootClassName,
      classes.root
    ]}
  style={[
      slots.root,
      style,
      `flex:0 0 ${actualWidth};max-width:${actualWidth};min-width:${actualWidth};width:${actualWidth}`
    ].filter(
      Boolean
    ).join(
      ';'
    )}>
  <div id={`ant-layout-sider-body-${id}`} bind:this={body} class={['ant-layout-sider-children', classes.body]} style={slots.body} inert={zero || undefined}>{@render children?.()}</div>
  {#if showTrigger}
    <button bind:this={button} type="button" aria-controls={`ant-layout-sider-body-${id}`} aria-expanded={!selected} aria-label={selected
        ? expandLabel ?? strings.expand
        : collapseLabel ?? strings.collapse}
      class={zeroTrigger
          ? `ant-layout-sider-zero-width-trigger ant-layout-sider-zero-width-trigger-${reverseArrow
            ? 'right'
            : 'left'}`
          : 'ant-layout-sider-trigger'}
      style={zeroTrigger ? zeroWidthTriggerStyle : `width:${actualWidth}`} onclick={() => collapse(!selected, 'clickTrigger')}>
      {#if typeof trigger === 'function'}{@render trigger()}{:else if trigger}{trigger}
      {:else if zeroTrigger}<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" /></svg>
      {:else}<Icon name={selected
          ? reverseIcon ? 'left' : 'right'
          : reverseIcon ? 'right' : 'left'} />{/if}
    </button>
  {/if}
</aside>
