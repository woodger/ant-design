<script lang="ts">
  import { Timeline, ConfigProvider } from '../../src/lib/components/ant-design';
  import type { TimelineMode, TimelineItem } from '../../src/lib/components/ant-design';
  let mode = $state<TimelineMode>('start');
  let horizontal = $state(false);
  let reverse = $state(false);
  let pending = $state(false);
  let labels = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let span = $state('default');
  let mounted = $state(true);
  let semantic = $state(false);
  let events = $derived<TimelineItem[]>([
    { key: 'created', title: labels ? '09:00' : undefined, content: 'Created', color: 'green' },
    { key: 'draft', title: labels ? '09:30' : undefined, content: draft, color: '#7d4cdb' },
    { key: 'processed', title: labels ? '10:00' : undefined, content: 'Processing', loading: true },
    { key: 'approved', title: labels ? '10:30' : undefined, content: 0, color: 'red' }
  ]);
</script>
<svelte:window onkeydown={event => { if (event.key === 'F4') reverse = !reverse; }} />
{#snippet draft()}<label>Timeline draft <input aria-label="Timeline draft" name="timeline-draft" value="initial" style="width:100%;min-width:0;box-sizing:border-box" /></label>{/snippet}
<section id="timeline-fixture" aria-label="Timeline fixture">
  <label>Timeline mode <select aria-label="Timeline mode" bind:value={mode}><option>start</option><option>end</option><option>alternate</option><option>left</option><option>right</option></select></label>
  <label>Timeline title span <select aria-label="Timeline title span" bind:value={span}><option value="default">Default</option><option value="100px">100px</option><option value="25%">25%</option><option value="8">8</option></select></label>
  <label><input type="checkbox" bind:checked={horizontal} /> Horizontal Timeline</label>
  <label><input type="checkbox" bind:checked={reverse} /> Reverse Timeline</label>
  <label><input type="checkbox" bind:checked={pending} /> Pending Timeline</label>
  <label><input type="checkbox" bind:checked={labels} /> Timeline labels</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Timeline</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Timeline</label>
  <label><input type="checkbox" bind:checked={semantic} /> Semantic Timeline</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Timeline</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    {#if mounted}<Timeline id="fixture-timeline" aria-label="Audit events" {mode} items={events} {reverse} orientation={horizontal ? 'horizontal' : 'vertical'} pending={pending ? 'Waiting' : undefined} titleSpan={span === 'default' ? undefined : span === '8' ? 8 : span}
      classNames={semantic ? { root: 'custom-timeline-root', itemTitle: 'custom-timeline-title' } : undefined}
      styles={semantic ? { itemTitle: 'font-weight:700', root: 'color:red' } : undefined} style={semantic ? 'color:blue' : undefined} />{/if}
  </ConfigProvider>
  <button type="button">After Timeline</button>
</section>
