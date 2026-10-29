<script lang="ts">
  import { untrack } from 'svelte';
  import FloatButton from './FloatButton.svelte';
  import FloatButtonIcon from './FloatButtonIcon.svelte';
  import FloatButtonSlot from './FloatButtonSlot.svelte';
  import Flex from './Flex.svelte';
  import SpaceCompact from './SpaceCompact.svelte';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import { floatButtonPlacement } from './float-button.engine';
  import { createFloatButtonMotion } from './float-button-motion.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { FloatButtonContext } from './float-button-context';
  import type { FloatButtonGroupProps } from './float-button.types';
  let { children, items, shape = 'circle', type = 'default', placement, icon, closeIcon, trigger, open, onOpenChange, disabled,
    classNames, styles, class: className = '', rootClassName = '', style, onclick, onClick, nativeElement = $bindable(), ...floatProps }: FloatButtonGroupProps = $props();
  const config = useConfig();
  const form = useForm();
  let internalOpen = $state(false);
  let opened = $derived(open ?? internalOpen);
  let menu = $derived(trigger === 'click' || trigger === 'hover');
  let present = $state(untrack(() => !trigger || Boolean(open)));
  let flexList = $state<HTMLElement>();
  let compactList = $state<HTMLDivElement>();
  let motionState: boolean | undefined;
  let motion = $state.raw<ReturnType<typeof createFloatButtonMotion>>();
  let individual = $derived(shape === 'circle');
  let list = $derived(individual ? flexList : compactList);
  let actualPlacement = $derived(floatButtonPlacement(placement));
  let vertical = $derived(actualPlacement === 'top' || actualPlacement === 'bottom');
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let info = $derived({ props: { ...floatProps, children, items, shape, type, placement: actualPlacement, icon, closeIcon, trigger, open, onOpenChange, disabled: blocked, classNames, styles, class: className, rootClassName, style, onclick, onClick } });
  let contextClasses = $derived(typeof config.floatButtonGroup?.classNames === 'function' ? config.floatButtonGroup.classNames(info) ?? {} : config.floatButtonGroup?.classNames ?? {});
  let contextStyles = $derived(typeof config.floatButtonGroup?.styles === 'function' ? config.floatButtonGroup.styles(info) ?? {} : config.floatButtonGroup?.styles ?? {});
  let classes = $derived(typeof classNames === 'function' ? classNames(info) ?? {} : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) ?? {} : styles ?? {});
  let listContext = $derived<FloatButtonContext>({ shape, individual, classNames: { root: [contextClasses.item, classes.item].filter(Boolean).join(' '), icon: [contextClasses.itemIcon, classes.itemIcon].filter(Boolean).join(' '), content: [contextClasses.itemContent, classes.itemContent].filter(Boolean).join(' ') }, styles: { root: [contextStyles.item, slots.item].filter(Boolean).join(';'), icon: [contextStyles.itemIcon, slots.itemIcon].filter(Boolean).join(';'), content: [contextStyles.itemContent, slots.itemContent].filter(Boolean).join(';') } });
  let triggerContext = $derived<FloatButtonContext>({ shape, individual: true, classNames: { root: [contextClasses.trigger, classes.trigger].filter(Boolean).join(' '), icon: [contextClasses.triggerIcon, classes.triggerIcon].filter(Boolean).join(' '), content: [contextClasses.triggerContent, classes.triggerContent].filter(Boolean).join(' ') }, styles: { root: [contextStyles.trigger, slots.trigger].filter(Boolean).join(';'), icon: [contextStyles.triggerIcon, slots.triggerIcon].filter(Boolean).join(';'), content: [contextStyles.triggerContent, slots.triggerContent].filter(Boolean).join(';') } });
  function request(next: boolean) { if (blocked || opened === next) return; if (open === undefined) internalOpen = next; onOpenChange?.(next); }
  $effect(() => { if (!menu || opened) present = true; else if (!list) present = false; });
  $effect(() => {
    if (!list || !menu) return;
    const controller = createFloatButtonMotion(list, true, () => { present = false; }, motionState);
    motion = controller;
    return () => { controller.destroy(); motion = undefined; };
  });
  $effect(() => { if (menu && motion) { motion.sync(opened); motionState = opened; } else if (!menu) motionState = undefined; });
  $effect(() => {
    const root = nativeElement;
    if (!root || trigger !== 'click') return;
    const outside = (event: MouseEvent) => { if (!(event.target instanceof Node) || !root.contains(event.target)) request(false); };
    root.ownerDocument.addEventListener('click', outside, true);
    return () => root.ownerDocument.removeEventListener('click', outside, true);
  });
  $effect(() => { if (nativeElement) return connectFeedbackFocus(nativeElement); });
  $effect(() => { if (list) return connectFeedbackFocus(list); });
</script>
<style>
  /* Opaque children is one Compact slot; infer its visible edges from native siblings on SSR. */
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque].ant-space-compact-vertical > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):not(:first-child)),
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque].ant-space-compact-vertical > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):not(:first-child) > .ant-float-btn) { margin-block-start:calc(0px - var(--ant-line-width));border-start-start-radius:0;border-start-end-radius:0; }
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque].ant-space-compact-vertical > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):has(~ :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)))),
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque].ant-space-compact-vertical > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):has(~ :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn))) > .ant-float-btn) { border-end-start-radius:0;border-end-end-radius:0; }
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque]:not(.ant-space-compact-vertical) > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):not(:first-child)),
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque]:not(.ant-space-compact-vertical) > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):not(:first-child) > .ant-float-btn) { margin-inline-start:calc(0px - var(--ant-line-width));border-start-start-radius:0;border-end-start-radius:0; }
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque]:not(.ant-space-compact-vertical) > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):has(~ :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)))),
  .ant-float-btn-group > :global(.ant-space-compact[data-ant-float-opaque]:not(.ant-space-compact-vertical) > :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn)):has(~ :is(.ant-float-btn,.ant-tooltip-trigger:has(> .ant-float-btn))) > .ant-float-btn) { border-start-end-radius:0;border-end-end-radius:0; }
</style>

{#snippet defaultIcon()}<FloatButtonIcon name="file-text" />{/snippet}
{#snippet defaultCloseIcon()}<FloatButtonIcon name="close" />{/snippet}
{#snippet content()}{#if items}{#each items as item (item.key)}{@render item.children()}{/each}{:else}{@render children?.()}{/if}{/snippet}
<div bind:this={nativeElement} role="group" dir={config.direction}
  class={['ant-float-btn-group ant-float-btn-css-var', individual && 'ant-float-btn-group-individual', menu && `ant-float-btn-group-${actualPlacement}`, menu && 'ant-float-btn-group-menu-mode', config.direction === 'rtl' && 'ant-float-btn-group-rtl', config.floatButtonGroup?.class, contextClasses.root, classes.root, className, rootClassName]}
  style={[contextStyles.root, config.floatButtonGroup?.style, slots.root, style].filter(Boolean).join(';')}
  onmouseenter={() => { if (trigger === 'hover') request(true); }} onmouseleave={() => { if (trigger === 'hover') request(false); }}>
  <FloatButtonSlot context={listContext}>
    {#if !menu || present}
      {#if individual}<Flex bind:nativeElement={flexList} {vertical} class={['ant-float-btn-group-list', contextClasses.list, classes.list].filter(Boolean).join(' ')} style={[contextStyles.list, slots.list].filter(Boolean).join(';')}>{@render content()}</Flex>
      {:else}<SpaceCompact bind:nativeElement={compactList} data-ant-float-opaque={items === undefined || undefined} {vertical} items={items} class={['ant-float-btn-group-list', contextClasses.list, classes.list].filter(Boolean).join(' ')} style={[contextStyles.list, slots.list].filter(Boolean).join(';')}>{@render children?.()}</SpaceCompact>{/if}
    {/if}
  </FloatButtonSlot>
  {#if menu}
    <FloatButtonSlot context={triggerContext}>
      <FloatButton {...floatProps} {type} icon={opened ? closeIcon ?? config.floatButtonGroup?.closeIcon ?? defaultCloseIcon : icon === undefined ? defaultIcon : icon} disabled={blocked}
        class="ant-float-btn-group-trigger" aria-expanded={opened} onclick={event => { if (trigger === 'click') request(!opened); (onclick ?? onClick)?.(event); }} />
    </FloatButtonSlot>
  {/if}
</div>
