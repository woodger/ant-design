<script lang="ts">
  import { Alert, Button, Checkbox, type AlertType, type AlertVariant } from '$lib/components/ant-design';

  let type = $state<AlertType>('info');
  let variant = $state<AlertVariant>('outlined');
  let banner = $state(false);
  let showIcon = $state(true);
  let description = $state(true);
  let closable = $state(true);
  let customIcon = $state(false);
  let closeText = $state(false);
  let polite = $state(true);
  let revision = $state(0);
  let result = $state('Примените настройки или закройте сообщение.');
  const titles: Record<AlertType, string> = { success: 'Настройки сохранены', info: 'Настройки уведомлений', warning: 'Есть несохранённые изменения', error: 'Не удалось сохранить настройки' };
  const descriptions: Record<AlertType, string> = { success: 'Новые параметры будут использованы для следующих уведомлений.', info: 'Проверьте параметры уведомлений перед сохранением.', warning: 'Примените настройки, чтобы сохранить изменения.', error: 'Повторите сохранение. Введённые параметры сохраняются.' };

  function apply() { type = 'success'; result = 'Настройки применены.'; }
</script>

<style>
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 24px; }
  output { color: var(--ant-color-text-secondary); }
</style>

{#snippet icon()}<span>★</span>{/snippet}
{#snippet action()}<Button size="small" onclick={apply}>{type === 'error' ? 'Повторить сохранение' : 'Применить настройки'}</Button>{/snippet}

<div class="settings">
  <label>Тип сообщения <select bind:value={type}><option value="info">Информация</option><option value="success">Успех</option><option value="warning">Предупреждение</option><option value="error">Ошибка</option></select></label>
  <label>Оформление сообщения <select bind:value={variant}><option value="outlined">С рамкой</option><option value="filled">Без рамки</option></select></label>
  <Checkbox bind:checked={showIcon}>Иконка сообщения</Checkbox>
  <Checkbox bind:checked={description}>Описание сообщения</Checkbox>
  <Checkbox bind:checked={banner}>Полоса уведомления</Checkbox>
  <Checkbox bind:checked={closable}>Кнопка закрытия сообщения</Checkbox>
  <Checkbox bind:checked={customIcon}>Своя иконка сообщения</Checkbox>
  <Checkbox bind:checked={closeText}>Текст вместо крестика</Checkbox>
  <Checkbox bind:checked={polite}>Мягкое объявление сообщения</Checkbox>
</div>
{#key revision}
  <Alert aria-label="Настраиваемое сообщение" role={polite ? 'status' : 'alert'} {type} {variant} {banner} {showIcon} title={titles[type]} description={description ? descriptions[type] : undefined} icon={customIcon ? icon : undefined} {action} closable={closable && { closeIcon: closeText ? 'Скрыть' : undefined, onClose: () => { result = 'Закрываем сообщение…'; }, afterClose: () => { result = 'Сообщение закрыто.'; } }} />
{/key}
<div class="footer"><Button onclick={() => { revision++; result = 'Сообщение восстановлено.'; }}>Показать сообщение снова</Button><output aria-label="Результат уведомления">{result}</output></div>
