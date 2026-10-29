<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Steps, ConfigProvider } from '../../src/lib/components/ant-design';
  import type { StepsDataItem, StepsType, StepsIconRender, StepsProgressDotRender } from '../../src/lib/components/ant-design';
  let type = $state<StepsType>('default');
  let variant = $state<'filled' | 'outlined'>('filled');
  let initial = $state(10);
  let current = $state(14);
  let count = $state(10);
  let maxCount = $state(3);
  let collapsed = $state(true);
  let percentage = $state(false);
  let vertical = $state(false);
  let custom = $state(false);
  let legacy = $state(false);
  let mappedIcon = $state(false);
  let titleVertical = $state(false);
  let semantics = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let changes = $state<number[]>([]);
  let clicks = $state(0);
  let source = $derived<StepsDataItem[]>(Array.from({ length: count }, (_, index) => ({ key: `item-${index}`, title: `Stage ${index + 1}`, content: index === 4 ? richContent : `Stage description ${index + 1}`, onClick: () => { clicks++; }, styles: semantics ? { root: 'color:green', title: 'font-weight:700' } : undefined })));
</script>

{#snippet richContent()}<strong>Rich inline stage</strong>{/snippet}
{#snippet renderedIcon(original: Snippet, info: Parameters<StepsIconRender>[1])}
  {#if mappedIcon}<info.components.Icon data-testid="custom-step-icon">{info.index + 1}</info.components.Icon>{:else}{@render original()}{/if}
  <span class="custom-icon-index" aria-hidden="true">{info.index}</span>
{/snippet}
{#snippet legacyDot(original: Snippet, info: Parameters<StepsProgressDotRender>[1])}<span data-testid="legacy-dot" data-index={info.index}>{@render original()}</span>{/snippet}
<section id="steps-variants-fixture" aria-label="Steps variants fixture">
  <label>Steps type <select aria-label="Steps type" bind:value={type}><option>default</option><option>dot</option><option>inline</option><option>navigation</option><option>panel</option></select></label>
  <label>Steps variant <select aria-label="Steps variant" bind:value={variant}><option>filled</option><option>outlined</option></select></label>
  <label><input type="checkbox" bind:checked={collapsed} /> Collapse Steps ranges</label>
  <label><input type="checkbox" bind:checked={percentage} /> Steps percentage</label>
  <label><input type="checkbox" bind:checked={vertical} /> Vertical Steps variants</label>
  <label><input type="checkbox" bind:checked={titleVertical} /> Vertical Steps titles</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Steps icons</label>
  <label><input type="checkbox" bind:checked={mappedIcon} /> Replace Steps icon node</label>
  <label><input type="checkbox" bind:checked={legacy} /> Legacy Steps dots</label>
  <label><input type="checkbox" bind:checked={semantics} /> Semantic Steps variants</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Steps variants</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Steps variants</label>
  <label>Steps initial index <input type="number" bind:value={initial} /></label>
  <label>Steps current index <input type="number" bind:value={current} /></label>
  <label>Steps item count <input type="number" bind:value={count} /></label>
  <label>Steps max count <input type="number" bind:value={maxCount} /></label>
  <output aria-label="Steps variant changes">{JSON.stringify(changes)}</output><output aria-label="Steps item clicks">{clicks}</output>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <Steps id="fixture-steps-variants" aria-label="Expanded stages" items={source} {type} {variant} {initial} {current} maxCount={collapsed ? maxCount : undefined}
      percent={percentage ? 60 : undefined} orientation={vertical ? 'vertical' : 'horizontal'} titlePlacement={titleVertical ? 'vertical' : 'horizontal'}
      progressDot={legacy ? legacyDot : undefined} iconRender={custom ? renderedIcon : undefined}
      classNames={semantics ? { root: 'semantic-steps-root', itemTitle: 'semantic-steps-title' } : undefined}
      styles={semantics ? { root: 'color:red', item: 'color:red' } : undefined} style={semantics ? 'color:black' : undefined}
      onChange={index => { changes = [...changes, index]; current = index; }} />
  </ConfigProvider>
</section>
