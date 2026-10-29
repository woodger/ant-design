<script lang="ts">
  import { Descriptions, Tag } from '$lib/components/ant-design';
  let bordered = $state(true);
  let vertical = $state(false);
</script>

{#snippet status()}<Tag color="success">Работает</Tag>{/snippet}
<label><input type="checkbox" bind:checked={bordered} /> Рамка</label>
<label><input type="checkbox" bind:checked={vertical} /> Вертикально</label>
<Descriptions title="Параметры сервиса" {bordered} layout={vertical ? 'vertical' : 'horizontal'}
  column={{ xs: 1, sm: 2, lg: 3 }} items={[
    { key: 'name', label: 'Название', children: 'Ant Design Svelte' },
    { key: 'runtime', label: 'Среда', children: 'Svelte 5 / TypeScript' },
    { key: 'status', label: 'Статус', children: status },
    { key: 'description', label: 'Описание', children: 'Самостоятельная библиотека компонентов с темами, RTL и SSR.', span: 'filled' }
  ]} />
