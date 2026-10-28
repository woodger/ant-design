<script lang="ts">
  import { Button, Checkbox, Empty, Input, Select, Table, type TableColumn } from '$lib/components/ant-design';

  interface Member { key: number; name: string; role: string; }
  let image = $state<'default' | 'simple' | 'custom' | 'none'>('default');
  let description = $state<'text' | 'rich' | 'none'>('text');
  let text = $state<string | undefined>('Здесь пока ничего нет.');
  let actions = $state(true);
  let actionCount = $state(0);
  let members = $state<Member[]>([]);
  let name = $state<string | undefined>('Анна');
  let query = $state<string | undefined>('');
  let tableHost = $state<HTMLDivElement>();
  let nextKey = 0;
  let visible = $derived(members.filter(member => member.name.toLowerCase().includes((query ?? '').trim().toLowerCase())));
  const columns: TableColumn<Member>[] = [{ key: 'name', title: 'Имя', dataIndex: 'name' }, { key: 'role', title: 'Роль', dataIndex: 'role' }];

  function focusTable() { tableHost?.querySelector<HTMLElement>('.ant-table-content')?.focus({ preventScroll: true }); }
  function addMember() {
    const value = name?.trim();
    if (!value) return;

    focusTable();
    query = '';
    members = [...members, { key: nextKey++, name: value, role: 'Участник' }];
  }
  function resetSearch() { focusTable(); query = ''; }
  function clearMembers() { document.getElementById('empty-example-name')?.focus({ preventScroll: true }); members = []; query = ''; }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .field { width: 180px; }
  .wide { width: 260px; max-width: 100%; }
  .preview { margin-block: 24px; padding: 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .table { margin-top: 20px; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
</style>

{#snippet customImage()}<svg width="160" height="100" viewBox="0 0 160 100" aria-hidden="true"><rect x="24" y="20" width="112" height="64" rx="12" fill="var(--ant-color-primary-bg)" stroke="var(--ant-color-primary-border)" /><path d="M56 52h48m-24-24v48" fill="none" stroke="var(--ant-color-primary)" stroke-width="4" /></svg>{/snippet}
{#snippet richDescription()}<strong>{text || 'Нет записей'}</strong><br /><span>Добавьте первую запись, чтобы начать.</span>{/snippet}
{#snippet previewActions()}<Button type="primary" onclick={() => { actionCount++; }}>Попробовать действие Empty</Button>{/snippet}
{#snippet emptyMembers()}<Empty image="simple" description={members.length ? 'По вашему запросу ничего не найдено.' : 'Участников пока нет.'}>{#if members.length}<Button onclick={resetSearch}>Сбросить поиск участников</Button>{:else}<Button type="primary" disabled={!name?.trim()} onclick={addMember}>Создать первого участника</Button>{/if}</Empty>{/snippet}

<div class="controls"><div class="field"><Select aria-label="Иллюстрация Empty" bind:value={image} options={[{ value: 'default', label: 'default' }, { value: 'simple', label: 'simple' }, { value: 'custom', label: 'Свой Snippet' }, { value: 'none', label: 'Без изображения' }]} /></div><div class="field"><Select aria-label="Описание Empty" bind:value={description} options={[{ value: 'text', label: 'Текст' }, { value: 'rich', label: 'Snippet' }, { value: 'none', label: 'Без описания' }]} /></div><div class="wide"><Input aria-label="Текст Empty" bind:value={text} /></div><Checkbox bind:checked={actions}>Действие Empty</Checkbox></div>
<div class="preview"><Empty image={image === 'custom' ? customImage : image === 'none' ? false : image} description={description === 'rich' ? richDescription : description === 'none' ? false : text ?? ''} children={actions ? previewActions : undefined} aria-label="Настраиваемое пустое состояние" /></div>
<div class="controls"><div class="wide"><label for="empty-example-name">Имя нового участника</label><Input id="empty-example-name" bind:value={name} /></div><Button disabled={!name?.trim()} onclick={addMember}>Добавить участника в пример Empty</Button><Button disabled={!members.length} onclick={clearMembers}>Очистить список участников</Button><div class="wide"><label for="empty-example-search">Поиск в примере Empty</label><Input id="empty-example-search" aria-label="Поиск в примере Empty" bind:value={query} /></div></div>
<div class="table" bind:this={tableHost}><Table dataSource={visible} {columns} pagination={false} caption="Участники примера Empty" empty={emptyMembers} /></div>
<output aria-label="Результат примера Empty">Участников: {members.length}. Показано: {visible.length}. Действий: {actionCount}.</output>
