<script lang="ts">
  import { Button, Modal, Watermark } from '$lib/components/ant-design';
  let open = $state(false);
</script>

<Watermark content={['Ant Design', { text: 'Svelte 5', font: { fontSize: 12 } }]}>
  <div style="padding:40px;min-height:180px"><p>Содержимое с повторяющимся водяным знаком.</p><Button onclick={() => { open = true; }}>Открыть защищённое окно</Button></div>
  <Modal title="Watermark в Modal" bind:open footer={null}><p>Водяной знак наследуется через контекст.</p></Modal>
</Watermark>
