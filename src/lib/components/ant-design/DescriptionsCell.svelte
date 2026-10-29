<script lang="ts">
  import type { DescriptionsCellSlots } from './descriptions.types';
  import type { ResolvedDescriptionsItem } from './descriptions.engine';
  let { item, component, kind, span, bordered, colon, classNames, styles, labelStyle, contentStyle }: {
    item: ResolvedDescriptionsItem; component: 'th' | 'td'; kind: 'label' | 'content' | 'item'; span: number;
    bordered: boolean; colon: boolean; classNames: DescriptionsCellSlots; styles: DescriptionsCellSlots;
    labelStyle?: string; contentStyle?: string;
  } = $props();
  let label = $derived(kind !== 'content' ? item.label : undefined);
  let content = $derived(kind !== 'label' ? item.children : undefined);
  let merged = $derived({
    label: [labelStyle, styles.label, item.labelStyle, item.styles?.label].filter(Boolean).join(';'),
    content: [contentStyle, styles.content, item.contentStyle, item.styles?.content].filter(Boolean).join(';')
  });
</script>

{#snippet value(node: typeof label)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<svelte:element this={component} colspan={span}
  class={[item.class, bordered ? [`ant-descriptions-item-${kind}`, classNames[kind as 'label' | 'content'], item.classNames?.[kind as 'label' | 'content']] : 'ant-descriptions-item']}
  style={[item.style, bordered && kind !== 'item' && merged[kind]].filter(Boolean).join(';')}>
  {#if bordered}
    {#if label !== undefined && label !== null && label !== false && label !== ''}<span>{@render value(label)}</span>{/if}
    {#if content !== undefined && content !== null && content !== false && content !== ''}<span>{@render value(content)}</span>{/if}
  {:else}
    <div class="ant-descriptions-item-container">
      {#if label !== undefined && label !== null && label !== false && label !== ''}
        <span class={['ant-descriptions-item-label', !colon && 'ant-descriptions-item-no-colon', classNames.label, item.classNames?.label]} style={merged.label}>{@render value(label)}</span>
      {/if}
      {#if content !== undefined && content !== null && content !== false && content !== ''}
        <span class={['ant-descriptions-item-content', classNames.content, item.classNames?.content]} style={merged.content}>{@render value(content)}</span>
      {/if}
    </div>
  {/if}
</svelte:element>
