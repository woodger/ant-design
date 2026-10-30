<script lang="ts">
  import { useConfig } from './config-context';
  import { formatStatisticValue } from './statistic.engine';
  import Skeleton from './Skeleton.svelte';
  import type { StatisticContent, StatisticProps, StatisticSemanticInfo } from './statistic.types';

  let {
    value = 0,
    title,
    prefix,
    suffix,
    loading = false,
    precision,
    decimalSeparator = '.',
    groupSeparator = ',',
    formatter,
    valueRender,
    valueStyle,
    class: className = '',
    rootClassName = '',
    style,
    classNames,
    styles,
    nativeElement = $bindable(),
    ...rest
  }: StatisticProps = $props();
  const config = useConfig();
  let semanticInfo = $derived<StatisticSemanticInfo>({
    props: {
      ...rest,
      value,
      title,
      prefix,
      suffix,
      loading,
      precision,
      decimalSeparator,
      groupSeparator,
      formatter,
      valueRender,
      valueStyle,
      class: className,
      rootClassName,
      style,
      classNames,
      styles
    }
  });
  let classes = $derived(
    typeof classNames === 'function' ? classNames(semanticInfo) : classNames ?? {}
  );
  let slotStyles = $derived(typeof styles === 'function' ? styles(semanticInfo) : styles ?? {});
  let formatted = $derived(typeof formatter === 'function' ? formatter(value) : undefined);
  let parts = $derived(formatStatisticValue(value, precision, decimalSeparator, groupSeparator));

  function hasContent(content: StatisticContent | undefined) {
    return content !== undefined && content !== null && content !== false && content !== '';
  }
</script>

<style>
  .ant-statistic { --ant-statistic-title-font-size: var(--ant-font-size); }
  .ant-statistic-compact { --ant-statistic-content-font-size: 20px; }
</style>

{#snippet content(node: StatisticContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== false}{node}{/if}
{/snippet}

{#snippet valueNode()}
  <span class={['ant-statistic-content-value', classes.value]} style={slotStyles.value}>
    {#if typeof formatter === 'function'}{@render content(formatted)}
    {:else if 'text' in parts}{parts.text}
    {:else}<span class="ant-statistic-content-value-int">{parts.integer}</span>{#if parts.decimal}<span class="ant-statistic-content-value-decimal">{parts.decimal}</span>{/if}{/if}
  </span>
{/snippet}

<div {...rest} bind:this={nativeElement} dir={config.direction}
  class={[
      'ant-statistic ant-statistic-css-var',
      config.direction === 'rtl' && 'ant-statistic-rtl',
      config.theme.compact && 'ant-statistic-compact',
      className,
      rootClassName,
      classes.root
    ]}
  style={[slotStyles.root, style].filter(Boolean).join(';')}>
  {#if hasContent(title)}<div class={['ant-statistic-header', classes.header]} style={slotStyles.header}><div class={['ant-statistic-title', classes.title]} style={slotStyles.title}>{@render content(title)}</div></div>{/if}
  {#if loading}<Skeleton paragraph={false} active class="ant-statistic-skeleton" />
  {:else}
    <div class={['ant-statistic-content', classes.content]} style={[valueStyle, slotStyles.content].filter(Boolean).join(';')}>
      {#if hasContent(prefix)}<span class={['ant-statistic-content-prefix', classes.prefix]} style={slotStyles.prefix}>{@render content(prefix)}</span>{/if}
      {#if valueRender}{@render valueRender(valueNode)}{:else}{@render valueNode()}{/if}
      {#if hasContent(suffix)}<span class={['ant-statistic-content-suffix', classes.suffix]} style={slotStyles.suffix}>{@render content(suffix)}</span>{/if}
    </div>
  {/if}
</div>
