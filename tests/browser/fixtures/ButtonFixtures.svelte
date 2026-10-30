<script lang="ts">
  import { Button, ButtonGroup, ConfigProvider, SpaceCompact } from 'antd-svelte';
  import type {
    ButtonColor,
    ButtonType,
    ButtonVariant,
    ButtonShape,
    ButtonLoading
  } from 'antd-svelte';

  let type = $state<ButtonType | undefined>();
  let color = $state<ButtonColor | undefined>();
  let variant = $state<ButtonVariant | undefined>();
  let shape = $state<ButtonShape | undefined>();
  let loadingMode = $state('none');
  let loading = $derived<ButtonLoading>(
    loadingMode === 'immediate'
      ? true
      : loadingMode === 'delayed'
        ? { delay: 200 }
        : loadingMode === 'custom' ? { icon: loadingIcon } : false
  );
  let icon = $state(false);
  let end = $state(false);
  let ghost = $state(false);
  let danger = $state(false);
  let link = $state(false);
  let disabled = $state(false);
  let submit = $state(false);
  let configured = $state(false);
  let nestedReset = $state(false);
  let styled = $state(false);
  let chinese = $state(false);
  let autoInsert = $state(true);
  let autoFocusMounted = $state(false);
  let clicks = $state(0);
  let submissions = $state(0);
</script>
{#snippet actionIcon()}<span aria-hidden="true">★</span>{/snippet}
{#snippet loadingIcon()}<span data-testid="button-custom-spinner">Busy</span>{/snippet}
{#snippet contextIcon()}<span data-testid="button-context-spinner">Context busy</span>{/snippet}
{#snippet textContent()}{chinese ? '按钮' : 'Button action'}{/snippet}
<section id="button-fixture" aria-label="Button fixture">
  <label>Button type <select aria-label="Button type" bind:value={type}><option value={undefined}>Auto</option><option>default</option><option>primary</option><option>dashed</option><option>text</option><option>link</option></select></label>
  <label>Button color <select aria-label="Button color" bind:value={color}><option
    value={undefined}
  >Auto</option><option>default</option><option>primary</option><option>danger</option><option>green</option><option>purple</option><option>pink</option></select></label>
  <label>Button variant <select aria-label="Button variant" bind:value={variant}><option
    value={undefined}
  >Auto</option><option>outlined</option><option>solid</option><option>dashed</option><option>filled</option><option>text</option><option>link</option></select></label>
  <label>Button shape <select aria-label="Button shape" bind:value={shape}><option
    value={undefined}
  >Auto</option><option>default</option><option>circle</option><option>round</option><option>square</option></select></label>
  <label>Button loading <select aria-label="Button loading" bind:value={loadingMode}><option>none</option><option>immediate</option><option>delayed</option><option>custom</option></select></label>
  <label><input type="checkbox" bind:checked={icon} /> Button icon</label>
  <label><input type="checkbox" bind:checked={end} /> End Button icon</label>
  <label><input type="checkbox" bind:checked={ghost} /> Ghost Button</label>
  <label><input type="checkbox" bind:checked={danger} /> Danger Button</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable Button</label>
  <label><input type="checkbox" bind:checked={link} /> Link Button href</label>
  <label><input type="checkbox" bind:checked={submit} /> Submit Button</label>
  <label><input type="checkbox" bind:checked={configured} /> Configure Button defaults</label>
  <label><input type="checkbox" bind:checked={nestedReset} /> Reset nested Button config</label>
  <label><input type="checkbox" bind:checked={styled} /> Semantic Button styles</label>
  <label><input type="checkbox" bind:checked={chinese} /> Chinese Button text</label>
  <label><input type="checkbox" bind:checked={autoInsert} /> Insert Chinese space</label>
  <label><input type="checkbox" bind:checked={autoFocusMounted} /> Mount autofocus Button</label>
  <output aria-label="Button clicks">{clicks}</output><output aria-label="Button submissions">{submissions}</output>
  <ConfigProvider
    button={configured
      ? {
        color: 'green',
        variant: 'filled',
        shape: 'round',
        loadingIcon: contextIcon,
        class: 'configured-button',
        styles: { root: 'color:red', icon: 'color:rgb(1,2,3)' },
        style: 'color:green',
        classNames: { root: 'configured-root', icon: 'configured-icon' }
      }
      : undefined}
  >
    <form
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Button
        id="fixture-button"
        children={textContent}
        {type}
        {color}
        {variant}
        {shape}
        {loading}
        {ghost}
        {danger}
        {disabled}
        autoInsertSpace={autoInsert}
        icon={icon ? actionIcon : undefined}
        iconPlacement={end ? 'end' : undefined}
        iconPosition="start"
        href={link ? '#button-target' : undefined}
        htmlType={submit ? 'submit' : 'button'}
        onclick={() => { clicks++; }}
        classNames={styled ? { root: 'local-button', content: 'local-content' } : undefined}
        styles={styled ? { root: 'color:blue', icon: 'color:orange' } : undefined}
        style={styled ? 'color:purple' : undefined}
      />
    </form>
    <ConfigProvider button={nestedReset ? {} : undefined}><Button id="button-nested-config">Nested Button</Button></ConfigProvider>
  </ConfigProvider>
  <Button id="button-scalar-cn" children="按钮" />
  <Button id="button-scalar-zero" children={0} />
  <Button
    id="button-native-link"
    href="#button-target"
    onclick={event => { event.currentTarget.dataset.anchor = event.currentTarget.href; }}
  >Native link callback</Button>
  <ConfigProvider componentSize="large">
    <ButtonGroup id="button-group" size="small"><Button>Group small</Button><Button size="large">Group explicit large</Button><SpaceCompact
      size="large"
    ><Button>Compact over group</Button></SpaceCompact><ButtonGroup><Button>Nested group resets size</Button></ButtonGroup></ButtonGroup>
  </ConfigProvider>
  {#if autoFocusMounted}<Button id="button-autofocus" autoFocus>Autofocus Button</Button>{/if}
  <p id="button-target">Button target</p>
  <input aria-label="Outside Button draft" value="draft" />
</section>
