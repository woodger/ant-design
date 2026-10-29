<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Image, ImagePreviewGroup, type ImagePreviewGroupItem, type ImagePreviewRenderInfo } from '../../src/lib/components/ant-design';
  import { imageOne, imageTwo } from './image-data';
  let open = $state(false); let changeOnTransform = $state(false); let current = $state(0); let accept = $state(true); let control = $state(false); let explicit = $state(false); let empty = $state(false); let customCount = $state(false); let disabledConfig = $state(false); let visible = $state(true); let reverse = $state(false); let remove = $state(false);
  let events = $state<string[]>([]); let transforms = $state<string[]>([]);
  const items: ImagePreviewGroupItem[] = [{ src: imageTwo, alt: 'Explicit two' }, { src: imageOne, alt: 'Explicit one' }];
  const photos = [{ key: 'one', src: imageOne, alt: 'Group one' }, { key: 'two', src: imageTwo, alt: 'Group two' }, { key: 'copy', src: imageOne, alt: 'Group copy' }];
  let ordered = $derived((reverse ? [...photos].reverse() : photos).filter(item => !remove || item.key === 'one'));
</script>
{#snippet counter(index: number, total: number)}<span>{index} of {total}</span>{/snippet}
{#snippet actions(original: Snippet, info: ImagePreviewRenderInfo)}{@render original()}<button type="button" onclick={() => info.actions.onActive(2)}>Jump two images</button><output aria-label="Group rendered current">{info.current}</output>{/snippet}
<section id="image-group-fixture">
  {#if visible}<ImagePreviewGroup items={explicit ? empty ? [] : items : undefined} preview={disabledConfig ? false : { open, current: control ? current : undefined,
    onOpenChange: (next, info) => { events = [...events, `open:${next}:${info.current}`]; if (accept) open = next; },
    onChange: (next, prev) => { events = [...events, `change:${next}:${prev}`]; if (accept) current = next; },
    onTransform: info => { transforms = [...transforms, `${info.action}:${info.transform.scale}`]; if (changeOnTransform && info.action === 'next') current = 2; }, countRender: customCount ? counter : undefined, actionsRender: customCount ? actions : undefined }}>
    {#each ordered as photo (photo.key)}<Image src={photo.src} alt={photo.alt} width={100} />{/each}
    <Image src={imageTwo} alt="Group disabled" preview={false} width={100} />
  </ImagePreviewGroup>{/if}
  <ImagePreviewGroup><Image src={imageOne} alt="Uncontrolled first" width={80} /><Image src={imageTwo} alt="Uncontrolled second" width={80} /></ImagePreviewGroup>
  <label><input type="checkbox" bind:checked={changeOnTransform} /> Change current in transform callback</label>
  <label><input type="checkbox" bind:checked={accept} /> Accept group changes</label><label><input type="checkbox" bind:checked={control} /> Control group current</label><label><input type="checkbox" bind:checked={explicit} /> Explicit group items</label><label><input type="checkbox" bind:checked={empty} /> Empty group items</label><label><input type="checkbox" bind:checked={customCount} /> Custom group counter</label><label><input type="checkbox" bind:checked={disabledConfig} /> Group false preview config</label>
  <button type="button" onclick={() => { open = true; }}>Open group owner</button><button type="button" onclick={() => { open = false; }}>Close group owner</button><button type="button" onclick={() => { current = 2; }}>Set group owner current</button><button type="button" onclick={() => { reverse = !reverse; }}>Reverse group thumbnails</button><button type="button" onclick={() => { remove = !remove; }}>Remove group thumbnails</button><button type="button" onclick={() => { visible = !visible; }}>Toggle group mount</button>
  <output aria-label="Group events">{JSON.stringify(events)}</output><output aria-label="Group transforms">{JSON.stringify(transforms)}</output><output aria-label="Group owner current">{current}</output>
</section>
