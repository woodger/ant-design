import { describe, expect, it } from 'vitest';
import { treeSelectIndex, treeSelectLabeled, treeSelectChecks, treeSelectStrategy, treeSelectLabels, filterTreeSelect, toggleTreeSelect } from './tree-select.engine';
import type { TreeSelectNode } from './tree-select.types';
const nodes: TreeSelectNode[]=[{value:'p',title:'Parent',children:[{value:'a',title:'Alpha'},{value:'b',title:'Beta'},{value:'disabled',disabled:true,title:'Locked'}]},{value:0,title:'Zero'}];
describe('TreeSelect value and search engines',()=>{
  it('uses value as tree identity and normalizes null and labeled values without losing zero',()=>{expect(treeSelectLabeled(null)).toEqual([]);expect(treeSelectLabeled(0)).toEqual([{value:0}]);expect(treeSelectIndex(nodes).entities.get('p')?.node.key).toBe('p');});
  it('conducts checks while keeping missing values ahead of known keys',()=>{const i=treeSelectIndex(nodes);expect(treeSelectChecks([{value:'missing'},{value:'p'}],true,i)).toEqual({checked:['missing','p','a','b'],halfChecked:[]});});
  it('formats SHOW_ALL, SHOW_PARENT and SHOW_CHILD independently of internal checks',()=>{const i=treeSelectIndex(nodes);const keys=['p','a','b'];expect(treeSelectStrategy(keys,'SHOW_ALL',i)).toEqual(keys);expect(treeSelectStrategy(keys,'SHOW_PARENT',i)).toEqual(['p']);expect(treeSelectStrategy(keys,'SHOW_CHILD',i)).toEqual(['a','b']);});
  it('keeps independent strict half-checked values outside full checks',()=>{expect(treeSelectChecks([{value:'p',halfChecked:true},{value:'a'}],false,treeSelectIndex(nodes))).toEqual({checked:['a'],halfChecked:['p']});});
  it('removes a child through full-tree clean conduction and retains unknown selections',()=>{const i=treeSelectIndex(nodes);const items=[{value:'missing'},{value:'p'}];const checks=treeSelectChecks(items,true,i);expect(toggleTreeSelect('a',false,items,checks,true,i)).toEqual(['missing','b']);});
  it('preserves ancestors of a match and all descendants of a matching parent',()=>{const result=filterTreeSelect(nodes,'Alpha',{treeNodeFilterProp:'title'});expect(result).toEqual([{...nodes[0],isLeaf:undefined,children:[{...nodes[0].children![0],isLeaf:undefined,children:[]}]}]);expect(filterTreeSelect(nodes,'Parent',{treeNodeFilterProp:'title'})[0].children).toHaveLength(3);});
  it('filters by value by default and supports disabled filtering and custom predicates',()=>{expect(filterTreeSelect(nodes,'Alpha',{})).toEqual([]);expect(filterTreeSelect(nodes,'Alpha',{filterTreeNode:false})).toBe(nodes);expect(filterTreeSelect(nodes,'x',{filterTreeNode:(_text,node)=>node.value===0})).toEqual([{...nodes[1],isLeaf:undefined,children:[]}]);});
  it('fills labels from nodes and preserves provided or previous labels for missing values',()=>{const i=treeSelectIndex(nodes);expect(treeSelectLabels([{value:'a'}],i)[0].label).toBe('Alpha');expect(treeSelectLabels([{value:'missing'}],i,undefined,[{value:'missing',label:'Cached'}])[0].label).toBe('Cached');expect(treeSelectLabels([{value:'a',label:'Custom'}],i)[0].label).toBe('Custom');});
});

it('isolates node field mutations in custom filter callbacks like the upstream legacy wrapper',()=>{
  const nodes:TreeSelectNode[]=[{value:'a',title:'Original'}];
  const result=filterTreeSelect(nodes,'a',{filterTreeNode:(_search,node)=>{node.title='Changed';return true;}});
  expect(nodes[0].title).toBe('Original');expect(result[0].title).toBe('Original');
});
