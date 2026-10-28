<script lang="ts">
  import { ConfigProvider, Flex, type FlexProps } from '../../src/lib/components/ant-design';

  let orientation = $state<FlexProps['orientation']>();
  let vertical = $state(false);
  let wrap = $state<'default' | 'true' | 'false' | 'wrap' | 'nowrap' | 'wrap-reverse'>('default');
  let align = $state<FlexProps['align']>();
  let justify = $state<FlexProps['justify']>();
  let gap = $state('small');
  let numeric = $state(false);
  let flex = $state('');
  let inlineGap = $state('');
  let component = $state<'div' | 'section' | 'span'>('div');
  let empty = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let nativeElement = $state<HTMLElement>();
  let clicks = $state(0);
  let wrapping = $derived(wrap === 'default' ? undefined : wrap === 'true' ? true : wrap === 'false' ? false : wrap);
</script>

<style>
  .surface { padding: 16px; margin-block: 16px; background: var(--ant-color-bg-container); color: var(--ant-color-text); }
  .tile { box-sizing: border-box; flex-shrink: 0; width: 80px; min-height: 32px; }
</style>

{#snippet tiles()}
  <button class="tile" type="button">First Flex item</button><button class="tile" type="button">Second Flex item</button><button class="tile" type="button">Third Flex item</button>
{/snippet}

<section id="flex-fixture" aria-label="Flex fixture">
  <h2>Flex</h2>
  <label>Flex orientation<select bind:value={orientation}><option value={undefined}>inherit</option><option>horizontal</option><option>vertical</option></select></label>
  <label><input type="checkbox" bind:checked={vertical} /> Vertical Flex alias</label>
  <label>Flex wrap<select bind:value={wrap}><option>default</option><option>true</option><option>false</option><option>wrap</option><option>nowrap</option><option>wrap-reverse</option></select></label>
  <label>Flex align<select bind:value={align}><option value={undefined}>default</option><option>center</option><option>start</option><option>end</option><option>flex-start</option><option>flex-end</option><option>self-start</option><option>self-end</option><option>baseline</option><option>normal</option><option>stretch</option></select></label>
  <label>Flex justify<select bind:value={justify}><option value={undefined}>default</option><option>flex-start</option><option>flex-end</option><option>start</option><option>end</option><option>center</option><option>space-between</option><option>space-around</option><option>space-evenly</option><option>stretch</option><option>normal</option><option>left</option><option>right</option></select></label>
  <label>Flex gap<input bind:value={gap} /></label><label><input type="checkbox" bind:checked={numeric} /> Numeric Flex gap</label>
  <label>Flex shorthand<input bind:value={flex} /></label>
  <label>Flex inline gap<input bind:value={inlineGap} /></label>
  <label>Flex component<select bind:value={component}><option>div</option><option>section</option><option>span</option></select></label>
  <label><input type="checkbox" bind:checked={empty} /> Empty Flex</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Flex theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Flex theme</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <div class="surface">
      <button type="button">Before Flex</button>
      <Flex id="fixture-flex" aria-label="Items" {component} {orientation} {vertical} wrap={wrapping} {align} {justify}
        gap={gap === '' ? undefined : numeric ? Number(gap) : gap} flex={flex || undefined} bind:nativeElement
        class="custom-flex" rootClassName="outer-flex" style={`min-height:120px;font-size:21px;${inlineGap ? `gap:${inlineGap}` : ''}`}
        children={empty ? undefined : tiles} onclick={() => { clicks++; }}
      />
      <button type="button">After Flex</button>
    </div>
    <output aria-label="Flex native element">{nativeElement?.tagName}</output>
    <output aria-label="Flex clicks">{clicks}</output>
  </ConfigProvider>
</section>
