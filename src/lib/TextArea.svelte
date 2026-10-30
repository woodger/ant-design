<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm, useFormField } from './form-context';
  import {
    textAreaCountInfo,
    textAreaExceedValue,
    resolveTextAreaClear,
    textAreaResizeStyle
  } from './textarea.engine';
  import { createTextAreaMeasure, textAreaChangeEvent } from './textarea.dom';
  import type { TextAreaProps } from './textarea.types';
  import Icon from './Icon.svelte';

  let {
    value = $bindable(),
    defaultValue,
    size,
    status,
    variant,
    bordered = true,
    disabled,
    readonly,
    readOnly,
    id,
    name,
    autoSize = false,
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
    onResize,
    onPressEnter,
    onFocus,
    onBlur,
    onKeyDown,
    onMouseDown,
    onCompositionStart,
    onCompositionEnd,
    oninput,
    onkeydown,
    onblur,
    onfocus,
    onmousedown,
    oncompositionstart,
    oncompositionend,
    nativeElement = $bindable(),
    rootElement = $bindable(),
    rootClassName = '',
    class: className = '',
    ...attributes
  }: TextAreaProps = $props();
  const config = useConfig();
  const compact = useCompact();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => defaultValue);
  let useDefault = $state(true);
  let focused = $state(false);
  let mouseDown = $state(false);
  let resized = $state(false);
  let dirty = $state(false);
  let composing = false;
  let alive = true;
  let wrapper = $state<HTMLSpanElement>();
  let measure: ReturnType<typeof createTextAreaMeasure> | undefined;
  let removeMouseUp: (() => void) | undefined;
  let text = $derived(String(value ?? (useDefault ? initialDefault : '') ?? ''));
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);

  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let read = $derived(readonly ?? readOnly);
  let appearance = $derived(
    variant ?? (bordered === false ? 'borderless' : config.textArea?.variant ?? 'outlined')
  );
  let clear = $derived(resolveTextAreaClear(allowClear, config.textArea?.allowClear));
  let maximum = $derived(maxLength ?? attributes.maxlength ?? undefined);
  let counter = $derived(textAreaCountInfo(text, count, showCount, maximum));
  let wrapped = $derived(Boolean(clear || counter.show));
  let canClear = $derived(Boolean(clear && !clear.disabled && !blocked && !read && text));
  let semanticInfo = $derived(
    {
      props: {
        ...attributes,
        value,
        defaultValue,
        size,
        status,
        variant,
        bordered,
        disabled,
        readonly,
        readOnly,
        id,
        name,
        autoSize,
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
        onResize,
        onPressEnter,
        onFocus,
        onBlur,
        onKeyDown,
        onMouseDown,
        onCompositionStart,
        onCompositionEnd,
        oninput,
        onkeydown,
        onblur,
        onfocus,
        onmousedown,
        oncompositionstart,
        oncompositionend,
        nativeElement,
        rootElement,
        class: className,
        rootClassName
      }
    }
  );
  let contextClasses = $derived(
    typeof config.textArea?.classNames === 'function'
      ? config.textArea.classNames(semanticInfo)
      : config.textArea?.classNames
  );
  let localClasses = $derived(
    typeof classNames === 'function' ? classNames(semanticInfo) : classNames
  );
  let contextStyles = $derived(
    typeof config.textArea?.styles === 'function'
      ? config.textArea.styles(semanticInfo)
      : config.textArea?.styles
  );
  let localStyles = $derived(typeof styles === 'function' ? styles(semanticInfo) : styles);
  let rootStyle = $derived(
    [contextStyles?.root, config.textArea?.style, localStyles?.root, style].filter(Boolean).join(
      ';'
    )
  );
  let leafStyle = $derived(
    [
      wrapped && textAreaResizeStyle(rootStyle),
      contextStyles?.textarea,
      localStyles?.textarea,
      !wrapped && rootStyle
    ].filter(
      Boolean
    ).join(
      ';'
    )
  );
  let variantClasses = $derived(
    [`ant-input-${appearance}`, resolvedStatus && `ant-input-status-${resolvedStatus}`]
  );
  let rootClasses = $derived(
    [
      'ant-input-css-var',
      className,
      rootClassName,
      compactClasses('ant-input', config.direction, compact),
      config.textArea?.class,
      contextClasses?.root,
      localClasses?.root,
      counter.exceeded && 'ant-input-out-of-range',
      dirty && 'ant-input-textarea-affix-wrapper-resize-dirty'
    ]
  );

  $effect(() => {
    rootElement = wrapper ?? nativeElement;
  });
  $effect(() => {
    if (blocked)
      focused = false;
  });
  $effect(() => {
    if (!nativeElement) return;
    const element = nativeElement;
    const connection = createTextAreaMeasure(element, bounds => {
      onResize?.(bounds);
      if (element.style.height)
        resized = true;
      if (mouseDown
        && element.ownerDocument.defaultView!.getComputedStyle(element).resize === 'both')
        dirty = true;
    });
    measure = connection;
    return () => {
      connection.destroy();
      if (measure === connection)
        measure = undefined;
    };
  });
  $effect(() => {
    const element = nativeElement;
    const sizing = typeof autoSize === 'object' ? { ...autoSize } : autoSize;
    const css = leafStyle;
    void text;
    void resolvedSize;
    void config.theme;
    void config.direction;
    void attributes.wrap;
    void attributes.placeholder;
    void attributes.rows;
    if (element)
      untrack(() => measure?.configure(sizing, css));
  });
  onDestroy(() => {
    alive = false;
    removeMouseUp?.();
    rootElement = undefined;
  });

  function publish(event: Event, raw: string, legacy = false) {
    const element = nativeElement;
    if (!element) return;
    const next = textAreaExceedValue(raw, count, composing);
    const notifyLegacy = legacy || event.type === 'compositionend' && raw !== next && next !== text;
    const selection = raw !== next ? [element.selectionStart, element.selectionEnd] : undefined;
    useDefault = false;
    value = next;
    if (notifyLegacy)
      onValueChange?.(next);
    onChange?.(textAreaChangeEvent(event, element, next));
    void tick().then(() => {
      if (!alive || nativeElement !== element || !element.isConnected) return;
      if (element.value !== text)
        element.value = text;
      if (selection)
        element.setSelectionRange(selection[0], selection[1]);
      measure?.sync();
    });
  }
  function handleInput(event: Event & { currentTarget: EventTarget & HTMLTextAreaElement; }) {
    publish(event, event.currentTarget.value, true);
    oninput?.(event);
  }
  function handleClear(event: MouseEvent) {
    const element = nativeElement;
    if (!element) return;
    useDefault = false;
    value = '';
    focus();
    onValueChange?.('');
    onChange?.(textAreaChangeEvent(event, element, ''));
    onClear?.();
  }
  function handleMouseDown(
    event: MouseEvent & { currentTarget: EventTarget & HTMLTextAreaElement; }
  ) {
    mouseDown = true;
    removeMouseUp?.();
    const document = event.currentTarget.ownerDocument;
    const up = () => {
      mouseDown = false;
      removeMouseUp?.();
      removeMouseUp = undefined;
    };
    document.addEventListener('mouseup', up);
    removeMouseUp = () => document.removeEventListener('mouseup', up);
    onMouseDown?.(event);
    onmousedown?.(event);
  }
  /** Фокусирует textarea; cursor задаёт начало, конец или полное выделение текста. */
  export function focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }) {
    const element = nativeElement;
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
    nativeElement?.blur();
  }
</script>

<style>
  @media (prefers-reduced-motion: reduce) { textarea.ant-input, textarea.ant-input.ant-input-mouse-active, .ant-input-textarea-affix-wrapper { transition: none; } }
</style>

{#snippet control()}
  <textarea {...attributes} bind:this={nativeElement} id={id ?? field?.id} name={name ?? field?.name} value={text}
    required={attributes.required ?? field?.required} disabled={blocked} readonly={read} maxlength={maximum} hidden={wrapped ? undefined : hidden}
    autocomplete={attributes.autocomplete
        ?? autoComplete
        ?? config.textArea?.autoComplete}
    {...(attributes.autofocus !== undefined || autoFocus !== undefined
        ? { autofocus: attributes.autofocus ?? autoFocus }
        : {})}
    dir={attributes.dir ?? config.direction} aria-invalid={resolvedStatus === 'error'
        || attributes['aria-invalid']
        || undefined}
    aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
        Boolean
      )
        .join(
          ' '
        )
        || undefined}
    oninput={handleInput} onkeydown={event => {
        if (event.key === 'Enter' && !event.isComposing)
          onPressEnter?.(event);
        onKeyDown?.(event);
        onkeydown?.(event);
      }}
    onfocus={event => {
        focused = true;
        onFocus?.(event);
        onfocus?.(event);
      }}
    onblur={event => {
        focused = false;
        field?.onBlur();
        onBlur?.(event);
        onblur?.(event);
      }} onmousedown={handleMouseDown}
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
    style={leafStyle} class={[
        'ant-input',
        blocked && 'ant-input-disabled',
        resolvedSize === 'large' && 'ant-input-lg',
        resolvedSize === 'small' && 'ant-input-sm',
        mouseDown && 'ant-input-mouse-active',
        contextClasses?.textarea,
        localClasses?.textarea,
        !wrapped && variantClasses,
        !wrapped && rootClasses
      ]}></textarea>
{/snippet}

{#if wrapped}
  <span bind:this={wrapper} {hidden} dir={config.direction} class={[
      'ant-input-affix-wrapper ant-input-textarea-affix-wrapper',
      rootClasses,
      variantClasses,
      focused && 'ant-input-affix-wrapper-focused',
      blocked && 'ant-input-disabled ant-input-affix-wrapper-disabled',
      read && 'ant-input-affix-wrapper-readonly',
      config.direction === 'rtl' && 'ant-input-affix-wrapper-rtl',
      resolvedSize === 'large' && 'ant-input-affix-wrapper-lg',
      resolvedSize === 'small' && 'ant-input-affix-wrapper-sm',
      showCount && 'ant-input-show-count',
      (showCount || count?.show) && 'ant-input-textarea-show-count',
      clear && 'ant-input-textarea-allow-clear',
      counter.show && clear && text && 'ant-input-affix-wrapper-input-with-clear-btn'
    ]}
    style={[
        rootStyle,
        resized && (autoSize || showCount || clear) && 'height:auto'
      ].filter(
        Boolean
      ).join(
        ';'
      )} data-count={typeof counter.content === 'string' ? counter.content : undefined}>
    {@render control()}
    <span class="ant-input-suffix">
      {#if clear}<button type="button" aria-label={config.locale.clearText} class={[
          'ant-input-clear-icon',
          !canClear && 'ant-input-clear-icon-hidden',
          counter.show && 'ant-input-clear-icon-has-suffix',
          contextClasses?.clear,
          localClasses?.clear
        ]} style={[contextStyles?.clear, localStyles?.clear].filter(Boolean).join(
            ';'
          )} onpointerdown={event => event.preventDefault()} onclick={handleClear}>
        {#if typeof clear.clearIcon === 'function'}{@render clear.clearIcon()}{:else if clear.clearIcon === undefined}<Icon name="close-circle-filled" />{:else}{clear.clearIcon || '✖'}{/if}
      </button>{/if}
      {#if counter.show}<span class={[
          'ant-input-data-count',
          contextClasses?.count,
          localClasses?.count
        ]} style={[contextStyles?.count, localStyles?.count].filter(Boolean).join(
          ';'
        )}>
        {#if typeof counter.content === 'function'}{@render counter.content(counter.info)}{:else if counter.content !== false && counter.content !== true}{counter.content}{/if}
      </span>{/if}
    </span>
  </span>
{:else}{@render control()}{/if}
