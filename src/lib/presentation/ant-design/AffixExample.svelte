<script lang="ts">
  import { Affix, Button } from '$lib/components/ant-design';
  let container = $state<HTMLDivElement>();
  let affixed = $state(false);
  let clicks = $state(0);
</script>

<p>Прокрутите контейнер: кнопка закрепится у его верхней границы.</p>
<div bind:this={container} style="height:180px;overflow:auto;background:var(--ant-color-fill-quaternary)">
  <div style="height:48px"></div>
  <Affix target={() => container ?? null} offsetTop={8} onChange={value => { affixed = Boolean(value); }}>
    <Button type="primary" onclick={() => { clicks++; }}>Действие ({clicks})</Button>
  </Affix>
  <div style="height:360px"></div>
</div>
<output aria-label="Состояние Affix">{affixed ? 'Закреплён' : 'В потоке'}</output>
