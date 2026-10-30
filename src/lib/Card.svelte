<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { cardHasContent, cardTabItems } from './card.engine';
  import { connectCardGrid } from './card.dom';
  import { createSkeletonFocus } from './skeleton.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import Skeleton from './Skeleton.svelte';
  import Tabs from './Tabs.svelte';
  import type { CardContent, CardProps } from './card.types';

  let {
    children,
    title,
    extra,
    cover,
    actions,
    loading = false,
    hoverable = false,
    size,
    type,
    variant,
    bordered,
    headStyle,
    bodyStyle,
    containGrid,
    tabList,
    activeTabKey = $bindable(),
    defaultActiveTabKey,
    tabBarExtraContent,
    tabProps = {},
    onTabChange,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: CardProps = $props();
  const config = useConfig();
  const focus = createSkeletonFocus();
  let body = $state<HTMLDivElement>();
  let detectedGrid = $state(false);
  let mergedSize = $derived(size ?? config.explicitComponentSize);
  let mergedVariant = $derived(variant ?? (bordered === false ? 'borderless' : 'outlined'));
  let hasGrid = $derived(containGrid ?? detectedGrid);
  let tabs = $derived(cardTabItems(tabList));
  let info = $derived(
    {
      props: {
        ...rest,
        children,
        title,
        extra,
        cover,
        actions,
        loading,
        hoverable,
        size: mergedSize,
        type,
        variant: mergedVariant,
        bordered,
        headStyle,
        bodyStyle,
        containGrid,
        tabList,
        activeTabKey,
        defaultActiveTabKey,
        tabBarExtraContent,
        tabProps,
        onTabChange,
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
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
  $effect(() => {
    const node = body;
    if (node && !loading) return untrack(() => connectCardGrid(node, value => {
      detectedGrid = value;
    }));
  });
  $effect.pre(() => {
    const node = body;
    const busy = loading;
    if (node)
      untrack(() => focus.update(node, node, busy));
  });
  onDestroy(() => focus.destroy());

  function selectTab(key: string) {
    activeTabKey = key;
    onTabChange?.(key);
  }
</script>

<style>
  .ant-card-body:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; }
  .ant-card-loading > .ant-card-body :global(.ant-skeleton-host) { width: 100%; }
  .ant-card :global(.ant-card-head-tabs .ant-tabs-empty) { display: none; }
  @media (prefers-reduced-motion: reduce) { .ant-card, .ant-card :global(.ant-card-grid) { transition: none; } }
</style>

{#snippet value(node: CardContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<div {...rest} bind:this={nativeElement} dir={config.direction} data-ant-contain-grid={containGrid === false ? 'false' : undefined}
  class={[
      'ant-card ant-card-css-var',
      loading && 'ant-card-loading',
      mergedVariant !== 'borderless' && 'ant-card-bordered',
      hoverable && 'ant-card-hoverable',
      hasGrid && 'ant-card-contain-grid',
      tabList?.length && 'ant-card-contain-tabs',
      mergedSize === 'small' && 'ant-card-small',
      type && `ant-card-type-${type}`,
      config.direction === 'rtl' && 'ant-card-rtl',
      className,
      rootClassName,
      classes.root
    ]}
  style={[slots.root, style].filter(Boolean).join(';')}>
  {#if cardHasContent(title) || cardHasContent(extra) || tabList}
    <div class={['ant-card-head', classes.header]} style={[headStyle, slots.header].filter(Boolean).join(';')}>
      <div class="ant-card-head-wrapper">
        {#if cardHasContent(title)}<div class={['ant-card-head-title', classes.title]} style={slots.title}>{@render value(title)}</div>{/if}
        {#if cardHasContent(extra)}<div class={['ant-card-extra', classes.extra]} style={slots.extra}>{@render value(extra)}</div>{/if}
      </div>
      {#if tabList}<Tabs {...tabProps} items={tabs} activeKey={activeTabKey ?? tabProps.activeKey} defaultActiveKey={defaultActiveTabKey ?? tabProps.defaultActiveKey}
        {tabBarExtraContent} size={tabProps.size ?? (mergedSize === 'small' ? 'small' : 'large')} class="ant-card-head-tabs" onChange={selectTab} />{/if}
    </div>
  {/if}
  {#if cardHasContent(cover)}<div class={['ant-card-cover', classes.cover]} style={slots.cover}>{@render value(cover)}</div>{/if}
  {#if loading || children}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Фокус парковки при замене содержимого Skeleton.) -->
    <div bind:this={body} class={['ant-card-body', classes.body]} style={[bodyStyle, slots.body].filter(Boolean).join(';')} tabindex="-1" aria-busy={loading || undefined}>
      {#if loading}<Skeleton active title={false} paragraph={{ rows: 4 }} />{:else}{@render children?.()}{/if}
    </div>
  {/if}
  {#if actions?.length}<ul class={['ant-card-actions', classes.actions]} style={slots.actions}>{#each actions as action, index (index)}<li style={`width:${100 / actions.length}%`}><span>{@render value(action)}</span></li>{/each}</ul>{/if}
</div>
