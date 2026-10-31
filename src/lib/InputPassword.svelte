<script module lang="ts">
  export type { InputPasswordProps } from './input-password.types';
</script>

<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import Input from './Input.svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { inputPasswordIcons } from './input-password-icons';
  import type { InputPasswordProps } from './input-password.types';
  import type { InputSemanticSlots } from './input.types';

  let {
    value = $bindable(),
    inputElement = $bindable(),
    nativeElement = $bindable(),
    action = 'click',
    visibilityToggle = true,
    iconRender,
    disabled,
    variant,
    bordered,
    suffix,
    class: className = '',
    style,
    classNames,
    styles,
    ...attributes
  }: InputPasswordProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const slots = ['root', 'input', 'prefix', 'suffix', 'clear', 'count'] as const;
  const passwordTimers = new Set<ReturnType<typeof setTimeout>>();
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
  let visible = $state(untrack(() =>
    typeof visibilityToggle === 'object' ? visibilityToggle.visible ?? false : false
  ));
  let controlledVisible = $derived(
    typeof visibilityToggle === 'object' ? visibilityToggle.visible : undefined
  );
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let appearance = $derived(
    variant ?? (bordered === false
      ? 'borderless'
      : config.inputPassword?.variant ?? config.input?.variant ?? 'outlined')
  );
  let info = $derived<{ props: InputPasswordProps; }>({
    props: {
      ...attributes,
      value,
      inputElement,
      nativeElement,
      action,
      visibilityToggle,
      iconRender,
      disabled: blocked,
      variant: appearance,
      bordered,
      suffix,
      class: className,
      style,
      classNames,
      styles
    }
  });
  let contextClasses = $derived(
    typeof config.inputPassword?.classNames === 'function'
      ? config.inputPassword.classNames(info)
      : config.inputPassword?.classNames
  );
  let localClasses = $derived(typeof classNames === 'function' ? classNames(info) : classNames);
  let contextStyles = $derived(
    typeof config.inputPassword?.styles === 'function'
      ? config.inputPassword.styles(info)
      : config.inputPassword?.styles
  );
  let localStyles = $derived(typeof styles === 'function' ? styles(info) : styles);
  let mergedClasses = $derived<InputSemanticSlots>(Object.fromEntries(slots.map(slot => [
    slot,
    [contextClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ')
  ])));
  let mergedStyles = $derived<InputSemanticSlots>({
    ...Object.fromEntries(slots.map(slot => [
      slot,
      [contextStyles?.[slot], localStyles?.[slot]].filter(Boolean).join(';')
    ])),
    root: [contextStyles?.root, config.inputPassword?.style, localStyles?.root, style]
      .filter(Boolean).join(';')
  });
  let renderer = $derived(iconRender ?? config.inputPassword?.iconRender);
  let icon = $derived(renderer?.(visible));

  $effect(() => {
    if (controlledVisible !== undefined) visible = controlledVisible;
  });

  $effect(() => {
    // React восстанавливает value attribute при показе; Svelte меняет только property.
    if (visible && inputElement)
      inputElement.setAttribute('value', value ?? inputElement.value);
  });

  onDestroy(() => {
    passwordTimers.forEach(clearTimeout);
  });

  function handleVisibleChange() {
    if (blocked) return;

    if (visible) {
      const timeout = setTimeout(() => {
        passwordTimers.delete(timeout);
        if (inputElement?.type === 'password') inputElement.removeAttribute('value');
      });
      passwordTimers.add(timeout);
    }

    const nextVisible = !visible;
    if (controlledVisible === undefined) visible = nextVisible;
    if (typeof visibilityToggle === 'object') visibilityToggle.onVisibleChange?.(nextVisible);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    if (!event.repeat) handleVisibleChange();
  }

  /** Фокусирует input; cursor управляет выделением, как у Input. */
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
  .ant-input-password-icon { border: 0; padding: 0; background: transparent; font: inherit; }
  .anticon { display: inline-flex; align-items: center; line-height: 0; }
  svg { width: 1em; height: 1em; }
</style>

{#snippet passwordSuffix()}
  {#if visibilityToggle}
    <!-- svelte-ignore a11y_mouse_events_have_key_events (Как в upstream, клавиатура переключает по Enter/Space, а не при фокусе.) -->
    <button
      type="button"
      class="ant-input-password-icon"
      tabindex={blocked ? -1 : typeof visibilityToggle === 'object'
        ? visibilityToggle.tabIndex ?? 0
        : 0}
      aria-disabled={blocked}
      aria-pressed={visible}
      aria-label={visible ? config.locale.global?.hide : config.locale.global?.show}
      onmousedown={event => event.preventDefault()}
      onmouseup={event => event.preventDefault()}
      onkeydown={handleKeyDown}
      onclick={action === 'click' ? handleVisibleChange : undefined}
      onmouseover={action === 'hover' ? handleVisibleChange : undefined}
    >
      {#if renderer}
        {#if typeof icon === 'function'}{@render icon()}{:else if icon !== true && icon !== false}{icon ?? ''}{/if}
      {:else}
        <span class={['anticon', visible ? 'anticon-eye' : 'anticon-eye-invisible']} aria-hidden="true">
          <svg viewBox="64 64 896 896" fill="currentColor" focusable="false" aria-hidden="true">
            {#each inputPasswordIcons[visible ? 'eye' : 'eye-invisible'] as path}<path d={path} />{/each}
          </svg>
        </span>
      {/if}
    </button>
  {/if}
  {#if typeof suffix === 'function'}{@render suffix()}{:else if suffix !== true && suffix !== false}{suffix ?? ''}{/if}
{/snippet}

<Input
  {...attributes}
  bind:value
  bind:inputElement
  bind:nativeElement
  bind:this={input}
  type={visible ? 'text' : 'password'}
  disabled={blocked}
  variant={appearance}
  {bordered}
  class={[
    'ant-input-password',
    config.inputPassword?.class,
    className,
    attributes.size && `ant-input-password-${attributes.size}`
  ].filter(Boolean).join(' ')}
  classNames={mergedClasses}
  styles={mergedStyles}
  suffix={passwordSuffix}
/>
