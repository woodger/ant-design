<script lang="ts">
  import { tick } from 'svelte';
  import { CheckableTag, ConfigProvider, Drawer, Modal, Tag, type TagColor, type TagVariant } from '../../src/lib/components/ant-design';

  let color = $state<TagColor>('blue');
  let variant = $state<TagVariant>('filled');
  let text = $state('Frontend');
  let close = $state(true);
  let custom = $state(false);
  let blocked = $state<'inherit' | 'on' | 'off'>('inherit');
  let prevent = $state(false);
  let removeOnClose = $state(false);
  let reenter = $state(false);
  let ownerFocus = $state(false);
  let mounted = $state(true);
  let version = $state(0);
  let closeCount = $state(0);
  let checked = $state(false);
  let accept = $state(true);
  let checkMounted = $state(true);
  let removeOnChange = $state(false);
  let changes = $state<boolean[]>([]);
  let submissions = $state(0);
  let dark = $state(false);
  let compact = $state(false);
  let modalOpen = $state(false);
  let modalMounted = $state(true);
  let modalVersion = $state(0);
  let drawerOpen = $state(false);
  let drawerMounted = $state(true);
  let drawerVersion = $state(0);

  async function focusOwner() { await tick(); if (ownerFocus) document.getElementById('tag-owner-input')?.focus({ preventScroll: true }); }
  function closing(event: MouseEvent) {
    closeCount++;
    if (reenter) (event.currentTarget as HTMLButtonElement).click();
    if (prevent) event.preventDefault();
    if (removeOnClose) { mounted = false; void focusOwner(); }
  }
  function toggle(value: boolean) { changes = [...changes, value]; if (accept) checked = value; if (removeOnChange) { checkMounted = false; void focusOwner(); } }
</script>

<style>
  .surface { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 16px; margin-block: 16px; background: var(--ant-color-bg-container); color: var(--ant-color-text); min-width: 0; }
</style>

<svelte:window onkeydown={event => {
  if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
  if (event.code === 'Digit1') { event.preventDefault(); mounted = !mounted; }
  if (event.code === 'Digit2') { event.preventDefault(); close = !close; }
  if (event.code === 'Digit3') { event.preventDefault(); checkMounted = !checkMounted; }
  if (event.code === 'Digit4') { event.preventDefault(); modalMounted = !modalMounted; }
  if (event.code === 'Digit5') { event.preventDefault(); drawerMounted = !drawerMounted; }
}} />

{#snippet icon()}<svg width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="currentColor" /></svg>{/snippet}
{#snippet closeIcon()}<svg width="12" height="12" viewBox="0 0 20 20"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" /></svg>{/snippet}

<section id="tag-fixture" aria-label="Tag fixture">
  <h2>Tag and CheckableTag</h2>
  <label>Tag color<select bind:value={color}>{#each ['default', 'success', 'processing', 'error', 'warning', 'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold'] as value}<option>{value}</option>{/each}</select></label>
  <label>Tag variant<select bind:value={variant}><option>filled</option><option>outlined</option><option>solid</option></select></label>
  <label>Tag text<input bind:value={text} /></label><label>Tag disabled mode<select bind:value={blocked}><option>inherit</option><option>on</option><option>off</option></select></label>
  <label><input type="checkbox" bind:checked={close} /> Tag close button</label><label><input type="checkbox" bind:checked={custom} /> Custom Tag icons</label><label><input type="checkbox" bind:checked={prevent} /> Prevent Tag closing</label><label><input type="checkbox" bind:checked={removeOnClose} /> Unmount Tag on close</label><label><input type="checkbox" bind:checked={reenter} /> Reenter Tag closing</label><label><input type="checkbox" bind:checked={ownerFocus} /> Tag owner focus</label>
  <label><input type="checkbox" bind:checked={checked} /> Parent checked Tag</label><label><input type="checkbox" bind:checked={accept} /> Accept CheckableTag changes</label><label><input type="checkbox" bind:checked={removeOnChange} /> Unmount CheckableTag on change</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Tag theme</label><label><input type="checkbox" bind:checked={compact} /> Compact Tag theme</label>
  <label>Tag outside input<input id="tag-owner-input" value="Outside draft" /></label><button type="button" onclick={() => { version++; mounted = true; }}>Restore Tag</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form aria-label="Tag form" onsubmit={event => { event.preventDefault(); submissions++; }}>
      <button type="button">Before Tag</button>
      <div class="surface" id="tag-surface">{#if mounted}{#key version}<Tag id="fixture-tag" {color} {variant} closeIcon={close ? custom ? closeIcon : true : false} icon={custom ? icon : undefined} disabled={blocked === 'inherit' ? undefined : blocked === 'on'} onClose={closing} aria-label="Fixture tag">{text}</Tag>{/key}{/if}<button type="button">After Tag</button></div>
      <button type="button">Before CheckableTag</button><div class="surface">{#if checkMounted}<CheckableTag id="fixture-checkable-tag" {checked} disabled={blocked === 'inherit' ? undefined : blocked === 'on'} icon={custom ? icon : undefined} onChange={toggle}>Filter Frontend</CheckableTag>{/if}<button type="button">After CheckableTag</button></div>
    </form>
    <button type="button" onclick={() => { modalOpen = true; modalMounted = true; modalVersion++; }}>Open Tag Modal</button><button type="button" onclick={() => { drawerOpen = true; drawerMounted = true; drawerVersion++; }}>Open Tag Drawer</button>
    <Modal bind:open={modalOpen} title="Tag host modal">{#if modalMounted}{#key modalVersion}<Tag closeIcon closeLabel="Close Modal tag" aria-label="Modal tag">Modal tag content</Tag>{/key}{/if}<button type="button">After Modal Tag</button></Modal>
    <Drawer bind:open={drawerOpen} title="Tag host drawer">{#if drawerMounted}{#key drawerVersion}<Tag closeIcon closeLabel="Close Drawer tag" aria-label="Drawer tag">Drawer tag content</Tag>{/key}{/if}<button type="button">After Drawer Tag</button></Drawer>
  </ConfigProvider>
  <output aria-label="Tag close count">{closeCount}</output><output aria-label="CheckableTag changes">{JSON.stringify(changes)}</output><output aria-label="Tag form submissions">{submissions}</output>
</section>
