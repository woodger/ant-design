<script lang="ts" generics="T = unknown">
  import { onMount } from 'svelte';
  import type { UploadFile, UploadLocale, UploadProps, UploadListOptions } from './upload.types';
  import { uploadIsImage } from './upload.engine';
  import { previewImage } from './upload-preview.dom';
  import Button from './Button.svelte';
  import UploadIcon from './UploadIcon.svelte';
  import Progress from './Progress.svelte';
  import Tooltip from './Tooltip.svelte';
  let {
    file,
    listType = 'text',
    options,
    locale,
    disabled,
    onRemove,
    onPreview,
    onDownload,
    previewFile = previewImage,
    isImageUrl = uploadIsImage
  }: {
    file: UploadFile<T>;
    listType: UploadProps<T>['listType'];
    options: UploadListOptions<T>;
    locale: Required<UploadLocale>;
    disabled: boolean;
    onRemove: (file: UploadFile<T>) => void;
    onPreview?: UploadProps<T>['onPreview'];
    onDownload?: UploadProps<T>['onDownload'];
    previewFile?: UploadProps<T>['previewFile'];
    isImageUrl?: UploadProps<T>['isImageUrl'];
  } = $props();
  let thumbnail = $state('');
  let showProgress = $state(false);
  let picture = $derived(listType !== 'text');
  let card = $derived(listType === 'picture-card' || listType === 'picture-circle');
  let source = $derived(file.thumbUrl ?? (thumbnail || file.url));
  let image = $derived(isImageUrl({ ...file, thumbUrl: file.thumbUrl ?? thumbnail }));
  let message = $derived(
    typeof file.response === 'string'
    && file.response
    || (file.error && 'message' in file.error
      ? file.error.message
      : undefined)
    || locale.uploadError
  );
  function show(
    flag: boolean | ((file: UploadFile<T>) => boolean) | undefined,
    fallback: boolean
  ) {
    return typeof flag === 'function' ? flag(file) : flag ?? fallback;
  }
  function preview(event: MouseEvent) {
    if (onPreview) {
      event.preventDefault();
      onPreview(file);
    }
  }
  function download() {
    if (onDownload)
      onDownload(file); else if (file.url)
      window.open(file.url, '_blank', 'noopener');
  }
  onMount(() => {
    const timer = setTimeout(() => {
      showProgress = true;
    }, 300);
    return () => clearTimeout(timer);
  });
  $effect(() => {
    thumbnail = '';
    const original = file.originFileObj;
    if (!picture || file.thumbUrl !== undefined || !original) return;
    let active = true;
    void Promise.resolve(previewFile(original)).then(value => {
      if (active)
        thumbnail = value || '';
    });
    return () => {
      active = false;
    };
  });
</script>
<style>
  .ant-upload-list-item-container :global(.ant-tooltip-trigger) { display:block; }
  button.ant-upload-list-item-name { padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:inherit;cursor:pointer; }
  .ant-upload-list-item-name:focus-visible { outline:2px solid var(--ant-color-primary); }
</style>
{#snippet fileIcon()}{#if file.status === 'uploading'}{#if card}{locale.uploading}{:else}<UploadIcon name="loading" />{/if}{:else}<UploadIcon name={picture ? image ? 'picture' : 'file' : 'paper-clip'} />{/if}{/snippet}
{#snippet downloadIcon()}<UploadIcon name="download" />{/snippet}
{#snippet removeIcon()}<UploadIcon name="delete" />{/snippet}
{#snippet actions()}
  {#if card && show(options.showPreviewIcon, true) && source}<a href={file.url || source} target="_blank" rel="noopener noreferrer" aria-label={locale.previewFile} title={locale.previewFile} onclick={preview}><UploadIcon name="eye" /></a>{/if}
  {#if show(options.showDownloadIcon, false) && file.status === 'done'}<Button type="text" size="small" class="ant-upload-list-item-action" disabled={false} aria-label={locale.downloadFile} title={locale.downloadFile} onclick={download} icon={downloadIcon} />{/if}
  {#if show(options.showRemoveIcon, !disabled)}<Button type="text" size="small" class="ant-upload-list-item-action" {disabled} aria-label={locale.removeFile} title={locale.removeFile} onclick={() => onRemove(file)} icon={removeIcon} />{/if}
{/snippet}
{#snippet item()}
<div class={[
    'ant-upload-list-item',
    `ant-upload-list-item-${file.status ?? 'undefined'}`
  ]}>
  {#if picture}
    {#if file.status === 'uploading' || !source}<div class={[
        'ant-upload-list-item-thumbnail',
        file.status !== 'uploading' && 'ant-upload-list-item-file'
      ]}>{@render fileIcon()}</div>
    {:else}<a class={[
        'ant-upload-list-item-thumbnail',
        !image && 'ant-upload-list-item-file'
      ]} href={file.url || source} target="_blank" rel="noopener noreferrer" onclick={preview}>{#if image}<img class="ant-upload-list-item-image" src={source} alt={file.name} crossorigin={file.crossOrigin} />{:else}{@render fileIcon()}{/if}</a>{/if}
  {:else}<div class="ant-upload-icon">{@render fileIcon()}</div>{/if}
  {#if file.url}<a class="ant-upload-list-item-name" title={file.name} href={file.url} target="_blank" rel="noopener noreferrer" onclick={preview}>{file.name}{#if options.extra}<span class="ant-upload-list-item-extra">{@render options.extra(file)}</span>{/if}</a>
  {:else if onPreview}<button type="button" class="ant-upload-list-item-name" title={file.name} onclick={() => onPreview?.(file)}>{file.name}{#if options.extra}<span class="ant-upload-list-item-extra">{@render options.extra(file)}</span>{/if}</button>
  {:else}<span class="ant-upload-list-item-name" title={file.name}>{file.name}{#if options.extra}<span class="ant-upload-list-item-extra">{@render options.extra(file)}</span>{/if}</span>{/if}
  {#if !card || file.status !== 'uploading'}<span class={['ant-upload-list-item-actions', listType === 'picture' && 'picture']}>{@render actions()}</span>{/if}
  {#if showProgress && file.status === 'uploading' && file.percent !== undefined}<div class="ant-upload-list-item-progress"><Progress percent={file.percent} size={[-1, 2]} showInfo={false} aria-label={`${locale.uploading} ${file.name}`} /></div>{/if}
</div>
{/snippet}
<div class="ant-upload-list-item-container">{#if file.status === 'error'}<Tooltip title={message}>{@render item()}</Tooltip>{:else}{@render item()}{/if}</div>
