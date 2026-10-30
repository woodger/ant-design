<script lang="ts">
  import { Affix } from 'antd-svelte';
  import type { AffixUpdatePosition } from 'antd-svelte';

  let container = $state<HTMLDivElement>();
  let instance = $state<{ updatePosition: AffixUpdatePosition }>();
  let bottom = $state(false);
  let windowTarget = $state(false);
  let missingTarget = $state(false);
  let mounted = $state(true);
  let offset = $state(10);
  let width = $state(260);
  let changes = $state<boolean[]>([]);
  let serialized = $state('');
</script>

<section id="affix-fixture" aria-label="Affix fixture">
  <label><input type="checkbox" bind:checked={bottom} /> Bottom Affix</label>
  <label><input type="checkbox" bind:checked={windowTarget} /> Window Affix</label>
  <label><input type="checkbox" bind:checked={missingTarget} /> Null Affix target</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Affix</label>
  <label>Affix offset <input type="number" bind:value={offset} /></label>
  <label>Affix width <input type="number" bind:value={width} /></label>
  <button type="button" onclick={() => instance?.updatePosition()}>Refresh Affix</button>
  <output aria-label="Affix changes">{JSON.stringify(changes)}</output>
  <output aria-label="Affix form data">{serialized}</output>
  <form
    onsubmit={event => {
      event.preventDefault();
      serialized = JSON.stringify([...new FormData(event.currentTarget)]);
    }}
  >
    <div
      id="affix-scroll"
      bind:this={container}
      style={`height:220px;overflow:auto;max-width:100%;width:${width}px;background:var(--ant-color-fill-quaternary)`}
    >
      <div style={`height:${bottom ? 320 : 80}px`}></div>
      {#if mounted}
        <Affix
          id="fixture-affix"
          class="affix-outer"
          rootClassName="affix-inner"
          bind:this={instance}
          offsetTop={bottom ? undefined : offset}
          offsetBottom={bottom ? offset : undefined}
          target={() => missingTarget ? null : windowTarget ? window : container ?? null}
          onChange={value => { changes = [...changes, Boolean(value)]; }}
        >
          <div style="height:40px;background:var(--ant-color-bg-container)"><input
            aria-label="Affix draft"
            name="draft"
            value="initial"
            style="width:100%;box-sizing:border-box"
          /></div>
        </Affix>
      {/if}
      <div style="height:500px"></div>
    </div>
    <button type="submit">Read Affix form</button>
  </form>
</section>
