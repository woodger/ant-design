<script lang="ts">
  import { Button, CheckboxGroup, ConfigProvider, Form, FormItem } from '../../src/lib/components/ant-design';
  import { createCheckboxGroups } from './checkbox-group.model.svelte';

  const groups = createCheckboxGroups();
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="checkbox-group-fixture" aria-label="Checkbox group fixture">
  <label><input type="checkbox" bind:checked={groups.groupDisabled} /> Disable checkbox group</label>
  <label><input type="checkbox" bind:checked={groups.lockTwo} /> Lock group two</label>
  <label><input type="checkbox" bind:checked={groups.hideZero} /> Hide group zero</label>
  <label><input type="checkbox" bind:checked={groups.reverse} /> Reverse group options</label>
  <label><input type="checkbox" bind:checked={groups.renamed} /> Rename group zero</label>
  <label><input type="checkbox" bind:checked={groups.empty} /> Empty checkbox group</label>
  <label><input type="checkbox" bind:checked={groups.allLocked} /> Lock all group options</label>
  <label><input type="checkbox" bind:checked={groups.mutateCallback} /> Mutate group callback</label>
  <label><input type="checkbox" bind:checked={groups.cancelReset} /> Cancel group reset</label>
  <label><input type="checkbox" bind:checked={groups.mounted} /> Mount checkbox group</label>
  <label><input type="checkbox" bind:checked={groups.dark} /> Dark group theme</label>
  <label><input type="checkbox" bind:checked={groups.compact} /> Compact group theme</label>
  <ConfigProvider theme={{ mode: groups.dark ? 'dark' : 'light', compact: groups.compact }} style="background: var(--ant-color-bg-container)">
    <form id="checkbox-group-native-form" onsubmit={groups.read} onreset={groups.reset}>
      {#if groups.mounted}<CheckboxGroup aria-label="Bound group" options={groups.options} bind:value={groups.value} name="groupChoices" disabled={groups.groupDisabled || undefined} onValueChange={groups.change} />{/if}
      <CheckboxGroup aria-label="Default group" options={groups.base} defaultValue={groups.defaults} name="groupDefaults" onValueChange={groups.changeDefault} />
      <div class="actions"><Button htmlType="submit">Read group FormData</Button><Button htmlType="reset">Reset native groups</Button></div>
    </form>
    <CheckboxGroup aria-label="Mixed group" options={[{ value: 0, label: 'Numeric zero' }, { value: '0', label: 'Text zero' }, { value: false, label: 'Boolean false' }, { value: 'false', label: 'Text false' }]} bind:value={groups.mixed} name="mixed" form="checkbox-group-native-form" />
  </ConfigProvider>
  <CheckboxGroup aria-label="Enabled group override" options={['Override choice']} disabled={false} />
  <CheckboxGroup aria-label="Long group" options={[{ value: 'long', label: `Long group choice ${'withoutbreaking'.repeat(20)}` }, 'Second long group choice']} />
  <div class="actions"><button onclick={groups.replaceValue}>Replace group owner</button><button onclick={groups.clearValue}>Clear group owner</button><button onclick={groups.replaceDefaults}>Replace group defaults</button></div>
  <output aria-label="Group owner">{JSON.stringify(groups.value)}</output>
  <output aria-label="Group mixed owner">{JSON.stringify(groups.mixed)}</output>
  <output aria-label="Group changes">{groups.changes}</output>
  <output aria-label="Group default changes">{groups.defaultChanges}</output>
  <output aria-label="Group FormData">{groups.data}</output>
</section>

<section id="checkbox-group-external-fixture" aria-label="External checkbox group fixture">
  <form id="checkbox-group-external-form" onsubmit={groups.readExternal}><Button htmlType="submit">Read outside group</Button><Button htmlType="reset">Reset outside group</Button></form>
  <CheckboxGroup aria-label="Outside group" options={groups.base} defaultValue={[0]} name="externalGroup" form="checkbox-group-external-form" />
  <output aria-label="Outside group FormData">{groups.externalData}</output>
</section>

<section id="checkbox-group-form-fixture" aria-label="Checkbox group model fixture">
  <label><input type="checkbox" bind:checked={groups.formDisabled} /> Disable group form</label>
  <label><input type="checkbox" bind:checked={groups.emptyForm} /> Empty group form options</label>
  <Form form={groups.form} disabled={groups.formDisabled} onFinish={groups.finish}>
    <FormItem name="roles" label="Group roles" help="Choose two or three group roles">
      <CheckboxGroup options={groups.emptyForm ? [] : [groups.base[1], groups.base[0], groups.base[2], groups.base[3]]} value={groups.form.values.roles} onValueChange={(value) => groups.form.setFieldValue('roles', value)} />
    </FormItem>
    <CheckboxGroup aria-label="Form inherited group" options={['Form inherited choice']} />
    <CheckboxGroup aria-label="Form enabled override" options={['Form override choice']} disabled={false} />
    <div class="actions"><Button htmlType="submit">Submit group form</Button><Button htmlType="reset">Reset group form</Button></div>
  </Form>
  <button onclick={groups.replaceForm}>Replace group form values</button>
  <output aria-label="Group form owner">{JSON.stringify(groups.form.values.roles)}</output>
  <output aria-label="Group form saved">{groups.saved}</output>
  <output aria-label="Group form finishes">{groups.finishes}</output>
</section>
