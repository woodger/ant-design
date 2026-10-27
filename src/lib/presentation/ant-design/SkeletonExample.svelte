<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Alert, Button, Checkbox, Input, InputNumber, Skeleton, Spin } from '$lib/components/ant-design';
  import { createSpinLoad } from './spin-load.model.svelte';

  const model = createSpinLoad();
  let hasData = $derived(model.revision > 0);
  let active = true;
  let animated = $state(true);
  let avatar = $state(true);
  let title = $state(true);
  let paragraph = $state(true);
  let round = $state(false);
  let rows = $state<number | null>(3);
  let name = $state<string | undefined>('Анна');
  let notifications = $state(true);
  let edits = $state(0);
  let result = $derived(model.loading ? hasData ? 'Карточка обновляется…' : 'Карточка загружается…' : model.status === 'error' ? 'Не удалось загрузить карточку.' : model.status === 'cancelled' ? 'Загрузка карточки отменена.' : hasData ? `Карточка загружена. Версия: ${model.revision}.` : 'Загрузите карточку участника.');

  async function cancel() {
    if (!model.cancel()) return;

    await tick();
    if (active) document.getElementById('skeleton-example-start')?.focus({ preventScroll: true });
  }
  async function retryLoad() {
    if (!model.load()) return;

    await tick();
    if (active && model.loading) document.getElementById('showcase-skeleton')?.focus({ preventScroll: true });
  }
  function reset() { model.reset(); name = 'Анна'; notifications = true; edits = 0; }
  onDestroy(() => { active = false; model.destroy(); });
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .preview { margin-block: 24px; padding: 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .rows { display: flex; align-items: center; gap: 8px; }
  .card { display: grid; gap: 16px; min-height: 190px; padding: 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .card p { margin: 0; }
  .draft { max-width: 340px; }
  .profile { margin-block: 24px; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
</style>

{#snippet retry()}<Button onclick={() => { void retryLoad(); }}>Повторить загрузку карточки</Button>{/snippet}
<div class="controls"><Checkbox bind:checked={animated}>Анимация Skeleton</Checkbox><Checkbox bind:checked={avatar}>Аватар Skeleton</Checkbox><Checkbox bind:checked={title}>Заголовок Skeleton</Checkbox><Checkbox bind:checked={paragraph}>Абзац Skeleton</Checkbox><Checkbox bind:checked={round}>Скругление Skeleton</Checkbox><label class="rows">Строки Skeleton<InputNumber aria-label="Строки Skeleton" bind:value={rows} min={0} max={10} precision={0} /></label></div>
<div class="preview"><Skeleton active={animated} {avatar} {title} paragraph={paragraph ? { rows: rows ?? 3 } : false} {round} aria-hidden /></div>
<div class="controls"><Button id="skeleton-example-start" type="primary" loading={model.loading} onclick={() => model.load()}>Загрузить карточку</Button><Button disabled={model.loading} onclick={() => model.load('fast')}>Быстрый ответ карточки</Button><Button disabled={model.loading} onclick={() => model.load('error')}>Ошибка загрузки карточки</Button><Button disabled={!model.loading} onclick={() => { void cancel(); }}>Отменить загрузку карточки</Button><Button onclick={reset}>Сбросить пример Skeleton</Button></div>
<div class="profile"><Skeleton loading={model.loading && !hasData} active avatar paragraph={{ rows: 3 }} aria-label="Карточка участника" id="showcase-skeleton">{#if hasData}<Spin spinning={model.loading} delay={200} description="Обновляем карточку…" aria-label="Загруженная карточка" id="skeleton-example-refresh"><div class="card"><label for="skeleton-example-name">Имя в карточке Skeleton</label><div class="draft"><Input id="skeleton-example-name" bind:value={name} /></div><Checkbox bind:checked={notifications}>Уведомления карточки</Checkbox><p>Изменений в карточке: {edits}. Версия данных: {model.revision}.</p><div class="controls"><Button onclick={() => { edits++; }}>Изменить карточку Skeleton</Button><Button onclick={() => model.load()}>Обновить загруженную карточку</Button></div></div></Spin>{:else}<p>Данные карточки ещё не загружены.</p>{/if}</Skeleton></div>
{#if model.status === 'error'}<Alert type="error" title="Ошибка загрузки карточки" description={hasData ? 'Черновик сохранён. Повторите обновление.' : 'Попробуйте загрузить карточку ещё раз.'} action={retry} showIcon />{/if}
<output aria-label="Результат примера Skeleton">{result}</output>
