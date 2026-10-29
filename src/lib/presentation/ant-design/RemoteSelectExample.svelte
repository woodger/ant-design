<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Select } from '$lib/components/ant-design';
  import { createRemoteSelect } from './remote-select.model.svelte';
  const people = Array.from({ length: 36 }, (_, n) => ({ value: n, label: `Участник ${String(n + 1).padStart(2, '0')}` }));
  let failNext = false;
  let selected = $state<number[]>([]);
  const remote = createRemoteSelect<number>(async ({ search, cursor }, signal) => {
    await new Promise<void>((resolve, reject) => {
      const done = () => { signal.removeEventListener('abort', abort); resolve(); };
      const timer = setTimeout(done, 350);
      function abort() { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(new Error('aborted')); }
      if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true });
    });
    if (failNext) { failNext = false; throw new Error('demo failure'); }
    const matches = people.filter(person => person.label.toLowerCase().includes(search.toLowerCase()));
    const start = Number(cursor ?? 0);
    return { options: matches.slice(start, start + 12), nextCursor: start + 12 < matches.length ? String(start + 12) : undefined };
  });
  onMount(() => { void remote.load(); return remote.dispose; });
</script>
{#snippet empty()}<span role="status">{remote.loading ? 'Загрузка участников…' : remote.error ?? 'Участники не найдены'}</span>{/snippet}
<p>Демонстрационный источник с задержкой, поиском и страницами. Выбор сохраняется при смене выдачи.</p>
<label for="showcase-remote-select">Поиск участников</label>
<Select id="showcase-remote-select" mode="multiple" name="people" options={remote.options} bind:value={selected}
  showSearch={{ searchValue: remote.searchValue, onSearch: remote.search, filterOption: false }} loading={remote.loading} status={remote.error ? 'error' : undefined} notFoundContent={empty} allowClear
  onPopupScroll={event => { const list = event.currentTarget; if (list.scrollTop + list.clientHeight >= list.scrollHeight - 16) void remote.more(); }} />
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-block:12px">
  <Button disabled={!remote.hasMore || remote.loading} onclick={() => remote.more()}>Ещё участников</Button>
  <Button onclick={() => { failNext = true; remote.search(remote.searchValue); }}>Ошибка следующего запроса</Button>
  {#if remote.error}<Button onclick={() => remote.retry()}>Повторить поиск участников</Button>{/if}
</div>
{#if remote.error}<p role="alert">{remote.error}</p>{/if}
<output aria-label="Выбранные удалённые участники">{JSON.stringify(selected)}</output>
