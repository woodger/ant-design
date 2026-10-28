<script lang="ts">
  import { Avatar, Badge, Button, Checkbox, Drawer, Input, InputNumber, Select, type AvatarShape, type AvatarSize } from '$lib/components/ant-design';
  import { avatarPictureSource, createAvatarExample, type AvatarPicture } from './avatar-example.model.svelte';

  const model = createAvatarExample();
  let picture = $state<AvatarPicture | 'icon'>('initials');
  let shape = $state<AvatarShape>('circle');
  let size = $state<'inherit' | 'custom' | Exclude<AvatarSize, number>>('medium');
  let customSize = $state<number | null>(48);
  let gap = $state<number | null>(4);
  let letters = $state<string | undefined>('АН');
  let name = $state<string | undefined>('Анна Новикова');
  let preventFallback = $state(false);
  let errors = $state(0);
  let open = $state(false);
  let person = $derived(model.selected);

  function show(key: string) { if (model.select(key)) open = true; }
  function reset() { open = false; model.reset(); }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; min-width: 0; }
  .field { width: 160px; max-width: 100%; }
  .wide { width: 250px; max-width: 100%; }
  .preview { display: flex; align-items: center; justify-content: center; min-height: 160px; margin-block: 24px; padding: 16px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .summary { color: var(--ant-color-text-secondary); }
  .people { display: grid; gap: 16px; padding: 0; list-style: none; }
  .person { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; padding: 16px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); min-width: 0; }
  .details { flex: 1 1 180px; min-width: 0; overflow-wrap: anywhere; }
  .details p { margin: 4px 0 0; color: var(--ant-color-text-secondary); }
  .profile { display: flex; align-items: center; gap: 16px; min-width: 0; margin-block-end: 24px; }
  .profile h3 { margin-block: 0 8px; font-size: var(--ant-font-size-lg); }
  .profile p { margin-block: 0; }
  .controls :global(.ant-btn), .person :global(.ant-btn) { max-width: 100%; height: auto; min-height: var(--ant-control-height); white-space: normal; }
</style>

{#snippet userIcon()}<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4" /><path d="M3 23v-2a9 9 0 0 1 18 0v2z" /></svg>{/snippet}

<div class="controls"><div class="field"><Select aria-label="Содержимое Avatar" bind:value={picture} options={[{ value: 'initials', label: 'Инициалы' }, { value: 'icon', label: 'Иконка' }, { value: 'image', label: 'Изображение' }, { value: 'broken', label: 'Ошибка изображения' }]} /></div><div class="field"><Select aria-label="Форма Avatar" bind:value={shape} options={[{ value: 'circle', label: 'circle' }, { value: 'square', label: 'square' }]} /></div><div class="field"><Select aria-label="Размер Avatar" bind:value={size} options={['inherit', 'small', 'medium', 'large', 'custom'].map(value => ({ value: value as typeof size, label: value }))} /></div><div class="field"><label for="avatar-example-size">Числовой размер Avatar</label><InputNumber id="avatar-example-size" bind:value={customSize} min={8} max={128} disabled={size !== 'custom'} /></div><div class="field"><label for="avatar-example-gap">Отступ текста Avatar</label><InputNumber id="avatar-example-gap" bind:value={gap} min={0} /></div><div class="wide"><Input aria-label="Текст Avatar" bind:value={letters} /></div><div class="wide"><Input aria-label="Имя Avatar" bind:value={name} /></div><Checkbox bind:checked={preventFallback}>Отменять fallback Avatar</Checkbox></div>
<div class="preview"><Avatar id="showcase-avatar-preview" src={picture === 'icon' ? undefined : avatarPictureSource(picture)} alt={name} {shape} size={size === 'inherit' ? undefined : size === 'custom' ? customSize ?? undefined : size} gap={gap ?? undefined} icon={picture === 'icon' ? userIcon : undefined} onError={() => { errors++; return preventFallback ? false : undefined; }}>{letters}</Avatar></div>
<p id="avatar-example-errors" class="summary">Ошибок изображения в предпросмотре: {errors}.</p>
<h3>Участники проекта</h3>
<ul class="people" aria-label="Участники Avatar">{#each model.participants as participant (participant.key)}<li class="person"><Badge count={participant.unread}><Avatar src={avatarPictureSource(participant.picture)} aria-hidden size="large">{participant.initials}</Avatar></Badge><div class="details"><strong>{participant.name}</strong><p>{participant.role}. Непрочитанных: {participant.unread}.</p></div><Button onclick={() => show(participant.key)}>Открыть профиль {participant.name}</Button></li>{/each}</ul>
<div class="controls"><Button onclick={reset}>Сбросить участников Avatar</Button></div>
<Drawer bind:open title="Профиль участника Avatar">
  {#if person}<div class="profile"><Avatar id="showcase-avatar-profile" src={avatarPictureSource(person.picture)} alt={person.name} size={64}>{person.initials}</Avatar><div class="details"><h3>{person.name}</h3><p>{person.role}</p></div></div><div class="controls"><Button onclick={() => { if (person) model.setPicture(person.key, 'image'); }}>Показать фото участника</Button><Button onclick={() => { if (person) model.setPicture(person.key, 'initials'); }}>Показать инициалы участника</Button><Button onclick={() => { if (person) model.setPicture(person.key, 'broken'); }}>Повредить фото участника</Button></div><p class="summary">Изменения сохраняются при повторном открытии профиля.</p>{/if}
</Drawer>
