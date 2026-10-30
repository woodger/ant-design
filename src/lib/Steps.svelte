<script lang="ts">
  import { useStepsComposition } from './steps-composition-context';
  import { useConfig } from './config-context';
  import StepItem from './StepItem.svelte';
  import { connectStepsFocus } from './steps.dom';
  import { getStepsStatus, normalizeStepsCurrent } from './steps.engine';
  import { stepsDataItems, stepsLayout } from './steps-data.engine';
  import { displaySteps } from './steps-display.engine';
  import { ruRU } from './types';
  import type { NormalizedStepsDataItem } from './steps-data.engine';
  import type { StepsProps } from './steps.types';

  let {
    items: sourceItems = [],
    current = 0,
    initial = 0,
    status = 'process',
    onChange,
    orientation,
    direction,
    size,
    responsive = true,
    disabled,
    type,
    variant = 'filled',
    titlePlacement,
    labelPlacement,
    progressDot,
    percent,
    maxCount,
    ellipsis,
    offset = 0,
    iconRender,
    classNames,
    styles,
    rootClassName = '',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: StepsProps = $props();
  const config = useConfig();
  const composition = useStepsComposition();
  const generatedId = $props.id();
  let mobile = $state(false);
  let rootId = $derived(id ?? `ant-steps-${generatedId}`);
  let items = $derived(stepsDataItems(sourceItems));
  let selected = $derived(initial + normalizeStepsCurrent(current - initial, items.length));
  let display = $derived(displaySteps(items, selected, initial, maxCount));
  let strings = $derived({ ...ruRU.steps, ...config.locale.steps });
  let layout = $derived(
    stepsLayout(
      type,
      Boolean(progressDot),
      orientation,
      direction,
      responsive,
      mobile,
      titlePlacement,
      labelPlacement
    )
  );
  let actualPercent = $derived(layout.type === 'inline' ? undefined : percent);
  let small = $derived((size
    ?? (config.componentSize === 'small'
      ? 'small'
      : 'medium')) === 'small');
  let info = $derived(
    {
      props: {
        ...rest,
        items: sourceItems,
        current,
        initial,
        status,
        onChange,
        orientation: layout.vertical ? 'vertical' as const : 'horizontal' as const,
        direction,
        size,
        responsive,
        disabled,
        type: layout.type,
        variant,
        titlePlacement: layout.titlePlacement as 'horizontal' | 'vertical',
        labelPlacement,
        progressDot,
        percent: actualPercent,
        maxCount,
        ellipsis,
        offset,
        iconRender,
        classNames,
        styles,
        rootClassName,
        id,
        class: className,
        style
      }
    }
  );
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
  let displayed = $derived(
    display.steps.map(
      step => ({
        ...step,
        item: step.item
          ?? {
            key: step.key,
            originalKey: step.sourceKey,
            title: '',
            disabled: true,
            status: step.status
          } as NormalizedStepsDataItem
      })
    )
  );
  let statuses = $derived(
    displayed.map((step, index) => getStepsStatus(step.item, index, display.current, status))
  );

  $effect(() => {
    if (!responsive
      || orientation === 'vertical'
      || !orientation
      && direction === 'vertical'
      || layout.type === 'panel') return;
    const media = window.matchMedia(
      composition?.timeline ? '(max-width: 575.98px)' : '(max-width: 531.98px)'
    );
    const update = () => {
      mobile = media.matches;
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  $effect(() => {
    if (nativeElement) return connectStepsFocus(nativeElement);
  });

  function choose(event: MouseEvent, item: NormalizedStepsDataItem, index: number) {
    if ((disabled ?? config.componentDisabled) || item.disabled) return;
    item.onClick?.(event);
    if (index !== selected)
      onChange?.(index);
  }
</script>

<style>
  .ant-steps { min-width: 0; max-width: 100%; }
  .ant-steps-horizontal { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; }
  @media (prefers-reduced-motion: reduce) { .ant-steps :global(*) { transition: none; animation: none; } }
</style>

<ol {...rest} bind:this={nativeElement} id={composition?.timeline ? id : rootId} role="list" aria-label={ariaLabel
    ?? (ariaLabelledby || composition?.timeline
      ? undefined
      : strings.label)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction}
  class={[
      'ant-steps ant-steps-css-var',
      `ant-steps-${variant}`,
      `ant-steps-title-${layout.titlePlacement}`,
      layout.vertical ? 'ant-steps-vertical' : 'ant-steps-horizontal',
      small && 'ant-steps-small',
      layout.type && layout.type !== 'dot' && `ant-steps-${layout.type}`,
      layout.dot && 'ant-steps-dot',
      ellipsis && 'ant-steps-ellipsis',
      display.collapsed && 'ant-steps-max-count',
      actualPercent !== undefined && 'ant-steps-with-progress',
      config.direction === 'rtl' && 'ant-steps-rtl',
      className,
      rootClassName,
      classes.root
    ]}
  style={[`--ant-cmp-steps-items-offset:${offset}`, slots.root, style].filter(
      Boolean
    ).join(
      ';'
    )}>
  {#each displayed as step, index (step.key)}
    <StepItem item={step.item} index={step.originIndex >= 0 ? initial + step.originIndex : index} status={statuses[index]} active={index === display.current}
      blocked={(disabled
          ?? config.componentDisabled)
          || Boolean(step.item.disabled)} nextStatus={index < displayed.length - 1
              ? composition?.railFollowPrevStatus ? statuses[index] : statuses[index + 1]
              : undefined} {rootId} statusText={composition?.timeline ? undefined : strings[statuses[index]]} composed={composition?.timeline} {classes} {slots}
      dot={layout.dot} panel={layout.type === 'panel'} inline={layout.type === 'inline'} percent={actualPercent} {iconRender} progressDotRender={layout.type === 'dot' && typeof progressDot === 'function'
          ? progressDot
          : undefined}
      ellipsis={step.originIndex < 0} sourceKey={step.item.originalKey
          ?? (display.collapsed && step.originIndex >= 0
            ? step.originIndex
            : undefined)} onChoose={onChange || step.item.onClick
                ? event => choose(event, step.item, initial + step.originIndex)
                : undefined} />
  {/each}
</ol>
