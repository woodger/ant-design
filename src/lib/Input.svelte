<script module lang="ts">
  export type { InputProps } from './input.types';
</script>

<script lang="ts">
  import { onDestroy, onMount, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm, useFormField } from './form-context';
  import { inputCountInfo, inputExceedValue, resolveInputClear } from './input-count.engine';
  import { inputChangeEvent } from './input-event.dom';
  import type { InputProps, InputContent } from './input.types';
  import Icon from './Icon.svelte';
  import InputAddonContent from './InputAddonContent.svelte';

  let {
    value = $bindable(),
    defaultValue,
    size,
    htmlSize,
    status,
    variant,
    bordered = true,
    disabled,
    readonly,
    readOnly,
    id,
    name,
    type = 'text',
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    allowClear,
    showCount,
    count,
    maxLength,
    autoComplete,
    autoFocus,
    classNames,
    styles,
    style,
    hidden,
    onValueChange,
    onChange,
    onClear,
    onPressEnter,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onCompositionStart,
    onCompositionEnd,
    oninput,
    onkeydown,
    onkeyup,
    onblur,
    onfocus,
    oncompositionstart,
    oncompositionend,
    inputElement = $bindable(),
    nativeElement = $bindable(),
    rootClassName = '',
    class: className = '',
    ...attributes
  }: InputProps = $props();

  const config = useConfig();
  const compact = useCompact();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => defaultValue);
  let useDefault = $state(true);
  let focused = $state(false);
  let composing = false;
  let keyLock = false;
  let alive = true;
  let affix = $state<HTMLSpanElement>();
  let group = $state<HTMLSpanElement>();
  const passwordTimers = new Set<ReturnType<typeof setTimeout>>();

  let text = $derived(String(value ?? (useDefault ? initialDefault : '') ?? ''));
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let read = $derived(readonly ?? readOnly);
  let appearance = $derived(
    variant ?? (bordered === false ? 'borderless' : config.input?.variant ?? 'outlined')
  );
  let clear = $derived(resolveInputClear(allowClear, config.input?.allowClear));
  let maximum = $derived(maxLength ?? attributes.maxlength ?? undefined);
  let counter = $derived(inputCountInfo(text, count, showCount, maximum));
  let wrapped = $derived(Boolean(prefix || suffix || clear || counter.show));
  let grouped = $derived(Boolean(addonBefore || addonAfter));
  let canClear = $derived(Boolean(clear && !clear.disabled && !blocked && !read && text));
  let info = $derived({
    props: {
      ...attributes,
      value,
      defaultValue,
      size: resolvedSize,
      htmlSize,
      status,
      variant,
      bordered,
      disabled: blocked,
      readonly,
      readOnly,
      id,
      name,
      type,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      allowClear,
      showCount,
      count,
      maxLength,
      autoComplete,
      autoFocus,
      classNames,
      styles,
      style,
      hidden,
      onValueChange,
      onChange,
      onClear,
      onPressEnter,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onCompositionStart,
      onCompositionEnd,
      oninput,
      onkeydown,
      onkeyup,
      onblur,
      onfocus,
      oncompositionstart,
      oncompositionend,
      inputElement,
      nativeElement,
      class: className,
      rootClassName
    }
  });
  let contextClasses = $derived(
    typeof config.input?.classNames === 'function'
      ? config.input.classNames(info)
      : config.input?.classNames
  );
  let localClasses = $derived(typeof classNames === 'function' ? classNames(info) : classNames);
  let contextStyles = $derived(
    typeof config.input?.styles === 'function' ? config.input.styles(info) : config.input?.styles
  );
  let localStyles = $derived(typeof styles === 'function' ? styles(info) : styles);
  let rootStyle = $derived(
    [contextStyles?.root, config.input?.style, localStyles?.root, style].filter(Boolean).join(
      ';'
    )
  );
  let variantClasses = $derived([
    `ant-input-${appearance}`,
    resolvedStatus && `ant-input-status-${resolvedStatus}`
  ]);
  let rootClasses = $derived([
    'ant-input-css-var',
    className,
    rootClassName,
    compactClasses('ant-input', config.direction, compact),
    config.input?.class,
    contextClasses?.root,
    localClasses?.root,
    counter.exceeded && 'ant-input-out-of-range'
  ]);

  $effect(() => {
    nativeElement = group ?? affix ?? inputElement;
  });

  $effect(() => {
    if (blocked) {
      focused = false;
      keyLock = false;
    }
  });

  onMount(removePasswordAttribute);

  onDestroy(() => {
    alive = false;
    passwordTimers.forEach(clearTimeout);
    nativeElement = undefined;
  });

  function removePasswordAttribute() {
    const timeout = setTimeout(() => {
      passwordTimers.delete(timeout);
      if (inputElement?.type === 'password' && inputElement.hasAttribute('value'))
        inputElement.removeAttribute('value');
    });

    passwordTimers.add(timeout);
  }

  function publish(event: Event, raw: string) {
    const element = inputElement;
    if (!element) return;

    const next = inputExceedValue(raw, count, composing);
    // Input, в отличие от TextArea, пропускает неизменённый compositionend.
    if (event.type === 'compositionend' && raw === next) return;

    const selection = raw !== next &&
      typeof element.selectionStart === 'number' &&
      typeof element.selectionEnd === 'number'
      ? [element.selectionStart, element.selectionEnd]
      : undefined;
    useDefault = false;
    value = next;

    onValueChange?.(next);
    removePasswordAttribute();
    onChange?.(inputChangeEvent(event, element, next));

    void tick().then(() => {
      if (!alive || inputElement !== element || !element.isConnected) return;
      if (element.value !== text)
        element.value = text;
      if (selection)
        element.setSelectionRange(selection[0], selection[1]);
    });
  }

  function handleClear(event: MouseEvent) {
    const element = inputElement;
    if (!element) return;

    useDefault = false;
    value = '';

    focus();
    onValueChange?.('');
    removePasswordAttribute();
    onChange?.(inputChangeEvent(event, element, ''));
    onClear?.();
  }

  function focusOnClick(element: HTMLSpanElement) {
    const click = (event: MouseEvent) => {
      if (element.contains(event.target as Node))
        focus();
    };
    element.addEventListener('click', click);

    return {
      destroy() {
        element.removeEventListener('click', click);
      }
    };
  }

  /** Фокусирует input; cursor управляет выделением у типов с поддержкой selection API. */
  export function focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }) {
    const element = inputElement;
    element?.focus(options);

    if (element && options?.cursor) {
      const length = element.value.length;
      element.setSelectionRange(
        options.cursor === 'end' ? length : 0,
        options.cursor === 'start' ? 0 : length
      );
    }
  }

  export function blur() {
    inputElement?.blur();
  }

  export function select() {
    inputElement?.select();
  }

  /** Делегирует нативному input; ограничения selection API зависят от его type. */
  export function setSelectionRange(
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none'
  ) {
    inputElement?.setSelectionRange(start, end, direction);
  }
</script>

<style>
  @media (prefers-reduced-motion: reduce) { input, .ant-input-affix-wrapper { transition: none; } }
</style>

{#snippet content(node: InputContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#snippet control()}
  <input
    {...attributes}
    bind:this={inputElement}
    id={id ?? field?.id}
    name={name ?? field?.name}
    {type}
    value={text}
    size={htmlSize}
    required={attributes.required ?? field?.required}
    disabled={blocked}
    readonly={read}
    maxlength={maximum}
    hidden={!wrapped && !grouped ? hidden : undefined}
    autocomplete={attributes.autocomplete
        ?? autoComplete
        ?? config.input?.autoComplete}
    {...(attributes.autofocus !== undefined || autoFocus !== undefined
        ? { autofocus: attributes.autofocus ?? autoFocus }
        : {})}
    aria-invalid={resolvedStatus === 'error'
        || attributes['aria-invalid']
        || undefined}
    aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
        Boolean
      )
        .join(
          ' '
        )
        || undefined}
    oninput={event => {
        publish(event, event.currentTarget.value);
        oninput?.(event);
      }}
    onkeydown={event => {
        if (onPressEnter && event.key === 'Enter' && !keyLock && !event.isComposing) {
          keyLock = true;
          onPressEnter(event);
        }

        onKeyDown?.(event);
        onkeydown?.(event);
      }}
    onkeyup={event => {
        if (event.key === 'Enter')
          keyLock = false;

        onKeyUp?.(event);
        onkeyup?.(event);
      }}
    onfocus={event => {
        focused = true;
        removePasswordAttribute();
        onFocus?.(event);
        onfocus?.(event);
      }}
    onblur={event => {
        focused = false;
        keyLock = false;
        removePasswordAttribute();
        field?.onBlur();
        onBlur?.(event);
        onblur?.(event);
      }}
    oncompositionstart={event => {
        composing = true;
        onCompositionStart?.(event);
        oncompositionstart?.(event);
      }}
    oncompositionend={event => {
        composing = false;
        publish(event, event.currentTarget.value);
        onCompositionEnd?.(event);
        oncompositionend?.(event);
      }}
    class={[
        'ant-input',
        blocked && 'ant-input-disabled',
        resolvedSize === 'small' && 'ant-input-sm',
        resolvedSize === 'large' && 'ant-input-lg',
        config.direction === 'rtl' && 'ant-input-rtl',
        contextClasses?.input,
        localClasses?.input,
        !wrapped && variantClasses,
        !wrapped && !grouped && rootClasses
      ]}
    style={[
        contextStyles?.input,
        localStyles?.input,
        !wrapped && !grouped && rootStyle
      ].filter(Boolean).join(';')} />
{/snippet}
{#snippet fieldControl()}
  {#if wrapped}
    <span
      bind:this={affix}
      use:focusOnClick
      hidden={grouped ? undefined : hidden}
      class={[
          'ant-input-affix-wrapper',
          variantClasses,
          blocked && 'ant-input-disabled ant-input-affix-wrapper-disabled',
          read && 'ant-input-affix-wrapper-readonly',
          focused && 'ant-input-affix-wrapper-focused',
          resolvedSize === 'small' && 'ant-input-affix-wrapper-sm',
          resolvedSize === 'large' && 'ant-input-affix-wrapper-lg',
          config.direction === 'rtl' && 'ant-input-affix-wrapper-rtl',
          (suffix
            || counter.show)
          && clear
          && text
          && 'ant-input-affix-wrapper-input-with-clear-btn',
          !grouped && rootClasses
        ]}
      style={!grouped ? rootStyle : undefined}>
      {#if prefix}<span
        class={[
            'ant-input-prefix',
            contextClasses?.prefix,
            localClasses?.prefix
          ]}
        style={[contextStyles?.prefix, localStyles?.prefix].filter(Boolean).join(
            ';'
          )}
      >{@render content(prefix)}</span>{/if}
      {@render control()}
      {#if suffix || counter.show || clear}
        <span
          class={[
              'ant-input-suffix',
              contextClasses?.suffix,
              localClasses?.suffix
            ]}
          style={[contextStyles
              ?.suffix, localStyles
              ?.suffix]
              .filter(Boolean)
              .join(
                ';'
              )}>
          {#if clear}<button
            type="button"
            aria-label={config.locale.clearText}
            class={[
                'ant-input-clear-icon',
                !canClear && 'ant-input-clear-icon-hidden',
                (suffix || counter.show) && 'ant-input-clear-icon-has-suffix',
                contextClasses?.clear,
                localClasses?.clear
              ]}
            style={[contextStyles
                ?.clear, localStyles
                ?.clear]
                .filter(Boolean)
                .join(
                  ';'
                )}
            onmousedown={event => event.preventDefault()}
            onclick={handleClear}>
            {#if typeof clear.clearIcon === 'function'}{@render clear.clearIcon()}{:else if clear.clearIcon === undefined}<Icon name="close-circle-filled" />{:else}{clear.clearIcon || '✖'}{/if}
          </button>{/if}
          {#if counter.show}<span
            class={[
                'ant-input-show-count-suffix',
                suffix && 'ant-input-show-count-has-suffix',
                contextClasses?.count,
                localClasses?.count
              ]}
            style={[contextStyles
                ?.count, localStyles
                ?.count]
                .filter(Boolean)
                .join(
                  ';'
                )}>
            {#if typeof counter.content === 'function'}{@render counter.content(counter.info)}{:else if counter.content !== false && counter.content !== true}{counter.content}{/if}
          </span>{/if}
          {@render content(suffix)}
        </span>
      {/if}
    </span>
  {:else}{@render control()}{/if}
{/snippet}

{#if grouped}
  <span
    bind:this={group}
    {hidden}
    class={[
        'ant-input-group-wrapper',
        `ant-input-group-wrapper-${appearance}`,
        resolvedStatus && `ant-input-group-wrapper-status-${resolvedStatus}`,
        blocked && 'ant-input-group-wrapper-disabled',
        resolvedSize === 'small' && 'ant-input-group-wrapper-sm',
        resolvedSize === 'large' && 'ant-input-group-wrapper-lg',
        config.direction === 'rtl' && 'ant-input-group-wrapper-rtl',
        rootClasses
      ]}
    style={rootStyle}>
    <span class={[
        'ant-input-wrapper ant-input-group',
        config.direction === 'rtl' && 'ant-input-group-rtl'
      ]}>
      {#if addonBefore}<span class="ant-input-group-addon"><InputAddonContent>{@render content(addonBefore)}</InputAddonContent></span>{/if}
      {@render fieldControl()}
      {#if addonAfter}<span class="ant-input-group-addon"><InputAddonContent>{@render content(addonAfter)}</InputAddonContent></span>{/if}
    </span>
  </span>
{:else}{@render fieldControl()}{/if}
