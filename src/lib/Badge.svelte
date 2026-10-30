<script lang="ts">
  import { useConfig } from './config-context';
  import { getBadgeState, normalizeBadgeOffset } from './badge.engine';
  import { ruRU } from './types';
  import type { BadgeContext, BadgeProps } from './badge.types';

  let { count, overflowCount = 99, showZero = false, dot = false, status, color, text, size = 'medium', offset, title, children, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, class: className = '', style }: BadgeProps = $props();
  const config = useConfig();
  const generatedId = $props.id();
  let rootId = $derived(id ?? `ant-badge-${generatedId}`);
  let state = $derived(getBadgeState({ count, overflowCount, showZero, dot, status, color, text, hasChildren: Boolean(children) }));
  let position = $derived(normalizeBadgeOffset(offset));
  let strings = $derived({ ...ruRU.badge, ...config.locale.badge });
  let descriptionId = $derived(state.visible ? `${rootId}-description` : undefined);
  let context = $derived<BadgeContext>({ count: state.count, descriptionId });
  let description = $derived(!state.statusStandalone && state.count !== undefined ? `${strings.count}: ${state.count}` : status ? strings[status] : strings.dot);
  let nativeTitle = $derived(title === false || title === null ? undefined : title ?? (state.visible && !state.statusStandalone && state.count !== undefined ? String(state.count) : undefined));
</script>

<style>
  .ant-badge { max-width: 100%; min-width: 0; vertical-align: middle; }
  .ant-badge .ant-badge-indicator { pointer-events: none; margin-top: var(--ant-badge-offset-top, 0px); inset-inline-end: var(--ant-badge-offset-inline, 0px); box-shadow: 0 0 0 var(--ant-line-width) var(--ant-color-bg-container); }
  .ant-badge-not-a-wrapper .ant-badge-indicator { position: relative; top: auto; transform: none; display: inline-flex; }
  .ant-badge-status-standalone { margin-top: var(--ant-badge-offset-top, 0px); inset-inline-end: var(--ant-badge-offset-inline, auto); }
  .ant-badge-status-text { margin-inline-start: var(--ant-margin-xs); color: var(--ant-color-text); font-size: var(--ant-font-size); overflow-wrap: anywhere; }
  .ant-badge-description { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .ant-badge .ant-badge-indicator, .ant-badge .ant-badge-status-dot, .ant-badge .ant-badge-status-dot::after { transition: none; animation: none; } }
</style>

<span id={rootId} role={ariaLabel || ariaLabelledby ? 'group' : undefined} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} title={nativeTitle} class={['ant-badge ant-badge-css-var', !children && 'ant-badge-not-a-wrapper', state.hasStatus && 'ant-badge-status', state.statusStandalone && 'ant-badge-status-standalone', config.direction === 'rtl' && 'ant-badge-rtl', className]} {style} style:--ant-badge-offset-top={position ? `${position[1]}px` : undefined} style:--ant-badge-offset-inline={position ? `${-position[0]}px` : undefined}>
  {#if children}{@render children(context)}{/if}
  {#if state.visible}
    {#if state.statusStandalone}<span class={['ant-badge-status-dot', status && `ant-badge-status-${status}`, color && `ant-badge-color-${color}`]} aria-hidden="true"></span>{:else}<sup class={['ant-badge-indicator', state.showAsDot ? 'ant-badge-dot' : 'ant-badge-count', size === 'small' && 'ant-badge-count-sm', !state.showAsDot && state.display.length > 1 && 'ant-badge-multiple-words', status && `ant-badge-status-${status}`, color && `ant-badge-color-${color}`]} aria-hidden="true" title={nativeTitle}>{#if !state.showAsDot}<bdi>{state.display}</bdi>{/if}</sup>{/if}
    <span id={descriptionId} class="ant-badge-description">{description}</span>
  {/if}
  {#if state.showText}<span class="ant-badge-status-text">{#if typeof text === 'function'}{@render text()}{:else}{text}{/if}</span>{/if}
</span>
