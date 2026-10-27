<script lang="ts">
  import { Button, Checkbox, Form, FormItem, InputNumber, Slider, createForm } from '$lib/components/ant-design';

  const generatedId = $props.id();
  let vertical = $state(false);
  let reverse = $state(false);
  let disabled = $state(false);
  let applied = $state(40);
  let result = $state('');
  const form = createForm({
    initialValues: { volume: 40 },
    rules: { volume: [{ min: 10, max: 90, message: 'Для сохранения выберите громкость от 10 до 90.' }] }
  });

  function setVolume(value: number | null | undefined) {
    form.setFieldValue('volume', value ?? 0);
    result = '';
  }
</script>

<style>
  .example { max-width: 640px; }
  .settings, .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
  .settings { margin-bottom: 24px; }
  .pair { display: grid; grid-template-columns: minmax(0, 1fr) 130px; gap: 24px; }
  .vertical { display: flex; justify-content: center; }
  .exact label { display: block; margin-bottom: 8px; }
  .applied { margin: 0 0 24px; color: var(--ant-color-text-secondary); }
  .result { margin: 16px 0 0; color: var(--ant-color-success); }
  @media (max-width: 560px) { .pair { grid-template-columns: minmax(0, 1fr); gap: 0; } .exact { margin-bottom: 24px; } }
</style>

<div class="example">
  <div class="settings">
    <Checkbox bind:checked={vertical}>Вертикальное расположение</Checkbox>
    <Checkbox bind:checked={reverse}>Обратное направление</Checkbox>
    <Checkbox bind:checked={disabled}>Недоступно</Checkbox>
  </div>
  <Form {form} {disabled} onFinish={(values) => { result = `Громкость сохранена: ${values.volume}%.`; }}>
    <div class="pair">
      <FormItem name="volume" label="Громкость уведомлений" help="Шаг 5. Для проверки формы сохраните значение от 10 до 90.">
        <div class:vertical><Slider value={form.values.volume} onValueChange={setVolume} onChangeComplete={(value) => { applied = value; }} step={5} orientation={vertical ? 'vertical' : 'horizontal'} {reverse} style={vertical ? 'height: 160px' : undefined} /></div>
      </FormItem>
      <div class="exact">
        <label for={`slider-exact-${generatedId}`}>Точная громкость</label>
        <InputNumber id={`slider-exact-${generatedId}`} bind:value={() => form.values.volume, setVolume} min={0} max={100} step={5} precision={0} style="width: 100%" onblur={() => { applied = form.values.volume; }} />
      </div>
    </div>
    <p class="applied" role="status" aria-label="Применённая громкость">Применено: {applied}%.</p>
    <div class="actions"><Button type="primary" htmlType="submit" loading={form.isSubmitting}>Сохранить громкость</Button><Button htmlType="reset" onclick={() => { result = ''; applied = 40; }}>Сбросить громкость</Button></div>
  </Form>
  {#if result}<p class="result" role="status" aria-label="Результат настройки громкости">{result}</p>{/if}
</div>
