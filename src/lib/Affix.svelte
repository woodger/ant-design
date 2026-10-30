<script lang="ts">
  import { createAffixRuntime } from './affix.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { AffixPosition, AffixProps, AffixUpdatePosition } from './affix.types';
  let {
    children,
    offsetTop,
    offsetBottom,
    target,
    onChange,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: AffixProps = $props();
  let content = $state<HTMLDivElement>();
  let position = $state<AffixPosition>();
  let runtime = $state.raw<ReturnType<typeof createAffixRuntime>>();
  export const updatePosition: AffixUpdatePosition = Object.assign(
    () => runtime?.updatePosition(),
    { cancel: () => runtime?.cancel() }
  );
  $effect(() => {
    const host = nativeElement;
    const node = content;
    if (!host || !node) return;
    const controller = createAffixRuntime(host, node, next => {
      position = next;
    }, () => onChange);
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect(() => {
    const getTarget = target ?? (() => window);
    getTarget();
    runtime?.configure({ target: getTarget, offsetTop, offsetBottom });
  });
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
</script>

<div {...rest} bind:this={nativeElement} class={className} {style}>
  {#if position}<div aria-hidden="true" style={`width:${position.width}px;height:${position.height}px`}></div>{/if}
  <div bind:this={content} class={position ? ['ant-affix ant-affix-css-var', rootClassName] : undefined} style={position
      ? `position:fixed;${position
        .edge}:${position
          .offset}px;width:${position
            .width}px;height:${position
              .height}px`
      : undefined}>
    {@render children?.()}
  </div>
</div>
