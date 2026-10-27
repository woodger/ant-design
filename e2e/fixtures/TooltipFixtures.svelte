<script lang="ts">
  import { Button, ConfigProvider, Input, Modal, Slider, Tooltip, type TooltipPlacement } from '../../src/lib/components/ant-design';

  let open = $state(false);
  let changes = $state<boolean[]>([]);
  let title = $state<string | number | null>('Helpful description');
  let description = $state('tooltip-original-help');
  let mounted = $state(true);
  let replaced = $state(false);
  let placement = $state<TooltipPlacement>('top');
  let arrow = $state(true);
  let adjust = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let modalOpen = $state(false);
  let clicks = $state(0);
  let inputs = $state(0);
  let scroller = $state<HTMLDivElement>();
  let shifted = $state(false);
  let sliderMode = $state('auto');
  let sliderValue = $state(30);

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') title = null;
    if (event.key === 'F4') open = !open;
    if (event.key === 'F5') mounted = !mounted;
    if (event.key === 'F6') replaced = !replaced;
    if (event.key === 'F7') description = 'tooltip-updated-help';
    if (event.key === 'F8') shifted = !shifted;
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-block: 12px; }
  .stage { display: flex; justify-content: center; padding: 80px 16px; }
  .clipped { overflow: hidden; height: 34px; }
  .scroller { height: 160px; overflow: auto; border: 1px solid #999; }
  .scroll-content { padding: 70px 40px 220px; }
  .shifted { padding-inline-start: 180px; }
  .modal-content { min-height: 160px; }
</style>

<svelte:window onkeydown={hotkey} />

<section id="tooltip-fixture" aria-label="Tooltip fixture">
  <label><input type="checkbox" bind:checked={dark} /> Dark Tooltip theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Tooltip theme</label>
  <label><input type="checkbox" bind:checked={arrow} /> Tooltip arrow</label>
  <label><input type="checkbox" bind:checked={adjust} /> Adjust Tooltip overflow</label>
  <label>Tooltip placement <select bind:value={placement}><option>top</option><option>bottom</option><option>left</option><option>right</option></select></label>
  <div class="actions">
    <button onclick={() => { title = 0; }}>Use zero Tooltip</button>
    <button onclick={() => { title = '   '; }}>Use empty Tooltip</button>
    <button onclick={() => { title = 'Helpful description'; }}>Restore Tooltip title</button>
    <button onclick={() => { open = !open; }}>Toggle Tooltip externally</button>
  </div>
  <span id="tooltip-original-help">Original help.</span><span id="tooltip-updated-help">Updated help.</span>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <div class="stage">
      {#if mounted}
        <Tooltip {title} bind:open onOpenChange={(next) => changes.push(next)} {placement} {arrow} autoAdjustOverflow={adjust} mouseEnterDelay={0.2} mouseLeaveDelay={0.15}>
          {#if replaced}<Button aria-describedby={description}>Replacement Tooltip trigger</Button>{:else}<Button aria-describedby={description} onclick={() => { clicks++; }}>Tooltip trigger</Button>{/if}
        </Tooltip>
      {/if}
    </div>
    <div class="actions">
      <Tooltip title="Input description"><Input aria-label="Tooltip input" oninput={() => { inputs++; }} /></Tooltip>
      <Tooltip title="Disabled explanation"><Button disabled>Disabled Tooltip trigger</Button></Tooltip>
      <Tooltip title="Focus description" trigger="focus"><Button>Focus Tooltip trigger</Button></Tooltip>
      <Tooltip title="Hover description" trigger="hover"><Button>Hover Tooltip trigger</Button></Tooltip>
      <Tooltip title="Initially visible" defaultOpen trigger={[]}><Button>Default Tooltip trigger</Button></Tooltip>
    </div>
    <div class="clipped"><Tooltip title="Outside clipping" placement="bottom"><Button>Clipped Tooltip trigger</Button></Tooltip></div>
    <div bind:this={scroller} class="scroller"><div class="scroll-content" class:shifted><Tooltip title="Moving description" placement="bottom"><Button>Scrolling Tooltip trigger</Button></Tooltip></div></div>
    <button onclick={() => { if (scroller) scroller.scrollTop += 30; }}>Scroll Tooltip container</button>
    <label>Slider Tooltip mode <select bind:value={sliderMode}><option value="auto">Auto</option><option value="forced">Forced</option><option value="hidden">Hidden</option><option value="disabled">Disabled</option><option value="null">Null formatter</option><option value="empty">Empty result</option></select></label>
    <Slider aria-label="Formatted Tooltip Slider" bind:value={sliderValue} tooltip={sliderMode === 'disabled' ? false : { open: sliderMode === 'forced' ? true : sliderMode === 'hidden' ? false : undefined, formatter: sliderMode === 'null' ? null : (value) => sliderMode === 'empty' ? null : `${value}%` }} />
  </ConfigProvider>
  <output aria-label="Tooltip open">{String(open)}</output>
  <output aria-label="Tooltip changes">{JSON.stringify(changes)}</output>
  <output aria-label="Tooltip clicks">{clicks}</output>
  <output aria-label="Tooltip inputs">{inputs}</output>
  <Button onclick={() => { modalOpen = true; }}>Open Tooltip modal</Button>
  <Modal bind:open={modalOpen} title="Tooltip modal">
    <div class="modal-content"><Tooltip title="Inside modal"><Button>Modal Tooltip trigger</Button></Tooltip><Slider aria-label="Modal Tooltip Slider" defaultValue={45} /></div>
  </Modal>
</section>
