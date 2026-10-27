<script lang="ts">
  import { Checkbox, InputNumber, Progress, Select, Slider, type ProgressStatus } from '$lib/components/ant-design';

  let percent = $state(42.5);
  let status = $state<'auto' | ProgressStatus>('auto');
  let size = $state<'small' | 'medium'>('medium');
  let showInfo = $state(true);
  let formatted = $state(false);
  const format = (value: number) => `${value.toFixed(1)}%`;
  const statuses = ['auto', 'normal', 'active', 'exception', 'success'].map((value) => ({ value: value as typeof status, label: value }));
  let resolvedStatus = $derived(status === 'auto' ? undefined : status);
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .field { width: 150px; }
  .preview { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 24px; }
  .line { min-width: 0; }
  .slider { margin-block: 24px; }
  @media (max-width: 575px) { .preview { grid-template-columns: minmax(0, 1fr); justify-items: center; } .line { width: 100%; } }
</style>

<div class="controls">
  <div class="field"><InputNumber aria-label="Процент Progress" min={0} max={100} step={0.5} value={percent} onValueChange={(value) => { percent = value ?? 0; }} /></div>
  <div class="field"><Select aria-label="Статус Progress" bind:value={status} options={statuses} /></div>
  <div class="field"><Select aria-label="Размер Progress" bind:value={size} options={[{ value: 'medium', label: 'medium' }, { value: 'small', label: 'small' }]} /></div>
  <Checkbox bind:checked={showInfo}>Показывать значение Progress</Checkbox><Checkbox bind:checked={formatted}>Дробная подпись Progress</Checkbox>
</div>
<div class="preview"><div class="line"><Progress {percent} {size} {showInfo} status={resolvedStatus} format={formatted ? format : undefined} aria-label="Линейный прогресс" /></div><Progress type="circle" {percent} {size} {showInfo} status={resolvedStatus === 'active' ? undefined : resolvedStatus} format={formatted ? format : undefined} aria-label="Круговой прогресс" /></div>
<div class="slider"><Slider aria-label="Изменить процент Progress" min={0} max={100} step={0.5} value={percent} onValueChange={(value) => { percent = value; }} /></div>
