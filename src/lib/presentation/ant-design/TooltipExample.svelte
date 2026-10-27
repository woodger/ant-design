<script lang="ts">
  import { Button, Checkbox, Tooltip, type TooltipPlacement } from '$lib/components/ant-design';

  let placement = $state<TooltipPlacement>('top');
  let arrow = $state(true);
  let open = $state(false);
</script>

<style>
  .settings, .examples { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .settings { margin-bottom: 28px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .note { margin: 20px 0 0; color: var(--ant-color-text-secondary); }
</style>

<div class="settings">
  <label>Положение подсказки <select bind:value={placement}><option value="top">Сверху</option><option value="bottom">Снизу</option><option value="left">Слева</option><option value="right">Справа</option></select></label>
  <Checkbox bind:checked={arrow}>Стрелка</Checkbox>
</div>
<div class="examples">
  <Tooltip title="Изменения сохранятся после проверки формы." {placement} {arrow}><Button>Наведите или нажмите Tab</Button></Tooltip>
  <Tooltip title="Доступно после заполнения формы." {placement} {arrow}><Button disabled>Недоступное действие</Button></Tooltip>
  <Tooltip title="Подсказкой можно управлять через bind:open." bind:open {placement} {arrow} trigger={[]}><Button onclick={() => { open = !open; }}>Показать подсказку</Button></Tooltip>
</div>
<p class="note">Escape закрывает подсказку и сохраняет фокус. У края окна положение меняется автоматически.</p>
