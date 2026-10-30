<script lang="ts">
  import {
    AvatarGroup,
    ConfigProvider,
    Drawer,
    Modal,
    type AvatarGroupItem,
    type AvatarShape,
    type AvatarSize,
    type ComponentSize,
    type PopoverPlacement,
    type PopoverTrigger
  } from 'antd-svelte';
  import {
    avatarBrokenImage,
    avatarPortrait
  } from './avatar-data';

  const defaults = (): AvatarGroupItem[] =>
    [
      { key: 'a', label: 'Анна', text: 'АН' },
      { key: 'b', label: 'Дмитрий', text: 'ДО' },
      { key: 'c', label: 'Вера', text: 'ВС', src: avatarPortrait },
      { key: 'd', label: 'Елена', text: 'ЕС' },
      { key: 'e', label: 'Игорь', text: 'ИВ' }
    ];
  let members = $state(defaults());
  let limit = $state<number | undefined>(2);
  let size = $state<'inherit' | 'custom' | Exclude<AvatarSize, number>>('inherit');
  let numeric = $state<number | undefined>(48);
  let contextSize = $state<ComponentSize>('middle');
  let shape = $state<AvatarShape>('circle');
  let placement = $state<PopoverPlacement>('top');
  let trigger = $state<PopoverTrigger | 'default'>('default');
  let overrides = $state(false);
  let rich = $state(false);
  let customIcon = $state(false);
  let lazyImage = $state(false);
  let broken = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let linked = $state(false);
  let ownerFocus = $state(false);
  let mounted = $state(true);
  let customStyle = $state('');
  let label = $state('');
  let errors = $state(0);
  let submissions = $state(0);
  let modalOpen = $state(false);
  let drawerOpen = $state(false);
  let modalMounted = $state(true);
  let drawerMounted = $state(true);
</script>

<style>
  .surface { padding: 24px; margin-block: 16px; min-width: 0; background: var(--ant-color-bg-container); color: var(--ant-color-text); }
  label { display: block; }
  input, select { max-width: 100%; }
</style>

<svelte:window
  onkeydown={event => {
    if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
    if (event.code === 'BracketLeft') {
      event.preventDefault();
      limit = limit === 0 ? 2 : 0;
    }
    if (event.code === 'BracketRight') {
      event.preventDefault();
      if (modalOpen)
        modalMounted = !modalMounted;
      else if (drawerOpen)
        drawerMounted = !drawerMounted;
      else
        mounted = !mounted;
      if (ownerFocus) document.getElementById('avatar-group-owner')?.focus();
    }
    if (event.code === 'Backslash') {
      event.preventDefault();
      members = [...members].reverse();
    }
    if (event.code === 'Semicolon') {
      event.preventDefault();
      members = [];
    }
  }}
/>
{#snippet richText()}<strong>Rich fallback</strong>{/snippet}
{#snippet icon()}<button type="button">Inert group icon</button>{/snippet}

<section id="avatar-group-fixture" aria-label="AvatarGroup fixture">
  <h2>AvatarGroup</h2>
  <label>AvatarGroup limit<input type="number" step="any" bind:value={limit} /></label><label>AvatarGroup size<select
    bind:value={size}
  ><option>inherit</option><option>small</option><option>medium</option><option>large</option><option>custom</option></select></label><label>AvatarGroup numeric size<input
    type="number"
    step="any"
    bind:value={numeric}
  /></label><label>AvatarGroup context size<select
    bind:value={contextSize}
  ><option>small</option><option>middle</option><option>large</option></select></label><label>AvatarGroup shape<select
    bind:value={shape}
  ><option>circle</option><option>square</option></select></label>
  <label>AvatarGroup placement<select bind:value={placement}><option>top</option><option>bottom</option><option>left</option><option>right</option></select></label><label>AvatarGroup trigger<select
    bind:value={trigger}
  ><option>default</option><option>click</option><option>hover</option><option>focus</option></select></label><label>AvatarGroup overflow style<input
    bind:value={customStyle}
  /></label><label>AvatarGroup label<input
    bind:value={label}
  /></label>
  <label><input type="checkbox" bind:checked={overrides} /> Individual group overrides</label><label><input
    type="checkbox"
    bind:checked={rich}
  /> Rich group fallback</label><label><input
    type="checkbox"
    bind:checked={customIcon}
  /> Interactive group icon</label><label><input
    type="checkbox"
    bind:checked={lazyImage}
  /> Lazy group image</label><label><input
    type="checkbox"
    bind:checked={broken}
  /> Broken group image</label><label><input
    type="checkbox"
    bind:checked={linked}
  /> Linked group name</label><label><input
    type="checkbox"
    bind:checked={ownerFocus}
  /> Group owner focus</label><label><input
    type="checkbox"
    bind:checked={dark}
  /> Dark AvatarGroup theme</label><label><input
    type="checkbox"
    bind:checked={compact}
  /> Compact AvatarGroup theme</label>
  <p id="avatar-group-fixture-name">External team</p><p id="avatar-group-fixture-hint">Project members</p><label>Group outside input<input
    id="avatar-group-owner"
    value="Outside draft"
  /></label><button
    type="button"
    onclick={() => {
      members = defaults();
      mounted = true;
    }}
  >Reset fixture group</button><button
    type="button"
    onclick={() => { members = [...members, ...members]; }}
  >Duplicate fixture members</button><button
    type="button"
    onclick={() => {
      members = [
        ...members,
        ...Array.from(
          { length: 15 },
          (_, index) => ({ key: index, label: `Member ${index}`, text: `${index}` })
        )
      ];
    }}
  >Add many group members</button>
  <ConfigProvider componentSize={contextSize} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form
      aria-label="AvatarGroup form"
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    ><button type="button">Before AvatarGroup</button><div
      class="surface"
      id="avatar-group-surface"
    >{#if mounted}<AvatarGroup
      id="fixture-avatar-group"
      items={members.map(
        (item): AvatarGroupItem =>
        ({
          ...item,
          size: overrides && item.key === 'a' ? 'small' : undefined,
          shape: overrides && item.key === 'a' ? 'circle' : undefined,
          children: rich && item.key === 'b' ? richText : undefined,
          icon: customIcon && item.key === 'd' ? icon : undefined,
          src: broken && item.key === 'a'
            ? avatarBrokenImage
            : lazyImage && item.key === 'c' ? '/avatar-group-lazy.svg' : item.src,
          onError: () => { errors++; }
        })
      )}
      size={size === 'inherit' ? undefined : size === 'custom' ? numeric : size}
      {shape}
      max={{
        count: limit,
        style: customStyle,
        popover: { placement, trigger: trigger === 'default' ? undefined : trigger }
      }}
      aria-label={label || undefined}
      aria-labelledby={linked ? 'avatar-group-fixture-name' : undefined}
      aria-describedby="avatar-group-fixture-hint"
      class="custom-group"
      style="vertical-align: middle"
    />{/if}</div><button
      type="button"
    >After AvatarGroup</button></form>
    <ConfigProvider locale={{ avatarGroup: { hiddenLabel: 'Custom hidden members' } }}><AvatarGroup
      id="partial-locale-group"
      items={members}
      max={{ count: 1 }}
    /></ConfigProvider>
    <button
      type="button"
      onclick={() => {
        modalMounted = true;
        modalOpen = true;
      }}
    >Open group Modal</button><button
      type="button"
      onclick={() => {
        drawerMounted = true;
        drawerOpen = true;
      }}
    >Open group Drawer</button>
    <Modal bind:open={modalOpen} title="Group host modal">{#if modalMounted}<AvatarGroup
      items={members}
      max={{ count: limit }}
      aria-label="Modal team"
    />{/if}<button
      type="button"
    >After Modal group</button></Modal>
    <Drawer bind:open={drawerOpen} title="Group host drawer">{#if drawerMounted}<AvatarGroup
      items={members}
      max={{ count: limit }}
      aria-label="Drawer team"
    />{/if}<button
      type="button"
    >After Drawer group</button></Drawer>
  </ConfigProvider>
  <output aria-label="Group image errors">{errors}</output><output aria-label="Group submissions">{submissions}</output>
</section>
