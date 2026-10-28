<script lang="ts">
  import { Segmented, type SegmentedValue } from '$lib/components/ant-design';

  let period = $state<SegmentedValue>('week');
  const totals: Record<string, number> = { day: 12, week: 58, month: 211 };
</script>

<Segmented aria-label="Период отчёта" options={[{ value: 'day', label: 'День' }, { value: 'week', label: 'Неделя' }, { value: 'month', label: 'Месяц' }]} bind:value={period} />
<p>Выполнено задач: <strong>{totals[String(period)]}</strong></p>
