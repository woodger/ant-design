<script lang="ts">
  import { Button, Checkbox, Input, Modal, Table, Tabs, type TabsPlacement, type TabsType } from '$lib/components/ant-design';

  let activeKey = $state<string | undefined>('profile');
  let tabPlacement = $state<TabsPlacement>('top');
  let type = $state<TabsType>('line');
  let destroyOnHidden = $state(false);
  let modalOpen = $state(false);
  let result = $state('Измените профиль и переключите вкладку — черновик сохранится.');
  const history = [{ key: 1, date: '25.10.2026', action: 'Обновлён профиль' }, { key: 2, date: '24.10.2026', action: 'Включены уведомления' }];

  function save(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    result = `Профиль сохранён: ${data.get('displayName')}.`;
  }
</script>

<style>
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .profile { display: grid; gap: 16px; max-width: 360px; }
  .field { display: grid; gap: 6px; }
  .preferences { display: grid; gap: 16px; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 24px; }
  output, .note { color: var(--ant-color-text-secondary); }
  .note { margin-top: 0; }
</style>

{#snippet profileIcon()}<span>↗</span>{/snippet}
{#snippet profile()}
  <form class="profile" onsubmit={save}>
    <label class="field">Имя участника<Input name="displayName" defaultValue="Анна" required /></label>
    <label class="field">Email участника<Input name="email" type="email" defaultValue="anna@example.com" required /></label>
    <div><Button htmlType="submit" type="primary">Сохранить профиль участника</Button></div>
  </form>
{/snippet}
{#snippet preferences()}
  <div class="preferences"><Checkbox defaultChecked>Получать новости проекта</Checkbox><Checkbox>Получать еженедельный отчёт</Checkbox></div>
{/snippet}
{#snippet activity()}
  <Table dataSource={history} columns={[{ key: 'date', title: 'Дата', dataIndex: 'date' }, { key: 'action', title: 'Событие', dataIndex: 'action' }]} pagination={false} caption="История участника" scroll={{ x: 360 }} />
{/snippet}
{#snippet modalDescription()}<p>Вкладки сохраняют естественный порядок Tab внутри окна.</p>{/snippet}
{#snippet modalNotes()}<label class="field">Заметка об участнике<Input defaultValue="Новый участник проекта" /></label>{/snippet}

<div class="settings">
  <label>Вид вкладок <select bind:value={type}><option value="line">Линия</option><option value="card">Карточки</option></select></label>
  <label>Положение вкладок <select bind:value={tabPlacement}><option value="top">Сверху</option><option value="bottom">Снизу</option><option value="start">В начале</option><option value="end">В конце</option></select></label>
  <Checkbox bind:checked={destroyOnHidden}>Сбрасывать содержимое при скрытии</Checkbox>
</div>
<p class="note">Включите сброс, чтобы сравнить поведение: несохранённые изменения скрытой панели будут потеряны.</p>
<Tabs aria-label="Разделы участника" items={[{ key: 'profile', label: 'Профиль', icon: profileIcon, children: profile }, { key: 'settings', label: 'Настройки', children: preferences }, { key: 'access', label: 'Доступ', disabled: true }, { key: 'history', label: 'История', children: activity }]} bind:activeKey {type} {tabPlacement} {destroyOnHidden} />
<div class="footer"><Button onclick={() => { modalOpen = true; }}>Открыть вкладки в окне</Button><output aria-label="Результат профиля участника">{result}</output></div>
<Modal bind:open={modalOpen} title="Вкладки в карточке"><Tabs aria-label="Разделы карточки" items={[{ key: 'description', label: 'Описание', children: modalDescription }, { key: 'notes', label: 'Заметки', children: modalNotes }]} /></Modal>
