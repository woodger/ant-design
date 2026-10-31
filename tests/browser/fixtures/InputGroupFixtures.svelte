<script lang="ts">
  import {
    ConfigProvider,
    InputGroup,
    Input,
    Select,
    Checkbox,
    Button,
    Form,
    FormItem,
    createForm,
    type ComponentSize
  } from 'antd-svelte';

  let size = $state<'large' | 'small' | 'default'>('default');
  let contextSize = $state<ComponentSize>('small');
  let compact = $state(false);
  let reversed = $state(false);
  let empty = $state(false);
  let dark = $state(false);
  let value = $state('draft');
  let events = $state<string[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  let formDisabled = $state(false);
  const form = createForm({
    initialValues: { outer: '' },
    rules: { outer: [{ required: true, message: 'Group error' }] }
  });
</script>

{#snippet first()}<Input
  aria-label="Grouped draft"
  bind:value
  classNames={({ props }) => ({ root: `reported-${props.size}` })}
/>{/snippet}
{#snippet second()}<Button>Grouped action</Button>{/snippet}
{#snippet isolated()}<Input aria-label="Group sibling one" />{/snippet}
{#snippet explicit()}<Input aria-label="Group sibling two" name="explicit" id="explicit-input" required />{/snippet}
{#snippet selectControl()}<Select aria-label="Grouped select" options={[{ value: 'a', label: 'A' }]} />{/snippet}
{#snippet checkboxControl()}<Checkbox aria-label="Grouped checkbox">Flag</Checkbox>{/snippet}

<section id="input-group-fixture">
  <h2>InputGroup</h2>
  <label>Group legacy size<select bind:value={size}>
    <option>default</option><option>small</option><option>large</option>
  </select></label>
  <label>Group context size<select bind:value={contextSize}>
    <option>small</option><option>middle</option><option>large</option>
  </select></label>
  <label><input type="checkbox" bind:checked={compact} /> Legacy compact group</label>
  <label><input type="checkbox" bind:checked={reversed} /> Reverse group items</label>
  <label><input type="checkbox" bind:checked={empty} /> Empty input group</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark group theme</label>
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable group form</label>
  <ConfigProvider componentSize={contextSize} theme={{ mode: dark ? 'dark' : 'light', primary: 'green' }}>
    <InputGroup
      {size}
      {compact}
      class="legacy-group"
      style="max-width:400px"
      items={empty ? [] : reversed
        ? [{ key: 'action', children: second }, { key: 'draft', children: first }]
        : [{ key: 'draft', children: first }, { key: 'action', children: second }]}
      bind:nativeElement
      onMouseEnter={event => { events.push(`enter:${event.currentTarget.tagName}`); }}
      onMouseLeave={event => { events.push(`leave:${event.currentTarget.tagName}`); }}
      onFocus={event => { events.push(`focus:${event.type}:${event.currentTarget.tagName}`); }}
      onBlur={event => { events.push(`blur:${event.type}:${event.currentTarget.tagName}`); }}
    />
    <InputGroup class="snippet-group">{#snippet children()}<Input aria-label="Snippet group input" />{/snippet}</InputGroup>
    <Form {form} disabled={formDisabled}>
      <FormItem name="outer" label="Outer group"><InputGroup
        class="form-group"
        items={[{ key: 'one', children: isolated }, { key: 'two', children: explicit }]}
      /><InputGroup
        class="mixed-form-group"
        items={[{ key: 'select', children: selectControl }, { key: 'checkbox', children: checkboxControl }]}
      /></FormItem>
      <button type="submit">Validate group</button>
    </Form>
  </ConfigProvider>
  <output aria-label="Group draft">{value}</output>
  <output aria-label="Group events">{events.join('|')}</output>
  <output aria-label="Group ref">{nativeElement?.tagName}</output>
</section>
