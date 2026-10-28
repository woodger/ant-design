<script lang="ts">
  import { Button, Collapse, ConfigProvider, Drawer, Input, Modal, Popover, Select, Tabs, Tooltip, type DrawerPlacement, type DrawerSize } from '../../src/lib/components/ant-design';
  import PanelContent from './TabsContent.svelte';

  let open = $state(false);
  let mounted = $state(true);
  let placement = $state<DrawerPlacement>('right');
  let size = $state<DrawerSize>('default');
  let closable = $state(true);
  let keyboard = $state(true);
  let maskClosable = $state(true);
  let blur = $state(false);
  let destroy = $state(false);
  let force = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let long = $state(false);
  let headerless = $state(false);
  let showExtra = $state(true);
  let showFooter = $state(true);
  let initiallyOpen = $state(false);
  let modalOpen = $state(false);
  let insideModal = $state(false);
  let childOpen = $state(false);
  let events = $state<string[]>([]);
  let lifecycle = $state<string[]>([]);
  let actions = $state(0);
  let submissions = $state(0);

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;

    if (event.key === 'o') { event.preventDefault(); open = !open; }
    if (event.key === 'u') { event.preventDefault(); mounted = !mounted; }
    if (event.key === 'p') { event.preventDefault(); placement = placement === 'right' ? 'left' : 'right'; }
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .footer { display: flex; gap: 8px; justify-content: flex-end; }
  .long { min-height: 1600px; }
  .long p { max-width: 100%; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet title()}<strong>{long ? 'Fixture drawer with a very long descriptive heading for editing an account and its notification preferences' : 'Fixture drawer'}</strong>{/snippet}
{#snippet extra()}<button type="button" onclick={() => { actions++; }}>Drawer extra action</button>{/snippet}
{#snippet footer()}<div class="footer"><button type="button" onclick={() => { actions++; }}>Drawer footer action</button><Button onclick={() => { open = false; }}>Close Drawer externally</Button></div>{/snippet}
{#snippet tabProfile()}<label>Drawer tab note<Input defaultValue="Tab initial" /></label>{/snippet}
{#snippet tabSettings()}<p>Tab settings</p>{/snippet}
{#snippet collapseContent()}<label>Drawer collapse note<Input defaultValue="Collapse initial" /></label>{/snippet}
{#snippet popoverContent()}<label>Drawer popover note<Input defaultValue="Popover initial" /></label>{/snippet}
{#snippet content()}
  <form onsubmit={(event) => { event.preventDefault(); submissions++; }}>
    <PanelContent name="Drawer" onLifecycle={(event) => lifecycle.push(event)} />
    <label>Drawer choice<Select options={[{ value: 'alpha', label: 'Alpha' }, { value: 'beta', label: 'Beta' }]} /></label>
    <Tabs aria-label="Drawer tabs" items={[{ key: 'profile', label: 'Drawer profile', children: tabProfile }, { key: 'settings', label: 'Drawer settings', children: tabSettings }]} />
    <Collapse aria-label="Drawer sections" items={[{ key: 'details', label: 'Drawer details', children: collapseContent }]} />
    <Popover title="Drawer popover" content={popoverContent}><Button>Open Drawer popover</Button></Popover>
    <Tooltip title="Drawer explanation"><Button>Drawer tooltip trigger</Button></Tooltip>
    <Button onclick={() => { childOpen = true; }}>Open nested Drawer</Button>
    <Button onclick={() => { mounted = false; }}>Unmount Drawer</Button>
    <Button htmlType="submit">Submit Drawer form</Button>
    {#if long}<div class="long"><p>Long Drawer content</p><p>UnbrokenTitleWithoutSpacesThatMustWrapOnASmallScreenAndKeepEveryControlReachable</p></div><Button>Drawer last control</Button>{/if}
  </form>
  <Drawer bind:open={childOpen} title="Nested drawer" size={280}><label>Nested Drawer note<Input defaultValue="Nested initial" /></label></Drawer>
{/snippet}

<section id="drawer-fixture" aria-label="Drawer fixture">
  <label for="drawer-outside-input">Outside Drawer input</label>
  <Input id="drawer-outside-input" />
  <label>Drawer placement <select bind:value={placement}><option>right</option><option>left</option><option>top</option><option>bottom</option></select></label>
  <label>Drawer size <select bind:value={size}><option value="default">Default</option><option value="large">Large</option><option value="480px">480px</option><option value="50%">50%</option></select></label>
  <label><input type="checkbox" bind:checked={closable} /> Show Drawer close button</label>
  <label><input type="checkbox" bind:checked={keyboard} /> Escape closes Drawer</label>
  <label><input type="checkbox" bind:checked={maskClosable} /> Backdrop closes Drawer</label>
  <label><input type="checkbox" bind:checked={blur} /> Blur Drawer mask</label>
  <label><input type="checkbox" bind:checked={destroy} /> Destroy hidden Drawer</label>
  <label><input type="checkbox" bind:checked={force} /> Force render Drawer</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Drawer theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Drawer theme</label>
  <label><input type="checkbox" bind:checked={long} /> Long Drawer content</label>
  <label><input type="checkbox" bind:checked={headerless} /> Headerless Drawer</label>
  <label><input type="checkbox" bind:checked={showExtra} /> Show Drawer extra</label>
  <label><input type="checkbox" bind:checked={showFooter} /> Show Drawer footer</label>
  <button type="button" onclick={() => { mounted = true; open = true; }}>Open Drawer</button>
  <button type="button" onclick={() => { modalOpen = true; }}>Open Drawer host Modal</button>
  <label><input type="checkbox" bind:checked={initiallyOpen} /> Mount initially open Drawer</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    {#if mounted}<Drawer id="bound-drawer" bind:open title={headerless ? undefined : title} aria-label={headerless ? 'Fixture drawer' : undefined} {placement} {size} {closable} {keyboard} mask={{ closable: maskClosable, blur }} destroyOnHidden={destroy} forceRender={force} extra={showExtra ? extra : undefined} footer={showFooter ? footer : undefined} children={content} onClose={(event) => events.push(`${event.type}:${open}`)} />{/if}
    {#if initiallyOpen}<Drawer open title="Initially open drawer"><label>Initial Drawer note<Input defaultValue="Initial drawer value" /></label></Drawer>{/if}
  </ConfigProvider>
  <output aria-label="Drawer owner">{String(open)}</output>
  <output aria-label="Drawer events">{JSON.stringify(events)}</output>
  <output aria-label="Drawer lifecycle">{JSON.stringify(lifecycle)}</output>
  <output aria-label="Drawer actions">{actions}</output>
  <output aria-label="Drawer submissions">{submissions}</output>
  <Modal bind:open={modalOpen} title="Drawer host modal"><Button onclick={() => { insideModal = true; }}>Open Drawer in Modal</Button><Drawer bind:open={insideModal} title="Drawer inside modal"><label>Drawer in Modal note<Input defaultValue="Inside Modal" /></label></Drawer></Modal>
</section>
