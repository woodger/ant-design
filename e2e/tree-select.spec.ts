import { test, expect } from './test';
import type { Page } from '@playwright/test';
const control=(page:Page)=>page.getByRole('combobox',{name:'Parent select',exact:true});
const popup=(page:Page)=>page.getByRole('tree',{name:'Parent select',exact:true});
const row=(page:Page,name:string)=>popup(page).getByRole('treeitem',{name,exact:true});
const choose=(page:Page,name:string)=>row(page,name).getByRole('button',{name,exact:true}).click();
const owner=(page:Page)=>page.getByLabel('Tree select value',{exact:true});
test.beforeEach(async({page})=>{await page.goto('http://127.0.0.1:4174?fixture=tree-select');});

test('TreeSelect single selection keeps focus and emits raw value, labels and source metadata',async({page})=>{
  await expect(control(page)).toHaveValue('Alpha');await control(page).click();await choose(page,'Beta');await expect(control(page)).toBeFocused();await expect(control(page)).toHaveValue('Beta');await expect(owner(page)).toHaveText('"b"');await expect(popup(page)).toHaveCount(0);await expect(page.getByLabel('Tree select changes',{exact:true})).toContainText('triggerValue');
  await page.getByRole('button',{name:'Read tree select FormData',exact:true}).click();await expect(page.getByLabel('Tree select FormData',{exact:true})).toHaveText('["b"]');
});

test('TreeSelect multiple selection is independent of parent checks and deselects on tag removal',async({page})=>{
  await page.getByLabel('Tree select multiple',{exact:true}).check();await control(page).click();await choose(page,'Beta');await expect(owner(page)).toHaveText('["a","b"]');await expect(popup(page)).toBeVisible();
  await page.getByRole('button',{name:'Удалить Alpha',exact:true}).click();await expect(owner(page)).toHaveText('["b"]');await expect(page.getByLabel('Tree select selection events',{exact:true})).toContainText('deselect:a');
});

for(const [strategy,value] of [['SHOW_CHILD','["a","b"]'],['SHOW_PARENT','["p"]'],['SHOW_ALL','["p","a","b"]']])test(`TreeSelect ${strategy} formats callbacks and tags after full-tree conduction`,async({page})=>{
  await page.getByRole('button',{name:'Clear tree select owner',exact:true}).click();await page.getByLabel('Tree select checkable',{exact:true}).check();await page.getByLabel('Tree select strategy',{exact:true}).selectOption(strategy);
  await control(page).click();await row(page,'Parent').getByRole('checkbox',{name:'Parent',exact:true}).click();await expect(owner(page)).toHaveText(value);await expect(row(page,'Locked').getByRole('checkbox')).toHaveAttribute('aria-checked','false');await expect(control(page)).toBeFocused();
});

test('TreeSelect strict mode forces labeled multiple values and does not conduct parent checks',async({page})=>{
  await page.getByRole('button',{name:'Clear tree select owner',exact:true}).click();await page.getByLabel('Tree select strict',{exact:true}).check();await control(page).click();await row(page,'Parent').getByRole('checkbox',{name:'Parent',exact:true}).click();await expect(owner(page)).toHaveText('[{"label":"Parent","value":"p"}]');await expect(row(page,'Alpha').getByRole('checkbox')).toHaveAttribute('aria-checked','false');await expect(page.getByLabel('Tree select changes',{exact:true})).toContainText('\\"labels\\":null');
});

test('TreeSelect labelInValue single mode emits a labeled object and null labels',async({page})=>{
  await page.getByLabel('Tree select labeled',{exact:true}).check();await control(page).click();await choose(page,'Beta');await expect(owner(page)).toHaveText('{"label":"Beta","value":"b"}');await expect(page.getByLabel('Tree select changes',{exact:true})).toContainText('\\"labels\\":null');
});

test('TreeSelect search preserves matching descendants and ancestors and supports filter bypass',async({page})=>{
  await control(page).fill('Alpha');await expect(row(page,'Parent')).toBeVisible();await expect(row(page,'Alpha')).toBeVisible();await expect(row(page,'Beta')).toHaveCount(0);await expect(page.getByLabel('Tree select search',{exact:true})).toHaveText('Alpha');
  await control(page).fill('Parent');await expect(row(page,'Beta')).toBeVisible();await page.getByLabel('Filter tree select',{exact:true}).uncheck();await control(page).fill('no-match');await expect(row(page,'Zero')).toBeVisible();
});

test('TreeSelect checking filtered parents still conducts through the complete data',async({page})=>{
  await page.getByRole('button',{name:'Clear tree select owner',exact:true}).click();await page.getByLabel('Tree select checkable',{exact:true}).check();await control(page).fill('Alpha');await row(page,'Parent').getByRole('checkbox').click();await expect(owner(page)).toHaveText('["a","b"]');
});

test('TreeSelect keyboard selects from the popup with input focus and closes on Escape',async({page})=>{
  await control(page).focus();await control(page).press('ArrowDown');await expect(popup(page)).toBeVisible();await expect(control(page)).toHaveAttribute('aria-activedescendant',/ant-tree-/);await control(page).press('ArrowDown');await control(page).press('Enter');await expect(owner(page)).toHaveText('"b"');await expect(control(page)).toBeFocused();
  await control(page).press('ArrowDown');await control(page).press('Escape');await expect(popup(page)).toHaveCount(0);
});

test('TreeSelect clear emits undefined single value and does not emit deselect for every node',async({page})=>{
  await control(page).locator('xpath=../..').getByRole('button',{name:'Очистить',exact:true}).click();await expect(owner(page)).toHaveText('null');await expect(control(page)).toHaveValue('');await expect(page.getByLabel('Tree select selection events',{exact:true})).toHaveText('[]');
});

test('TreeSelect controlled rejection keeps value and missing tree data retains its labeled object',async({page})=>{
  await page.getByLabel('Accept tree select changes',{exact:true}).uncheck();await control(page).click();await choose(page,'Beta');await expect(owner(page)).toHaveText('"a"');
  await page.getByLabel('Accept tree select changes',{exact:true}).check();await page.getByLabel('Tree select labeled',{exact:true}).check();await control(page).click();await choose(page,'Beta');await page.getByRole('button',{name:'Remove tree select data',exact:true}).click();await expect(control(page)).toHaveValue('Beta');await expect(owner(page)).toHaveText('{"label":"Beta","value":"b"}');
});

test('TreeSelect loadData is suspended during search, can retry rejection and retains loaded keys',async({page})=>{
  const input=page.getByRole('combobox',{name:'Lazy select',exact:true});await input.fill('Lazy');const panel=page.getByRole('tree',{name:'Lazy select',exact:true});await expect(panel).toBeVisible();await expect(page.getByLabel('Tree select load calls',{exact:true})).toHaveText('0');
  await input.fill('');const branch=panel.getByRole('treeitem',{name:'Lazy',exact:true});await branch.getByRole('button',{name:'Развернуть',exact:true}).click();await expect(page.getByLabel('Tree select load calls',{exact:true})).toHaveText('1');await page.getByRole('button',{name:'Reject tree select load',exact:true}).click();await input.click();await expect(page.getByLabel('Tree select load calls',{exact:true})).toHaveText('2');
  await page.getByRole('button',{name:'Resolve tree select load',exact:true}).click();await input.click();await expect(panel.getByRole('treeitem',{name:'Loaded child',exact:true})).toBeVisible();await expect(page.getByLabel('Tree select loaded',{exact:true})).toHaveText('["lazy"]');
});

test('TreeSelect disabled RTL and locale contexts reach selector and tree',async({page})=>{
  await page.getByLabel('Right to left',{exact:true}).check();await expect(control(page)).toHaveCSS('direction','rtl');await page.getByLabel('English locale',{exact:true}).check();await control(page).click();await row(page,'Parent').getByRole('button',{name:'Collapse',exact:true}).click();await expect(row(page,'Alpha')).toHaveCount(0);
  await page.getByLabel('Disable all components',{exact:true}).check();await expect(control(page)).toBeDisabled();await expect(popup(page)).toHaveCount(0);
});

test('TreeSelect integrates raw values with Form validation submit and reset',async({page})=>{
  await page.getByRole('button',{name:'Submit tree select',exact:true}).click();const input=page.getByRole('combobox',{name:'* Form parent',exact:true});await expect(input).toBeFocused();await expect(input).toHaveAccessibleDescription('Choose a parent');await input.click();await page.getByRole('tree',{name:'Поиск',exact:true}).getByRole('button',{name:'Beta',exact:true}).click();
  await page.getByRole('button',{name:'Submit tree select',exact:true}).click();await expect(page.getByLabel('Tree select submitted',{exact:true})).toHaveText('b');await page.getByRole('button',{name:'Reset tree select',exact:true}).click();await expect(input).toHaveValue('');
});

test('TreeSelect defaults retain numeric zero and uncontrolled changes',async({page})=>{
  const input=page.getByRole('combobox',{name:'Default select',exact:true});await expect(input).toHaveValue('Zero');await input.click();await page.getByRole('tree',{name:'Default select',exact:true}).getByRole('button',{name:'Beta',exact:true}).click();await expect(input).toHaveValue('Beta');
});

test('TreeSelect gallery hydrates and submits checked leaf values',async({page})=>{
  await page.goto('/ant-design#tree-select');const section=page.locator('#tree-select');await section.getByRole('button',{name:'Сохранить разделы',exact:true}).click();await expect(section.getByLabel('Сохранённые разделы',{exact:true})).toHaveText('button');
  await section.getByRole('combobox',{name:'* Подписка на разделы',exact:true}).click();await page.getByRole('tree').getByRole('checkbox',{name:'Input',exact:true}).click();await section.getByRole('button',{name:'Сохранить разделы',exact:true}).click();await expect(section.getByLabel('Сохранённые разделы',{exact:true})).toHaveText('button, input');
});

test('TreeSelect controlled open rejection preserves the closed state while reporting a request',async({page})=>{
  await page.getByLabel('Lock tree select closed',{exact:true}).check();await control(page).press('ArrowDown');await expect(control(page)).toHaveAttribute('aria-expanded','false');await expect(popup(page)).toHaveCount(0);await expect(page.getByLabel('Tree select openings',{exact:true})).toContainText('true');
});

test('TreeSelect uncontrolled search clears after selection and Backspace removes the last enabled tag',async({page})=>{
  const input=page.getByRole('combobox',{name:'Uncontrolled search',exact:true});await input.fill('a');const panel=page.getByRole('tree',{name:'Uncontrolled search',exact:true});await panel.getByRole('button',{name:'Alpha',exact:true}).click();await expect(input).toHaveValue('');await expect(input).toBeFocused();await input.press('Backspace');await expect(input.locator('xpath=../..').getByRole('button',{name:'Удалить Alpha',exact:true})).toHaveCount(0);
  const events=JSON.parse(await page.getByLabel('Uncontrolled changes',{exact:true}).innerText()).map((event:string)=>JSON.parse(event));expect(events[0].extra.preValue).toEqual([]);expect(events[1].extra.preValue).toEqual([{label:'Alpha',value:'a'}]);
});

test('TreeSelect popup scroll uses the configured viewport and keeps active descendant on the input',async({page})=>{
  await control(page).click();const body=page.locator('[popover]:popover-open .popup-body');await expect(body).toHaveCSS('max-height','96px');await body.evaluate(element=>{element.scrollTop=element.scrollHeight;});await expect.poll(()=>page.getByLabel('Tree select scrolls',{exact:true}).innerText()).not.toBe('0');await expect(control(page)).toBeFocused();
});

test('TreeSelect gallery inherits dark compact and RTL themes on a narrow viewport',async({page})=>{
  await page.goto('/ant-design#tree-select');const section=page.locator('#tree-select');const input=section.getByRole('combobox',{name:'* Подписка на разделы',exact:true});const host=section.locator('.ant-select').first();const color=await host.evaluate(el=>getComputedStyle(el).backgroundColor);
  await page.getByRole('button',{name:'◐ Тёмная тема',exact:true}).click();await expect.poll(()=>host.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(color);await page.locator('#overview').getByRole('button',{name:'Обычная',exact:true}).click();await input.click();await expect(page.getByRole('tree',{name:'Выберите разделы',exact:true}).getByRole('treeitem',{name:'Компоненты',exact:true})).toHaveCSS('height','20px');
  await input.press('Escape');await page.setViewportSize({width:375,height:812});await section.scrollIntoViewIfNeeded();await input.click();const box=await page.locator('[popover]:popover-open').boundingBox();expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(375);
});


test('TreeSelect strict half-checked values remain hidden in tags and survive the change callback',async({page})=>{
  await page.getByLabel('Tree select strict',{exact:true}).check();await page.getByRole('button',{name:'Set strict half owner',exact:true}).click();
  await expect(control(page).locator('xpath=../..').getByRole('button',{name:'Удалить Parent',exact:true})).toHaveCount(0);await control(page).click();await row(page,'Beta').getByRole('checkbox').click();
  const result=JSON.parse(await owner(page).innerText());expect(result).toEqual([{label:'Alpha',value:'a'},{label:'Beta',value:'b'},{label:'Parent',value:'p',halfChecked:true}]);
});

test('TreeSelect defaultExpandAll initializes against data available at the first popup opening',async({page})=>{
  await page.getByRole('button',{name:'Load deferred tree data',exact:true}).click();await page.getByRole('combobox',{name:'Deferred select',exact:true}).click();await expect(page.getByRole('tree',{name:'Deferred select',exact:true}).getByRole('treeitem',{name:'Alpha',exact:true})).toBeVisible();
});
