<script module lang="ts">
  export type { InputSearchProps } from './input-search.types';
</script>

<script lang="ts">
  import Input from './Input.svelte';
  import Button from './Button.svelte';
  import SpaceCompact from './SpaceCompact.svelte';
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { useForm, useFormField } from './form-context';
  import type { ButtonSlots } from './button.types';
  import type { InputChangeEvent, InputContent, InputSemanticSlots } from './input.types';
  import type { InputSearchProps, InputSearchButtonContext } from './input-search.types';

  let {
    value = $bindable(),
    inputElement = $bindable(),
    nativeElement = $bindable(),
    enterButton = false,
    searchIcon,
    loading = false,
    disabled,
    size,
    variant,
    bordered,
    addonAfter,
    hidden,
    onSearch,
    onChange,
    onPressEnter,
    onCompositionStart,
    onCompositionEnd,
    class: className = '',
    style,
    classNames,
    styles,
    ...attributes
  }: InputSearchProps = $props();

  const config = useConfig();
  const compact = useCompact();
  const form = useForm();
  const field = useFormField();
  const slots = ['input', 'prefix', 'suffix', 'clear', 'count'] as const;
  let composing = false;
  let input: {
    focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }): void;
    blur(): void;
    select(): void;
    setSelectionRange(
      start: number,
      end: number,
      direction?: 'forward' | 'backward' | 'none'
    ): void;
  } | undefined = $state();

  let resolvedSize = $derived(size ?? compact?.size ?? config.explicitComponentSize);
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let buttonVariant = $derived(
    variant ?? (bordered === false ? 'borderless' : config.inputSearch?.variant)
  );
  let inputVariant = $derived(buttonVariant ?? config.input?.variant ?? 'outlined');
  let info = $derived<{ props: InputSearchProps; }>({
    props: {
      ...attributes,
      value,
      inputElement,
      nativeElement,
      enterButton,
      searchIcon,
      loading,
      disabled,
      size,
      variant: buttonVariant,
      bordered,
      addonAfter,
      hidden,
      onSearch,
      onChange,
      onPressEnter,
      onCompositionStart,
      onCompositionEnd,
      class: className,
      style,
      classNames,
      styles
    }
  });
  let contextClasses = $derived(
    typeof config.inputSearch?.classNames === 'function'
      ? config.inputSearch.classNames(info)
      : config.inputSearch?.classNames
  );
  let localClasses = $derived(typeof classNames === 'function' ? classNames(info) : classNames);
  let contextStyles = $derived(
    typeof config.inputSearch?.styles === 'function'
      ? config.inputSearch.styles(info)
      : config.inputSearch?.styles
  );
  let localStyles = $derived(typeof styles === 'function' ? styles(info) : styles);
  let inputClasses = $derived<InputSemanticSlots>(Object.fromEntries(slots.map(slot => [
    slot,
    [contextClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ')
  ])));
  let inputStyles = $derived<InputSemanticSlots>(Object.fromEntries(slots.map(slot => [
    slot,
    [contextStyles?.[slot], localStyles?.[slot]].filter(Boolean).join(';')
  ])));
  let buttonClasses = $derived(mergeButtonSlots(contextClasses?.button, localClasses?.button, ' '));
  let buttonStyles = $derived(mergeButtonSlots(contextStyles?.button, localStyles?.button, ';'));
  let rootStyle = $derived(
    [contextStyles?.root, config.inputSearch?.style, localStyles?.root, style]
      .filter(Boolean).join(';')
  );
  let buttonClass = $derived([
    'ant-input-search-btn',
    buttonVariant && `ant-input-search-btn-${buttonVariant}`
  ].filter(Boolean).join(' '));
  let resolvedIcon = $derived(
    searchIcon !== undefined ? searchIcon : config.inputSearch?.searchIcon
  );
  let rootData = $derived(Object.fromEntries(Object.entries(attributes).filter(([key]) =>
    key.startsWith('data-')
  )));
  let inputAttributes = $derived(Object.fromEntries(Object.entries(attributes).filter(([key]) =>
    !key.startsWith('data-')
  )));
  let hasAfter = $derived(Boolean(addonAfter) && typeof addonAfter !== 'boolean');

  const buttonContext: InputSearchButtonContext = {
    getButtonProps(props = {}) {
      return {
        ...props,
        class: [buttonClass, props.class].filter(Boolean).join(' '),
        size: resolvedSize,
        disabled: blocked || props.disabled,
        loading: loading || props.loading,
        onmousedown: event => {
          props.onmousedown?.(event);
          handleMouseDown(event);
        },
        onclick: event => {
          (props.onclick ?? props.onClick)?.(event);
          handleSearch(event);
        }
      };
    },
    getNativeProps(props = {}) {
      const unavailable = blocked || props.disabled || loading;
      return {
        ...props,
        disabled: unavailable,
        onmousedown: event => {
          if (unavailable) return;
          props.onmousedown?.(event);
          handleMouseDown(event);
        },
        onclick: event => {
          if (unavailable) return;
          props.onclick?.(event);
          handleSearch(event);
        }
      };
    }
  };

  function mergeButtonSlots(
    context: ButtonSlots | string | undefined,
    local: ButtonSlots | string | undefined,
    separator: string
  ): ButtonSlots {
    const inherited = typeof context === 'string' ? { root: context } : context;
    const own = typeof local === 'string' ? { root: local } : local;
    return Object.fromEntries(['root', 'icon', 'content'].map(slot => [
      slot,
      [inherited?.[slot as keyof ButtonSlots], own?.[slot as keyof ButtonSlots]]
        .filter(Boolean).join(separator)
    ]));
  }

  function handleChange(event: InputChangeEvent) {
    if (event.type === 'click') onSearch?.(event.target.value, event, { source: 'clear' });
    onChange?.(event);
  }

  function handleMouseDown(event: MouseEvent) {
    if (inputElement && inputElement.ownerDocument.activeElement === inputElement)
      event.preventDefault();
  }

  function handleSearch(event: MouseEvent | KeyboardEvent) {
    onSearch?.(inputElement?.value ?? '', event, { source: 'input' });
  }

  const handlePressEnter: NonNullable<InputSearchProps['onPressEnter']> = event => {
    if (composing || loading) return;
    onPressEnter?.(event);
    handleSearch(event);
  };

  /** Фокусирует внутренний Input, включая cursor и preventScroll. */
  export function focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }) {
    input?.focus(options);
  }

  export function blur() {
    input?.blur();
  }

  export function select() {
    input?.select();
  }

  export function setSelectionRange(
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none'
  ) {
    input?.setSelectionRange(start, end, direction);
  }
</script>

<style>
  .anticon { display: inline-flex; align-items: center; line-height: 0; }
  svg { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
</style>

{#snippet content(node: InputContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}

{#snippet icon()}
  {#if resolvedIcon !== undefined}{@render content(resolvedIcon)}{:else}
    <!-- SearchOutlined из @ant-design/icons-svg 4.6.0 (MIT); vendor/LICENSE.ant-design-icons. -->
    <span class="anticon anticon-search" aria-hidden="true"><svg viewBox="64 64 896 896" fill="currentColor" focusable="false" aria-hidden="true">
      <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z" />
    </svg></span>
  {/if}
{/snippet}

{#snippet fieldControl()}
  <Input
    {...inputAttributes}
    bind:value
    bind:inputElement
    bind:nativeElement
    bind:this={input}
    type="search"
    size={resolvedSize}
    {disabled}
    {bordered}
    variant={inputVariant}
    classNames={inputClasses}
    styles={inputStyles}
    onChange={handleChange}
    onPressEnter={handlePressEnter}
    onCompositionStart={event => {
      composing = true;
      onCompositionStart?.(event);
    }}
    onCompositionEnd={event => {
      composing = false;
      onCompositionEnd?.(event);
    }}
  />
{/snippet}

{#snippet searchButton()}
  {#if typeof enterButton === 'function'}{@render enterButton(buttonContext)}{:else}
    <Button
      class={buttonClass}
      classNames={buttonClasses}
      styles={buttonStyles}
      color={enterButton ? 'primary' : 'default'}
      size={resolvedSize}
      disabled={blocked}
      {loading}
      icon={typeof enterButton === 'boolean' && (resolvedIcon === undefined || resolvedIcon)
        ? icon : undefined}
      variant={buttonVariant === 'borderless' || buttonVariant === 'filled' || buttonVariant === 'underlined'
        ? 'text'
        : enterButton ? 'solid' : undefined}
      aria-label={typeof enterButton === 'boolean' ? config.locale.searchText : undefined}
      onmousedown={handleMouseDown}
      onclick={handleSearch}
      children={typeof enterButton !== 'boolean' ? enterButton : undefined}
    />
  {/if}
{/snippet}

{#snippet afterContent()}{@render content(addonAfter)}{/snippet}

<SpaceCompact
  {...rootData}
  {hidden}
  class={[
    'ant-input-search ant-input-search-css-var',
    config.direction === 'rtl' && 'ant-input-search-rtl',
    resolvedSize && `ant-input-search-${resolvedSize}`,
    enterButton && 'ant-input-search-with-button',
    className,
    config.inputSearch?.class,
    contextClasses?.root,
    localClasses?.root
  ].filter(Boolean).join(' ')}
  style={rootStyle}
  items={[
    { key: 'input', children: fieldControl },
    { key: 'button', children: searchButton },
    ...(hasAfter ? [{ key: 'after', children: afterContent }] : [])
  ]}
/>
