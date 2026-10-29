<script lang="ts">
  import Breadcrumb from '../../src/lib/components/ant-design/Breadcrumb.svelte';
  import ConfigProvider from '../../src/lib/components/ant-design/ConfigProvider.svelte';
  import type { BreadcrumbItem } from '../../src/lib/components/ant-design/breadcrumb.types';
  let id = $state('42');
  let custom = $state(false);
  let separators = $state(true);
  let cancel = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let mounted = $state(true);
  let actions = $state(0);
  let submissions = $state(0);
  let events = $state<string[]>([]);
  let items = $derived<BreadcrumbItem[]>([
    { key: 'home', path: '/home', title: 'Home :id', class: 'home-link', 'data-home': 'yes', onClick: event => { events.push('home'); if (cancel) event.preventDefault(); } },
    { key: 'project', path: ':id', title: 'Project :id', menu: { items: [
      { key: 'layout', path: '/layout', title: 'Layout' },
      { key: 'locked', path: '/locked', title: 'Locked', disabled: true },
      { key: 'general', path: '/general', label: 'General' }
    ], onClick: info => { events.push(`menu:${info.key}`); if (cancel) info.domEvent.preventDefault(); } }, dropdownProps: { trigger: 'click', 'aria-label': 'Breadcrumb sections' } },
    ...separators ? [] : [{ key: 'separator', type: 'separator' as const, separator: ':' }],
    { key: 'current', title: 'Current', onClick: () => { actions++; } }
  ]);
</script>

{#snippet renderItem(item: BreadcrumbItem, params: Record<string, unknown>, routes: readonly BreadcrumbItem[], paths: readonly string[])}
  <a href={`#/${paths.join('/')}`} data-route-count={routes.length} data-param-id={String(params.id)}>{typeof item.title === 'string' ? `Custom ${item.title}` : 'Custom'}</a>
{/snippet}
<section id="breadcrumb-fixture" aria-label="Breadcrumb fixture">
  <label>Breadcrumb parameter <input bind:value={id} /></label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Breadcrumb renderer</label>
  <label><input type="checkbox" bind:checked={separators} /> Automatic Breadcrumb separators</label>
  <label><input type="checkbox" bind:checked={cancel} /> Cancel Breadcrumb navigation</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Breadcrumb</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Breadcrumb</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Breadcrumb</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form onsubmit={event => { event.preventDefault(); submissions++; }}>
      {#if mounted}<Breadcrumb id="fixture-breadcrumb" aria-label="Project breadcrumb" {items} params={{ id }} separator={separators ? '/' : ''} itemRender={custom ? renderItem : undefined}
        classNames={{ item: 'semantic-item', separator: 'semantic-separator' }} styles={{ root: 'padding:1px', item: 'padding:2px', separator: 'padding:3px' }} style="padding:4px" />{/if}
      <button type="button">After Breadcrumb</button>
    </form>
  </ConfigProvider>
  <output aria-label="Breadcrumb events">{JSON.stringify(events)}</output>
  <output aria-label="Breadcrumb actions">{actions}</output>
  <output aria-label="Breadcrumb submissions">{submissions}</output>
</section>
