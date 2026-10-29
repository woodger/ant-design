<script lang="ts">
  import { Button, Layout, LayoutSider, LayoutHeader, LayoutContent, LayoutFooter } from '$lib/components/ant-design';
  let collapsed = $state(false);
</script>

<Layout style="min-height:240px">
  <LayoutSider theme="light" bind:collapsed trigger={null}>
    <nav aria-label="Разделы примера Layout"><a href="#layout">Обзор</a>{#if !collapsed}<p>Планирование и задачи</p>{/if}</nav>
  </LayoutSider>
  <Layout>
    <LayoutHeader style="padding-inline:16px;color:white">Рабочее пространство</LayoutHeader>
    <LayoutContent style="padding:16px"><Button onclick={() => { collapsed = !collapsed; }} aria-expanded={!collapsed}>{collapsed ? 'Развернуть меню' : 'Свернуть меню'}</Button></LayoutContent>
    <LayoutFooter style="padding:12px 16px">Состояние панели сохраняется при переключении.</LayoutFooter>
  </Layout>
</Layout>
