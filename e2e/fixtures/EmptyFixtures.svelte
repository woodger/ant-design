<script lang="ts">
  import { tick } from 'svelte';
  import { ConfigProvider, Drawer, Empty, Modal } from '../../src/lib/components/ant-design';

  let image = $state<'default' | 'simple' | 'custom' | 'none'>('default');
  let description = $state('No records');
  let descriptionMode = $state<'text' | 'rich' | 'none' | 'locale'>('text');
  let actions = $state(true);
  let primary = $state(true);
  let mounted = $state(true);
  let ownerFocus = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let translated = $state(false);
  let labelled = $state(false);
  let actionsCount = $state(0);
  let modalOpen = $state(false);
  let modalEmpty = $state(true);
  let drawerOpen = $state(false);
  let drawerEmpty = $state(true);
  async function remove() { mounted = false; await tick(); if (ownerFocus) document.getElementById('empty-owner-input')?.focus({ preventScroll: true }); }
  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
    if (event.key === 'E') { event.preventDefault(); mounted = !mounted; }
    if (event.key === 'R') { event.preventDefault(); primary = !primary; }
    if (event.key === 'T') { event.preventDefault(); actions = !actions; }
    if (event.key === 'Y') { event.preventDefault(); modalEmpty = !modalEmpty; }
    if (event.key === 'U') { event.preventDefault(); drawerEmpty = !drawerEmpty; }
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label { display: block; margin-block: 8px; }
  .surface { max-width: 640px; padding: 20px; background: var(--ant-color-bg-container); }
  .custom-image { width: 120px; height: 80px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet customImage()}<svg class="custom-image" viewBox="0 0 120 80"><rect x="10" y="10" width="100" height="60" rx="8" fill="var(--ant-color-primary-bg)" stroke="var(--ant-color-primary-border)" /></svg><a href="#empty-fixture">Decorative image link</a>{/snippet}
{#snippet richDescription()}<strong>{description}</strong><br /><span>Rich empty details</span>{/snippet}
{#snippet footer()} {#if primary}<button type="button" onclick={() => { actionsCount++; }}>Empty primary action</button>{/if}<button type="button" onclick={() => { actionsCount++; }}>Empty secondary action</button><button type="button" onclick={() => { void remove(); }}>Remove Empty</button>{/snippet}
<section id="empty-fixture" aria-label="Empty fixture">
  <label>Empty image<select bind:value={image}><option>default</option><option>simple</option><option>custom</option><option>none</option></select></label>
  <label>Empty description<input bind:value={description} /></label>
  <label>Empty description mode<select bind:value={descriptionMode}><option>text</option><option>rich</option><option>none</option><option>locale</option></select></label>
  <label><input type="checkbox" bind:checked={actions} /> Empty actions</label>
  <label><input type="checkbox" bind:checked={ownerFocus} /> Empty owner focus</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Empty theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Empty theme</label>
  <label><input type="checkbox" bind:checked={translated} /> Custom Empty locale</label>
  <label><input type="checkbox" bind:checked={labelled} /> Label Empty by owner</label>
  <label>Empty outside input<input id="empty-owner-input" value="Outside draft" /></label>
  <button type="button" onclick={() => { mounted = !mounted; }}>Toggle Empty mount</button>
  <p id="empty-owner-label">Empty owner title</p><p id="empty-hint">Empty state hint</p><button type="button">Before Empty</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} locale={translated ? { empty: { description: 'Custom empty description' } } : undefined}>
    <div class="surface">
      {#if mounted}<Empty id="fixture-empty" image={image === 'custom' ? customImage : image === 'none' ? false : image} description={descriptionMode === 'locale' ? undefined : descriptionMode === 'none' ? false : descriptionMode === 'rich' ? richDescription : description} children={actions ? footer : undefined} aria-label={labelled ? undefined : 'Empty records'} aria-labelledby={labelled ? 'empty-owner-label' : undefined} aria-describedby="empty-hint" />{/if}
      <Empty id="empty-simple-peer" image="simple" description="Simple peer" />
    </div>
    <button type="button">After Empty</button><button type="button" onclick={() => { modalOpen = true; modalEmpty = true; }}>Open Empty Modal</button><button type="button" onclick={() => { drawerOpen = true; drawerEmpty = true; }}>Open Empty Drawer</button>
    <Modal bind:open={modalOpen} title="Empty host modal">{#if modalEmpty}<Empty image="simple" aria-label="Modal empty records"><button type="button" onclick={() => { modalEmpty = false; }}>Fill Modal Empty</button></Empty>{:else}<p>Modal content loaded</p>{/if}<button type="button">After Modal Empty</button></Modal>
    <Drawer bind:open={drawerOpen} title="Empty host drawer">{#if drawerEmpty}<Empty image="simple" aria-label="Drawer empty records"><button type="button" onclick={() => { drawerEmpty = false; }}>Fill Drawer Empty</button></Empty>{:else}<p>Drawer content loaded</p>{/if}<button type="button">After Drawer Empty</button></Drawer>
  </ConfigProvider>
  <output aria-label="Empty actions count">{actionsCount}</output>
</section>
