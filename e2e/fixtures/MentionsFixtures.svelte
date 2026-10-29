<script lang="ts">
  import { Mentions, Form, FormItem, Button, createForm, getMentions, type MentionsOption } from '../../src/lib/components/ant-design';
  let value = $state(''); let showAutosize = $state(true); let accept = $state(true); let filter = $state(true); let loading = $state(false); let readonly = $state(false); let visible = $state(true); let clearDisabled = $state(false);
  let placement = $state<'top' | 'bottom'>('bottom'); let events = $state<string[]>([]); let searches = $state<string[]>([]); let resizes = $state(0);
  let options = $state<readonly MentionsOption[]>([{ value: 'alice', label: 'Alice' }, { value: 'blocked', label: 'Blocked', disabled: true }, { value: 'bob', label: rich }]);
  let instance = $state<Mentions>(); let submitted = $state('');
  const form = createForm({ initialValues: { note: '' }, rules: { note: [{ required: true, message: 'Note required' }] } });
</script>
{#snippet rich()}<strong>Bob rich</strong>{/snippet}
<section id="mentions-fixture">
  {#if visible}<Mentions bind:this={instance} aria-label="Mention text" name="mentions" {value} {options} {loading} {readonly} {placement} rows={3} prefix={['@', '#']} filterOption={filter ? undefined : false} allowClear={{ disabled: clearDisabled }}
    onChange={next => { events = [...events, `change:${next}`]; if (accept) value = next; }} onSelect={(option, prefix) => { events = [...events, `select:${option.value}:${prefix}`]; }}
    onSearch={(text, prefix) => { searches = [...searches, `${prefix}:${text}`]; }} onClear={() => { events = [...events, 'clear']; }} />{/if}
  <Mentions aria-label="Default mentions" defaultValue="seed" options={[{ value: 'alice' }]} />
  {#if showAutosize}<Mentions aria-label="Autosize mentions" autoSize={{ minRows: 2, maxRows: 4 }} options={[{ value: 'alice' }]} onResize={() => { resizes++; }} />{/if}
  <Form {form} onFinish={data => { submitted = data.note; }}><FormItem name="note" label="Form mentions"><Mentions value={form.values.note} onChange={next => form.setFieldValue('note', next)} options={[{ value: 'alice', label: 'Alice' }]} /></FormItem><Button htmlType="submit">Submit mentions</Button><Button htmlType="reset">Reset mentions</Button></Form>
  <label><input type="checkbox" bind:checked={accept} /> Accept mentions changes</label><label><input type="checkbox" bind:checked={filter} /> Filter mentions</label><label><input type="checkbox" bind:checked={loading} /> Loading mentions</label><label><input type="checkbox" bind:checked={readonly} /> Readonly mentions</label><label><input type="checkbox" bind:checked={clearDisabled} /> Disable mentions clear</label>
  <label>Placement<select aria-label="Mentions placement" bind:value={placement}><option value="bottom">bottom</option><option value="top">top</option></select></label>
  <button type="button" onclick={() => { showAutosize = !showAutosize; }}>Toggle autosize mount</button>
  <button type="button" onclick={() => { value = 'owner'; }}>Replace mentions owner</button><button type="button" onclick={() => { options = []; }}>Empty mentions options</button><button type="button" onclick={() => { options = [{ value: 'alice', label: 'Alice' }, { value: 'bob', label: rich }]; }}>Restore mentions options</button><button type="button" onclick={() => instance?.focus()}>Focus mentions</button><button type="button" onclick={() => { visible = !visible; }}>Toggle mentions mount</button>
  <output aria-label="Mentions value">{value}</output><output aria-label="Mentions events">{JSON.stringify(events)}</output><output aria-label="Mentions searches">{JSON.stringify(searches)}</output><output aria-label="Mentions entities">{JSON.stringify(getMentions(value, { prefix: ['@', '#'] }))}</output><output aria-label="Mentions resizes">{resizes}</output><output aria-label="Mentions submitted">{submitted}</output>
</section>
