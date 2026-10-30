<script lang="ts">
  import { untrack } from 'svelte';
  import { FloatButton, FloatButtonGroup, FloatButtonBackTop, ConfigProvider } from 'antd-svelte';
  import type { FloatButtonShape, FloatButtonPlacement } from 'antd-svelte';

  let { kind, startOpen = false }: { kind?: string; startOpen?: boolean } = $props();
  let shape = $state<FloatButtonShape>('circle');
  let content = $state('none');
  let primary = $state(false);
  let disabled = $state(false);
  let badge = $state(false);
  let dot = $state(false);
  let tooltip = $state('none');
  let link = $state(false);
  let submit = $state(false);
  let semantic = $state(false);
  let clicks = $state(0);
  let submissions = $state(0);
  let groupShape = $state<FloatButtonShape>('circle');
  let trigger = $state<'click' | 'hover' | undefined>('click');
  let placement = $state<FloatButtonPlacement>('top');
  let controlled = $state(untrack(() => startOpen));
  let open = $state(untrack(() => startOpen));
  let accept = $state(true);
  let groupDisabled = $state(false);
  let useItems = $state(true);
  let groupClicks = $state(0);
  let changes = $state<boolean[]>([]);
  let scrollArea = $state<HTMLDivElement>();
  let targetMode = $state('element');
  let threshold = $state(100);
  let showProgress = $state(true);
  let backClicks = $state(0);
  let configIcons = $state(false);
</script>
{#snippet richTooltip()}<strong>Floating help</strong>{/snippet}
{#snippet customClose()}<span data-testid="float-context-close">×</span>{/snippet}
{#snippet customBack()}<span data-testid="float-context-back">↑</span>{/snippet}
{#snippet one()}<FloatButton
  aria-label="First floating child"
  shape="square"
  tooltip="First child"
  onclick={() => { groupClicks++; }}
/>{/snippet}
{#snippet two()}<FloatButton
  aria-label="Second floating child"
  content="Two"
  onclick={() => { groupClicks++; }}
/>{/snippet}
{#snippet top()}<FloatButtonBackTop
  aria-label="Group back to top"
  visibilityHeight={0}
  target={() => scrollArea ?? null}
/>{/snippet}
<section id="float-button-fixture" aria-label="FloatButton fixture">
  <label>FloatButton shape <select aria-label="FloatButton shape" bind:value={shape}><option>circle</option><option>square</option></select></label>
  <label>FloatButton content <select aria-label="FloatButton content" bind:value={content}><option>none</option><option>text</option><option>zero</option><option>legacy</option><option>true</option></select></label>
  <label>FloatButton tooltip <select aria-label="FloatButton tooltip" bind:value={tooltip}><option>none</option><option>zero</option><option>props</option><option>rich</option></select></label>
  <label><input type="checkbox" bind:checked={primary} /> Primary FloatButton</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable FloatButton</label>
  <label><input type="checkbox" bind:checked={badge} /> FloatButton badge</label>
  <label><input type="checkbox" bind:checked={dot} /> FloatButton badge dot</label>
  <label><input type="checkbox" bind:checked={link} /> FloatButton href</label>
  <label><input type="checkbox" bind:checked={submit} /> FloatButton submit</label>
  <label><input type="checkbox" bind:checked={semantic} /> FloatButton semantic layers</label>
  <form
    onsubmit={event => {
      event.preventDefault();
      submissions++;
    }}
  >
    <FloatButton
      id="fixture-float-button"
      class="ant-float-btn-pure"
      aria-label="Floating action"
      {shape}
      type={primary ? 'primary' : 'default'}
      {disabled}
      href={link ? '#float-target' : undefined}
      htmlType={submit ? 'submit' : 'button'}
      content={content === 'text' ? 'Do' : content === 'zero' ? 0 : content === 'true' ? true : undefined}
      description={content === 'legacy' ? 'Old' : undefined}
      tooltip={tooltip === 'zero'
        ? 0
        : tooltip === 'rich'
          ? richTooltip
          : tooltip === 'props'
            ? { title: 'Floating props', placement: 'right' }
            : undefined}
      badge={badge ? { count: 5, dot } : undefined}
      classNames={semantic
        ? {
          root: 'float-local-root',
          icon: 'float-local-icon',
          content: 'float-local-content'
        }
        : undefined}
      styles={semantic ? { root: 'color:red', icon: 'color:green' } : undefined}
      style={semantic ? 'color:blue' : undefined}
      onclick={() => { clicks++; }}
    />
  </form>
  <output aria-label="FloatButton clicks">{clicks}</output><output
    aria-label="FloatButton submissions"
  >{submissions}</output>
  <label>Floating group shape <select aria-label="Floating group shape" bind:value={groupShape}><option>circle</option><option>square</option></select></label>
  <label>Floating group trigger <select aria-label="Floating group trigger" bind:value={trigger}><option
    value={undefined}
  >None</option><option>click</option><option>hover</option></select></label>
  <label>Floating group placement <select
    aria-label="Floating group placement"
    bind:value={placement}
  ><option>top</option><option>bottom</option><option>left</option><option>right</option></select></label>
  <label><input type="checkbox" bind:checked={controlled} /> Control floating group</label>
  <label><input type="checkbox" bind:checked={open} /> Owner floating open</label>
  <label><input type="checkbox" bind:checked={accept} /> Accept floating group requests</label>
  <label><input type="checkbox" bind:checked={groupDisabled} /> Disable floating group</label>
  <label><input type="checkbox" bind:checked={useItems} /> Structured floating items</label>
  <label><input type="checkbox" bind:checked={configIcons} /> Configure floating icons</label>
  <ConfigProvider
    floatButton={configIcons ? { backTopIcon: customBack } : undefined}
    floatButtonGroup={configIcons ? { closeIcon: customClose } : undefined}
  >
    <div style="position:relative;margin:150px 140px;min-height:60px">
      <FloatButtonGroup
        id="fixture-floating-group"
        aria-label="Floating menu"
        class="ant-float-btn-pure fixture-floating-group"
        style="width:40px"
        shape={groupShape}
        {trigger}
        {placement}
        disabled={groupDisabled ? true : undefined}
        open={controlled ? open : undefined}
        onOpenChange={next => {
          changes = [...changes, next];
          if (accept) open = next;
        }}
        items={useItems
          ? [
            { key: 'one', children: one },
            { key: 'two', children: two },
            { key: 'top', children: top }
          ]
          : undefined}
        classNames={semantic
          ? {
            trigger: 'float-trigger',
            triggerIcon: 'float-trigger-icon',
            item: 'float-item',
            itemIcon: 'float-item-icon'
          }
          : undefined}
      >
        {@render one()}{@render two()}{@render top()}
      </FloatButtonGroup>
    </div>
    <div
      id="float-scroll"
      bind:this={scrollArea}
      style="height:140px;width:260px;max-width:100%;overflow:auto;background:var(--ant-color-fill-quaternary)"
    ><div
      style="height:700px"
    >Scroll target</div></div>
    <button type="button" onclick={() => { if (scrollArea) scrollArea.scrollTop = 280; }}>Scroll floating target</button>
    <FloatButtonBackTop
      id="fixture-back-top"
      aria-label="Back to top"
      class={targetMode === 'window' || targetMode === 'document' ? '' : 'ant-float-btn-pure'}
      target={() =>
        targetMode === 'window'
          ? window
          : targetMode === 'document'
            ? document
            : targetMode === 'null' ? null : scrollArea ?? null}
      visibilityHeight={threshold}
      {showProgress}
      style={targetMode === 'window' || targetMode === 'document' ? 'inset-inline-end:84px' : undefined}
      onclick={() => { backClicks++; }}
    />
  </ConfigProvider>
  <label>BackTop target <select aria-label="BackTop target" bind:value={targetMode}><option>element</option><option>window</option><option>document</option><option>null</option></select></label>
  <label>BackTop threshold <input type="number" bind:value={threshold} /></label>
  <label><input type="checkbox" bind:checked={showProgress} /> Show BackTop progress</label>
  <output aria-label="BackTop clicks">{backClicks}</output><output
    aria-label="Floating group changes"
  >{JSON.stringify(changes)}</output><output
    aria-label="Floating item clicks"
  >{groupClicks}</output>
  <p id="float-target">FloatButton target</p><button type="button">Outside floating control</button>
  {#if kind === 'float-button'}<FloatButton
    id="fixture-fixed-float"
    aria-label="Fixed floating action"
  />{/if}
</section>
