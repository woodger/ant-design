<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Button, Checkbox, Form, FormItem, Switch, createForm } from '$lib/components/ant-design';
  import { createSwitchSetting } from './switch-setting.model.svelte';

  const generatedId = $props.id();
  let failSave = $state(false);
  let formResult = $state('');
  const setting = createSwitchSetting((_checked, signal) => {
    const shouldFail = failSave;
    failSave = false;

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', abort);
        if (shouldFail) reject(new Error('Save failed'));
        else resolve();
      }, 500);

      function abort() {
        clearTimeout(timer);
        reject(new DOMException('Save aborted', 'AbortError'));
      }

      signal.addEventListener('abort', abort, { once: true });
    });
  });
  const form = createForm<{ digest: boolean }>({
    initialValues: { digest: false },
    rules: { digest: [{ validator: (value) => value === true ? undefined : 'Включите отчёт для проверки формы.' }] }
  });

  onDestroy(setting.dispose);
</script>

<style>
  .example { max-width: 640px; }
  .setting { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
  .description { margin: 12px 0 16px; color: var(--ant-color-text-secondary); }
  .save-state { margin: 12px 0 24px; color: var(--ant-color-text-secondary); }
  .error { margin: 12px 0; color: var(--ant-color-error); }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .result { margin: 16px 0 0; color: var(--ant-color-success); }
</style>

<div class="example">
  <div class="setting">
    <Switch id={`switch-setting-${generatedId}`} checked={setting.checked} loading={setting.loading} onCheckedChange={(value) => { void setting.change(value); }}>
      {#snippet checkedChildren()}Вкл{/snippet}
      {#snippet unCheckedChildren()}Выкл{/snippet}
    </Switch>
    <label for={`switch-setting-${generatedId}`}>Автоматические уведомления</label>
  </div>
  <p class="description">Настройка сохраняется при переключении. При ошибке возвращается последнее сохранённое состояние.</p>
  <Checkbox bind:checked={failSave}>Ошибка следующего сохранения</Checkbox>
  {#if setting.error}<p class="error" role="alert">{setting.error}</p>{/if}
  <p class="save-state" role="status" aria-label="Сохранение уведомлений">{setting.loading ? 'Сохраняем настройку…' : setting.saved ? 'Уведомления включены.' : 'Уведомления выключены.'}</p>
  <Form {form} onFinish={() => { formResult = 'Параметры сохранены.'; }}>
    <FormItem name="digest" label="Еженедельный отчёт" required help="Для проверки формы включите отчёт.">
      <Switch size="small" checked={form.values.digest} onCheckedChange={(value) => { form.setFieldValue('digest', value); formResult = ''; }}>
        {#snippet checkedChildren()}Да{/snippet}
        {#snippet unCheckedChildren()}Нет{/snippet}
      </Switch>
    </FormItem>
    <div class="actions"><Button type="primary" htmlType="submit" loading={form.isSubmitting}>Сохранить параметры</Button><Button htmlType="reset" onclick={() => { formResult = ''; }}>Сбросить параметры</Button></div>
  </Form>
  {#if formResult}<p class="result" role="status" aria-label="Результат формы Switch">{formResult}</p>{/if}
</div>
