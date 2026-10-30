<script lang="ts">
  import {
    Button,
    ConfigProvider,
    Modal,
    Popconfirm,
    Tooltip,
    type PopoverPlacement
  } from 'antd-svelte';

  let open = $state(false);
  let disabled = $state(false);
  let showCancel = $state(true);
  let arrow = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let customLabels = $state(false);
  let longLabels = $state(false);
  let customIcon = $state(false);
  let hideIcon = $state(false);
  let cancelClicks = $state(false);
  let cancelTrigger = $state(false);
  let danger = $state(false);
  let mounted = $state(true);
  let replaced = $state(false);
  let placement = $state<PopoverPlacement>('top');
  let mode = $state('sync');
  let confirms = $state(0);
  let cancelled = $state(0);
  let clicks = $state(0);
  let errors = $state(0);
  let submissions = $state(0);
  let changes = $state<boolean[]>([]);
  let defaultMounted = $state(false);
  let defaultChanges = $state<boolean[]>([]);
  let modalOpen = $state(false);
  let modalConfirmOpen = $state(false);
  let modalRequests = $state(0);
  let requests = $state<{
    id: number;
    resolve: () => void;
    reject: (error: Error) => void;
    settled: boolean
  }[]>([]);

  function confirm() {
    confirms++;
    if (mode === 'throw') throw new Error('Private backend details');
    if (mode === 'async')
      return new Promise<void>(
        (resolve, reject) => {
          requests.push({ id: requests.length + 1, resolve, reject, settled: false });
        }
      );
  }

  function finish(id: number, success: boolean) {
    const request = requests.find((item) => item.id === id);
    if (!request || request.settled) return;

    request.settled = true;
    if (success) request.resolve();
    else
      request.reject(new Error('Private backend details'));
  }

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') disabled = !disabled;
    if (event.key === 'F4') open = !open;
    if (event.key === 'F5') mounted = !mounted;
    if (event.key === 'F6') replaced = !replaced;
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .stage { position: relative; display: flex; justify-content: center; padding: 140px 16px; }
  .requests { position: absolute; bottom: 24px; inset-inline: 0; justify-content: center; }
  .modal-content { min-height: 180px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet warning()}<span data-testid="custom-confirm-icon">!</span>{/snippet}
{#snippet richTitle()}<strong>Rich confirmation</strong>{/snippet}
{#snippet richDescription()}<span>Rich confirmation details</span>{/snippet}
{#snippet nestedDescription()}<span>Nested details.</span><Tooltip title="Confirmation hint"><Button>Explain confirmation</Button></Tooltip>{/snippet}

<section id="popconfirm-fixture" aria-label="Popconfirm fixture">
  <label><input type="checkbox" bind:checked={disabled} /> Disable Popconfirm</label>
  <label><input type="checkbox" bind:checked={showCancel} /> Show Popconfirm cancel</label>
  <label><input type="checkbox" bind:checked={arrow} /> Popconfirm arrow</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Popconfirm theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Popconfirm theme</label>
  <label><input type="checkbox" bind:checked={customLabels} /> Custom Popconfirm labels</label>
  <label><input type="checkbox" bind:checked={longLabels} /> Long Popconfirm labels</label>
  <label><input type="checkbox" bind:checked={customIcon} /> Custom Popconfirm icon</label>
  <label><input type="checkbox" bind:checked={hideIcon} /> Hide Popconfirm icon</label>
  <label><input type="checkbox" bind:checked={cancelClicks} /> Cancel Popconfirm action clicks</label>
  <label><input type="checkbox" bind:checked={cancelTrigger} /> Cancel Popconfirm trigger click</label>
  <label><input type="checkbox" bind:checked={danger} /> Dangerous Popconfirm button</label>
  <label>Popconfirm mode <select bind:value={mode}><option value="sync">Sync</option><option
    value="async"
  >Async</option><option
    value="throw"
  >Throw</option></select></label>
  <label>Popconfirm placement <select bind:value={placement}><option>top</option><option>bottom</option><option>left</option><option>right</option></select></label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <form
      onsubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Button>Before Popconfirm</Button>
      <div class="stage">
        {#if mounted}
          <Popconfirm
            title="Delete fixture record?"
            description="This action removes the fixture record."
            bind:open
            {disabled}
            {showCancel}
            {arrow}
            {placement}
            icon={hideIcon ? null : customIcon ? warning : undefined}
            okText={longLabels
              ? 'Confirm removal of the selected fixture record permanently'
              : customLabels ? 'Remove fixture' : undefined}
            cancelText={longLabels
              ? 'Keep the selected fixture record without changes'
              : customLabels ? 'Keep fixture' : undefined}
            onConfirm={confirm}
            onCancel={() => { cancelled++; }}
            onError={() => { errors++; }}
            onOpenChange={(next) => changes.push(next)}
            okButtonProps={{ danger, onclick: (event) => { if (cancelClicks) event.preventDefault(); } }}
            cancelButtonProps={{ onclick: (event) => { if (cancelClicks) event.preventDefault(); } }}
          >
            {#if replaced}<Button>Replacement Popconfirm trigger</Button>{:else}<Button
              aria-describedby="popconfirm-owner-help"
              onclick={(event) => {
                clicks++;
                if (cancelTrigger) event.preventDefault();
              }}
            >Popconfirm trigger</Button>{/if}
          </Popconfirm>
        {/if}
        <div class="actions requests">
          {#each requests as request (request.id)}
            <button
              type="button"
              disabled={request.settled}
              onpointerdown={(event) => event.preventDefault()}
              onclick={() => finish(request.id, true)}
            >Resolve Popconfirm {request.id}</button>
            <button
              type="button"
              disabled={request.settled}
              onpointerdown={(event) => event.preventDefault()}
              onclick={() => finish(request.id, false)}
            >Reject Popconfirm {request.id}</button>
          {/each}
        </div>
      </div>
      <Button>After Popconfirm</Button>
    </form>
    <div class="actions">
      <Popconfirm title={richTitle} description={richDescription} okText="Accept rich"><Button>Rich Popconfirm trigger</Button></Popconfirm>
      <Popconfirm title={0} description={0}><Button>Zero Popconfirm trigger</Button></Popconfirm>
      <Popconfirm title="Nested confirmation" description={nestedDescription}><Button>Nested Popconfirm trigger</Button></Popconfirm>
      <Popconfirm title="Enabled confirmation" disabled={false}><Button disabled={false}>Enabled Popconfirm override</Button></Popconfirm>
      <Popconfirm title="Inherited confirmation"><Button>Inherited Popconfirm trigger</Button></Popconfirm>
    </div>
    <label><input type="checkbox" bind:checked={defaultMounted} /> Mount default Popconfirm</label>
    {#if defaultMounted}<Popconfirm
      title="Default confirmation"
      defaultOpen
      onOpenChange={(next) => defaultChanges.push(next)}
    ><Button>Default Popconfirm trigger</Button></Popconfirm>{/if}
  </ConfigProvider>
  <span id="popconfirm-owner-help">Owner confirmation help.</span>
  <output aria-label="Popconfirm open">{String(open)}</output>
  <output aria-label="Popconfirm changes">{JSON.stringify(changes)}</output>
  <output aria-label="Popconfirm confirms">{confirms}</output>
  <output aria-label="Popconfirm cancellations">{cancelled}</output>
  <output aria-label="Popconfirm clicks">{clicks}</output>
  <output aria-label="Popconfirm errors">{errors}</output>
  <output aria-label="Popconfirm submissions">{submissions}</output>
  <output aria-label="Default Popconfirm changes">{JSON.stringify(defaultChanges)}</output>
  <Button onclick={() => { modalOpen = true; }}>Open Popconfirm modal</Button>
  <Modal bind:open={modalOpen} title="Popconfirm modal"><div class="modal-content"><Popconfirm
    title="Modal confirmation"
    bind:open={modalConfirmOpen}
    onConfirm={() => {
      modalRequests++;

      return new Promise<void>(
        (resolve, reject) => {
          requests
            .push({
              id: requests.length + 1,
              resolve,
              reject,
              settled: false
            });
        }
      );
    }}
  ><Button>Modal Popconfirm trigger</Button></Popconfirm><Button
    onpointerdown={(event) => event.preventDefault()}
    onclick={() => {
      const latest = requests.at(-1);
      if (latest) finish(latest.id, true);
    }}
  >Resolve modal confirmation</Button></div></Modal>
  <output aria-label="Modal Popconfirm requests">{modalRequests}</output>
</section>
