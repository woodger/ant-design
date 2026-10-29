<script lang="ts">
  import { UploadDragger, Button, type UploadFile } from '$lib/components/ant-design';
  let files = $state.raw<UploadFile[]>([]);
  let result = $state('');
  let sending = $state(false);
  let generation = 0;
  async function send() {
    const version = ++generation; sending = true;
    files = files.map(file => ({ ...file, status: 'uploading', percent: 0 }));
    // Демонстрационный транспорт; приложение выбирает свой endpoint и формат ответа.
    await Promise.resolve();
    if (version !== generation) return;
    result = files.map(file => file.name).join(', ');
    files = files.map(file => ({ ...file, status: 'done', percent: 100, response: { demo: true } })); sending = false;
  }
</script>
<div style="max-width:640px">
  <UploadDragger fileList={files} multiple beforeUpload={() => false} disabled={sending} onChange={info => { files = info.fileList; }}>
    <p class="ant-upload-text">Нажмите или перетащите файлы</p>
    <p class="ant-upload-hint">Выберите несколько файлов и запустите загрузку вручную.</p>
  </UploadDragger>
  <p>Демонстрация выполняется локально без отправки файлов на сервер.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <Button type="primary" disabled={!files.length} loading={sending} onclick={send}>Запустить демозагрузку</Button>
    <Button onclick={() => { generation++; files = []; result = ''; sending = false; }}>Сбросить файлы</Button>
  </div>
  <output aria-label="Загруженные файлы">{result}</output>
</div>
