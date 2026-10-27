<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Button, Checkbox, MessageHolder, createMessage } from '$lib/components/ant-design';

  const message = createMessage({ maxCount: 3 });
  let failSave = $state(false);
  let pending = $state(false);
  let result = $state('Сохраните настройки или покажите отдельное сообщение.');
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function save() {
    if (pending) return;

    const failed = failSave;
    failSave = false;
    pending = true;
    message.loading({ key: 'save', content: 'Сохраняем настройки…', duration: 0 });
    timer = setTimeout(() => {
      timer = undefined;
      pending = false;
      if (failed) { message.error({ key: 'save', content: 'Не удалось сохранить настройки. Повторите попытку.' }); result = 'Ошибка сохранения. Можно повторить.'; }
      else { message.success({ key: 'save', content: 'Настройки сохранены.' }); result = 'Настройки сохранены.'; }
    }, 700);
  }

  async function sequence() {
    const current = generation;
    const closed = await message.info({ content: 'Проверяем данные…', duration: 1 });
    if (closed && current === generation) message.success('Данные проверены.');
  }

  function reset() { generation++; clearTimeout(timer); timer = undefined; pending = false; message.destroy(); result = 'Пример сброшен.'; }
  onDestroy(() => { generation++; clearTimeout(timer); });
</script>

<style>
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .note { margin: 16px 0; color: var(--ant-color-text-secondary); }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
</style>

<MessageHolder {message} id="showcase-messages" />
<div class="actions"><Button type="primary" loading={pending} onclick={save}>Сохранить настройки с сообщением</Button><Checkbox bind:checked={failSave}>Ошибка следующего сохранения Message</Checkbox><Button onclick={() => { void sequence(); }}>Последовательные сообщения</Button><Button onclick={reset}>Сбросить пример Message</Button></div>
<p class="note">Сообщения появляются сверху, не перемещая фокус. В очереди остаётся не больше трёх активных сообщений.</p>
<div class="actions"><Button onclick={() => message.success('Операция завершена.')}>Message: успех</Button><Button onclick={() => message.info('Доступна новая версия документа.')}>Message: информация</Button><Button onclick={() => message.warning('Проверьте введённые данные.')}>Message: предупреждение</Button><Button onclick={() => message.error('Не удалось выполнить операцию.')}>Message: ошибка</Button></div>
<output aria-label="Результат примера Message">{result}</output>
