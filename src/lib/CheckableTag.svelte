<script lang="ts">
  import { useConfig } from './config-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { CheckableTagProps } from './tag.types';

  let {
    children,
    checked = false,
    disabled,
    icon,
    onChange,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style
  }: CheckableTagProps = $props();
  const config = useConfig();
  let host = $state<HTMLButtonElement>();
  let blocked = $derived(disabled ?? config.componentDisabled);
  $effect(() => {
    const node = host;
    if (node) return connectFeedbackFocus(node);
  });

  function handleClick(event: MouseEvent) {
    if (!blocked && !event.defaultPrevented)
      onChange?.(!checked);
  }
</script>

<style>
  .ant-tag { display: inline-flex; align-items: center; appearance: none; min-width: 0; max-width: 100%; white-space: normal; vertical-align: middle; --ant-tag-default-color: var(--ant-color-text); }
  .ant-tag-content { min-width: 0; overflow-wrap: anywhere; }
  .ant-tag-icon { display: inline-flex; flex: none; align-items: center; }
  .ant-tag-icon :global(svg) { max-width: 1em; max-height: 1em; }
  .ant-tag:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  @media (prefers-reduced-motion: reduce) { .ant-tag { transition: none; } }
</style>

<button bind:this={host} {id} type="button" aria-pressed={checked} disabled={blocked} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={[
    'ant-tag ant-tag-css-var ant-tag-checkable',
    checked && 'ant-tag-checkable-checked',
    blocked && 'ant-tag-checkable-disabled',
    config.direction === 'rtl' && 'ant-tag-rtl',
    className
  ]} {style} onclick={handleClick}>
  {#if icon}<span class="ant-tag-icon anticon" aria-hidden="true" inert>{@render icon()}</span>{/if}<span class="ant-tag-content">{@render children()}</span>
</button>
