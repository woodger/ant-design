<script lang="ts">
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';
  import Tooltip from './Tooltip.svelte';
  import FloatButtonIcon from './FloatButtonIcon.svelte';
  import { buttonHasContent, buttonText } from './button.engine';
  import { useConfig } from './config-context';
  import { useFloatButton } from './float-button-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { BadgeProps } from './badge.types';
  import type { TooltipProps } from './tooltip.types';
  import type { FloatButtonContent, FloatButtonProps } from './float-button.types';
  let { type = 'default', shape = 'circle', icon, content, description, tooltip, badge, classNames, styles, class: className = '', rootClassName = '', style, nativeElement = $bindable(), ...rest }: FloatButtonProps = $props();
  const config = useConfig();
  const group = useFloatButton();
  let actualShape = $derived(group?.shape || shape);
  let individual = $derived(group?.individual ?? true);
  let actualContent = $derived(content ?? description);
  let actualIcon = $derived(!buttonHasContent(actualContent) && !icon ? defaultIcon : icon);
  let info = $derived({ props: { ...rest, type, shape: actualShape, icon, content, description, tooltip, badge, classNames, styles, class: className, rootClassName, style } });
  let classes = $derived(typeof classNames === 'function' ? classNames(info) ?? {} : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) ?? {} : styles ?? {});
  let combinedClasses = $derived({ root: [group?.classNames.root, classes.root].filter(Boolean).join(' '), icon: ['ant-float-btn-icon', group?.classNames.icon, classes.icon].filter(Boolean).join(' '), content: ['ant-float-btn-content', group?.classNames.content, classes.content].filter(Boolean).join(' ') });
  let combinedStyles = $derived({ root: [group?.styles.root, slots.root].filter(Boolean).join(';'), icon: [group?.styles.icon, slots.icon].filter(Boolean).join(';'), content: [group?.styles.content, slots.content].filter(Boolean).join(';') });
  let cleanBadge = $derived.by(() => {
    const source: Partial<BadgeProps> = badge ?? {};
    const { status: _status, text: _text, title: _title, children: _children, ...remaining } = source;
    return remaining;
  });
  let tooltipProps = $derived<Omit<TooltipProps, 'children'> | undefined>(tooltip === undefined || tooltip === null || tooltip === false || tooltip === '' ? undefined : typeof tooltip === 'object' ? tooltip : { title: tooltip === true ? emptyTooltip : tooltip });
  let insert = $derived(!actualIcon && config.button?.autoInsertSpace !== false && badge === undefined);
  $effect(() => { if (nativeElement) return connectFeedbackFocus(nativeElement); });
</script>

{#snippet defaultIcon()}<FloatButtonIcon name="file-text" />{/snippet}
{#snippet emptyTooltip()}{/snippet}
{#snippet contentNode()}
  {#if typeof actualContent === 'number'}{actualContent}
  {:else if typeof actualContent === 'function' || typeof actualContent === 'string' && actualContent !== ''}
    <span class={combinedClasses.content} style={combinedStyles.content}>{#if typeof actualContent === 'function'}{@render actualContent()}{:else}{buttonText(actualContent, insert)}{/if}</span>
  {/if}
  {#if badge !== undefined}<Badge {...cleanBadge} class={['ant-float-btn-badge', cleanBadge.dot && 'ant-float-btn-badge-dot', cleanBadge.class, combinedClasses.content].filter(Boolean).join(' ')} style={[cleanBadge.style, combinedStyles.content].filter(Boolean).join(';')} />{/if}
{/snippet}
{#snippet node()}
  <Button {...rest} {type} shape={actualShape} size="large" icon={actualIcon} children={contentNode} _skipSemantic _skipContentWrapper
    class={['ant-float-btn ant-float-btn-css-var', `ant-float-btn-${type}`, `ant-float-btn-${actualShape}`, config.direction === 'rtl' && 'ant-float-btn-rtl', individual && 'ant-float-btn-individual', !buttonHasContent(actualContent) && 'ant-float-btn-icon-only', className, rootClassName].filter(Boolean).join(' ')}
    classNames={combinedClasses} styles={combinedStyles} {style} bind:nativeElement />
{/snippet}
{#if tooltipProps}<Tooltip {...tooltipProps} style={[group && 'display:contents', tooltipProps.style].filter(Boolean).join(';')}>{@render node()}</Tooltip>{:else}{@render node()}{/if}
