<script lang="ts">
  import { Row, Col, createBreakpoint } from '../../src/lib/components/ant-design';
  let horizontal = $state<number | undefined>(16);
  let vertical = $state<number | undefined>(8);
  let responsive = $state(false);
  let wrap = $state(true);
  let nested = $state(false);
  let hidden = $state(false);
  let mounted = $state(true);
  const breakpoint = createBreakpoint();
  $effect(() => breakpoint.connect(window));
</script>

<style>
  .surface { padding: 16px; max-width: 100%; background: var(--ant-color-bg-container); }
  .cell { background: var(--ant-color-primary-bg); padding: 8px; min-height: 40px; }
</style>

<section id="grid-fixture" aria-label="Grid fixture">
  <h2>Grid</h2>
  <label>Horizontal grid gap<input type="number" bind:value={horizontal} /></label>
  <label>Vertical grid gap<input type="number" bind:value={vertical} /></label>
  <label><input type="checkbox" bind:checked={responsive} /> Responsive grid</label>
  <label><input type="checkbox" bind:checked={wrap} /> Wrap grid</label>
  <label><input type="checkbox" bind:checked={nested} /> Nested grid</label>
  <label><input type="checkbox" bind:checked={hidden} /> Hide first grid column</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount grid</label>
  <div class="surface">
    {#if mounted}
      <Row id="fixture-row" gutter={responsive ? [{ xs: 8, md: 24, xxxl: 48 }, { xs: 4, md: 16 }] : [horizontal, vertical]} {wrap} align={responsive ? { xs: 'top', md: 'middle' } : 'top'} justify={responsive ? { xs: 'start', md: 'space-between' } : 'start'}>
        <Col id="grid-first" span={hidden ? 0 : 12} xs={responsive ? hidden ? 0 : 24 : undefined} md={responsive ? hidden ? 0 : 8 : undefined} xxxl={responsive ? hidden ? 0 : 6 : undefined}><div class="cell">First column</div></Col>
        <Col id="grid-second" span={12} xs={responsive ? 12 : undefined} md={responsive ? { span: 8, offset: 4, order: 1 } : undefined} xxxl={responsive ? { span: 6, offset: 0, order: 0 } : undefined}>
          <div class="cell">Second column
            {#if nested}<Row id="nested-row" gutter={8}><Col id="nested-column" span={12}>Nested</Col><Col span={12}>Sibling</Col></Row>{/if}
          </div>
        </Col>
      </Row>
      <Row id="grid-flex-row" wrap={false} gutter="2rem"><Col id="grid-fixed" flex="120px">Fixed</Col><Col id="grid-grow" flex={1}>Grow</Col></Row>
    {/if}
  </div>
  <output aria-label="Grid screens">{JSON.stringify(breakpoint.screens)}</output>
</section>
