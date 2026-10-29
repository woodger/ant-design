<script lang="ts">
  import { TextArea } from '$lib/components/ant-design';
  let description = $state('Описание задачи\nДополнительные детали');
</script>
<label for="showcase-task-description">Описание задачи</label>
<TextArea id="showcase-task-description" name="description" rows={4} maxlength={2000} required bind:value={description} />
<output aria-label="Длина описания задачи">{description.length}</output>
