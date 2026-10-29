<script lang="ts">
  import { Button, ButtonGroup, ConfigProvider } from '$lib/components/ant-design';
  let clicks = $state(0);
</script>

<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">
  <Button color="purple" variant="filled" iconPlacement="end" onclick={() => { clicks++; }}>
    {#snippet icon()}<span aria-hidden="true">★</span>{/snippet}
    Цветное действие ({clicks})
  </Button>
  <Button href="#overview">Перейти к обзору</Button>
  <ConfigProvider button={{ color: 'green', variant: 'outlined' }}>
    <ButtonGroup size="small"><Button onclick={() => { clicks--; }}>−</Button><Button onclick={() => { clicks++; }}>+</Button></ButtonGroup>
  </ConfigProvider>
</div>
