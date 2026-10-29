<script lang="ts">
  import {Menu,Button,type MenuItemType} from '$lib/components/ant-design';
  let selected=$state<string[]>(['overview']);let opened=$state<string[]>(['guides']);let result=$state('');
  const items:MenuItemType[]=[{key:'overview',label:overview},{key:'guides',label:'Руководства',children:[{type:'group',key:'start',label:'Начало',children:[{key:'setup',label:'Подключение'},{key:'forms',label:'Формы'}]},{key:'advanced',label:'Дополнительно',children:[{key:'theme',label:'Темы'},{key:'locale',label:'Локализация'}]}]},{type:'divider',key:'divider'},{key:'archive',label:'Архив',disabled:true}];
</script>
{#snippet overview()}<a href="#overview">Обзор библиотеки</a>{/snippet}
<div style="max-width:400px">
  <Menu aria-label="Навигация примера" {items} mode="inline" selectedKeys={selected} openKeys={opened} onOpenChange={keys=>{opened=keys;}} onSelect={info=>{selected=info.selectedKeys;result=info.keyPath.join(' / ');}} onDeselect={info=>{selected=info.selectedKeys;result=info.keyPath.join(' / ');}} />
  <Button onclick={()=>{selected=['overview'];opened=['guides'];result='';}}>Сбросить меню</Button>
  <output aria-label="Выбранный пункт меню">{result}</output>
</div>
