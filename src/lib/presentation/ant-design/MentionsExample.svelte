<script lang="ts">
  import { Mentions, Button, getMentions } from '$lib/components/ant-design';
  let value = $state('');
  const options = [{ value: 'alice', label: 'Alice — разработка' }, { value: 'bob', label: 'Bob — дизайн' }, { value: 'team', label: 'Вся команда' }];
</script>
<div style="max-width:500px">
  <Mentions aria-label="Текст с упоминаниями" placeholder="Введите @ для выбора участника" {value} {options} autoSize={{ minRows: 2, maxRows: 5 }} allowClear onChange={next => { value = next; }} />
  <p>Упоминания: <output aria-label="Выбранные упоминания">{getMentions(value).map(item => item.value).join(', ') || '—'}</output></p>
  <Button onclick={() => { value = ''; }}>Сбросить упоминания</Button>
</div>
