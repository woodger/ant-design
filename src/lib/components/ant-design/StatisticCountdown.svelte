<script lang="ts">
  import StatisticTimer from './StatisticTimer.svelte';
  import type { StatisticCountdownProps } from './statistic-timer.types';

  let { nativeElement = $bindable(), ...rest }: StatisticCountdownProps = $props();
</script>

<StatisticTimer {...rest} type="countdown" bind:nativeElement />
