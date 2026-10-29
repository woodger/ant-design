<script lang="ts">
  import { TextArea, Form, FormItem, createForm } from '../../src/lib/components/ant-design';
  let value = $state<string | undefined>('Initial\ntext');
  let readonly = $state(false);
  let status = $state<'error' | 'warning' | undefined>();
  let changes = $state(0);
  let inputs = $state(0);
  let enters = $state(0);
  let selection = $state('');
  let data = $state('');
  let element = $state<HTMLTextAreaElement>();
  const form = createForm({ initialValues: { description: '' }, rules: { description: [{ required: true, message: 'Enter description' }] } });
</script>
<section id="textarea-fixture" aria-label="TextArea fixture">
  <form onsubmit={event => { event.preventDefault(); data = String(new FormData(event.currentTarget).get('description')); }}>
    <label for="fixture-textarea">Description</label>
    <TextArea id="fixture-textarea" name="description" rows={4} maxlength={40} required bind:value bind:nativeElement={element} {readonly} {status}
      onValueChange={() => { changes++; }} oninput={() => { inputs++; }} onPressEnter={() => { enters++; }}
      onselect={event => { selection = event.currentTarget.value.slice(event.currentTarget.selectionStart, event.currentTarget.selectionEnd); }} />
    <button type="submit">Read textarea data</button>
  </form>
  <label><input type="checkbox" bind:checked={readonly} /> Readonly textarea</label>
  <button type="button" onclick={() => { value = 'Parent\nreplacement'; }}>Replace textarea</button>
  <button type="button" onclick={() => { value = undefined; }}>Clear textarea</button>
  <button type="button" onclick={() => { value = 'x'.repeat(50); }}>Exceed textarea maximum</button>
  <button type="button" onclick={() => { element?.focus(); element?.setSelectionRange(0, 7); }}>Select textarea text</button>
  <button type="button" onclick={() => { status = status === 'error' ? 'warning' : 'error'; }}>Toggle textarea status</button>
  <output aria-label="Textarea value">{value ?? 'undefined'}</output>
  <output aria-label="Textarea changes">{changes}:{inputs}</output>
  <output aria-label="Textarea enters">{enters}</output>
  <output aria-label="Textarea selection">{selection}</output>
  <output aria-label="Textarea data">{data}</output>
  <label for="default-textarea">Default textarea</label><TextArea id="default-textarea" defaultValue="Default text" />
  <label for="enabled-textarea">Enabled textarea</label><TextArea id="enabled-textarea" disabled={false} />
  <Form {form}>
    <FormItem name="description" label="Task description"><TextArea rows={3} value={form.values.description} onValueChange={value => form.setFieldValue('description', value)} /></FormItem>
    <button type="submit">Validate textarea</button><button type="reset">Reset textarea form</button>
  </Form>
</section>
