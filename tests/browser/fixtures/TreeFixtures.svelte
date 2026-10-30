<script lang="ts">
  import {
    Tree,
    Form,
    createForm,
    type TreeDataNode,
    type TreeKey,
    type TreeCheckedKeys
  } from 'antd-svelte';

  let data = $state.raw<TreeDataNode[]>(
    [
      {
        key: 'root',
        title: 'Root',
        children: [
          { key: 'a', title: 'Alpha' },
          { key: 'b', title: 'Beta' },
          {
            key: 'locked',
            title: 'Locked',
            disabled: true,
            children: [{ key: 'locked-child', title: 'Locked child' }]
          },
          { key: 'no-check', title: 'No checkbox', disableCheckbox: true }
        ]
      }
    ]
  );
  let expanded = $state<TreeKey[]>(['root']);
  let selected = $state<TreeKey[]>([]);
  let checked = $state<TreeKey[] | TreeCheckedKeys>([]);
  let accept = $state(true);
  let multiple = $state(false);
  let strict = $state(false);
  let selectable = $state(true);
  let lines = $state(false);
  let autoParent = $state(false);
  let events = $state<string[]>([]);
  let lazyData = $state.raw<TreeDataNode[]>(
    [{ key: 'lazy', title: 'Lazy', isLeaf: false }, { key: 'leaf', title: 'Leaf', isLeaf: true }]
  );
  let loaded = $state<TreeKey[]>([]);
  let calls = $state(0);
  let loads = $state<string[]>([]);
  let pending: { resolve: () => void; reject: (error: Error) => void } | undefined;
  let initialCalls = $state(0);
  let initialData = $state
    .raw<TreeDataNode[]>([{ key: 'initial', title: 'Initially open', isLeaf: false }]);
  let show = $state(true);
  let loadedAccepted = $state(true);
  const form = createForm({ initialValues: {} });
</script>
<section id="tree-fixture" aria-label="Tree fixture">
  <Tree
    treeData={data}
    aria-label="Controlled tree"
    expandedKeys={expanded}
    selectedKeys={selected}
    checkedKeys={checked}
    checkable
    checkStrictly={strict}
    {multiple}
    {selectable}
    showLine={lines}
    autoExpandParent={autoParent}
    blockNode
    onExpand={(keys, info) => {
      events = [...events, `expand:${String(info.node.key)}:${info.expanded}`];
      if (accept) expanded = keys;
    }}
    onSelect={(keys, info) => {
      events = [
        ...events,
        `select:${String(info.node.key)}:${info.selected}:${info.selectedNodes.map(node => node.key)
          .join(',')}`
      ];
      if (accept) selected = keys;
    }}
    onCheck={(keys, info) => {
      events = [
        ...events,
        `check:${String(info.node.key)}:${info.checked}:${info.halfCheckedKeys?.join(',')
        ?? 'strict'}`
      ];
      if (accept) checked = keys;
    }}
  />
  {#if show}<Tree
    treeData={lazyData}
    aria-label="Lazy tree"
    loadedKeys={loaded}
    onLoad={(keys, info) => {
      loads = [...loads, `${info.event}:${String(info.node.key)}`];
      if (loadedAccepted) loaded = keys;
    }}
    loadData={() => {
      calls++;

      return new Promise<void>((resolve, reject) => { pending = { resolve, reject }; });
    }}
  />{/if}
  <Tree
    aria-label="Default tree"
    treeData={[{ key: 0, title: 'Zero', children: [{ key: 'child', title: 'Default child' }] }]}
    defaultExpandAll
    defaultSelectedKeys={['child']}
    checkable
    defaultCheckedKeys={[0]}
  />
  <Tree
    aria-label="Initially loaded tree"
    treeData={initialData}
    checkable
    defaultCheckedKeys={['initial']}
    defaultExpandedKeys={['initial']}
    loadData={async () => {
      initialCalls++;
      await Promise.resolve();
      initialData = [
        {
          ...initialData[0],
          children: [{ key: 'initial-child', title: 'Initial loaded child', isLeaf: true }]
        }
      ];
    }}
  />
  <output aria-label="Initial load calls">{initialCalls}</output>
  <Form {form} disabled><Tree
    aria-label="Form tree"
    treeData={[{ key: 'form', title: 'Form node' }]}
    checkable
  /><Tree
    aria-label="Enabled override tree"
    disabled={false}
    treeData={[{ key: 'override', title: 'Override node' }]}
  /></Form>
  <label><input type="checkbox" bind:checked={accept} /> Accept tree changes</label><label><input
    type="checkbox"
    bind:checked={multiple}
  /> Multiple tree selection</label><label><input
    type="checkbox"
    bind:checked={strict}
  /> Strict tree checks</label><label><input
    type="checkbox"
    bind:checked={selectable}
  /> Selectable tree titles</label><label><input
    type="checkbox"
    bind:checked={lines}
  /> Tree lines</label><label><input
    type="checkbox"
    bind:checked={autoParent}
  /> Auto expand parents</label><label><input
    type="checkbox"
    bind:checked={loadedAccepted}
  /> Accept loaded keys</label>
  <button type="button" onclick={() => { expanded = ['a']; }}>Expand Alpha owner</button>
  <button type="button" onclick={() => { expanded = ['locked-child']; }}>Expand nested tree owner</button>
  <button
    type="button"
    onclick={() => {
      data = data.map(node => ({ ...node, children: [...node.children ?? []].reverse() }));
    }}
  >Reverse tree siblings</button>
  <button
    type="button"
    onclick={() => {
      data = data.map(
        node => ({ ...node, children: (node.children ?? []).filter(child => child.key !== 'b') })
      );
    }}
  >Remove Beta owner</button>
  <button
    type="button"
    onclick={() => {
      lazyData = [
        {
          ...lazyData[0],
          children: [{ key: 'loaded-child', title: 'Loaded child', isLeaf: true }]
        },
        lazyData[1]
      ];
      pending?.resolve();
      pending = undefined;
    }}
  >Resolve tree load</button>
  <button
    type="button"
    onclick={() => {
      pending?.reject(Error('Tree fixture failure'));
      pending = undefined;
    }}
  >Reject tree load</button>
  <button type="button" onclick={() => { show = !show; }}>Toggle lazy tree</button>
  <output aria-label="Tree expanded">{JSON.stringify(expanded)}</output><output
    aria-label="Tree selected"
  >{JSON.stringify(selected)}</output><output
    aria-label="Tree checked"
  >{JSON.stringify(checked)}</output><output
    aria-label="Tree events"
  >{JSON.stringify(events)}</output>
  <output aria-label="Tree loaded">{JSON.stringify(loaded)}</output><output
    aria-label="Tree load events"
  >{JSON.stringify(loads)}</output><output
    aria-label="Tree load calls"
  >{calls}</output>
</section>
