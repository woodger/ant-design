<script lang="ts">
  import {
    ConfigProvider,
    Drawer,
    MessageHolder,
    Modal,
    createMessage,
    type MessageConfig,
    type MessageHandle,
    type MessageType
  } from 'antd-svelte';

  let message = $state.raw(createMessage({ maxCount: 3 }));
  const secondary = createMessage({ duration: 0 });
  const modalMessage = createMessage();
  const drawerMessage = createMessage();
  const nestedMessage = createMessage();
  let duration = $state(0);
  let maxCount = $state(3);
  let pauseOnHover = $state(true);
  let role = $state<'status' | 'alert'>('status');
  let top = $state<number | string>(8);
  let mounted = $state(true);
  let hidden = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let nestedOpen = $state(false);
  let counter = 0;
  let events = $state<string[]>([]);
  let completions = $state<string[]>([]);
  let lastHandle: MessageHandle | undefined;
  let taskHandle: MessageHandle | undefined;
  let previousTask: MessageHandle | undefined;

  function track(config: MessageConfig) {
    const label = typeof config.content === 'string' ? config.content : 'Rich message';
    const handle = message.open(
      {
        duration,
        pauseOnHover,
        role,
        ...config,
        onClose: () => events.push(`close:${label}`)
      }
    );
    void handle.then((closed) => completions.push(`${label}:${closed}`));
    lastHandle = handle;

    return handle;
  }

  function show(type: MessageType) {
    track({ type, content: `${type[0].toUpperCase()}${type.slice(1)} message` });
  }

  function startTask() {
    previousTask = taskHandle;
    taskHandle = track({ key: 'task', type: 'loading', content: 'Saving task', duration: 0 });
  }

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    if (event.key === 'n') {
      event.preventDefault();
      track({ content: 'Keyboard notification', duration: 0 });
    }
    if (event.key === 'm') {
      event.preventDefault();
      mounted = !mounted;
    }
    if (event.key === 's') {
      event.preventDefault();
      modalMessage.success({ content: 'Modal notification', duration: 0 });
    }
    if (event.key === 'd') {
      event.preventDefault();
      drawerMessage.success({ content: 'Drawer notification', duration: 0 });
    }
  }
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .space { min-height: 160px; }
</style>

<svelte:window onkeydown={hotkey} />
{#snippet rich()}<strong>Rich message</strong> <em>with markup</em>{/snippet}
{#snippet icon()}<span>★</span>{/snippet}

<section id="message-fixture" aria-label="Message fixture">
  <label>Message duration <select bind:value={duration}><option value={0}>Persistent</option><option
    value={0.5}
  >Half second</option><option
    value={1}
  >One second</option><option
    value={3}
  >Three seconds</option></select></label>
  <label>Message limit <select bind:value={maxCount}><option value={1}>One</option><option
    value={2}
  >Two</option><option
    value={3}
  >Three</option></select></label>
  <label>Message top <select bind:value={top}><option value={8}>Default</option><option value={80}>80 pixels</option><option
    value="10vh"
  >10vh</option></select></label>
  <label>Message role <select bind:value={role}><option>status</option><option>alert</option></select></label>
  <label><input type="checkbox" bind:checked={pauseOnHover} /> Pause Message on hover</label>
  <label><input type="checkbox" bind:checked={hidden} /> Hide Message context</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Message theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Message theme</label>
  <div class="actions">
    {#each ['info', 'success', 'warning', 'error', 'loading'] as type}<button
      type="button"
      onclick={() => show(type as MessageType)}
    >Message {type}</button>{/each}
    <button type="button" onclick={() => { lastHandle = message.info('Default duration'); }}>Message default duration</button>
    <button type="button" onclick={() => track({ content: `Message ${++counter}`, duration: 0 })}>Add unique Message</button>
    <button type="button" onclick={() => track({ content: rich, icon })}>Message custom content</button>
    <button
      type="button"
      onclick={() =>
        track(
          {
            content: 'A very long message with an unbroken sequence VeryLongMessageWithoutAnySpacesToMakeSureItWrapsAndNeverWidensTheViewportOnMobileScreens',
            duration: 0
          }
        )}
    >Message long content</button>
    <button type="button" onclick={startTask}>Start Message task</button>
    <button
      type="button"
      onclick={() => track({ key: 'task', type: 'success', content: 'Saved task' })}
    >Finish Message task</button>
    <button
      type="button"
      onclick={() => track({ key: 'task', type: 'error', content: 'Failed task' })}
    >Fail Message task</button>
    <button type="button" onclick={() => taskHandle?.()}>Close task handle</button>
    <button type="button" onclick={() => previousTask?.()}>Close previous task handle</button>
    <button type="button" onclick={() => lastHandle?.()}>Close last Message</button>
    <button type="button" onclick={() => message.destroy('task')}>Destroy Message task</button>
    <button type="button" onclick={() => message.destroy()}>Destroy all Messages</button>
    <button type="button" onclick={() => { message = createMessage({ maxCount, pauseOnHover }); }}>Recreate Message instance</button>
    <button type="button" onclick={() => { mounted = !mounted; }}>Toggle Message holder</button>
    <button
      type="button"
      onclick={() => {
        mounted = false;
        message = createMessage();
        track({ content: 'Queued before mount', duration: 1 });
      }}
    >Queue before Message mount</button>
    <button type="button" onclick={() => secondary.success('Independent message')}>Show independent Message</button>
    <button type="button" onclick={() => secondary.destroy()}>Destroy independent Messages</button>
  </div>
  <label>Message focus target<input value="Keep focus here" /></label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <div hidden={hidden}>{#if mounted}<MessageHolder {message} {top} id="fixture-messages" />{/if}</div>
    <MessageHolder message={secondary} top={80} id="secondary-messages" />
    <div class="actions"><button type="button" onclick={() => { modalOpen = true; }}>Open Message Modal</button><button
      type="button"
      onclick={() => { drawerOpen = true; }}
    >Open Message Drawer</button><button
      type="button"
      onclick={() => modalMessage.info({ content: 'Queued Modal message', duration: 1 })}
    >Queue Modal message</button></div>
    <Modal bind:open={modalOpen} title="Message host modal"><div class="space"><label>Modal Message input<input
      value="Modal draft"
    /></label><button
      type="button"
      onclick={() => modalMessage.success({ content: 'Modal notification', duration: 0 })}
    >Show Modal message</button><button
      type="button"
      onclick={() => modalMessage.destroy()}
    >Destroy Modal messages</button><button
      type="button"
      onclick={() => { nestedOpen = true; }}
    >Open nested Message Drawer</button><MessageHolder
      message={modalMessage}
      id="modal-messages"
    /><Drawer
      bind:open={nestedOpen}
      title="Nested Message drawer"
    ><button
      type="button"
      onclick={() => nestedMessage.info({ content: 'Nested notification', duration: 0 })}
    >Show nested Message</button><MessageHolder
      message={nestedMessage}
      id="nested-messages"
    /></Drawer></div></Modal>
    <Drawer bind:open={drawerOpen} title="Message host drawer"><label>Drawer Message input<input
      value="Drawer draft"
    /></label><button
      type="button"
      onclick={() => drawerMessage.success({ content: 'Drawer notification', duration: 0 })}
    >Show Drawer message</button><MessageHolder
      message={drawerMessage}
      id="drawer-messages"
    /></Drawer>
  </ConfigProvider>
  <output aria-label="Message events">{JSON.stringify(events)}</output>
  <output aria-label="Message completions">{JSON.stringify(completions)}</output>
  <output aria-label="Message holder mounted">{String(mounted)}</output>
</section>
