<script lang="ts">
  import { Button, ConfigProvider, Dropdown, Modal, type DropdownItem, type DropdownPlacement } from '../../src/lib/components/ant-design';

  let open = $state(false);
  let disabled = $state(false);
  let nativeDisabled = $state(false);
  let arrow = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let cancelTrigger = $state(false);
  let preventItem = $state(false);
  let preventMenu = $state(false);
  let mounted = $state(true);
  let replaced = $state(false);
  let renameDisabled = $state(false);
  let renameRemoved = $state(false);
  let empty = $state(false);
  let allDisabled = $state(false);
  let long = $state(false);
  let many = $state(false);
  let special = $state(false);
  let placement = $state<DropdownPlacement | ''>('');
  let mode = $state('click');
  let submissions = $state(0);
  let clicks = $state(0);
  let changes = $state<boolean[]>([]);
  let events = $state<string[]>([]);
  let defaultMounted = $state(false);
  let defaultChanges = $state<boolean[]>([]);
  let modalOpen = $state(false);
  let modalChoice = $state('');
  let items: DropdownItem[] = $derived(empty ? [] : many ? Array.from({ length: 40 }, (_, index) => ({ key: String(index), label: `Command ${index + 1}` })) : [
    { key: '', label: long ? 'Open the complete details of the selected record with a very long descriptive label' : 'Open', icon: actionIcon, disabled: allDisabled },
    { key: 'export', label: 'Export', disabled: true },
    { key: 'divider', type: 'divider' },
    ...renameRemoved ? [] : [{ key: 'rename', label: 'Rename', disabled: allDisabled || renameDisabled, onClick: ({ domEvent }: { domEvent: MouseEvent }) => { events.push('item:rename'); if (preventItem) domEvent.preventDefault(); } }],
    { key: 'report', label: richLabel, textValue: 'Report', disabled: allDisabled },
    { key: special ? '"[odd]# key' : 'archive', label: 'Archive', danger: true, disabled: allDisabled }
  ]);

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') disabled = !disabled;
    if (event.key === 'F4') open = !open;
    if (event.key === 'F5') mounted = !mounted;
    if (event.key === 'F6') replaced = !replaced;
    if (event.key === 'F7') renameDisabled = !renameDisabled;
    if (event.key === 'F8') renameRemoved = !renameRemoved;
    if (event.key === 'F9') empty = !empty;
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .stage { display: flex; justify-content: center; padding: 180px 16px; }
  .clip { height: 88px; overflow: hidden; border: 1px solid #ddd; padding: 16px; }
  .modal-content { min-height: 180px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet actionIcon()}<span data-testid="dropdown-icon">↗</span>{/snippet}
{#snippet richLabel()}<strong>Report</strong>{/snippet}

<section id="dropdown-fixture" aria-label="Dropdown fixture">
  <label><input type="checkbox" bind:checked={disabled} /> Disable Dropdown</label>
  <label><input type="checkbox" bind:checked={nativeDisabled} /> Disable Dropdown native trigger</label>
  <label><input type="checkbox" bind:checked={arrow} /> Dropdown arrow</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Dropdown theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Dropdown theme</label>
  <label><input type="checkbox" bind:checked={cancelTrigger} /> Cancel Dropdown trigger click</label>
  <label><input type="checkbox" bind:checked={preventItem} /> Prevent Dropdown item click</label>
  <label><input type="checkbox" bind:checked={preventMenu} /> Prevent Dropdown menu click</label>
  <label><input type="checkbox" bind:checked={allDisabled} /> Disable all Dropdown items</label>
  <label><input type="checkbox" bind:checked={empty} /> Empty Dropdown items</label>
  <label><input type="checkbox" bind:checked={long} /> Long Dropdown labels</label>
  <label><input type="checkbox" bind:checked={many} /> Many Dropdown items</label>
  <label><input type="checkbox" bind:checked={special} /> Special Dropdown key</label>
  <label>Dropdown mode <select bind:value={mode}><option value="click">Click</option><option value="hover">Hover</option><option value="both">Both</option><option value="manual">Manual</option></select></label>
  <label>Dropdown placement <select bind:value={placement}><option value="">Default</option><option>top</option><option>topLeft</option><option>topRight</option><option>bottom</option><option>bottomLeft</option><option>bottomRight</option></select></label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <form onsubmit={(event) => { event.preventDefault(); submissions++; }}>
      <Button>Before Dropdown</Button>
      <div class="stage">
        {#if mounted}
          <Dropdown bind:open {disabled} {arrow} placement={placement || undefined} trigger={mode === 'manual' ? [] : mode === 'both' ? ['hover', 'click'] : mode === 'hover' ? 'hover' : 'click'} menu={{ items, onClick: ({ key, domEvent }) => { events.push(`menu:${key}`); if (preventMenu) domEvent.preventDefault(); } }} onOpenChange={(next) => changes.push(next)}>
            {#if replaced}<Button>Replacement Dropdown trigger</Button>{:else}<Button disabled={nativeDisabled} aria-describedby="dropdown-owner-help" aria-controls="dropdown-owner-controls" aria-haspopup="dialog" onclick={(event) => { clicks++; if (cancelTrigger) event.preventDefault(); }}>Dropdown trigger</Button>{/if}
          </Dropdown>
        {/if}
      </div>
      <Button>After Dropdown</Button>
    </form>
    <div class="actions">
      <Dropdown menu={{ items: [{ key: 'inherited', label: 'Inherited action' }] }} trigger="click"><Button>Inherited Dropdown trigger</Button></Dropdown>
      <Dropdown menu={{ items: [{ key: 'override', label: 'Enabled action' }] }} disabled={false} trigger="click"><Button disabled={false}>Enabled Dropdown override</Button></Dropdown>
      <Dropdown menu={{ items: [{ key: 'default-hover', label: 'Default hover action' }] }}><Button>Default hover Dropdown</Button></Dropdown>
    </div>
    <div class="clip"><Dropdown aria-label="Clipped menu" trigger="click" menu={{ items: [{ key: 'first', label: 'Clipped first action' }, { key: 'last', label: 'Clipped last action' }] }}><Button>Clipped Dropdown trigger</Button></Dropdown></div>
    <label><input type="checkbox" bind:checked={defaultMounted} /> Mount default Dropdown</label>
    {#if defaultMounted}<Dropdown aria-label="Default menu" defaultOpen onOpenChange={(next) => defaultChanges.push(next)} menu={{ items: [{ key: 'default', label: 'Default action' }] }}><Button>Default Dropdown trigger</Button></Dropdown>{/if}
  </ConfigProvider>
  <span id="dropdown-owner-help">Owner menu help.</span>
  <span id="dropdown-owner-controls">Owner control.</span>
  <output aria-label="Dropdown open">{String(open)}</output>
  <output aria-label="Dropdown changes">{JSON.stringify(changes)}</output>
  <output aria-label="Dropdown events">{JSON.stringify(events)}</output>
  <output aria-label="Dropdown clicks">{clicks}</output>
  <output aria-label="Dropdown submissions">{submissions}</output>
  <output aria-label="Default Dropdown changes">{JSON.stringify(defaultChanges)}</output>
  <Button onclick={() => { modalOpen = true; }}>Open Dropdown modal</Button>
  <Modal bind:open={modalOpen} title="Dropdown modal"><div class="modal-content"><Dropdown aria-label="Modal actions" trigger="click" menu={{ items: [{ key: 'modal', label: 'Choose modal action' }], onClick: ({ key }) => { modalChoice = key; } }}><Button>Modal Dropdown trigger</Button></Dropdown><Button>After modal Dropdown</Button></div></Modal>
  <output aria-label="Modal Dropdown choice">{modalChoice}</output>
</section>
