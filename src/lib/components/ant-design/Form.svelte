<script lang="ts" generics="Values extends FormValues">
  import { onDestroy, tick } from 'svelte';
  import { useConfig } from './config-context';
  import { provideForm } from './form-context';
  import type { FormProps } from './form.types';
  import type { FieldName, FormValues } from './validation.engine';

  let {
    form,
    children,
    layout = 'vertical',
    disabled,
    onFinish,
    onFinishFailed,
    onError,
    class: className = '',
    ...attributes
  }: FormProps<Values> = $props();

  const config = useConfig();
  let active = true;

  onDestroy(() => { active = false; });

  function getFieldName(name: string): FieldName<Values> {
    if (!Object.hasOwn(form.values, name)) {
      throw new Error(`FormItem name "${name}" is missing from initialValues`);
    }

    return name as FieldName<Values>;
  }

  provideForm({
    get disabled() { return (disabled ?? config.componentDisabled) || form.isSubmitting; },
    get layout() { return layout; },
    get resetKey() { return form.values; },
    getFieldError: (name) => form.getFieldError(getFieldName(name)),
    isFieldRequired: (name) => form.isFieldRequired(getFieldName(name)),
    touchField: (name) => form.touchField(getFieldName(name))
  });

  async function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    event.preventDefault();
    const element = event.currentTarget;

    if (disabled ?? config.componentDisabled) {
      return;
    }

    const submittedForm = form;
    const finish = onFinish;
    const result = await submittedForm.submit((values) => {
      if (active && form === submittedForm) {
        return finish?.(values);
      }
    });

    if (!active || form !== submittedForm) {
      return;
    }

    if (result.status === 'invalid') {
      onFinishFailed?.(result.error);

      if (!result.error.outOfDate) {
        await tick();
        element.querySelector<HTMLElement>('[data-ant-form-invalid="true"], [aria-invalid="true"]')?.focus();
      }
    } else if (result.status === 'failed') {
      onError?.(result.error);
    }
  }

  function handleReset(event: Event) {
    event.preventDefault();
    form.resetFields();
  }
</script>

<form
  {...attributes}
  novalidate
  class={`ant-form ant-form-css-var ant-form-${layout} ${className}`}
  aria-busy={form.isSubmitting || undefined}
  onsubmit={handleSubmit}
  onreset={handleReset}
>
  {#if form.submissionError}
    <p role="alert" class="ant-form-item-explain-error">{config.locale.submitErrorText}</p>
  {/if}
  {@render children()}
</form>
