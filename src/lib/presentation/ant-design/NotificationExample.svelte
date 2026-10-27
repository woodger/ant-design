<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Button, Checkbox, NotificationHolder, Progress, Select, createNotification, type NotificationPlacement } from '$lib/components/ant-design';
  import { createNotificationExport } from './notification-export.model.svelte';

  const notification = createNotification({ maxCount: 3 });
  let failNext = $state(false);
  let placement = $state<NotificationPlacement>('topRight');
  let result = $state('Подготовьте отчёт и скачайте его из уведомления.');
  let downloadUrl: string | undefined;
  const placements = ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'].map((value) => ({ value: value as NotificationPlacement, label: value }));
  const model = createNotificationExport({
    onReady() { result = 'Отчёт готов к скачиванию.'; notification.success({ key: 'export', title: 'Отчёт готов', description: progress, placement, duration: 0, actions: ready, role: 'status' }); },
    onError() { result = 'Не удалось подготовить отчёт. Повторите попытку.'; notification.error({ key: 'export', title: 'Не удалось подготовить отчёт', description: progress, placement, duration: 0, actions: retry }); }
  });

  function releaseDownload() { if (downloadUrl) URL.revokeObjectURL(downloadUrl); downloadUrl = undefined; }
  function start() {
    const failed = failNext;
    if (!model.start(failed)) return;

    failNext = false; releaseDownload();
    result = 'Готовим отчёт…';
    notification.open({ key: 'export', title: 'Готовим отчёт', description: progress, actions: pending, placement, duration: 0, role: 'status' });
  }

  function cancel() {
    if (!model.cancel()) return;

    result = 'Экспорт отменён.';
    notification.info({ key: 'export', title: 'Экспорт отменён', description: progress, placement, duration: 0, actions: retry, role: 'status' });
  }

  function download() {
    const report = model.report;
    if (!report) return;

    releaseDownload();
    downloadUrl = URL.createObjectURL(new Blob([report], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = downloadUrl; link.download = 'report.csv'; document.body.append(link); link.click(); link.remove();
    result = 'Отчёт скачан.';
  }

  function reset() { model.reset(); releaseDownload(); notification.destroy(); result = 'Пример экспорта сброшен.'; }
  onDestroy(() => { model.destroy(); releaseDownload(); });
</script>

<style>
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .placement { width: 180px; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
  .phase { margin-block: 0 var(--ant-margin-sm); }
</style>

{#snippet progress()}<p class="phase">{model.phase}</p><Progress percent={model.percent} status={model.status === 'preparing' ? 'active' : model.status === 'error' ? 'exception' : undefined} aria-label="Подготовка отчёта" />{/snippet}
{#snippet pending()}<Button onclick={cancel}>Отменить экспорт</Button>{/snippet}
{#snippet retry()}<Button type="primary" onclick={start}>Повторить экспорт</Button>{/snippet}
{#snippet ready()}<Button type="primary" onclick={download}>Скачать отчёт</Button><Button onclick={() => notification.destroy('export')}>Закрыть результат экспорта</Button>{/snippet}

<NotificationHolder {notification} id="showcase-notifications" />
<div class="actions"><Button type="primary" loading={model.status === 'preparing'} onclick={start}>Экспортировать отчёт</Button><Checkbox bind:checked={failNext}>Ошибка следующего экспорта</Checkbox><div class="placement"><Select aria-label="Положение Notification" bind:value={placement} options={placements} /></div><Button onclick={reset}>Сбросить пример Notification</Button></div>
<output aria-label="Результат примера Notification">{result}</output>
