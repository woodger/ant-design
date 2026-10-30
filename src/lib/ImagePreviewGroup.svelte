<script lang="ts">
  import { untrack } from 'svelte';
  import type {
    ImagePreviewGroupProps,
    ImagePreviewGroupConfig
  } from './image-preview-group.types';
  import type { ImageGroupEntry } from './image-group-context';
  import { provideImageGroup } from './image-group-context';
  import { getImagePreviewItems, getImagePreviewIndex } from './image-preview-group.engine';
  import ImagePreview from './ImagePreview.svelte';

  let { items, preview = true, fallback, children }: ImagePreviewGroupProps = $props();
  let config = $derived<ImagePreviewGroupConfig>(typeof preview === 'object' ? preview : {});
  let registered = $state.raw<ReadonlyMap<string, ImageGroupEntry>>(new Map());
  let entries = $derived(getImagePreviewItems(items, registered));
  let innerCurrent = $state(untrack(() => config.current ?? 0));
  let current = $derived(config.current ?? innerCurrent);
  let innerOpen = $state(untrack(() => Boolean(config.open)));
  let opened = $derived(config.open ?? innerOpen);
  let data = $derived(entries[current]?.data ?? {});
  let viewerConfig = $derived({ ...config, onOpenChange: undefined });
  let keepOpenIndex = false;
  let previousOpen = false;
  let previous = untrack(() => ({ current: config.current, open: config.open }));
  $effect(() => {
    const next = { current: config.current, open: config.open };
    if (next.current !== previous.current)
      innerCurrent = next.current ?? 0;
    if (next.open !== previous.open)
      innerOpen = Boolean(next.open);
    previous = next;
  });
  $effect(() => {
    const next = opened;
    untrack(() => {
      if (next && !previousOpen && !keepOpenIndex)
        innerCurrent = 0;
      if (!next)
        keepOpenIndex = false;
      previousOpen = next;
    });
  });
  function register(id: string, entry: ImageGroupEntry) {
    const next = new Map(registered);
    next.set(id, entry);
    registered = next;
    return () => {
      const next = new Map(registered);
      next.delete(id);
      registered = next;
    };
  }
  function requestOpen(next: boolean, index = current) {
    const before = opened;
    innerOpen = next;
    if (next !== before)
      config.onOpenChange?.(next, { current: index });
  }
  function fromImage(id: string, source: string | undefined) {
    const before = current;
    innerCurrent = getImagePreviewIndex(entries, id, source, items !== undefined);
    requestOpen(true, before);
    keepOpenIndex = true;
  }
  function change(next: number, previous: number) {
    innerCurrent = next;
    config.onChange?.(next, previous);
  }
  provideImageGroup({ register, preview: fromImage });
</script>

{#if children}{@render children()}{/if}
<ImagePreview open={opened} image={{ url: data.src ?? undefined, alt: data.alt ?? undefined }} config={viewerConfig} {fallback}
  imageAttributes={data} onClose={() => requestOpen(false)} {current} count={entries.length} group onChange={change} countRender={config.countRender} />
