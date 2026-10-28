<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ConfigProvider, Statistic } from '../../src/lib/components/ant-design';

  let value = $state('112893.129');
  let precision = $state<number | undefined>();
  let decimalSeparator = $state('.');
  let groupSeparator = $state(',');
  let title = $state('Active users');
  let prefix = $state('');
  let suffix = $state('users');
  let loading = $state(false);
  let rich = $state(false);
  let format = $state<'default' | 'text' | 'rich'>('default');
  let wrap = $state(false);
  let custom = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let nativeElement = $state<HTMLDivElement>();
</script>

{#snippet richTitle()}<strong>{title}</strong>{/snippet}
{#snippet formatted()}<strong>Custom {value}</strong>{/snippet}
{#snippet wrapper(node: Snippet)}<mark class="statistic-wrapper">{@render node()}</mark>{/snippet}

<section id="statistic-fixture" aria-label="Statistic fixture">
  <h2>Statistic</h2>
  <label>Statistic value<input bind:value /></label>
  <label>Statistic precision<input type="number" bind:value={precision} /></label>
  <label>Statistic decimal separator<input bind:value={decimalSeparator} /></label>
  <label>Statistic group separator<input bind:value={groupSeparator} /></label>
  <label>Statistic title<input bind:value={title} /></label>
  <label>Statistic prefix<input bind:value={prefix} /></label>
  <label>Statistic suffix<input bind:value={suffix} /></label>
  <label>Statistic formatter<select bind:value={format}><option>default</option><option>text</option><option>rich</option></select></label>
  <label><input type="checkbox" bind:checked={loading} /> Loading Statistic</label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Statistic title</label>
  <label><input type="checkbox" bind:checked={wrap} /> Wrapped Statistic value</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Statistic slots</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Statistic theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Statistic theme</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <button type="button">Before Statistic</button>
    <Statistic id="fixture-statistic" aria-label="Metric" data-fixture="statistic" bind:nativeElement
      {value} {precision} {decimalSeparator} {groupSeparator} title={rich ? richTitle : title} {prefix} {suffix} {loading}
      formatter={format === 'text' ? input => `Custom ${input}` : format === 'rich' ? () => formatted : undefined}
      valueRender={wrap ? wrapper : undefined}
      classNames={({ props }) => custom ? { root: `metric-${props.loading ? 'loading' : 'ready'}`, value: 'metric-value' } : {}}
      valueStyle="font-weight:400" styles={custom ? { root: 'padding:4px', title: 'font-style:italic', content: 'font-weight:600', value: 'color:rgb(0, 128, 0)' } : undefined}
    />
    <button type="button">After Statistic</button>
    <output aria-label="Statistic native element">{nativeElement?.id}</output>
  </ConfigProvider>
</section>
