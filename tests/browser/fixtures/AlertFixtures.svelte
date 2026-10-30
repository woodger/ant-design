<script lang="ts">
  import {
    Alert,
    Button,
    ConfigProvider,
    Drawer,
    Modal,
    type AlertType,
    type AlertVariant
  } from 'antd-svelte';

  let type = $state<AlertType>('info');
  let variant = $state<AlertVariant>('outlined');
  let role = $state<'alert' | 'status'>('status');
  let banner = $state(false);
  let explicitType = $state(true);
  let showIcon = $state(true);
  let explicitIcon = $state(true);
  let description = $state(true);
  let rich = $state(false);
  let customIcon = $state(false);
  let customClose = $state(false);
  let customLabel = $state(false);
  let closable = $state(true);
  let simpleClose = $state(false);
  let disabled = $state(false);
  let action = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let long = $state(false);
  let removeOnClose = $state(false);
  let replaceOnClose = $state(false);
  let ownerFocus = $state(false);
  let mounted = $state(true);
  let revision = $state(0);
  let events = $state<string[]>([]);
  let actions = $state(0);
  let submissions = $state(0);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);

  function close(event: MouseEvent) {
    events.push(`close:${event.type}`);
    if (ownerFocus) document.getElementById('before-alert')?.focus();
    if (removeOnClose) mounted = false;
    if (replaceOnClose) revision++;
  }

  function afterClose() {
    events.push(
      `after:${document.getElementById('fixture-alert') ? 'present' : 'removed'}`
    );
  }

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    if (event.key === 'a') {
      event.preventDefault();
      revision++;
    }
    if (event.key === 'q') {
      event.preventDefault();
      mounted = !mounted;
    }
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .stage { margin-block: 16px; padding: 12px; background: var(--ant-color-bg-container); }
  .spacer { min-height: 120px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet title()}<strong>Rich alert title</strong>{/snippet}
{#snippet details()}<p>Additional alert detail</p><label>Alert note<input
  value="Initial alert note"
/></label>{/snippet}
{#snippet icon()}<span>Custom alert icon</span>{/snippet}
{#snippet retry()}<Button onclick={() => { actions++; }}>Alert retry</Button>{/snippet}

<section id="alert-fixture" aria-label="Alert fixture">
  <label>Alert type <select bind:value={type}><option>info</option><option>success</option><option>warning</option><option>error</option></select></label>
  <label>Alert variant <select bind:value={variant}><option>outlined</option><option>filled</option></select></label>
  <label>Alert role <select bind:value={role}><option>status</option><option>alert</option></select></label>
  <label><input type="checkbox" bind:checked={banner} /> Banner Alert</label>
  <label><input type="checkbox" bind:checked={explicitType} /> Explicit Alert type</label>
  <label><input type="checkbox" bind:checked={explicitIcon} /> Explicit Alert icon visibility</label>
  <label><input type="checkbox" bind:checked={showIcon} /> Show Alert icon</label>
  <label><input type="checkbox" bind:checked={description} /> Show Alert description</label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Alert content</label>
  <label><input type="checkbox" bind:checked={customIcon} /> Custom Alert icon</label>
  <label><input type="checkbox" bind:checked={customClose} /> Custom Alert close text</label>
  <label><input type="checkbox" bind:checked={customLabel} /> Custom Alert close label</label>
  <label><input type="checkbox" bind:checked={closable} /> Closable Alert</label>
  <label><input type="checkbox" bind:checked={simpleClose} /> Boolean Alert closing</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable Alert closing</label>
  <label><input type="checkbox" bind:checked={action} /> Show Alert action</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Alert theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Alert theme</label>
  <label><input type="checkbox" bind:checked={long} /> Long Alert content</label>
  <label><input type="checkbox" bind:checked={removeOnClose} /> Unmount Alert on close request</label>
  <label><input type="checkbox" bind:checked={replaceOnClose} /> Replace Alert on close request</label>
  <label><input type="checkbox" bind:checked={ownerFocus} /> Focus Alert owner on close</label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <form
      onsubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <button type="button" id="before-alert">Before Alert</button>
      <div class="stage">{#if mounted}{#key revision}<Alert
        id="fixture-alert"
        aria-label="Fixture message"
        {role}
        type={explicitType ? type : undefined}
        {variant}
        title={long
          ? 'A very long alert title without losing access to actions or dismissal on a small screen'
          : rich ? title : 'Alert title'}
        description={description ? rich ? details : 'Additional alert detail' : undefined}
        showIcon={explicitIcon ? showIcon : undefined}
        icon={customIcon ? icon : undefined}
        action={action ? retry : undefined}
        {banner}
        closable={closable
          ? simpleClose
          || {
            disabled,
            closeIcon: customClose ? 'Dismiss' : undefined,
            'aria-label': customLabel ? 'Hide notification' : undefined,
            onClose: close,
            afterClose
          }
          : false}
      />{/key}{/if}</div>
      <button type="button" id="after-alert">After Alert</button>
    </form>
  </ConfigProvider>
  <button
    type="button"
    onclick={() => {
      mounted = true;
      revision++;
    }}
  >Restore Alert</button>
  <button type="button" onclick={() => { modalOpen = true; }}>Open Alert Modal</button>
  <button type="button" onclick={() => { drawerOpen = true; }}>Open Alert Drawer</button>
  <output aria-label="Alert events">{JSON.stringify(events)}</output>
  <output aria-label="Alert actions">{actions}</output>
  <output aria-label="Alert submissions">{submissions}</output>
  <Modal bind:open={modalOpen} title="Alert host modal"><div class="spacer"><Alert
    id="modal-alert"
    title="Modal message"
    closable
  /><button
    type="button"
  >After modal alert</button></div></Modal>
  <Drawer bind:open={drawerOpen} title="Alert host drawer"><Alert
    id="drawer-alert"
    title="Drawer message"
    closable
  /><button
    type="button"
  >After drawer alert</button></Drawer>
</section>
