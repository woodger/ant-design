<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Badge, Button, Checkbox, Drawer, Input, InputNumber, Select, type BadgeColor, type BadgeContext, type BadgeSize, type BadgeStatus } from '$lib/components/ant-design';
  import { createBadgeInbox } from './badge-inbox.model.svelte';

  const model = createBadgeInbox();
  const statuses: BadgeStatus[] = ['success', 'processing', 'default', 'error', 'warning'];
  const colors: BadgeColor[] = ['blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold'];
  let mode = $state<'count' | 'dot' | 'status'>('count');
  let count = $state<number | null>(5);
  let overflow = $state<number | null>(99);
  let showZero = $state(false);
  let standalone = $state(false);
  let size = $state<BadgeSize>('medium');
  let color = $state<BadgeColor | 'auto'>('auto');
  let status = $state<BadgeStatus>('processing');
  let text = $state<string | undefined>('Состояние сервиса');
  let rich = $state(false);
  let offsetX = $state<number | null>(0);
  let offsetY = $state<number | null>(0);
  let clicks = $state(0);
  let open = $state(false);
  let active = true;
  let action = 0;
  let list = $state<HTMLDivElement>();
  let inboxDot = $state(false);

  onDestroy(() => { active = false; action++; });
  async function read(key?: number) {
    const changed = key === undefined ? model.readAll() > 0 : model.markRead(key);
    if (!changed) return;

    const token = ++action;
    await tick();
    if (!active || token !== action || !open) return;

    (key === undefined ? list : document.getElementById(`badge-message-${key}`))?.focus({ preventScroll: true });
  }
  function reset() { action++; open = false; model.reset(); }
</script>

<style>
  .controls, .examples { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; min-width: 0; }
  .field { width: 160px; max-width: 100%; }
  .wide { width: 250px; max-width: 100%; }
  .preview { margin-block: 24px; padding: 32px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .examples { margin-block: 24px; gap: 24px; }
  .inbox { padding: 16px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .controls :global(.ant-btn) { max-width: 100%; height: auto; min-height: var(--ant-control-height); white-space: normal; }
  .messages { padding-inline-start: 24px; }
  .message { padding-block: 16px; overflow-wrap: anywhere; }
  .message + .message { border-top: 1px solid var(--ant-color-border-secondary); }
  .message:focus-visible, .list:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .message h3 { margin-block: 0 8px; font-size: var(--ant-font-size-lg); }
  .message p { margin-block: 8px; }
  .message :global(.ant-btn) { max-width: 100%; height: auto; min-height: var(--ant-control-height); white-space: normal; }
  .summary { color: var(--ant-color-text-secondary); }
  output { display: block; color: var(--ant-color-text-secondary); }
</style>

{#snippet previewTarget(context: BadgeContext)}<Button aria-describedby={context.descriptionId} onclick={() => { clicks++; }}>Кнопка с Badge</Button>{/snippet}
{#snippet richText()}<strong>{text}</strong>{/snippet}

<div class="controls"><div class="field"><Select aria-label="Режим Badge" bind:value={mode} options={[{ value: 'count', label: 'Счётчик' }, { value: 'dot', label: 'Точка' }, { value: 'status', label: 'Статус' }]} /></div><div class="field"><label for="badge-example-count">Количество Badge</label><InputNumber id="badge-example-count" bind:value={count} min={0} disabled={mode === 'status'} /></div><div class="field"><label for="badge-example-overflow">Предел Badge</label><InputNumber id="badge-example-overflow" bind:value={overflow} min={0} /></div><div class="field"><Select aria-label="Размер Badge" bind:value={size} options={[{ value: 'medium', label: 'medium' }, { value: 'small', label: 'small' }]} /></div><div class="field"><Select aria-label="Цвет Badge" bind:value={color} options={['auto', ...colors].map(value => ({ value: value as BadgeColor | 'auto', label: value }))} /></div></div>
<div class="controls"><Checkbox bind:checked={showZero}>Показывать ноль Badge</Checkbox><Checkbox bind:checked={standalone} disabled={mode === 'status'}>Отдельный Badge</Checkbox><div class="field"><Select aria-label="Статус Badge" bind:value={status} disabled={mode !== 'status'} options={statuses.map(value => ({ value, label: value }))} /></div><div class="wide"><Input aria-label="Текст статуса Badge" bind:value={text} disabled={mode !== 'status'} /></div><Checkbox bind:checked={rich} disabled={mode !== 'status'}>Snippet статуса Badge</Checkbox><div class="field"><label for="badge-example-x">Смещение Badge X</label><InputNumber id="badge-example-x" bind:value={offsetX} /></div><div class="field"><label for="badge-example-y">Смещение Badge Y</label><InputNumber id="badge-example-y" bind:value={offsetY} /></div></div>
<div class="preview"><Badge id="showcase-badge-preview" count={mode === 'status' ? undefined : count ?? undefined} overflowCount={overflow ?? undefined} dot={mode === 'dot'} status={mode === 'status' ? status : undefined} color={color === 'auto' ? undefined : color} text={mode === 'status' ? rich ? richText : text : undefined} {size} {showZero} offset={[offsetX ?? 0, offsetY ?? 0]} children={mode === 'status' || standalone ? undefined : previewTarget} aria-label="Предпросмотр Badge" /></div>
<div class="examples" aria-label="Статусы Badge">{#each statuses as value}<Badge status={value} text={value} />{/each}</div>
<output aria-label="Нажатия в примере Badge">Нажатий: {clicks}.</output>
<h3>Уведомления</h3>
<div class="controls inbox"><Badge id="showcase-badge-inbox" count={model.unreadCount} dot={inboxDot}>{#snippet children({ descriptionId })}<Button type="primary" aria-describedby={descriptionId} onclick={() => { open = true; }}>Открыть уведомления Badge</Button>{/snippet}</Badge><Button onclick={() => model.add()}>Новое уведомление</Button><Button onclick={() => model.addBatch()}>Добавить 100 уведомлений</Button><Button onclick={reset}>Сбросить пример Badge</Button><Checkbox bind:checked={inboxDot}>Точка вместо числа уведомлений</Checkbox></div>
<p class="summary">Непрочитанных: {model.unreadCount}. Всего сообщений: {model.messages.length}.</p>
<Drawer bind:open title="Уведомления Badge">
  <div class="controls"><Button type="primary" disabled={!model.unreadCount} onclick={() => { void read(); }}>Прочитать все уведомления</Button><Button onclick={() => model.add()}>Добавить уведомление в Drawer</Button></div>
  <div bind:this={list} class="list" role="region" aria-label="Список уведомлений Badge" tabindex="-1"><p>Непрочитанных: {model.unreadCount}.</p><ul class="messages">{#each model.messages as message (message.key)}<li id={`badge-message-${message.key}`} class="message" tabindex="-1"><h3>{message.title}</h3><Badge status={message.read ? 'default' : 'warning'} text={message.read ? 'Прочитано' : 'Не прочитано'} /><p>{message.body}</p><Button disabled={message.read} onclick={() => { void read(message.key); }}>Прочитать «{message.title}»</Button></li>{/each}</ul></div>
</Drawer>
