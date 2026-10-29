<script lang="ts">
  import Descriptions from '../../src/lib/components/ant-design/Descriptions.svelte';
  import ConfigProvider from '../../src/lib/components/ant-design/ConfigProvider.svelte';
  let bordered = $state(false);
  let vertical = $state(false);
  let colon = $state(true);
  let small = $state(false);
  let dark = $state(false);
  let nested = $state(false);
  let responsive = $state(false);
  let visible = $state(true);
</script>

{#snippet draft()}<label>Details draft <input aria-label="Details draft" value="Initial draft" /></label>{/snippet}
{#snippet inner()}
  <Descriptions id="nested-descriptions" size="large" bordered={false} column={1} items={[{ label: 'Inner field', children: 'Inner value' }]} />
{/snippet}
<section id="descriptions-fixture" aria-label="Descriptions fixture">
  <label><input type="checkbox" bind:checked={bordered} /> Bordered details</label>
  <label><input type="checkbox" bind:checked={vertical} /> Vertical details</label>
  <label><input type="checkbox" bind:checked={colon} /> Details colon</label>
  <label><input type="checkbox" bind:checked={small} /> Small details</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark details</label>
  <label><input type="checkbox" bind:checked={nested} /> Nested details</label>
  <label><input type="checkbox" bind:checked={responsive} /> Responsive details</label>
  <label><input type="checkbox" bind:checked={visible} /> Mount details</label>
  <ConfigProvider componentSize={small ? 'small' : undefined} theme={{ mode: dark ? 'dark' : 'light' }}>
    {#if visible}
      <Descriptions id="fixture-descriptions" title="Service details" extra={0} {bordered} {colon} layout={vertical ? 'vertical' : 'horizontal'}
        column={responsive ? { xs: 1, sm: 2, md: 3, xl: 4 } : 3}
        labelStyle="color:red" styles={{ label: 'color:green' }} items={[
          { key: 'product', label: 'Product', children: 'Cloud database', style: 'background:rgb(255, 255, 0)', labelStyle: 'color:blue', contentStyle: 'color:purple', styles: { content: 'color:rgb(1, 2, 3)' } },
          { key: 'zero', label: 0, children: 0, span: responsive ? { md: 2 } : 1 },
          { key: 'draft', label: 'Draft', children: draft, span: 'filled' },
          { key: 'nested', label: 'Nested', children: nested ? inner : 'Plain value', span: 'filled' }
        ]} />
    {/if}
  </ConfigProvider>
  <Descriptions id="reference-descriptions" size="large" column={1} items={[{ label: 'Inner field', children: 'Inner value' }]} />
</section>
