<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Button, Checkbox, NotificationHolder, Select, createNotification, type NotificationPlacement } from '$lib/components/ant-design';

  const notification = createNotification({ maxCount: 3 });
  let exportState = $state<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  let failNext = $state(false);
  let placement = $state<NotificationPlacement>('topRight');
  let result = $state('Подготовьте отчёт и скачайте его из уведомления.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let report = '';
  let downloadUrl: string | undefined;
  const placements = ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'].map((value) => ({ value: value as NotificationPlacement, label: value }));

  function releaseDownload() { if (downloadUrl) URL.revokeObjectURL(downloadUrl); downloadUrl = undefined; }
  function start() {
    if (exportState === 'preparing') return;

    const failed = failNext;
    const current = ++generation;
    failNext = false; exportState = 'preparing'; report = ''; releaseDownload();
    result = 'Готовим отчёт…';
    notification.open({ key: 'export', title: 'Готовим отчёт', description: 'После подготовки здесь появится кнопка скачивания.', placement, duration: 0, role: 'status' });
    timer = setTimeout(() => {
      timer = undefined;
      if (current !== generation) return;

      if (failed) {
        exportState = 'error'; result = 'Не удалось подготовить отчёт. Повторите попытку.';
        notification.error({ key: 'export', title: 'Не удалось подготовить отчёт', description: 'Данные сохранены. Попробуйте выполнить экспорт ещё раз.', placement, duration: 0, actions: retry });
      } else {
        exportState = 'ready'; result = 'Отчёт готов к скачиванию.';
        report = '\uFEFFname,framework\r\nAnna,Svelte\r\nBoris,TypeScript\r\n';
        notification.success({ key: 'export', title: 'Отчёт готов', description: 'CSV-файл содержит две записи. Его можно скачать сейчас.', placement, duration: 0, actions: ready, role: 'status' });
      }
    }, 700);
  }

  function download() {
    if (exportState !== 'ready' || !report) return;

    releaseDownload();
    downloadUrl = URL.createObjectURL(new Blob([report], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = downloadUrl; link.download = 'report.csv'; document.body.append(link); link.click(); link.remove();
    result = 'Отчёт скачан.';
  }

  function reset() { generation++; clearTimeout(timer); timer = undefined; exportState = 'idle'; report = ''; releaseDownload(); notification.destroy(); result = 'Пример экспорта сброшен.'; }
  onDestroy(() => { generation++; clearTimeout(timer); releaseDownload(); });
</script>

<style>
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .placement { width: 180px; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
</style>

{#snippet retry()}<Button type="primary" onclick={start}>Повторить экспорт</Button>{/snippet}
{#snippet ready()}<Button type="primary" onclick={download}>Скачать отчёт</Button><Button onclick={() => notification.destroy('export')}>Закрыть результат экспорта</Button>{/snippet}

<NotificationHolder {notification} id="showcase-notifications" />
<div class="actions"><Button type="primary" loading={exportState === 'preparing'} onclick={start}>Экспортировать отчёт</Button><Checkbox bind:checked={failNext}>Ошибка следующего экспорта</Checkbox><div class="placement"><Select aria-label="Положение Notification" bind:value={placement} options={placements} /></div><Button onclick={reset}>Сбросить пример Notification</Button></div>
<output aria-label="Результат примера Notification">{result}</output>
