<script lang="ts">
  import { Button, Checkbox, ConfigProvider, Form, FormItem, Pagination } from '../../src/lib/components/ant-design';
  import { createCheckboxPaginationControls } from './checkbox-pagination.model.svelte';

  const controls = createCheckboxPaginationControls();
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="checkbox-fixture" aria-label="Checkbox fixture">
  <Checkbox form="checkbox-native-form" bind:checked={controls.checked} bind:indeterminate={controls.indeterminate} onCheckedChange={controls.changeCheckbox}>Bound checkbox</Checkbox>
  <output aria-label="Checkbox value">{String(controls.checked)}</output>
  <output aria-label="Checkbox mixed">{String(controls.indeterminate)}</output>
  <output aria-label="Checkbox changes">{controls.checkboxChanges}</output>
  <div class="actions"><button onclick={controls.setCheckbox}>Set checkbox from parent</button><button onclick={controls.clearCheckbox}>Clear checkbox from parent</button></div>
  <Checkbox disabled={false}>Explicitly enabled checkbox</Checkbox>
  <form id="checkbox-native-form" onsubmit={controls.readCheckbox}>
    <Checkbox defaultChecked name="choice" value="enabled" onCheckedChange={controls.changeDefault}>Default checkbox</Checkbox>
    <Button htmlType="submit">Read checkbox FormData</Button>
    <Button htmlType="reset">Reset native checkbox</Button>
  </form>
  <output aria-label="Checkbox FormData">{controls.nativeValue}</output>
  <output aria-label="Default checkbox changes">{controls.defaultChanges}</output>
</section>

<section id="checkbox-form-fixture" aria-label="Checkbox form fixture">
  <Form form={controls.form} onFinish={controls.finishForm}>
    <FormItem name="accepted" label="Consent" help="Required for submission" required>
      <Checkbox checked={controls.form.values.accepted} onCheckedChange={(value) => controls.form.setFieldValue('accepted', value)}>I accept the terms</Checkbox>
    </FormItem>
    <Button htmlType="submit">Submit consent</Button>
    <Button htmlType="reset">Reset consent</Button>
  </Form>
  <output aria-label="Consent submissions">{controls.finished}</output>
</section>

<section id="pagination-fixture" aria-label="Pagination fixture">
  <label><input type="checkbox" bind:checked={controls.hideOnSinglePage} /> Hide single page</label>
  <form onsubmit={controls.submitNative}>
    <Pagination total={controls.total} bind:current={controls.current} bind:pageSize={controls.pageSize} hideOnSinglePage={controls.hideOnSinglePage} onChange={controls.changePage} onShowSizeChange={controls.changeSize}>
      {#snippet showTotal(total, range)}<span aria-label="Pagination range">{range[0]}–{range[1]} / {total}</span>{/snippet}
    </Pagination>
  </form>
  <output aria-label="Pagination owner">{controls.current}:{controls.pageSize}</output>
  <output aria-label="Pagination events">{controls.events}</output>
  <output aria-label="Pagination submissions">{controls.nativeSubmissions}</output>
  <div class="actions">
    <button onclick={controls.setPage}>Set page from parent</button>
    <button onclick={controls.setSize}>Set size from parent</button>
    <button onclick={controls.shrinkTotal}>Set total to 15</button>
    <button onclick={controls.emptyTotal}>Empty data</button>
    <button onclick={controls.largeTotal}>Large data</button>
    <button onclick={controls.invalidInputs}>Invalid pagination inputs</button>
  </div>
  <Pagination total={70} defaultCurrent={7} showSizeChanger={false} aria-label="Default pagination" />
  <Pagination total={10} disabled={false} defaultPageSize={15} pageSizeOptions={[20, 10, 20, 0, -5, 2.5, Number.NaN]} showSizeChanger aria-label="Explicitly enabled pagination" />
  <ConfigProvider locale={{ pagination: { label: 'Custom pagination' } }}>
    <Pagination total={20} />
  </ConfigProvider>
</section>
