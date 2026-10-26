<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField, useForm } from './form-context';

  export interface FormItemProps {
    name: string;
    label: string;
    children: Snippet;
    help?: string;
    required?: boolean;
    htmlFor?: string;
    class?: string;
  }

  let { name, label, children, help, required, htmlFor, class: className = '' }: FormItemProps = $props();

  const form = useForm();
  const generatedId = $props.id();
  let id = $derived(htmlFor ?? `ant-field-${generatedId}`);
  let errors = $derived(form?.getFieldError(name) ?? []);
  let isRequired = $derived(required ?? form?.isFieldRequired(name) ?? false);
  let descriptionId = $derived(errors.length || help ? `${id}-help` : undefined);

  provideFormField({
    get id() { return id; },
    get name() { return name; },
    get disabled() { return form?.disabled; },
    get required() { return isRequired; },
    get status() { return errors.length ? 'error' : undefined; },
    get describedBy() { return descriptionId; },
    onBlur() { form?.touchField(name); }
  });
</script>

<div class={['ant-form-item', errors.length && 'ant-form-item-has-error', className]}>
  <div class="ant-form-item-row">
    <div class="ant-form-item-label">
      <label for={id} class:ant-form-item-required={isRequired} title={label}>
        {label}
      </label>
    </div>
    <div class="ant-form-item-control">
      <div class="ant-form-item-control-input">
        <div class="ant-form-item-control-input-content">{@render children()}</div>
      </div>
      {#if errors.length}
        <div id={descriptionId} class="ant-form-item-explain ant-form-item-explain-error" role="alert">
          {#each errors as error}<div>{error}</div>{/each}
        </div>
      {:else if help}
        <div id={descriptionId} class="ant-form-item-extra">{help}</div>
      {/if}
    </div>
  </div>
</div>
