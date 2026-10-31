<script lang="ts">
  import {
    ConfigProvider,
    InputOTP,
    SpaceCompact,
    Form,
    FormItem,
    createForm,
    type ComponentSize,
    type InputVariant
  } from 'antd-svelte';

  let mounted = $state(true);
  let mode = $state<'local' | 'external' | 'linked'>('local');
  let externalValue = $state('');
  let defaultValue = $state('');
  let length = $state(6);
  let format = $state<'none' | 'digits' | 'upper'>('none');
  let mask = $state<'none' | 'bullet' | 'star' | 'emoji'>('none');
  let type = $state<'inherit' | 'text' | 'number'>('inherit');
  let separator = $state<'none' | 'dash' | 'zero' | 'indexed' | 'rich' | 'empty'>('none');
  let autoFocus = $state(false);
  let autoComplete = $state(true);
  let disabled = $state<boolean | undefined>();
  let size = $state<'inherit' | 'small' | 'medium' | 'large'>('inherit');
  let contextSize = $state<ComponentSize | 'inherit'>('inherit');
  let variant = $state<InputVariant | 'inherit'>('inherit');
  let contextVariant = $state<InputVariant | 'inherit'>('inherit');
  let semantic = $state(false);
  let inheritedClear = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let formDisabled = $state(false);
  let events = $state<string[]>([]);
  let focusEvents = $state<string[]>([]);
  let selectEvents = $state(0);
  let nativeInputs = $state(0);
  let nativeElement = $state<HTMLDivElement>();
  let instance: { focus(): void; blur(): void; } | undefined = $state();
  const form = createForm({
    initialValues: { code: '' },
    rules: { code: [{ required: true, message: 'OTP required' }] }
  });
</script>

{#snippet richSeparator(index: number)}<strong>/{index}/</strong>{/snippet}

<section id="input-otp-fixture">
  <h2>InputOTP</h2>
  <label><input type="checkbox" bind:checked={mounted} /> Mount OTP</label>
  <label>OTP mode<select bind:value={mode}>
    <option>local</option><option>external</option><option>linked</option>
  </select></label>
  <label>OTP external value<input bind:value={externalValue} /></label>
  <label>OTP default value<input bind:value={defaultValue} /></label>
  <label>OTP length<input type="number" bind:value={length} /></label>
  <label>OTP formatter<select bind:value={format}>
    <option>none</option><option>digits</option><option>upper</option>
  </select></label>
  <label>OTP mask<select bind:value={mask}>
    <option>none</option><option>bullet</option><option>star</option><option>emoji</option>
  </select></label>
  <label>OTP type<select bind:value={type}>
    <option>inherit</option><option>text</option><option>number</option>
  </select></label>
  <label>OTP separator<select bind:value={separator}>
    <option>none</option><option>dash</option><option>zero</option>
    <option>indexed</option><option>rich</option><option>empty</option>
  </select></label>
  <label><input type="checkbox" bind:checked={autoFocus} /> Autofocus OTP</label>
  <label><input type="checkbox" bind:checked={autoComplete} /> OTP autocomplete</label>
  <label>OTP disabled override<select
    value={disabled === undefined ? 'inherit' : String(disabled)}
    onchange={event => {
      disabled = event.currentTarget.value === 'inherit'
        ? undefined : event.currentTarget.value === 'true';
    }}
  ><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>OTP size<select bind:value={size}>
    <option>inherit</option><option>small</option><option>medium</option><option>large</option>
  </select></label>
  <label>Context OTP size<select bind:value={contextSize}>
    <option>inherit</option><option>small</option><option>middle</option><option>large</option>
  </select></label>
  <label>OTP variant<select bind:value={variant}>
    <option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label>Context OTP variant<select bind:value={contextVariant}>
    <option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label><input type="checkbox" bind:checked={semantic} /> OTP semantics</label>
  <label><input type="checkbox" bind:checked={inheritedClear} /> Inherit OTP clear controls</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark OTP theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact OTP theme</label>
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable OTP form</label>
  <button type="button" onclick={() => { events = []; }}>Clear OTP events</button>
  <button type="button" onclick={() => { selectEvents = 0; }}>Clear OTP selections</button>
  <button type="button" onclick={() => instance?.focus()}>Focus OTP</button>
  <button type="button" onmousedown={event => event.preventDefault()} onclick={() => instance?.blur()}>Blur OTP</button>

  <ConfigProvider
    componentSize={contextSize === 'inherit' ? undefined : contextSize}
    theme={{ mode: dark ? 'dark' : 'light', primary: 'green', compact }}
    input={{
      variant: 'underlined',
      autoComplete: 'off',
      allowClear: inheritedClear,
      class: 'input-context'
    }}
    otp={{
      variant: contextVariant === 'inherit' ? undefined : contextVariant,
      class: 'otp-context',
      classNames: { root: 'context-root', input: 'context-cell', separator: 'context-separator' },
      styles: semantic ? { root: 'color:orange', input: 'color:green' } : undefined,
      style: semantic ? 'color:red' : undefined
    }}
  >
    {#if mounted}<InputOTP
      class="otp-field"
      rootClassName="otp-owner"
      aria-label="Verification code"
      data-identity="otp-root"
      bind:nativeElement
      bind:this={instance}
      {length}
      {defaultValue}
      value={mode === 'local' ? undefined : externalValue}
      formatter={format === 'digits' ? text => text.replace(/\D/g, '')
        : format === 'upper' ? text => text.toUpperCase() : undefined}
      mask={mask === 'bullet' ? true : mask === 'star' ? '*' : mask === 'emoji' ? '🔒' : false}
      type={type === 'inherit' ? undefined : type}
      {autoFocus}
      autoComplete={autoComplete ? 'one-time-code' : undefined}
      inputMode="numeric"
      {disabled}
      size={size === 'inherit' ? undefined : size}
      variant={variant === 'inherit' ? undefined : variant}
      separator={separator === 'dash' ? '-' : separator === 'zero' ? 0
        : separator === 'indexed' ? index => index
          : separator === 'rich' ? () => richSeparator : separator === 'empty' ? '' : undefined}
      classNames={semantic ? ({ props }) => ({
        root: `local-${props.variant}-${props.length}`,
        input: 'local-cell',
        separator: 'local-separator'
      }) : undefined}
      styles={semantic ? { root: 'color:lime', input: 'color:cyan', separator: 'color:blue' } : undefined}
      style={semantic ? 'color:purple' : undefined}
      onInput={cells => { events.push(`input:${JSON.stringify(cells)}`); }}
      onChange={code => {
        events.push(`change:${code}`);
        if (mode === 'linked') externalValue = code;
      }}
      onFocus={event => { focusEvents.push(event.currentTarget.getAttribute('aria-label') ?? ''); }}
      onselect={() => { selectEvents++; }}
      oninput={() => { nativeInputs++; }}
    />{/if}

    <ConfigProvider><InputOTP length={2} defaultValue="ab" aria-label="Inherited OTP config" /></ConfigProvider>
    <ConfigProvider otp={{ variant: 'borderless' }}>
      <InputOTP length={2} aria-label="Replaced OTP config" />
    </ConfigProvider>
    <SpaceCompact size="small"><InputOTP length={2} aria-label="Compact OTP" /></SpaceCompact>
    <Form {form} disabled={formDisabled}>
      <FormItem name="code" label="Form code"><InputOTP
        value={form.values.code}
        onChange={code => form.setFieldValue('code', code)}
      /></FormItem>
      <button type="submit">Validate OTP</button><button type="reset">Reset OTP</button>
    </Form>
  </ConfigProvider>
  <output aria-label="OTP events">{events.join('|')}</output>
  <output aria-label="OTP focus events">{focusEvents.join('|')}</output>
  <output aria-label="OTP select events">{selectEvents}</output>
  <output aria-label="OTP native input events">{nativeInputs}</output>
  <output aria-label="OTP ref">{nativeElement?.tagName}</output>
  <output aria-label="OTP form value">{form.values.code}</output>
</section>
