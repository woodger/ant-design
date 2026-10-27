<script lang="ts">
  import { Button, Checkbox, Input, Popover, type PopoverPlacement } from '$lib/components/ant-design';

  const generatedId = $props.id();
  let open = $state(false);
  let detailsOpen = $state(false);
  let placement = $state<PopoverPlacement>('top');
  let arrow = $state(true);
  const initialName = 'Анна';
  let name = $state(initialName);
  let draft = $state(initialName);

  function save(event: SubmitEvent) {
    event.preventDefault();
    name = draft.trim();
    open = false;
  }
</script>

<style>
  .settings, .examples, .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .settings { margin-bottom: 28px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .editor { width: 260px; max-width: 100%; }
  .editor label { display: block; margin-bottom: 8px; }
  .actions { margin-top: 16px; }
  .details { max-width: 260px; }
  .details p { margin: 0 0 16px; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
</style>

{#snippet editor()}
  <form class="editor" onsubmit={save}>
    <label for={`${generatedId}-name`}>Имя в профиле</label>
    <Input id={`${generatedId}-name`} bind:value={draft} required pattern=".*\S.*" />
    <div class="actions"><Button htmlType="submit" type="primary">Сохранить профиль</Button><Button onclick={() => { open = false; }}>Отмена</Button></div>
  </form>
{/snippet}

{#snippet details()}
  <div class="details"><p>Имя отображается в карточке участника. Изменить его можно в редакторе рядом.</p><Button onclick={() => { detailsOpen = false; }}>Понятно</Button></div>
{/snippet}

<div class="settings">
  <label>Положение карточки <select bind:value={placement}><option value="top">Сверху</option><option value="bottom">Снизу</option><option value="left">Слева</option><option value="right">Справа</option></select></label>
  <Checkbox bind:checked={arrow}>Стрелка карточки</Checkbox>
</div>
<div class="examples">
  <Popover title="Редактирование профиля" content={editor} trigger="click" bind:open {placement} {arrow} onOpenChange={(next) => { if (next) draft = name; }}><Button>Настроить профиль</Button></Popover>
  <Popover title="Карточка участника" content={details} bind:open={detailsOpen} {placement} {arrow}><Button>Подробности о профиле</Button></Popover>
</div>
<output aria-label="Сохранённое имя профиля">В карточке: {name}</output>
