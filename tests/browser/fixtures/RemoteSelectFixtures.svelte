<script lang="ts">
  import { Select, type SelectOption } from 'antd-svelte';

  let options = $state<readonly SelectOption<number>[]>(
    [
      { value: 0, label: 'Cached zero' },
      { value: 9, label: 'Locked remote', disabled: true }
    ]
  );
  let single = $state<number | undefined>(0);
  let multiple = $state<number[]>([0, 9]);
  let query = $state('');
  let calls = $state<string[]>([]);
  let accept = $state(true);
  let configObject = $state(false);
  let loading = $state(false);
  let error = $state(false);
  let scrolls = $state(0);
  let pages = $state(0);
  let data = $state('');

  function search(next: string) {
    calls = [...calls, next];
    if (accept) query = next;
  }

  function page() {
    options = Array.from(
      { length: 20 },
      (_, n) => ({ value: n + 20, label: `Server result ${n + 20}` })
    );
  }
</script>
{#snippet empty()}<span role={error ? 'alert' : 'status'}>{error ? 'Remote request failed' : loading ? 'Remote loading' : 'Remote empty'}</span>{#if error}<button
  type="button"
  onpointerdown={event => event.preventDefault()}
  onclick={() => {
    error = false;
    page();
  }}
>Retry remote results</button>{/if}{/snippet}
<section id="remote-select-fixture" aria-label="Remote Select fixture">
  <form
    onsubmit={event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      data = JSON.stringify(
        { single: form.get('single'), multiple: form.getAll('multiple') }
      );
    }}
  >
    <label for="remote-single">Remote single</label>
    <Select
      id="remote-single"
      name="single"
      options={options}
      bind:value={single}
      showSearch={configObject ? { searchValue: query, onSearch: search, filterOption: false } : true}
      searchValue={configObject ? 'legacy ignored' : query}
      onSearch={search}
      filterOption={configObject ? true : false}
      {loading}
      status={error ? 'error' : undefined}
      notFoundContent={empty}
      allowClear
      onPopupScroll={event => {
        scrolls++;
        const node = event.currentTarget;
        if (node.scrollTop + node.clientHeight >= node.scrollHeight - 16 && pages === 0) {
          pages++;
          options = [...options, { value: 99, label: 'Appended result' }];
        }
      }}
    />
    <label for="remote-multiple">Remote multiple</label>
    <Select
      id="remote-multiple"
      name="multiple"
      mode="multiple"
      options={options}
      bind:value={multiple}
      showSearch
      searchValue={query}
      onSearch={search}
      filterOption={false}
      allowClear
    />
    <button type="submit">Read remote values</button>
  </form>
  <label><input type="checkbox" bind:checked={accept} /> Accept remote search</label>
  <label><input type="checkbox" bind:checked={configObject} /> Object search config</label>
  <label><input type="checkbox" bind:checked={loading} /> Remote loading state</label>
  <button type="button" onclick={() => { options = []; }}>Remove remote results</button>
  <button type="button" onclick={page}>Replace remote page</button>
  <button type="button" onclick={() => { options = [{ value: 0, label: 'Renamed zero' }]; }}>Rename remote option</button>
  <button
    type="button"
    onclick={() => {
      single = 42;
      multiple = [42];
    }}
  >Unknown remote selection</button>
  <button type="button" onclick={() => { query = 'Parent search'; }}>Replace remote search</button>
  <button
    type="button"
    onclick={() => {
      options = [];
      error = true;
    }}
  >Fail remote request</button>
  <output aria-label="Remote search calls">{JSON.stringify(calls)}</output>
  <output aria-label="Remote query">{query}</output>
  <output aria-label="Remote data">{data}</output>
  <output aria-label="Remote scrolls">{scrolls}</output>
</section>
