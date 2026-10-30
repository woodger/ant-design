<script lang="ts" generics="T = unknown">
  import { onDestroy, untrack } from 'svelte';
  import type { UploadProps, UploadFile } from './upload.types';
  import { createUploadController } from './upload-controller.engine';
  import { filterUploadFile } from './upload.engine';
  import { uploadRequest } from './upload-request.dom';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import UploadListItem from './UploadListItem.svelte';
  let {
    fileList,
    defaultFileList = [],
    name = 'file',
    action = '',
    method = 'post',
    data = {},
    headers,
    withCredentials,
    accept = '',
    multiple = false,
    capture,
    disabled,
    beforeUpload,
    customRequest,
    onChange,
    onRemove,
    onDrop,
    onPreview,
    onDownload,
    maxCount,
    openFileDialogOnClick = true,
    hasControlInside = true,
    showUploadList = true,
    listType = 'text',
    locale,
    type = 'select',
    previewFile,
    isImageUrl,
    children,
    id,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...attributes
  }: UploadProps<T> = $props();
  const config = useConfig();
  const form = useForm();
  const generatedId = $props.id();
  let counter = 0;
  let internalList = $state.raw<UploadFile<T>[]>(untrack(() => [...defaultFileList]));
  let files = $derived(fileList ?? internalList);
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let dragState = $state(false);
  let strings = $derived(
    {
      uploading: 'Uploading...',
      removeFile: 'Remove file',
      downloadFile: 'Download file',
      previewFile: 'Preview file',
      uploadError: 'Upload error',
      ...config.locale.upload,
      ...locale
    }
  );
  let listOptions = $derived(typeof showUploadList === 'object' ? showUploadList : {});
  let card = $derived(listType === 'picture-card' || listType === 'picture-circle');
  const controller = createUploadController({
    props: () => ({
      name,
      action,
      method,
      data,
      headers,
      withCredentials,
      beforeUpload,
      customRequest,
      onChange,
      onRemove,
      maxCount
    }),
    files: () => files,
    setFiles: next => {
      if (fileList === undefined)
        internalList = next;
    },
    defaultRequest: uploadRequest,
    uid: () => `rc-upload-${generatedId}-${++counter}`
  });
  onDestroy(controller.dispose);
  export function abort(file?: UploadFile<T> | string) {
    controller.abort(file);
  }
  function openDialog(event: MouseEvent | KeyboardEvent) {
    if (blocked || !openFileDialogOnClick || !children || event.defaultPrevented) return;
    if (event instanceof KeyboardEvent) {
      if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
    }
    inputElement?.click();
  }
  function changed(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    const selected = [...event.currentTarget.files ?? []].filter(
      file => filterUploadFile(file, accept, false)
    );
    event.currentTarget.value = '';
    void controller.upload(selected);
  }
  function drag(event: DragEvent) {
    event.preventDefault();
    dragState = !blocked && event.type === 'dragover';
    if (event.type !== 'drop') return;
    onDrop?.(event);
    if (blocked) return;
    const all = [...event.dataTransfer?.files ?? []];
    // rc-upload 1.1.1 в single drop берёт первый исходный файл до accept filtering.
    const selected = multiple
      ? all.filter(file => filterUploadFile(file, accept, true))
      : all.slice(0, 1);
    void controller.upload(selected);
  }
</script>
<style>
  .ant-upload:focus-visible { outline:2px solid var(--ant-color-primary);outline-offset:2px; }
</style>
{#snippet trigger()}
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex — tabindex появляется только вместе с role=button. -->
  <span class={[
      'ant-upload',
      type === 'drag' && 'ant-upload-btn',
      blocked && 'ant-upload-disabled'
    ]} role={hasControlInside ? undefined : 'button'} tabindex={!blocked && !hasControlInside ? 0 : undefined} aria-disabled={blocked || undefined}
    onclick={openDialog} onkeydown={openDialog} ondrop={event => {
        if (type === 'select')
          drag(event);
      }} ondragover={event => event.preventDefault()}>
    <input {...attributes} bind:this={inputElement} id={children && !blocked ? id : undefined} type="file" {name} accept={typeof accept === 'string' ? accept : accept.format} {multiple} {capture} disabled={blocked} style="display:none" onchange={changed} onclick={event => event.stopPropagation()} />
    {#if children}{#if type === 'drag'}<div class="ant-upload-drag-container">{@render children()}</div>{:else}{@render children()}{/if}{/if}
  </span>
{/snippet}
{#snippet list()}
  {#if showUploadList}<div class={`ant-upload-list ant-upload-list-${listType}`}>
    {#each files as file (file.uid)}<UploadListItem {file} {listType} options={listOptions} locale={strings} disabled={blocked} onRemove={file => {
        void controller.remove(file);
      }} {onPreview} {onDownload} {previewFile} {isImageUrl} />{/each}
    {#if card && children}{@render selectTrigger()}{/if}
  </div>{/if}
{/snippet}
{#snippet selectTrigger()}
  <div class={[
      'ant-upload ant-upload-select',
      blocked && 'ant-upload-disabled',
      !children && 'ant-upload-hidden'
    ]} {style}>{@render trigger()}</div>
{/snippet}
<span bind:this={nativeElement} dir={config.direction} class={[
    'ant-upload-wrapper ant-upload-css-var',
    config.direction === 'rtl' && 'ant-upload-rtl',
    card && `ant-upload-${listType}-wrapper`,
    className,
    rootClassName
  ]}>
  {#if type === 'drag'}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class={[
        'ant-upload ant-upload-drag',
        files.some(file => file.status === 'uploading') && 'ant-upload-drag-uploading',
        dragState && 'ant-upload-drag-hover',
        blocked && 'ant-upload-disabled',
        config.direction === 'rtl' && 'ant-upload-rtl'
      ]} {style} ondrop={drag} ondragover={drag} ondragleave={drag}>{@render trigger()}</div>
    {@render list()}
  {:else}
    {#if !card || !showUploadList}{@render selectTrigger()}{/if}{@render list()}
  {/if}
</span>
