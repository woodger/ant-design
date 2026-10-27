<script lang="ts">
  import { ConfigProvider, Drawer, Modal, Skeleton, type SkeletonAvatarSize } from '../../src/lib/components/ant-design';
  import SkeletonContent from './SkeletonContent.svelte';

  let loading = $state(false);
  let animated = $state(false);
  let avatar = $state(false);
  let title = $state(true);
  let paragraph = $state(true);
  let round = $state(false);
  let rows = $state<number | undefined>();
  let titleWidth = $state('');
  let paragraphWidth = $state('');
  let perRow = $state(false);
  let size = $state('auto');
  let shape = $state<'auto' | 'circle' | 'square'>('auto');
  let dark = $state(false);
  let compact = $state(false);
  let translated = $state(false);
  let decorative = $state(false);
  let labelled = $state(false);
  let mounted = $state(true);
  let childPresent = $state(true);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let modalBusy = $state(false);
  let drawerBusy = $state(false);
  let providerSize = $state<'small' | 'middle' | 'large'>('middle');
  let avatarConfig = $derived(avatar ? { size: size === 'auto' ? undefined : size === '64' || size === '1000' ? Number(size) : size as SkeletonAvatarSize, shape: shape === 'auto' ? undefined : shape } : false);
  let titleConfig = $derived(title ? { width: titleWidth || undefined } : false);
  let paragraphConfig = $derived(paragraph ? { rows, width: perRow ? [200, '50%', 0] : paragraphWidth || undefined } : false);
  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
    if (event.key === 'J') { event.preventDefault(); loading = !loading; }
    if (event.key === 'K') { event.preventDefault(); mounted = !mounted; }
    if (event.key === 'L') { event.preventDefault(); childPresent = !childPresent; }
    if (event.key === 'O') { event.preventDefault(); modalBusy = !modalBusy; }
    if (event.key === 'P') { event.preventDefault(); drawerBusy = !drawerBusy; }
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .surface { max-width: 640px; padding: 20px; background: var(--ant-color-bg-container); }
  .preview { margin-bottom: 24px; }
</style>

<svelte:window onkeydown={hotkey} />
<section id="skeleton-fixture" aria-label="Skeleton fixture">
  <label><input type="checkbox" bind:checked={loading} /> Skeleton loading</label>
  <label><input type="checkbox" bind:checked={animated} /> Active Skeleton</label>
  <label><input type="checkbox" bind:checked={avatar} /> Skeleton avatar</label>
  <label><input type="checkbox" bind:checked={title} /> Skeleton title</label>
  <label><input type="checkbox" bind:checked={paragraph} /> Skeleton paragraph</label>
  <label><input type="checkbox" bind:checked={round} /> Round Skeleton</label>
  <label>Skeleton rows<input type="number" bind:value={rows} /></label>
  <label>Skeleton title width<input bind:value={titleWidth} /></label>
  <label>Skeleton paragraph width<input bind:value={paragraphWidth} /></label>
  <label><input type="checkbox" bind:checked={perRow} /> Per-row Skeleton widths</label>
  <label>Skeleton avatar size<select bind:value={size}><option>auto</option><option>small</option><option>medium</option><option>large</option><option>64</option><option>1000</option></select></label>
  <label>Skeleton avatar shape<select bind:value={shape}><option>auto</option><option>circle</option><option>square</option></select></label>
  <label>Skeleton provider size<select bind:value={providerSize}><option>small</option><option>middle</option><option>large</option></select></label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Skeleton theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Skeleton theme</label>
  <label><input type="checkbox" bind:checked={translated} /> Custom Skeleton locale</label>
  <label><input type="checkbox" bind:checked={decorative} /> Decorative Skeleton</label>
  <label><input type="checkbox" bind:checked={labelled} /> Label Skeleton by owner</label>
  <div class="actions"><button type="button" onclick={() => { loading = true; }}>Start Skeleton loading</button><button type="button" onclick={() => { loading = false; }}>Finish Skeleton loading</button><button type="button" onclick={() => { mounted = !mounted; }}>Toggle Skeleton mount</button></div>
  <label>Skeleton outside input<input value="Outside draft" /></label>
  <p id="skeleton-owner-label">Skeleton owner title</p><p id="skeleton-hint">Skeleton profile hint</p><button type="button">Before Skeleton</button>
  <ConfigProvider componentSize={providerSize} theme={{ mode: dark ? 'dark' : 'light', compact }} locale={translated ? { skeleton: { loadingText: 'Custom skeleton loading' } } : undefined}>
    <div class="surface">
      <div class="preview"><Skeleton active={animated} avatar={avatarConfig} title={titleConfig} paragraph={paragraphConfig} {round} aria-hidden id="fixture-skeleton-preview" /></div>
      {#if mounted}<Skeleton {loading} active={animated} avatar={avatarConfig} title={titleConfig} paragraph={paragraphConfig} {round} aria-hidden={decorative} aria-label={labelled ? undefined : 'Profile content'} aria-labelledby={labelled ? 'skeleton-owner-label' : undefined} aria-describedby="skeleton-hint" id="fixture-skeleton"><div>{#if childPresent}<SkeletonContent />{:else}<label>Replacement Skeleton input<input value="Replacement draft" /></label>{/if}</div></Skeleton>{/if}
    </div>
    <button type="button">After Skeleton</button><button type="button" onclick={() => { modalOpen = true; }}>Open Skeleton Modal</button><button type="button" onclick={() => { drawerOpen = true; }}>Open Skeleton Drawer</button>
    <Modal bind:open={modalOpen} title="Skeleton host modal"><Skeleton loading={modalBusy} aria-label="Modal profile" id="modal-skeleton"><label>Modal Skeleton input<input value="Modal draft" /></label></Skeleton><button type="button" onclick={() => { modalBusy = !modalBusy; }}>Toggle Modal Skeleton</button></Modal>
    <Drawer bind:open={drawerOpen} title="Skeleton host drawer"><Skeleton loading={drawerBusy} aria-label="Drawer profile" id="drawer-skeleton"><label>Drawer Skeleton input<input value="Drawer draft" /></label></Skeleton><button type="button" onclick={() => { drawerBusy = !drawerBusy; }}>Toggle Drawer Skeleton</button></Drawer>
  </ConfigProvider>
</section>
