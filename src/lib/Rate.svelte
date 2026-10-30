<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { getRateKeyValue, getRatePointerValue, getRateStarClass } from './rate.engine';
  import type { RateCharacterInfo, RateProps } from './rate.types';
  import Tooltip from './Tooltip.svelte';

  let {
    value,
    defaultValue,
    count = 5,
    allowHalf = false,
    allowClear = true,
    keyboard = true,
    disabled,
    size,
    character,
    characterRender,
    tooltips,
    autoFocus = false,
    tabIndex,
    onChange,
    onHoverChange,
    onFocus,
    onBlur,
    onKeyDown,
    onMouseLeave,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...attributes
  }: RateProps = $props();
  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  let innerValue = $state<number | undefined>(untrack(() => defaultValue || 0));
  let actualValue = $derived(value !== undefined ? value : innerValue);
  let hoverValue = $state<number | null>(null);
  let cleanedValue: number | null = null;
  let focused = $state(false);
  let shownValue = $derived(hoverValue === null ? actualValue : hoverValue);
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedSize = $derived(size ?? config.componentSize);
  let previous = untrack(() => value);

  $effect(() => {
    const next = value;
    if (next !== previous)
      innerValue = next;
    previous = next;
  });
  onMount(() => {
    if (autoFocus)
      focus();
  });

  export function focus() {
    if (!blocked)
      nativeElement?.focus();
  }
  export function blur() {
    if (!blocked)
      nativeElement?.blur();
  }

  function change(next: number) {
    innerValue = next;
    onChange?.(next);
  }

  function pointerValue(index: number, event: MouseEvent | KeyboardEvent) {
    if (!allowHalf) return index + 1;

    const element = (event.currentTarget as HTMLElement).closest('li')!;
    const box = element.getBoundingClientRect();
    const document = element.ownerDocument;
    return getRatePointerValue(
      index,
      'pageX' in event && (event.detail !== 0 || event.pageX !== 0) ? event.pageX : undefined,
      box.left + document.defaultView!.scrollX - (document.documentElement.clientLeft
        || document.body.clientLeft
        || 0),
      element.clientWidth,
      allowHalf,
      config.direction === 'rtl'
    );
  }

  function handleHover(index: number, event: MouseEvent) {
    if (blocked) return;
    const next = pointerValue(index, event);
    if (next !== cleanedValue) {
      hoverValue = next;
      cleanedValue = null;
    }
    onHoverChange?.(next);
  }

  function leave() {
    if (blocked) return;
    hoverValue = null;
    cleanedValue = null;
    onHoverChange?.(undefined);
  }

  function handleClick(index: number, event: MouseEvent | KeyboardEvent) {
    if (blocked) return;
    const next = pointerValue(index, event);
    const reset = allowClear && next === actualValue;
    leave();
    change(reset ? 0 : next);
    cleanedValue = reset ? next : null;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (blocked) return;
    const next = keyboard
      ? getRateKeyValue(actualValue, count, allowHalf, event.key, config.direction === 'rtl')
      : undefined;
    if (next !== undefined) {
      change(next);
      event.preventDefault();
    }
    onKeyDown?.(event);
  }

  function handleStarHover(event: MouseEvent, index: number) {
    handleHover(index, event);
  }
  function handleStarClick(event: MouseEvent | KeyboardEvent, index: number) {
    handleClick(index, event);
  }
</script>

<style>
  .ant-rate-star > button { display: block; margin: 0; padding: 0; border: 0; background: none; color: inherit; font: inherit; line-height: inherit; cursor: inherit; }
  .ant-rate:focus-visible { outline: var(--ant-rate-line-width-focus) dashed var(--ant-rate-star-color); outline-offset: 2px; }
  .ant-rate-star-first, .ant-rate-star-second { display: block; }
  .anticon { display: inline-flex; align-items: center; color: inherit; line-height: 0; vertical-align: -0.125em; }
  @media (prefers-reduced-motion: reduce) { .ant-rate-star > button, .ant-rate-star-first, .ant-rate-star-second { transition: none; } }
</style>

{#snippet symbol(info: RateCharacterInfo)}
  {#if typeof character === 'function'}{@render character(info)}
  {:else if character !== undefined}{character}
  {:else}<span class="anticon anticon-star" aria-hidden="true"><svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" focusable="false"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" /></svg></span>{/if}
{/snippet}

<ul role="radiogroup" {...attributes} bind:this={nativeElement} tabindex={blocked ? -1 : tabIndex ?? attributes.tabindex ?? 0}
  class={[
      'ant-rate ant-rate-css-var',
      blocked && 'ant-rate-disabled',
      config.direction === 'rtl' && 'ant-rate-rtl',
      resolvedSize === 'small' && 'ant-rate-small',
      resolvedSize === 'large' && 'ant-rate-large',
      className,
      rootClassName,
      config.rate?.class
    ]}
  style={[config.rate?.style, style].filter(Boolean).join(';')}
  onfocusin={event => {
      if (!blocked) {
        focused = true;
        onFocus?.();
      }
      attributes.onfocusin?.(event);
    }}
  onfocusout={event => {
      if (!blocked) {
        focused = false;
        onBlur?.();
      }
      attributes.onfocusout?.(event);
    }}
  onkeydown={event => {
      handleKeydown(event);
      attributes.onkeydown?.(event);
    }}
  onmouseleave={event => {
      leave();
      onMouseLeave?.(event);
      attributes.onmouseleave?.(event);
    }}>
  {#each Array(count).fill(0) as _, index (index)}
    {@const info: RateCharacterInfo = { index, count, value: shownValue, allowHalf, disabled: Boolean(blocked), focused, prefixCls: 'ant-rate-star', onHover: handleStarHover, onClick: handleStarClick }}
    {#snippet star()}
      <li class={getRateStarClass(index, shownValue, allowHalf, focused)} style={tooltips && !characterRender && index < count - 1
          ? 'margin-inline-end:var(--ant-margin-xs);'
          : undefined}>
        <button type="button" role="radio" aria-checked={shownValue !== undefined && shownValue > index} aria-posinset={index + 1} aria-setsize={count} aria-label={String(index + 1)} disabled={blocked} tabindex={blocked ? -1 : 0}
          onmousemove={event => handleHover(index, event)} onclick={event => handleClick(index, event)}
          onkeydown={event => {
              if (event.key === 'Enter' && !blocked) {
                event.preventDefault();
                handleClick(index, event);
              }
            }}>
          <span class="ant-rate-star-first" aria-hidden="true">{@render symbol(info)}</span>
          <span class="ant-rate-star-second" aria-hidden="true">{@render symbol(info)}</span>
        </button>
      </li>
    {/snippet}
    {#if characterRender}{@render characterRender(star, info)}
    {:else if tooltips}
      {@const tooltip = tooltips[index]}
      <Tooltip {...typeof tooltip === 'object' ? tooltip : { title: tooltip }} style={`display:contents;${typeof tooltip === 'object'
          ? tooltip.style ?? ''
          : ''}`}>
        {@render star()}
      </Tooltip>
    {:else}{@render star()}{/if}
  {/each}
</ul>
