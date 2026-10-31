<script lang="ts">
  import {
    ConfigProvider,
    InputPassword,
    Form,
    FormItem,
    SpaceCompact,
    createForm,
    type InputVariant
  } from 'antd-svelte';

  let value = $state('secret');
  let mounted = $state(true);
  let mode = $state<'uncontrolled' | 'controlled' | 'reject'>('uncontrolled');
  let parentVisible = $state(false);
  let action = $state<'click' | 'hover'>('click');
  let showToggle = $state(true);
  let tabIndex = $state(0);
  let readonly = $state(false);
  let disabled = $state<boolean | undefined>();
  let size = $state<'inherit' | 'small' | 'medium' | 'large'>('inherit');
  let variant = $state<InputVariant | 'inherit'>('inherit');
  let bordered = $state(true);
  let passwordConfig = $state(true);
  let contextIcon = $state(false);
  let iconMode = $state<'default' | 'local' | 'snippet' | 'empty'>('default');
  let suffix = $state(true);
  let addons = $state(false);
  let semantic = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let formDisabled = $state(false);
  let events = $state<string[]>([]);
  let selectEvents = $state(0);
  let visibilityEvents = $state<boolean[]>([]);
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLElement>();
  let selection = $state('');
  let data = $state('');
  let instance: {
    focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all' }): void;
    blur(): void;
    select(): void;
    setSelectionRange(start: number, end: number): void;
  } | undefined = $state();
  const form = createForm({
    initialValues: { password: '' },
    rules: { password: [{ required: true, message: 'Password required' }] }
  });

  function handleVisibility(next: boolean) {
    visibilityEvents.push(next);
    if (mode === 'controlled') parentVisible = next;
  }

  function readSelection() {
    selection = `${inputElement?.selectionStart}:${inputElement?.selectionEnd}`;
  }
</script>

{#snippet customIcon()}<strong>Rich password icon</strong>{/snippet}

<section id="input-password-fixture">
  <h2>InputPassword</h2>
  <label><input type="checkbox" bind:checked={mounted} /> Mount password</label>
  <label>Password visibility mode<select bind:value={mode}>
    <option>uncontrolled</option><option>controlled</option><option>reject</option>
  </select></label>
  <label><input type="checkbox" bind:checked={parentVisible} /> Parent password visible</label>
  <label>Password action<select bind:value={action}><option>click</option><option>hover</option></select></label>
  <label><input type="checkbox" bind:checked={showToggle} /> Show password toggle</label>
  <label>Password toggle tab index<input type="number" bind:value={tabIndex} /></label>
  <label><input type="checkbox" bind:checked={readonly} /> Password readonly</label>
  <label>Password disabled override<select
    value={disabled === undefined ? 'inherit' : String(disabled)}
    onchange={event => {
      disabled = event.currentTarget.value === 'inherit'
        ? undefined
        : event.currentTarget.value === 'true';
    }}
  ><option>inherit</option><option>true</option><option>false</option></select></label>
  <label>Password size<select bind:value={size}>
    <option>inherit</option><option>small</option><option>medium</option><option>large</option>
  </select></label>
  <label>Password variant<select bind:value={variant}>
    <option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label><input type="checkbox" bind:checked={bordered} /> Password bordered</label>
  <label><input type="checkbox" bind:checked={passwordConfig} /> Password component config</label>
  <label><input type="checkbox" bind:checked={contextIcon} /> Context password icon</label>
  <label>Password icon<select bind:value={iconMode}>
    <option>default</option><option>local</option><option>snippet</option><option>empty</option>
  </select></label>
  <label><input type="checkbox" bind:checked={suffix} /> Password suffix</label>
  <label><input type="checkbox" bind:checked={addons} /> Password addons</label>
  <label><input type="checkbox" bind:checked={semantic} /> Password semantics</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark password theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact password theme</label>
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable password form</label>
  <button type="button" onclick={() => { value = 'replacement'; }}>Replace password</button>
  {#each ['start', 'end', 'all'] as cursor}
    <button
      type="button"
      onclick={() => {
        instance?.focus({ cursor: cursor as 'start' | 'end' | 'all' });
        readSelection();
      }}
    >Focus password {cursor}</button>
  {/each}
  <button type="button" onclick={() => {
    instance?.select();
    readSelection();
  }}>Select password</button>
  <button type="button" onclick={() => {
    instance?.setSelectionRange(1, 3);
    readSelection();
  }}>Set password selection</button>
  <button type="button" onmousedown={event => event.preventDefault()} onclick={() => instance?.blur()}>Blur password</button>
  <button type="button" onclick={() => {
    if (inputElement?.form) data = String(new FormData(inputElement.form).get('password'));
  }}>Read password FormData</button>

  <ConfigProvider
    componentSize="large"
    theme={{ mode: dark ? 'dark' : 'light', primary: 'green', compact }}
    input={{
      variant: 'filled',
      autoComplete: 'off',
      class: 'base-input',
      classNames: { root: 'base-root', input: 'base-field' },
      styles: semantic ? { root: 'color:orange', input: 'color:purple' } : undefined
    }}
    inputPassword={passwordConfig ? {
      variant: 'underlined',
      class: 'password-context',
      style: semantic ? 'color:red' : undefined,
      classNames: ({ props }) => ({
        root: props.disabled ? 'context-disabled' : 'context-root',
        input: 'context-field'
      }),
      styles: semantic ? { root: 'color:yellow', input: 'color:green' } : undefined,
      iconRender: contextIcon ? visible => visible ? 'CONTEXT OPEN' : 'CONTEXT CLOSED' : undefined
    } : undefined}
  >
    <form onsubmit={event => {
      event.preventDefault();
      events.push('submit');
    }} style="max-width:420px">
      {#if mounted}<InputPassword
        aria-label="Password"
        name="password"
        class="password-field"
        rootClassName="password-owner"
        bind:value
        bind:inputElement
        bind:nativeElement
        bind:this={instance}
        {disabled}
        {readonly}
        {action}
        {bordered}
        size={size === 'inherit' ? undefined : size}
        variant={variant === 'inherit' ? undefined : variant}
        prefix="BEFORE"
        suffix={suffix ? 'AFTER' : undefined}
        addonBefore={addons ? 'ACCOUNT' : undefined}
        addonAfter={addons ? 'SUFFIX' : undefined}
        visibilityToggle={showToggle ? {
          visible: mode === 'uncontrolled' ? undefined : parentVisible,
          tabIndex,
          onVisibleChange: handleVisibility
        } : false}
        iconRender={iconMode === 'local'
          ? visible => visible ? 'LOCAL OPEN' : 'LOCAL CLOSED'
          : iconMode === 'snippet'
            ? () => customIcon
            : iconMode === 'empty' ? () => null : undefined}
        allowClear
        showCount
        required
        maxLength={24}
        classNames={semantic ? ({ props }) => ({
          root: `local-${props.variant}`,
          input: 'local-field'
        }) : undefined}
        styles={semantic ? { root: 'color:lime', input: 'color:cyan' } : undefined}
        style={semantic ? 'color:blue' : undefined}
        onValueChange={next => { events.push(`value:${next}`); }}
        onChange={event => { events.push(`change:${event.type}:${event.target.value}`); }}
        oninput={() => { events.push('input'); }}
        onClear={() => { events.push('clear'); }}
        onselect={() => { selectEvents++; }}
        onPressEnter={() => { events.push('enter'); }}
      />{/if}
    </form>
    <ConfigProvider><InputPassword aria-label="Inherited password config" defaultValue="inherit" /></ConfigProvider>
    <ConfigProvider inputPassword={{ variant: 'borderless' }} locale={{ global: { show: 'Reveal' } }}>
      <InputPassword aria-label="Replaced password config" defaultValue="replace" />
    </ConfigProvider>
    <Form {form} disabled={formDisabled}>
      <FormItem name="password" label="Form password"><SpaceCompact size="small"><InputPassword
        value={form.values.password}
        onValueChange={next => form.setFieldValue('password', next)}
      /></SpaceCompact></FormItem>
      <button type="submit">Validate password</button><button type="reset">Reset password</button>
    </Form>
  </ConfigProvider>
  <output aria-label="Password value">{value}</output>
  <output aria-label="Password events">{events.join('|')}</output>
  <output aria-label="Password select events">{selectEvents}</output>
  <output aria-label="Visibility events">{visibilityEvents.join('|')}</output>
  <output aria-label="Password refs">{inputElement?.tagName}:{nativeElement?.tagName}</output>
  <output aria-label="Password selection">{selection}</output>
  <output aria-label="Password FormData">{data}</output>
</section>
