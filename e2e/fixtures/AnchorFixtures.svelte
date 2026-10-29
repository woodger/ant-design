<script lang="ts">
  import Anchor from '../../src/lib/components/ant-design/Anchor.svelte';
  import AnchorLink from '../../src/lib/components/ant-design/AnchorLink.svelte';
  import type { AnchorItem } from '../../src/lib/components/ant-design/anchor.types';
  let container = $state<HTMLDivElement>();
  let horizontal = $state(false);
  let fixed = $state(false);
  let prevent = $state(false);
  let replace = $state(false);
  let mapped = $state(false);
  let legacy = $state(false);
  let mounted = $state(true);
  let targetOffset = $state(20);
  let changes = $state<string[]>([]);
  let clicked = $state('');
  const items: AnchorItem[] = [
    { key: 'one', href: '#anchor-one', title: 'First section', children: [{ key: 'nested', href: '#anchor-nested', title: 'Nested section' }] },
    { key: 'two', href: '#anchor-two', title: 'Second section', targetOffset: 50 },
    { key: 'three', href: '#anchor-three', title: 'Third section' },
    { key: 'space', href: '#anchor space', title: 'Section with space' }
  ];
</script>
<section id="anchor-fixture" aria-label="Anchor fixture">
  <label><input type="checkbox" bind:checked={horizontal} /> Horizontal Anchor</label>
  <label><input type="checkbox" bind:checked={fixed} /> Affixed Anchor</label>
  <label><input type="checkbox" bind:checked={prevent} /> Prevent Anchor history</label>
  <label><input type="checkbox" bind:checked={replace} /> Replace Anchor history</label>
  <label><input type="checkbox" bind:checked={mapped} /> Map Anchor highlight</label>
  <label><input type="checkbox" bind:checked={legacy} /> Legacy Anchor links</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Anchor</label>
  <label>Anchor target offset <input type="number" bind:value={targetOffset} /></label>
  <output aria-label="Anchor changes">{JSON.stringify(changes)}</output>
  <output aria-label="Anchor clicked">{clicked}</output>
  <div style="display:flex;gap:16px;align-items:start">
    <div style="width:190px;min-width:0">
      {#if mounted}
        <Anchor id="fixture-anchor" items={legacy ? undefined : items} affix={fixed} getContainer={() => container!} direction={horizontal ? 'horizontal' : 'vertical'}
          showInkInFixed {targetOffset} {replace} getCurrentAnchor={mapped ? () => '#anchor-three' : undefined}
          onChange={value => { changes = [...changes, value]; }} onClick={(event, link) => { clicked = link.href; if (prevent) event.preventDefault(); }}
          classNames={{ item: 'anchor-custom-item' }} styles={{ itemTitle: 'font-weight:500' }}>
          <AnchorLink href="#anchor-one" title="Legacy first"><AnchorLink href="#anchor-nested" title="Legacy nested" /></AnchorLink>
          <AnchorLink href="#anchor-two" title="Legacy second" targetOffset={50} />
        </Anchor>
      {/if}
    </div>
    <div bind:this={container} id="anchor-scroll" style="height:240px;overflow:auto;flex:1;min-width:0;background:var(--ant-color-fill-quaternary)">
      <div id="anchor-one" style="height:180px">First</div>
      <div id="anchor-nested" style="height:180px">Nested</div>
      <div id="anchor-two" style="height:180px">Second</div>
      <div id="anchor-three" style="height:180px">Third</div>
      <div id="anchor space" style="height:500px">Space</div>
    </div>
  </div>
</section>
