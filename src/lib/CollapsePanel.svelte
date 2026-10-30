<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    id,
    labelledBy,
    itemKey,
    open,
    region,
    children,
    forceRender = false,
    destroyOnHidden = false
  }: {
    id: string;
    labelledBy: string;
    itemKey: string;
    open: boolean;
    region: boolean;
    children?: Snippet;
    forceRender?: boolean;
    destroyOnHidden?: boolean;
  } = $props();
  let mounted = $state(false);
  let renderContent = $derived(open || forceRender || mounted && !destroyOnHidden);

  // История фактического монтирования сохраняет панель без копирования open через effect.
  function rememberContent() {
    mounted = true;
    return () => {
      mounted = false;
    };
  }
</script>

<style>
  .ant-collapse-panel { min-width: 0; overflow-wrap: anywhere; }
  .ant-collapse-panel[hidden] { display: none; }
</style>

<div {id} role={region ? 'region' : undefined} aria-labelledby={region ? labelledBy : undefined} hidden={!open} data-collapse-panel={itemKey} class={['ant-collapse-panel', !open && 'ant-collapse-panel-hidden']}>
  {#if renderContent}<div class="ant-collapse-body" {@attach rememberContent}>{@render children?.()}</div>{/if}
</div>
