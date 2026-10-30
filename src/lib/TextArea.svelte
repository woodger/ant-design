<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm, useFormField } from './form-context';
  import type { TextAreaProps } from './textarea.types';

  let { value = $bindable(), defaultValue, size, status, disabled, id, name,
    onValueChange, onPressEnter, oninput, onkeydown, onblur, nativeElement = $bindable(),
    class: className = '', ...attributes }: TextAreaProps = $props();
  const config = useConfig();
  const compact = useCompact();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => defaultValue);
  let useDefault = $state(true);
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) {
    useDefault = false;
    value = event.currentTarget.value;
    onValueChange?.(value);
    oninput?.(event);
  }
</script>

<textarea {...attributes} bind:this={nativeElement}
  id={id ?? field?.id} name={name ?? field?.name}
  value={value ?? (useDefault ? initialDefault : '') ?? ''}
  required={attributes.required ?? field?.required}
  disabled={disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled}
  dir={attributes.dir ?? config.direction}
  aria-invalid={resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
  aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
  oninput={handleInput}
  onkeydown={event => { if (event.key === 'Enter' && !event.isComposing) onPressEnter?.(event); onkeydown?.(event); }}
  onblur={event => { field?.onBlur(); onblur?.(event); }}
  class={['ant-input ant-input-css-var ant-input-outlined', resolvedSize === 'large' && 'ant-input-lg', resolvedSize === 'small' && 'ant-input-sm', resolvedStatus && `ant-input-status-${resolvedStatus}`, compactClasses('ant-input', config.direction, compact), className]}
></textarea>
