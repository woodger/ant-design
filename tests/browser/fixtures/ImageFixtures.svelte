<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    Image,
    Modal,
    Button,
    type ImageTransform,
    type ImageTransformAction,
    type ImagePreviewRenderInfo,
    type ImageInfo
  } from 'antd-svelte';
  import { imageOne, imageTwo, imageInvalid } from './image-data';

  let open = $state(false);
  let accept = $state(true);
  let preview = $state(true);
  let visible = $state(true);
  let wheel = $state(true);
  let movable = $state(true);
  let trap = $state(true);
  let maskClosable = $state(true);
  let mask = $state(true);
  let blur = $state(false);
  let custom = $state(false);
  let openings = $state<boolean[]>([]);
  let after = $state<boolean[]>([]);
  let transforms = $state<{ transform: ImageTransform; action: ImageTransformAction }[]>([]);
  let alternate = $state<string>();
  let source = $state(imageOne);
  let slowSource = $state(imageOne);
  let errors = $state(0);
  let loads = $state(0);
  let modal = $state(false);
</script>
{#snippet placeholder()}<span>Image loading</span>{/snippet}
{#snippet customActions(original: Snippet, info: ImagePreviewRenderInfo)}{@render original()}<button
  type="button"
  onclick={info.actions.onReset}
>Reset transform</button><output
  aria-label="Rendered image transform"
>{JSON.stringify(info.transform)}</output>{/snippet}
{#snippet customImage(original: Snippet, info: { transform: ImageTransform; image: ImageInfo; current?: number })}<div
  class="custom-image-content"
  style="display:flex;align-items:center;justify-content:center;max-width:90%;height:70%"
  data-image-width={info.image.width}
>{@render original()}</div>{/snippet}
<section id="image-fixture">
  {#if visible}<Image
    alt="Photo one"
    src={source}
    width={160}
    height={100}
    fallback={imageTwo}
    preview={preview
      ? {
        src: alternate,
        open,
        onOpenChange: next => {
          openings = [...openings, next];
          if (accept) open = next;
        },
        afterOpenChange: next => { after = [...after, next]; },
        onTransform: info => { transforms = [...transforms, info]; },
        wheel,
        movable,
        focusTrap: trap,
        mask: { enabled: mask, blur, closable: maskClosable },
        maxScale: 2.25,
        actionsRender: custom ? customActions : undefined,
        imageRender: custom ? customImage : undefined
      }
      : false}
    onError={() => { errors++; }}
    onLoad={() => { loads++; }}
  />{/if}
  <Image alt="Uncontrolled photo" src={imageTwo} width={120} />
  <Image alt="Passive photo" src={imageOne} preview={false} width={100} />
  <Image
    alt="Loading photo"
    src={slowSource}
    width={160}
    height={100}
    {placeholder}
    fallback={imageTwo}
  />
  <Image alt="Standalone placeholder" width={100} height={70} {placeholder} />
  <button type="button" onclick={() => { modal = true; }}>Open image modal</button>
  <Modal bind:open={modal} title="Image host modal" footer={null}><Image
    alt="Modal photo"
    src={imageOne}
    width={120}
  /><Button
    onclick={() => { modal = false; }}
  >Close image host</Button></Modal>
  <label><input type="checkbox" bind:checked={accept} /> Accept image changes</label><label><input
    type="checkbox"
    bind:checked={preview}
  /> Enable image preview</label><label><input
    type="checkbox"
    bind:checked={wheel}
  /> Image wheel</label><label><input
    type="checkbox"
    bind:checked={movable}
  /> Image movable</label><label><input
    type="checkbox"
    bind:checked={trap}
  /> Image focus trap</label><label><input
    type="checkbox"
    bind:checked={maskClosable}
  /> Image mask closable</label><label><input
    type="checkbox"
    bind:checked={mask}
  /> Image mask</label><label><input
    type="checkbox"
    bind:checked={blur}
  /> Image blur</label><label><input
    type="checkbox"
    bind:checked={custom}
  /> Custom image actions</label>
  <button type="button" onclick={() => { alternate = imageTwo; }}>Use alternate preview</button>
  <button type="button" onclick={() => { source = imageInvalid; }}>Break image source</button><button
    type="button"
    onclick={() => { source = imageOne; }}
  >Restore image source</button><button
    type="button"
    onclick={() => { source = '/fixture-image-stale.svg'; }}
  >Set stale image source</button><button
    type="button"
    onclick={() => { slowSource = '/fixture-image-slow.svg'; }}
  >Load slow image</button><button
    type="button"
    onclick={() => { open = true; }}
  >Open image owner</button><button
    type="button"
    onclick={() => { open = false; }}
  >Close image owner</button><button
    type="button"
    onclick={() => { visible = !visible; }}
  >Toggle image mount</button>
  <output aria-label="Image openings">{JSON.stringify(openings)}</output><output
    aria-label="Image after openings"
  >{JSON.stringify(after)}</output><output
    aria-label="Image transforms"
  >{JSON.stringify(transforms)}</output><output
    aria-label="Image errors"
  >{errors}</output><output
    aria-label="Image loads"
  >{loads}</output>
</section>
