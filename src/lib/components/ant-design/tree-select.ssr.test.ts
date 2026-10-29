import { render } from 'svelte/server';
import { describe,it,expect,vi } from 'vitest';
import TreeSelect from './TreeSelect.svelte';
import TreeSelectFixtures from '../../../../e2e/fixtures/TreeSelectFixtures.svelte';
describe('TreeSelect SSR',()=>{
  it('renders scalar labels, raw form values and tree popup semantics',()=>{const body=render(TreeSelect,{props:{treeData:[{value:0,title:'Zero'}],value:0,name:'parent'}}).body;expect(body).toContain('value="Zero"');expect(body).toContain('type="hidden" name="parent" value="0"');expect(body).toContain('aria-haspopup="tree"');expect(body).not.toContain('role="tree"');});
  it('renders strategies and gives controlled null priority over defaults',()=>{const data=[{value:'p',title:'Parent',children:[{value:'a',title:'Alpha'}]}];const body=render(TreeSelect,{props:{treeData:data,treeCheckable:true,value:['p'],showCheckedStrategy:'SHOW_PARENT'}}).body;expect(body).toContain('Parent');expect(body).not.toContain('Alpha');expect(render(TreeSelect,{props:{treeData:data,value:null,defaultValue:'p'}}).body).not.toContain('value="Parent"');});
  it('renders an initially open popup hidden and does not load on the server',()=>{const load=vi.fn(()=>Promise.resolve());const body=render(TreeSelect,{props:{treeData:[{value:'p',title:'Parent',isLeaf:false}],defaultOpen:true,treeDefaultExpandedKeys:['p'],loadData:load}}).body;expect(body).toContain('role="tree"');expect(body).toContain('popover="manual" hidden');expect(load).not.toHaveBeenCalled();});
  it('renders fixture state without browser APIs or timers',()=>{vi.useFakeTimers();try{const body=render(TreeSelectFixtures).body;expect(body).toContain('value="Alpha"');expect(body).toContain('value="Zero"');expect(vi.getTimerCount()).toBe(0);}finally{vi.useRealTimers();}});
});
