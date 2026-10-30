<script lang="ts">
  import { TextArea } from '$lib/components/ant-design';
  let value = $state('Текст с автоматической высотой\nи счётчиком символов.');
</script>

<label for="showcase-textarea-features">Автоматический размер</label>
<TextArea id="showcase-textarea-features" bind:value autoSize={{ minRows: 2, maxRows: 5 }} allowClear showCount count={{ max: 120 }} variant="filled" />
