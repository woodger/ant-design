<script lang="ts">
  import { Avatar, Button, Card, CardGrid, CardMeta } from '$lib/components/ant-design';
  let loading = $state(false);
  let activeTabKey = $state<string | undefined>();
</script>

{#snippet avatar()}<Avatar alt="Команда проекта">AD</Avatar>{/snippet}
{#snippet extra()}<Button size="small" onclick={() => { loading = !loading; }}>{loading ? 'Показать' : 'Загрузка'}</Button>{/snippet}
<Card title="Карточка проекта" {extra} {loading} tabList={[{ key: 'overview', label: 'Обзор' }, { key: 'details', label: 'Детали' }]} bind:activeTabKey>
  <CardMeta {avatar} title={activeTabKey === 'details' ? 'Svelte 5 и TypeScript' : 'Ant Design Svelte'} description="Темы, адаптивная сетка и самостоятельные компоненты." />
</Card>
<Card title="Направления работы" style="margin-top:16px">
  <CardGrid style="width:50%">Поведение</CardGrid><CardGrid style="width:50%">Оформление</CardGrid>
</Card>
