<script lang="ts" generics="Data">
  import { createMasonryMotion, type createMasonryRuntime } from './masonry.dom';
  import type { MasonryEntry } from './masonry.engine';
  import type { MasonryProps } from './masonry.types';

  let {
    entry,
    runtime,
    class: className,
    style,
    itemRender,
    onRemove
  }: {
    entry: MasonryEntry<Data>;
    runtime?: ReturnType<typeof createMasonryRuntime<Data>>;
    class?: string;
    style: string;
    itemRender?: MasonryProps<Data>['itemRender'];
    onRemove: (key: string) => void;
  } = $props();

  let element = $state<HTMLDivElement>();
  let motionClass = $state('');
  let motion = $state.raw<ReturnType<typeof createMasonryMotion>>();
  let content = $derived(entry.item.children);
  let column = $derived(entry.position?.column ?? 0);

  $effect(() => {
    if (!element || !runtime) return;

    return runtime.register(entry.itemKey, element);
  });

  $effect(() => {
    if (!element) return;

    const controller = createMasonryMotion(
      element,
      value => { motionClass = value; },
      () => onRemove(entry.key)
    );
    motion = controller;

    return () => {
      controller.destroy();
      motion = undefined;
    };
  });

  $effect(() => motion?.sync(entry.visible));
</script>

<div
  bind:this={element}
  class={['ant-masonry-item', className, motionClass]}
  {style}
  style:top={entry.position?.top === undefined ? undefined : `${entry.position.top}px`}
>
  {#if content !== undefined && content !== null}
    {#if typeof content === 'function'}{@render content()}{:else if typeof content !== 'boolean'}{content}{/if}
  {:else}
    {@render itemRender?.({ ...entry.item, index: entry.index, column })}
  {/if}
</div>
