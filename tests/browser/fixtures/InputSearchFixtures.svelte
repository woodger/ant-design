<script lang="ts">
  import {
    ConfigProvider,
    InputSearch,
    Button,
    SpaceCompact,
    SpaceAddon,
    Form,
    FormItem,
    createForm,
    type InputSearchButtonContext,
    type InputVariant
  } from 'antd-svelte';

  let value = $state('query');
  let mounted = $state(true);
  let enterMode = $state<'icon' | 'primary' | 'text' | 'custom' | 'native'>('icon');
  let loading = $state(false);
  let disabled = $state<boolean | undefined>();
  let customDisabled = $state(false);
  let customLoading = $state(false);
  let size = $state<'inherit' | 'small' | 'medium' | 'large'>('inherit');
  let variant = $state<InputVariant | 'inherit'>('inherit');
  let contextVariant = $state<InputVariant | 'inherit'>('inherit');
  let bordered = $state(true);
  let semantic = $state(false);
  let contextIcon = $state(false);
  let localIcon = $state<'default' | 'custom' | 'empty'>('default');
  let after = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let hidden = $state(false);
  let formDisabled = $state(false);
  let events = $state<string[]>([]);
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
    initialValues: { query: '' },
    rules: { query: [{ required: true, message: 'Query required' }] }
  });

  function readSelection() {
    selection = `${inputElement?.selectionStart}:${inputElement?.selectionEnd}`;
  }
</script>

{#snippet customButton(context: InputSearchButtonContext)}
  <Button {...context.getButtonProps({
    class: 'custom-search-button',
    disabled: customDisabled,
    loading: customLoading,
    classNames: { root: 'own-button-root' },
    onmousedown: event => { events.push(`custom-down:${event.defaultPrevented}`); },
    onclick: () => { events.push('custom-click'); }
  })}>Custom search</Button>
{/snippet}
{#snippet nativeButton(context: InputSearchButtonContext)}
  <button {...context.getNativeProps({
    type: 'button',
    class: 'native-search-button',
    disabled: customDisabled,
    onmousedown: event => { events.push(`native-down:${event.defaultPrevented}`); },
    onclick: () => { events.push('native-click'); }
  })}>Native search</button>
{/snippet}
{#snippet afterContent()}<SpaceAddon>AFTER</SpaceAddon>{/snippet}
{#snippet contextSearchIcon()}<span>Context search icon</span>{/snippet}
{#snippet ownSearchIcon()}<span>Local search icon</span>{/snippet}

<section id="input-search-fixture">
  <h2>InputSearch</h2>
  <label><input type="checkbox" bind:checked={mounted} /> Mount search</label>
  <label>Search button mode<select bind:value={enterMode}>
    <option>icon</option><option>primary</option><option>text</option>
    <option>custom</option><option>native</option>
  </select></label>
  <label><input type="checkbox" bind:checked={loading} /> Search loading</label>
  <label>Search disabled override<select
    value={disabled === undefined ? 'inherit' : String(disabled)}
    onchange={event => {
      disabled = event.currentTarget.value === 'inherit'
        ? undefined
        : event.currentTarget.value === 'true';
    }}
  ><option>inherit</option><option>true</option><option>false</option></select></label>
  <label><input type="checkbox" bind:checked={customDisabled} /> Custom search disabled</label>
  <label><input type="checkbox" bind:checked={customLoading} /> Custom search loading</label>
  <label>Search size<select bind:value={size}>
    <option>inherit</option><option>small</option><option>medium</option><option>large</option>
  </select></label>
  <label>Search variant<select bind:value={variant}>
    <option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label>Context search variant<select bind:value={contextVariant}>
    <option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label><input type="checkbox" bind:checked={bordered} /> Search bordered</label>
  <label><input type="checkbox" bind:checked={semantic} /> Search semantics</label>
  <label><input type="checkbox" bind:checked={contextIcon} /> Context search icon</label>
  <label>Search icon<select bind:value={localIcon}>
    <option>default</option><option>custom</option><option>empty</option>
  </select></label>
  <label><input type="checkbox" bind:checked={after} /> Search trailing addon</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark search theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact search theme</label>
  <label><input type="checkbox" bind:checked={hidden} /> Hide search root</label>
  <label><input type="checkbox" bind:checked={formDisabled} /> Disable search form</label>
  <button type="button" onclick={() => { value = 'replacement'; }}>Replace search value</button>
  <button type="button" onclick={() => { events = []; }}>Clear search events</button>
  <button type="button" onclick={() => {
    instance?.focus({ cursor: 'all' });
    readSelection();
  }}>Focus search all</button>
  <button type="button" onclick={() => {
    instance?.setSelectionRange(1, 3);
    readSelection();
  }}>Set search selection</button>
  <button type="button" onclick={() => {
    instance?.select();
    readSelection();
  }}>Select search text</button>
  <button type="button" onmousedown={event => event.preventDefault()} onclick={() => instance?.blur()}>Blur search</button>
  <button type="button" onclick={() => {
    if (inputElement?.form) data = String(new FormData(inputElement.form).get('query'));
  }}>Read search FormData</button>
  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', primary: 'green', compact }}
    input={{ variant: 'filled', autoComplete: 'off', class: 'base-search-input' }}
    inputSearch={{
      variant: contextVariant === 'inherit' ? undefined : contextVariant,
      class: 'search-context',
      style: semantic ? 'color:orange' : undefined,
      classNames: { root: 'context-root', button: 'context-button' },
      styles: semantic ? { root: 'color:red', button: { root: 'color:red' } } : undefined,
      searchIcon: contextIcon ? contextSearchIcon : undefined
    }}
  >
    <form onsubmit={event => event.preventDefault()} style="max-width:420px">
      {#if mounted}<InputSearch
        aria-label="Search query"
        name="query"
        class="search-field"
        rootClassName="search-input-owner"
        data-identity="search-root"
        bind:value
        bind:inputElement
        bind:nativeElement
        bind:this={instance}
        {loading}
        {disabled}
        {bordered}
        {hidden}
        size={size === 'inherit' ? undefined : size}
        variant={variant === 'inherit' ? undefined : variant}
        enterButton={enterMode === 'icon' ? false : enterMode === 'primary' ? true
          : enterMode === 'custom' ? customButton : enterMode === 'native' ? nativeButton : 'Find'}
        searchIcon={localIcon === 'custom' ? ownSearchIcon : localIcon === 'empty' ? null : undefined}
        prefix="PREFIX"
        suffix="SUFFIX"
        addonAfter={after ? afterContent : undefined}
        allowClear
        showCount
        required
        maxLength={24}
        classNames={semantic ? ({ props }) => ({
          root: props.enterButton ? 'local-with-button' : 'local-icon-only',
          input: 'semantic-search-input',
          count: 'semantic-count',
          button: { root: 'semantic-button', icon: 'semantic-button-icon' }
        }) : undefined}
        styles={semantic ? {
          root: 'color:lime',
          input: 'color:cyan',
          button: { root: 'color:blue' }
        } : undefined}
        style={semantic ? 'color:purple' : undefined}
        onValueChange={next => { events.push(`value:${next}`); }}
        onChange={event => { events.push(`change:${event.type}:${event.target.value}`); }}
        oninput={() => { events.push('input'); }}
        onSearch={(next, event, info) => { events.push(`search:${info?.source}:${event?.type}:${next}`); }}
        onPressEnter={() => { events.push('enter'); }}
        onClear={() => { events.push('clear'); }}
      />{/if}
    </form>
    <ConfigProvider><InputSearch aria-label="Inherited search config" /></ConfigProvider>
    <ConfigProvider inputSearch={{ searchIcon: 'Replaced search icon' }}>
      <InputSearch aria-label="Replaced search config" />
    </ConfigProvider>
    <Form {form} disabled={formDisabled}>
      <FormItem name="query" label="Form query"><SpaceCompact size="small"><InputSearch
        value={form.values.query}
        onValueChange={next => form.setFieldValue('query', next)}
      /></SpaceCompact></FormItem>
      <button type="submit">Validate query</button><button type="reset">Reset query</button>
    </Form>
  </ConfigProvider>
  <output aria-label="Search value">{value}</output>
  <output aria-label="Search events">{events.join('|')}</output>
  <output aria-label="Search refs">{inputElement?.tagName}:{nativeElement?.tagName}</output>
  <output aria-label="Search selection">{selection}</output>
  <output aria-label="Search FormData">{data}</output>
</section>
