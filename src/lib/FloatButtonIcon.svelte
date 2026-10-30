<script lang="ts">
  import { floatButtonIcons } from './float-button-icons';
  let { name }: { name: keyof typeof floatButtonIcons; } = $props();
  let icon = $derived(floatButtonIcons[name]);
</script>
<style>
  .anticon { display: inline-flex; align-items: center; color: inherit; font-style: normal; line-height: 0; text-align: center; text-transform: none; vertical-align: -0.125em; }
  svg { display: inline-block; width: 1em; height: 1em; fill: currentColor; }
</style>
<span role="img" aria-label={name} class={['anticon', `anticon-${name}`]}><svg viewBox={icon.viewBox} focusable="false" aria-hidden="true">{#each icon.paths as path}<path d={path} />{/each}</svg></span>
