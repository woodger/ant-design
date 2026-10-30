<script module lang="ts">
  export type { ButtonProps } from './button.types';
</script>

<script lang="ts" generics="Href extends string | undefined = undefined">
  import { onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useCompact } from './space-compact-context';
  import { useButtonGroup } from './button-group-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm } from './form-context';
  import { buttonAppearance, buttonHasContent, buttonLoading, buttonText } from './button.engine';
  import { connectButtonText } from './button.dom';
  import Icon from './Icon.svelte';
  import type { ButtonColor, ButtonContent, ButtonElementProps } from './button.types';
  let {
    children,
    icon,
    type,
    htmlType = 'button',
    color,
    variant,
    size,
    loading = false,
    danger = false,
    block = false,
    shape,
    ghost = false,
    disabled,
    iconPlacement,
    iconPosition,
    autoInsertSpace,
    autoFocus,
    href,
    target,
    rel,
    download,
    hreflang,
    referrerpolicy,
    onclick,
    onClick,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    _skipSemantic,
    _skipContentWrapper,
    ...attributes
  }: ButtonElementProps<
    Href
  > = $props();
  const config = useConfig();
  const compact = useCompact();
  const group = useButtonGroup();
  const form = useForm();
  let resolvedSize = $derived(size ?? compact?.size ?? group?.size ?? config.componentSize);
  let compactItemClasses = $derived(compactClasses('ant-btn', config.direction, compact));
  let appearance = $derived(buttonAppearance(type, danger, color, variant, ghost, config.button));
  let resolvedShape = $derived(shape || config.button?.shape || 'default');
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let delay = $derived(buttonLoading(loading).delay);
  let immediateLoading = $derived(buttonLoading(loading).loading);
  let delayedLoading = $state(untrack(() => buttonLoading(loading).loading));
  let innerLoading = $derived(delay > 0 ? delayedLoading : immediateLoading);
  let loadingIcon = $derived(
    typeof loading === 'object' && loading.icon ? loading.icon : config.button?.loadingIcon
  );
  let placement = $derived(iconPlacement ?? iconPosition ?? 'start');
  let insert = $derived(
    (autoInsertSpace
      ?? config.button?.autoInsertSpace
      ?? true)
    && !icon
    && appearance.variant !== 'link'
    && appearance.variant !== 'text'
  );
  let content = $state<HTMLSpanElement>();
  let twoCN = $state(false);
  let textRuntime = $state.raw<ReturnType<typeof connectButtonText>>();
  let info = $derived({
    props: {
      ...attributes,
      children,
      icon,
      type: type || 'default',
      color: appearance.color as ButtonColor,
      variant: appearance.variant,
      danger: appearance.color === 'danger',
      shape: resolvedShape,
      size: resolvedSize,
      disabled: blocked,
      loading: innerLoading,
      block,
      ghost,
      htmlType,
      href,
      target,
      rel,
      download,
      hreflang,
      referrerpolicy,
      iconPlacement: placement,
      iconPosition,
      autoInsertSpace,
      autoFocus,
      classNames,
      styles,
      class: className,
      rootClassName,
      style,
      onclick,
      onClick
    }
  });
  let contextClasses = $derived(
    _skipSemantic
      ? {}
      : typeof config.button?.classNames === 'function'
        ? config.button.classNames(info) ?? {}
        : config.button?.classNames ?? {}
  );
  let contextStyles = $derived(
    _skipSemantic
      ? {}
      : typeof config.button?.styles === 'function'
        ? config.button.styles(info) ?? {}
        : config.button?.styles ?? {}
  );
  let classes = $derived(
    typeof classNames === 'function' ? classNames(info) ?? {} : classNames ?? {}
  );
  let slots = $derived(typeof styles === 'function' ? styles(info) ?? {} : styles ?? {});
  let rootClasses = $derived(
    [
      'ant-btn',
      `ant-btn-${type || 'default'}`,
      `ant-btn-color-${appearance.color === 'danger' ? 'dangerous' : appearance.color}`,
      `ant-btn-variant-${appearance.variant}`,
      resolvedSize === 'large' && 'ant-btn-lg',
      resolvedSize === 'small' && 'ant-btn-sm',
      innerLoading && 'ant-btn-loading',
      danger && 'ant-btn-dangerous',
      block && 'ant-btn-block',
      resolvedShape !== 'default' && resolvedShape !== 'square' && `ant-btn-${resolvedShape}`,
      !children && children !== 0 && Boolean(innerLoading || icon) && 'ant-btn-icon-only',
      ghost
      && appearance.variant !== 'text'
      && appearance.variant !== 'link'
      && 'ant-btn-background-ghost',
      twoCN && insert && !innerLoading && 'ant-btn-two-chinese-chars',
      config.direction === 'rtl' && 'ant-btn-rtl',
      placement === 'end' && 'ant-btn-icon-end',
      href !== undefined && blocked && 'ant-btn-disabled',
      compactItemClasses,
      className,
      rootClassName,
      config.button?.class,
      contextClasses.root,
      classes.root
    ]
  );
  let rootStyle = $derived(
    [contextStyles.root, config.button?.style, slots.root, style].filter(Boolean).join(';')
  );

  $effect(() => {
    if (delay > 0) {
      const timeout = setTimeout(() => {
        delayedLoading = true;
      }, delay);
      return () => clearTimeout(timeout);
    }
    delayedLoading = immediateLoading;
  });
  $effect(() => {
    if (!content || typeof children !== 'function') {
      twoCN = false;
      return;
    }
    const runtime = connectButtonText(content, () => insert, value => {
      twoCN = value;
    });
    textRuntime = runtime;
    return () => {
      runtime.destroy();
      textRuntime = undefined;
    };
  });
  $effect(() => {
    if (!insert)
      twoCN = false;
    textRuntime?.refresh();
  });
  onMount(() => {
    if (autoFocus)
      nativeElement?.focus();
  });

  function click(event: MouseEvent) {
    if (blocked || innerLoading) {
      event.preventDefault();
      return;
    }
    (onclick
      ?? onClick)?.(event as Parameters<NonNullable<ButtonElementProps<Href>['onclick']>>[0]);
  }
</script>

{#snippet value(node: ButtonContent, spacing = false)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{typeof node === 'string' ? buttonText(node, spacing) : node ?? ''}{/if}
{/snippet}
<svelte:element this={href !== undefined ? 'a' : 'button'} {...attributes} bind:this={nativeElement}
  type={href === undefined ? htmlType : undefined} href={href !== undefined && !blocked ? href : undefined} {target} {rel} {download} {hreflang} {referrerpolicy}
  disabled={href === undefined ? innerLoading || blocked : undefined} aria-disabled={href !== undefined ? blocked : undefined} aria-busy={innerLoading || undefined}
  tabindex={href !== undefined ? blocked ? -1 : 0 : attributes.tabindex} class={rootClasses} style={rootStyle} onclick={click}>
  {#if innerLoading || icon}
    <span class={[
        'ant-btn-icon',
        innerLoading && !loadingIcon && 'ant-btn-loading-icon',
        contextClasses.icon,
        classes.icon
      ]} style={[contextStyles.icon, slots.icon].filter(Boolean).join(';')}>
      {#if innerLoading}{#if loadingIcon}{@render value(loadingIcon)}{:else}<Icon name="loading" />{/if}{:else}{@render value(icon)}{/if}
    </span>
  {/if}
  {#if _skipContentWrapper && typeof children === 'function'}{@render children()}{:else if buttonHasContent(children)}<span bind:this={content} class={[contextClasses.content, classes.content]} style={[contextStyles.content, slots.content].filter(Boolean).join(';')}>{@render value(children, insert)}</span>{/if}
</svelte:element>
