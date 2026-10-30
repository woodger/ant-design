<script lang="ts">
  import {
    Button,
    Collapse,
    ConfigProvider,
    Modal,
    type CollapseActiveKey,
    type CollapseItem,
    type CollapseTrigger,
    type ComponentSize
  } from 'antd-svelte';
  import PanelContent from './TabsContent.svelte';

  let activeKey = $state<CollapseActiveKey | undefined>();
  let accordion = $state(false);
  let collapsible = $state<CollapseTrigger>('header');
  let placement = $state<'start' | 'end'>('start');
  let size = $state<ComponentSize>('middle');
  let bordered = $state(true);
  let ghost = $state(false);
  let destroy = $state(false);
  let force = $state(false);
  let showArrow = $state(true);
  let showExtra = $state(true);
  let override = $state(false);
  let keepPreferences = $state(false);
  let destroyAdvanced = $state(false);
  let preferencesDisabled = $state(false);
  let profileRemoved = $state(false);
  let reversed = $state(false);
  let empty = $state(false);
  let many = $state(false);
  let long = $state(false);
  let duplicate = $state(false);
  let special = $state(false);
  let mutateCallback = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let defaultsMounted = $state(false);
  let defaults = $state<CollapseActiveKey>(['preferences']);
  let changes = $state<string[][]>([]);
  let owners = $state<CollapseActiveKey[]>([]);
  let lifecycle = $state<string[]>([]);
  let nestedChanges = $state<string[][]>([]);
  let defaultChanges = $state<string[][]>([]);
  let actions = $state(0);
  let submissions = $state(0);
  let modalOpen = $state(false);
  let base: CollapseItem[] = $derived([
    ...profileRemoved
      ? []
      : [
        {
          key: '',
          label: long
            ? 'Profile section with a very long descriptive title for the selected account'
            : profileLabel,
          children: profile,
          extra: showExtra ? profileExtra : undefined,
          collapsible: override ? 'header' as const : undefined,
          showArrow,
          forceRender: force
        }
      ],
    {
      key: special ? '" ][🙂' : 'preferences',
      label: 'Preferences section',
      children: preferences,
      collapsible: preferencesDisabled ? 'disabled' : undefined,
      showArrow,
      forceRender: force,
      destroyOnHidden: keepPreferences ? false : undefined
    },
    {
      key: 'locked',
      label: 'Locked section',
      children: locked,
      collapsible: 'disabled',
      showArrow,
      forceRender: force
    },
    {
      key: 'advanced',
      label: 'Advanced section',
      children: advanced,
      showArrow,
      forceRender: force,
      destroyOnHidden: destroyAdvanced || undefined
    },
    ...duplicate ? [{ key: '', label: 'Duplicate profile' }] : []
  ]);
  let items = $derived(
    empty
      ? []
      : many
        ? Array.from(
          { length: 8 },
          (_, index) =>
          ({
            key: `section-${index}`,
            label: `Collapse section ${index + 1}`,
            children: plain
          })
        )
        : reversed ? [...base].reverse() : base
  );

  function change(keys: string[]) {
    changes.push([...keys]);
    owners.push(typeof activeKey === 'string' ? activeKey : [...(activeKey ?? [])]);
    if (mutateCallback) keys.push('injected');
  }

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') preferencesDisabled = !preferencesDisabled;
    if (event.key === 'F4') activeKey = ['preferences'];
    if (event.key === 'F5') mounted = !mounted;
    if (event.key === 'F6') reversed = !reversed;
    if (event.key === 'F7') profileRemoved = !profileRemoved;
    if (event.key === 'F8') empty = !empty;
    if (event.key === 'F9') collapsible = collapsible === 'disabled' ? 'header' : 'disabled';
    if (event.key === 'F10') showExtra = !showExtra;
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .stage { margin-block: 16px; padding: 12px; background: var(--ant-color-bg-container); }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .modal-content { min-height: 180px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet profileLabel()}<strong>Profile section</strong>{/snippet}
{#snippet profileExtra()}<Button size="small" onclick={() => { actions++; }}>Profile action</Button>{/snippet}
{#snippet profile()}<PanelContent name="Profile" onLifecycle={(event) => lifecycle.push(event)} /><Button
  onclick={() => { activeKey = ['preferences']; }}
>Close Profile externally</Button>{/snippet}
{#snippet preferences()}<PanelContent
  name="Preferences"
  onLifecycle={(event) => lifecycle.push(event)}
/>{/snippet}
{#snippet locked()}<PanelContent
  name="Locked collapse"
  onLifecycle={(event) => lifecycle.push(event)}
/>{/snippet}
{#snippet advanced()}<Collapse
  aria-label="Nested collapse"
  headingLevel={3}
  items={[
    { key: 'nested', label: 'Nested section', children: nested },
    { key: 'locked', label: 'Nested locked section', collapsible: 'disabled' }
  ]}
  onChange={(keys) => nestedChanges.push([...keys])}
/>{/snippet}
{#snippet nested()}<PanelContent name="Nested" onLifecycle={(event) => lifecycle.push(event)} />{/snippet}
{#snippet plain()}<p>Plain Collapse content</p>{/snippet}
{#snippet modalContent()}<label>Modal collapse note<input value="Modal initial" /></label>{/snippet}

<section id="collapse-fixture" aria-label="Collapse fixture">
  <label><input type="checkbox" bind:checked={accordion} /> Accordion mode</label>
  <label><input type="checkbox" bind:checked={destroy} /> Destroy hidden Collapse</label>
  <label><input type="checkbox" bind:checked={force} /> Force render Collapse</label>
  <label><input type="checkbox" bind:checked={showArrow} /> Show Collapse arrows</label>
  <label><input type="checkbox" bind:checked={showExtra} /> Show Collapse extra</label>
  <label><input type="checkbox" bind:checked={override} /> Enable Profile override</label>
  <label><input type="checkbox" bind:checked={keepPreferences} /> Keep Preferences panel</label>
  <label><input type="checkbox" bind:checked={destroyAdvanced} /> Destroy Advanced panel</label>
  <label><input type="checkbox" bind:checked={empty} /> Empty Collapse items</label>
  <label><input type="checkbox" bind:checked={many} /> Many Collapse items</label>
  <label><input type="checkbox" bind:checked={long} /> Long Collapse label</label>
  <label><input type="checkbox" bind:checked={duplicate} /> Duplicate Collapse key</label>
  <label><input type="checkbox" bind:checked={special} /> Special Collapse key</label>
  <label><input type="checkbox" bind:checked={mutateCallback} /> Mutate Collapse callback</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Collapse theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Collapse theme</label>
  <label>Collapse mode <select bind:value={collapsible}><option>header</option><option>icon</option><option>disabled</option></select></label>
  <label>Collapse icon placement <select bind:value={placement}><option>start</option><option>end</option></select></label>
  <label>Collapse size <select bind:value={size}><option>small</option><option>middle</option><option>large</option></select></label>
  <label><input type="checkbox" bind:checked={bordered} /> Bordered Collapse</label>
  <label><input type="checkbox" bind:checked={ghost} /> Ghost Collapse</label>
  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}
    componentSize={size}
  >
    <form
      onsubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Button>Before Collapse</Button>
      <div class="stage">{#if mounted}<Collapse
        aria-label="Bound collapse"
        {items}
        bind:activeKey
        {accordion}
        {collapsible}
        expandIconPlacement={placement}
        {bordered}
        {ghost}
        destroyOnHidden={destroy}
        headingLevel={2}
        onChange={change}
      />{/if}</div>
      <Button>After Collapse</Button>
    </form>
    <label><input type="checkbox" bind:checked={defaultsMounted} /> Mount default Collapse</label>
    {#if defaultsMounted}<Collapse
      aria-label="Default collapse"
      defaultActiveKey={defaults}
      items={[
        { key: '', label: 'Default Profile', children: plain },
        { key: 'preferences', label: 'Default Preferences', children: plain }
      ]}
      onChange={(keys) => defaultChanges.push([...keys])}
    />{/if}
  </ConfigProvider>
  <div class="actions">
    <Button onclick={() => { activeKey = ''; }}>Set scalar Profile key</Button>
    <Button onclick={() => { activeKey = ['', 'preferences', 'missing']; }}>Set multiple Collapse keys</Button>
    <Button onclick={() => { activeKey = ['locked']; }}>Open disabled Collapse externally</Button>
    <Button onclick={() => { activeKey = []; }}>Close Collapse externally</Button>
    <Button onclick={() => { activeKey = undefined; }}>Clear Collapse owner</Button>
    <Button onclick={() => { defaults = ['']; }}>Replace Collapse default</Button>
  </div>
  <output aria-label="Collapse owner">{JSON.stringify(activeKey) ?? 'undefined'}</output>
  <output aria-label="Collapse changes">{JSON.stringify(changes)}</output>
  <output aria-label="Collapse callback owners">{JSON.stringify(owners)}</output>
  <output aria-label="Collapse lifecycle">{JSON.stringify(lifecycle)}</output>
  <output aria-label="Collapse actions">{actions}</output>
  <output aria-label="Collapse submissions">{submissions}</output>
  <output aria-label="Nested Collapse changes">{JSON.stringify(nestedChanges)}</output>
  <output aria-label="Default Collapse changes">{JSON.stringify(defaultChanges)}</output>
  <Button onclick={() => { modalOpen = true; }}>Open Collapse modal</Button>
  <Modal bind:open={modalOpen} title="Collapse modal"><div class="modal-content"><Collapse
    aria-label="Modal collapse"
    defaultActiveKey="details"
    items={[
      { key: 'details', label: 'Modal collapse details', children: modalContent },
      { key: 'other', label: 'Modal collapse other', children: plain }
    ]}
  /></div></Modal>
</section>
