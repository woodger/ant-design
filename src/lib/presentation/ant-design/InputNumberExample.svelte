<script lang="ts">
  import { Button, Form, FormItem, InputNumber, createForm } from '$lib/components/ant-design';

  let result = $state('');
  const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
  const form = createForm<{ quantity: number | null; price: number | null }>({
    initialValues: { quantity: 2, price: 12.5 },
    rules: {
      quantity: [
        { required: true, message: 'Введите количество.' },
        { min: 0, max: 99, message: 'Количество должно быть от 0 до 99.' },
        { validator: (value) => value === null || Number.isInteger(value) ? undefined : 'Введите целое количество.' }
      ],
      price: [
        { required: true, message: 'Введите цену.' },
        { min: 0, max: 1000, message: 'Цена должна быть от 0 до 1000.' }
      ]
    }
  });
  let total = $derived(form.values.quantity === null || form.values.price === null ? '—' : money.format(form.values.quantity * form.values.price));

  function setValue(name: 'quantity' | 'price', value: number | null) {
    form.setFieldValue(name, value);
    result = '';
  }
</script>

<style>
  .example { max-width: 640px; }
  .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 24px; }
  .total { margin: 0 0 24px; font-size: 18px; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .result { margin: 16px 0 0; color: var(--ant-color-success); }
  @media (max-width: 560px) { .fields { grid-template-columns: minmax(0, 1fr); } }
</style>

<div class="example">
  <Form {form} onFinish={() => { result = `Заказ рассчитан: ${total}`; }}>
    <div class="fields">
      <FormItem name="quantity" label="Количество" help="От 0 до 99, шаг 1.">
        <InputNumber value={form.values.quantity} onValueChange={(value) => setValue('quantity', value)} min={0} max={99} precision={0} style="width: 100%" />
      </FormItem>
      <FormItem name="price" label="Цена за единицу" help="От 0 до 1000, шаг 0.1. Дробная часть вводится через точку.">
        <InputNumber value={form.values.price} onValueChange={(value) => setValue('price', value)} min={0} max={1000} step={0.1} precision={2} style="width: 100%" />
      </FormItem>
    </div>
    <p class="total" role="status" aria-label="Стоимость заказа">Стоимость: <strong>{total}</strong></p>
    <div class="actions"><Button type="primary" htmlType="submit" loading={form.isSubmitting}>Рассчитать заказ</Button><Button htmlType="reset" onclick={() => { result = ''; }}>Сбросить заказ</Button></div>
  </Form>
  {#if result}<p class="result" role="status" aria-label="Результат расчёта">{result}</p>{/if}
</div>
