<script lang="ts">
  import { Steps, Select } from '$lib/components/ant-design';
  import type { StepsType } from '$lib/components/ant-design';
  let type = $state<StepsType>('dot');
  let current = $state(3);
</script>

<div style="margin-top:24px">
  <Select aria-label="Вариант Steps" bind:value={type} options={['default', 'dot', 'inline', 'navigation', 'panel'].map(value => ({ value: value as StepsType, label: value }))} style="width:160px;margin-bottom:16px" />
  <Steps aria-label="Расширенные этапы" {type} variant="outlined" {current} maxCount={3} onChange={index => { current = index; }} items={Array.from({ length: 8 }, (_, index) => ({ title: `Этап ${index + 1}`, content: `Описание этапа ${index + 1}` }))} />
</div>
