<script lang="ts">
  import { Button, ConfigProvider, Form, FormItem, Input, Modal, Select, enUS } from '../../src/lib/components/ant-design';
  import { createControls } from './controls.model.svelte';
  import CheckboxPagination from './CheckboxPagination.svelte';
  import TableFixtures from './TableFixtures.svelte';
  import TableFilterFixtures from './TableFilterFixtures.svelte';
  import ServerTableFixtures from './ServerTableFixtures.svelte';
  import FixedTableFixtures from './FixedTableFixtures.svelte';
  import ExpandableTableFixtures from './ExpandableTableFixtures.svelte';
  import MultipleSelectFixtures from './MultipleSelectFixtures.svelte';
  import CheckboxGroupFixtures from './CheckboxGroupFixtures.svelte';
  import RadioFixtures from './RadioFixtures.svelte';
  import SwitchFixtures from './SwitchFixtures.svelte';
  import InputNumberFixtures from './InputNumberFixtures.svelte';
  import SliderFixtures from './SliderFixtures.svelte';

  const controls = createControls();
  const options = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta', disabled: true },
    { value: 'gamma', label: 'Gamma' }
  ];
  const numbers = [{ value: 0, label: 'Zero' }, { value: 1, label: 'One' }];
</script>

<style>
  :global(body) { margin: 0; }
  .fixtures { max-width: 800px; padding: 24px; }
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label { display: block; margin-block: 8px; }
  output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .modal-space { min-height: 120px; }
</style>

<svelte:window onkeydown={(event) => { if (event.key === 'F2') controls.toggleSelectDisabled(); }} />

<ConfigProvider componentDisabled={controls.allDisabled} direction={controls.rtl ? 'rtl' : 'ltr'} locale={controls.english ? enUS : undefined}>
  <main class="fixtures">
    <h1>Component browser fixtures</h1>
    <label><input type="checkbox" bind:checked={controls.allDisabled} /> Disable all components</label>
    <label><input type="checkbox" bind:checked={controls.rtl} /> Right to left</label>
    <label><input type="checkbox" bind:checked={controls.english} /> English locale</label>

    <section id="input-fixture" aria-label="Input fixture">
      <label for="bound-input">Bound input</label>
      <Input id="bound-input" bind:value={controls.input} onValueChange={controls.changeInput} />
      <output aria-label="Input value">{controls.input ?? 'undefined'}</output>
      <output aria-label="Input changes">{controls.changes}</output>
      <div class="actions"><button onclick={controls.replaceInput}>Set input from parent</button><button onclick={controls.clearInput}>Clear input from parent</button></div>
      <label for="default-input">Default input</label>
      <Input id="default-input" defaultValue="Initial default" />
      <label for="enabled-input">Explicitly enabled input</label>
      <Input id="enabled-input" disabled={false} />
    </section>

    <section id="select-fixture" aria-label="Select fixture">
      <label for="plain-select">Plain select</label>
      <Select id="plain-select" options={options} bind:value={controls.selection} allowClear disabled={controls.selectDisabled || undefined} />
      <output aria-label="Selected value">{controls.selection ?? 'undefined'}</output>
      <div class="actions"><button onclick={controls.clearSelection}>Clear selection from parent</button><button onclick={controls.toggleSelectDisabled}>Toggle select disabled (F2)</button></div>
      <label for="search-select">Searchable select</label>
      <Select id="search-select" options={options} showSearch placeholder="Search options" />
      <label for="empty-select">Empty select</label>
      <Select id="empty-select" options={[]} />
      <label for="disabled-options">Disabled options</label>
      <Select id="disabled-options" options={options.map((option) => ({ ...option, disabled: true }))} />
    </section>

    <section id="numeric-fixture" aria-label="Numeric select fixture">
      <form id="numeric-form" onsubmit={controls.recordNativeValue}>
        <label for="numeric-select">Numeric select</label>
        <Select id="numeric-select" name="number" options={numbers} bind:value={controls.numeric} allowClear />
        <Button htmlType="submit">Read FormData</Button>
      </form>
      <output aria-label="Numeric value">{controls.numeric === undefined ? 'undefined' : `${typeof controls.numeric}:${controls.numeric}`}</output>
      <output aria-label="FormData value">{controls.nativeValue}</output>
    </section>

    <CheckboxPagination />
    <TableFixtures />
    <TableFilterFixtures />
    <ServerTableFixtures />
    <FixedTableFixtures />
    <ExpandableTableFixtures />
    <MultipleSelectFixtures />
    <CheckboxGroupFixtures />
    <RadioFixtures />
    <SwitchFixtures />
    <InputNumberFixtures />
    <SliderFixtures />

    <section id="form-fixture" aria-label="Form fixture">
      <label><input type="checkbox" bind:checked={controls.horizontalForm} /> Horizontal form</label>
      <label><input type="checkbox" bind:checked={controls.asyncValidation} /> Async validation</label>
      <label><input type="checkbox" bind:checked={controls.holdSubmission} /> Hold submission</label>
      <Form form={controls.form} layout={controls.horizontalForm ? 'horizontal' : 'vertical'} onFinish={controls.finishForm} onError={controls.onSubmitError}>
        <FormItem name="name" label="Name" help="Enter your name">
          <Input value={controls.form.values.name} onValueChange={(value) => controls.form.setFieldValue('name', value)} />
        </FormItem>
        <FormItem name="password" label="Password">
          <Input type="password" value={controls.form.values.password} onValueChange={(value) => controls.form.setFieldValue('password', value)} />
        </FormItem>
        <FormItem name="confirmation" label="Confirm password">
          <Input type="password" value={controls.form.values.confirmation} onValueChange={(value) => controls.form.setFieldValue('confirmation', value)} />
        </FormItem>
        <div class="actions"><Button htmlType="submit" loading={controls.form.isSubmitting}>Submit form</Button><Button htmlType="reset">Reset form</Button></div>
      </Form>
      <output aria-label="Finished submissions">{controls.finished}</output>
      <output aria-label="Saved name">{controls.saved}</output>
      <output aria-label="Submit errors">{controls.submitErrors}</output>
      <output aria-label="Pending validations">{controls.validations.length}</output>
      <div class="actions"><button disabled={!controls.hasSubmission} onclick={controls.completeSubmission}>Complete submission</button><button disabled={!controls.hasSubmission} onclick={controls.failSubmission}>Fail submission</button></div>
      <button disabled={!controls.validations.length} onpointerdown={(event) => event.preventDefault()} onclick={controls.rejectValidations}>Reject all validations</button>
      {#each controls.validations as request (request.id)}
        <div class="actions">
          <span>Validation {request.id}: {request.value}</span>
          <button onpointerdown={(event) => event.preventDefault()} onclick={() => controls.resolveValidation(request.id)}>Accept validation {request.id}</button>
          <button onpointerdown={(event) => event.preventDefault()} onclick={() => controls.resolveValidation(request.id, `Rejected ${request.value}`)}>Reject validation {request.id}</button>
        </div>
      {/each}
    </section>

    <section id="modal-fixture" aria-label="Modal fixture">
      <label><input type="checkbox" bind:checked={controls.holdConfirmation} /> Hold confirmation</label>
      <label><input type="checkbox" bind:checked={controls.keyboard} /> Escape closes modal</label>
      <label><input type="checkbox" bind:checked={controls.maskClosable} /> Backdrop closes modal</label>
      <Button onclick={controls.openModal}>Open modal</Button>
      <output aria-label="Cancelled count">{controls.cancelled}</output>
      <output aria-label="Confirmed count">{controls.confirmed}</output>
      {#if controls.modalMounted}
        <Modal bind:open={controls.modalOpen} title="Fixture modal" confirmLoading={controls.modalLoading} keyboard={controls.keyboard} maskClosable={controls.maskClosable} onCancel={controls.cancelModal} onOk={() => { void controls.confirmModal(); }}>
          <label for="modal-select">Modal choice</label>
          <Select id="modal-select" options={options} bind:value={controls.modalSelection} showSearch />
          <div class="modal-space"></div>
          <div class="actions"><button disabled={!controls.hasConfirmation} onclick={controls.completeConfirmation}>Complete confirmation</button><button onclick={controls.unmountModal}>Unmount modal</button></div>
        </Modal>
      {/if}
    </section>
  </main>
</ConfigProvider>
