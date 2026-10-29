<script lang="ts">
  import { Rate } from '$lib/components/ant-design';

  let value = $state(2.5);
  const tooltips = ['Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];
</script>

<Rate aria-label="Оценка" {value} allowHalf {tooltips} onChange={next => { value = next; }} />
<p>Оценка: <output aria-label="Выбранная оценка">{value}</output> из 5</p>
<Rate aria-label="Оценка только для чтения" value={4} disabled />
