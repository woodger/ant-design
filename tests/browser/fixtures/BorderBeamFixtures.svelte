<script lang="ts">
  import { BorderBeam, Card, ConfigProvider, type BorderBeamColor } from 'antd-svelte';

  let host = $state<HTMLDivElement>();
  let cardHost = $state<HTMLDivElement>();
  let hoverHost = $state<HTMLDivElement>();
  let svgHost = $state<SVGSVGElement>();
  let firstHost = $state<HTMLDivElement>();
  let secondHost = $state<HTMLDivElement>();
  let hostVersion = $state(0);
  let customized = $state(false);
  let cssUnits = $state(false);
  let count = $state('1');
  let duration = $state('12');
  let colorMode = $state('theme');
  let gradient = $state([
    { color: '#1677ff', percent: 0 },
    { color: '#36cfc9', percent: 55 },
    { color: '#95de64', percent: 100 }
  ]);
  let wideBorder = $state(false);
  let round = $state(false);
  let staticHost = $state(false);
  let mounted = $state(true);
  let available = $state(true);
  let second = $state(false);
  let dark = $state(false);
  let purple = $state(false);
  let replacedConfig = $state(false);
  let customStyle = $state(false);
  let clicks = $state(0);
  let submitted = $state('');
  let color = $derived<BorderBeamColor | undefined>(
    colorMode === 'solid' ? '#36cfc9'
      : colorMode === 'gradient' ? gradient
        : colorMode === 'empty' ? [] : undefined
  );
</script>

<style>
  .host { width: 320px; padding: 24px; margin-block: 12px; }
  .beam-hover-host :global(.hover-beam) { opacity: 0; }
  .beam-hover-host :global(.hover-beam::before) { animation-play-state: paused; }
  .beam-hover-host:hover :global(.hover-beam) { opacity: 1; }
  .beam-hover-host:hover :global(.hover-beam::before) { animation-play-state: running; }
</style>

<section id="border-beam-fixture">
  <h2>BorderBeam</h2>
  <label>Beam count<input bind:value={count} /></label>
  <label>Beam duration<input bind:value={duration} /></label>
  <label>Beam color<select bind:value={colorMode}>
    <option value="theme">Theme</option><option value="solid">Solid</option>
    <option value="gradient">Gradient</option><option value="empty">Empty</option>
  </select></label>
  <label><input type="checkbox" bind:checked={customized} /> Customize beam</label>
  <label><input type="checkbox" bind:checked={cssUnits} /> CSS beam units</label>
  <label><input type="checkbox" bind:checked={wideBorder} /> Wider host border</label>
  <label><input type="checkbox" bind:checked={round} /> Change host radius</label>
  <label><input type="checkbox" bind:checked={staticHost} /> Static beam host</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount moving beam</label>
  <label><input type="checkbox" bind:checked={available} /> Available beam target</label>
  <label><input type="checkbox" bind:checked={second} /> Second beam target</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark beam theme</label>
  <label><input type="checkbox" bind:checked={purple} /> Purple beam primary</label>
  <label><input type="checkbox" bind:checked={replacedConfig} /> Replace beam config</label>
  <label><input type="checkbox" bind:checked={customStyle} /> Custom beam variables</label>
  <button type="button" onclick={() => hostVersion++}>Replace beam host</button>
  <button type="button" onclick={() => { gradient[1].percent = 30; }}>Change gradient stop</button>

  <ConfigProvider
    borderBeam={{ class: 'beam-context', style: 'opacity:0.5;outline-offset:6px' }}
    theme={{ mode: dark ? 'dark' : 'light', primary: purple ? 'purple' : 'green' }}
  >
    <BorderBeam
      target={host}
      {color}
      count={Number(count)}
      duration={customized ? Number(duration) : undefined}
      size={customized ? cssUnits ? '12em' : 160 : undefined}
      lineWidth={customized ? cssUnits ? '0.25rem' : 5 : undefined}
      outset={customized ? cssUnits ? '2em' : 4 : undefined}
      class="primary-beam"
      style={customStyle
        ? 'opacity:0.8;--ant-border-beam-size:84px;--ant-border-beam-duration:9s;--ant-border-beam-delay:1s;--ant-border-beam-inset-offset:99px'
        : 'opacity:0.8'}
    >
      {#key hostVersion}
        <div
          id="border-beam-host"
          class="host"
          bind:this={host}
          style={`position:${staticHost ? 'static' : 'relative'};border-style:solid;border-width:${wideBorder ? '5px 6px 7px 8px' : '1px 2px 3px 4px'};border-radius:${round ? '12px 24px 36px 48px' : '8px'}`}
        >
          <form onsubmit={event => {
            event.preventDefault();
            submitted = String(new FormData(event.currentTarget).get('draft'));
          }}>
            <label>Beam draft<input name="draft" /></label>
            <button type="button" onclick={() => clicks++}>Beam action</button>
            <button type="submit">Submit beam draft</button>
          </form>
        </div>
      {/key}
    </BorderBeam>
    <output aria-label="Beam host ref">{host?.tagName}</output>
    <output aria-label="Beam clicks">{clicks}</output>
    <output aria-label="Beam submission">{submitted}</output>

    <ConfigProvider borderBeam={replacedConfig ? { class: 'nested-beam-context' } : undefined}>
      <BorderBeam target={cardHost} class="card-beam">
        <Card bind:nativeElement={cardHost} class="beam-card" title="Decorated card">
          Card content
        </Card>
      </BorderBeam>
    </ConfigProvider>
  </ConfigProvider>

  <div id="moving-host-a" class="host" style="position:relative;border:2px solid" bind:this={firstHost}>First host</div>
  <div id="moving-host-b" class="host" style="position:relative;border:4px solid" bind:this={secondHost}>Second host</div>
  {#if mounted}<BorderBeam target={available ? second ? secondHost : firstHost : null} class="moving-beam" />{/if}
  <BorderBeam target={svgHost} class="svg-beam"><svg aria-label="Beam SVG" bind:this={svgHost}><title>SVG content</title></svg></BorderBeam>
  <BorderBeam class="unresolved-beam"><p id="unresolved-host">Content without a target</p></BorderBeam>
  <BorderBeam children="Plain beam content" />
  <BorderBeam target={hoverHost} class="hover-beam">
    <div class="host beam-hover-host" bind:this={hoverHost} style="position:relative;border:1px solid">Hover beam content</div>
  </BorderBeam>
</section>
