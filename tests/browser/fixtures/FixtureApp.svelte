<script lang="ts">
  import type { Component } from 'svelte';
  import { ConfigProvider } from 'antd-svelte';
  import { enUS } from 'antd-svelte';
  import catalog from './catalog.json';
  import { resolveFixtureRoute } from './fixture-route';

  const route = resolveFixtureRoute(window.location.search, catalog);
  const modules = import.meta.glob<{ default: Component<Record<string, unknown>> }>('./*.svelte');
  const loaded = route.mode === 'invalid'
    ? undefined
    : modules[route.mode === 'all' ? './Components.svelte' : route.entry.module]();
  let disabled = $state(false);
  let rtl = $state(false);
  let english = $state(false);
</script>

<style>
  :global(body) { margin: 0; }
  .fixtures { max-width: 800px; padding: 24px; }
  label { display: block; margin-block: 8px; }
</style>

{#if route.mode === 'invalid'}
  <main class="fixtures"><h1>Component browser fixtures</h1><p role="alert">Unknown fixture: {route.requested}</p><ul>{#each catalog as entry}<li><a
    href={`?fixture=${entry.id}`}
  >{entry.id}</a></li>{/each}</ul></main>
{:else}
  {#await loaded}<p>Loading fixtures…</p>{:then module}
    {#if module}
      {#if route.mode === 'all'}<module.default />{:else}
        <ConfigProvider
          componentDisabled={disabled}
          direction={rtl ? 'rtl' : 'ltr'}
          locale={english ? enUS : undefined}
        >
          <main class="fixtures"><h1>Component browser fixtures</h1><label><input
            type="checkbox"
            bind:checked={disabled}
          /> Disable all components</label><label><input
            type="checkbox"
            bind:checked={rtl}
          /> Right to left</label><label><input
            type="checkbox"
            bind:checked={english}
          /> English locale</label><module.default
            kind={route.entry.kind}
          /></main>
        </ConfigProvider>
      {/if}
    {/if}
  {:catch error}<p role="alert">Fixture failed to load: {String(error)}</p>{/await}
{/if}
