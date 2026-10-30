<script lang="ts">
  import Steps from './Steps.svelte';
  import { setStepsComposition } from './steps-composition-context';
  import { useConfig } from './config-context';
  import { timelineItems, timelineLayoutAlternate, timelineMode } from './timeline.engine';
  import type { StepsProps } from './steps.types';
  import type { TimelineProps, TimelineSlots } from './timeline.types';
  let {
    items = [],
    variant = 'outlined',
    mode,
    orientation = 'vertical',
    titleSpan,
    pending,
    pendingDot,
    reverse = false,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: TimelineProps = $props();
  let forwarded = $derived<Partial<StepsProps>>(
    {
      ...rest,
      id: rest.id ?? undefined,
      'aria-label': rest['aria-label'] ?? undefined,
      'aria-labelledby': rest['aria-labelledby'] ?? undefined,
      'aria-describedby': rest['aria-describedby'] ?? undefined
    }
  );
  const config = useConfig();
  setStepsComposition({
    get railFollowPrevStatus() {
      return reverse;
    },
    timeline: true
  });
  let actualMode = $derived(timelineMode(mode));
  let converted = $derived(
    timelineItems(items, actualMode, loading, pending, pendingDot, reverse)
  );
  let alternate = $derived(timelineLayoutAlternate(actualMode, orientation, converted));
  let info = $derived(
    {
      props: {
        ...rest,
        items: converted,
        variant,
        mode: actualMode,
        orientation,
        titleSpan,
        pending,
        pendingDot,
        reverse,
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
  const names: TimelineSlots = {
    item: 'ant-timeline-item',
    itemTitle: 'ant-timeline-item-title',
    itemIcon: 'ant-timeline-item-icon',
    itemContent: 'ant-timeline-item-content',
    itemRail: 'ant-timeline-item-rail',
    itemWrapper: 'ant-timeline-item-wrapper',
    itemSection: 'ant-timeline-item-section',
    itemHeader: 'ant-timeline-item-header'
  };
  let combined = $derived(
    Object.fromEntries(
      [...new Set([...Object.keys(names), ...Object.keys(classes)])].map(
        key => [
          key,
          [names[key as keyof TimelineSlots], classes[key as keyof TimelineSlots]].filter(
            Boolean
          )
            .join(
              ' '
            )
        ]
      )
    )
  );
  let spanStyle = $derived(
    titleSpan !== undefined && titleSpan !== null && actualMode !== 'alternate'
      ? `--ant-timeline-head-span${typeof titleSpan === 'number' ? '' : '-ptg'}:${titleSpan}`
      : undefined
  );
  let retainedFocus: HTMLElement | undefined;
  $effect.pre(() => {
    const root = nativeElement;
    const focused = root?.ownerDocument.activeElement;
    retainedFocus = converted.length
      && root
      && focused instanceof HTMLElement
      && root.contains(
        focused
      )
      ? focused
      : undefined;
  });
  $effect(() => {
    const root = nativeElement;
    const focused = retainedFocus;
    retainedFocus = undefined;
    if (converted.length
      && root
      && focused?.isConnected
      && root.contains(focused)
      && root.ownerDocument.activeElement === root.ownerDocument.body
      && focused.getClientRects().length
      && !focused.matches(':disabled')
      && !focused.closest(
        '[inert]'
      )
      && root.ownerDocument.defaultView!.getComputedStyle(
        focused
      ).visibility === 'visible')
      focused.focus({ preventScroll: true });
  });
</script>

<style>
  .loading { display: inline-block; width: 1em; height: 1em; fill: currentColor; animation: timeline-loading 1s linear infinite; }
  @keyframes timeline-loading { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .loading { animation-duration: 2s; } }
</style>

{#snippet loading()}
  <svg class="loading" aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" /></svg>
{/snippet}
<Steps {...forwarded} items={converted} type="dot" {variant} {orientation} current={converted.length - 1}
  class={[
      'ant-timeline ant-timeline-css-var',
      orientation === 'horizontal' && 'ant-timeline-horizontal',
      alternate && 'ant-timeline-layout-alternate',
      config.direction === 'rtl' && 'ant-timeline-rtl',
      className
    ].filter(
      Boolean
    ).join(
      ' '
    )}
  {rootClassName} classNames={combined} styles={{ ...slots, root: [slots.root, style].filter(Boolean).join(';') }} style={spanStyle} bind:nativeElement />
