<script lang="ts">
  import { Timeline } from '$lib/components/ant-design';
  let reverse = $state(false);
  let pending = $state(true);
</script>
<label><input type="checkbox" bind:checked={reverse} /> Обратный порядок событий</label>
<label><input type="checkbox" bind:checked={pending} /> Ожидание следующего события</label>
<Timeline aria-label="История заказа" {reverse} pending={pending ? 'Ожидается доставка' : undefined} titleSpan="72px" items={[
  { key: 'created', title: '09:10', content: 'Заказ создан', color: 'green' },
  { key: 'paid', title: '09:15', content: 'Оплата подтверждена', color: 'green' },
  { key: 'sent', title: '10:30', content: 'Передан в доставку' }
]} />
