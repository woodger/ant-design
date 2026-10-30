<script lang="ts">
  import { Input } from '$lib/components/ant-design';
  let value = $state('example');
</script>

<label for="showcase-input-features">Адрес со счётчиком</label>
<Input id="showcase-input-features" bind:value prefix="https://" suffix=".org" allowClear count={{ show: true, max: 24 }} variant="filled" />
