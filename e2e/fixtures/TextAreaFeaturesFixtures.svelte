<script lang="ts">
  import { ConfigProvider, TextArea, Form, FormItem, createForm, type TextAreaChangeEvent, type TextAreaCountInfo, type TextAreaVariant, type TextAreaAllowClear } from '../../src/lib/components/ant-design';
  let value = $state('Initial 😀\ntext'); let mounted = $state(true); let sizing = $state<'off' | 'auto' | 'limits'>('limits');
  let show = $state(true); let countEnabled = $state(false); let max = $state(6); let strategy = $state(false); let clip = $state(false);
  let clearMode = $state<'inherit' | 'true' | 'false'>('true'); let clearDisabled = $state<'inherit' | 'true' | 'false'>('inherit'); let iconMode = $state<'context' | 'custom' | 'falsy'>('context');
  let contextDisabled = $state(false); let disabled = $state(false); let readonly = $state(false); let dark = $state(false); let compact = $state(false);
  let variant = $state<TextAreaVariant | 'inherit'>('inherit'); let size = $state<'small' | 'middle' | 'large'>('middle'); let bordered = $state(true);
  let semantic = $state(false); let richCount = $state(false); let manual = $state(false); let nativeLimit = $state(false); let wrap = $state<'soft' | 'off'>('soft');
  let formAuto = $state(true);
  let events = $state<string[]>([]); let resizes = $state(0); let selection = $state('');
  let nativeElement = $state<HTMLTextAreaElement>(); let root = $state<HTMLElement>(); let saved = $state.raw<TextAreaChangeEvent>();
  let instance: { focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all' }): void; blur(): void } | undefined = $state();
  const form = createForm({ initialValues: { counted: '' }, rules: { counted: [{ required: true, message: 'Counted text required' }] } });
  let localClear = $derived<boolean | TextAreaAllowClear | undefined>(clearMode === 'inherit' ? undefined : clearMode === 'false' ? false : clearDisabled === 'inherit' && iconMode === 'context' ? true : { disabled: clearDisabled === 'inherit' ? undefined : clearDisabled === 'true', clearIcon: iconMode === 'custom' ? clearIcon : iconMode === 'falsy' ? null : undefined });
  let count = $derived(countEnabled ? { max, strategy: strategy ? (text: string) => [...text].length : undefined, exceedFormatter: clip ? (text: string, { max }: { max: number }) => strategy ? [...text].slice(0, max).join('') : text.slice(0, max) : undefined, show: richCount ? () => formattedCount : show } : undefined);
</script>

{#snippet clearIcon()}<strong style="display:inline-flex;line-height:1">Custom clear</strong>{/snippet}
{#snippet contextIcon()}<span style="display:inline-flex;line-height:1">Context clear</span>{/snippet}
{#snippet formattedCount(info: TextAreaCountInfo)}<strong>{info.count} of {info.maxLength ?? '∞'}</strong>{/snippet}

<section id="textarea-features-fixture">
  <h2>TextArea features</h2>
  <label>Textarea autosize<select bind:value={sizing}><option>off</option><option>auto</option><option>limits</option></select></label>
  <label>Textarea clear mode<select bind:value={clearMode}><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>Textarea clear disabled<select bind:value={clearDisabled}><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>Textarea clear icon<select bind:value={iconMode}><option>context</option><option>custom</option><option>falsy</option></select></label>
  <label>Textarea variant<select bind:value={variant}><option>inherit</option><option>outlined</option><option>filled</option><option>borderless</option><option>underlined</option></select></label>
  <label>Textarea feature size<select bind:value={size}><option>small</option><option>middle</option><option>large</option></select></label>
  <label>Textarea wrap<select bind:value={wrap}><option>soft</option><option>off</option></select></label>
  <label>Textarea soft maximum<input type="number" bind:value={max} /></label>
  <label><input type="checkbox" bind:checked={show} /> Show textarea count</label>
  <label><input type="checkbox" bind:checked={countEnabled} /> Configure textarea count</label>
  <label><input type="checkbox" bind:checked={strategy} /> Count textarea codepoints</label>
  <label><input type="checkbox" bind:checked={clip} /> Clip textarea exceed</label>
  <label><input type="checkbox" bind:checked={richCount} /> Rich textarea count</label>
  <label><input type="checkbox" bind:checked={nativeLimit} /> Native textarea maximum</label>
  <label><input type="checkbox" bind:checked={contextDisabled} /> Context clear disabled</label>
  <label><input type="checkbox" bind:checked={disabled} /> Feature textarea disabled</label>
  <label><input type="checkbox" bind:checked={readonly} /> Feature textarea readonly</label>
  <label><input type="checkbox" bind:checked={bordered} /> Legacy textarea bordered</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark textarea feature theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact textarea feature theme</label>
  <label><input type="checkbox" bind:checked={semantic} /> Custom textarea semantics</label>
  <label><input type="checkbox" bind:checked={manual} /> Manual textarea resize</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount feature textarea</label>
  <label><input type="checkbox" bind:checked={formAuto} /> Autosize counted textarea</label>
  <button type="button" onclick={() => { value = 'Parent replacement'; }}>Replace feature textarea</button>
  <button type="button" onclick={() => { value = 'a\nb\nc\nd\ne\nf'; }}>Set six textarea rows</button>
  <button type="button" onclick={() => { value = 'x'; }}>Set short textarea text</button>
  <button type="button" onclick={() => { events = []; }}>Clear textarea feature events</button>
  <button type="button" onclick={() => { saved?.target.setSelectionRange(0, 2); selection = `${nativeElement?.selectionStart}:${nativeElement?.selectionEnd}`; }}>Use textarea event selection</button>
  <button type="button" onclick={() => instance?.focus({ cursor: 'all' })}>Focus all textarea text</button>
  <button type="button" onpointerdown={event => event.preventDefault()} onclick={() => instance?.blur()}>Blur feature textarea</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} textArea={{ variant: 'filled', allowClear: { clearIcon: contextIcon, disabled: contextDisabled }, autoComplete: 'off', class: 'context-textarea', style: semantic ? 'color:red' : undefined, styles: semantic ? { root: 'color:orange', textarea: 'color:purple', count: 'color:green' } : undefined }}>
    <div style="max-width:420px;margin-bottom:36px">
      {#if mounted}<TextArea aria-label="Feature text" name="feature" rows={2} placeholder="Placeholder\nsecond line" bind:value {disabled} {readonly} {size} {bordered} {wrap}
        variant={variant === 'inherit' ? undefined : variant} autoSize={sizing === 'off' ? false : sizing === 'auto' ? true : { minRows: 2, maxRows: 4 }} allowClear={localClear} showCount={show} {count} maxLength={nativeLimit ? 10 : undefined}
        class="feature-textarea" rootClassName="owner-textarea" style={`${manual ? 'resize:both;height:120px;' : ''}${semantic ? 'color:blue;' : ''}`}
        classNames={semantic ? ({ props }) => ({ root: 'semantic-root', textarea: props.disabled ? 'semantic-disabled' : 'semantic-textarea', count: 'semantic-count', clear: 'semantic-clear' }) : undefined}
        styles={semantic ? { root: 'color:lime', textarea: 'color:cyan', count: 'font-weight:700', clear: 'font-size:18px' } : undefined}
        bind:nativeElement bind:rootElement={root} bind:this={instance}
        onValueChange={next => { events.push(`value:${next}`); }} onChange={event => { saved = event; events.push(`change:${event.type}:${event.target.value}:${event.nativeEvent.type}`); }}
        oninput={event => { events.push(`input:${event.currentTarget.value}`); }} onClear={() => { events.push('clear'); }}
        onResize={() => { resizes++; }} onFocus={() => { events.push('focus'); }} onBlur={() => { events.push('blur'); }}
      />{/if}
    </div>
    <Form {form}><FormItem name="counted" label="Counted description"><TextArea showCount autoSize={formAuto ? { minRows: 1, maxRows: 3 } : false} value={form.values.counted} onValueChange={value => form.setFieldValue('counted', value)} /></FormItem><button type="submit">Validate counted textarea</button><button type="reset">Reset counted textarea</button></Form>
  </ConfigProvider>
  <output aria-label="Textarea feature value">{value}</output><output aria-label="Textarea feature events">{events.join('|')}</output><output aria-label="Textarea resizes">{resizes}</output>
  <output aria-label="Textarea feature refs">{nativeElement?.tagName}:{root?.tagName}</output><output aria-label="Textarea saved event">{saved?.type}:{saved?.target.value}:{saved ? saved.target instanceof HTMLTextAreaElement : false}</output><output aria-label="Textarea event selection">{selection}</output>
</section>
