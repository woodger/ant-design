<script lang="ts">
  import { Button, Flex, Statistic, StatisticTimer } from '$lib/components/ant-design';

  let users = $state(112893);
  let loading = $state(false);
  let deadline = $state<number>();
  let finished = $state(false);
</script>

<Flex gap="large" wrap>
  <Statistic title="Участники" value={users} loading={loading} />
  <Statistic title="Баланс проекта" value="123456.789" precision={2} suffix="₽" loading={loading} />
  <Statistic title="Выполнение плана" value={93} suffix="/ 100" loading={loading} />
</Flex>
<div style="margin-top:16px">
  <Button onclick={() => { finished = false; deadline = Date.now() + 10000; }}>Запустить отсчёт</Button>
  {#if deadline !== undefined}<StatisticTimer title="До завершения" type="countdown" value={deadline} onFinish={() => { finished = true; }} />{/if}
  {#if finished}<p role="status">Отсчёт завершён</p>{/if}
</div>
<Flex gap="small" wrap style="margin-top:16px">
  <Button onclick={() => { users++; }}>Добавить участника</Button>
  <Button onclick={() => { loading = !loading; }}>{loading ? 'Показать значения' : 'Показать загрузку'}</Button>
</Flex>
