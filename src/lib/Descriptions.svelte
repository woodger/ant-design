<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { descriptionsColumn, descriptionsItems, descriptionsRows } from './descriptions.engine';
  import DescriptionsCell from './DescriptionsCell.svelte';
  import type { DescriptionsContent, DescriptionsProps } from './descriptions.types';

  let {
    items = [],
    title,
    extra,
    column,
    layout = 'horizontal',
    bordered = false,
    colon = true,
    size,
    labelStyle,
    contentStyle,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: DescriptionsProps = $props();
  const config = useConfig();
  const breakpoint = createBreakpoint();
  let columns = $derived(descriptionsColumn(column, breakpoint.screens));
  let rows = $derived(descriptionsRows(items, columns, breakpoint.screens));
  let mergedSize = $derived(size ?? config.explicitComponentSize);
  let info = $derived(
    {
      props: {
        ...rest,
        items: descriptionsItems(items, breakpoint.screens),
        title,
        extra,
        column: columns,
        layout,
        bordered,
        colon,
        size: mergedSize,
        labelStyle,
        contentStyle,
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
  $effect(() => untrack(() => breakpoint.connect(window)));
</script>

{#snippet value(node: DescriptionsContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<div {...rest} bind:this={nativeElement} dir={config.direction}
  class={[
      'ant-descriptions ant-descriptions-css-var',
      bordered && 'ant-descriptions-bordered',
      mergedSize === 'small' && 'ant-descriptions-small',
      (mergedSize === 'middle' || mergedSize === 'medium') && 'ant-descriptions-medium',
      config.direction === 'rtl' && 'ant-descriptions-rtl',
      className,
      rootClassName,
      classes.root
    ]}
  style={[slots.root, style].filter(Boolean).join(';')}>
  {#if title !== undefined && title !== null && title !== false && title !== '' || extra !== undefined && extra !== null && extra !== false && extra !== ''}
    <div class={['ant-descriptions-header', classes.header]} style={slots.header}>
      {#if title !== undefined && title !== null && title !== false && title !== ''}<div class={['ant-descriptions-title', classes.title]} style={slots.title}>{@render value(title)}</div>{/if}
      {#if extra !== undefined && extra !== null && extra !== false && extra !== ''}<div class={['ant-descriptions-extra', classes.extra]} style={slots.extra}>{@render value(extra)}</div>{/if}
    </div>
  {/if}
  <div class="ant-descriptions-view"><table><tbody>
    {#each rows as row}
      {#if layout === 'vertical'}
        {#each ['label', 'content'] as kind}
          <tr class="ant-descriptions-row">{#each row as item, index (item.key ?? index)}<DescriptionsCell {item} component={kind === 'label' ? 'th' : 'td'} kind={kind as 'label' | 'content'} span={item.span ?? 1} {bordered} {colon} classNames={classes} styles={slots} {labelStyle} {contentStyle} />{/each}</tr>
        {/each}
      {:else}
        <tr class="ant-descriptions-row">{#each row as item, index (item.key ?? index)}
          {#if bordered}<DescriptionsCell {item} component="th" kind="label" span={1} {bordered} {colon} classNames={classes} styles={slots} {labelStyle} {contentStyle} />{/if}
          <DescriptionsCell {item} component="td" kind={bordered ? 'content' : 'item'} span={bordered ? (item.span ?? 1) * 2 - 1 : item.span ?? 1} {bordered} {colon} classNames={classes} styles={slots} {labelStyle} {contentStyle} />
        {/each}</tr>
      {/if}
    {/each}
  </tbody></table></div>
</div>
