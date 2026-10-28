<script lang="ts">
  import { Button, Flex, Statistic } from '$lib/components/ant-design';

  let users = $state(112893);
  let loading = $state(false);
</script>

<Flex gap="large" wrap>
  <Statistic title="Участники" value={users} loading={loading} />
  <Statistic title="Баланс проекта" value="123456.789" precision={2} suffix="₽" loading={loading} />
  <Statistic title="Выполнение плана" value={93} suffix="/ 100" loading={loading} />
</Flex>
<Flex gap="small" wrap style="margin-top:16px">
  <Button onclick={() => { users++; }}>Добавить участника</Button>
  <Button onclick={() => { loading = !loading; }}>{loading ? 'Показать значения' : 'Показать загрузку'}</Button>
</Flex>
