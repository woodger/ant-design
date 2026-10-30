<script lang="ts">
  import { cardHasContent } from './card.engine';
  import type { CardContent, CardMetaProps } from './card.types';
  let {
    avatar,
    title,
    description,
    classNames,
    styles,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: CardMetaProps = $props();
  let info = $derived(
    {
      props: { ...rest, avatar, title, description, classNames, styles, class: className, style }
    }
  );
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
</script>

{#snippet value(node: CardContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<div {...rest} bind:this={nativeElement} class={['ant-card-meta', className, classes.root]} style={[slots.root, style].filter(Boolean).join(';')}>
  {#if cardHasContent(avatar)}<div class={['ant-card-meta-avatar', classes.avatar]} style={slots.avatar}>{@render value(avatar)}</div>{/if}
  {#if cardHasContent(title) || cardHasContent(description)}
    <div class={['ant-card-meta-section', classes.section]} style={slots.section}>
      {#if cardHasContent(title)}<div class={['ant-card-meta-title', classes.title]} style={slots.title}>{@render value(title)}</div>{/if}
      {#if cardHasContent(description)}<div class={['ant-card-meta-description', classes.description]} style={slots.description}>{@render value(description)}</div>{/if}
    </div>
  {/if}
</div>
