<script lang="ts">
  import { untrack } from 'svelte';
  import Affix from './Affix.svelte';
  import AnchorItems from './AnchorItems.svelte';
  import { useConfig } from './config-context';
  import { setAnchor } from './anchor-context';
  import { createAnchorRuntime } from './anchor.dom';
  import { revealAnchorLink } from './anchor-scroll.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { AnchorProps } from './anchor.types';
  let {
    items,
    children,
    offsetTop,
    bounds,
    affix = true,
    showInkInFixed = false,
    getContainer,
    getCurrentAnchor,
    onClick,
    onChange,
    targetOffset,
    direction = 'vertical',
    replace,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: AnchorProps = $props();
  const config = useConfig();
  let activeLink = $state<string | null>(null);
  let ink = $state<HTMLSpanElement>();
  let runtime = $state.raw<ReturnType<typeof createAnchorRuntime>>();
  let registrations = $state.raw<readonly { href: string; targetOffset?: number; }[]>([]);
  const defaultContainer = () => window;
  let container = $derived(getContainer ?? defaultContainer);
  let info = $derived(
    {
      props: {
        ...rest,
        items,
        children,
        offsetTop,
        bounds,
        affix,
        showInkInFixed,
        getContainer,
        getCurrentAnchor,
        onClick,
        onChange,
        targetOffset,
        direction,
        replace,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
  setAnchor({
    get activeLink() {
      return activeLink;
    },
    get direction() {
      return direction;
    },
    get classNames() {
      return classes;
    },
    get styles() {
      return slots;
    },
    register(href, targetOffset) {
      const existing = registrations.find(link => link.href === href);
      registrations = existing
        ? registrations.map(
          link => link === existing && targetOffset !== undefined ? { href, targetOffset } : link
        )
        : [...registrations, { href, targetOffset }];
      return () => {
        registrations = registrations.filter(link => link.href !== href);
      };
    },
    click(event, href, title, offset) {
      onClick?.(event, { title, href });
      runtime?.scrollTo(href, offset);
    }
  });
  $effect(() => {
    if (!nativeElement) return;
    const controller = createAnchorRuntime(nativeElement, href => {
      activeLink = href;
    });
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect(() => {
    const options = {
      getContainer: container,
      links: registrations,
      offsetTop,
      bounds,
      targetOffset,
      getCurrentAnchor,
      onChange
    };
    const controller = runtime;
    container();
    untrack(() => controller?.configure(options));
  });
  $effect(() => {
    void [activeLink, direction, registrations, getCurrentAnchor];
    const root = nativeElement;
    const indicator = ink;
    if (!root || !indicator) return;
    const link = root.querySelector<HTMLElement>('.ant-anchor-link-title-active');
    if (!link) return;
    indicator.style.top = direction === 'horizontal'
      ? ''
      : `${link.offsetTop + link.clientHeight / 2}px`;
    indicator.style.height = direction === 'horizontal' ? '' : `${link.clientHeight}px`;
    indicator.style.left = direction === 'horizontal' ? `${link.offsetLeft}px` : '';
    indicator.style.width = direction === 'horizontal' ? `${link.clientWidth}px` : '';
    if (direction === 'horizontal')
      untrack(() => revealAnchorLink(link));
  });
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
</script>

{#snippet content()}
  <div {...rest} bind:this={nativeElement} dir={config.direction}
    class={[
        'ant-anchor-wrapper ant-anchor-css-var',
        direction === 'horizontal' && 'ant-anchor-wrapper-horizontal',
        config.direction === 'rtl' && 'ant-anchor-rtl',
        className,
        rootClassName,
        classes.root
      ]}
    style={[
        `max-height:${offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh'}`,
        slots.root,
        style
      ].filter(
        Boolean
      ).join(
        ';'
      )}>
    <div class={['ant-anchor', !affix && !showInkInFixed && 'ant-anchor-fixed']}>
      <span bind:this={ink} class={[
          'ant-anchor-ink',
          classes.indicator,
          activeLink && 'ant-anchor-ink-visible'
        ]} style={slots.indicator}></span>
      {#if items !== undefined}<AnchorItems {items} {replace} />{:else}{@render children?.()}{/if}
    </div>
  </div>
{/snippet}
{#if affix}<Affix offsetTop={offsetTop} target={container} {...typeof affix === 'object' ? affix : {}}>{@render content()}</Affix>{:else}{@render content()}{/if}
