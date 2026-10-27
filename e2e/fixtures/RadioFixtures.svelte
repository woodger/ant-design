<script lang="ts">
  import { Button, ConfigProvider, Form, FormItem, Radio, RadioGroup } from '../../src/lib/components/ant-design';
  import { createRadios } from './radio.model.svelte';

  const radios = createRadios();
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="radio-fixture" aria-label="Radio fixture">
  <label><input type="checkbox" bind:checked={radios.disabled} /> Disable radio group</label>
  <label><input type="checkbox" bind:checked={radios.locked} /> Lock radio two</label>
  <label><input type="checkbox" bind:checked={radios.hidden} /> Hide radio zero</label>
  <label><input type="checkbox" bind:checked={radios.renamed} /> Rename radio zero</label>
  <label><input type="checkbox" bind:checked={radios.reversed} /> Reverse radio options</label>
  <label><input type="checkbox" bind:checked={radios.empty} /> Empty radio options</label>
  <label><input type="checkbox" bind:checked={radios.allLocked} /> Lock every radio option</label>
  <label><input type="checkbox" bind:checked={radios.mounted} /> Mount numeric radios</label>
  <label><input type="checkbox" bind:checked={radios.singlesMounted} /> Mount standalone radios</label>
  <label><input type="checkbox" bind:checked={radios.cancelReset} /> Cancel radio reset</label>
  <label><input type="checkbox" bind:checked={radios.required} /> Native radio required</label>
  <label><input type="checkbox" bind:checked={radios.vertical} /> Vertical radio options</label>
  <label><input type="checkbox" bind:checked={radios.dark} /> Dark radio theme</label>
  <label><input type="checkbox" bind:checked={radios.compact} /> Compact radio theme</label>
  <ConfigProvider theme={{ mode: radios.dark ? 'dark' : 'light', compact: radios.compact }} style="background: var(--ant-color-bg-container)">
    <form id="radio-native-form" onsubmit={radios.read} onreset={radios.reset}>
      {#if radios.singlesMounted}
        <Radio name="standalone" value={0} bind:checked={radios.bound} onCheckedChange={radios.changeBound}>Bound standalone radio</Radio>
        <Radio name="standalone" value="peer" bind:checked={radios.peer} onCheckedChange={radios.changePeer}>Peer standalone radio</Radio>
      {/if}
      <label><input type="radio" name="standalone" value="native" /> Native standalone peer</label>
      <Radio name="defaultRadio" value="yes" defaultChecked>Default standalone radio</Radio>
      <Radio name="defaultRadio" value="other">Default standalone peer</Radio>
      {#if radios.mounted}<RadioGroup aria-label="Bound numeric radios" options={radios.options} bind:value={radios.choice} name="numberChoice" disabled={radios.disabled || undefined} required={radios.required} orientation={radios.vertical ? 'vertical' : 'horizontal'} onValueChange={radios.changeChoice} />{/if}
      <RadioGroup aria-label="Default numeric radios" options={radios.base} defaultValue={radios.defaults} name="defaultGroup" onValueChange={radios.changeDefault} />
      <RadioGroup aria-label="First automatic radios" options={[0, 2]} defaultValue={0} />
      <RadioGroup aria-label="Second automatic radios" options={[0, 2]} defaultValue={2} />
      <div class="actions"><Button htmlType="submit">Read radio FormData</Button><Button htmlType="reset">Reset native radios</Button></div>
    </form>
    <RadioGroup aria-label="Mixed radios" options={[{ value: 0, label: 'Radio numeric zero' }, { value: '0', label: 'Radio text zero' }, { value: false, label: 'Radio boolean false' }, { value: 'false', label: 'Radio text false' }]} bind:value={radios.mixed} name="mixed" form="radio-native-form" />
  </ConfigProvider>
  <Radio disabled={false}>Enabled standalone radio</Radio>
  <RadioGroup aria-label="Enabled radio override" options={['Radio override choice']} disabled={false} />
  <RadioGroup aria-label="Long radio labels" options={[{ value: 'long', label: `Long radio choice ${'withoutbreaking'.repeat(20)}` }, 'Second long radio choice']} />
  <div class="actions"><button onclick={radios.selectBound}>Set bound radio externally</button><button onclick={radios.selectPeer}>Set peer radio externally</button><button onclick={radios.setChoice}>Set radio value externally</button><button onclick={radios.clearChoice}>Clear radio value externally</button><button onclick={radios.setMissing}>Set missing radio value</button><button onclick={radios.replaceDefaults}>Replace radio default</button></div>
  <output aria-label="Standalone radio owner">{JSON.stringify([radios.bound ?? null, radios.peer ?? null])}</output>
  <output aria-label="Standalone radio events">{radios.singleEvents}</output>
  <output aria-label="Radio owner">{JSON.stringify(radios.choice) ?? 'undefined'}</output>
  <output aria-label="Mixed radio owner">{JSON.stringify(radios.mixed) ?? 'undefined'}</output>
  <output aria-label="Radio events">{radios.groupEvents}</output>
  <output aria-label="Radio default events">{radios.defaultChanges}</output>
  <output aria-label="Radio FormData">{radios.data}</output>
</section>

<section id="radio-external-fixture" aria-label="Outside radio fixture">
  <form id="radio-external-form" onsubmit={radios.readExternal}><Button htmlType="submit">Read outside radios</Button><Button htmlType="reset">Reset outside radios</Button></form>
  <RadioGroup aria-label="Outside numeric radios" options={radios.base} defaultValue={0} name="numberChoice" form="radio-external-form" />
  <Radio name="standalone" form="radio-external-form" defaultChecked>Outside standalone radio</Radio>
  <output aria-label="Outside radio FormData">{radios.externalData}</output>
</section>

<section id="radio-form-fixture" aria-label="Radio model fixture">
  <label><input type="checkbox" bind:checked={radios.formDisabled} /> Disable radio form</label>
  <label><input type="checkbox" bind:checked={radios.emptyForm} /> Empty radio form options</label>
  <Form form={radios.form} disabled={radios.formDisabled} onFinish={radios.finish}>
    <FormItem name="choice" label="Radio roles" help="Choose zero or two">
      <RadioGroup options={radios.emptyForm ? [] : [radios.base[1], radios.base[0], radios.base[2], radios.base[3]]} value={radios.form.values.choice} onValueChange={(value) => radios.form.setFieldValue('choice', value)} />
    </FormItem>
    <FormItem name="decision" label="Radio decision">
      <RadioGroup options={[{ value: false, label: 'Radio decision false' }, { value: true, label: 'Radio decision true' }]} value={radios.form.values.decision} onValueChange={(value) => radios.form.setFieldValue('decision', value)} />
    </FormItem>
    <FormItem name="accepted" label="Radio consent" required>
      <Radio checked={radios.form.values.accepted} onCheckedChange={(value) => radios.form.setFieldValue('accepted', value)}>Accept radio terms</Radio>
    </FormItem>
    <RadioGroup aria-label="Form radio inherited" options={['Form inherited radio']} />
    <RadioGroup aria-label="Form radio enabled override" options={['Form override radio']} disabled={false} />
    <div class="actions"><Button htmlType="submit">Submit radio form</Button><Button htmlType="reset">Reset radio form</Button></div>
  </Form>
  <button onclick={radios.clearDecision}>Clear radio decision</button>
  <output aria-label="Radio form owner">{JSON.stringify(radios.form.values)}</output>
  <output aria-label="Radio form saved">{radios.saved}</output>
  <output aria-label="Radio form finishes">{radios.finishes}</output>
</section>
