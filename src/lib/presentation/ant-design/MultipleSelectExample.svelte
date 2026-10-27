<script lang="ts">
  import { Button, Form, FormItem, Select, createForm, type SelectOption } from '$lib/components/ant-design';

  const teams: SelectOption<number>[] = [
    { value: 0, label: 'Разработка' },
    { value: 1, label: 'Дизайн' },
    { value: 2, label: 'Аналитика' },
    { value: 3, label: 'Поддержка' },
    { value: 4, label: 'Архив', disabled: true }
  ];
  const form = createForm<{ teams: number[] }>({
    initialValues: { teams: [0, 1] },
    rules: { teams: [{ required: true, message: 'Выберите хотя бы одну команду.' }, { max: 3, message: 'Выберите не более трёх команд.' }] }
  });
  let result = $state('');

  function finish(values: { teams: number[] }) {
    result = `Сохранены команды: ${values.teams.map((value) => teams.find((team) => team.value === value)?.label).join(', ')}.`;
  }
</script>

<style>
  .example { max-width: 640px; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .selection { margin: 16px 0 0; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .result { margin: 16px 0 0; color: var(--ant-color-success); }
</style>

<div class="example">
  <Form {form} onFinish={finish}>
    <FormItem name="teams" label="Команды участника" help="Выберите от одной до трёх команд.">
      <Select mode="multiple" options={teams} value={form.values.teams} onValueChange={(value) => { form.setFieldValue('teams', value); result = ''; }} allowClear placeholder="Выберите команды" />
    </FormItem>
    <div class="actions"><Button type="primary" htmlType="submit" loading={form.isSubmitting}>Сохранить команды</Button><Button htmlType="reset" onclick={() => { result = ''; }}>Сбросить команды</Button></div>
  </Form>
  <p class="selection" role="status" aria-label="Выбранные команды">Выбрано команд: {form.values.teams.length}.</p>
  {#if result}<p class="result" role="status">{result}</p>{/if}
</div>
