<script lang="ts">
  import { useConfig } from './config-context';
  import Icon from './Icon.svelte';
  import { connectStepsFocus } from './steps.dom';
  import { getStepsStatus, normalizeStepsCurrent, normalizeStepsItems } from './steps.engine';
  import { ruRU } from './types';
  import type { StepsProps } from './steps.types';

  let { items: sourceItems, current = 0, status = 'process', onChange, orientation = 'horizontal', size, responsive = true, disabled, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, class: className = '', style }: StepsProps = $props();
  const config = useConfig();
  const generatedId = $props.id();
  let host = $state<HTMLOListElement>();
  let mobile = $state(false);
  let rootId = $derived(id ?? `ant-steps-${generatedId}`);
  let items = $derived(normalizeStepsItems(sourceItems));
  let selected = $derived(normalizeStepsCurrent(current, items.length));
  let strings = $derived({ ...ruRU.steps, ...config.locale.steps });
  let vertical = $derived(orientation === 'vertical' || responsive && mobile);
  let small = $derived((size ?? (config.componentSize === 'small' ? 'small' : 'medium')) === 'small');

  $effect(() => {
    if (!responsive || orientation === 'vertical') return;

    const media = window.matchMedia('(max-width: 531.98px)');
    const update = () => { mobile = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });

  $effect(() => {
    const node = host;
    if (node) return connectStepsFocus(node);
  });

  function itemId(key: string, part: string) {
    const encoded = Array.from(key, character => character.codePointAt(0)!.toString(16)).join('-');
    return `${rootId}-${part}-${encoded || 'empty'}`;
  }

  function choose(key: string) {
    const index = items.findIndex(item => item.key === key);
    if (index < 0 || index === selected || (disabled ?? config.componentDisabled) || items[index].disabled) return;

    onChange?.(index);
  }
</script>

<style>
  .ant-steps { min-width: 0; max-width: 100%; }
  .ant-steps-horizontal { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; }
  .ant-steps > .ant-steps-item { min-width: 0; }
  .ant-steps-item-wrapper, .ant-steps-item-header, .ant-steps-item-trigger { min-width: 0; }
  .ant-steps-item-header { flex-wrap: wrap; }
  .ant-steps-item-title, .ant-steps-item-subtitle, .ant-steps-item-content { overflow-wrap: anywhere; }
  .ant-steps-item-subtitle { flex-shrink: 1; }
  .ant-steps-item-trigger { display: flex; flex-wrap: wrap; align-items: center; min-height: var(--ant-cmp-steps-heading-height); max-width: 100%; border: 0; padding: 0; margin: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  .ant-steps-item-trigger:disabled { cursor: default; }
  .ant-steps-item-trigger:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; border-radius: var(--ant-border-radius-sm); }
  .ant-steps-item-icon :global(svg) { max-width: 100%; max-height: 100%; }
  .ant-steps-item-status { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .ant-steps :global(*) { transition: none; animation: none; } }
</style>

<ol bind:this={host} id={rootId} role="list" aria-label={ariaLabel ?? (ariaLabelledby ? undefined : strings.label)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={['ant-steps ant-steps-css-var ant-steps-filled ant-steps-title-horizontal', vertical ? 'ant-steps-vertical' : 'ant-steps-horizontal', small && 'ant-steps-small', config.direction === 'rtl' && 'ant-steps-rtl', className]} {style}>
  {#each items as item, index (item.key)}
    {@const itemStatus = getStepsStatus(item, index, selected, status)}
    {@const blocked = (disabled ?? config.componentDisabled) || Boolean(item.disabled)}
    <li class={['ant-steps-item', `ant-steps-item-${itemStatus}`, index === selected && 'ant-steps-item-active', blocked && 'ant-steps-item-disabled', item.icon && 'ant-steps-item-custom', onChange && !blocked && 'ant-steps-item-clickable']} aria-current={!onChange && index === selected ? 'step' : undefined} data-steps-key={item.key}>
      <div class="ant-steps-item-wrapper">
        <span class="ant-steps-item-icon" aria-hidden="true" inert>{#if item.icon}{@render item.icon()}{:else if itemStatus === 'finish'}<Icon name="check" />{:else if itemStatus === 'error'}<Icon name="close" />{:else}<span class="ant-steps-item-icon-number">{index + 1}</span>{/if}</span>
        <div class="ant-steps-item-section">
          <div class="ant-steps-item-header">
            {#if onChange}<button type="button" class="ant-steps-item-trigger" data-steps-key={item.key} disabled={blocked} aria-current={index === selected ? 'step' : undefined} aria-describedby={[itemId(item.key, 'status'), item.content ? itemId(item.key, 'content') : undefined].filter(Boolean).join(' ')} onclick={() => choose(item.key)}><span class="ant-steps-item-title">{#if typeof item.title === 'function'}{@render item.title()}{:else}{item.title}{/if}</span>{#if item.subTitle}<span class="ant-steps-item-subtitle">{#if typeof item.subTitle === 'function'}{@render item.subTitle()}{:else}{item.subTitle}{/if}</span>{/if}</button>{:else}<span class="ant-steps-item-title">{#if typeof item.title === 'function'}{@render item.title()}{:else}{item.title}{/if}</span>{#if item.subTitle}<span class="ant-steps-item-subtitle">{#if typeof item.subTitle === 'function'}{@render item.subTitle()}{:else}{item.subTitle}{/if}</span>{/if}{/if}
            {#if index < items.length - 1}<span class={`ant-steps-item-rail ant-steps-item-rail-${getStepsStatus(items[index + 1], index + 1, selected, status)}`} aria-hidden="true"></span>{/if}
          </div>
          <span class="ant-steps-item-status" id={itemId(item.key, 'status')}>{strings[itemStatus]}</span>
          {#if item.content}<div class="ant-steps-item-content" id={itemId(item.key, 'content')}>{#if typeof item.content === 'function'}{@render item.content()}{:else}{item.content}{/if}</div>{/if}
        </div>
      </div>
    </li>
  {/each}
</ol>
