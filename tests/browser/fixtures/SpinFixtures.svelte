<script lang="ts">
  import { ConfigProvider, Drawer, Modal, Spin, ruRU, type SpinSize } from 'antd-svelte';
  import SpinContent from './SpinContent.svelte';

  let spinning = $state(false);
  let delay = $state(0);
  let size = $state<SpinSize | 'inherit'>('medium');
  let description = $state('Loading profile');
  let rich = $state(false);
  let custom = $state(false);
  let hidden = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let translated = $state(false);
  let mounted = $state(true);
  let childPresent = $state(true);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let modalBusy = $state(false);
  let drawerBusy = $state(false);
  let contextSize = $state<'small' | 'middle' | 'large'>('middle');

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    if (event.key === 'z') {
      event.preventDefault();
      spinning = !spinning;
    }
    if (event.key === 'h') {
      event.preventDefault();
      mounted = !mounted;
    }
    if (event.key === 'i') {
      event.preventDefault();
      childPresent = !childPresent;
    }
    if (event.key === 'w') {
      event.preventDefault();
      modalBusy = !modalBusy;
    }
    if (event.key === 'e') {
      event.preventDefault();
      drawerBusy = !drawerBusy;
    }
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .surface { max-width: 640px; padding: 20px; background: var(--ant-color-bg-container); }
  .card { min-height: 180px; padding: 12px; border: 1px solid var(--ant-color-border); }
  .custom { display: block; width: 1em; height: 1em; border: 2px solid currentColor; border-radius: 50%; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet caption()}<strong>Rich loading description</strong>{/snippet}
{#snippet icon()}<span class="custom">★</span>{/snippet}
<section id="spin-fixture" aria-label="Spin fixture">
  <label><input type="checkbox" bind:checked={spinning} /> Spin loading</label>
  <label>Spin delay<select bind:value={delay}><option value={0}>Immediate</option><option
    value={200}
  >200ms</option><option
    value={500}
  >500ms</option><option
    value={-1}
  >Invalid</option></select></label>
  <label>Spin size<select bind:value={size}><option>small</option><option>medium</option><option>large</option><option>inherit</option></select></label>
  <label>Spin provider size<select bind:value={contextSize}><option>small</option><option>middle</option><option>large</option></select></label>
  <label>Spin description<input bind:value={description} /></label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Spin description</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Spin indicator</label>
  <label><input type="checkbox" bind:checked={hidden} /> Decorative Spin</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Spin theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Spin theme</label>
  <label><input type="checkbox" bind:checked={translated} /> Custom Spin locale</label>
  <div class="actions"><button type="button" onclick={() => { mounted = !mounted; }}>Toggle Spin mount</button><button
    type="button"
    onclick={() => { spinning = false; }}
  >Finish Spin loading</button><button
    type="button"
    onclick={() => { spinning = true; }}
  >Start Spin loading</button></div>
  <label>Spin outside input<input value="Outside draft" /></label><button type="button">Before Spin</button>
  <ConfigProvider
    componentSize={contextSize}
    theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}
    locale={translated ? { ...ruRU, spin: { loadingText: 'Custom loading' } } : undefined}
  >
    <div class="surface">
      {#if mounted}<Spin
        {spinning}
        {delay}
        size={size === 'inherit' ? undefined : size}
        description={rich ? caption : description}
        indicator={custom ? icon : undefined}
        aria-hidden={hidden}
        id="fixture-spin"
      /><Spin
        {spinning}
        {delay}
        size={size === 'inherit' ? undefined : size}
        description={rich ? caption : description}
        indicator={custom ? icon : undefined}
        aria-label="Profile content"
        id="fixture-spin-wrapper"
      ><div
        class="card"
      >{#if childPresent}<SpinContent />{:else}<label>Replacement Spin input<input
        value="New child"
      /></label>{/if}</div></Spin>{/if}
    </div>
    <button type="button">After Spin</button>
    <button type="button" onclick={() => { modalOpen = true; }}>Open Spin Modal</button><button
      type="button"
      onclick={() => { drawerOpen = true; }}
    >Open Spin Drawer</button>
    <Modal bind:open={modalOpen} title="Spin host modal"><Spin
      spinning={modalBusy}
      description="Modal loading"
      aria-label="Modal profile"
      id="modal-spin"
    ><label>Modal Spin input<input
      value="Modal draft"
    /></label></Spin><button
      type="button"
      onclick={() => { modalBusy = !modalBusy; }}
    >Toggle Modal Spin</button></Modal>
    <Drawer bind:open={drawerOpen} title="Spin host drawer"><Spin
      spinning={drawerBusy}
      description="Drawer loading"
      aria-label="Drawer profile"
      id="drawer-spin"
    ><label>Drawer Spin input<input
      value="Drawer draft"
    /></label></Spin><button
      type="button"
      onclick={() => { drawerBusy = !drawerBusy; }}
    >Toggle Drawer Spin</button></Drawer>
  </ConfigProvider>
</section>
