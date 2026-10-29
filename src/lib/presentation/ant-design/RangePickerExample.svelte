<script lang="ts">
  import dayjs from 'dayjs';
  import { RangePicker, Form, FormItem, Button, createForm, type RangePickerValue } from '$lib/components/ant-design';
  const form = createForm<{ period: RangePickerValue | null }>({ initialValues: { period: [dayjs('2026-10-10T09:00'), dayjs('2026-10-20T18:00')] }, rules: { period: [{ required: true, message: 'Выберите период.' }] } });
  let result = $state('');
</script>
<div style="max-width:640px;min-width:0">
  <Form {form} onFinish={values => { result = values.period?.map(date => date?.format('YYYY-MM-DD HH:mm:ss') ?? '—').join(' — ') ?? ''; }}>
    <FormItem name="period" label="Период события">
      <RangePicker value={form.values.period} showTime style="width:100%" onChange={next => form.setFieldValue('period', next)} />
    </FormItem>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><Button htmlType="submit" type="primary">Сохранить период</Button><Button htmlType="reset">Сбросить период</Button></div>
  </Form>
  <output aria-label="Сохранённый период">{result}</output>
</div>
