<script lang="ts">
  import { Button, Input, Space, SpaceAddon, SpaceCompact } from '$lib/components/ant-design';
  let vertical = $state(false);
  let separator = $state(false);
  let clicks = $state(0);
  let domain = $state('example');
  let address = $state('');
</script>

{#snippet first()}<Button type="primary" onclick={() => { clicks++; }}>Сохранить ({clicks})</Button>{/snippet}
{#snippet second()}<Button>Предпросмотр</Button>{/snippet}
{#snippet third()}<a href="#space">Справка</a>{/snippet}
{#snippet addon()}<SpaceAddon>https://</SpaceAddon>{/snippet}
{#snippet domainInput()}<Input aria-label="Домен проекта" bind:value={domain} style="width:100%;min-width:0" />{/snippet}
{#snippet open()}<Button type="primary" onclick={() => { address = `${domain.trim()}.org`; }}>Открыть</Button>{/snippet}
<label><input type="checkbox" bind:checked={vertical} /> Вертикально</label>
<label><input type="checkbox" bind:checked={separator} /> Разделители</label>
<Space items={[{ key: 'save', children: first }, { key: 'preview', children: second }, { key: 'help', children: third }]} {vertical} wrap separator={separator ? '·' : undefined} />
<div style="margin-top:16px"><SpaceCompact block size="medium" items={[addon, domainInput, open]} /></div>
{#if address}<output aria-label="Адрес проекта">{address}</output>{/if}
