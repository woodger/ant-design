<script lang="ts" generics="T = unknown">
  import Upload from './Upload.svelte';
  import type { UploadDraggerProps, UploadFile } from './upload.types';
  let {
    height,
    style,
    hasControlInside = false,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...props
  }: UploadDraggerProps<
    T
  > = $props();
  let upload: Upload<T>;
  export function abort(file?: UploadFile<T> | string) {
    upload?.abort(file);
  }
</script>
<Upload {...props} type="drag" {hasControlInside} style={[style, height !== undefined
    && `height:${height}px`].filter(Boolean).join(
      ';'
    )} bind:nativeElement bind:inputElement bind:this={upload} />
