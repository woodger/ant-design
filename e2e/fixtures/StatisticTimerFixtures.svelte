<script lang="ts">
  import { StatisticTimer, StatisticCountdown, type StatisticTimerType } from '../../src/lib/components/ant-design';

  let target = $state(Date.now() + 10000);
  let type = $state<StatisticTimerType>('countdown');
  let format = $state('HH:mm:ss');
  let alias = $state(false);
  let mounted = $state(true);
  let changes = $state(0);
  let finishes = $state(0);
  let latest = $state<number>();
  let nativeElement = $state<HTMLDivElement>();
  function changed(value: number) { changes++; latest = value; }
</script>

<section id="statistic-timer-fixture" aria-label="Statistic timer fixture">
  <h2>StatisticTimer</h2>
  <label>Timer target<input type="number" bind:value={target} /></label>
  <label>Timer direction<select bind:value={type}><option>countdown</option><option>countup</option></select></label>
  <label>Timer format<input bind:value={format} /></label>
  <label><input type="checkbox" bind:checked={alias} /> Countdown alias</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount timer</label>
  <button type="button" onclick={() => { target = Date.now() + 10000; }}>Restart timer</button>
  <button type="button">Before timer</button>
  {#if mounted}
    {#if alias}<StatisticCountdown id="fixture-timer" title="Remaining" value={target} {format} onChange={changed} onFinish={() => { finishes++; }} bind:nativeElement />
    {:else}<StatisticTimer id="fixture-timer" title="Time" value={target} {type} {format} onChange={changed} onFinish={() => { finishes++; }} bind:nativeElement />{/if}
  {/if}
  <button type="button">After timer</button>
  <output aria-label="Timer changes">{changes}</output>
  <output aria-label="Timer finishes">{finishes}</output>
  <output aria-label="Timer latest">{latest}</output>
  <output aria-label="Timer native element">{nativeElement?.id}</output>
</section>
