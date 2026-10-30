<script lang="ts">
  import { useConfig } from './config-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import Icon from './Icon.svelte';
  import ResultImage from './ResultImage.svelte';
  import type { ResultProps } from './result.types';

  let {
    status = 'info',
    title,
    subTitle,
    icon,
    extra,
    children,
    headingLevel = 2,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style
  }: ResultProps = $props();
  const config = useConfig();
  const icons = {
    success: 'check-circle-filled',
    error: 'close-circle-filled',
    info: 'exclamation-circle-filled',
    warning: 'warning-filled'
  } as const;
  let host = $state<HTMLDivElement>();
  let kind = $derived(
    String(status) as 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500'
  );
  let exception = $derived(kind === '403' || kind === '404' || kind === '500' ? kind : undefined);

  $effect(() => {
    const node = host;
    const interactive = Boolean(extra
      || children)
      || typeof title === 'function'
      || typeof subTitle === 'function';
    if (node && interactive) return connectFeedbackFocus(node);
  });
</script>

<style>
  .ant-result { min-width: 0; max-width: 100%; padding-inline: clamp(16px, 4vw, 32px); }
  .ant-result-title { font-weight: 400; }
  .ant-result-title, .ant-result-subtitle, .ant-result-body { min-width: 0; overflow-wrap: anywhere; }
  .ant-result-icon { min-width: 0; max-width: 100%; }
  .ant-result-icon :global(svg) { max-width: 100%; }
  .ant-result-image { max-width: 100%; height: auto; }
  .ant-result-image :global(svg) { display: block; width: 100%; height: auto; }
  .ant-result-extra { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--ant-padding-xs); min-width: 0; }
  .ant-result-extra > :global(*) { max-width: 100%; margin-inline-end: 0; }
  .ant-result-body { padding: var(--ant-padding-lg) clamp(16px, 5vw, 40px); }
</style>

<div bind:this={host} {id} role={ariaLabel || ariaLabelledby ? 'group' : undefined} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={[
    'ant-result ant-result-css-var',
    `ant-result-${kind}`,
    config.direction === 'rtl' && 'ant-result-rtl',
    className
  ]} {style}>
  {#if exception || icon !== false}<div class="ant-result-icon" aria-hidden="true" inert>{#if exception}<div class="ant-result-image"><ResultImage status={exception} /></div>{:else if icon}{@render icon()}{:else}<span class="anticon"><Icon name={icons[kind as keyof typeof icons]} /></span>{/if}</div>{/if}
  {#if title}<svelte:element this={`h${headingLevel}`} class="ant-result-title">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</svelte:element>{/if}
  {#if subTitle}<div class="ant-result-subtitle">{#if typeof subTitle === 'function'}{@render subTitle()}{:else}{subTitle}{/if}</div>{/if}
  {#if extra}<div class="ant-result-extra">{@render extra()}</div>{/if}
  {#if children}<div class="ant-result-body">{@render children()}</div>{/if}
</div>
