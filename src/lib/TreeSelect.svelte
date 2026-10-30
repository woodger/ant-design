<script lang="ts" generics="ValueType extends TreeSelectValue = TreeSelectValue">
  import { tick, untrack } from 'svelte';
  import type { TreeSelectProps, TreeSelectValue, TreeSelectRawValue, TreeSelectLabeledValue, TreeSelectLabel } from './tree-select.types';
  import type { TreeDataNode, TreeEventNode, TreeKey } from './tree.types';
  import { treeSelectIndex, treeSelectLabeled, treeSelectChecks, treeSelectStrategy, treeSelectLabels, filterTreeSelect, toggleTreeSelect } from './tree-select.engine';
  import { expandTreeParents, treeCheckDisabled } from './tree.engine';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { connectPopup } from './popup.dom';
  import Tree from './Tree.svelte';
  import Icon from './Icon.svelte';
  import NoCompactStyle from './NoCompactStyle.svelte';
  let { treeData = [], value, defaultValue, multiple = false, treeCheckable = false, treeCheckStrictly = false, labelInValue = false, showCheckedStrategy,
    onChange, onSelect, onDeselect, showSearch, searchValue, onSearch, autoClearSearchValue, filterTreeNode, treeNodeFilterProp, treeNodeLabelProp,
    open, defaultOpen = false, onOpenChange, allowClear = false, onClear, notFoundContent, loading = false,
    treeExpandedKeys, treeDefaultExpandedKeys = [], treeDefaultExpandAll = false, onTreeExpand, treeLoadedKeys, onTreeLoad, loadData,
    treeLine = false, treeIcon = false, switcherIcon, treeTitleRender, listHeight = 256, popupMatchSelectWidth = true, placement,
    onPopupScroll, popupClassName = '', rootClassName = '', size, status, variant = 'outlined', disabled, id, name, placeholder,
    class: className = '', style, nativeElement = $bindable(), inputElement = $bindable(), onkeydown, onfocus, onblur, ...attributes }: TreeSelectProps<ValueType> = $props();
  const config = useConfig(); const form = useForm(); const field = useFormField(); const compact = useCompact(); const generated = $props.id();
  let internalValue = $state.raw<TreeSelectValue>(untrack(() => defaultValue));
  let actualValue = $derived(value === undefined ? internalValue : value);
  let items = $derived(treeSelectLabeled(actualValue));
  let index = $derived(treeSelectIndex(treeData));
  let checkable = $derived(treeCheckable || treeCheckStrictly);
  let isMultiple = $derived(checkable || multiple);
  let labeled = $derived(treeCheckStrictly || labelInValue);
  let conduction = $derived(treeCheckable && !treeCheckStrictly);
  let strategy = $derived(!treeCheckable ? 'SHOW_ALL' : showCheckedStrategy ?? 'SHOW_CHILD');
  let checks = $derived(treeSelectChecks(items, conduction, index));
  let display = $derived(treeSelectLabels(treeSelectStrategy(checks.checked, strategy, index).map(raw => ({ value:raw, label: labelInValue ? items.find(item => item.value === raw)?.label : undefined })), index, treeNodeLabelProp, items).map(item => ({...item,label:item.label ?? item.value})));
  let searchConfig = $derived({searchValue,onSearch,autoClearSearchValue,filterTreeNode,treeNodeFilterProp,...typeof showSearch === 'object' ? showSearch : {}});
  let internalSearch = $state(''); let search = $derived(searchConfig.searchValue ?? internalSearch);
  let canSearch = $derived(typeof showSearch === 'object' ? true : showSearch ?? isMultiple);
  let autoClear = $derived(searchConfig.autoClearSearchValue ?? true);
  let filtered = $derived(filterTreeSelect(treeData, search, searchConfig));
  let filteredIndex = $derived(treeSelectIndex(filtered));
  let blocked = $derived(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize); let resolvedStatus = $derived(status ?? field?.status);
  let controlId = $derived(id ?? field?.id ?? `ant-tree-select-${generated}`);
  let internalOpen = $state(untrack(() => defaultOpen)); let visible = $derived((open ?? internalOpen) && !blocked);
  let inputValue = $derived(isMultiple || visible && canSearch ? search : treeTitleRender ? '' : text(display[0]?.label));
  let mounted = $state(untrack(() => defaultOpen || open === true)); let shown = $state(false); let focused = $state(false);
  let popup = $state<HTMLDivElement>(); let treeElement = $state<HTMLDivElement>(); let active = $state<TreeKey | null>(null); let activeDescendant = $state<string>();
  let expanded = $state.raw<TreeKey[]>(untrack(() => treeDefaultExpandAll ? index.ordered.filter(entry => entry.children.length).map(entry => entry.key) : expandTreeParents(treeDefaultExpandedKeys, index)));
  let searchExpanded = $state.raw<TreeKey[]>([]); let loaded = $state.raw<TreeKey[]>([]);
  let panelExpanded = $derived(treeExpandedKeys ?? (search ? searchExpanded : expanded));
  let initialized = untrack(()=>defaultOpen || open===true);
  function initializePanel(){if(!initialized){expanded=treeDefaultExpandAll?index.ordered.filter(entry=>entry.children.length).map(entry=>entry.key):expandTreeParents(treeDefaultExpandedKeys,index);initialized=true;}}
  let previousOpen = false; let previousSearch = '';
  let previousProps = untrack(()=>({value,open,search:searchConfig.searchValue}));
  $effect(()=>{
    const next={value,open,search:searchConfig.searchValue};
    if(next.value!==previousProps.value)internalValue=next.value;
    if(next.open!==previousProps.open)internalOpen=Boolean(next.open);
    if(next.search!==previousProps.search)internalSearch=next.search??'';
    previousProps=next;
  });
  $effect(() => { if (blocked) internalOpen = false; });
  $effect(() => {
    const nextOpen = visible; const nextSearch = search;
    if (nextSearch !== previousSearch && nextSearch) searchExpanded = filteredIndex.ordered.filter(entry => entry.node.children !== undefined).map(entry => entry.key);
    if (nextOpen && (!previousOpen || nextSearch !== previousSearch)) {
      mounted = true;
      untrack(initializePanel);
      active = untrack(() => !isMultiple && checks.checked.length && !nextSearch ? checks.checked[0] : firstNode(filtered));
    }
    previousOpen = nextOpen; previousSearch = nextSearch;
  });
  $effect(() => {
    void active; void visible; void filteredIndex; const root = treeElement;
    void tick().then(() => { activeDescendant = visible ? root?.querySelector('[role="tree"]')?.getAttribute('aria-activedescendant') ?? undefined : undefined; });
  });
  $effect(() => {
    if (!visible || !popup || !nativeElement) return;
    const position = placement ?? (config.direction === 'rtl' ? 'bottomRight' : 'bottomLeft');
    return connectPopup(popup,nativeElement,{placement:position.startsWith('top')?'top':'bottom',align:position.endsWith('Right')?'right':'left',autoAdjustOverflow:true,maxWidth:'100vw',matchAnchorWidth:popupMatchSelectWidth !== false,preserveFocus:true,onPlacement:()=>{},onVisibilityChange:next=>{shown=next;},onDismiss:reason=>{requestOpen(false);if(reason==='escape')inputElement?.focus();}});
  });
  $effect(() => {
    if (!inputElement) return; const input=inputElement;
    input.setCustomValidity((attributes.required ?? field?.required) && !display.length ? config.locale.selectRequiredText ?? 'Please select a value.' : '');
    return ()=>input.setCustomValidity('');
  });
  function firstNode(nodes: typeof treeData): TreeKey | null {
    for (const node of nodes) { if(node.disabled || node.selectable === false)continue; if(!search || String(node[searchConfig.treeNodeFilterProp ?? 'value']).toLowerCase().includes(search.toLowerCase()))return node.value; const child=firstNode(node.children ?? []); if(child!==null)return child; } return null;
  }
  function text(label: TreeSelectLabel | undefined) { return typeof label === 'function' ? '' : label === undefined ? '' : String(label); }
  function requestOpen(next:boolean) { if(next && blocked || next === visible)return; if(next){initializePanel();mounted=true;} internalOpen=next;onOpenChange?.(next); }
  function searchInput(next: string) {
    const input = inputElement;
    internalSearch = next;
    searchConfig.onSearch?.(next);
    requestOpen(true);

    if (searchConfig.searchValue !== undefined && input) {
      void tick().then(() => {
        if (input === inputElement && input.isConnected) input.value = inputValue;
      });
    }
  }
  function publish(raw:TreeSelectRawValue[], extra: {triggerValue?:TreeSelectRawValue;selected?:boolean}) {
    const before=items;
    const nextItems=treeSelectLabels(raw.map(value=>({value})),index,treeNodeLabelProp,before);
    internalValue=nextItems;
    if(autoClear)internalSearch='';
    const values=conduction ? treeSelectStrategy(raw,strategy,index) : raw;
    const returnItems=treeSelectLabels([...values.map(value=>({value})),...treeCheckStrictly ? before.filter(item=>item.halfChecked && !values.includes(item.value)) : []],index,treeNodeLabelProp,before);
    const returnValue=labeled ? returnItems : returnItems.map(item=>item.value);
    onChange?.((isMultiple?returnValue:returnValue[0]) as ValueType,labeled?null:returnItems.map(item=>item.label!) ,{preValue:before.filter(item=>!item.halfChecked),triggerValue:extra.triggerValue,...checkable?{checked:extra.selected}:{selected:extra.selected}});
  }
  function choose(raw:TreeSelectRawValue, source:'option'|'selection'='option') {
    const node=index.values.get(raw); if(blocked || source==='option' && (!node || node.disabled || checkable && treeCheckDisabled(index.entities.get(String(raw))!.node)))return;
    const selected=!isMultiple || !checks.checked.includes(raw);
    const next=isMultiple?toggleTreeSelect(raw,selected,items,checks,conduction,index):[raw];
    publish(next,{triggerValue:raw,selected}); if(selected)onSelect?.(raw,node?{...node}:undefined);else onDeselect?.(raw,node?{...node}:undefined);
    if(!isMultiple)requestOpen(false);inputElement?.focus();
  }
  function clear() { if(blocked)return;onClear?.();publish([],{});inputElement?.focus(); }
  function panelSelect(node:TreeEventNode) { choose(node.key as TreeSelectRawValue); }
  function expandPanel(keys:TreeKey[]) { expanded=keys;searchExpanded=keys;onTreeExpand?.(keys); }
  function loadPanel(node:TreeEventNode) { return loadData?.({...node,...index.values.get(node.key as TreeSelectRawValue),key:node.key} as TreeEventNode & typeof treeData[number]) ?? Promise.resolve(); }
  function blurWithin(event:FocusEvent) {
    if(event.relatedTarget instanceof Node && (nativeElement?.contains(event.relatedTarget) || popup?.contains(event.relatedTarget)))return;
    queueMicrotask(()=>{const target=inputElement?.ownerDocument.activeElement;if(target && (nativeElement?.contains(target)||popup?.contains(target)))return;focused=false;field?.onBlur();requestOpen(false);if(autoClear)internalSearch='';});
  }
  async function keyboard(event:KeyboardEvent & {currentTarget:EventTarget & HTMLInputElement}) {
    onkeydown?.(event);if(event.defaultPrevented||event.isComposing||blocked)return;
    if(event.key==='Escape'){if(visible){event.preventDefault();event.stopPropagation();requestOpen(false);}return;}
    if(event.key==='Tab'){requestOpen(false);return;}
    if(event.key==='Backspace' && isMultiple && !search){const last=[...display].reverse().find(item=>!item.disabled);if(last){event.preventDefault();choose(last.value,'selection');}return;}
    if(event.key==='Enter'){event.preventDefault();if(!visible){requestOpen(true);return;}if(active!==null && index.values.get(active as TreeSelectRawValue)?.selectable!==false)choose(active as TreeSelectRawValue);return;}
    if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(event.key)){
      event.preventDefault();if(!visible){requestOpen(true);return;}await tick();
      treeElement?.querySelector('[role="tree"]')?.dispatchEvent(new KeyboardEvent('keydown',{key:event.key,bubbles:true,cancelable:true}));
    }
  }
  export function focus(options?:FocusOptions){inputElement?.focus(options);}
  export function blur(){inputElement?.blur();}
</script>
<style>
  .ant-select { display:flex;align-items:center;width:100%;position:relative; }
  .ant-select-content { min-width:0;position:relative; }
  .ant-select:focus-within { outline:2px solid var(--ant-color-primary);outline-offset:2px; }
  .ant-select .ant-select-input { position:relative;inset:auto;width:100%;min-width:0;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;line-height:inherit;cursor:inherit; }
  .ant-select-input::placeholder { color:var(--ant-color-text-placeholder); }
  .ant-select-multiple { height:auto;min-height:var(--ant-select-height); }
  .ant-select-multiple .ant-select-content { gap:0; }
  .ant-select-multiple .ant-select-input { flex:1 1 60px;width:60px;min-width:40px;max-width:100%; }
  .ant-select-multiple .ant-select-selection-item { flex:none;box-sizing:border-box;max-width:100%;min-width:0; }
  .ant-select-selection-item-remove,.clear { padding:0;border:0;background:transparent;cursor:pointer;flex:none; }
  .clear { margin-inline-end:4px;color:var(--ant-color-text-tertiary);display:flex; }
  .suffix { display:flex;flex:none;color:var(--ant-color-text-quaternary);pointer-events:none; }
  .single-snippet { position:absolute;pointer-events:none;inset-inline-start:0; }
  .popup { position:fixed;margin:0;border:0;overflow:visible; }
  .popup-body { overflow:auto; }
  .ant-select-selection-item-disabled { color:var(--ant-select-multiple-item-color-disabled); }
  .ant-select-selection-item-remove:focus-visible,.clear:focus-visible { outline:2px solid var(--ant-color-primary); }
</style>
{#snippet labelNode(item:TreeSelectLabeledValue)}{#if treeTitleRender && index.values.has(item.value)}{@render treeTitleRender(index.values.get(item.value)!)}{:else if typeof item.label==='function'}{@render item.label()}{:else}{item.label ?? item.value}{/if}{/snippet}
{#snippet panelTitle(node:TreeDataNode)}{@render labelNode({value:node.key as TreeSelectRawValue,label:index.values.get(node.key as TreeSelectRawValue)?.title ?? index.values.get(node.key as TreeSelectRawValue)?.label})}{/snippet}
<div bind:this={nativeElement} role="presentation" onpointerdown={event=>{if(!blocked && event.target instanceof Element && !event.target.closest('button,input')){event.preventDefault();inputElement?.focus();requestOpen(true);}}} dir={config.direction} style={style} class={['ant-select ant-select-css-var ant-tree-select-css-var ant-select-show-arrow',`ant-select-${variant}`,isMultiple?'ant-select-multiple':'ant-select-single',visible&&'ant-select-open',focused&&'ant-select-focused',blocked&&'ant-select-disabled',resolvedSize==='small'&&'ant-select-sm',resolvedSize==='large'&&'ant-select-lg',resolvedStatus&&`ant-select-status-${resolvedStatus}`,config.direction==='rtl'&&'ant-select-rtl',compactClasses('ant-select',config.direction,compact),className,rootClassName]}>
  <div class="ant-select-content">
    {#if isMultiple}{#each display as item(item.value)}<span class={['ant-select-selection-item',(blocked||item.disabled)&&'ant-select-selection-item-disabled']} title={text(item.label)}><span class="ant-select-selection-item-content">{@render labelNode(item)}</span>{#if !blocked&&!item.disabled}<button type="button" class="ant-select-selection-item-remove" aria-label={`${config.locale.removeText ?? 'Remove'} ${text(item.label)}`} onpointerdown={event=>event.preventDefault()} onclick={()=>choose(item.value,'selection')}><Icon name="close" /></button>{/if}</span>{/each}
    {:else if (!visible || !canSearch) && (treeTitleRender || typeof display[0]?.label==='function') && display[0]}<span class="single-snippet">{@render labelNode(display[0])}</span>{/if}
    <input {...attributes} bind:this={inputElement} id={controlId} class="ant-select-input" type="text" role="combobox" aria-haspopup="tree" aria-controls={`${controlId}-list`} aria-expanded={visible} aria-autocomplete={canSearch?'list':'none'} aria-activedescendant={visible?activeDescendant:undefined} aria-invalid={resolvedStatus==='error'||attributes['aria-invalid']||undefined} aria-describedby={[attributes['aria-describedby'],field?.describedBy].filter(Boolean).join(' ')||undefined} aria-required={attributes.required??field?.required} aria-busy={loading||undefined} autocomplete="off" disabled={blocked} readonly={!canSearch} placeholder={display.length?'':placeholder} value={inputValue} oninput={event=>searchInput(event.currentTarget.value)} onclick={()=>requestOpen(true)} onkeydown={keyboard} onfocus={event=>{focused=true;onfocus?.(event);}} onblur={event=>{onblur?.(event);blurWithin(event);}} />
  </div>
  {#if allowClear&&!blocked&&(display.length||search)}<button type="button" class="clear" aria-label={config.locale.clearText} onpointerdown={event=>event.preventDefault()} onclick={clear}><Icon name="close-circle-filled" /></button>{/if}
  <span class="suffix" aria-hidden="true"><Icon name={loading?'loading':'down'} /></span>
  {#if name??field?.name}{#each display as item(item.value)}<input type="hidden" name={name??field?.name} value={String(item.value)} disabled={blocked} />{/each}{/if}
</div>
<NoCompactStyle>{#if mounted}<div bind:this={popup} popover="manual" hidden={!visible||!shown} class={['popup ant-select-dropdown ant-select-css-var ant-tree-select-dropdown ant-tree-select-css-var',config.direction==='rtl'&&'ant-tree-select-dropdown-rtl',popupClassName]} style:width={typeof popupMatchSelectWidth==='number'?`${popupMatchSelectWidth}px`:undefined} onfocusout={blurWithin}>
  <div class="popup-body" style:max-height={`${listHeight}px`} onscroll={onPopupScroll}>
    {#if filtered.length}<Tree bind:nativeElement={treeElement} treeData={filteredIndex.data} id={`${controlId}-list`} aria-label={attributes['aria-label']??placeholder??config.locale.searchText} focusable={false} multiple={isMultiple} checkable={checkable} checkStrictly checkedKeys={{checked:checks.checked,halfChecked:checks.halfChecked}} selectedKeys={checkable?[]:checks.checked} expandedKeys={panelExpanded} activeKey={active} onActiveChange={key=>{active=key;}} onSelect={(_keys,info)=>panelSelect(info.node)} onCheck={(_keys,info)=>panelSelect(info.node)} onExpand={expandPanel} loadedKeys={treeLoadedKeys??loaded} onLoad={(keys)=>{onTreeLoad?.(keys);if(treeLoadedKeys===undefined)loaded=keys;}} loadData={visible&&!search&&loadData?loadPanel:undefined} showLine={treeLine} showIcon={treeIcon} {switcherIcon} titleRender={panelTitle} filterTreeNode={node=>Boolean(search&&String(index.values.get(node.key as TreeSelectRawValue)?.[searchConfig.treeNodeFilterProp??'value']).toLowerCase().includes(search.toLowerCase()))} />
    {:else}<div id={`${controlId}-list`} role="listbox" class="ant-select-empty">{#if typeof notFoundContent==='function'}{@render notFoundContent()}{:else if notFoundContent!==null}{notFoundContent??config.locale.emptyText}{/if}</div>{/if}
  </div>
</div>{/if}</NoCompactStyle>
