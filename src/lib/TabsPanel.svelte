<script lang="ts">
  import type { Snippet } from 'svelte';

  let { id, labelledBy, itemKey, active, children, forceRender = false, destroyOnHidden = false }: { id: string; labelledBy: string; itemKey: string; active: boolean; children?: Snippet; forceRender?: boolean; destroyOnHidden?: boolean } = $props();
  let mounted = $state(false);
  let renderContent = $derived(active || forceRender || mounted && !destroyOnHidden);

  // Запоминаем факт появления содержимого в DOM, а не копию active.
  // После уничтожения панель снова ждёт активации, даже если destroyOnHidden отключат.
  function rememberContent() {
    mounted = true;
    return () => { mounted = false; };
  }
</script>

<style>
  .ant-tabs-content { min-width: 0; overflow-wrap: anywhere; }
  .ant-tabs-content[hidden] { display: none; }
</style>

<div {id} role="tabpanel" aria-labelledby={labelledBy} tabindex={active ? 0 : -1} hidden={!active} data-tabs-key={itemKey} class={['ant-tabs-content', !active && 'ant-tabs-content-hidden']}>
  {#if renderContent}<div class="ant-tabs-content-inner" {@attach rememberContent}>{@render children?.()}</div>{/if}
</div>
