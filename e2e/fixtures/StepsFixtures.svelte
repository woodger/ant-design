<script lang="ts">
  import { tick } from 'svelte';
  import { ConfigProvider, Drawer, Modal, Steps, type StepsItem, type StepsOrientation, type StepsSize, type StepsStatus } from '../../src/lib/components/ant-design';
  import StepsExample from '../../src/lib/presentation/ant-design/StepsExample.svelte';

  let current = $state<number | undefined>(1);
  let status = $state<StepsStatus>('process');
  let orientation = $state<StepsOrientation>('horizontal');
  let size = $state<StepsSize>('medium');
  let clickable = $state(true);
  let accept = $state(true);
  let disabled = $state<boolean | undefined>();
  let middleDisabled = $state(false);
  let lastDisabled = $state(true);
  let middleRemoved = $state(false);
  let reversed = $state(false);
  let empty = $state(false);
  let mounted = $state(true);
  let responsive = $state(true);
  let rich = $state(false);
  let customIcon = $state(false);
  let explicit = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let translated = $state(false);
  let labelled = $state(false);
  let removeOnChoose = $state(false);
  let ownerFocus = $state(false);
  let longTitle = $state('Step data');
  let changes = $state<number[]>([]);
  let modalOpen = $state(false);
  let modalSteps = $state(true);
  let drawerOpen = $state(false);
  let drawerSteps = $state(true);
  let exampleMounted = $state(false);
  let items = $derived.by((): StepsItem[] => {
    if (empty) return [];
    let result: StepsItem[] = [{ key: 'data', title: longTitle, content: 'Enter details', status: explicit ? 'error' : undefined, icon: customIcon ? custom : undefined }, { key: 'review', title: rich ? richTitle : 'Step review', content: rich ? richContent : 'Check details', disabled: middleDisabled }, { key: 'send', title: 'Step send', content: 'Send request', disabled: lastDisabled }];
    if (middleRemoved) result = result.filter(item => item.key !== 'review');
    return reversed ? result.toReversed() : result;
  });

  async function remove() { mounted = false; await tick(); if (ownerFocus) document.getElementById('steps-owner-input')?.focus({ preventScroll: true }); }
  function choose(value: number) { changes = [...changes, value]; if (accept) current = value; if (removeOnChoose) void remove(); }
</script>

<style>
  .surface { margin-block: 20px; padding: 16px; background: var(--ant-color-bg-container); color: var(--ant-color-text); }
</style>

<svelte:window onkeydown={event => {
  if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
  if (event.key === 'G') { event.preventDefault(); mounted = !mounted; }
  if (event.key === 'H') { event.preventDefault(); middleDisabled = !middleDisabled; }
  if (event.key === 'I') { event.preventDefault(); middleRemoved = !middleRemoved; }
  if (event.key === 'M') { event.preventDefault(); reversed = !reversed; }
  if (event.key === 'N') { event.preventDefault(); clickable = !clickable; }
  if (event.key === 'Q') { event.preventDefault(); empty = !empty; }
  if (event.key === 'S') { event.preventDefault(); modalSteps = !modalSteps; }
  if (event.key === 'V') { event.preventDefault(); drawerSteps = !drawerSteps; }
}} />

{#snippet custom()}<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="currentColor" /></svg><button type="button">Decorative Steps control</button>{/snippet}
{#snippet richTitle()}<strong>Step review</strong>{/snippet}
{#snippet richContent()}<p>Rich review description</p>{/snippet}

<section id="steps-fixture" aria-label="Steps fixture">
  <h2>Steps</h2>
  <label>Steps current<input type="number" bind:value={current} /></label>
  <label>Steps status<select bind:value={status}>{#each ['wait', 'process', 'finish', 'error'] as value}<option>{value}</option>{/each}</select></label>
  <label>Steps orientation<select bind:value={orientation}><option>horizontal</option><option>vertical</option></select></label>
  <label>Steps size<select bind:value={size}><option>medium</option><option>small</option></select></label>
  <label>Steps long title<input bind:value={longTitle} /></label>
  <label><input type="checkbox" bind:checked={clickable} /> Clickable Steps</label><label><input type="checkbox" bind:checked={accept} /> Accept Steps selection</label>
  <label><input type="checkbox" bind:checked={middleDisabled} /> Disable middle step</label><label><input type="checkbox" bind:checked={lastDisabled} /> Disable last step</label>
  <label><input type="checkbox" bind:checked={responsive} /> Responsive Steps</label><label><input type="checkbox" bind:checked={rich} /> Rich Steps content</label><label><input type="checkbox" bind:checked={customIcon} /> Custom Steps icon</label><label><input type="checkbox" bind:checked={explicit} /> Explicit Steps status</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Steps theme</label><label><input type="checkbox" bind:checked={compact} /> Compact Steps theme</label><label><input type="checkbox" bind:checked={translated} /> Custom Steps locale</label><label><input type="checkbox" bind:checked={labelled} /> Label Steps by owner</label>
  <label><input type="checkbox" bind:checked={removeOnChoose} /> Remove Steps on selection</label><label><input type="checkbox" bind:checked={ownerFocus} /> Steps owner focus</label>
  <label>Steps outside input<input id="steps-owner-input" value="Outside draft" /></label><button type="button" onclick={() => { disabled = disabled === false ? undefined : false; }}>Toggle Steps disabled override</button>
  <button type="button" onclick={() => { mounted = !mounted; }}>Toggle Steps mount</button><p id="steps-owner-title">Owner steps title</p><p id="steps-owner-hint">Owner steps hint</p><button type="button">Before Steps</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} locale={translated ? { steps: { error: 'Custom failure' } } : undefined}>
    <div class="surface">{#if mounted}<Steps id="fixture-steps" {items} {current} {status} {orientation} {size} {responsive} {disabled} onChange={clickable ? choose : undefined} aria-label={labelled ? undefined : 'Order steps'} aria-labelledby={labelled ? 'steps-owner-title' : undefined} aria-describedby="steps-owner-hint" />{/if}</div>
    <button type="button">After Steps</button><button type="button" onclick={() => { modalOpen = true; modalSteps = true; }}>Open Steps Modal</button><button type="button" onclick={() => { drawerOpen = true; drawerSteps = true; }}>Open Steps Drawer</button>
    <Modal bind:open={modalOpen} title="Steps host modal">{#if modalSteps}<Steps items={[{ key: 'one', title: 'Modal step one' }, { key: 'two', title: 'Modal step two' }]} onChange={() => { modalSteps = false; }} />{/if}<button type="button">After Modal Steps</button></Modal>
    <Drawer bind:open={drawerOpen} title="Steps host drawer">{#if drawerSteps}<Steps items={[{ key: 'one', title: 'Drawer step one' }, { key: 'two', title: 'Drawer step two' }]} onChange={() => { drawerSteps = false; }} />{/if}<button type="button">After Drawer Steps</button></Drawer>
    <button type="button" onclick={() => { exampleMounted = !exampleMounted; }}>Toggle Steps example</button>{#if exampleMounted}<div id="steps-example-fixture"><StepsExample /></div>{/if}
  </ConfigProvider>
  <output aria-label="Steps changes">{JSON.stringify(changes)}</output>
</section>
