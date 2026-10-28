<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { AvatarGroup, Button, Input, InputNumber, Select, type AvatarShape, type AvatarSize } from '$lib/components/ant-design';
  import { createAvatarGroupExample } from './avatar-group-example.model.svelte';

  const model = createAvatarGroupExample();
  let limit = $state<number | null>(3);
  let size = $state<'inherit' | 'custom' | Exclude<AvatarSize, number>>('medium');
  let numericSize = $state<number | null>(48);
  let shape = $state<AvatarShape>('circle');
  let name = $state<string | undefined>('');
  let error = $state('');
  let list = $state<HTMLUListElement>();
  let nameContainer = $state<HTMLDivElement>();
  let active = true;
  let action = 0;
  onDestroy(() => { active = false; action++; });

  async function add() {
    const token = ++action;
    if (model.add(name ?? '')) { name = ''; error = ''; }
    else error = 'Введите имя участника.';
    await tick();
    if (active && token === action) nameContainer?.querySelector('input')?.focus({ preventScroll: true });
  }
  async function remove(key: number) {
    const index = model.members.findIndex(member => member.key === key);
    if (!model.remove(key)) return;

    const next = model.members[index]?.key ?? model.members[index - 1]?.key;
    const token = ++action;
    await tick();
    if (active && token === action) (list?.querySelector<HTMLButtonElement>(`[data-member-key="${next}"]`) ?? nameContainer?.querySelector('input'))?.focus({ preventScroll: true });
  }
  async function move(key: number, direction: -1 | 1, button: HTMLButtonElement) {
    if (!model.move(key, direction)) return;

    const token = ++action;
    await tick();
    if (active && token === action) (button.disabled ? list?.querySelector<HTMLButtonElement>(`[data-member-key="${key}"]`) : button)?.focus({ preventScroll: true });
  }
  function reset() { action++; model.reset(); error = ''; name = ''; }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; min-width: 0; }
  .field { width: 160px; max-width: 100%; }
  .field label { display: block; }
  .name { flex: 1 1 220px; min-width: 0; max-width: 100%; }
  .preview { margin-block: 24px; padding: 24px; min-width: 0; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .members { padding: 0; margin-block: 24px; list-style: none; }
  .members li { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-block: 12px; border-bottom: 1px solid var(--ant-color-border-secondary); }
  .member-name { flex: 1 1 220px; min-width: 0; overflow-wrap: anywhere; }
  .controls :global(.ant-btn), .members :global(.ant-btn) { height: auto; min-height: var(--ant-control-height); max-width: 100%; white-space: normal; }
  .error { color: var(--ant-color-error); }
  .summary { color: var(--ant-color-text-secondary); }
</style>

<div class="controls"><div class="field"><label for="avatar-group-example-limit">Лимит AvatarGroup</label><InputNumber id="avatar-group-example-limit" bind:value={limit} min={0} precision={0} /></div><div class="field"><Select aria-label="Размер AvatarGroup" bind:value={size} options={['inherit', 'small', 'medium', 'large', 'custom'].map(value => ({ value: value as typeof size, label: value }))} /></div><div class="field"><label for="avatar-group-example-size">Числовой размер AvatarGroup</label><InputNumber id="avatar-group-example-size" bind:value={numericSize} min={8} max={96} disabled={size !== 'custom'} /></div><div class="field"><Select aria-label="Форма AvatarGroup" bind:value={shape} options={[{ value: 'circle', label: 'circle' }, { value: 'square', label: 'square' }]} /></div></div>
<div class="preview"><AvatarGroup id="showcase-avatar-group" items={model.members} size={size === 'inherit' ? undefined : size === 'custom' ? numericSize ?? undefined : size} {shape} max={{ count: limit ?? undefined }} aria-label="Команда проекта" /></div>
<p class="summary">Участников: {model.members.length}. Лимит считает участников; кнопка +N добавляется отдельно. Ноль показывает всех.</p>
<div class="controls"><div class="name" bind:this={nameContainer}><label for="avatar-group-example-name">Новый участник AvatarGroup</label><Input id="avatar-group-example-name" bind:value={name} aria-describedby={error ? 'avatar-group-example-error' : undefined} aria-invalid={error ? true : undefined} onkeydown={event => { if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); void add(); } }} /></div><Button type="primary" onclick={() => { void add(); }}>Добавить участника AvatarGroup</Button><Button onclick={reset}>Сбросить команду AvatarGroup</Button></div>
{#if error}<p id="avatar-group-example-error" class="error">{error}</p>{/if}
<ul bind:this={list} class="members" aria-label="Управление командой AvatarGroup">{#each model.members as member, index (member.key)}<li><span class="member-name">{member.label}</span><Button disabled={index === 0} aria-label={`Выше ${member.label}`} onclick={event => { void move(member.key, -1, event.currentTarget); }}>Выше</Button><Button disabled={index === model.members.length - 1} aria-label={`Ниже ${member.label}`} onclick={event => { void move(member.key, 1, event.currentTarget); }}>Ниже</Button><Button aria-label={`Удалить ${member.label}`} data-member-key={member.key} onclick={() => { void remove(member.key); }}>Удалить</Button></li>{/each}</ul>
