<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Button, Checkbox, Form, FormItem, Input, Result, Select, createForm, type ResultStatus } from '$lib/components/ant-design';
  import { createResultSubmit, type ResultSubmission } from './result-submit.model.svelte';

  const model = createResultSubmit();
  const form = createForm({ initialValues: { name: 'Анна', email: 'anna@example.com' }, rules: { name: [{ required: true, message: 'Введите имя' }], email: [{ required: true, message: 'Введите email' }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Проверьте email' }] } });
  const statuses: ResultStatus[] = ['success', 'error', 'info', 'warning', '403', '404', '500'];
  let status = $state<ResultStatus>('success');
  let customIcon = $state(false);
  let actions = $state(true);
  let fail = $state(false);
  let actionCount = $state(0);
  let formHost = $state<HTMLDivElement>();
  let resultHost = $state<HTMLDivElement>();
  let active = true;
  let action = 0;

  onDestroy(() => { active = false; action++; model.destroy(); });

  async function finish(values: ResultSubmission) {
    const outcome = await model.submit(values, fail);
    if (!active || outcome === 'cancelled' || outcome === 'busy') return;

    await tick();
    if (active && model.status === outcome) resultHost?.focus({ preventScroll: true });
  }

  async function edit(retry = false) {
    if (!model.edit()) return;

    const token = ++action;
    await tick();
    if (!active || token !== action) return;

    if (retry) formHost?.querySelector('form')?.requestSubmit();
    else document.getElementById('result-example-name')?.focus({ preventScroll: true });
  }

  function reset() { action++; model.reset(); form.resetFields(); fail = false; }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .field { width: 180px; }
  .preview, .workflow { margin-block: 24px; padding: 16px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .form { max-width: 440px; margin: 24px auto; }
  .workflow:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 3px; }
  output { display: block; color: var(--ant-color-text-secondary); }
</style>

{#snippet previewIcon()}<svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30" fill="var(--ant-color-primary-bg)" /><path d="m22 36 9 9 19-20" fill="none" stroke="var(--ant-color-primary)" stroke-width="5" /></svg>{/snippet}
{#snippet previewActions()}<Button type="primary" onclick={() => { actionCount++; }}>Действие Result</Button>{/snippet}
{#snippet completionActions()}<Button type="primary" onclick={() => { void edit(); }}>Изменить заявку</Button>{#if model.status === 'error'}<Button onclick={() => { void edit(true); }}>Повторить отправку</Button>{/if}{/snippet}

<div class="controls"><div class="field"><Select aria-label="Статус Result" bind:value={status} options={statuses.map(value => ({ value, label: String(value) }))} /></div><Checkbox bind:checked={customIcon}>Своя иконка Result</Checkbox><Checkbox bind:checked={actions}>Действие в Result</Checkbox></div>
<div class="preview"><Result {status} title={status === 'success' ? 'Операция завершена' : status === 'error' ? 'Не удалось завершить операцию' : status === 'info' ? 'Информация об операции' : status === 'warning' ? 'Проверьте данные' : String(status)} subTitle="Выберите статус и попробуйте действие." icon={customIcon ? previewIcon : undefined} extra={actions ? previewActions : undefined} headingLevel={3} aria-label="Предпросмотр Result" /></div>
<h3>Отправка заявки</h3>
<div class="controls"><Checkbox bind:checked={fail} disabled={model.status === 'submitting'}>Ошибка отправки Result</Checkbox><Button onclick={reset}>Сбросить пример Result</Button></div>
{#if model.status === 'editing' || model.status === 'submitting'}
  <div class="workflow"><div class="form" bind:this={formHost}><Form {form} onFinish={finish} aria-label="Заявка Result"><FormItem name="name" label="Имя в заявке" htmlFor="result-example-name" help="Имя участника."><Input value={form.values.name} onValueChange={value => form.setFieldValue('name', value ?? '')} /></FormItem><FormItem name="email" label="Email в заявке" htmlFor="result-example-email" help="name@example.com"><Input type="email" value={form.values.email} onValueChange={value => form.setFieldValue('email', value ?? '')} /></FormItem><Button type="primary" htmlType="submit" loading={form.isSubmitting}>Отправить заявку</Button></Form></div></div>
{:else}
  <div class="workflow" bind:this={resultHost} role="region" aria-label="Результат отправки заявки" tabindex="-1"><Result status={model.status} title={model.status === 'success' ? 'Заявка отправлена' : 'Не удалось отправить заявку'} subTitle={`${model.submitted?.name}, ${model.submitted?.email}`} extra={completionActions} headingLevel={4}><p>{model.status === 'success' ? 'Можно вернуться к редактированию. Введённые данные сохранены.' : 'Данные сохранены. Снимите флажок ошибки и повторите отправку или измените заявку.'}</p></Result></div>
{/if}
<output aria-label="Результат примера Result">Состояние: {model.status}. Действий: {actionCount}.</output>
