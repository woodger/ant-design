<script lang="ts">
  import {
    AutoComplete,
    Form,
    FormItem,
    Button,
    createForm,
    type AutoCompleteItem
  } from 'antd-svelte';

  let value = $state<string | undefined>('');
  let accept = $state(true);
  let lockClosed = $state(false);
  let backfill = $state(false);
  let filter = $state(false);
  let forced = $state(false);
  let visible = $state(true);
  let events = $state<string[]>([]);
  let searches = $state<string[]>([]);
  let openings = $state<boolean[]>([]);
  let options = $state<readonly AutoCompleteItem[]>([]);
  const initial: AutoCompleteItem[] = [
    {
      key: 'g',
      label: 'Letters',
      options: [
        { value: 'alpha', label: 'Alpha label' },
        { value: 'alpine', label: 'Alpine label' },
        { value: 'blocked', label: 'Blocked label', disabled: true }
      ]
    },
    { value: 'beta', label: rich }
  ];
  options = initial;
  let instance = $state<AutoComplete>();
  let submitted = $state('');
  const form = createForm(
    {
      initialValues: { query: '' },
      rules: { query: [{ required: true, message: 'Query required' }] }
    }
  );
</script>
{#snippet rich()}<strong>Beta rich</strong>{/snippet}
<section id="auto-complete-fixture">
  {#if visible}<AutoComplete
    bind:this={instance}
    aria-label="Completion"
    name="completion"
    {options}
    {value}
    {backfill}
    filterOption={filter}
    open={lockClosed ? false : forced ? true : undefined}
    allowClear
    onChange={next => {
      events = [...events, `change:${String(next)}`];
      if (accept) value = next;
    }}
    onSearch={next => { searches = [...searches, next]; }}
    onSelect={(next, option) => { events = [...events, `select:${next}:${option.value}`]; }}
    onOpenChange={next => { openings = [...openings, next]; }}
    onClear={() => { events = [...events, 'clear']; }}
  />{/if}
  <AutoComplete
    aria-label="Default completion"
    defaultValue="seed"
    options={[{ value: 'seed' }, { value: 'other' }]}
  />
  <AutoComplete options={initial} aria-label="Custom completion">{#snippet children(control)}<textarea
    {...control.attributes}
    use:control.register
    rows="3"
    class="custom-completion"
  ></textarea>{/snippet}</AutoComplete>
  <Form {form} onFinish={values => { submitted = values.query; }}><FormItem
    name="query"
    label="Form completion"
  ><AutoComplete
    options={initial}
    value={form.values.query}
    onChange={next => form.setFieldValue('query', next ?? '')}
  /></FormItem><Button
    htmlType="submit"
  >Submit completion</Button><Button
    htmlType="reset"
  >Reset completion</Button></Form>
  <label><input type="checkbox" bind:checked={lockClosed} /> Lock completion closed</label>
  <label><input type="checkbox" bind:checked={accept} /> Accept completion changes</label><label><input
    type="checkbox"
    bind:checked={backfill}
  /> Completion backfill</label><label><input
    type="checkbox"
    bind:checked={filter}
  /> Filter completions</label><label><input
    type="checkbox"
    bind:checked={forced}
  /> Force completion open</label>
  <button type="button" onclick={() => { value = 'owner'; }}>Replace completion owner</button><button
    type="button"
    onclick={() => { options = []; }}
  >Empty completion options</button><button
    type="button"
    onclick={() => { options = initial; }}
  >Restore completion options</button><button
    type="button"
    onclick={() => instance?.focus()}
  >Focus completion</button><button
    type="button"
    onclick={() => { visible = !visible; }}
  >Toggle completion mount</button>
  <output aria-label="Completion value">{JSON.stringify(value)}</output><output
    aria-label="Completion events"
  >{JSON.stringify(events)}</output><output
    aria-label="Completion searches"
  >{JSON.stringify(searches)}</output><output
    aria-label="Completion openings"
  >{JSON.stringify(openings)}</output><output
    aria-label="Completion submitted"
  >{submitted}</output>
</section>
