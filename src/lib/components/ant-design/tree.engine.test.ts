import { describe, expect, it } from 'vitest';
import { buildTreeEntities, conductTreeCheck, expandTreeParents, flattenTree, selectTreeKeys, toggleTreeCheck, treeLeaf } from './tree.engine';
import type { TreeDataNode } from './tree.types';
const data: TreeDataNode[] = [{key:'p',children:[{key:'a'},{key:'b'},{key:'locked',disabled:true,children:[{key:'deep',children:[{key:'leaf'}]}]}]},{key:0,title:'Zero'}];
describe('Tree engines', () => {
  it('preserves keys, positions and ancestry while flattening only expanded branches', () => {
    const index = buildTreeEntities(data); expect(flattenTree(index, ['p']).map(item => item.key)).toEqual(['p','a','b','locked',0]);
    expect(index.entities.get('deep')).toMatchObject({pos:'0-0-2-0',level:2}); expect(index.entities.get('0')?.key).toBe(0);
  });
  it('expands ancestors until a disabled boundary and drops unknown keys', () => { const index = buildTreeEntities(data); expect(expandTreeParents(['leaf','absent'],index)).toEqual(['leaf','deep','locked']); });
  it('conducts parent checks down without crossing disabled nodes and excludes them from parent completeness', () => {
    const index = buildTreeEntities(data); expect(conductTreeCheck(['p'],index)).toEqual({checked:['p','a','b'],halfChecked:[]});
    expect(conductTreeCheck(['a','b'],index)).toEqual({checked:['a','b','p'],halfChecked:[]}); expect(conductTreeCheck(['a'],index)).toEqual({checked:['a'],halfChecked:['p']});
    expect(conductTreeCheck(['deep'],index)).toEqual({checked:['deep','leaf'],halfChecked:[]});
  });
  it('cleans descendants and ancestors when a child of a checked parent is unchecked', () => { const index = buildTreeEntities(data); expect(toggleTreeCheck('a',['p','a','b'],index,false)).toEqual({checked:['b'],halfChecked:['p']}); expect(toggleTreeCheck('p',['p','a','b'],index,false)).toEqual({checked:[],halfChecked:[]}); });
  it('treats disableCheckbox and checkable false as conduction boundaries', () => {
    const index = buildTreeEntities([{key:'p',children:[{key:'a',disableCheckbox:true,children:[{key:'child'}]},{key:'b',checkable:false},{key:'c'}]}]);
    expect(conductTreeCheck(['p'],index)).toEqual({checked:['p','c'],halfChecked:[]});
  });
  it('ignores missing checked keys and checks newly loaded children of a checked parent', () => { const index = buildTreeEntities([{key:'p',children:[{key:'new'}]}]); expect(conductTreeCheck(['missing','p'],index)).toEqual({checked:['p','new'],halfChecked:[]}); });
  it('toggles selection without inventing shift ranges or ctrl requirements', () => { expect(selectTreeKeys(['a'],'b',false)).toEqual(['b']); expect(selectTreeKeys(['a'],'b',true)).toEqual(['a','b']); expect(selectTreeKeys(['a'],'a',false)).toEqual([]); });
  it('keeps explicit isLeaf false expandable and recognizes loaded empty branches', () => { expect(treeLeaf({key:'a'},true,false)).toBe(false); expect(treeLeaf({key:'a'},true,true)).toBe(true); expect(treeLeaf({key:'a',isLeaf:false},true,true)).toBe(false); expect(treeLeaf({key:'a',isLeaf:true,children:[{key:'b'}]},true,false)).toBe(true); });
});

it('preserves source integer-key entity order in upward conduction callbacks',()=>{
  const index=buildTreeEntities([{key:'first',children:[{key:10}]},{key:'second',children:[{key:2}]}]);
  expect(conductTreeCheck([10,2],index)).toEqual({checked:[10,2,'second','first'],halfChecked:[]});
});
