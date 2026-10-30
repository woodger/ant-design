<script lang="ts">
  import {
    Badge,
    ConfigProvider,
    type BadgeColor,
    type BadgeSize,
    type BadgeStatus
  } from 'antd-svelte';

  const statuses: BadgeStatus[] = ['success', 'processing', 'default', 'error', 'warning'];
  const colors: BadgeColor[] = [
    'blue',
    'purple',
    'cyan',
    'green',
    'magenta',
    'pink',
    'red',
    'orange',
    'yellow',
    'volcano',
    'geekblue',
    'lime',
    'gold'
  ];
  let count = $state<number | undefined>(5);
  let overflow = $state<number | undefined>(99);
  let dot = $state(false);
  let showZero = $state(false);
  let standalone = $state(false);
  let status = $state<BadgeStatus | 'none'>('none');
  let color = $state<BadgeColor | 'none'>('none');
  let size = $state<BadgeSize>('medium');
  let text = $state('');
  let rich = $state(false);
  let title = $state<'default' | 'off' | 'null' | 'custom'>('default');
  let x = $state<number | undefined>(0);
  let y = $state<number | undefined>(0);
  let dark = $state(false);
  let compact = $state(false);
  let clicks = $state(0);
  let submissions = $state(0);
</script>

<style>
  .surface { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; min-width: 0; padding: 32px; margin-block: 16px; background: var(--ant-color-bg-container); color: var(--ant-color-text); }
  .surface :global(button) { min-height: 32px; }
  input, select { max-width: 100%; }
  output { display: block; }
</style>

<svelte:window
  onkeydown={event => {
    if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
    if (event.code === 'Digit6') {
      event.preventDefault();
      count = count === 0 ? 120 : 0;
    }
    if (event.code === 'Digit7') {
      event.preventDefault();
      count = undefined;
    }
    if (event.code === 'Digit8') {
      event.preventDefault();
      count = NaN;
    }
    if (event.code === 'Digit9') {
      event.preventDefault();
      count = Infinity;
    }
    if (event.code === 'Digit0') {
      event.preventDefault();
      overflow = NaN;
      x = Infinity;
      y = NaN;
    }
  }}
/>

{#snippet richText()}<strong>{text}</strong>{/snippet}
{#snippet target(context: { count: number | undefined; descriptionId: string | undefined })}<button
  type="submit"
  aria-describedby={context.descriptionId}
  data-count={String(context.count)}
  onclick={() => { clicks++; }}
>Badge inbox</button>{/snippet}

<section id="badge-fixture" aria-label="Badge fixture">
  <h2>Badge</h2>
  <label>Badge count<input
    type="number"
    step="any"
    bind:value={() => Number.isFinite(count) ? count : undefined, value => { count = value; }}
  /></label>
  <label>Badge overflow<input
    type="number"
    step="any"
    bind:value={() => Number.isFinite(overflow) ? overflow : undefined, value => { overflow = value; }}
  /></label>
  <label>Badge status<select bind:value={status}><option>none</option>{#each statuses as value}<option>{value}</option>{/each}</select></label>
  <label>Badge color<select bind:value={color}><option>none</option>{#each colors as value}<option>{value}</option>{/each}</select></label>
  <label>Badge size<select bind:value={size}><option>medium</option><option>small</option></select></label>
  <label>Badge text<input bind:value={text} /></label>
  <label>Badge title<select bind:value={title}><option>default</option><option>off</option><option>null</option><option>custom</option></select></label>
  <label>Badge offset X<input
    type="number"
    step="any"
    bind:value={() => Number.isFinite(x) ? x : undefined, value => { x = value; }}
  /></label><label>Badge offset Y<input
    type="number"
    step="any"
    bind:value={() => Number.isFinite(y) ? y : undefined, value => { y = value; }}
  /></label>
  <label><input type="checkbox" bind:checked={dot} /> Badge dot mode</label><label><input
    type="checkbox"
    bind:checked={showZero}
  /> Badge show zero</label><label><input
    type="checkbox"
    bind:checked={standalone}
  /> Standalone Badge</label><label><input
    type="checkbox"
    bind:checked={rich}
  /> Badge text snippet</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Badge theme</label><label><input
    type="checkbox"
    bind:checked={compact}
  /> Compact Badge theme</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form
      aria-label="Badge form"
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    >
      <button type="button">Before Badge</button>
      <div class="surface" id="badge-surface"><Badge
        id="fixture-badge"
        {count}
        overflowCount={overflow}
        {dot}
        {showZero}
        {size}
        status={status === 'none' ? undefined : status}
        color={color === 'none' ? undefined : color}
        text={rich ? richText : text}
        offset={[x ?? 0, y ?? 0]}
        title={title === 'off'
          ? false
          : title === 'null' ? null : title === 'custom' ? 'Unread messages' : undefined}
        children={standalone ? undefined : target}
        aria-label="Fixture badge"
      /></div>
      <button type="button">After Badge</button>
    </form>
    <div class="surface" id="badge-statuses">{#each statuses as value}<Badge
      status={value}
      text={value}
    />{/each}<Badge
      id="badge-numeric-status"
      count={5}
      status="processing"
    /></div>
    <ConfigProvider locale={{ badge: { warning: 'Custom warning' } }}>
      <div class="surface"><Badge id="badge-partial-count" count={120} /><Badge
        id="badge-partial-warning"
        status="warning"
      /><Badge
        id="badge-partial-error"
        status="error"
      /></div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Badge owner count">{String(count)}</output><output aria-label="Badge clicks">{clicks}</output><output
    aria-label="Badge submissions"
  >{submissions}</output>
</section>
