<script lang="ts">
  import { ConfigProvider, Drawer, Modal, Progress, ruRU, type ProgressCircleSize, type ProgressLineSize, type ProgressStatus, type ProgressType } from '../../src/lib/components/ant-design';

  let type = $state<ProgressType>('line');
  let percent = $state<number | undefined>(42.5);
  let status = $state<'auto' | ProgressStatus>('auto');
  let size = $state('medium');
  let cap = $state<'round' | 'butt' | 'square'>('round');
  let showInfo = $state(true);
  let formatted = $state(false);
  let longFormat = $state(false);
  let colors = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let named = $state(false);
  let labelled = $state(false);
  let valueText = $state(false);
  let customLocale = $state(false);
  let mounted = $state(true);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let strokeWidth = $state<number | undefined>();
  const format = (value: number) => `Done ${value}%`;
  const long = (value: number) => `Processed ${value}% ${'VeryLongProgressLabelWithoutSpaces'.repeat(10)}`;
  let resolvedStatus = $derived(status === 'auto' ? undefined : status);
  let lineSize = $derived<ProgressLineSize>(size === 'pair' ? [260, 4] : size === 'css' ? { width: '75%', height: 12 } : size === 'numeric' ? 24 : size === 'tiny' ? [80, 3] : size === 'oversized' ? [1000, 8] : size === 'invalid' ? NaN : size === 'small' ? 'small' : 'medium');
  let circleSize = $derived<ProgressCircleSize>(size === 'numeric' ? 180 : size === 'tiny' ? 16 : size === 'oversized' ? 500 : size === 'invalid' ? NaN : size === 'small' ? 'small' : 'medium');
  let attributes = $derived({ percent, showInfo, format: longFormat ? long : formatted ? format : undefined, strokeColor: colors ? '#722ed1' : undefined, railColor: colors ? '#ffe58f' : undefined, strokeLinecap: cap, id: 'fixture-progress', 'aria-label': named ? 'Export progress' : undefined, 'aria-labelledby': labelled ? 'fixture-progress-label' : undefined, 'aria-describedby': 'fixture-progress-help', 'aria-valuetext': valueText ? 'Two of four files' : undefined });
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .surface { max-width: 640px; padding: 20px; background: var(--ant-color-bg-container); }
</style>

<svelte:window onkeydown={(event) => { if (!event.ctrlKey || !event.altKey) return; if (event.key === 'y') { event.preventDefault(); percent = 80; } if (event.key === 't') { event.preventDefault(); mounted = !mounted; } }} />
<section id="progress-fixture" aria-label="Progress fixture">
  <label>Progress type<select bind:value={type}><option>line</option><option>circle</option></select></label>
  <label>Progress percent<input type="number" value={Number.isFinite(percent) ? percent : ''} oninput={(event) => { percent = event.currentTarget.value === '' ? undefined : event.currentTarget.valueAsNumber; }} step="any" /></label>
  <label>Progress status<select bind:value={status}>{#each ['auto', 'normal', 'active', 'exception', 'success'] as value}<option>{value}</option>{/each}</select></label>
  <label>Progress size<select bind:value={size}>{#each ['medium', 'small', 'numeric', 'tiny', 'oversized', 'pair', 'css', 'invalid'] as value}<option>{value}</option>{/each}</select></label>
  <label>Progress cap<select bind:value={cap}><option>round</option><option>butt</option><option>square</option></select></label>
  <label>Progress stroke width<input type="number" bind:value={strokeWidth} /></label>
  {#each [{ label: 'Show Progress info', get: () => showInfo, set: (value: boolean) => { showInfo = value; } }, { label: 'Format Progress', get: () => formatted, set: (value: boolean) => { formatted = value; } }, { label: 'Long Progress format', get: () => longFormat, set: (value: boolean) => { longFormat = value; } }, { label: 'Custom Progress colors', get: () => colors, set: (value: boolean) => { colors = value; } }, { label: 'Dark Progress theme', get: () => dark, set: (value: boolean) => { dark = value; } }, { label: 'Compact Progress theme', get: () => compact, set: (value: boolean) => { compact = value; } }, { label: 'Named Progress', get: () => named, set: (value: boolean) => { named = value; } }, { label: 'Labelled Progress', get: () => labelled, set: (value: boolean) => { labelled = value; } }, { label: 'Custom Progress value text', get: () => valueText, set: (value: boolean) => { valueText = value; } }, { label: 'Custom Progress locale', get: () => customLocale, set: (value: boolean) => { customLocale = value; } }] as item}<label><input type="checkbox" checked={item.get()} onchange={(event) => item.set(event.currentTarget.checked)} />{item.label}</label>{/each}
  <div class="actions"><button type="button" onclick={() => { percent = NaN; }}>Set Progress NaN</button><button type="button" onclick={() => { percent = Infinity; }}>Set Progress Infinity</button><button type="button" onclick={() => { percent = -20; }}>Set Progress negative</button><button type="button" onclick={() => { percent = 200; }}>Set Progress overflow</button><button type="button" onclick={() => { percent = 0; }}>Set Progress zero</button><button type="button" onclick={() => { percent = 100; }}>Set Progress complete</button></div>
  <label>Progress focus target<input value="Keep my draft" /></label><span id="fixture-progress-label">Monthly export</span><p id="fixture-progress-help">Progress of the current operation.</p>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} locale={customLocale ? { ...ruRU, progress: { label: 'Custom progress', successText: 'Done' } } : undefined}>
    <div class="surface">{#if mounted}{#if type === 'circle'}<Progress {...attributes} type="circle" size={circleSize} status={resolvedStatus === 'active' ? undefined : resolvedStatus} {strokeWidth} />{:else}<Progress {...attributes} size={lineSize} status={resolvedStatus} />{/if}{/if}</div>
    <Progress percent={75} aria-label="Independent progress" id="independent-progress" />
    <button type="button">After Progress</button>
    <button type="button" onclick={() => { modalOpen = true; }}>Open Progress Modal</button><button type="button" onclick={() => { drawerOpen = true; }}>Open Progress Drawer</button>
    <Modal bind:open={modalOpen} title="Progress host modal"><label>Modal Progress input<input value="Modal draft" /></label><Progress percent={percent} aria-label="Modal progress" /></Modal>
    <Drawer bind:open={drawerOpen} title="Progress host drawer"><label>Drawer Progress input<input value="Drawer draft" /></label><Progress type="circle" percent={percent} aria-label="Drawer progress" /></Drawer>
  </ConfigProvider>
</section>
