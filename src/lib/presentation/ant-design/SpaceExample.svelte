<script lang="ts">
  import { Button, Space } from '$lib/components/ant-design';
  let vertical = $state(false);
  let separator = $state(false);
  let clicks = $state(0);
</script>

{#snippet first()}<Button type="primary" onclick={() => { clicks++; }}>Сохранить ({clicks})</Button>{/snippet}
{#snippet second()}<Button>Предпросмотр</Button>{/snippet}
{#snippet third()}<a href="#space">Справка</a>{/snippet}
<label><input type="checkbox" bind:checked={vertical} /> Вертикально</label>
<label><input type="checkbox" bind:checked={separator} /> Разделители</label>
<Space items={[{ key: 'save', children: first }, { key: 'preview', children: second }, { key: 'help', children: third }]} {vertical} wrap separator={separator ? '·' : undefined} />
