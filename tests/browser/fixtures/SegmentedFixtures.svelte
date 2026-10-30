<script lang="ts">
  import {
    ConfigProvider,
    Segmented,
    type SegmentedOption,
    type SegmentedValue,
    type ComponentSize
  } from 'antd-svelte';

  let value = $state<SegmentedValue>();
  let changes = $state(0);
  let disabled = $state(false);
  let optionDisabled = $state(false);
  let block = $state(false);
  let vertical = $state(false);
  let orientation = $state<'inherit' | 'horizontal' | 'vertical'>('inherit');
  let shape = $state<'default' | 'round'>('default');
  let size = $state<'inherit' | ComponentSize>('inherit');
  let dark = $state(false);
  let compact = $state(false);
  let custom = $state(false);
  let rich = $state(false);
  let tooltips = $state(false);
  let reversed = $state(false);
  let remove = $state(false);
  let mounted = $state(true);
  let nativeElement = $state<HTMLDivElement>();
  let items = $derived<SegmentedOption[]>([
    { value: 0, label: 'Zero' },
    {
      value: 'week',
      label: rich ? weekLabel : 'Weekly',
      icon: rich ? icon : undefined,
      disabled: optionDisabled,
      tooltip: tooltips
        ? { title: 'Weekly report', mouseEnterDelay: 0, mouseLeaveDelay: 0 }
        : undefined
    },
    ...remove ? [] : [{ value: 'month', label: 'Monthly' }]
  ]);
  let options = $derived(reversed ? [...items].reverse() : items);
</script>

{#snippet weekLabel()}<strong>Weekly</strong>{/snippet}
{#snippet icon()}<svg viewBox="0 0 10 10" width="12" height="12"><path
  fill="currentColor"
  d="M0 0h10v10H0z"
/></svg>{/snippet}

<section id="segmented-fixture" aria-label="Segmented fixture">
  <h2>Segmented</h2>
  <label><input type="checkbox" bind:checked={disabled} /> Disabled Segmented</label>
  <label><input type="checkbox" bind:checked={optionDisabled} /> Disabled weekly option</label>
  <label><input type="checkbox" bind:checked={block} /> Block Segmented</label>
  <label><input type="checkbox" bind:checked={vertical} /> Vertical Segmented alias</label>
  <label>Segmented orientation<select bind:value={orientation}><option>inherit</option><option>horizontal</option><option>vertical</option></select></label>
  <label>Segmented shape<select bind:value={shape}><option>default</option><option>round</option></select></label>
  <label>Segmented size<select bind:value={size}><option>inherit</option><option>small</option><option>middle</option><option>large</option></select></label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Segmented theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Segmented theme</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Segmented slots</label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Segmented labels</label>
  <label><input type="checkbox" bind:checked={tooltips} /> Segmented tooltips</label>
  <label><input type="checkbox" bind:checked={reversed} /> Reverse Segmented options</label>
  <label><input type="checkbox" bind:checked={remove} /> Remove monthly option</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Segmented</label>
  <button type="button" onclick={() => { value = 'week'; }}>Set weekly externally</button>
  <button type="button" onclick={() => { value = 'missing'; }}>Set missing externally</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form aria-label="Segmented form" onsubmit={event => event.preventDefault()}>
      <button type="button">Before Segmented</button>
      {#if mounted}<Segmented
        id="fixture-segmented"
        aria-label="Period"
        {options}
        bind:value
        {disabled}
        {block}
        {vertical}
        orientation={orientation === 'inherit' ? undefined : orientation}
        {shape}
        size={size === 'inherit' ? undefined : size}
        name="period"
        bind:nativeElement
        onChange={() => { changes++; }}
        classNames={() =>
          custom
            ? {
              root: 'custom-segmented',
              item: 'custom-segmented-item',
              label: 'custom-segmented-label',
              icon: 'custom-segmented-icon'
            }
            : {}}
        styles={custom ? { item: 'font-weight:600', label: 'font-style:italic' } : undefined}
      />{/if}
      <button type="button">After Segmented</button>
      <button type="reset">Reset Segmented form</button>
    </form>
    <Segmented options={['Daily', 'Weekly']} aria-label="Independent period" />
  </ConfigProvider>
  <output aria-label="Segmented value">{typeof value}:{String(value)}</output>
  <output aria-label="Segmented changes">{changes}</output>
  <output aria-label="Segmented native element">{nativeElement?.id}</output>
</section>
