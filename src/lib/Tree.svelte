<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import type { TreeProps, TreeKey, TreeEventNode, TreeCheckedKeys } from './tree.types';
  import {
    buildTreeEntities,
    flattenTree,
    expandTreeParents,
    conductTreeCheck,
    toggleTreeCheck,
    parseTreeChecked,
    selectTreeKeys,
    treeLeaf,
    treeCheckDisabled,
    type TreeEntity
  } from './tree.engine';
  import { createTreeLoader } from './tree-load.engine';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import TreeIcon from './TreeIcon.svelte';
  let {
    treeData = [],
    expandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    defaultExpandParent = true,
    autoExpandParent = false,
    selectedKeys,
    defaultSelectedKeys = [],
    selectable = true,
    multiple = false,
    checkable = false,
    checkStrictly = false,
    checkedKeys,
    defaultCheckedKeys = [],
    disabled,
    loadedKeys,
    loadData,
    onExpand,
    onSelect,
    onCheck,
    onLoad,
    onClick,
    onDoubleClick,
    onRightClick,
    onActiveChange,
    activeKey,
    showIcon = false,
    showLine = false,
    blockNode = false,
    icon,
    switcherIcon,
    switcherLoadingIcon,
    titleRender,
    filterTreeNode,
    focusable = true,
    height,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    tabindex = 0,
    onkeydown,
    onfocus,
    onblur,
    ...attributes
  }: TreeProps = $props();
  const config = useConfig();
  const form = useForm();
  const generated = $props.id();
  let index = $derived(buildTreeEntities(treeData));
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let expanded = $state.raw<TreeKey[]>(untrack(() => {
    const keys = expandedKeys
      ?? (defaultExpandAll
        ? index.ordered.filter(entry => entry.children.length).map(entry => entry.key)
        : defaultExpandedKeys);
    return autoExpandParent
      || defaultExpandParent
      && (expandedKeys !== undefined
        || !defaultExpandAll)
      ? expandTreeParents(keys, index)
      : [...keys];
  }));
  let selected = $state.raw<TreeKey[]>(
    untrack(
      () => [
        ...(multiple
          ? selectedKeys ?? defaultSelectedKeys
          : (selectedKeys ?? defaultSelectedKeys).slice(0, 1))
      ]
    )
  );
  let checked = $state.raw<TreeCheckedKeys>(untrack(() => {
    const initial = parseTreeChecked(checkedKeys ?? defaultCheckedKeys);
    return checkable && !checkStrictly
      ? conductTreeCheck(initial.checked, index)
      : checkable ? initial : { checked: [], halfChecked: [] };
  }));
  let loaded = $state.raw<TreeKey[]>([]);
  let loading = $state.raw<TreeKey[]>([]);
  let actualLoaded = $derived(loadedKeys ?? loaded);
  let checks = $derived(
    checkable
      ? checkStrictly ? checked : conductTreeCheck(checked.checked, index)
      : { checked: [], halfChecked: [] }
  );
  let visible = $derived(flattenTree(index, expanded));
  let current = $state<TreeKey | null>(null);
  let active = $derived(activeKey === undefined ? current : activeKey);
  let focused = $state(false);
  let focusElement = $state<HTMLDivElement>();
  let pointerFocus = false;
  let previous = untrack(
    () => ({ expandedKeys, autoExpandParent, selectedKeys, checkedKeys, treeData })
  );
  $effect(() => {
    const next = { expandedKeys, autoExpandParent, selectedKeys, checkedKeys, treeData };
    untrack(() => {
      if (next.expandedKeys !== previous.expandedKeys
        || next.autoExpandParent !== previous.autoExpandParent)
        expanded = autoExpandParent
          ? expandTreeParents(expandedKeys ?? expanded, index)
          : [...expandedKeys ?? expanded];
      if (next.selectedKeys !== previous.selectedKeys && selectedKeys !== undefined)
        selected = [...(multiple ? selectedKeys : selectedKeys.slice(0, 1))];
      if (checkable
        && (next.checkedKeys !== previous.checkedKeys
          || next.treeData !== previous.treeData)) {
        const parsed = parseTreeChecked(checkedKeys ?? checked);
        checked = checkStrictly ? parsed : conductTreeCheck(parsed.checked, index);
      }
      previous = next;
    });
  });
  const loader = createTreeLoader({
    load: node => loadData?.(node),
    loaded: () => actualLoaded,
    loading: () => loading,
    setLoading: keys => {
      loading = keys;
    },
    finish: (keys, node, success) => {
      if (success)
        onLoad?.(keys, { event: 'load', node });
      if (loadedKeys === undefined)
        loaded = keys;
    },
    fail: key => {
      if (expandedKeys === undefined)
        expanded = expanded.filter(item => item !== key);
    }
  });
  onDestroy(loader.dispose);
  $effect(() => {
    if (!loadData) return;
    const pending = visible.filter(
      entry => expanded.includes(entry.key)
        && !treeLeaf(
          entry.node,
          true,
          actualLoaded.includes(entry.key)
        )
        && !actualLoaded.includes(
          entry.key
        )
        && !loading.includes(
          entry.key
        )
        && !entry.children.length
    );
    untrack(() => {
      pending.forEach(entry => {
        void loader.load(eventNode(entry));
      });
    });
  });
  function eventNode(entry: TreeEntity): TreeEventNode {
    return {
      ...entry.node,
      key: entry.key,
      expanded: expanded.includes(entry.key),
      selected: selected.includes(entry.key),
      checked: checks.checked.includes(entry.key),
      halfChecked: checks.halfChecked.includes(entry.key),
      loaded: actualLoaded.includes(entry.key),
      loading: loading.includes(entry.key),
      pos: entry.pos,
      active: active === entry.key,
      dragOver: false,
      dragOverGapTop: false,
      dragOverGapBottom: false
    };
  }
  function nodeId(key: TreeKey) {
    return `ant-tree-${generated}-${encodeURIComponent(String(key))}`;
  }
  function leaf(entry: TreeEntity) {
    return treeLeaf(entry.node, Boolean(loadData), actualLoaded.includes(entry.key));
  }
  function setActive(key: TreeKey | null) {
    if (active === key) return;
    if (activeKey === undefined)
      current = key;
    onActiveChange?.(key);
    void tick().then(() => {
      if (key !== null)
        focusElement?.ownerDocument.getElementById(nodeId(key))?.scrollIntoView(
          { block: 'nearest', inline: 'nearest' }
        );
    });
  }
  function expand(entry: TreeEntity, event?: MouseEvent) {
    if (leaf(entry) || event && loading.includes(entry.key)) return;
    const node = eventNode(entry);
    const next = node.expanded
      ? expanded.filter(key => key !== entry.key)
      : [...expanded, entry.key];
    if (expandedKeys === undefined)
      expanded = next;
    onExpand?.(next, { expanded: !node.expanded, node, nativeEvent: event });
    if (!node.expanded && loadData)
      void loader.load(node);
  }
  function select(entry: TreeEntity, event?: MouseEvent) {
    if (blocked || entry.node.disabled || !(entry.node.selectable ?? selectable)) return;
    const node = eventNode(entry);
    const next = selectTreeKeys(selected, entry.key, multiple);
    if (selectedKeys === undefined)
      selected = next;
    onSelect?.(next, {
      event: 'select',
      selected: !node.selected,
      node,
      selectedNodes: next.flatMap(key => {
        const item = index.entities.get(String(key));
        return item ? [item.node] : [];
      }),
      nativeEvent: event
    });
  }
  function check(entry: TreeEntity, event?: MouseEvent, force?: boolean) {
    if (!checkable || blocked || treeCheckDisabled(entry.node)) return;
    const node = eventNode(entry);
    const target = force ?? !node.checked;
    const next = checkStrictly
      ? {
        checked: target
          ? [...new Set([...checks.checked, entry.key])]
          : checks.checked.filter(key => key !== entry.key),
        halfChecked: checks.halfChecked.filter(key => key !== entry.key)
      }
      : toggleTreeCheck(entry.key, checks.checked, index, target);
    const entries = next.checked.flatMap(key => {
      const entity = index.entities.get(String(key));
      return entity ? [entity] : [];
    });
    if (checkedKeys === undefined)
      checked = {
        checked: next.checked,
        halfChecked: checkStrictly ? checked.halfChecked : next.halfChecked
      };
    onCheck?.(
      checkStrictly ? next : next.checked,
      {
        event: 'check',
        node,
        checked: target,
        nativeEvent: event,
        checkedNodes: entries.map(item => item.node),
        ...(!checkStrictly
          ? {
            halfCheckedKeys: next.halfChecked,
            checkedNodesPositions: entries.map(item => ({ node: item.node, pos: item.pos }))
          }
          : {})
      }
    );
  }
  function click(entry: TreeEntity, event: MouseEvent) {
    onClick?.(event, eventNode(entry));
    if (entry.node.selectable ?? selectable)
      select(entry, event); else check(entry, event);
  }
  function focusIn(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    focused = true;
    if (!pointerFocus && active === null && !blocked)
      setActive(
        selected.find(key => visible.some(entry => entry.key === key)) ?? visible[0]?.key ?? null
      );
    onfocus?.(event);
  }
  function mouseFocus(event: MouseEvent) {
    event.preventDefault();
    if (!blocked) {
      pointerFocus = true;
      focusElement?.focus({ preventScroll: true });
      pointerFocus = false;
    }
  }
  function keyboard(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    if (blocked || event.isComposing || event.defaultPrevented) return;
    const position = visible.findIndex(entry => entry.key === active);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      const base = position < 0 && offset < 0 ? visible.length : position;
      setActive(
        visible.length ? visible[(base + offset + visible.length) % visible.length].key : null
      );
      event.preventDefault();
    }
    else if (event.key === 'Home' || event.key === 'End') {
      setActive((event.key === 'Home' ? visible[0] : visible.at(-1))?.key ?? null);
      event.preventDefault();
    }
    const entry = visible.find(item => item.key === active);
    if (entry) {
      if (event.key === 'ArrowLeft') {
        if (!leaf(entry) && expanded.includes(entry.key))
          expand(entry); else if (entry.parent)
          setActive(entry.parent.key);
        event.preventDefault();
      }
      else if (event.key === 'ArrowRight') {
        if (!leaf(entry) && !expanded.includes(entry.key))
          expand(entry); else if (entry.children.length)
          setActive(entry.children[0].key);
        event.preventDefault();
      }
      else if (event.key === 'Enter' || event.key === ' ') {
        if (event.key === 'Enter' && !leaf(entry)) {
          expand(entry);
          event.preventDefault();
        }
        else if (checkable && !treeCheckDisabled(entry.node)) {
          if (event.key === ' ' || !checks.checked.includes(entry.key)) {
            check(entry, undefined, event.key === 'Enter' ? true : undefined);
            event.preventDefault();
          }
        }
        else if (!checkable
          && selectable
          && !entry.node.disabled
          && entry.node.selectable !== false
          && (event.key === ' '
            || !selected.includes(
              entry.key
            ))) {
          select(entry);
          event.preventDefault();
        }
      }
    }
    onkeydown?.(event);
  }
  export function focus(options?: FocusOptions) {
    focusElement?.focus(options);
  }
  export function blur() {
    focusElement?.blur();
  }
</script>
<style>
  button.ant-tree-switcher, button.ant-tree-node-content-wrapper { padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:inherit; }
  button.ant-tree-node-content-wrapper { padding:0 var(--ant-padding-xs); }
  .ant-tree-list-holder-inner { display:flex;flex-direction:column; }
  .ant-tree-checkbox { flex-shrink:0;padding:0;border:0;background:transparent;cursor:pointer; }
  .ant-tree-checkbox:focus-visible { outline:2px solid var(--ant-color-primary); }
  .ant-tree-switcher:focus-visible { outline:2px solid var(--ant-color-primary); }
</style>
<div bind:this={nativeElement} class={[
    'ant-tree ant-tree-css-var',
    showLine && 'ant-tree-show-line',
    !showIcon && 'ant-tree-icon-hide',
    blockNode && 'ant-tree-block-node',
    !selectable && 'ant-tree-unselectable',
    blocked && 'ant-tree-disabled',
    focused && 'ant-tree-focused',
    config.direction === 'rtl' && 'ant-tree-rtl',
    className,
    rootClassName
  ]} {style} dir={config.direction}>
  <div {...attributes} bind:this={focusElement} class="ant-tree-list" role="tree" tabindex={!blocked && focusable ? tabindex : undefined} aria-multiselectable={multiple || undefined} aria-disabled={blocked || undefined} aria-activedescendant={visible.some(entry => entry.key === active)
      ? nodeId(active!)
      : undefined} onkeydown={keyboard} onfocus={focusIn} onblur={event => {
          focused = false;
          onblur?.(event);
        }}>
    <div class="ant-tree-list-holder" style:max-height={height === undefined ? undefined : `${height}px`} style:overflow={height === undefined ? undefined : 'auto'}>
    <div class="ant-tree-list-holder-inner">
      {#each visible as entry (entry.key)}
        {@const node = eventNode(entry)}
        {@const isLeaf = leaf(entry)}
        {@const unavailable = blocked || Boolean(entry.node.disabled)}
        {@const hasCheck = checkable && entry.node.checkable !== false}
        <div id={nodeId(entry.key)} role="treeitem" aria-labelledby={`${nodeId(entry.key)}-title`} aria-level={entry.level + 1} aria-posinset={entry.index + 1} aria-setsize={entry.siblings} aria-expanded={isLeaf ? undefined : node.expanded} aria-selected={(entry.node.selectable ?? selectable) && !unavailable
            ? node.selected
            : undefined} aria-checked={hasCheck && !unavailable
                ? node.halfChecked ? 'mixed' : node.checked
                : undefined} aria-disabled={unavailable} aria-busy={node.loading || undefined}
          class={[
              'ant-tree-treenode',
              `ant-tree-treenode-switcher-${node.expanded ? 'open' : 'close'}`,
              unavailable && 'ant-tree-treenode-disabled',
              node.selected && 'ant-tree-treenode-selected',
              node.checked && 'ant-tree-treenode-checkbox-checked',
              node.halfChecked && 'ant-tree-treenode-checkbox-indeterminate',
              node.loading && 'ant-tree-treenode-loading',
              active === entry.key && 'ant-tree-treenode-active',
              isLeaf && 'ant-tree-treenode-leaf',
              entry.ends.at(-1) && 'ant-tree-treenode-leaf-last',
              filterTreeNode?.(node) && 'filter-node',
              entry.node.class
            ]} style={entry.node.style}>
          <span class="ant-tree-indent" aria-hidden="true">{#each entry.ends.slice(0, -1) as end}<span class={[
              'ant-tree-indent-unit',
              !end && 'ant-tree-indent-unit-start',
              end && 'ant-tree-indent-unit-end'
            ]}></span>{/each}</span>
          {#if isLeaf}<span class="ant-tree-switcher ant-tree-switcher-noop" aria-hidden="true">{#if showLine}{#if typeof showLine === 'object' && showLine.showLeafIcon}<TreeIcon name="file" class="ant-tree-switcher-line-icon" />{:else}<span class="ant-tree-switcher-leaf-line"></span>{/if}{/if}</span>
          {:else}<button type="button" tabindex="-1" class={[
              'ant-tree-switcher',
              `ant-tree-switcher_${node.expanded ? 'open' : 'close'}`
            ]} aria-label={node.expanded
                ? config.locale.tree?.collapse ?? 'Collapse'
                : config.locale.tree?.expand ?? 'Expand'} aria-expanded={node.expanded} onmousedown={mouseFocus} onclick={event => expand(entry, event)}>{#if node.loading}{#if switcherLoadingIcon}{@render switcherLoadingIcon(node)}{:else}<TreeIcon name="loading" class="ant-tree-switcher-loading-icon" />{/if}{:else if switcherIcon}{@render switcherIcon(node)}{:else}<TreeIcon name={showLine ? node.expanded ? 'minus' : 'plus' : 'caret'} class={showLine
                  ? 'ant-tree-switcher-line-icon'
                  : 'ant-tree-switcher-icon'} />{/if}</button>{/if}
          {#if hasCheck}<button type="button" role="checkbox" tabindex="-1" aria-checked={node.halfChecked ? 'mixed' : node.checked} aria-labelledby={`${nodeId(entry.key)}-title`} disabled={unavailable || entry.node.disableCheckbox} class={[
              'ant-tree-checkbox',
              node.checked && 'ant-tree-checkbox-checked',
              node.halfChecked && 'ant-tree-checkbox-indeterminate',
              (unavailable || entry.node.disableCheckbox) && 'ant-tree-checkbox-disabled'
            ]} onmousedown={mouseFocus} onclick={event => check(entry, event)}><span class="ant-tree-checkbox-inner"></span></button>{/if}
          <button type="button" tabindex="-1" class={[
              'ant-tree-node-content-wrapper',
              `ant-tree-node-content-wrapper-${isLeaf
                ? 'normal'
                : node.expanded ? 'open' : 'close'}`,
              !unavailable && node.selected && 'ant-tree-node-selected'
            ]} onmousedown={mouseFocus} onclick={event => click(entry, event)} ondblclick={event => onDoubleClick?.(event, node)} oncontextmenu={event => {
                if (onRightClick) {
                  event.preventDefault();
                  onRightClick({ event, node });
                }
              }}>
            {#if showIcon}<span class={[
                'ant-tree-iconEle',
                `ant-tree-icon__${isLeaf ? 'docu' : node.expanded ? 'open' : 'close'}`
              ]}>{#if entry.node.icon}{@render entry.node.icon(node)}{:else if icon}{@render icon(node)}{/if}</span>{/if}
            <span id={`${nodeId(entry.key)}-title`} class="ant-tree-title">{#if titleRender}{@render titleRender(entry.node)}{:else if typeof entry.node.title === 'function'}{@render entry.node.title(entry.node)}{:else}{entry.node.title ?? '---'}{/if}</span>
          </button>
        </div>
      {/each}
    </div>
    </div>
  </div>
</div>
