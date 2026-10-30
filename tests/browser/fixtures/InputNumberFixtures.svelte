<script lang="ts">
  import { ConfigProvider, Form, FormItem, InputNumber, createForm } from 'antd-svelte';

  let value = $state<number | null>(0);
  let defaultValue = $state(2.5);
  let changes = $state<(number | null)[]>([]);
  let disabled = $state(false);
  let readonly = $state(false);
  let controls = $state(true);
  let keyboard = $state(true);
  let cancelKey = $state(false);
  let cancelReset = $state(false);
  let mounted = $state(true);
  let max = $state(10);
  let precision = $state<number>();
  let small = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let purple = $state(false);
  let submissions = $state(0);
  let data = $state('');
  let outsideData = $state('');
  let nativeChanges = $state(0);
  let formDisabled = $state(false);
  let saved = $state('');
  let requiredSubmissions = $state(0);
  const form = createForm<{ quantity: number | null; price: number | null }>({
    initialValues: { quantity: null, price: 0 },
    rules: {
      quantity: [
        { required: true, message: 'Enter quantity' },
        { min: 1, max: 10, message: 'Quantity must be from 1 to 10' }
      ],
      price: [
        { required: true, message: 'Enter price' },
        { min: 0, max: 100, message: 'Price must be from 0 to 100' }
      ]
    }
  });

  function read(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    event.preventDefault();
    submissions++;
    const fields = new FormData(event.currentTarget);
    data = JSON.stringify(
      { amount: fields.getAll('amount'), defaults: fields.get('defaultAmount') }
    );
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label { display: block; margin-block: 8px; }
  output { display: block; margin-block: 8px; }
  .actions, .variants { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="input-number-fixture" aria-label="InputNumber fixture">
  <label><input type="checkbox" bind:checked={disabled} /> Disable bound number</label>
  <label><input type="checkbox" bind:checked={readonly} /> Readonly bound number</label>
  <label><input type="checkbox" bind:checked={controls} /> Show number controls</label>
  <label><input type="checkbox" bind:checked={keyboard} /> Enable number keyboard</label>
  <label><input type="checkbox" bind:checked={cancelKey} /> Cancel number keys</label>
  <label><input type="checkbox" bind:checked={cancelReset} /> Cancel number reset</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount bound number</label>
  <label><input type="checkbox" bind:checked={small} /> Small number provider</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark number theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact number theme</label>
  <label><input type="checkbox" bind:checked={purple} /> Purple number theme</label>
  <div class="actions">
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = 7.125; }}>Set number externally</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = null; }}>Clear number externally</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = 0; }}>Set number to zero</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = 12; }}>Set exceeded number</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = NaN; }}>Set non-finite number</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = Infinity; }}>Set infinite number</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { max = 1; }}>Shrink number range</button>
    <button onclick={() => { precision = 2; }}>Set number precision</button>
    <button onclick={() => { defaultValue = 8; }}>Replace number default</button>
  </div>
  <ConfigProvider
    componentSize={small ? 'small' : undefined}
    theme={{ mode: dark ? 'dark' : 'light', compact, primary: purple ? 'purple' : 'blue' }}
    style="background: var(--ant-color-bg-container)"
  >
    <form
      id="input-number-native-form"
      onsubmit={read}
      onreset={(event) => { if (cancelReset) event.preventDefault(); }}
    >
      <label for="bound-number">Bound number</label>
      {#if mounted}<InputNumber
        id="bound-number"
        name="amount"
        bind:value
        {controls}
        {keyboard}
        {precision}
        min={-10}
        {max}
        step={0.1}
        disabled={disabled || undefined}
        {readonly}
        onValueChange={(next) => changes.push(next)}
        oninput={() => { nativeChanges++; }}
        onkeydown={(event) => { if (cancelKey) event.preventDefault(); }}
      />{/if}
      <label for="default-number">Default number</label>
      <InputNumber id="default-number" name="defaultAmount" {defaultValue} />
      <div class="variants">
        <InputNumber aria-label="Large number" size="large" defaultValue={1} />
        <InputNumber aria-label="Middle number" size="middle" defaultValue={1} />
        <InputNumber aria-label="Small number" size="small" defaultValue={1} />
        <InputNumber aria-label="Warning number" status="warning" defaultValue={1} />
      </div>
      <div class="actions"><button type="submit">Read number FormData</button><button type="reset">Reset native numbers</button><button
        type="button"
        onclick={(event) => {
          event.currentTarget.form?.reset();
          mounted = false;
        }}
      >Reset and unmount number</button></div>
    </form>
    <ConfigProvider locale={{ inputNumber: { increase: 'More' } }}><InputNumber
      aria-label="Nested locale number"
      defaultValue={1}
    /></ConfigProvider>
  </ConfigProvider>
  <InputNumber aria-label="Enabled number override" disabled={false} defaultValue={1} />
  <output aria-label="Number owner">{JSON.stringify(value)}</output>
  <output aria-label="Number changes">{JSON.stringify(changes)}</output>
  <output aria-label="Number native inputs">{nativeChanges}</output>
  <output aria-label="Number submissions">{submissions}</output>
  <output aria-label="Number FormData">{data}</output>
  <form
    id="input-number-outside-form"
    onsubmit={(event) => {
      event.preventDefault();
      outsideData = String(new FormData(event.currentTarget).get('outsideNumber'));
    }}
  >
    <button type="submit">Read outside number</button><button type="reset">Reset outside number</button>
  </form>
  <InputNumber
    aria-label="Outside number"
    name="outsideNumber"
    form="input-number-outside-form"
    defaultValue={3.5}
  />
  <output aria-label="Outside number data">{outsideData}</output>
</section>

<section id="input-number-form-fixture" aria-label="InputNumber form fixture">
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable number form</label>
  <Form {form} disabled={formDisabled} onFinish={(values) => { saved = JSON.stringify(values); }}>
    <FormItem name="quantity" label="Number quantity" help="Choose quantity">
      <InputNumber
        value={form.values.quantity}
        onValueChange={(next) => form.setFieldValue('quantity', next)}
        min={0}
        max={10}
        precision={0}
      />
    </FormItem>
    <FormItem name="price" label="Number price" help="Zero is a price">
      <InputNumber
        value={form.values.price}
        onValueChange={(next) => form.setFieldValue('price', next)}
        min={0}
        max={100}
        step={0.1}
        precision={2}
      />
    </FormItem>
    <InputNumber aria-label="Form enabled number override" disabled={false} value={1} />
    <div class="actions"><button type="submit">Submit number form</button><button type="reset">Reset number form</button></div>
  </Form>
  <button onpointerdown={(event) => event.preventDefault()} onclick={() => form.resetFields()}>Reset number model</button>
  <button
    onpointerdown={(event) => event.preventDefault()}
    onclick={() => form.setFieldValue('quantity', 4)}
  >Set form quantity externally</button>
  <output aria-label="Number form owner">{JSON.stringify(form.values)}</output>
  <output aria-label="Number form saved">{saved}</output>
</section>

<section id="input-number-required-fixture" aria-label="Required number fixture">
  <form
    id="input-number-required-form"
    onsubmit={(event) => {
      event.preventDefault();
      requiredSubmissions++;
    }}
  >
    <label for="required-number">Required number</label>
    <InputNumber id="required-number" name="requiredAmount" required min={-5} max={5} />
    <button type="submit">Submit required number</button>
  </form>
  <output aria-label="Required number submissions">{requiredSubmissions}</output>
</section>
