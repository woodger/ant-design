<script lang="ts">
  import { Card, CardGrid, CardMeta, ConfigProvider } from '../../src/lib/components/ant-design';
  let loading = $state(false);
  let small = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let grids = $state(false);
  let showTabs = $state(false);
  let borderless = $state(false);
  let styled = $state(false);
  let mounted = $state(true);
  let activeTabKey = $state<string | undefined>();
  let changes = $state<string[]>([]);
  let extraClicks = $state(0);
  let submissions = $state(0);
</script>

<svelte:window onkeydown={event => { if (event.key === 'F3') loading = !loading; if (event.key === 'F4') mounted = !mounted; }} />
{#snippet cover()}<div style="height:48px;background:var(--ant-color-primary-bg)">Local cover</div>{/snippet}
{#snippet avatar()}<span aria-label="Card avatar">AD</span>{/snippet}
{#snippet action()}<button type="button" onclick={() => { extraClicks++; }}>Card action</button>{/snippet}
{#snippet left()}<button type="button" onclick={() => { extraClicks++; }}>Left extra</button>{/snippet}
{#snippet right()}<button type="button" onclick={() => { extraClicks++; }}>Right extra</button>{/snippet}
<section id="card-fixture" aria-label="Card fixture">
  <label><input type="checkbox" bind:checked={loading} /> Loading Card</label>
  <label><input type="checkbox" bind:checked={small} /> Small Card</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Card</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Card</label>
  <label><input type="checkbox" bind:checked={grids} /> Card grids</label>
  <label><input type="checkbox" bind:checked={showTabs} /> Card tabs</label>
  <label><input type="checkbox" bind:checked={borderless} /> Borderless Card</label>
  <label><input type="checkbox" bind:checked={styled} /> Styled Card</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Card</label>
  <ConfigProvider componentSize={small ? 'small' : undefined} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form onsubmit={event => { event.preventDefault(); submissions++; }}>
      {#if mounted}
        <Card id="fixture-card" title="Project card" extra={0} {cover} actions={[action, 0]} {loading} bind:activeTabKey
          variant={borderless ? 'borderless' : undefined} bodyStyle="padding:0" headStyle="padding:0"
          styles={styled ? { header: 'padding:10px', body: 'padding:20px', title: 'color:rgb(1, 2, 3)' } : undefined}
          tabList={showTabs ? [{ key: '', tab: 'Alpha' }, { key: 'locked', label: 'Locked', disabled: true }, { key: 'beta', label: 'Beta' }] : undefined}
          defaultActiveTabKey="" tabProps={{ defaultActiveKey: 'beta', 'aria-label': 'Card sections' }} tabBarExtraContent={{ left, right }}
          onTabChange={key => { changes.push(`${key}:${activeTabKey}`); }}>
          {#if grids}
            <CardGrid style="width:50%" hoverable={false}>First grid</CardGrid><CardGrid style="width:50%">Second grid</CardGrid>
          {:else}
            <CardMeta {avatar} title="Card owner" description="Project description" />
            <label>Card draft <input aria-label="Card draft" value="Initial draft" /></label>
          {/if}
        </Card>
      {/if}
      <button type="button">After Card</button>
    </form>
  </ConfigProvider>
  <output aria-label="Card changes">{JSON.stringify(changes)}</output>
  <output aria-label="Card extra clicks">{extraClicks}</output>
  <output aria-label="Card submissions">{submissions}</output>
</section>
