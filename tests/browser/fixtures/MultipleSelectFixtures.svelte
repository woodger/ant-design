<script lang="ts">
  import { Button, ConfigProvider, Form, FormItem, Modal, Select } from 'antd-svelte';
  import { createMultipleControls } from './multiple-select.model.svelte';

  const controls = createMultipleControls();
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="multiple-select-fixture" aria-label="Multiple select fixture">
  <label><input type="checkbox" bind:checked={controls.search} /> Search multiple options</label>
  <label><input type="checkbox" bind:checked={controls.allowClear} /> Clear multiple selection</label>
  <label><input type="checkbox" bind:checked={controls.required} /> Native multiple required</label>
  <label><input type="checkbox" bind:checked={controls.lockTwo} /> Lock option two</label>
  <label><input type="checkbox" bind:checked={controls.hideZero} /> Remove option zero</label>
  <label><input type="checkbox" bind:checked={controls.updatedLabel} /> Rename option zero</label>
  <label><input type="checkbox" bind:checked={controls.noOptions} /> Empty multiple options</label>
  <label><input type="checkbox" bind:checked={controls.allLocked} /> Lock every multiple option</label>
  <label><input type="checkbox" bind:checked={controls.mutateCallback} /> Mutate multiple callback array</label>
  <label><input type="checkbox" bind:checked={controls.mounted} /> Mount multiple select</label>
  <label><input type="checkbox" bind:checked={controls.dark} /> Dark multiple theme</label>
  <label><input type="checkbox" bind:checked={controls.compact} /> Compact multiple theme</label>
  <ConfigProvider theme={{ mode: controls.dark ? 'dark' : 'light', compact: controls.compact }}>
    <form id="multiple-native-form" onsubmit={controls.readNative}>
      <label for="multiple-numbers">Multiple numbers</label>
      {#if controls.mounted}
        <Select
          id="multiple-numbers"
          aria-label="Multiple numbers"
          mode="multiple"
          options={controls.options}
          bind:value={controls.values}
          name="choices"
          showSearch={controls.search}
          allowClear={controls.allowClear}
          required={controls.required}
          placeholder="Choose numbers"
          onValueChange={controls.change}
          onOpenChange={controls.open}
        />
      {/if}
      <label for="multiple-default">Default multiple</label>
      <Select
        id="multiple-default"
        aria-label="Default multiple"
        mode="multiple"
        options={controls.base}
        defaultValue={[0, 2]}
        name="nativeDefaults"
        allowClear
        onValueChange={controls.changeDefault}
      />
      <div class="actions"><Button htmlType="submit">Read multiple FormData</Button><Button
        htmlType="reset"
      >Reset multiple native form</Button></div>
    </form>
    <label for="multiple-strings">Multiple strings</label>
    <Select
      id="multiple-strings"
      mode="multiple"
      options={[
        { value: 'alpha', label: 'String alpha' },
        { value: 'beta', label: 'String beta' },
        { value: 'long', label: `Long choice ${'with a long label '.repeat(12)}` }
      ]}
      bind:value={controls.strings}
      allowClear
    />
  </ConfigProvider>
  <label for="multiple-override">Enabled multiple override</label>
  <Select id="multiple-override" mode="multiple" options={controls.base} disabled={false} />
  <output aria-label="Multiple owner">{JSON.stringify(controls.values)}</output>
  <output aria-label="Multiple string owner">{JSON.stringify(controls.strings)}</output>
  <output aria-label="Multiple changes">{controls.events}</output>
  <output aria-label="Multiple open changes">{controls.opens}</output>
  <output aria-label="Multiple default changes">{controls.defaultChanges}</output>
  <output aria-label="Multiple FormData">{controls.native}</output>
  <output aria-label="Multiple native reads">{controls.nativeReads}</output>
  <div class="actions"><button onclick={controls.setExternal}>Set multiple values externally</button><button
    onclick={controls.clearExternal}
  >Clear multiple values externally</button></div>
</section>

<section id="multiple-external-fixture" aria-label="External multiple form fixture">
  <form id="multiple-outside-form" onsubmit={controls.readExternal}><Button htmlType="submit">Read external multiple FormData</Button><Button
    htmlType="reset"
  >Reset external multiple form</Button></form>
  <label for="multiple-outside">Outside multiple</label>
  <Select
    id="multiple-outside"
    mode="multiple"
    options={controls.base}
    defaultValue={[0]}
    name="external"
    form="multiple-outside-form"
  />
  <output aria-label="External multiple FormData">{controls.external}</output>
</section>

<section id="multiple-form-fixture" aria-label="Multiple model form fixture">
  <label><input type="checkbox" bind:checked={controls.holdValidation} /> Hold array validation</label>
  <Form form={controls.form} onFinish={controls.finish}>
    <FormItem name="roles" label="Multiple roles">
      <Select
        mode="multiple"
        options={controls.base}
        value={controls.form.values.roles}
        onValueChange={(value) => controls.form.setFieldValue('roles', value)}
        allowClear
      />
    </FormItem>
    <div class="actions"><Button htmlType="submit">Submit array form</Button><Button
      htmlType="reset"
    >Reset array form</Button></div>
  </Form>
  <output aria-label="Array form values">{JSON.stringify(controls.form.values.roles)}</output>
  <output aria-label="Array form saved">{controls.saved}</output>
  <output aria-label="Array form finishes">{controls.finishes}</output>
  <div class="actions"><button onclick={controls.replaceForm}>Replace array form values</button></div>
  {#each controls.validations as request (request.id)}<button
    onclick={() => controls.completeValidation(request.id)}
  >Complete array validation {request.id}</button>{/each}
</section>

<section id="multiple-modal-fixture" aria-label="Multiple select modal fixture">
  <Button onclick={() => { controls.modalOpen = true; }}>Open multiple modal</Button>
  <Modal bind:open={controls.modalOpen} title="Multiple select dialog">
    <label for="multiple-dialog">Dialog choices</label>
    <Select
      id="multiple-dialog"
      mode="multiple"
      options={controls.base}
      bind:value={controls.dialogValues}
    />
  </Modal>
</section>
