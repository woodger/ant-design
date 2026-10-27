<script lang="ts">
  import { ConfigProvider, Form, FormItem, InputNumber, Slider, createForm } from '../../src/lib/components/ant-design';

  let value = $state(20);
  let defaultValue = $state(35);
  let changes = $state<number[]>([]);
  let completed = $state<number[]>([]);
  let min = $state(0);
  let max = $state(100);
  let step = $state(5);
  let disabled = $state(false);
  let keyboard = $state(true);
  let reverse = $state(false);
  let vertical = $state(false);
  let cancelKeys = $state(false);
  let cancelPointer = $state(false);
  let cancelReset = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let purple = $state(false);
  let nativeForm = $state<HTMLFormElement>();
  let submissions = $state(0);
  let data = $state('');
  let outsideData = $state('');
  let formDisabled = $state(false);
  let formSaved = $state('');
  let formCompleted = $state<number[]>([]);
  const form = createForm({
    initialValues: { level: 0, gain: 0 },
    rules: {
      level: [{ required: true }, { min: 20, max: 80, message: 'Level must be from 20 to 80' }],
      gain: [{ required: true }]
    }
  });

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') disabled = !disabled;
    if (event.key === 'F4') value = 60;
    if (event.key === 'F5') max = 50;
    if (event.key === 'F6') mounted = false;
    if (event.key === 'F7') form.resetFields();
    if (event.key === 'F8') nativeForm?.reset();
  }

  function read(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    event.preventDefault();
    submissions++;
    const fields = new FormData(event.currentTarget);
    data = JSON.stringify({ volume: fields.getAll('volume'), defaults: fields.get('defaultVolume') });
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .slider-zone { max-width: 400px; }
  .vertical { display: flex; justify-content: center; }
</style>

<svelte:window onkeydown={hotkey} />

<section id="slider-fixture" aria-label="Slider fixture">
  <label><input type="checkbox" bind:checked={disabled} /> Disable bound Slider</label>
  <label><input type="checkbox" bind:checked={keyboard} /> Enable Slider keyboard</label>
  <label><input type="checkbox" bind:checked={reverse} /> Reverse Slider</label>
  <label><input type="checkbox" bind:checked={vertical} /> Vertical Slider</label>
  <label><input type="checkbox" bind:checked={cancelKeys} /> Cancel Slider keys</label>
  <label><input type="checkbox" bind:checked={cancelPointer} /> Cancel Slider pointer</label>
  <label><input type="checkbox" bind:checked={cancelReset} /> Cancel Slider reset</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount bound Slider</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Slider theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Slider theme</label>
  <label><input type="checkbox" bind:checked={purple} /> Purple Slider theme</label>
  <div class="actions">
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = 60; }}>Set Slider externally</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = 120; }}>Set exceeded Slider</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { value = NaN; }}>Set non-finite Slider</button>
    <button onpointerdown={(event) => event.preventDefault()} onclick={() => { max = 50; }}>Shrink Slider range</button>
    <button onclick={() => { min = 0; max = 1; step = 0.1; value = 0.2; }}>Use fractional Slider</button>
    <button onclick={() => { min = 0; max = 10; step = 3; value = 10; }}>Use non-dividing Slider step</button>
    <button onclick={() => { min = 4; max = 4; value = 20; }}>Use fixed Slider range</button>
    <button onclick={() => { defaultValue = 95; }}>Replace Slider default</button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: purple ? 'purple' : 'blue' }} style="background: var(--ant-color-bg-container); padding: 16px">
    <form id="slider-native-form" bind:this={nativeForm} onsubmit={read} onreset={(event) => { if (cancelReset) event.preventDefault(); }}>
      <label for="bound-slider">Bound Slider</label>
      <div class="slider-zone" class:vertical>
        {#if mounted}<Slider id="bound-slider" name="volume" bind:value {min} {max} {step} {keyboard} {reverse} orientation={vertical ? 'vertical' : 'horizontal'} disabled={disabled || undefined} style={vertical ? 'height: 180px' : undefined} onValueChange={(next) => changes.push(next)} onChangeComplete={(next) => completed.push(next)} onkeydown={(event) => { if (cancelKeys) event.preventDefault(); }} onpointerdown={(event) => { if (cancelPointer) event.preventDefault(); }} />{/if}
      </div>
      <label for="default-slider">Default Slider</label>
      <div class="slider-zone"><Slider id="default-slider" name="defaultVolume" {defaultValue} /></div>
      <div class="actions"><button type="submit">Read Slider FormData</button><button type="reset">Reset native Sliders</button><button type="button" onclick={(event) => { event.currentTarget.form?.reset(); mounted = false; }}>Reset and unmount Slider</button></div>
    </form>
    <label for="slider-exact-fixture">Exact Slider value</label>
    <InputNumber id="slider-exact-fixture" bind:value={() => value, (next) => { value = next ?? 0; }} {min} {max} {step} disabled={disabled || undefined} />
  </ConfigProvider>
  <Slider aria-label="Enabled Slider override" disabled={false} defaultValue={25} />
  <output aria-label="Slider owner">{String(value)}</output>
  <output aria-label="Slider changes">{JSON.stringify(changes)}</output>
  <output aria-label="Slider completed">{JSON.stringify(completed)}</output>
  <output aria-label="Slider submissions">{submissions}</output>
  <output aria-label="Slider FormData">{data}</output>
  <form id="slider-outside-form" onsubmit={(event) => { event.preventDefault(); outsideData = String(new FormData(event.currentTarget).get('externalSlider')); }}><button type="submit">Read outside Slider</button><button type="reset">Reset outside Slider</button></form>
  <Slider aria-label="Outside Slider" form="slider-outside-form" name="externalSlider" defaultValue={15} />
  <output aria-label="Outside Slider data">{outsideData}</output>
</section>

<section id="slider-form-fixture" aria-label="Slider form fixture">
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable Slider form</label>
  <Form {form} disabled={formDisabled} onFinish={(values) => { formSaved = JSON.stringify(values); }}>
    <FormItem name="level" label="Slider level" help="Choose a level">
      <Slider value={form.values.level} onValueChange={(next) => form.setFieldValue('level', next)} onChangeComplete={(next) => formCompleted.push(next)} step={5} />
    </FormItem>
    <FormItem name="gain" label="Slider gain" help="Zero is valid"><Slider value={form.values.gain} onValueChange={(next) => form.setFieldValue('gain', next)} min={0} max={1} step={0.1} /></FormItem>
    <Slider aria-label="Form enabled Slider override" disabled={false} value={25} />
    <div class="actions"><button type="submit">Submit Slider form</button><button type="reset">Reset Slider form</button></div>
  </Form>
  <div class="actions"><button onpointerdown={(event) => event.preventDefault()} onclick={() => form.setFieldValue('level', 60)}>Set form Slider externally</button><button onpointerdown={(event) => event.preventDefault()} onclick={() => form.resetFields()}>Reset Slider model</button></div>
  <output aria-label="Slider form owner">{JSON.stringify(form.values)}</output>
  <output aria-label="Slider form saved">{formSaved}</output>
  <output aria-label="Slider form completed">{JSON.stringify(formCompleted)}</output>
</section>
