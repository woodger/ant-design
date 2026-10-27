<script lang="ts">
  import { Button, Form, FormItem, Radio, RadioGroup, createForm, type RadioOption } from '$lib/components/ant-design';

  const generatedId = $props.id();
  const plans: RadioOption<number>[] = [
    { value: 0, label: 'Базовый' }, { value: 1, label: 'Командный' }, { value: 2, label: 'Архивный', disabled: true }
  ];
  const form = createForm<{ plan: number | undefined; published: boolean | undefined }>({
    initialValues: { plan: 0, published: undefined },
    rules: {
      plan: [{ required: true, message: 'Выберите тариф.' }],
      published: [{ required: true, message: 'Выберите режим публикации.' }]
    }
  });
  let orientation = $state<'horizontal' | 'vertical'>('horizontal');
  let result = $state('');

  function finish(values: { plan: number | undefined; published: boolean | undefined }) {
    result = `Тариф: ${plans.find((plan) => plan.value === values.plan)?.label}. Публикация: ${values.published ? 'Опубликовано' : 'Черновик'}.`;
  }
</script>

<style>
  .example { max-width: 640px; }
  .orientation { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 24px; padding: 0; border: 0; }
  .orientation legend { margin-bottom: 8px; color: var(--ant-color-text-secondary); }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .result { margin: 16px 0 0; color: var(--ant-color-success); }
</style>

<div class="example">
  <fieldset class="orientation">
    <legend>Расположение вариантов</legend>
    <Radio name={`radio-orientation-${generatedId}`} value="horizontal" checked={orientation === 'horizontal'} onCheckedChange={() => { orientation = 'horizontal'; }}>Горизонтально</Radio>
    <Radio name={`radio-orientation-${generatedId}`} value="vertical" checked={orientation === 'vertical'} onCheckedChange={() => { orientation = 'vertical'; }}>Вертикально</Radio>
  </fieldset>
  <Form {form} onFinish={finish}>
    <FormItem name="plan" label="Тариф участника">
      <RadioGroup options={plans} {orientation} value={form.values.plan} onValueChange={(value) => { form.setFieldValue('plan', value); result = ''; }} />
    </FormItem>
    <FormItem name="published" label="Режим публикации">
      <RadioGroup options={[{ value: false, label: 'Черновик' }, { value: true, label: 'Опубликовано' }]} {orientation} value={form.values.published} onValueChange={(value) => { form.setFieldValue('published', value); result = ''; }} />
    </FormItem>
    <div class="actions"><Button type="primary" htmlType="submit" loading={form.isSubmitting}>Сохранить настройки</Button><Button htmlType="reset" onclick={() => { result = ''; }}>Сбросить настройки</Button></div>
  </Form>
  {#if result}<p class="result" role="status">{result}</p>{/if}
</div>
