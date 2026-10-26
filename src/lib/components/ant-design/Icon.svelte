<script lang="ts">
  let { name }: { name: 'down' | 'close' | 'check' | 'loading' } = $props();
</script>

<style>
  svg { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
  .loading { animation: ant-svelte-spin 1s linear infinite; }
  @keyframes ant-svelte-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .loading { animation-duration: 2s; } }
</style>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
  class:loading={name === 'loading'}
>
  {#if name === 'down'}
    <path d="m6 9 6 6 6-6" />
  {:else if name === 'close'}
    <path d="m6 6 12 12M6 18 18 6" />
  {:else if name === 'check'}
    <path d="m5 12 4 4L19 6" />
  {:else}
    <path d="M21 12a9 9 0 1 1-9-9" />
  {/if}
</svg>
