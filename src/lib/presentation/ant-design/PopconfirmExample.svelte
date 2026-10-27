<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Button, Checkbox, Popconfirm, Table, type PopoverPlacement, type TableColumn } from '$lib/components/ant-design';

  interface Member { key: number; name: string; role: string; }
  const generatedId = $props.id();
  const restoreId = `${generatedId}-restore`;
  const initialMembers: Member[] = [{ key: 1, name: 'Анна', role: 'Разработчик' }, { key: 2, name: 'Михаил', role: 'Дизайнер' }];
  let members = $state(initialMembers.map((member) => ({ ...member })));
  let failNext = $state(false);
  let pending = $state(0);
  let result = $state('');
  let placement = $state<PopoverPlacement>('top');
  let active = true;
  const waiters = new Map<ReturnType<typeof setTimeout>, () => void>();
  const columns: TableColumn<Member>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name' },
    { key: 'role', title: 'Роль', dataIndex: 'role' },
    { key: 'actions', title: 'Действия', render: actions }
  ];

  async function remove(member: Member) {
    const shouldFail = failNext;
    failNext = false;
    pending++;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => { waiters.delete(timer); resolve(); }, 600);
      waiters.set(timer, resolve);
    });
    if (!active) return;

    pending--;
    if (shouldFail) throw new Error('Demo request failed');

    members = members.filter((item) => item.key !== member.key);
    result = `${member.name}: запись удалена.`;
    await tick();
    if (active) document.getElementById(restoreId)?.focus({ preventScroll: true });
  }

  onDestroy(() => {
    active = false;
    for (const [timer, resolve] of waiters) { clearTimeout(timer); resolve(); }
    waiters.clear();
  });
</script>

<style>
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 20px; }
  output { color: var(--ant-color-text-secondary); }
</style>

{#snippet actions(member: Member)}
  <Popconfirm title={`Удалить запись «${member.name}»?`} description="Запись исчезнет из списка участников." okText="Удалить" cancelText="Оставить" okButtonProps={{ danger: true }} {placement} onConfirm={() => remove(member)}>
    <Button danger size="small" aria-label={`Удалить: ${member.name}`}>Удалить</Button>
  </Popconfirm>
{/snippet}

<div class="settings">
  <Checkbox bind:checked={failNext}>Следующее удаление завершится ошибкой</Checkbox>
  <label>Положение подтверждения <select bind:value={placement}><option value="top">Сверху</option><option value="bottom">Снизу</option><option value="left">Слева</option><option value="right">Справа</option></select></label>
</div>
<Table dataSource={members} {columns} pagination={false} caption="Участники для подтверждения удаления" scroll={{ x: 500 }} />
<div class="footer">
  <Button id={restoreId} disabled={pending > 0} onclick={() => { members = initialMembers.map((member) => ({ ...member })); result = ''; }}>Восстановить записи</Button>
  <output aria-label="Результат удаления">{result || 'Подтвердите удаление или оставьте запись.'}</output>
</div>
