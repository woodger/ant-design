<script lang="ts">
  import { Button, Checkbox, Collapse, Input, type CollapseActiveKey, type CollapseTrigger } from '$lib/components/ant-design';

  let activeKey = $state<CollapseActiveKey | undefined>(['contacts']);
  let accordion = $state(false);
  let destroyOnHidden = $state(false);
  let ghost = $state(false);
  let bordered = $state(true);
  let collapsible = $state<CollapseTrigger>('header');
  let expandIconPlacement = $state<'start' | 'end'>('start');
  let revision = $state(0);
  let result = $state('Сверните раздел и откройте снова — несохранённые поля останутся на месте.');

  function save(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const name = data.get('contactName');
    result = name === null ? 'Раскройте раздел «Контакты», чтобы заполнить анкету.' : `Анкета сохранена: ${name || 'без имени'}. Новости: ${data.has('news') ? 'включены' : 'выключены'}.`;
  }
</script>

<style>
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .fields { display: grid; gap: 16px; max-width: 360px; }
  .field { display: grid; gap: 6px; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 24px; }
  output { color: var(--ant-color-text-secondary); }
</style>

{#snippet contacts()}{#key revision}<div class="fields"><label class="field">Имя для связи<Input name="contactName" defaultValue="Анна" /></label><label class="field">Комментарий к анкете<Input name="comment" defaultValue="Новый участник" /></label></div>{/key}{/snippet}
{#snippet preferences()}{#key revision}<Checkbox name="news" defaultChecked>Получать новости анкеты</Checkbox>{/key}{/snippet}
{#snippet extra()}<Button size="small" onclick={() => { revision++; result = 'Анкета сброшена.'; }}>Сбросить анкету</Button>{/snippet}
{#snippet additional()}{#key revision}<Collapse aria-label="Дополнительные поля" headingLevel={5} items={[{ key: 'address', label: 'Адрес', children: address }, { key: 'help', label: 'Как используются данные', children: help }]} />{/key}{/snippet}
{#snippet address()}<label class="field">Город участника<Input name="city" defaultValue="Москва" /></label>{/snippet}
{#snippet help()}<p>Это демонстрационная анкета. Данные остаются на странице и не отправляются на сервер.</p>{/snippet}

<div class="settings">
  <Checkbox bind:checked={accordion}>Один открытый раздел</Checkbox>
  <Checkbox bind:checked={destroyOnHidden}>Сбрасывать содержимое при скрытии</Checkbox>
  <Checkbox bind:checked={bordered}>Показывать рамку</Checkbox>
  <Checkbox bind:checked={ghost}>Прозрачный фон</Checkbox>
  <label>Область переключения <select bind:value={collapsible}><option value="header">Заголовок</option><option value="icon">Только стрелка</option><option value="disabled">Отключена</option></select></label>
  <label>Положение стрелки <select bind:value={expandIconPlacement}><option value="start">В начале</option><option value="end">В конце</option></select></label>
</div>
<form onsubmit={save}>
  <Collapse aria-label="Анкета участника" headingLevel={4} bind:activeKey {accordion} {destroyOnHidden} {collapsible} {expandIconPlacement} {bordered} {ghost} items={[{ key: 'contacts', label: 'Контакты', children: contacts, extra }, { key: 'preferences', label: 'Уведомления', children: preferences }, { key: 'additional', label: 'Дополнительно', children: additional }, { key: 'access', label: 'Права доступа', collapsible: 'disabled' }]} />
  <div class="footer"><Button htmlType="submit" type="primary">Сохранить анкету</Button><output aria-label="Результат анкеты">{result}</output></div>
</form>
