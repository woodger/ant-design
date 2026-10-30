<script lang="ts">
  import {
    ConfigProvider,
    Drawer,
    MessageHolder,
    Modal,
    NotificationHolder,
    createMessage,
    createNotification,
    type NotificationConfig,
    type NotificationPlacement,
    type NotificationType
  } from 'antd-svelte';

  let notification = $state.raw(createNotification({ maxCount: 3 }));
  const secondary = createNotification({ duration: 0 });
  const modalNotification = createNotification();
  const drawerNotification = createNotification();
  const nestedNotification = createNotification();
  const modalMessage = createMessage();
  let placement = $state<NotificationPlacement>('topRight');
  let duration = $state(0);
  let limit = $state(3);
  let pauseOnHover = $state(true);
  let role = $state<'alert' | 'status'>('alert');
  let closeMode = $state('default');
  let top = $state(24);
  let bottom = $state(24);
  let mounted = $state(true);
  let hidden = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let nestedOpen = $state(false);
  let events = $state<string[]>([]);
  let actions = $state(0);
  let counter = 0;
  let callbackFocus = $state(false);
  let callbackTarget: HTMLButtonElement;

  function post(config: NotificationConfig) {
    const label = typeof config.title === 'string' ? config.title : 'Rich title';
    notification.open(
      {
        placement,
        duration,
        pauseOnHover,
        role,
        closable: closeMode === 'hidden'
          ? false
          : closeMode === 'disabled'
            ? { disabled: true }
            : closeMode === 'custom'
              ? { closeIcon: '×', 'aria-label': 'Dismiss report' }
              : true,
        ...config,
        onClose: () => {
          events.push(`close:${label}`);
          if (callbackFocus) callbackTarget.focus();
        }
      }
    );
  }

  function show(type?: NotificationType) {
    post(
      {
        type,
        title: type ? `${type} notification` : 'Neutral notification',
        description: 'Detailed feedback for the current operation.'
      }
    );
  }

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    if (event.key === 'v') {
      event.preventDefault();
      post({ title: 'Keyboard notification', duration: 0 });
    }
    if (event.key === 'b') {
      event.preventDefault();
      mounted = !mounted;
    }
    if (event.key === 'x') {
      event.preventDefault();
      notification.destroy();
    }
    if (event.key === 'r') {
      event.preventDefault();
      post({ key: 'task', title: 'Actions removed' });
    }
    if (event.key === 'u') {
      event.preventDefault();
      post(
        {
          key: 'task',
          title: 'Updated notification',
          description: 'Updated details',
          type: 'success',
          actions: controls
        }
      );
    }
    if (event.key === 'j') {
      event.preventDefault();
      modalNotification.success(
        { title: 'Modal notification', description: 'Modal details', duration: 0 }
      );
    }
    if (event.key === 'l') {
      event.preventDefault();
      drawerNotification.success({ title: 'Drawer notification', duration: 0 });
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
{#snippet title()}<strong>Rich title</strong>{/snippet}
{#snippet description()}<em>Rich description</em>{/snippet}
{#snippet icon()}<span>★</span>{/snippet}
{#snippet controls()}<label>Notification action input<input value="Action draft" /></label><button
  type="button"
  onclick={() => { actions++; }}
>Notification action</button><button
  type="button"
  onclick={() => notification.destroy('task')}
>Dismiss from action</button>{/snippet}

<section id="notification-fixture" aria-label="Notification fixture">
  <label>Notification placement <select bind:value={placement}>{#each ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as value}<option>{value}</option>{/each}</select></label>
  <label>Notification duration <select bind:value={duration}><option value={0}>Persistent</option><option
    value={1}
  >One second</option><option
    value={4.5}
  >Default duration</option></select></label>
  <label>Notification limit <select bind:value={limit}><option value={1}>One</option><option
    value={2}
  >Two</option><option
    value={3}
  >Three</option></select></label>
  <label>Notification role <select bind:value={role}><option>alert</option><option>status</option></select></label>
  <label>Notification close mode <select bind:value={closeMode}><option>default</option><option>hidden</option><option>disabled</option><option>custom</option></select></label>
  <label>Notification top <select bind:value={top}><option value={24}>Default</option><option
    value={80}
  >80 pixels</option></select></label>
  <label>Notification bottom <select bind:value={bottom}><option value={24}>Default</option><option
    value={80}
  >80 pixels</option></select></label>
  <label><input type="checkbox" bind:checked={pauseOnHover} /> Pause Notification on hover</label>
  <label><input type="checkbox" bind:checked={hidden} /> Hide Notification context</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Notification theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Notification theme</label>
  <label><input type="checkbox" bind:checked={callbackFocus} /> Notification callback chooses focus</label>
  <div class="actions">
    <button type="button" onclick={() => show()}>Notification open</button>
    {#each ['success', 'info', 'warning', 'error'] as type}<button
      type="button"
      onclick={() => show(type as NotificationType)}
    >Notification {type}</button>{/each}
    <button type="button" onclick={() => notification.info({ title: 'Default duration' })}>Notification default duration</button>
    <button type="button" onclick={() => post({ title: `Notification ${++counter}` })}>Add unique Notification</button>
    <button type="button" onclick={() => post({ title, description, icon })}>Notification rich content</button>
    <button
      type="button"
      onclick={() =>
        post(
          {
            key: 'task',
            title: 'Action notification',
            description: 'Available actions',
            actions: controls
          }
        )}
    >Notification with actions</button>
    <button
      type="button"
      onclick={() =>
        post(
          {
            key: 'task',
            title: 'Updated notification',
            description: 'Updated details',
            type: 'success',
            actions: controls
          }
        )}
    >Update Notification task</button>
    <button
      type="button"
      onclick={() =>
        post(
          {
            title: 'Long notification',
            description: 'VeryLongNotificationWithoutSpacesToCheckThatTheDescriptionWrapsInsideTheViewportAndNeverWidensThePage'
              .repeat(4),
            actions: controls
          }
        )}
    >Notification long content</button>
    <button type="button" onclick={() => notification.destroy('task')}>Destroy Notification task</button>
    <button type="button" onclick={() => notification.destroy()}>Destroy all Notifications</button>
    <button
      type="button"
      onclick={() => { notification = createNotification({ maxCount: limit, pauseOnHover }); }}
    >Recreate Notification instance</button>
    <button type="button" onclick={() => { mounted = !mounted; }}>Toggle Notification holder</button>
    <button
      type="button"
      onclick={() => {
        mounted = false;
        notification = createNotification();
        post({ title: 'Queued before mount', duration: 1 });
      }}
    >Queue before Notification mount</button>
    <button
      type="button"
      onclick={() => secondary.success({ title: 'Independent notification', placement: 'bottomLeft' })}
    >Show independent Notification</button>
  </div>
  <label>Notification focus target<input value="Keep focus here" /></label>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}>
    <div hidden={hidden}>{#if mounted}<NotificationHolder
      {notification}
      {top}
      {bottom}
      id="fixture-notifications"
    />{/if}</div>
    <button type="button">After Notification</button>
    <button type="button" bind:this={callbackTarget}>Notification callback focus target</button>
    <NotificationHolder notification={secondary} id="secondary-notifications" />
    <div class="actions"><button type="button" onclick={() => { modalOpen = true; }}>Open Notification Modal</button><button
      type="button"
      onclick={() => { drawerOpen = true; }}
    >Open Notification Drawer</button><button
      type="button"
      onclick={() => modalNotification.info({ title: 'Queued Modal notification', duration: 1 })}
    >Queue Modal Notification</button></div>
    <Modal bind:open={modalOpen} title="Notification host modal"><div class="space"><label>Modal Notification input<input
      value="Modal draft"
    /></label><button
      type="button"
      onclick={() =>
        modalNotification.success(
          {
            title: 'Modal notification',
            description: 'Modal details',
            duration: 0,
            actions: controls
          }
        )}
    >Show Modal Notification</button><button
      type="button"
      onclick={() => modalMessage.info({ content: 'Message beside Notification', duration: 0 })}
    >Show Message beside Notification</button><button
      type="button"
      onclick={() => { nestedOpen = true; }}
    >Open nested Notification Drawer</button><NotificationHolder
      notification={modalNotification}
      id="modal-notifications"
    /><button
        type="button"
      >After Modal Notification</button><MessageHolder
        message={modalMessage}
      /><Drawer
        bind:open={nestedOpen}
        title="Nested Notification drawer"
      ><button
        type="button"
        onclick={() => nestedNotification.info({ title: 'Nested notification', duration: 0 })}
      >Show nested Notification</button><NotificationHolder
        notification={nestedNotification}
        id="nested-notifications"
      /></Drawer></div></Modal>
    <Drawer bind:open={drawerOpen} title="Notification host drawer"><label>Drawer Notification input<input
      value="Drawer draft"
    /></label><button
      type="button"
      onclick={() => drawerNotification.success({ title: 'Drawer notification', duration: 0 })}
    >Show Drawer Notification</button><NotificationHolder
      notification={drawerNotification}
      id="drawer-notifications"
    /></Drawer>
  </ConfigProvider>
  <output aria-label="Notification events">{JSON.stringify(events)}</output>
  <output aria-label="Notification actions">{actions}</output>
</section>
