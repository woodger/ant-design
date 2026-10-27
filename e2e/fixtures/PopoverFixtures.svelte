<script lang="ts">
  import { Button, ConfigProvider, Input, Modal, Popover, Tooltip, type PopoverPlacement, type PopoverTrigger } from '../../src/lib/components/ant-design';

  let open = $state(false);
  let changes = $state<boolean[]>([]);
  let name = $state('Ada');
  let inputs = $state(0);
  let actions = $state(0);
  let clicks = $state(0);
  let cancelClick = $state(false);
  let mounted = $state(true);
  let available = $state(true);
  let replaced = $state(false);
  let ownerControls = $state('popover-original-control');
  let ownerExpanded = $state(false);
  let triggerMode = $state('click');
  let placement = $state<PopoverPlacement>('top');
  let arrow = $state(true);
  let adjust = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let shifted = $state(false);
  let defaultMounted = $state(false);
  let defaultOpen = $state(true);
  let defaultChanges = $state<boolean[]>([]);
  let modalOpen = $state(false);
  let modalPopoverOpen = $state(false);
  let triggers = $derived(triggerMode === 'mixed' ? ['hover', 'focus', 'click'] as const : triggerMode === 'manual' ? [] : triggerMode as PopoverTrigger);

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') available = !available;
    if (event.key === 'F4') open = !open;
    if (event.key === 'F5') mounted = !mounted;
    if (event.key === 'F6') replaced = !replaced;
    if (event.key === 'F7') { ownerControls = 'popover-updated-control'; ownerExpanded = true; }
    if (event.key === 'F8') shifted = !shifted;
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-block: 12px; }
  .stage { display: flex; justify-content: center; padding: 180px 16px; }
  .editor { width: 230px; max-width: 100%; }
  .clipped { overflow: hidden; height: 34px; }
  .scroller { height: 180px; overflow: auto; border: 1px solid #999; }
  .scroll-content { padding: 80px 40px 240px; }
  .shifted { padding-inline-start: 180px; }
  .modal-content { min-height: 180px; }
</style>

<svelte:window onkeydown={hotkey} />

{#snippet editor()}
  <div class="editor">
    <Button disabled>Unavailable Popover action</Button>
    <label for="popover-name">Popover name</label><Input id="popover-name" bind:value={name} oninput={() => { inputs++; }} />
    <div class="actions"><Button aria-label="Apply Popover action" onclick={() => { actions++; }}>Apply</Button><Button aria-label="Close Popover editor" onclick={() => { open = false; }}>Close</Button></div>
    <Tooltip title="Popover hint"><Button>Explain Popover action</Button></Tooltip>
    <a href="#popover-fixture">Popover help link</a>
  </div>
{/snippet}

{#snippet richTitle()}<strong>Rich Popover title</strong>{/snippet}
{#snippet modalContent()}<Input aria-label="Modal Popover input" /><Button onclick={() => { modalPopoverOpen = false; }}>Close Modal Popover</Button>{/snippet}

<section id="popover-fixture" aria-label="Popover fixture">
  <label><input type="checkbox" bind:checked={dark} /> Dark Popover theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Popover theme</label>
  <label><input type="checkbox" bind:checked={arrow} /> Popover arrow</label>
  <label><input type="checkbox" bind:checked={adjust} /> Adjust Popover overflow</label>
  <label><input type="checkbox" bind:checked={cancelClick} /> Cancel Popover click</label>
  <label>Popover placement <select bind:value={placement}><option>top</option><option>bottom</option><option>left</option><option>right</option></select></label>
  <label>Popover trigger mode <select bind:value={triggerMode}><option value="click">Click</option><option value="hover">Hover</option><option value="focus">Focus</option><option value="mixed">Mixed</option><option value="manual">Manual</option></select></label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <Button>Before Popover</Button>
    <div class="stage">
      {#if mounted}
        <Popover title={available ? 'Popover editor' : null} content={available ? editor : null} bind:open onOpenChange={(next) => changes.push(next)} trigger={triggers} {placement} {arrow} autoAdjustOverflow={adjust} mouseEnterDelay={0.2} mouseLeaveDelay={0.15}>
          {#if replaced}<Button aria-controls={ownerControls} aria-haspopup="menu" aria-expanded={ownerExpanded} aria-describedby="popover-original-help">Replacement Popover trigger</Button>{:else}<Button aria-controls={ownerControls} aria-haspopup="menu" aria-expanded={ownerExpanded} aria-describedby="popover-original-help" onclick={(event) => { clicks++; if (cancelClick) event.preventDefault(); }}>Popover trigger</Button>{/if}
        </Popover>
      {/if}
    </div>
    <Button>After Popover</Button>
    <div class="actions">
      <Popover title={richTitle} content="Rich content" trigger="click"><Button>Rich Popover trigger</Button></Popover>
      <Popover content="Content without a heading" aria-label="Untitled card" trigger="click"><Button>Untitled Popover trigger</Button></Popover>
      <Popover title={0} content={0} trigger="click"><Button>Zero Popover trigger</Button></Popover>
      <Popover title="Disabled card" content="Disabled explanation" trigger="click"><Button disabled>Disabled Popover trigger</Button></Popover>
    </div>
    <div class="clipped"><Popover title="Clipped card" content="Outside clipping" placement="bottom" trigger="click"><Button>Clipped Popover trigger</Button></Popover></div>
    <div class="scroller"><div class="scroll-content" class:shifted><Popover title="Moving card" content="Moving content" placement="bottom" trigger="click"><Button>Scrolling Popover trigger</Button></Popover></div></div>
    <label><input type="checkbox" bind:checked={defaultMounted} /> Mount default Popover</label>
    <label><input type="checkbox" bind:checked={defaultOpen} /> Default Popover open</label>
    {#if defaultMounted}<Popover title="Default card" content="Initially open" {defaultOpen} trigger={[]} onOpenChange={(next) => defaultChanges.push(next)}><Button>Default Popover trigger</Button></Popover>{/if}
  </ConfigProvider>
  <span id="popover-original-help">Popover original help.</span><span id="popover-original-control">Original controlled region.</span><span id="popover-updated-control">Updated controlled region.</span>
  <output aria-label="Popover open">{String(open)}</output>
  <output aria-label="Popover changes">{JSON.stringify(changes)}</output>
  <output aria-label="Popover name value">{name}</output>
  <output aria-label="Popover inputs">{inputs}</output>
  <output aria-label="Popover actions">{actions}</output>
  <output aria-label="Popover clicks">{clicks}</output>
  <output aria-label="Default Popover changes">{JSON.stringify(defaultChanges)}</output>
  <Button onclick={() => { modalOpen = true; }}>Open Popover modal</Button>
  <Modal bind:open={modalOpen} title="Popover modal"><div class="modal-content"><Popover title="Modal card" content={modalContent} trigger="click" bind:open={modalPopoverOpen}><Button>Modal Popover trigger</Button></Popover></div></Modal>
</section>
