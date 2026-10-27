<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Alert, Button, Checkbox, Input, Select, Spin, type SpinSize } from '$lib/components/ant-design';
  import { createSpinLoad } from './spin-load.model.svelte';

  const model = createSpinLoad();
  let delay = $state<0 | 200 | 500>(200);
  let size = $state<SpinSize>('medium');
  let name = $state<string | undefined>('Анна');
  let notifications = $state(true);
  let edits = $state(0);
  let active = true;
  const sizes = ['small', 'medium', 'large'].map((value) => ({ value: value as SpinSize, label: value }));
  let result = $derived(model.status === 'loading' ? 'Профиль обновляется…' : model.status === 'ready' ? `Данные обновлены. Версия: ${model.revision}.` : model.status === 'error' ? 'Не удалось загрузить профиль.' : model.status === 'cancelled' ? 'Загрузка отменена.' : 'Измените черновик и обновите данные.');

  async function cancel() {
    if (!model.cancel()) return;

    await tick();
    if (active) document.getElementById('spin-example-start')?.focus({ preventScroll: true });
  }
  async function retryLoad() {
    if (!model.load()) return;

    await tick();
    if (active && model.loading) document.getElementById('showcase-spin')?.focus({ preventScroll: true });
  }
  function reset() { model.reset(); name = 'Анна'; notifications = true; edits = 0; }
  onDestroy(() => { active = false; model.destroy(); });
</script>

<style>
  .controls, .sizes { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .sizes { margin-block: 24px; gap: 32px; }
  .size { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .field { width: 160px; }
  .card { display: grid; gap: 16px; min-height: 190px; padding: 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .card p { margin: 0; }
  .draft { max-width: 340px; }
  .loading { margin-block: 24px; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
</style>

{#snippet retry()}<Button onclick={() => { void retryLoad(); }}>Повторить загрузку профиля</Button>{/snippet}
<div class="controls"><Button id="spin-example-start" type="primary" loading={model.loading} onclick={() => model.load()}>Загрузить профиль</Button><Button disabled={model.loading} onclick={() => model.load('fast')}>Быстрый ответ</Button><Button disabled={model.loading} onclick={() => model.load('error')}>Ошибка загрузки профиля</Button><Button disabled={!model.loading} onclick={() => { void cancel(); }}>Отменить загрузку</Button><Button onclick={reset}>Сбросить пример Spin</Button><div class="field"><Select aria-label="Задержка Spin" bind:value={delay} options={[{ value: 0, label: 'Без задержки' }, { value: 200, label: '200 мс' }, { value: 500, label: '500 мс' }]} /></div><div class="field"><Select aria-label="Размер Spin" bind:value={size} options={sizes} /></div></div>
<div class="sizes" aria-label="Размеры индикатора Spin">{#each sizes as item}<div class="size"><Spin size={item.value} aria-hidden /><span>{item.label}</span></div>{/each}</div>
<div class="loading"><Spin spinning={model.loading} {delay} {size} description="Загружаем профиль…" aria-label="Профиль участника" id="showcase-spin"><div class="card"><label for="spin-example-name">Имя в черновике</label><div class="draft"><Input id="spin-example-name" bind:value={name} /></div><Checkbox bind:checked={notifications}>Уведомления профиля</Checkbox><p>Изменений в карточке: {edits}. Версия данных: {model.revision}.</p><div class="controls"><Button onclick={() => { edits++; }}>Изменить карточку</Button><Button onclick={() => model.load()}>Обновить из карточки</Button></div></div></Spin></div>
{#if model.status === 'error'}<Alert type="error" title="Ошибка загрузки профиля" description="Черновик сохранён. Попробуйте обновить данные ещё раз." action={retry} showIcon />{/if}
<output aria-label="Результат примера Spin">{result}</output>
