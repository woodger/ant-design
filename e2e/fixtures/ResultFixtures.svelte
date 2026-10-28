<script lang="ts">
  import { tick } from 'svelte';
  import { ConfigProvider, Drawer, Modal, Result, type ResultStatus } from '../../src/lib/components/ant-design';
  import ResultExample from '../../src/lib/presentation/ant-design/ResultExample.svelte';

  let status = $state('info');
  let numeric = $state(false);
  let icon = $state<'default' | 'custom' | 'none'>('default');
  let title = $state('Operation complete');
  let subTitle = $state('Your draft has been preserved.');
  let rich = $state(false);
  let headingLevel = $state<1 | 2 | 3 | 4 | 5 | 6>(2);
  let extra = $state(true);
  let details = $state(true);
  let primary = $state(true);
  let mounted = $state(true);
  let labelled = $state(false);
  let ownerFocus = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let count = $state(0);
  let modalOpen = $state(false);
  let modalResult = $state(true);
  let drawerOpen = $state(false);
  let drawerResult = $state(true);
  let exampleMounted = $state(false);

  async function remove() { mounted = false; await tick(); if (ownerFocus) document.getElementById('result-owner-input')?.focus({ preventScroll: true }); }
</script>

<style>
  .surface { background: var(--ant-color-bg-container); color: var(--ant-color-text); }
</style>

<svelte:window onkeydown={event => {
  if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
  if (event.key === 'A') { event.preventDefault(); mounted = !mounted; }
  if (event.key === 'B') { event.preventDefault(); primary = !primary; }
  if (event.key === 'C') { event.preventDefault(); extra = !extra; }
  if (event.key === 'D') { event.preventDefault(); modalResult = !modalResult; }
  if (event.key === 'F') { event.preventDefault(); drawerResult = !drawerResult; }
}} />

{#snippet customIcon()}<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="currentColor" /></svg><button type="button">Decorative Result control</button>{/snippet}
{#snippet richTitle()}<strong>{title}</strong>{/snippet}
{#snippet richSubtitle()}<em>{subTitle}</em>{/snippet}
{#snippet actions()}{#if primary}<button type="button" onclick={() => { count++; }}>Result primary action</button>{/if}<button type="button" onclick={() => { count++; }}>Result secondary action</button><button type="button" onclick={() => { void remove(); }}>Remove Result</button>{/snippet}
{#snippet body()}<p>Completion details</p><label>Result retained draft<input value="Keep this draft" /></label><button type="button">Result details action</button>{/snippet}

<section id="result-fixture" aria-label="Result fixture">
  <h2>Result</h2>
  <label>Result status<select bind:value={status}>{#each ['success', 'error', 'info', 'warning', '403', '404', '500'] as value}<option>{value}</option>{/each}</select></label>
  <label><input type="checkbox" bind:checked={numeric} /> Numeric Result status</label>
  <label>Result icon<select bind:value={icon}><option>default</option><option>custom</option><option>none</option></select></label>
  <label>Result title<input bind:value={title} /></label><label>Result subtitle<input bind:value={subTitle} /></label>
  <label>Result heading level<select bind:value={headingLevel}>{#each [1, 2, 3, 4, 5, 6] as value}<option {value}>{value}</option>{/each}</select></label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Result text</label>
  <label><input type="checkbox" bind:checked={extra} /> Result actions</label><label><input type="checkbox" bind:checked={details} /> Result details</label>
  <label><input type="checkbox" bind:checked={ownerFocus} /> Result owner focus</label><label><input type="checkbox" bind:checked={labelled} /> Label Result by owner</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Result theme</label><label><input type="checkbox" bind:checked={compact} /> Compact Result theme</label>
  <label>Result outside input<input id="result-owner-input" value="Outside draft" /></label>
  <button type="button" onclick={() => { mounted = !mounted; }}>Toggle Result mount</button>
  <p id="result-owner-title">Owner completion title</p><p id="result-hint">Owner completion hint</p><button type="button">Before Result</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <div class="surface">{#if mounted}<Result id="fixture-result" status={(numeric && /^\d+$/.test(status) ? Number(status) : status) as ResultStatus} title={rich ? richTitle : title} subTitle={rich ? richSubtitle : subTitle} icon={icon === 'none' ? false : icon === 'custom' ? customIcon : undefined} extra={extra ? actions : undefined} children={details ? body : undefined} {headingLevel} aria-label={labelled ? undefined : 'Operation result'} aria-labelledby={labelled ? 'result-owner-title' : undefined} aria-describedby="result-hint" />{/if}</div>
    <button type="button">After Result</button><button type="button" onclick={() => { modalOpen = true; modalResult = true; }}>Open Result Modal</button><button type="button" onclick={() => { drawerOpen = true; drawerResult = true; }}>Open Result Drawer</button>
    <Modal bind:open={modalOpen} title="Result host modal">{#if modalResult}<Result status="success" title="Modal complete">{#snippet extra()}<button type="button" onclick={() => { modalResult = false; }}>Finish Modal Result</button>{/snippet}</Result>{:else}<p>Modal content loaded</p>{/if}<button type="button">After Modal Result</button></Modal>
    <Drawer bind:open={drawerOpen} title="Result host drawer">{#if drawerResult}<Result status="warning" title="Drawer complete">{#snippet extra()}<button type="button" onclick={() => { drawerResult = false; }}>Finish Drawer Result</button>{/snippet}</Result>{:else}<p>Drawer content loaded</p>{/if}<button type="button">After Drawer Result</button></Drawer>
    <button type="button" onclick={() => { exampleMounted = !exampleMounted; }}>Toggle Result example</button>
    {#if exampleMounted}<div id="result-example-fixture"><ResultExample /></div>{/if}
  </ConfigProvider>
  <output aria-label="Result action count">{count}</output>
</section>
