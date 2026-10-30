<script lang="ts">
  import {
    ConfigProvider,
    Layout,
    LayoutHeader,
    LayoutContent,
    LayoutFooter,
    LayoutSider,
    type GridBreakpoint,
    type LayoutCollapseType
  } from 'antd-svelte';

  let collapsed = $state<boolean>();
  let width = $state('200');
  let collapsedWidth = $state('80');
  let breakpoint = $state<'none' | GridBreakpoint>('none');
  let siderTheme = $state<'dark' | 'light'>('dark');
  let hasSider = $state<'auto' | 'true' | 'false'>('auto');
  let mounted = $state(true);
  let hiddenTrigger = $state(false);
  let custom = $state(false);
  let reverse = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let changes = $state<{ collapsed: boolean; type: LayoutCollapseType }[]>([]);
  let breaks = $state<boolean[]>([]);
  let submissions = $state(0);
</script>

{#snippet trigger()}<span>Custom trigger</span>{/snippet}

<section id="layout-fixture" aria-label="Layout fixture">
  <h2>Layout</h2>
  <label>Sider width<input bind:value={width} /></label><label>Collapsed sider width<input
    bind:value={collapsedWidth}
  /></label>
  <label>Sider breakpoint<select bind:value={breakpoint}><option>none</option><option>xs</option><option>sm</option><option>md</option><option>lg</option><option>xl</option><option>xxl</option><option>xxxl</option></select></label>
  <label>Sider theme<select bind:value={siderTheme}><option>dark</option><option>light</option></select></label>
  <label>Has sider<select bind:value={hasSider}><option>auto</option><option>true</option><option>false</option></select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount sider</label><label><input
    type="checkbox"
    bind:checked={hiddenTrigger}
  /> Hide sider trigger</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom sider trigger</label><label><input
    type="checkbox"
    bind:checked={reverse}
  /> Reverse sider arrow</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark layout theme</label><label><input
    type="checkbox"
    bind:checked={compact}
  /> Compact layout theme</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form
      aria-label="Layout form"
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Layout
        id="fixture-layout"
        hasSider={hasSider === 'auto' ? undefined : hasSider === 'true'}
        style="min-height:280px;transform:translateZ(0)"
      >
        {#if mounted}<LayoutSider
          id="fixture-sider"
          aria-label="Workspace sidebar"
          bind:collapsed
          {width}
          {collapsedWidth}
          breakpoint={breakpoint === 'none' ? undefined : breakpoint}
          collapsible
          theme={siderTheme}
          reverseArrow={reverse}
          trigger={hiddenTrigger ? null : custom ? trigger : undefined}
          onCollapse={(collapsed, type) => { changes = [...changes, { collapsed, type }]; }}
          onBreakpoint={broken => { breaks = [...breaks, broken]; }}
          styles={{ body: 'padding:8px' }}
        >
          <label>Sidebar draft<input /></label><button type="button">Sidebar action</button>
        </LayoutSider>{/if}
        <Layout id="nested-layout"><LayoutHeader id="fixture-header" style="color:white">Header</LayoutHeader><LayoutContent
          id="fixture-content"
        ><button
          type="button"
        >Content action</button></LayoutContent><LayoutFooter
          id="fixture-footer"
        >Footer</LayoutFooter></Layout>
      </Layout>
    </form>
  </ConfigProvider>
  <output aria-label="Layout collapsed">{String(collapsed)}</output><output
    aria-label="Layout changes"
  >{JSON.stringify(changes)}</output><output
    aria-label="Layout breakpoints"
  >{JSON.stringify(breaks)}</output><output
    aria-label="Layout submissions"
  >{submissions}</output>
</section>
