<script lang="ts">
  import { Tree, Button, type TreeDataNode, type TreeKey, type TreeCheckedKeys } from '$lib/components/ant-design';
  const initial: TreeDataNode[] = [{key:'docs',title:'Документация',children:[{key:'start',title:'Начало работы',isLeaf:true},{key:'components',title:'Компоненты',children:[{key:'button',title:'Button',isLeaf:true},{key:'input',title:'Input',isLeaf:true}]}]},{key:'examples',title:'Примеры',isLeaf:false}];
  let nodes = $state.raw(initial); let expanded = $state<TreeKey[]>(['docs']); let selected = $state<TreeKey[]>([]); let checked = $state<TreeKey[] | TreeCheckedKeys>([]);
  let loaded = $state<TreeKey[]>([]);
  let result = $state(''); let generation = 0;
  async function load(node: {key:TreeKey}) {
    const version=generation; await Promise.resolve(); if(version!==generation)return;
    nodes=nodes.map(item=>item.key===node.key?{...item,children:[{key:'form-demo',title:'Форма',isLeaf:true},{key:'table-demo',title:'Таблица',isLeaf:true}]}:item);
  }
</script>
<div style="max-width:640px">
  <Tree aria-label="Дерево разделов" treeData={nodes} checkable showLine blockNode expandedKeys={expanded} selectedKeys={selected} checkedKeys={checked} loadedKeys={loaded} onLoad={keys=>{loaded=keys;}} loadData={load}
    onExpand={keys=>{expanded=keys;}} onSelect={(keys,info)=>{selected=keys;result=info.selectedNodes.map(node=>typeof node.title==='string'?node.title:String(node.key)).join(', ');}} onCheck={keys=>{checked=keys;}} />
  <p>Выбор строки и отметки независимы. Ветка «Примеры» загружается при раскрытии.</p>
  <Button onclick={()=>{generation++;nodes=initial;expanded=['docs'];selected=[];checked=[];loaded=[];result='';}}>Сбросить дерево</Button>
  <output aria-label="Выбранный раздел">{result}</output>
</div>
