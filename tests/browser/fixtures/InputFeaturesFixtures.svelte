<script lang="ts">
  import {
    ConfigProvider,
    Input,
    Form,
    FormItem,
    SpaceCompact,
    createForm,
    type InputChangeEvent,
    type InputCountInfo,
    type InputVariant,
    type InputAllowClear
  } from 'antd-svelte';

  let value = $state('😀demo');
  let mounted = $state(true);
  let before = $state(false);
  let after = $state(false);
  let prefix = $state(true);
  let suffix = $state(true);
  let show = $state(true);

  let clearMode = $state<'inherit' | 'true' | 'false'>('true');
  let clearDisabled = $state<'inherit' | 'true' | 'false'>('inherit');
  let iconMode = $state<'default' | 'context' | 'custom' | 'falsy'>('default');
  let contextDisabled = $state(false);
  let disabled = $state<boolean | undefined>();
  let readonly = $state(false);
  let hidden = $state(false);

  let dark = $state(false);
  let compact = $state(false);
  let size = $state<'small' | 'middle' | 'large'>('middle');
  let variant = $state<InputVariant | 'inherit'>('inherit');
  let bordered = $state(true);
  let semantic = $state(false);

  let countEnabled = $state(false);
  let max = $state(4);
  let strategy = $state(false);
  let clip = $state(false);
  let richCount = $state(false);
  let nativeLimit = $state(false);

  let type = $state<'text' | 'email' | 'password'>('text');
  let events = $state<string[]>([]);
  let saved = $state.raw<InputChangeEvent>();
  let enter = $state(0);
  let selection = $state('');
  let inputElement = $state<HTMLInputElement>();
  let root = $state<HTMLElement>();
  let formData = $state('');
  let formDisabled = $state(false);
  let instance: {
    focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all' }): void;
    blur(): void;
    select(): void;
    setSelectionRange(start: number, end: number): void;
  } | undefined = $state();

  const form = createForm({
    initialValues: { counted: '' },
    rules: { counted: [{ required: true, message: 'Counted input required' }] }
  });

  let localClear = $derived<boolean | InputAllowClear | undefined>(
    clearMode === 'inherit'
      ? undefined
      : clearMode === 'false'
        ? false
        : clearDisabled === 'inherit' && (iconMode === 'context' || iconMode === 'default')
          ? true
          : {
            disabled: clearDisabled === 'inherit' ? undefined : clearDisabled === 'true',
            clearIcon: iconMode === 'custom' ? clearIcon : iconMode === 'falsy' ? null : undefined
          }
  );
  let count = $derived(countEnabled ? {
    max,
    strategy: strategy ? (text: string) => [...text].length : undefined,
    exceedFormatter: clip
      ? (text: string, { max }: { max: number }) => strategy
        ? [...text].slice(0, max).join('')
        : text.slice(0, max)
      : undefined,
    show: richCount ? () => formattedCount : show
  } : undefined);

  function readData() {
    if (inputElement?.form) formData = String(new FormData(inputElement.form).get('feature'));
  }

  function readSelection() {
    selection = `${inputElement?.selectionStart}:${inputElement?.selectionEnd}`;
  }
</script>

{#snippet clearIcon()}<strong style="display:inline-flex;line-height:1">Custom input clear</strong>{/snippet}
{#snippet contextIcon()}<span style="display:inline-flex;line-height:1">Context input clear</span>{/snippet}
{#snippet formattedCount(info: InputCountInfo)}<strong>{info.count} of {info.maxLength ?? '∞'}</strong>{/snippet}
{#snippet prefixContent()}<span>Prefix</span>{/snippet}
{#snippet suffixContent()}<span>Suffix</span>{/snippet}
{#snippet isolatedAddon()}<Input aria-label="Isolated input addon" defaultValue="addon" />{/snippet}

<section id="input-features-fixture">
  <h2>Input features</h2>
  <label><input type="checkbox" bind:checked={mounted} /> Mount feature input</label>
  <label><input type="checkbox" bind:checked={prefix} /> Input prefix</label>
  <label><input type="checkbox" bind:checked={suffix} /> Input suffix</label>
  <label><input type="checkbox" bind:checked={before} /> Input addon before</label>
  <label><input type="checkbox" bind:checked={after} /> Input addon after</label>
  <label><input type="checkbox" bind:checked={show} /> Show input count</label>
  <label>Input clear mode<select bind:value={clearMode}><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>Input clear disabled<select bind:value={clearDisabled}><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>Input clear icon<select bind:value={iconMode}><option>default</option><option>context</option><option>custom</option><option>falsy</option></select></label>
  <label><input type="checkbox" bind:checked={contextDisabled} /> Context input clear disabled</label>
  <label>Input disabled override<select
    value={disabled === undefined ? 'inherit' : String(disabled)}
    onchange={event => {
      disabled = event.currentTarget.value === 'inherit'
        ? undefined
        : event.currentTarget.value === 'true';
    }}
  ><option>inherit</option><option>true</option><option>false</option></select></label>
  <label><input type="checkbox" bind:checked={readonly} /> Feature input readonly</label>
  <label><input type="checkbox" bind:checked={hidden} /> Feature input hidden</label>
  <label>Input variant<select bind:value={variant}><option>inherit</option><option>outlined</option><option>filled</option><option>borderless</option><option>underlined</option></select></label>
  <label>Input feature size<select bind:value={size}><option>small</option><option>middle</option><option>large</option></select></label>
  <label>Input feature type<select bind:value={type}><option>text</option><option>email</option><option>password</option></select></label>
  <label><input type="checkbox" bind:checked={bordered} /> Legacy input bordered</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark input feature theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact input feature theme</label>
  <label><input type="checkbox" bind:checked={semantic} /> Custom input semantics</label>
  <label><input type="checkbox" bind:checked={countEnabled} /> Configure input count</label>
  <label><input type="checkbox" bind:checked={strategy} /> Count input codepoints</label>
  <label><input type="checkbox" bind:checked={clip} /> Clip input exceed</label>
  <label><input type="checkbox" bind:checked={richCount} /> Rich input count</label>
  <label><input type="checkbox" bind:checked={nativeLimit} /> Native input maximum</label>
  <label>Input soft maximum<input type="number" bind:value={max} /></label>
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable counted input form</label>
  <button type="button" onclick={() => { value = 'Parent replacement'; }}>Replace feature input</button>
  <button type="button" onclick={() => { events = []; }}>Clear input feature events</button>
  <button
    type="button"
    onclick={() => {
      instance?.focus({ cursor: 'all' });
      readSelection();
    }}
  >Focus all input text</button>
  <button
    type="button"
    onclick={() => {
      instance?.focus({ cursor: 'start' });
      readSelection();
    }}
  >Focus input start</button>
  <button
    type="button"
    onclick={() => {
      instance?.focus({ cursor: 'end' });
      readSelection();
    }}
  >Focus input end</button>
  <button
    type="button"
    onclick={() => {
      instance?.select();
      readSelection();
    }}
  >Select input text</button>
  <button
    type="button"
    onclick={() => {
      instance?.setSelectionRange(1, 3);
      readSelection();
    }}
  >Set input selection</button>
  <button
    type="button"
    onclick={() => {
      saved?.target.setSelectionRange(0, 2);
      readSelection();
    }}
  >Use input event selection</button>
  <button
    type="button"
    onmousedown={event => event.preventDefault()}
    onclick={() => instance?.blur()}
  >Blur feature input</button>
  <button type="button" onclick={readData}>Read feature input FormData</button>
  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', primary: 'green', compact }}
    input={{
      variant: 'filled',
      allowClear: {
        clearIcon: iconMode === 'default' ? undefined : contextIcon,
        disabled: contextDisabled
      },
      autoComplete: 'off',
      class: 'context-input',
      style: semantic ? 'color:red' : undefined,
      styles: semantic
        ? { root: 'color:orange', input: 'color:purple', count: 'color:green' }
        : undefined
    }}
  >
    <form onsubmit={event => event.preventDefault()} style="max-width:420px">
      {#if mounted}<Input
        aria-label="Feature input"
        name="feature"
        bind:value
        {disabled}
        {readonly}
        {size}
        {type}
        {hidden}
        {bordered}
        htmlSize={12}
        prefix={prefix ? prefixContent : undefined}
        suffix={suffix ? suffixContent : undefined}
        addonBefore={before ? 'https://' : undefined}
        addonAfter={after ? '.org' : undefined}
        variant={variant === 'inherit' ? undefined : variant}
        allowClear={localClear}
        showCount={show}
        {count}
        maxLength={nativeLimit ? 10 : undefined}
        class="feature-input"
        rootClassName="owner-input"
        style={semantic ? 'color:blue' : undefined}
        data-input-feature="field-data"
        classNames={semantic ? ({ props }) => ({
          root: props.disabled ? 'semantic-disabled' : 'semantic-root',
          input: 'semantic-input',
          count: 'semantic-count',
          prefix: 'semantic-prefix',
          suffix: 'semantic-suffix',
          clear: 'semantic-clear'
        }) : undefined}
        styles={semantic ? {
          root: 'color:lime',
          input: 'color:cyan',
          count: 'font-weight:700',
          prefix: 'font-weight:700',
          suffix: 'font-style:italic'
        } : undefined}
        bind:inputElement
        bind:nativeElement={root}
        bind:this={instance}
        onValueChange={next => {
          events.push(`value:${next}`);
        }}
        onChange={event => {
          saved = event;
          events.push(`change:${event.type}:${event.target.value}:${event.nativeEvent.type}`);
        }}
        oninput={event => {
          events.push(`input:${event.currentTarget.value}`);
        }}
        onchange={() => {
          events.push('native-change');
        }}
        onClear={() => {
          events.push('clear');
        }}
        onPressEnter={() => {
          enter++;
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') events.push('keydown');
        }}
        onKeyUp={event => {
          if (event.key === 'Enter') events.push('keyup');
        }}
        onCompositionEnd={() => {
          events.push('composition-end');
        }}
      />{/if}
    </form>
    <Form {form} disabled={formDisabled}><FormItem name="counted" label="Counted input"><SpaceCompact
      size="small"
    ><Input
      showCount
      allowClear
      addonBefore={isolatedAddon}
      value={form.values.counted}
      onValueChange={value => form.setFieldValue('counted', value)}
    /></SpaceCompact></FormItem><button type="submit">Validate counted input</button><button
      type="reset"
    >Reset counted input</button></Form>
    <ConfigProvider><Input aria-label="Inherited input config" defaultValue="inherited" /></ConfigProvider>
    <ConfigProvider input={{ variant: 'underlined', allowClear: false }}><Input
      aria-label="Replaced input config"
    /></ConfigProvider>
  </ConfigProvider>
  <output aria-label="Input feature value">{value}</output><output
    aria-label="Input feature events"
  >{events.join('|')}</output>
  <output aria-label="Input feature refs">{inputElement?.tagName}:{root?.tagName}</output><output
    aria-label="Input saved event"
  >{saved?.type}:{saved?.target.value}:{saved ? saved.target.tagName : ''}</output>
  <output aria-label="Input feature enter">{enter}</output><output
    aria-label="Input feature selection"
  >{selection}</output><output
    aria-label="Input feature FormData"
  >{formData}</output>
</section>
