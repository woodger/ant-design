<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import type {
    ImageElementData,
    ImageInfo,
    ImagePreviewConfig,
    ImagePreviewRenderInfo,
    ImageTransform,
    ImageTransformAction
  } from './image.types';
  import { initialImageTransform, zoomImage, type ImagePoint } from './image-preview.engine';
  import {
    connectImagePreview,
    registerImagePreview,
    isTopImagePreview
  } from './image-preview.dom';
  import { checkImageSource } from './image-status.dom';
  import { useConfig } from './config-context';
  import NoCompactStyle from './NoCompactStyle.svelte';
  import ImagePreviewIcon from './ImagePreviewIcon.svelte';

  let {
    open,
    image,
    config: preview = {},
    fallback,
    imageAttributes = {},
    onClose,
    current = 0,
    count = 1,
    group = false,
    onChange,
    countRender
  }: {
    open: boolean;
    image: ImageInfo;
    config?: ImagePreviewConfig;
    fallback?: string;
    imageAttributes?: ImageElementData;
    onClose: () => void;
    current?: number;
    count?: number;
    group?: boolean;
    onChange?: (next: number, previous: number) => void;
    countRender?: import('svelte').Snippet<[number, number]>;
  } = $props();
  const context = useConfig();
  let dialog = $state<HTMLDialogElement>();
  let element = $state<HTMLImageElement>();
  let mounted = $state(false);
  let transform = $state.raw(initialImageTransform());
  let moving = $state(false);
  let failed = $state(false);
  let originalSource = $derived(image.url);
  let source = $derived(failed && fallback ? fallback : originalSource);
  let focusTrap = $derived(preview.focusTrap !== false);
  let mask = $derived(
    typeof preview.mask === 'object' ? preview.mask.enabled !== false : preview.mask !== false
  );
  let maskClosable = $derived(
    typeof preview.mask === 'object' ? preview.mask.closable !== false : true
  );
  let min = $derived(preview.minScale ?? 1);
  let max = $derived(preview.maxScale ?? 50);
  let switchFrame = 0;
  let switchId = 0;
  let switching = $state(false);
  let frame = 0;
  let queue: ImageTransform[] = [];
  let alive = true;
  let opener: HTMLElement | undefined;
  let previousOpen = false;
  let releaseLayer: (() => void) | undefined;
  $effect(() => {
    if (open)
      mounted = true;
  });
  $effect(() => {
    const source = originalSource;
    if (!dialog) return;
    failed = false;
    return checkImageSource(source, dialog.ownerDocument, () => {
      failed = true;
    });
  });
  $effect(() => {
    const next = open;
    const root = dialog;
    const trap = focusTrap;
    if (!root) return;
    untrack(() => {
      if (next && !root.open) {
        const focused = root.ownerDocument.activeElement;
        opener = focused instanceof HTMLElement ? focused : undefined;
        if (trap)
          root.showModal(); else root.show();
        root.focus({ preventScroll: true });
        releaseLayer = registerImagePreview(root);
        previousOpen = true;
        preview.afterOpenChange?.(true);
      } else if (next && root.open && root.matches(':modal') !== trap) {
        root.close();
        if (trap)
          root.showModal(); else root.show();
        root.focus({ preventScroll: true });
      } else if (!next && root.open) {
        root.close();
        releaseLayer?.();
        releaseLayer = undefined;
        cancelFrame();
        stopSwitch();
        reset('close');
        moving = false;
        if (opener?.isConnected)
          opener.focus({ preventScroll: true });
        opener = undefined;
        previousOpen = false;
        preview.afterOpenChange?.(false);
      }
    });
  });
  $effect(() => {
    if (!open || !element) return;
    const target = element;
    return connectImagePreview(target, {
      config: () => preview,
      transform: () => transform,
      update,
      zoom,
      moving: next => {
        moving = next;
      }
    });
  });
  $effect(() => {
    if (!open || !dialog) return;
    const view = dialog.ownerDocument.defaultView!;
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented || !dialog?.open || !isTopImagePreview(dialog)) return;
      const active = dialog.ownerDocument.activeElement;
      if (focusTrap && active && !dialog.contains(active)) return;
      if (group && count > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'))
        activate(event.key === 'ArrowLeft' ? -1 : 1);
      else if (event.key === 'Escape' && !focusTrap) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
    view.addEventListener('keydown', keydown);
    return () => view.removeEventListener('keydown', keydown);
  });
  onDestroy(() => {
    alive = false;
    cancelFrame();
    stopSwitch();
    releaseLayer?.();
    if (dialog?.open)
      dialog.close();
    if (previousOpen && opener?.isConnected)
      opener.focus({ preventScroll: true });
  });

  function cancelFrame() {
    if (frame)
      cancelAnimationFrame(frame);
    frame = 0;
    queue = [];
  }
  function update(patch: Partial<ImageTransform>, action: ImageTransformAction) {
    queue.push({ ...transform, ...patch });
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!alive || !open) {
          queue = [];
          return;
        }
        transform = Object.assign({}, transform, ...queue);
        queue = [];
        preview.onTransform?.({ transform: { ...transform }, action });
      });
  }
  function reset(action: ImageTransformAction) {
    const initial = initialImageTransform();
    if (Object.keys(initial).some(
      key => initial[key as keyof ImageTransform] !== transform[key as keyof ImageTransform]
    )) {
      transform = initial;
      preview.onTransform?.({ transform: { ...initial }, action });
    }
  }
  function zoom(ratio: number, action: ImageTransformAction, center?: ImagePoint, touch = false) {
    if (!element) return;
    const viewport = {
      width: element.ownerDocument.documentElement.clientWidth,
      height: element.ownerDocument.defaultView!.innerHeight
    };
    update(zoomImage(transform, ratio, element, viewport, min, max, center, touch), action);
  }
  function stopSwitch() {
    switchId++;
    if (switchFrame)
      cancelAnimationFrame(switchFrame);
    switchFrame = 0;
    switching = false;
  }
  function activate(offset: number) {
    const before = current;
    const next = before + offset;
    if (next < 0 || next >= count) return;
    stopSwitch();
    switching = true;
    const id = switchId;
    cancelFrame();
    reset(offset < 0 ? 'prev' : 'next');
    onChange?.(next, before);
    void tick().then(() => {
      if (!alive || !open || id !== switchId) return;
      switchFrame = requestAnimationFrame(() => {
        if (!alive || id !== switchId) return;
        switchFrame = requestAnimationFrame(() => {
          switchFrame = 0;
          if (alive && id === switchId)
            switching = false;
        });
      });
    });
  }
  let info = $derived<ImagePreviewRenderInfo>({
    transform,
    current,
    total: count,
    image,
    actions: {
      onActive: activate,
      onFlipY: () => update({ flipY: !transform.flipY }, 'flipY'),
      onFlipX: () => update({ flipX: !transform.flipX }, 'flipX'),
      onRotateLeft: () => update({ rotate: transform.rotate - 90 }, 'rotateLeft'),
      onRotateRight: () => update({ rotate: transform.rotate + 90 }, 'rotateRight'),
      onZoomOut: () => zoom(1 / (1 + (preview.scaleStep ?? 0.5)), 'zoomOut'),
      onZoomIn: () => zoom(1 + (preview.scaleStep ?? 0.5), 'zoomIn'),
      onClose,
      onReset: () => {
        cancelFrame();
        reset('reset');
      }
    }
  });
</script>

<style>
  :global(html:has(dialog.image-preview-dialog[open])) { overflow: hidden; }
  .image-preview-dialog { position: fixed; inset: 0; width: 100%; height: 100%; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: transparent; overflow: hidden; color: var(--ant-color-text-light-solid); }
  .image-preview-dialog:not([open]) { display: none; }
  .image-preview-dialog::backdrop { background: transparent; }
  .ant-image-preview-img { touch-action: none; }
  .ant-image-preview-img.moving { transition-duration: 0s; }
  .ant-image-preview-actions-action:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .image-preview-dialog .ant-image-preview-img { transition: none; } }
</style>

{#snippet defaultImage()}
  {#key source}<img {...imageAttributes} bind:this={element} src={source || undefined} alt={image.alt} draggable="false" class={['ant-image-preview-img', moving && 'moving']}
    style={`transform:translate3d(${transform
        .x}px,${transform
          .y}px,0) scale3d(${transform
            .flipX
            ? '-'
            : ''}${transform.scale},${transform.flipY
              ? '-'
              : ''}${transform.scale},1) rotate(${transform.rotate}deg);${switching
                ? 'transition-duration:0s;'
                : ''}`}
    onerror={event => {
        if (event.currentTarget === element)
          failed = true;
      }} />{/key}
{/snippet}
{#snippet defaultActions()}
  <div class="ant-image-preview-actions">
    {#each [
        'flipY',
        'flipX',
        'rotateLeft',
        'rotateRight',
        'zoomOut',
        'zoomIn'
      ] as action}
      <button type="button" aria-label={action} class={[
          'ant-image-preview-actions-action',
          `ant-image-preview-actions-action-${action}`,
          (action === 'zoomOut'
            && transform.scale <= min
            || action === 'zoomIn'
            && transform.scale === max)
          && 'ant-image-preview-actions-action-disabled'
        ]}
        disabled={action === 'zoomOut'
            && transform.scale <= min
            || action === 'zoomIn'
            && transform.scale === max}
        onclick={() => {
            if (action === 'flipY')
              info.actions.onFlipY(); else if (action === 'flipX')
              info.actions.onFlipX(); else if (action === 'rotateLeft')
              info.actions.onRotateLeft(); else if (action === 'rotateRight')
              info.actions.onRotateRight(); else if (action === 'zoomOut')
              info.actions.onZoomOut(); else info.actions.onZoomIn();
          }}>
        <ImagePreviewIcon name={action as
            'flipY'
            | 'flipX'
            | 'rotateLeft'
            | 'rotateRight'
            | 'zoomOut'
            | 'zoomIn'} />
      </button>
    {/each}
  </div>
{/snippet}
{#if mounted}
  <NoCompactStyle>
    <dialog bind:this={dialog} tabindex="-1" class={[
        'image-preview-dialog ant-image-preview ant-image-css-var',
        preview.rootClassName,
        preview.movable !== false && 'ant-image-preview-movable',
        moving && 'ant-image-preview-moving'
      ]}
      dir={context.direction} aria-label={image.alt || context.locale.image?.preview || 'Image preview'} aria-modal={focusTrap ? 'true' : undefined}
      style={preview.zIndex === undefined
          ? undefined
          : `z-index:${preview.zIndex};`} oncancel={event => {
              event.preventDefault();
              onClose();
            }}>
      <div class={[
          'ant-image-preview-mask',
          !mask && 'ant-image-preview-mask-hidden',
          typeof preview.mask === 'object' && preview.mask.blur && 'ant-image-preview-mask-blur'
        ]}
        role="presentation" onclick={() => {
            if (maskClosable)
              onClose();
          }}></div>
      <div class="ant-image-preview-body">
        {#if preview.imageRender}{@render preview.imageRender(
            defaultImage,
            { transform, image, ...(group ? { current } : {}) }
          )}{:else}{@render defaultImage()}{/if}
      </div>
      {#if preview.closeIcon !== false && preview.closeIcon !== null}<button type="button" class="ant-image-preview-close" aria-label={context.locale.closeText} onclick={onClose}>
        {#if typeof preview.closeIcon === 'function'}{@render preview.closeIcon()}{:else}<ImagePreviewIcon name="close" />{/if}
      </button>{/if}
      {#if group && count > 1}
        <button type="button" class={[
            'ant-image-preview-switch ant-image-preview-switch-prev',
            current === 0 && 'ant-image-preview-switch-disabled'
          ]} aria-label="prev" disabled={current === 0} onclick={() => activate(-1)}><ImagePreviewIcon name={context.direction === 'rtl' ? 'next' : 'prev'} /></button>
        <button type="button" class={[
            'ant-image-preview-switch ant-image-preview-switch-next',
            current === count - 1 && 'ant-image-preview-switch-disabled'
          ]} aria-label="next" disabled={current === count - 1} onclick={() => activate(1)}><ImagePreviewIcon name={context.direction === 'rtl' ? 'prev' : 'next'} /></button>
      {/if}
      <div class="ant-image-preview-footer">
        {#if group && count >= 1}<div class="ant-image-preview-progress">{#if countRender}{@render countRender(current + 1, count)}{:else}<bdi>{current + 1} / {count}</bdi>{/if}</div>{/if}
        {#if preview.actionsRender}{@render preview.actionsRender(defaultActions, info)}{:else}{@render defaultActions()}{/if}
      </div>
    </dialog>
  </NoCompactStyle>
{/if}
