<script lang="ts">
  import { untrack } from 'svelte';
  import Statistic from './Statistic.svelte';
  import { formatStatisticTime } from './statistic-timer.engine';
  import { createStatisticTimerModel } from './statistic-timer.model.svelte';
  import type { StatisticTimerProps } from './statistic-timer.types';
  import type { StatisticValue } from './statistic.types';

  let { type, value, format = 'HH:mm:ss', onChange, onFinish, formatter: _formatter, valueRender: _valueRender, nativeElement = $bindable(), ...rest }: StatisticTimerProps = $props();
  let request = $derived({ value, type });
  const model = createStatisticTimerModel(() => request, () => ({ onChange, onFinish }));

  function formatValue(formatValue: StatisticValue) {
    if (model.now === undefined) return '-';

    const target = new Date(formatValue).getTime();
    const now = Date.now();
    return formatStatisticTime(Math.max(type === 'countdown' ? target - now : now - target, 0), format);
  }

  $effect(() => {
    const current = request;
    return untrack(() => model.connect(current, {
      now: () => Date.now(),
      repeat: (callback, milliseconds) => { const timer = window.setInterval(callback, milliseconds); return () => window.clearInterval(timer); }
    }));
  });
</script>

<Statistic {...rest} {value} formatter={formatValue} bind:nativeElement />
