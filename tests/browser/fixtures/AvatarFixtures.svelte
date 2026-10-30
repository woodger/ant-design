<script lang="ts">
  import {
    Avatar,
    ConfigProvider,
    Drawer,
    Modal,
    type AvatarShape,
    type AvatarSize,
    type ComponentSize
  } from 'antd-svelte';
  import {
    avatarBrokenImage,
    avatarPortrait
  } from './avatar-data';

  let mode = $state<'none' | 'image' | 'broken' | 'url'>('none');
  let url = $state('/avatar-fixture.svg');
  let srcSet = $state('');
  let shape = $state<AvatarShape>('circle');
  let size = $state<'inherit' | 'custom' | Exclude<AvatarSize, number>>('inherit');
  let numericSize = $state<number | undefined>(48);
  let gap = $state<number | undefined>(4);
  let contextSize = $state<ComponentSize>('middle');
  let text = $state('AVATAR');
  let alt = $state('Fixture user');
  let label = $state('');
  let labelled = $state(false);
  let decorative = $state(false);
  let icon = $state(false);
  let rich = $state(false);
  let prevent = $state(false);
  let recover = $state(false);
  let customStyle = $state('');
  let dark = $state(false);
  let compact = $state(false);
  let concealed = $state(false);
  let mounted = $state(true);
  let errors = $state(0);
  let submissions = $state(0);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let source = $derived(
    mode === 'image'
      ? avatarPortrait
      : mode === 'broken' ? avatarBrokenImage : mode === 'url' ? url : undefined
  );

  function failed() {
    errors++;
    if (recover) mode = 'image';

    return prevent ? false : undefined;
  }
</script>

<style>
  .surface { display: flex; align-items: center; justify-content: center; min-height: 120px; padding: 16px; margin-block: 16px; background: var(--ant-color-bg-container); color: var(--ant-color-text); }
  .owner { display: inline-flex; gap: 12px; align-items: center; max-width: 100%; padding: 8px; }
  .owner-label { min-width: 0; overflow-wrap: anywhere; }
  input, select { max-width: 100%; }
</style>

<svelte:window
  onkeydown={event => {
    if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
    if (event.code === 'F11') {
      event.preventDefault();
      mode = mode === 'none' ? 'image' : 'none';
    }
    if (event.code === 'F12') {
      event.preventDefault();
      mounted = !mounted;
    }
  }}
/>

{#snippet userIcon()}<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4" /><path
  d="M3 23v-2a9 9 0 0 1 18 0v2z"
/></svg>{/snippet}
{#snippet interactiveIcon()}<button type="button">Inert Avatar icon</button>{/snippet}

<section id="avatar-fixture" aria-label="Avatar fixture">
  <h2>Avatar</h2>
  <label>Avatar image mode<select bind:value={mode}><option>none</option><option>image</option><option>broken</option><option>url</option></select></label><label>Avatar image URL<input
    bind:value={url}
  /></label><label>Avatar srcSet<input
    bind:value={srcSet}
  /></label>
  <label>Avatar shape<select bind:value={shape}><option>circle</option><option>square</option></select></label><label>Avatar size<select
    bind:value={size}
  ><option>inherit</option><option>small</option><option>medium</option><option>large</option><option>custom</option></select></label><label>Avatar numeric size<input
    type="number"
    step="any"
    bind:value={numericSize}
  /></label><label>Avatar gap<input
    type="number"
    step="any"
    bind:value={gap}
  /></label><label>Avatar context size<select
    bind:value={contextSize}
  ><option>small</option><option>middle</option><option>large</option></select></label>
  <label>Avatar text<input bind:value={text} /></label><label>Avatar alt<input bind:value={alt} /></label><label>Avatar root label<input
    bind:value={label}
  /></label><label>Avatar root style<input
    bind:value={customStyle}
  /></label>
  <label><input type="checkbox" bind:checked={icon} /> Avatar icon fallback</label><label><input
    type="checkbox"
    bind:checked={rich}
  /> Rich Avatar text</label><label><input
    type="checkbox"
    bind:checked={labelled}
  /> Linked Avatar name</label><label><input
    type="checkbox"
    bind:checked={decorative}
  /> Decorative Avatar</label><label><input
    type="checkbox"
    bind:checked={prevent}
  /> Prevent Avatar fallback</label><label><input
    type="checkbox"
    bind:checked={recover}
  /> Recover Avatar in onError</label><label><input
    type="checkbox"
    bind:checked={concealed}
  /> Concealed Avatar</label><label><input
    type="checkbox"
    bind:checked={dark}
  /> Dark Avatar theme</label><label><input
    type="checkbox"
    bind:checked={compact}
  /> Compact Avatar theme</label>
  <p id="avatar-fixture-name">External avatar name</p><p id="avatar-fixture-hint">Participant profile</p>
  <ConfigProvider componentSize={contextSize} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form
      aria-label="Avatar form"
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    >
      <button type="button">Before Avatar</button><div class="surface" id="avatar-surface"><button
        type="submit"
        class="owner"
        id="avatar-owner"
      ><span
        hidden={concealed}
      >{#if mounted}<Avatar
        id="fixture-avatar"
        src={source}
        srcSet={srcSet || undefined}
        {alt}
        {shape}
        size={size === 'inherit' ? undefined : size === 'custom' ? numericSize : size}
        {gap}
        icon={icon ? userIcon : undefined}
        onError={failed}
        aria-label={label || undefined}
        aria-labelledby={labelled ? 'avatar-fixture-name' : undefined}
        aria-describedby="avatar-fixture-hint"
        aria-hidden={decorative}
        class="custom-avatar"
        style={customStyle}
        title="Avatar title"
        draggable={false}
        crossOrigin="anonymous"
      >{#if rich}<strong>{text}</strong>{:else}{text}{/if}</Avatar>{/if}</span><span
        class="owner-label"
      >Open Avatar profile</span></button></div><button
        type="button"
      >After Avatar</button>
    </form>
    <div class="surface"><Avatar id="avatar-inert-icon" alt="Icon example" icon={interactiveIcon} /><Avatar
      id="avatar-inert-text"
      alt="Text example"
    ><button
      type="button"
    >Inert Avatar text</button></Avatar><button
      type="button"
    >After inert avatars</button></div>
    <button type="button" onclick={() => { modalOpen = true; }}>Open Avatar Modal</button><button
      type="button"
      onclick={() => { drawerOpen = true; }}
    >Open Avatar Drawer</button>
    <Modal bind:open={modalOpen} title="Avatar host modal"><Avatar alt="Modal user" size={64}>LONGUSERNAME</Avatar><button
      type="button"
    >After Modal Avatar</button></Modal>
    <Drawer bind:open={drawerOpen} title="Avatar host drawer"><Avatar alt="Drawer user" size={64}>LONGUSERNAME</Avatar><button
      type="button"
    >After Drawer Avatar</button></Drawer>
  </ConfigProvider>
  <output aria-label="Avatar image errors">{errors}</output><output aria-label="Avatar submissions">{submissions}</output>
</section>
