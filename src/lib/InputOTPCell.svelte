<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import Input from './Input.svelte';
  import type { InputProps } from './input.types';
  import type { InputOTPProps } from './input-otp.types';

  interface CellProps extends Pick<
    InputProps,
    'size' | 'variant' | 'disabled' | 'status' | 'autoFocus' | 'autoComplete' | 'class' | 'style'
  > {
    index: number;
    value: string;
    type?: InputOTPProps['type'];
    mask?: InputOTPProps['mask'];
    inputMode?: InputOTPProps['inputMode'];
    inputElement?: HTMLInputElement;
    onCellInput: (index: number, value: string) => string;
    onActiveChange: (index: number) => void;
    onCellFocus: (event: FocusEvent & { currentTarget: HTMLInputElement; }, index: number) => void;
    onCellBlur: InputOTPProps['onBlur'];
  }

  let {
    index,
    value,
    mask,
    type,
    inputMode,
    inputElement = $bindable(),
    onCellInput,
    onActiveChange,
    onCellFocus,
    onCellBlur,
    class: className = '',
    ...attributes
  }: CellProps = $props();

  let text = $state(untrack(() => value));
  const selections = new Set<() => void>();

  $effect(() => {
    text = value;
  });

  onMount(() => {
    // Native autofocus не переводит фокус при повторном mount; React делает это явно.
    if (attributes.autoFocus) inputElement?.focus();
  });

  onDestroy(() => {
    selections.forEach(cancel => cancel());
  });

  function syncSelection() {
    const element = inputElement;
    const view = element?.ownerDocument.defaultView;
    if (!element || !view) return;

    const frame = view.requestAnimationFrame(() => {
      selections.delete(cancel);
      if (element === inputElement && element.ownerDocument.activeElement === element)
        element.select();
    });
    const cancel = () => view.cancelAnimationFrame(frame);
    selections.add(cancel);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') onActiveChange(index - 1);
    else if (event.key === 'ArrowRight') onActiveChange(index + 1);
    else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) event.preventDefault();
    else if (event.key === 'Backspace' && !value) onActiveChange(index - 1);

    syncSelection();
  }
</script>

<span class="ant-otp-input-wrapper" role="presentation">
  {#if mask && value !== ''}
    <span class="ant-otp-mask-icon" aria-hidden="true">{typeof mask === 'string' ? mask : '•'}</span>
  {/if}
  <Input
    {...attributes}
    aria-label={`OTP Input ${index + 1}`}
    htmlSize={1}
    type={type ?? (mask ? 'password' : 'text')}
    inputmode={inputMode}
    bind:value={text}
    bind:inputElement
    class={[className, mask && 'ant-otp-mask-input'].filter(Boolean).join(' ')}
    oninput={event => {
      text = onCellInput(index, event.currentTarget.value);
    }}
    onChange={event => {
      // OTP слушает native input; clear из общего Input config не меняет ячейки в upstream.
      if (event.type === 'click') text = value;
    }}
    onFocus={event => {
      onCellFocus(event, index);
      syncSelection();
    }}
    onBlur={onCellBlur}
    onKeyDown={handleKeyDown}
    onmousedown={syncSelection}
    onmouseup={syncSelection}
  />
</span>
