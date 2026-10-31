<script lang="ts">
  import { ConfigProvider, Masonry, type MasonryItemType } from 'antd-svelte';

  type Data = { height: number; label: string; };
  let items = $state<MasonryItemType<Data>[]>([
    { key: 'a', height: 900, data: { height: 100, label: 'Alpha' } },
    { key: 'b', data: { height: 60, label: 'Beta' } },
    { key: 'c', data: { height: 120, label: 'Gamma' } },
    { key: 'd', data: { height: 80, label: 'Delta' } },
    { key: 'e', data: { height: 100, label: 'Epsilon' } }
  ]);
  let columns = $state('3');
  let responsive = $state(false);
  let gutter = $state('none');
  let fresh = $state(false);
  let taller = $state(false);
  let pinned = $state(false);
  let dark = $state(false);
  let styled = $state(false);
  let nested = $state(false);
  let feedback = $state(false);
  let slowLeave = $state(false);
  let mounted = $state(true);
  let width = $state(600);
  let childrenMode = $state('renderer');
  let nativeElement = $state<HTMLDivElement>();
  let layoutCount = $state(0);
  let lastLayout = $state<{ key: string | number; column: number; label: string; }[]>([]);
  let events = $state<string[]>([]);
  let selected = $derived(items.map(item => item.key === 'b' ? {
    ...item,
    children: childrenMode === 'zero' ? 0
      : childrenMode === 'false' ? false
        : childrenMode === 'empty' ? ''
          : childrenMode === 'snippet' ? ownContent : undefined
  } : item).map(item => item.key === 'e' && pinned ? { ...item, column: 1 } : item));

  function record(value: (MasonryItemType<Data> & { column: number; })[]) {
    layoutCount++;
    lastLayout = value.map(item => ({
      key: item.key,
      column: item.column,
      label: item.data.label
    }));

    if (feedback)
      items = items.map(item => ({
        ...item,
        column: value.find(next => next.key === item.key)?.column
      }));
  }

  function remove() {
    items = items.filter(item => item.key !== 'b');
  }

  function restore() {
    if (!items.some(item => item.key === 'b'))
      items = [items[0], { key: 'b', data: { height: 60, label: 'Beta' } }, ...items.slice(1)];
  }
</script>

<style>
  .holder { max-width: 100%; margin-block: 16px; }
  .tile { box-sizing: border-box; border: 1px solid var(--ant-color-border); padding: 4px; }
  .tile input { box-sizing: border-box; width: 100%; }
  .tile button { max-width: 100%; }
</style>

{#snippet ownContent()}<div style="height:45px">Own item content</div>{/snippet}
{#snippet row(info: { data: Data; key: string | number; index: number; column: number; })}
  <div
    class="tile"
    data-key={info.key}
    data-index={info.index}
    data-column={info.column}
    style={`height:${info.key === 'b' && taller ? 180 : info.data.height}px`}
  >
    <label>{info.data.label}<input aria-label={`Masonry draft ${info.key}`} /></label>
    {#if info.key === 'a'}<div contenteditable="true" role="textbox" aria-label="Masonry editable">Editable draft</div>{/if}
    {#if info.key === 'a'}<button type="button" onclick={() => {
      events.push('action');
    }}>Masonry action</button>{/if}
  </div>
{/snippet}

<section id="masonry-fixture">
  <h2>Masonry</h2>
  <label>Masonry columns<input bind:value={columns} /></label>
  <label>Masonry gutter<select bind:value={gutter}>
    <option value="none">None</option><option value="single">Single</option>
    <option value="pair">Pair</option><option value="responsive">Responsive</option>
    <option value="mixed">Mixed</option>
  </select></label>
  <label>Masonry children<select bind:value={childrenMode}>
    <option value="renderer">Renderer</option><option value="snippet">Snippet</option>
    <option value="zero">Zero</option><option value="false">False</option>
    <option value="empty">Empty</option>
  </select></label>
  <label><input type="checkbox" bind:checked={responsive} /> Responsive Masonry columns</label>
  <label><input type="checkbox" bind:checked={fresh} /> Fresh Masonry sizes</label>
  <label><input type="checkbox" bind:checked={taller} /> Taller Masonry child</label>
  <label><input type="checkbox" bind:checked={pinned} /> Pin Masonry item</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Masonry</label>
  <label><input type="checkbox" bind:checked={styled} /> Styled Masonry</label>
  <label><input type="checkbox" bind:checked={nested} /> Replace Masonry config</label>
  <label><input type="checkbox" bind:checked={feedback} /> Persist Masonry columns</label>
  <label><input type="checkbox" bind:checked={slowLeave} /> Slow Masonry leave</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Masonry</label>
  <button type="button" onclick={() => { width = width === 600 ? 480 : 600; }}>Resize Masonry root</button>
  <button type="button" onclick={() => { items = [...items].reverse(); }}>Reverse Masonry items</button>
  <button type="button" onclick={remove}>Remove Masonry item</button>
  <button type="button" onclick={restore}>Restore Masonry item</button>
  <button type="button" onclick={() => { items = []; }}>Empty Masonry items</button>
  <button type="button" onclick={() => {
    items = items.map(item => item.key === 'b'
      ? { ...item, data: { ...item.data, height: 180, label: 'Changed Beta' } } : item);
  }}>Replace Masonry item data</button>
  <button type="button" onclick={() => {
    nativeElement?.querySelector('.tile')?.dispatchEvent(new Event('load'));
  }}>Masonry image load</button>
  <button type="button" onclick={() => {
    nativeElement?.querySelector('.tile')?.dispatchEvent(new Event('error'));
  }}>Masonry image error</button>

  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', primary: 'purple' }}
    masonry={{
      class: 'masonry-context',
      style: 'outline-offset:6px',
      classNames: ({ props }) => ({ root: `context-columns-${props.columns}`, item: 'context-item' }),
      styles: { root: 'border-radius:4px', item: 'outline-offset:4px' }
    }}
  >
    <ConfigProvider masonry={nested ? { class: 'nested-masonry-context' } : undefined}>
      <div class="holder" style={`width:${width}px`}>
        {#if mounted}
          <Masonry
            items={selected}
            itemRender={row}
            columns={responsive ? { xs: 1, sm: 2, md: 3, lg: 4, xxl: 5, xxxl: 6 } : Number(columns)}
            gutter={gutter === 'single' ? 12 : gutter === 'pair' ? [12, 24]
              : gutter === 'responsive' ? { xs: 4, sm: 8, md: 12 }
                : gutter === 'mixed' ? [{ xs: 4, md: 12 }, 24] : 0}
            {fresh}
            onLayoutChange={record}
            class="fixture-masonry"
            rootClassName="masonry-owner"
            classNames={({ props }) => ({ root: `local-columns-${props.columns}`, item: 'local-item' })}
            styles={styled ? { root: 'outline-offset:8px', item: 'outline-offset:8px;position:relative;top:99px;width:99px' } : undefined}
            style={slowLeave ? '--ant-motion-duration-fast:1s' : styled ? 'outline-offset:10px' : undefined}
            bind:nativeElement
          />
        {/if}
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Masonry ref">{nativeElement?.tagName ?? 'none'}</output>
  <output aria-label="Masonry layout count">{layoutCount}</output>
  <output aria-label="Masonry layout">{JSON.stringify(lastLayout)}</output>
  <output aria-label="Masonry events">{events.join(',')}</output>
</section>
