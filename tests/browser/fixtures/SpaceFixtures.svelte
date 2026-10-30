<script lang="ts">
  import { Space } from 'antd-svelte';
  import { ConfigProvider } from 'antd-svelte';
  import type { SpaceOrientation, SpaceProps, SpaceSize } from 'antd-svelte';

  let orientation = $state<SpaceOrientation>('horizontal');
  let preset = $state('small');
  let horizontal = $state(12);
  let vertical = $state(24);
  let align = $state<SpaceProps['align']>();
  let wrap = $state(false);
  let override = $state(false);
  let separator = $state(false);
  let empty = $state(false);
  let reversed = $state(false);
  let firstVisible = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let clicks = $state(0);
  let submissions = $state(0);
  let base = $derived<NonNullable<SpaceProps['items']>>([
    ...firstVisible ? [{ key: 'first', children: first }] : [],
    { key: 'draft', children: draft },
    ...empty ? [null, false, '', 0, true, emptyContent] : []
  ]);
</script>

<svelte:window
  onkeydown={event => {
    if (event.key === 'F4') reversed = !reversed;
    if (event.key === 'F5') firstVisible = !firstVisible;
  }}
/>
{#snippet emptyContent()}{/snippet}
{#snippet first()}<button type="button" onclick={() => { clicks++; }}>Space action {clicks}</button>{/snippet}
{#snippet draft()}<label>Space draft <input aria-label="Space draft" value="Initial draft" /></label>{/snippet}
<section id="space-fixture" aria-label="Space fixture">
  <label>Space orientation <select aria-label="Space orientation" bind:value={orientation}><option>horizontal</option><option>vertical</option></select></label>
  <label>Space size <select aria-label="Space size" bind:value={preset}><option>small</option><option>medium</option><option>large</option><option>custom</option></select></label>
  <label>Space horizontal gap <input type="number" bind:value={horizontal} /></label>
  <label>Space vertical gap <input type="number" bind:value={vertical} /></label>
  <label>Space alignment <select aria-label="Space alignment" bind:value={align}><option
    value={undefined}
  >Default</option><option>start</option><option>end</option><option>center</option><option>baseline</option></select></label>
  <label><input type="checkbox" bind:checked={wrap} /> Wrap Space</label>
  <label><input type="checkbox" bind:checked={override} /> Override Space style</label>
  <label><input type="checkbox" bind:checked={separator} /> Space separator</label>
  <label><input type="checkbox" bind:checked={empty} /> Include empty Space values</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Space</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Space</label>
  <ConfigProvider componentSize="large" theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Space
        id="fixture-space"
        items={reversed ? [...base].reverse() : base}
        {orientation}
        {align}
        {wrap}
        size={preset === 'custom' ? [horizontal, vertical] : preset as SpaceSize}
        separator={separator ? '|' : undefined}
        styles={{ item: 'color:rgb(1, 2, 3)', separator: 'color:rgb(4, 5, 6)' }}
        style={override ? 'gap:99px;flex-wrap:nowrap' : undefined}
      />
      <button type="button">After Space</button>
    </form>
  </ConfigProvider>
  <output aria-label="Space submissions">{submissions}</output>
</section>
