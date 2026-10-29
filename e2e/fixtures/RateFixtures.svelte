<script lang="ts">
  import { ConfigProvider, createForm, Form, Rate, type RateCharacterInfo, type ComponentSize } from '../../src/lib/components/ant-design';
  import { untrack, type Snippet } from 'svelte';

  let { initialAutoFocus = false }: { initialAutoFocus?: boolean } = $props();
  let value = $state<number | undefined>(2.5);
  let reject = $state(false);
  let controlled = $state(true);
  let half = $state(true);
  let clear = $state(true);
  let keyboard = $state(true);
  let disabled = $state<'inherit' | 'true' | 'false'>('inherit');
  let count = $state(5);
  let formDisabled = $state(false);
  let formOverride = $state(false);
  let size = $state<'inherit' | ComponentSize | 'medium'>('inherit');
  let providerSize = $state<ComponentSize>('middle');
  let dark = $state(false);
  let compact = $state(false);
  let custom = $state(false);
  let render = $state(false);
  let replace = $state(false);
  let tooltips = $state<'off' | 'string' | 'object'>('off');
  let mounted = $state(true);
  let autofocus = $state(untrack(() => initialAutoFocus));
  let instance: { focus(): void; blur(): void } | undefined = $state();
  let nativeElement = $state<HTMLUListElement>();
  let events = $state<string[]>([]);
  let keys = $state<string[]>([]);
  let focusEvents = $state<string[]>([]);
  let leaves = $state(0);
  const names = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful'];
  const form = createForm({ initialValues: {} });
</script>

{#snippet character(info: RateCharacterInfo)}<b data-star={info.index}>{info.index + 1}</b>{/snippet}
{#snippet renderer(origin: Snippet, info: RateCharacterInfo)}<span class="custom-rate-render" data-index={info.index} style="display:contents">{@render origin()}</span>{/snippet}
{#snippet replacement(_origin: Snippet, info: RateCharacterInfo)}<li><button type="button" aria-label={`Custom rating ${info.index + 1}`} onclick={event => info.onClick(event, info.index)}>{info.index + 1}</button></li>{/snippet}

<section id="rate-fixture" aria-label="Rate fixture">
  <h2>Rate</h2>
  <label><input type="checkbox" bind:checked={half} /> Allow half Rate</label>
  <label><input type="checkbox" bind:checked={clear} /> Allow clear Rate</label>
  <label><input type="checkbox" bind:checked={keyboard} /> Keyboard Rate</label>
  <label><input type="checkbox" bind:checked={reject} /> Reject Rate changes</label>
  <label><input type="checkbox" bind:checked={controlled} /> Controlled Rate</label>
  <label><input type="checkbox" bind:checked={formDisabled} /> Disabled Rate Form</label>
  <label><input type="checkbox" bind:checked={formOverride} /> Override disabled Rate Form</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Rate theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Rate theme</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Rate character</label>
  <label><input type="checkbox" bind:checked={render} /> Custom Rate render</label>
  <label><input type="checkbox" bind:checked={replace} /> Replace Rate render</label>
  <label><input type="checkbox" bind:checked={autofocus} /> Autofocus Rate</label>
  <label>Rate disabled<select bind:value={disabled}><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>Rate size<select bind:value={size}><option>inherit</option><option>small</option><option>middle</option><option>medium</option><option>large</option></select></label>
  <label>Provider Rate size<select bind:value={providerSize}><option>small</option><option>middle</option><option>large</option></select></label>
  <label>Rate count<select bind:value={count}><option value={0}>0</option><option value={3}>3</option><option value={5}>5</option></select></label>
  <label>Rate tooltips<select bind:value={tooltips}><option>off</option><option>string</option><option>object</option></select></label>
  <button type="button" onclick={() => { value = 4; }}>Set Rate to four</button>
  <button type="button" onclick={() => { value = 0; }}>Set Rate to zero</button>
  <button type="button" onclick={() => { value = undefined; }}>Release Rate value</button>
  <button type="button" onclick={() => { mounted = !mounted; }}>Toggle Rate mount</button>
  <button type="button" onclick={() => { events = []; keys = []; focusEvents = []; leaves = 0; }}>Clear Rate events</button>
  <button type="button" onclick={() => instance?.focus()}>Focus Rate</button>
  <button type="button" onpointerdown={event => event.preventDefault()} onclick={() => instance?.blur()}>Blur Rate</button>

  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} componentSize={providerSize} rate={{ class: 'context-rate', style: 'opacity:0.8;color:rgb(1,2,3)' }}>
    <form aria-label="Rate native form" onsubmit={event => event.preventDefault()}>
      <button type="button">Before Rate</button>
      {#if mounted}<Rate id="fixture-rate" aria-label="Rating" {count} value={controlled ? value : undefined} defaultValue={1} allowHalf={half} allowClear={clear} {keyboard}
        disabled={disabled === 'inherit' ? undefined : disabled === 'true'} size={size === 'inherit' ? undefined : size}
        character={custom ? character : undefined} characterRender={replace ? replacement : render ? renderer : undefined} autoFocus={autofocus}
        tooltips={tooltips === 'off' ? undefined : names.map(title => tooltips === 'string' ? title : { title, mouseEnterDelay: 0, mouseLeaveDelay: 0 })}
        class="owner-rate" rootClassName="root-rate" style="color:var(--ant-rate-star-color)"
        bind:this={instance} bind:nativeElement
        onChange={next => { events.push(`change:${next}`); if (!reject && controlled) value = next; }}
        onHoverChange={next => { events.push(`hover:${String(next)}`); }}
        onFocus={() => { focusEvents.push('focus'); }} onBlur={() => { focusEvents.push('blur'); }}
        onKeyDown={event => { keys.push(`${event.key}:${event.defaultPrevented}`); }} onMouseLeave={() => { leaves++; }}
      />{/if}
      <button type="button">After Rate</button><button type="reset">Reset Rate native form</button>
    </form>
    <Rate id="independent-rate" aria-label="Independent Rating" defaultValue={3} />
    <Form {form} disabled={formDisabled}><Rate aria-label="Form Rating" disabled={formOverride ? false : undefined} /></Form>
    <ConfigProvider theme={{ mode: 'light', compact: false }} rate={{ style: 'opacity:0.6' }}><Rate id="nested-rate" aria-label="Nested Rating" value={2} /></ConfigProvider>
  </ConfigProvider>
  <output aria-label="Rate value">{String(value)}</output>
  <output aria-label="Rate events">{events.join('|')}</output>
  <output aria-label="Rate keys">{keys.join('|')}</output>
  <output aria-label="Rate focus">{focusEvents.join('|')}</output>
  <output aria-label="Rate leaves">{leaves}</output>
  <output aria-label="Rate native element">{nativeElement?.tagName}</output>
</section>
