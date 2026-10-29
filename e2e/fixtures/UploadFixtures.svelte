<script lang="ts">
  import { Upload, UploadDragger, Button, Form, createForm, UPLOAD_LIST_IGNORE, type UploadFile, type UploadChangeParam, type UploadRequestOptions } from '../../src/lib/components/ant-design';
  const form = createForm({ initialValues: {} });
  let files = $state.raw<UploadFile[]>([]);
  let mode = $state('manual'); let acceptChanges = $state(true); let veto = $state(false); let maximum = $state(0); let single = $state(false); let hidden = $state(false); let readonly = $state(false); let transport = $state('custom');
  let events = $state<string[]>([]); let aborted = $state(0); let drops = $state(0); let downloaded = $state(''); let previewed = $state(''); let show = $state(true);
  let requests = $state.raw<UploadRequestOptions[]>([]);
  let upload = $state<Upload>();
  function change(info: UploadChangeParam) { events = [...events, `${info.file.name}:${'status' in info.file ? info.file.status : 'none'}:${info.fileList.map(file => file.name).join(',')}`]; if (acceptChanges) files = info.fileList; }
  function finish(fail = false) { for (const request of requests) { if (fail) request.onError?.(Error('Upload fixture error'), { reason: 'fixture' }); else request.onSuccess?.('{"ok":true}'); } requests = []; }
</script>
<section id="upload-fixture" aria-label="Upload fixture">
  {#if show}
    <Upload bind:this={upload} id="upload-input" aria-label="Upload files" fileList={files} multiple={!single} maxCount={maximum || undefined} showUploadList={!hidden} disabled={readonly || undefined}
      action={async file => `/upload-fixture/${file.name}`} method="PUT" name="attachment" headers={{ 'X-Upload-Fixture': 'yes' }} data={async file => ({ tags: ['a','b'], source: file.name })}
      customRequest={transport === 'custom' ? (options, { defaultRequest }) => { if (mode === 'delegate') return defaultRequest(options); requests = [...requests, options]; return { abort: () => { aborted++; } }; } : undefined}
      beforeUpload={async file => { if (file.name.startsWith('ignore')) return UPLOAD_LIST_IGNORE; if (file.name.startsWith('reject')) throw Error('rejected'); if (mode === 'manual') return false; if (mode === 'transform') return new Blob(['transformed'], { type: 'text/plain' }); }}
      onChange={change} onRemove={async () => !veto} onPreview={file => { previewed = file.name; }} onDownload={file => { downloaded = file.name; }}>
      <Button disabled={readonly || undefined}>Choose files</Button>
    </Upload>
  {/if}
  <UploadDragger aria-label="Drop files" multiple accept=".txt" beforeUpload={() => false} onChange={info => { events = [...events, `drop:${info.file.name}`]; }} onDrop={() => { drops++; }} height={120}><p class="ant-upload-text">Drop or select files</p><p class="ant-upload-hint">Text files</p></UploadDragger>
  <Upload aria-label="Default upload" defaultFileList={[{uid:'initial',name:'initial.txt',status:'done'}]} beforeUpload={() => false} multiple><Button>Default files</Button></Upload>
  <Upload aria-label="Picture upload" beforeUpload={() => false} listType="picture-card" defaultFileList={[{uid:'picture',name:'pixel.png',status:'done',url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4XQAAAAASUVORK5CYII='}]} showUploadList={{showDownloadIcon:true}} onPreview={file => { previewed = file.name; }} onDownload={file => { downloaded = file.name; }}><Button>Picture files</Button></Upload>
  <Form {form} disabled><Upload aria-label="Form disabled upload"><Button>Disabled form files</Button></Upload><Upload aria-label="Form enabled override" disabled={false}><Button disabled={false}>Override form files</Button></Upload></Form>
  <label>Upload mode<select aria-label="Upload mode" bind:value={mode}><option value="manual">manual</option><option value="auto">auto</option><option value="transform">transform</option><option value="delegate">delegate</option></select></label>
  <label>Upload transport<select aria-label="Upload transport" bind:value={transport}><option value="custom">custom</option><option value="xhr">xhr</option></select></label>
  <label>Max files<input type="number" aria-label="Max files" bind:value={maximum} /></label>
  <label><input type="checkbox" bind:checked={acceptChanges} /> Accept upload changes</label><label><input type="checkbox" bind:checked={veto} /> Veto removal</label>
  <label><input type="checkbox" bind:checked={single} /> Single upload</label><label><input type="checkbox" bind:checked={hidden} /> Hide upload list</label><label><input type="checkbox" bind:checked={readonly} /> Disable upload</label>
  <button type="button" onclick={() => { requests.forEach(request => request.onProgress?.({ percent: 42 })); }}>Upload progress</button>
  <button type="button" onclick={() => finish()}>Finish upload</button><button type="button" onclick={() => finish(true)}>Fail upload</button>
  <button type="button" onclick={() => upload?.abort()}>Abort upload</button><button type="button" onclick={() => { files = []; }}>Clear upload owner</button>
  <button type="button" onclick={() => { show = !show; }}>Toggle upload mount</button>
  <output aria-label="Upload value">{JSON.stringify(files.map(file => ({ name:file.name,status:file.status ?? null,percent:file.percent })))}</output>
  <output aria-label="Upload events">{JSON.stringify(events)}</output><output aria-label="Aborted uploads">{aborted}</output><output aria-label="Drop count">{drops}</output>
  <output aria-label="Download file">{downloaded}</output><output aria-label="Preview file">{previewed}</output><output aria-label="Request count">{requests.length}</output>
</section>
