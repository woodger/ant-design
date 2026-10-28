<script lang="ts">
  import { Row, Col } from '$lib/components/ant-design';
  let gutter = $state(16);
</script>

<label>Интервал колонок <input type="range" min="0" max="48" step="8" bind:value={gutter} /></label>
<Row gutter={[gutter, 16]}>
  {#each ['Планирование', 'Разработка', 'Проверка', 'Выпуск'] as title}
    <Col xs={24} sm={12} lg={6}><div class="grid-cell">{title}</div></Col>
  {/each}
</Row>

<style>
  .grid-cell { padding: 16px; background: var(--ant-color-primary-bg); color: var(--ant-color-text); border-radius: var(--ant-border-radius); }
</style>
