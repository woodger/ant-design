<script lang="ts">
  import { Button, FloatButton, FloatButtonGroup, FloatButtonBackTop } from '$lib/components/ant-design';
  let scrollArea = $state<HTMLDivElement>();
  let clicks = $state(0);
</script>

<p>Действия в группе и возврат к началу отдельной области прокрутки.</p>
{#snippet help()}<FloatButton aria-label="Помощь FloatButton" tooltip="Помощь" content="?" onclick={() => { clicks++; }} />{/snippet}
{#snippet feedback()}<FloatButton aria-label="Обратная связь FloatButton" content="!" onclick={() => { clicks++; }} />{/snippet}
<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
  <FloatButtonGroup class="ant-float-btn-pure" shape="square" items={[{ key: 'help', children: help }, { key: 'feedback', children: feedback }]} />
  <div style="max-width:100%">
    <div aria-label="Область прокрутки FloatButton" bind:this={scrollArea} style="height:140px;width:240px;max-width:100%;overflow:auto;border:1px solid var(--ant-color-border);border-radius:var(--ant-border-radius)">
      <div style="height:600px;padding:12px">Начало списка</div>
      <p>Конец списка</p>
    </div>
    <Button onclick={() => { if (scrollArea) scrollArea.scrollTop = 260; }}>Прокрутить пример FloatButton</Button>
    <FloatButtonBackTop class="ant-float-btn-pure" aria-label="К началу FloatButton" target={() => scrollArea ?? null} visibilityHeight={100} showProgress />
  </div>
</div>
<output aria-label="Действия FloatButton">{clicks}</output>
