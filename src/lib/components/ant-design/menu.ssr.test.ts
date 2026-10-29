import {render} from 'svelte/server';
import {describe,it,expect,vi} from 'vitest';
import Menu from './Menu.svelte';
import MenuFixtures from '../../../../e2e/fixtures/MenuFixtures.svelte';
describe('Menu SSR',()=>{
 it('renders groups dividers selection and expanded inline hierarchy',()=>{const body=render(Menu,{props:{mode:'inline',defaultOpenKeys:['p'],defaultSelectedKeys:['a'],items:[{key:'p',label:'Parent',children:[{type:'group',label:'Group',children:[{key:'a',label:'<Alpha>'}]},{type:'divider',dashed:true}]}]}}).body;expect(body).toContain('role="menu"');expect(body).toContain('role="group"');expect(body).toContain('role="separator"');expect(body).toContain('ant-menu-item-selected');expect(body).toContain('&lt;Alpha>');expect(body).toContain('padding-left:48px');});
 it('gives controlled empty keys priority over defaults and keeps closed popup content lazy',()=>{const body=render(Menu,{props:{items:[{key:'p',label:'Parent',children:[{key:'a',label:'Hidden child'}]}],openKeys:[],defaultOpenKeys:['p'],selectedKeys:[],defaultSelectedKeys:['p']}}).body;expect(body).not.toContain('Hidden child');expect(body).toContain('aria-expanded="false"');expect(body).not.toContain('ant-menu-item-selected');});
 it('renders an initially open popup hidden until client placement without timers',()=>{vi.useFakeTimers();try{const body=render(Menu,{props:{defaultOpenKeys:['p'],items:[{key:'p',label:'Parent',children:[{key:'a',label:'Child'}]}]}}).body;expect(body).toContain('popover="manual" hidden');expect(body).toContain('Child');expect(vi.getTimerCount()).toBe(0);}finally{vi.useRealTimers();}});
 it('preserves native snippet links and disabled state in the fixture',()=>{const body=render(MenuFixtures).body;expect(body).toContain('href="#menu-destination"');expect(body).toContain('aria-disabled="true"');expect(body).toContain('Workspace');});
});
