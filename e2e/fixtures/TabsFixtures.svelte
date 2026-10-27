<script lang="ts">
  import { Button, ConfigProvider, Modal, Tabs, type ComponentSize, type TabsItem, type TabsPlacement, type TabsType } from '../../src/lib/components/ant-design';
  import TabsContent from './TabsContent.svelte';

  let activeKey = $state<string | undefined>();
  let placement = $state<TabsPlacement>('top');
  let type = $state<TabsType>('line');
  let size = $state<ComponentSize>('middle');
  let destroy = $state(false);
  let force = $state(false);
  let betaKeep = $state(false);
  let gammaDestroy = $state(false);
  let betaDisabled = $state(false);
  let betaRemoved = $state(false);
  let reversed = $state(false);
  let empty = $state(false);
  let allDisabled = $state(false);
  let many = $state(false);
  let long = $state(false);
  let special = $state(false);
  let duplicate = $state(false);
  let renamed = $state(false);
  let cancelClicks = $state(false);
  let removeOnClick = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let defaultMounted = $state(false);
  let defaultKey = $state('beta');
  let modalOpen = $state(false);
  let modalChoice = $state<string | undefined>();
  let changes = $state<string[]>([]);
  let clicks = $state<string[]>([]);
  let events = $state<{ kind: string; key: string; owner: string | null }[]>([]);
  let lifecycle = $state<string[]>([]);
  let defaultChanges = $state<string[]>([]);
  let submissions = $state(0);
  let base: TabsItem[] = $derived([
    { key: '', label: long ? 'Alpha with a very long section name for the selected account' : renamed ? 'Renamed Alpha' : 'Alpha', children: alpha, icon: tabIcon, disabled: allDisabled, forceRender: force },
    { key: 'locked', label: 'Locked', disabled: true, children: locked, forceRender: force },
    ...betaRemoved ? [] : [{ key: 'beta', label: richLabel, children: beta, disabled: betaDisabled || allDisabled, forceRender: force, destroyOnHidden: betaKeep ? false : undefined }],
    { key: special ? '"# ][🙂' : 'gamma', label: 'Gamma', children: gamma, disabled: allDisabled, forceRender: force, destroyOnHidden: gammaDestroy || undefined },
    ...duplicate ? [{ key: '', label: 'Duplicate Alpha', children: gamma }] : []
  ]);
  let items = $derived(empty ? [] : many ? Array.from({ length: 30 }, (_, index) => ({ key: `section-${index}`, label: `Section ${index + 1}`, children: gamma })) : reversed ? [...base].reverse() : base);

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') betaDisabled = !betaDisabled;
    if (event.key === 'F4') activeKey = activeKey === 'gamma' ? '' : 'gamma';
    if (event.key === 'F5') mounted = !mounted;
    if (event.key === 'F6') reversed = !reversed;
    if (event.key === 'F7') betaRemoved = !betaRemoved;
    if (event.key === 'F8') empty = !empty;
    if (event.key === 'F9') allDisabled = !allDisabled;
    if (event.key === 'F10') renamed = !renamed;
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .stage { margin-block: 16px; padding: 12px; background: var(--ant-color-bg-container); }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .modal-content { min-height: 180px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet tabIcon()}<span data-testid="tabs-icon">↗</span>{/snippet}
{#snippet richLabel()}<strong>Beta</strong>{/snippet}
{#snippet alpha()}<TabsContent name="Alpha" onLifecycle={(event) => lifecycle.push(event)} />{/snippet}
{#snippet locked()}<TabsContent name="Locked" onLifecycle={(event) => lifecycle.push(event)} />{/snippet}
{#snippet beta()}<TabsContent name="Beta" onLifecycle={(event) => lifecycle.push(event)} />{/snippet}
{#snippet gamma()}<TabsContent name="Gamma" onLifecycle={(event) => lifecycle.push(event)} />{/snippet}
{#snippet defaultAlpha()}<p>Default Alpha content</p>{/snippet}
{#snippet defaultBeta()}<p>Default Beta content</p>{/snippet}
{#snippet modalDetails()}<label>Modal tab draft<input value="Modal initial" /></label>{/snippet}
{#snippet modalHistory()}<p>Modal history content</p>{/snippet}

<section id="tabs-fixture" aria-label="Tabs fixture">
  <label><input type="checkbox" bind:checked={destroy} /> Destroy hidden Tabs</label>
  <label><input type="checkbox" bind:checked={force} /> Force render Tabs</label>
  <label><input type="checkbox" bind:checked={betaKeep} /> Keep Beta panel</label>
  <label><input type="checkbox" bind:checked={gammaDestroy} /> Destroy Gamma panel</label>
  <label><input type="checkbox" bind:checked={allDisabled} /> Disable all Tabs items</label>
  <label><input type="checkbox" bind:checked={empty} /> Empty Tabs items</label>
  <label><input type="checkbox" bind:checked={many} /> Many Tabs items</label>
  <label><input type="checkbox" bind:checked={long} /> Long Tabs labels</label>
  <label><input type="checkbox" bind:checked={special} /> Special Tabs key</label>
  <label><input type="checkbox" bind:checked={duplicate} /> Duplicate Tabs key</label>
  <label><input type="checkbox" bind:checked={cancelClicks} /> Cancel Tabs click</label>
  <label><input type="checkbox" bind:checked={removeOnClick} /> Remove Beta on tab click</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Tabs theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Tabs theme</label>
  <label>Tabs placement <select bind:value={placement}><option>top</option><option>bottom</option><option>start</option><option>end</option></select></label>
  <label>Tabs type <select bind:value={type}><option>line</option><option>card</option></select></label>
  <label>Tabs size <select bind:value={size}><option>small</option><option>middle</option><option>large</option></select></label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }} componentSize={size}>
    <form onsubmit={(event) => { event.preventDefault(); submissions++; }}>
      <Button>Before Tabs</Button>
      <div class="stage">{#if mounted}<Tabs {items} bind:activeKey tabPlacement={placement} {type} destroyOnHidden={destroy} aria-label="Bound sections" onChange={(key) => { changes.push(key); events.push({ kind: 'change', key, owner: activeKey ?? null }); }} onTabClick={(key, event) => { clicks.push(key); events.push({ kind: 'click', key, owner: activeKey ?? null }); if (cancelClicks) event.preventDefault(); if (removeOnClick && key === 'beta') betaRemoved = true; }} />{/if}</div>
      <Button>After Tabs</Button>
    </form>
    <label><input type="checkbox" bind:checked={defaultMounted} /> Mount default Tabs</label>
    {#if defaultMounted}<Tabs aria-label="Default sections" defaultActiveKey={defaultKey} items={[{ key: 'alpha', label: 'Default Alpha', children: defaultAlpha }, { key: 'beta', label: 'Default Beta', children: defaultBeta }]} onChange={(key) => defaultChanges.push(key)} />{/if}
  </ConfigProvider>
  <div class="actions">
    <Button onclick={() => { activeKey = 'gamma'; }}>Select Gamma externally</Button>
    <Button onclick={() => { activeKey = 'missing'; }}>Select missing Tabs key</Button>
    <Button onclick={() => { activeKey = undefined; }}>Clear Tabs owner</Button>
    <Button onclick={() => { defaultKey = 'alpha'; }}>Replace Tabs default</Button>
  </div>
  <output aria-label="Tabs owner">{JSON.stringify(activeKey) ?? 'undefined'}</output>
  <output aria-label="Tabs changes">{JSON.stringify(changes)}</output>
  <output aria-label="Tabs clicks">{JSON.stringify(clicks)}</output>
  <output aria-label="Tabs events">{JSON.stringify(events)}</output>
  <output aria-label="Tabs lifecycle">{JSON.stringify(lifecycle)}</output>
  <output aria-label="Tabs submissions">{submissions}</output>
  <output aria-label="Default Tabs changes">{JSON.stringify(defaultChanges)}</output>
  <Button onclick={() => { modalOpen = true; }}>Open Tabs modal</Button>
  <Modal bind:open={modalOpen} title="Tabs modal"><div class="modal-content"><Tabs aria-label="Modal sections" bind:activeKey={modalChoice} items={[{ key: 'details', label: 'Modal Details', children: modalDetails }, { key: 'history', label: 'Modal History', children: modalHistory }]} /></div></Modal>
</section>
