<script module lang="ts">
  export type { InputOTPProps } from './input-otp.types';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import InputOTPCell from './InputOTPCell.svelte';
  import { useConfig } from './config-context';
  import { provideFormField, useForm, useFormField } from './form-context';
  import { isOTPCompleteChange, patchOTPCells } from './input-otp.engine';
  import type { InputOTPProps } from './input-otp.types';

  let {
    length = 6,
    value,
    defaultValue,
    formatter,
    separator,
    mask,
    type,
    autoComplete,
    autoFocus,
    inputMode,
    size,
    disabled,
    status,
    variant,
    onInput,
    onChange,
    onFocus,
    onBlur,
    onfocus,
    nativeElement = $bindable(),
    class: className = '',
    rootClassName = '',
    style,
    classNames,
    styles,
    ...attributes
  }: InputOTPProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  // FormItem владеет группой: отдельные Input не получают одинаковые id/name/required.
  provideFormField(undefined);

  const initialCells = untrack(() => {
    const initial = defaultValue || '';
    return ((formatter ? formatter(initial) : initial) || '').split('');
  });
  let cells = $state.raw<string[]>(initialCells);
  let elements = $state<(HTMLInputElement | undefined)[]>([]);
  let external = $derived({ value, resetKey: form?.resetKey });
  let resolvedSize = $derived(size ?? config.explicitComponentSize);
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedStatus = $derived(status || field?.status);
  let appearance = $derived(variant ?? config.otp?.variant ?? config.input?.variant ?? 'outlined');
  let info = $derived<{ props: InputOTPProps; }>({
    props: {
      ...attributes,
      length,
      value,
      defaultValue,
      formatter,
      separator,
      mask,
      type,
      autoComplete,
      autoFocus,
      inputMode,
      size,
      disabled,
      status,
      variant: appearance,
      onInput,
      onChange,
      onFocus,
      onBlur,
      onfocus,
      nativeElement,
      class: className,
      rootClassName,
      style,
      classNames,
      styles
    }
  });
  let contextClasses = $derived(
    typeof config.otp?.classNames === 'function'
      ? config.otp.classNames(info) : config.otp?.classNames
  );
  let localClasses = $derived(typeof classNames === 'function' ? classNames(info) : classNames);
  let contextStyles = $derived(
    typeof config.otp?.styles === 'function' ? config.otp.styles(info) : config.otp?.styles
  );
  let localStyles = $derived(typeof styles === 'function' ? styles(info) : styles);
  let rootStyle = $derived(
    [contextStyles?.root, config.otp?.style, localStyles?.root, style]
      .filter(Boolean).join(';')
  );

  $effect(() => {
    if (external.value !== undefined) cells = (external.value || '').split('');
  });

  function handleCellInput(index: number, text: string): string {
    const previous = cells;
    const next = patchOTPCells(previous, index, text, length, formatter);
    cells = next;

    onInput?.(next);
    if (isOTPCompleteChange(previous, next, length)) onChange?.(next.join(''));

    // Focus guard должен видеть новые ячейки, даже до обновления DOM.
    const nextIndex = Math.min(index + text.length, length - 1);
    if (nextIndex !== index && next[index] !== undefined) elements[nextIndex]?.focus();

    return next[index] || '';
  }

  function handleCellFocus(
    event: FocusEvent & { currentTarget: HTMLInputElement; },
    index: number
  ) {
    for (let previous = 0; previous < index; previous++) {
      if (!cells[previous]) {
        elements[previous]?.focus();
        break;
      }
    }

    onFocus?.(event);
  }

  const handleCellBlur: NonNullable<InputOTPProps['onBlur']> = event => {
    field?.onBlur();
    onBlur?.(event);
  };

  const handleRootFocus: NonNullable<InputOTPProps['onfocus']> = event => {
    if (field && !event.defaultPrevented && event.target === event.currentTarget) focus();
    onfocus?.(event);
  };

  /** Фокусирует первую ячейку, как OTPRef.focus в upstream. */
  export function focus() {
    elements[0]?.focus();
  }

  /** Снимает фокус со всех ячеек. */
  export function blur() {
    for (let index = 0; index < length; index++) elements[index]?.blur();
  }
</script>

<!-- tabindex=-1 даёт FormItem возможность фокусировать группу; явный native tabindex сохраняется. -->
<div
  {...(field ? { tabindex: -1 } : {})}
  {...attributes}
  bind:this={nativeElement}
  id={attributes.id ?? field?.id}
  role="group"
  aria-label={attributes['aria-label'] ?? (attributes['aria-labelledby'] ? undefined : field?.label)}
  data-ant-form-invalid={resolvedStatus === 'error'
    || attributes['aria-invalid'] === true || attributes['aria-invalid'] === 'true' || undefined}
  aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
  onfocus={handleRootFocus}
  class={[
    className,
    rootClassName,
    'ant-otp ant-otp-css-var',
    resolvedSize === 'small' && 'ant-otp-sm',
    resolvedSize === 'large' && 'ant-otp-lg',
    config.direction === 'rtl' && 'ant-otp-rtl',
    config.otp?.class,
    contextClasses?.root,
    localClasses?.root
  ].filter(Boolean).join(' ')}
  style={rootStyle}
>
  {#each Array.from({ length }, (_, index) => index) as index (index)}
    <InputOTPCell
      {index}
      value={cells[index] || ''}
      bind:inputElement={elements[index]}
      size={resolvedSize}
      disabled={blocked}
      status={resolvedStatus}
      variant={appearance}
      {mask}
      {type}
      {inputMode}
      {autoComplete}
      autoFocus={index === 0 && autoFocus}
      class={['ant-otp-input', contextClasses?.input, localClasses?.input].filter(Boolean).join(' ')}
      style={[contextStyles?.input, localStyles?.input].filter(Boolean).join(';')}
      onCellInput={handleCellInput}
      onActiveChange={next => elements[next]?.focus()}
      onCellFocus={handleCellFocus}
      onCellBlur={handleCellBlur}
    />
    {#if index < length - 1}
      {@const content = typeof separator === 'function' ? separator(index) : separator}
      {#if content !== null && content !== undefined && content !== false && content !== ''}
        <span
          class={['ant-otp-separator', contextClasses?.separator, localClasses?.separator].filter(Boolean).join(' ')}
          style={[contextStyles?.separator, localStyles?.separator].filter(Boolean).join(';')}
        >{#if typeof content === 'function'}{@render content(index)}{:else if content !== true}{content}{/if}</span>
      {/if}
    {/if}
  {/each}
</div>
