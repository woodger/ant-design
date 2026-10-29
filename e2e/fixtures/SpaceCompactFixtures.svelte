<script lang="ts">
  import { Button, ConfigProvider, Drawer, Input, InputNumber, Modal, Popover, Select, SpaceAddon, SpaceCompact } from '../../src/lib/components/ant-design';
  import type { SpaceCompactSize } from '../../src/lib/components/ant-design/space-compact.types';
  let size = $state<SpaceCompactSize | ''>('small');
  let reverse = $state(false);
  let hideFirst = $state(false);
  let override = $state(false);
  let text = $state('Initial draft');
  let numeric = $state<number | null>(12);
  let selected = $state<'a' | 'b' | undefined>('a');
  let variant = $state<'outlined' | 'filled' | 'borderless' | 'underlined'>('outlined');
  let status = $state<'error' | 'warning' | ''>('');
  let addonDisabled = $state(false);
  let modal = $state(false);
  let drawer = $state(false);
  let submissions = $state(0);
  let clicks = $state(0);
  let nestedSize = $state(true);
  let entries = $derived([
    ...hideFirst ? [] : [{ key: 'input', children: input }], { key: 'number', children: number }, { key: 'select', children: select }, { key: 'button', children: button }
  ]);
</script>

<svelte:window onkeydown={event => { if (event.key === 'F4') reverse = !reverse; if (event.key === 'F5') hideFirst = !hideFirst; }} />
{#snippet input()}<Input id="compact-text" aria-label="Compact draft" bind:value={text} size={override ? 'large' : undefined} style="width:140px" />{/snippet}
{#snippet number()}<InputNumber id="compact-number" class="fixture-compact-number" aria-label="Compact number" bind:value={numeric} style="width:90px" />{/snippet}
{#snippet select()}<Select id="compact-select" class="fixture-compact-select" aria-label="Compact select" bind:value={selected} options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]} style="width:120px" />{/snippet}
{#snippet button()}<Button aria-label="Apply compact group" onclick={() => { clicks++; }}>Apply</Button>{/snippet}
{#snippet firstNestedInput()}<Input id="nested-compact-first" aria-label="Nested first" style="width:90px" />{/snippet}
{#snippet nestedButton()}<Button class="nested-compact-button">Nested</Button>{/snippet}
{#snippet nestedLeft()}<SpaceCompact id="nested-compact-left" size={nestedSize ? 'small' : undefined} items={[firstNestedInput, nestedButton]} />{/snippet}
{#snippet lastNestedInput()}<Input id="nested-compact-end-input" aria-label="Nested end input" style="width:90px" />{/snippet}
{#snippet nestedEndButton()}<Button id="nested-compact-last">End</Button>{/snippet}
{#snippet nestedRight()}<SpaceCompact size="small" items={[lastNestedInput, nestedEndButton]} />{/snippet}
{#snippet v1()}<Button>Vertical first</Button>{/snippet}
{#snippet v2()}<Button>Vertical middle</Button>{/snippet}
{#snippet v3()}<Button>Vertical last</Button>{/snippet}
{#snippet before()}<SpaceAddon id="compact-addon-before" {variant} status={status || undefined} disabled={addonDisabled}>https://</SpaceAddon>{/snippet}
{#snippet addonInput()}<Input aria-label="Addon address" value="example" style="width:140px" />{/snippet}
{#snippet after()}<SpaceAddon id="compact-addon-after" {variant} status={status || undefined} disabled={addonDisabled}>.com</SpaceAddon>{/snippet}
{#snippet modalTrigger()}<Button onclick={() => { modal = true; }}>Open compact modal</Button><Modal bind:open={modal} title="Compact modal"><Input aria-label="Modal independent input" /><Button>Modal independent action</Button></Modal>{/snippet}
{#snippet drawerTrigger()}<Button onclick={() => { drawer = true; }}>Open compact drawer</Button><Drawer bind:open={drawer} title="Compact drawer" forceRender><Input aria-label="Drawer independent input" /><Button>Drawer independent action</Button></Drawer>{/snippet}
{#snippet popoverBody()}<Input aria-label="Popover independent input" /><Button>Popover independent action</Button>{/snippet}
{#snippet popoverTrigger()}<Popover trigger="click" aria-label="Compact popover" content={popoverBody}><Button>Open compact popover</Button></Popover>{/snippet}
<section id="space-compact-fixture" aria-label="Space Compact fixture">
  <label>Compact group size <select aria-label="Compact group size" bind:value={size}><option value="">Default</option><option>small</option><option>medium</option><option>large</option></select></label>
  <label><input type="checkbox" bind:checked={override} /> Override compact input size</label>
  <label><input type="checkbox" bind:checked={nestedSize} /> Explicit nested compact size</label>
  <label>Addon variant <select aria-label="Addon variant" bind:value={variant}><option>outlined</option><option>filled</option><option>borderless</option><option>underlined</option></select></label>
  <label>Addon status <select aria-label="Addon status" bind:value={status}><option value="">None</option><option>error</option><option>warning</option></select></label>
  <label><input type="checkbox" bind:checked={addonDisabled} /> Disabled addon appearance</label>
  <ConfigProvider componentSize="large">
    <form onsubmit={event => { event.preventDefault(); submissions++; }}>
      <SpaceCompact id="fixture-space-compact" items={reverse ? [...entries].reverse() : entries} size={size || undefined} block />
      <SpaceCompact id="nested-compact" size="small" items={[nestedLeft, button, nestedRight]} />
      <SpaceCompact id="vertical-compact" size={size || undefined} orientation="vertical" items={[v1, v2, v3]} />
      <SpaceCompact id="addon-compact" size={size || undefined} items={[before, addonInput, after]} />
      <SpaceCompact id="popup-compact" size="small" items={[modalTrigger, drawerTrigger, popoverTrigger]} />
      <button type="button">After Compact</button>
    </form>
  </ConfigProvider>
  <output aria-label="Compact submissions">{submissions}</output>
  <output aria-label="Compact clicks">{clicks}</output>
</section>
