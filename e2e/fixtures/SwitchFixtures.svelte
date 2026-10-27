<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Button, ConfigProvider, Form, FormItem, Switch } from '../../src/lib/components/ant-design';
  import { createSwitchControls } from './switch.model.svelte';

  const controls = createSwitchControls();

  onDestroy(controls.dispose);
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="switch-fixture" aria-label="Switch fixture">
  <label><input type="checkbox" bind:checked={controls.disabled} /> Disable bound Switch</label>
  <label><input type="checkbox" bind:checked={controls.loading} /> Loading bound Switch</label>
  <label><input type="checkbox" bind:checked={controls.small} /> Small bound Switch</label>
  <label><input type="checkbox" bind:checked={controls.providerSmall} /> Small Switch provider</label>
  <label><input type="checkbox" bind:checked={controls.cancelClick} /> Cancel Switch click</label>
  <label><input type="checkbox" bind:checked={controls.cancelReset} /> Cancel Switch reset</label>
  <label><input type="checkbox" bind:checked={controls.mounted} /> Mount bound Switch</label>
  <label><input type="checkbox" bind:checked={controls.dark} /> Dark Switch theme</label>
  <label><input type="checkbox" bind:checked={controls.compact} /> Compact Switch theme</label>
  <ConfigProvider componentSize={controls.providerSmall ? 'small' : undefined} theme={{ mode: controls.dark ? 'dark' : 'light', compact: controls.compact }} style="background: var(--ant-color-bg-container)">
    <form id="switch-native-form" onsubmit={controls.read} onreset={controls.reset}>
      <label for="bound-switch">Bound Switch</label>
      {#if controls.mounted}
        <Switch id="bound-switch" bind:checked={controls.checked} name="enabled" loading={controls.loading} disabled={controls.disabled || undefined} size={controls.small ? 'small' : undefined} onCheckedChange={controls.change} onclick={controls.click}>
          {#snippet checkedChildren()}Enabled{/snippet}
          {#snippet unCheckedChildren()}Disabled{/snippet}
        </Switch>
      {/if}
      <Switch aria-label="Default Switch" defaultChecked={controls.defaultChecked} name="defaultSetting" onCheckedChange={controls.changeDefault} />
      <Switch aria-label="Middle Switch override" size="middle" />
      <Switch aria-label="Small Switch override" size="small" />
      <Switch aria-label="Icon Switch">
        {#snippet checkedChildren()}<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" /></svg>{/snippet}
        {#snippet unCheckedChildren()}<span>×</span>{/snippet}
      </Switch>
      <div class="actions"><Button htmlType="submit">Read Switch FormData</Button><Button htmlType="reset">Reset native Switches</Button></div>
    </form>
  </ConfigProvider>
  <Switch aria-label="Enabled Switch override" disabled={false} />
  <div class="actions"><button onclick={controls.setChecked}>Set Switch externally</button><button onclick={controls.clearChecked}>Clear Switch externally</button><button onclick={controls.replaceDefault}>Replace Switch default</button></div>
  <output aria-label="Switch owner">{String(controls.checked)}</output>
  <output aria-label="Switch changes">{controls.changes}</output>
  <output aria-label="Switch clicks">{controls.clicks}</output>
  <output aria-label="Switch default changes">{controls.defaultChanges}</output>
  <output aria-label="Switch FormData">{controls.data}</output>
  <output aria-label="Switch native submissions">{controls.submissions}</output>
</section>

<section id="switch-external-fixture" aria-label="Outside Switch fixture">
  <form id="switch-outside-form" onsubmit={controls.readExternal}><Button htmlType="submit">Read outside Switch</Button><Button htmlType="reset">Reset outside Switch</Button></form>
  <Switch aria-label="Outside Switch" form="switch-outside-form" name="outsideSwitch" defaultChecked />
  <output aria-label="Outside Switch FormData">{controls.externalData}</output>
</section>

<section id="switch-form-fixture" aria-label="Switch model fixture">
  <label><input type="checkbox" bind:checked={controls.formDisabled} /> Disable Switch form</label>
  <Form form={controls.form} disabled={controls.formDisabled} onFinish={controls.finish}>
    <FormItem name="enabled" label="Switch availability" help="False is a valid value">
      <Switch checked={controls.form.values.enabled} onCheckedChange={(value) => controls.form.setFieldValue('enabled', value)} />
    </FormItem>
    <FormItem name="accepted" label="Switch consent" required>
      <Switch checked={controls.form.values.accepted} onCheckedChange={(value) => controls.form.setFieldValue('accepted', value)} />
    </FormItem>
    <Switch aria-label="Form enabled Switch override" disabled={false} />
    <div class="actions"><Button htmlType="submit">Submit Switch form</Button><Button htmlType="reset">Reset Switch form</Button></div>
  </Form>
  <output aria-label="Switch form owner">{JSON.stringify(controls.form.values)}</output>
  <output aria-label="Switch form saved">{controls.saved}</output>
  <output aria-label="Switch form finishes">{controls.finishes}</output>
</section>

<section id="switch-async-fixture" aria-label="Deferred Switch fixture">
  {#if controls.asyncMounted}<Switch aria-label="Deferred Switch setting" checked={controls.setting.checked} loading={controls.setting.loading} onCheckedChange={(value) => { void controls.setting.change(value); }} />{/if}
  <output aria-label="Switch save checked">{String(controls.setting.checked)}</output>
  <output aria-label="Switch save confirmed">{String(controls.setting.saved)}</output>
  <output aria-label="Switch save loading">{String(controls.setting.loading)}</output>
  <output aria-label="Switch save error">{controls.setting.error ?? ''}</output>
  <output aria-label="Switch save pending">{controls.requests.length}</output>
  <output aria-label="Switch save aborted">{controls.aborted}</output>
  {#each controls.requests as request (request.id)}
    <div class="actions"><button onclick={() => controls.complete(request.id, true)}>Accept Switch save {request.id}</button><button onclick={() => controls.complete(request.id, false)}>Reject Switch save {request.id}</button></div>
  {/each}
  <button onclick={controls.unmountAsync}>Unmount async Switch</button>
</section>
