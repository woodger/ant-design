<script lang="ts">
  import { AutoComplete, Button } from '$lib/components/ant-design';
  let value = $state(''); let search = $state('');
  let options = $derived(search ? ['example.com', 'mail.org', 'team.dev'].map(domain => ({ value: `${search.split('@')[0]}@${domain}` })) : []);
</script>
<div style="max-width:440px">
  <AutoComplete aria-label="Адрес с подсказками" placeholder="Введите имя почтового ящика" {value} {options} allowClear backfill onChange={next => { value = next ?? ''; }} onSearch={next => { search = next; }} />
  <p>Значение: <output aria-label="Значение AutoComplete">{value || '—'}</output></p>
  <Button onclick={() => { value = ''; search = ''; }}>Сбросить подсказки</Button>
</div>
