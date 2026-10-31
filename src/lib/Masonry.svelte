<script lang="ts" generics="Data = unknown">
  import { tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { gridGutters } from './grid.engine';
  import { captureMasonryFocus, createMasonryRuntime } from './masonry.dom';
  import {
    equalMasonryData,
    getMasonryColumns,
    getMasonryPositions,
    mergeMasonryEntries,
    type MasonryEntry,
    type MasonryHeight
  } from './masonry.engine';
  import type { MasonryItemType, MasonryProps, MasonrySemantic } from './masonry.types';
  import MasonryItem from './MasonryItem.svelte';

  let {
    children,
    items,
    itemRender,
    columns,
    gutter = 0,
    fresh = false,
    onLayoutChange,
    class: className,
    rootClassName,
    style,
    classNames,
    styles,
    nativeElement = $bindable()
  }: MasonryProps<Data> = $props();

  const config = useConfig();
  const breakpoint = createBreakpoint();
  let mergedItems = $state.raw<MasonryItemType<Data>[]>([]);
  let heights = $state.raw<MasonryHeight[]>([]);
  let entries = $state.raw<MasonryEntry<Data>[]>([]);
  let itemColumns = $state.raw<(readonly [MasonryItemType<Data>, number])[]>([]);
  let runtime = $state.raw<ReturnType<typeof createMasonryRuntime<Data>>>();
  let columnCount = $derived(getMasonryColumns(columns, breakpoint.screens));
  let gutters = $derived(gridGutters(gutter, breakpoint.screens));
  let horizontalGutter = $derived(gutters[0] ?? 0);
  let verticalGutter = $derived(gutters[1] ?? horizontalGutter);
  // Строковый gutter проходит через исходные `${value}px` и JS-сложение без нормализации.
  let layout = $derived(getMasonryPositions(heights, columnCount, verticalGutter as number));
  let positioned = $derived(mergedItems.map((item, index) => {
    const key = item.key ?? index;

    return {
      key: String(key),
      itemKey: key,
      item,
      index,
      position: layout.positions.get(key),
      visible: true
    };
  }));
  let info = $derived({
    props: {
      children,
      items,
      itemRender,
      columns: columnCount,
      gutter,
      fresh,
      onLayoutChange,
      class: className,
      rootClassName,
      style,
      classNames,
      styles,
      nativeElement
    }
  });

  const resolve = (value: MasonrySemantic<Data> | undefined) => typeof value === 'function'
    ? value(info) ?? {}
    : value ?? {};
  let contextClasses = $derived(resolve(config.masonry?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.masonry?.styles));
  let localStyles = $derived(resolve(styles));
  let rootStyle = $derived([
    `height:${layout.height}px`,
    contextStyles.root,
    config.masonry?.style,
    localStyles.root,
    style
  ].filter(Boolean).join(';'));

  function getItemStyle(entry: MasonryEntry<Data>) {
    return [
      contextStyles.item,
      localStyles.item,
      `--ant-masonry-item-width:calc((100% + ${horizontalGutter}px) / ${columnCount})`,
      `inset-inline-start:calc(var(--ant-masonry-item-width) * ${entry.position?.column ?? 0})`,
      `width:calc(var(--ant-masonry-item-width) - ${horizontalGutter}px)`,
      'position:absolute'
    ].filter(Boolean).join(';');
  }

  function remove(key: string) {
    updateEntries(entries.filter(entry => entry.key !== key || entry.visible));
  }

  function updateEntries(next: MasonryEntry<Data>[]) {
    const host = nativeElement;
    const restore = host ? captureMasonryFocus(host) : undefined;
    entries = next;

    if (restore)
      void tick().then(() => {
        if (nativeElement === host)
          restore();
      });
  }

  $effect(() => { mergedItems = items ?? []; });
  $effect(() => breakpoint.connect(window));

  $effect(() => {
    if (!nativeElement) return;

    const controller = createMasonryRuntime<Data>(nativeElement, value => { heights = value; });
    runtime = controller;

    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });

  $effect(() => {
    const controller = runtime;
    const nextItems = mergedItems;
    const nextFresh = fresh;
    const nextColumns = columnCount;

    untrack(() => controller?.configure(nextItems, nextFresh, nextColumns));
  });

  $effect(() => {
    const next = positioned;

    untrack(() => updateEntries(mergeMasonryEntries(entries, next)));
  });

  $effect(() => {
    const next = positioned;

    untrack(() => {
      if (!onLayoutChange || !next.every(entry => entry.position)) return;

      const pairs = next.map(entry => [entry.item, entry.position!.column] as const);

      if (!equalMasonryData(itemColumns, pairs))
        itemColumns = pairs;
    });
  });

  $effect(() => {
    const pairs = itemColumns;

    untrack(() => {
      if (onLayoutChange && items && items.length === pairs.length)
        onLayoutChange(pairs.map(([item, column]) => ({ ...item, column })));
    });
  });
</script>

<div
  bind:this={nativeElement}
  class={[
    'ant-masonry',
    config.masonry?.class,
    contextClasses.root,
    localClasses.root,
    rootClassName,
    className,
    'ant-masonry-css-var',
    config.direction === 'rtl' && 'ant-masonry-rtl'
  ]}
  style={rootStyle}
>
  {#each entries as entry (entry.key)}
    <MasonryItem
      {entry}
      {runtime}
      {itemRender}
      class={[contextClasses.item, localClasses.item].filter(Boolean).join(' ')}
      style={getItemStyle(entry)}
      onRemove={remove}
    />
  {/each}
</div>
