<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Button, Checkbox, Form, FormItem, Input, Result, Select, Steps, type StepsItem, type StepsOrientation, type StepsSize, type StepsStatus } from '$lib/components/ant-design';
  import { createStepsWizard } from './steps-wizard.model.svelte';

  const model = createStepsWizard();
  let previewCurrent = $state(1);
  let orientation = $state<StepsOrientation>('horizontal');
  let size = $state<StepsSize>('medium');
  let status = $state<StepsStatus>('process');
  let clickable = $state(true);
  let fail = $state(false);
  let panel = $state<HTMLDivElement>();
  let active = true;
  let action = 0;
  let items = $derived<StepsItem[]>([{ key: 'data', title: 'Данные', content: 'Заполните форму', disabled: model.busy }, { key: 'review', title: 'Проверка', content: 'Проверьте заявку', disabled: model.busy || model.unlocked < 1 }, { key: 'send', title: 'Отправка', content: 'Отправьте заявку', disabled: model.busy || model.unlocked < 2 }]);

  onDestroy(() => { active = false; action++; model.destroy(); });
  async function focusPanel(token: number) {
    await tick();
    if (!active || token !== action) return;

    const invalid = panel?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? (model.current === 0 ? document.getElementById('steps-example-name') : panel))?.focus({ preventScroll: true });
  }
  async function goTo(index: number) {
    const token = ++action;
    const changed = await model.goTo(index);
    if (changed || model.validationFailed) await focusPanel(token);
  }
  function acceptData() { if (model.acceptData()) void focusPanel(++action); }
  function review() { if (model.review()) void focusPanel(++action); }
  async function send() { const token = ++action; if (await model.send(fail) || model.validationFailed) await focusPanel(token); }
  function reset() { action++; model.reset(); fail = false; }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .field { width: 180px; }
  .preview, .workflow { margin-block: 24px; padding: 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); min-width: 0; }
  .workflow:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 3px; }
  .form { max-width: 440px; margin-inline: auto; }
  .workflow :global(.ant-btn) { max-width: 100%; height: auto; min-height: var(--ant-control-height); white-space: normal; }
  .summary { overflow-wrap: anywhere; }
  output { display: block; margin-top: 16px; color: var(--ant-color-text-secondary); }
</style>

{#snippet previewTitle()}<strong>Проверка</strong>{/snippet}
{#snippet previewContent()}<span>Данные можно изменить перед отправкой.</span>{/snippet}
{#snippet completionActions()}<Button type="primary" onclick={() => { void goTo(0); }}>Изменить данные заявки</Button>{#if model.status === 'error'}<Button loading={model.busy} onclick={() => { void send(); }}>Повторить отправку заявки</Button>{/if}{/snippet}

<div class="controls"><div class="field"><Select aria-label="Ориентация Steps" bind:value={orientation} options={[{ value: 'horizontal', label: 'Горизонтально' }, { value: 'vertical', label: 'Вертикально' }]} /></div><div class="field"><Select aria-label="Размер Steps" bind:value={size} options={[{ value: 'medium', label: 'medium' }, { value: 'small', label: 'small' }]} /></div><div class="field"><Select aria-label="Статус Steps" bind:value={status} options={['wait', 'process', 'finish', 'error'].map(value => ({ value: value as StepsStatus, label: value }))} /></div><Checkbox bind:checked={clickable}>Выбор шага в Steps</Checkbox></div>
<div class="preview"><Steps current={previewCurrent} {status} {orientation} {size} onChange={clickable ? value => { previewCurrent = value; } : undefined} aria-label="Предпросмотр Steps" items={[{ key: 'data', title: 'Данные', content: 'Заполните форму' }, { key: 'review', title: previewTitle, subTitle: 'Перед отправкой', content: previewContent }, { key: 'send', title: 'Отправка', content: 'Завершите процесс' }]} /></div>
<h3>Заявка по шагам</h3>
<Steps {items} current={model.current} status={model.status === 'error' ? 'error' : 'process'} onChange={index => { void goTo(index); }} aria-label="Этапы заявки" />
<div class="controls"><Checkbox bind:checked={fail} disabled={model.busy}>Ошибка отправки Steps</Checkbox><Button onclick={reset}>Сбросить пример Steps</Button></div>
<div class="workflow" bind:this={panel} role="region" aria-label="Текущий этап заявки" tabindex="-1" aria-busy={model.busy || undefined}>
  {#if model.current === 3 || model.status === 'error'}
    <Result status={model.status === 'error' ? 'error' : 'success'} title={model.status === 'error' ? 'Не удалось отправить заявку по шагам' : 'Заявка по шагам отправлена'} subTitle={`${model.submitted?.name}, ${model.submitted?.email}`} headingLevel={4} extra={completionActions}><p>{model.status === 'error' ? 'Поля сохранены. Снимите флажок ошибки и повторите отправку.' : 'Все этапы завершены. Можно вернуться к редактированию.'}</p></Result>
  {:else if model.current === 0}
    <div class="form"><h4>Данные заявки</h4><Form form={model.form} onFinish={acceptData} aria-label="Данные многошаговой заявки"><FormItem name="name" label="Имя в многошаговой заявке" htmlFor="steps-example-name" help="Имя участника."><Input value={model.form.values.name} onValueChange={value => model.form.setFieldValue('name', value)} /></FormItem><FormItem name="email" label="Email в многошаговой заявке" htmlFor="steps-example-email" help="name@example.com"><Input type="email" value={model.form.values.email} onValueChange={value => model.form.setFieldValue('email', value)} /></FormItem><Button type="primary" htmlType="submit" loading={model.form.isSubmitting}>Проверить данные заявки</Button></Form></div>
  {:else if model.current === 1}
    <h4>Проверка заявки</h4><p class="summary">Имя: {model.form.values.name}. Email: {model.form.values.email}.</p><div class="controls"><Button onclick={() => { void goTo(0); }}>Назад к данным</Button><Button type="primary" onclick={review}>К отправке заявки</Button></div>
  {:else}
    <h4>Отправка заявки</h4><p class="summary">{model.form.values.name}, {model.form.values.email}</p><div class="controls"><Button disabled={model.busy} onclick={() => { void goTo(1); }}>Назад к проверке</Button><Button type="primary" loading={model.busy} onclick={() => { void send(); }}>Отправить многошаговую заявку</Button></div>
  {/if}
</div>
<output aria-label="Результат примера Steps">Этап: {model.current}. Состояние: {model.status}.</output>
